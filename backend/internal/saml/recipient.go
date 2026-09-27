package saml

import (
	"fmt"
	"time"
)

const (
	ScenarioRecipientEnforced = "recipient-enforced"
	ScenarioRecipientIgnored  = "recipient-ignored"
)

// MatchesBearerRecipient requires an exact non-empty match to the ACS URL.
func MatchesBearerRecipient(recipient, assertionConsumerServiceURL string) bool {
	return recipient != "" && assertionConsumerServiceURL != "" && recipient == assertionConsumerServiceURL
}

func RecipientScenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioRecipientEnforced, Name: "Require exact ACS recipient", Description: "The ACS rejects a bearer SubjectConfirmationData whose Recipient is not its configured ACS URL.", Secure: true},
		{ID: ScenarioRecipientIgnored, Name: "Ignore ACS recipient", Description: "The ACS accepts a bearer confirmation intended for a different endpoint.", Secure: false},
	}
}

func NewRecipientFlow(scenarioID string, now time.Time) (Flow, error) {
	var scenario Scenario
	for _, candidate := range RecipientScenarios() {
		if candidate.ID == scenarioID {
			scenario = candidate
			break
		}
	}
	if scenario.ID == "" {
		return Flow{}, fmt.Errorf("%w: %s", ErrUnsupportedScenario, scenarioID)
	}
	base := now.UTC()
	expected := "https://sp.example.test/saml/acs"
	received := "https://sp.example.test/saml/alternate-acs"
	matched := MatchesBearerRecipient(received, expected)
	flow := Flow{
		ID: fmt.Sprintf("saml_recipient_%d", base.UnixNano()), Protocol: "SAML 2.0", Scenario: scenario,
		Events: []Event{}, Findings: []Finding{},
	}
	flow.Events = []Event{
		event(1, "service_provider", "acs_endpoint_configured", "INTERNAL", "service provider", []string{"expected_recipient=" + expected}, []string{"configured assertion consumer service"}, "SP accepts bearer confirmations for its registered ACS URL", "The ACS endpoint is configured", "The service provider's ACS URL is distinct from its application pages and other ACS endpoints.", "The ACS must compare the assertion's bearer SubjectConfirmationData Recipient against the endpoint configured for this SAML connection.", base),
		event(2, "identity_provider", "assertion_issued", "POST", "/saml/acs", []string{"SAMLResponse=********", "SubjectConfirmationData.Recipient=" + received, "NotOnOrAfter=valid"}, []string{"synthetic assertion", "signature validity assumed"}, "bearer confirmation names a different endpoint", "The assertion targets another recipient", "The synthetic assertion is delivered to this ACS but its bearer confirmation names an alternate ACS URL.", "The HTTP request reaching an ACS does not prove that the assertion authorized delivery to that endpoint.", base.Add(time.Second)),
		event(3, "browser", "response_delivered", "POST", "/saml/acs", []string{"SAMLResponse=********"}, []string{"HTTP-POST binding"}, "response delivered to configured ACS", "The browser posts the response", "The browser delivers the synthetic response to the configured ACS endpoint.", "The ACS still has to validate the recipient inside the bearer confirmation; transport routing alone is not sufficient.", base.Add(2*time.Second)),
		event(4, "service_provider", "baseline_assertion_checks", "INTERNAL", "ACS validation", []string{"issuer=trusted-demo-idp", "signature=assumed-valid", "audience=demo-sp", "conditions=valid"}, []string{"other checks assumed successful"}, "issuer, signature, audience, and time checks pass", "Other assertion checks are held constant", "The simulation assumes issuer trust, valid signature, matching audience, and valid time conditions.", "Recipient is an independent bearer-confirmation check and must be enforced even when these other checks pass.", base.Add(3*time.Second)),
		event(5, "service_provider", "recipient_evaluated", "INTERNAL", "ACS recipient policy", []string{"expected=" + expected, "received=" + received}, []string{"exact Recipient comparison"}, "recipient match = "+fmt.Sprint(matched), "The ACS compares the bearer recipient", "The configured ACS URL is compared with SubjectConfirmationData Recipient.", "An exact match binds the bearer confirmation to the endpoint that is consuming it.", base.Add(4*time.Second)),
	}
	if scenarioID == ScenarioRecipientEnforced {
		flow.Status = "recipient_rejected"
		flow.Events = append(flow.Events,
			event(6, "service_provider", "response_rejected", "INTERNAL", "ACS policy", []string{"recipient_match=false", "sessions_created=0"}, []string{"recipient mismatch rejected", "no session created"}, "assertion rejected for the alternate recipient", "The ACS rejects the confirmation", "The bearer confirmation does not authorize use at the configured ACS, so no session is established.", "Validate each candidate bearer SubjectConfirmation against the current ACS. If multiple confirmations exist, accept only if one complete confirmation satisfies all its required checks.", base.Add(5*time.Second)),
			event(7, "service_provider", "resource_access_denied", "GET", "/app/profile", []string{"sessions_created=0"}, []string{"no authenticated session"}, "no application session is created", "No identity is established", "The recipient mismatch prevents this assertion from creating a session.", "Recipient validation complements audience, issuer, signature, time, and request-correlation checks.", base.Add(6*time.Second)),
		)
		flow.LearningOutcome = "Even with the expected audience and other modeled checks passing, the bearer confirmation was rejected because its Recipient did not exactly match this ACS URL."
		return flow, nil
	}

	flow.Status = "recipient_accepted"
	flow.Findings = []Finding{{Severity: "high", Title: "Bearer assertion accepted at the wrong recipient", Description: "The ACS ignored a SubjectConfirmationData Recipient mismatch and accepted a bearer assertion naming a different endpoint.", Mitigation: "Require an exact match between the bearer confirmation Recipient and the configured ACS URL. Validate the full candidate confirmation before accepting it."}}
	flow.Events = append(flow.Events,
		event(6, "service_provider", "response_accepted", "INTERNAL", "ACS policy", []string{"recipient_match=false", "recipient_check=ignored", "session=synthetic"}, []string{"recipient check bypassed"}, "assertion accepted despite recipient mismatch", "The ACS bypasses recipient validation", "The service provider ignores the mismatch and establishes a synthetic session.", "A signed assertion can still be inappropriate for a different endpoint. Signature validity does not bind the bearer confirmation to the receiving ACS.", base.Add(5*time.Second)),
		event(7, "service_provider", "resource_access_granted", "GET", "/app/profile", []string{"confirmation_recipient=alternate-acs", "acs=configured-acs"}, []string{"synthetic identity only", "wrong confirmation recipient"}, "assertion reaches the application", "The wrong recipient reaches the app", "The trace shows an assertion being accepted even though its bearer confirmation named a different ACS.", "This is a controlled trace only; it does not authenticate anyone or create a real session.", base.Add(6*time.Second)),
	)
	flow.LearningOutcome = "Ignoring the bearer Recipient allows an assertion to be consumed at an ACS other than the one named in its confirmation."
	return flow, nil
}
