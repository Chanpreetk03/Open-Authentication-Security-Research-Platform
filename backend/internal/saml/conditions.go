package saml

import (
	"fmt"
	"time"
)

const (
	ScenarioConditionsEnforced = "conditions-enforced"
	ScenarioConditionsIgnored  = "conditions-ignored"
)

// IsWithinConditionWindow applies an inclusive NotBefore and exclusive
// NotOnOrAfter boundary, allowing the caller's explicit clock-skew policy.
func IsWithinConditionWindow(notBefore, notOnOrAfter, now time.Time, allowedSkew time.Duration) bool {
	if allowedSkew < 0 || !notBefore.Before(notOnOrAfter) {
		return false
	}
	if now.Add(allowedSkew).Before(notBefore) {
		return false
	}
	return now.Add(-allowedSkew).Before(notOnOrAfter)
}

func ConditionsScenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioConditionsEnforced, Name: "Enforce assertion time window", Description: "The ACS rejects an assertion whose NotOnOrAfter has passed beyond its configured clock-skew allowance.", Secure: true},
		{ID: ScenarioConditionsIgnored, Name: "Ignore assertion time window", Description: "The ACS accepts an expired assertion despite the time-condition check failing.", Secure: false},
	}
}

func NewConditionsFlow(scenarioID string, now time.Time) (Flow, error) {
	var scenario Scenario
	for _, candidate := range ConditionsScenarios() {
		if candidate.ID == scenarioID {
			scenario = candidate
			break
		}
	}
	if scenario.ID == "" {
		return Flow{}, fmt.Errorf("%w: %s", ErrUnsupportedScenario, scenarioID)
	}

	base := now.UTC()
	allowedSkew := 30 * time.Second
	notBefore := base.Add(-2 * time.Minute)
	notOnOrAfter := base.Add(-4 * time.Minute)
	withinWindow := IsWithinConditionWindow(notBefore, notOnOrAfter, base, allowedSkew)
	flow := Flow{
		ID: fmt.Sprintf("saml_conditions_%d", base.UnixNano()), Protocol: "SAML 2.0", Scenario: scenario,
		Events: []Event{}, Findings: []Finding{},
	}
	flow.Events = []Event{
		event(1, "service_provider", "clock_skew_policy_loaded", "INTERNAL", "ACS configuration", []string{"allowed_skew=30s"}, []string{"explicit local policy"}, "ACS has a bounded 30-second skew allowance", "The relying party loads its clock policy", "The ACS has a small configured tolerance for provider clock differences.", "Clock skew is a local interoperability policy. It should be bounded and applied consistently, not used to make arbitrarily old assertions acceptable.", base),
		event(2, "identity_provider", "assertion_issued", "POST", "/saml/acs", []string{"SAMLResponse=********", "NotBefore=" + notBefore.Format(time.RFC3339), "NotOnOrAfter=" + notOnOrAfter.Format(time.RFC3339)}, []string{"synthetic assertion", "signature validity assumed"}, "assertion validity interval ended four minutes ago", "The response carries an expired assertion", "NotBefore is in the past, but the exclusive NotOnOrAfter endpoint is also in the past beyond the ACS's allowed skew.", "An otherwise authentic assertion must not be accepted after its validity interval; a signature does not make stale data current.", base.Add(time.Second)),
		event(3, "browser", "response_delivered", "POST", "/saml/acs", []string{"SAMLResponse=********"}, []string{"HTTP-POST binding"}, "expired response delivered to ACS", "The browser posts the response", "The browser delivers the expired synthetic response to the ACS.", "The ACS must evaluate assertion conditions itself; browser delivery does not extend the validity window.", base.Add(2*time.Second)),
		event(4, "service_provider", "baseline_assertion_checks", "INTERNAL", "ACS validation", []string{"issuer=trusted-demo-idp", "signature=assumed-valid", "audience=demo-sp", "recipient=expected-acs"}, []string{"other checks assumed successful"}, "issuer, signature, audience, and recipient checks pass", "Other checks are held constant", "The exercise assumes all non-time checks succeed.", "This slice isolates the Conditions time window. A real ACS must validate every applicable condition and subject confirmation as well.", base.Add(3*time.Second)),
		event(5, "service_provider", "conditions_evaluated", "INTERNAL", "ACS time policy", []string{"now=" + base.Format(time.RFC3339), "NotBefore=" + notBefore.Format(time.RFC3339), "NotOnOrAfter=" + notOnOrAfter.Format(time.RFC3339), "allowed_skew=30s"}, []string{"NotBefore inclusive", "NotOnOrAfter exclusive", "bounded skew"}, "within condition window = "+fmt.Sprint(withinWindow), "The ACS evaluates assertion time conditions", "The ACS applies its configured clock skew to the inclusive start and exclusive end of the assertion validity interval.", "Clock tolerance should address small clock differences without erasing the assertion's expiry boundary.", base.Add(4*time.Second)),
	}
	if scenarioID == ScenarioConditionsEnforced {
		flow.Status = "expired_rejected"
		flow.Events = append(flow.Events,
			event(6, "service_provider", "response_rejected", "INTERNAL", "ACS policy", []string{"within_window=false", "sessions_created=0"}, []string{"expired assertion rejected", "no session created"}, "assertion rejected after skew allowance", "The ACS rejects stale conditions", "The assertion expired four minutes ago, outside the 30-second tolerance, so no session is established.", "Keep assertion lifetime and allowed skew limited. Do not silently accept expired assertions or rely on the IdP's clock decision alone.", base.Add(5*time.Second)),
			event(7, "service_provider", "resource_access_denied", "GET", "/app/profile", []string{"sessions_created=0"}, []string{"no authenticated session"}, "no application session is created", "The expired assertion grants no access", "The ACS fails closed because the assertion is outside its validity interval.", "Time checks complement signature, issuer, audience, recipient, correlation, and replay validation.", base.Add(6*time.Second)),
		)
		flow.LearningOutcome = "The assertion's NotOnOrAfter boundary had passed beyond the configured skew, so the ACS rejected it."
		return flow, nil
	}

	flow.Status = "expired_accepted"
	flow.Findings = []Finding{{Severity: "high", Title: "Expired SAML assertion accepted", Description: "The ACS ignored a failed time-window evaluation and accepted an assertion whose NotOnOrAfter had passed beyond its allowed skew.", Mitigation: "Require a bounded assertion validity interval, reject at or after NotOnOrAfter subject only to a small explicit clock-skew allowance, and monitor clock synchronization."}}
	flow.Events = append(flow.Events,
		event(6, "service_provider", "response_accepted", "INTERNAL", "ACS policy", []string{"within_window=false", "time_check=ignored", "session=synthetic"}, []string{"time-condition bypass"}, "expired assertion accepted", "The ACS bypasses the time check", "The service provider establishes a synthetic session despite the expired assertion.", "The response may be correctly signed and still be stale. Cryptographic authenticity does not override its validity interval.", base.Add(5*time.Second)),
		event(7, "service_provider", "resource_access_granted", "GET", "/app/profile", []string{"assertion_expired=true", "identity=synthetic"}, []string{"synthetic identity only", "expired assertion"}, "stale assertion reaches the application", "The expired assertion reaches the app", "The trace models an ACS granting access from an assertion that is no longer time-valid.", "This is a controlled simulation only; it does not authenticate an identity or create a real session.", base.Add(6*time.Second)),
	)
	flow.LearningOutcome = "Ignoring the assertion validity window makes stale signed data acceptable beyond the relying party's configured clock tolerance."
	return flow, nil
}
