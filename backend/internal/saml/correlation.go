package saml

import (
	"fmt"
	"time"
)

const (
	ScenarioCorrelationRequired = "correlation-required"
	ScenarioCorrelationIgnored  = "correlation-ignored"
)

func CorrelationScenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioCorrelationRequired, Name: "Require request correlation", Description: "The ACS compares Response InResponseTo with the request pending in this browser transaction and rejects a mismatch.", Secure: true},
		{ID: ScenarioCorrelationIgnored, Name: "Ignore request correlation", Description: "The ACS accepts a response for a different request and signs the browser into the attacker's synthetic account.", Secure: false},
	}
}

func NewCorrelationFlow(scenarioID string, now time.Time) (Flow, error) {
	var scenario Scenario
	for _, candidate := range CorrelationScenarios() {
		if candidate.ID == scenarioID {
			scenario = candidate
			break
		}
	}
	if scenario.ID == "" {
		return Flow{}, fmt.Errorf("%w: %s", ErrUnsupportedScenario, scenarioID)
	}
	base := now.UTC()
	flow := Flow{
		ID: fmt.Sprintf("saml_correlation_%d", base.UnixNano()), Protocol: "SAML 2.0",
		Scenario: scenario, Events: []Event{}, Findings: []Finding{},
	}
	flow.Events = []Event{
		event(1, "victim_browser", "sp_request_pending", "INTERNAL", "browser transaction", []string{"expected_request_id=_request-victim", "session=synthetic-victim"}, []string{"request ID bound to initiating browser"}, "SP request remains pending for this browser", "The service provider tracks the browser's SSO request", "The victim's browser has an outstanding request with ID _request-victim.", "The ACS must compare the response correlation value against server-side transaction state for this browser, not a value supplied by the response itself.", base),
		event(2, "attacker", "response_prepared", "POST", "/saml/acs", []string{"SAMLResponse=********", "Response.InResponseTo=_request-attacker", "Subject=_user-attacker"}, []string{"synthetic response", "signature validity assumed"}, "attacker obtains a response for a different request", "A response is created for another transaction", "The synthetic response was issued for _request-attacker and identifies the attacker's demo account.", "A valid response for one transaction does not prove that it belongs to the browser receiving it.", base.Add(time.Second)),
		event(3, "attacker", "response_relayed", "POST", "/saml/acs", []string{"SAMLResponse=********", "RelayState=********"}, []string{"cross-site response delivery", "no real credentials"}, "response is posted in the victim browser", "The mismatched response reaches the ACS", "The attacker causes the victim's browser to deliver the response to the service provider.", "This models login CSRF/account substitution: the browser can end up signed into an account selected by the attacker.", base.Add(2*time.Second)),
		event(4, "service_provider", "assertion_checks_pass", "INTERNAL", "ACS validation", []string{"issuer=trusted-demo-idp", "signature=assumed-valid", "audience=demo-sp", "recipient=/saml/acs", "conditions=valid"}, []string{"baseline checks assumed successful"}, "modeled checks pass", "Other assertion checks are held constant", "The simulation assumes trusted issuer, valid signature, audience, recipient, and time conditions.", "This isolates request correlation. A real ACS must perform all these validations in addition to correlation.", base.Add(3*time.Second)),
		event(5, "service_provider", "response_correlation_checked", "INTERNAL", "pending request lookup", []string{"expected=_request-victim", "received=_request-attacker"}, []string{"Response InResponseTo", "browser transaction binding"}, "response references a different request", "The ACS checks Response InResponseTo", "The ACS compares the pending request ID with the response's InResponseTo value.", "The check must use the transaction stored for the initiating browser session. An attacker cannot make their request ID match by copying it into RelayState.", base.Add(4*time.Second)),
	}
	if scenarioID == ScenarioCorrelationRequired {
		flow.Status = "mismatch_rejected"
		flow.Events = append(flow.Events,
			event(6, "service_provider", "response_rejected", "INTERNAL", "ACS policy", []string{"expected=_request-victim", "received=_request-attacker", "pending_request=preserved"}, []string{"InResponseTo mismatch rejected", "no session created"}, "response rejected; legitimate request remains pending", "The ACS blocks account substitution", "The response is not accepted, and the victim's separate pending SP transaction is preserved for its valid response.", "Do not consume a pending transaction on an unrelated mismatch. Consume it atomically only when the correlated response is accepted, and expire it promptly.", base.Add(5*time.Second)),
			event(7, "service_provider", "resource_access_denied", "GET", "/app/profile", []string{"sessions_created=0"}, []string{"no authenticated session"}, "no account is established from this response", "The browser remains unsigned-in", "The mismatched response did not create an application session.", "If unsolicited IdP-initiated SSO is supported, it needs a separate explicit policy; do not silently treat absent correlation as a valid match.", base.Add(6*time.Second)),
		)
		flow.LearningOutcome = "The ACS rejected a valid-but-unrelated response by comparing Response InResponseTo to the browser's pending SP request."
		return flow, nil
	}

	flow.Status = "mismatch_accepted"
	flow.Findings = []Finding{{Severity: "high", Title: "SAML login CSRF / account substitution", Description: "The ACS ignored a mismatched Response InResponseTo and created a browser session for the attacker's synthetic account.", Mitigation: "Bind each SP-initiated request ID to the initiating browser transaction. Require an exact response correlation match and consume the pending transaction atomically on successful acceptance. Handle explicitly permitted unsolicited responses under a separate policy."}}
	flow.Events = append(flow.Events,
		event(6, "service_provider", "response_accepted", "INTERNAL", "ACS policy", []string{"expected=_request-victim", "received=_request-attacker", "correlation=ignored"}, []string{"request correlation disabled"}, "response accepted for the wrong browser transaction", "The ACS ignores the mismatch", "Without a correlation check, the ACS accepts the attacker's response in the victim's browser.", "The result is account substitution: the victim's browser receives an authenticated session for the attacker-controlled identity.", base.Add(5*time.Second)),
		event(7, "service_provider", "resource_access_granted", "GET", "/app/profile", []string{"session_subject=_user-attacker", "browser=victim"}, []string{"synthetic identity only", "wrong account bound to browser"}, "victim browser is signed into the attacker's account", "The wrong identity reaches the app", "The synthetic resource returns the attacker account in the victim's browser session.", "The lab models impact only. It neither authenticates a real user nor creates a real session.", base.Add(6*time.Second)),
	)
	flow.LearningOutcome = "Ignoring InResponseTo lets a valid response for the attacker's request establish the attacker's identity in the victim's browser."
	return flow, nil
}
