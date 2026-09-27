package saml

import (
	"fmt"
	"time"
)

const (
	ScenarioSignatureBindingEnforced = "signature-binding-enforced"
	ScenarioSignatureBindingIgnored  = "signature-binding-ignored"
)

// AssertionNode represents a parsed assertion object; verification and
// application consumption must refer to the exact same object instance.
type AssertionNode struct {
	ID      string
	Subject string
}

func ConsumesVerifiedAssertion(verified, consumed *AssertionNode) bool {
	return verified != nil && consumed != nil && verified == consumed
}

func SignatureBindingScenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioSignatureBindingEnforced, Name: "Consume the verified assertion node", Description: "The ACS requires application logic to consume the exact node returned as verified by the XML-signature layer.", Secure: true},
		{ID: ScenarioSignatureBindingIgnored, Name: "Select an assertion independently", Description: "The ACS validates one signed node but application logic consumes a different unsigned assertion.", Secure: false},
	}
}

func NewSignatureBindingFlow(scenarioID string, now time.Time) (Flow, error) {
	var scenario Scenario
	for _, candidate := range SignatureBindingScenarios() {
		if candidate.ID == scenarioID {
			scenario = candidate
			break
		}
	}
	if scenario.ID == "" {
		return Flow{}, fmt.Errorf("%w: %s", ErrUnsupportedScenario, scenarioID)
	}

	base := now.UTC()
	verifiedNode := &AssertionNode{ID: "_assertion-signed", Subject: "_user-signed"}
	consumedNode := &AssertionNode{ID: "_assertion-injected", Subject: "_user-attacker"}
	bindingMatches := ConsumesVerifiedAssertion(verifiedNode, consumedNode)
	flow := Flow{
		ID: fmt.Sprintf("saml_signature_binding_%d", base.UnixNano()), Protocol: "SAML 2.0", Scenario: scenario,
		Events: []Event{}, Findings: []Finding{},
	}
	flow.Events = []Event{
		event(1, "attacker", "wrapped_response_received", "POST", "/saml/acs", []string{"SAMLResponse=********", "signed_node=_assertion-signed", "application_selected_node=_assertion-injected"}, []string{"synthetic XML structure", "no real assertion data"}, "document contains distinct signed and application-selected nodes", "A wrapped response reaches the ACS", "The synthetic structure contains a signed assertion node and a different assertion node selected by application logic.", "Signature wrapping exploits disagreement between what the signature layer verified and what the identity layer consumes.", base),
		event(2, "signature_verifier", "reference_validated", "INTERNAL", "XML Signature reference", []string{"reference_uri=#_assertion-signed", "verified_node=_assertion-signed"}, []string{"reference digest assumed valid", "signature value assumed valid"}, "signature layer reports the signed node as verified", "The verifier resolves and validates a reference", "The model assumes successful cryptographic validation for the reference resolving to _assertion-signed.", "XML Signature core validation includes validating the signature and every referenced digest; a Signature element's mere presence is not proof of either.", base.Add(time.Second)),
		event(3, "service_provider", "assertion_selected", "INTERNAL", "application identity mapping", []string{"selected_node=_assertion-injected", "subject=_user-attacker"}, []string{"independent document lookup"}, "application selects a different node", "Application logic selects its assertion", "A separate lookup returns _assertion-injected, not the node reported by the verifier.", "Do not verify one node and then search the document again for an assertion to trust.", base.Add(2*time.Second)),
		event(4, "service_provider", "signature_binding_evaluated", "INTERNAL", "verified object binding", []string{"verified_node=_assertion-signed", "consumed_node=_assertion-injected", fmt.Sprintf("consumes_verified_node=%t", bindingMatches)}, []string{"object identity comparison", "ID strings alone are insufficient"}, fmt.Sprintf("consumes verified node = %t", bindingMatches), "The ACS binds verification to consumption", "The check compares the actual parsed object reference returned by verification with the object passed to identity processing.", "Binding by node identity avoids trusting a separate node that merely appears elsewhere in the same signed document.", base.Add(3*time.Second)),
	}

	if scenarioID == ScenarioSignatureBindingEnforced {
		flow.Status = "unverified_node_rejected"
		flow.Events = append(flow.Events,
			event(5, "service_provider", "response_rejected", "INTERNAL", "ACS policy", []string{"consumes_verified_node=false", "sessions_created=0"}, []string{"verified-node binding required", "no session created"}, "application rejects the different node", "The ACS blocks the signature-wrapping path", "The assertion selected by identity logic is not the node whose reference was validated, so the response cannot establish a session.", "Pass the verifier's resolved, validated node directly to claim processing. Avoid a second lookup by attacker-controlled or duplicate ID values.", base.Add(4*time.Second)),
			event(6, "service_provider", "resource_access_denied", "GET", "/app/profile", []string{"sessions_created=0"}, []string{"unverified assertion not consumed"}, "no application identity is created", "No identity is established", "The ACS fails closed rather than consuming claims from an unverified node.", "This invariant complements algorithm allow-lists, trusted keys, reference validation, and the other SAML acceptance checks.", base.Add(5*time.Second)),
		)
		flow.LearningOutcome = "The signature verifier and application selected different assertion objects. Requiring the exact verified node prevented the injected claims from being consumed."
		return flow, nil
	}

	flow.Status = "unverified_node_accepted"
	flow.Findings = []Finding{{Severity: "critical", Title: "Unverified assertion node consumed", Description: "The signature layer validated one assertion, while application logic consumed a different node from the same response.", Mitigation: "Use the exact assertion node returned as verified by the XML-signature layer. Reject ambiguous or duplicate ID resolution and do not independently re-query the document for identity-bearing elements."}}
	flow.Events = append(flow.Events,
		event(5, "service_provider", "assertion_accepted", "INTERNAL", "ACS policy", []string{"consumes_verified_node=false", "identity=_user-attacker", "session=synthetic"}, []string{"signature result ignored by mapper", "different node consumed"}, "application consumes claims from the unverified node", "The vulnerable mapper trusts its independent lookup", "Application logic accepts _assertion-injected even though the verifier validated _assertion-signed.", "A valid signature over one element does not authenticate sibling or wrapped content that the application chooses to consume.", base.Add(4*time.Second)),
		event(6, "service_provider", "resource_access_granted", "GET", "/app/profile", []string{"subject=_user-attacker", "source_node=_assertion-injected"}, []string{"synthetic identity only", "unverified node consumed"}, "injected identity reaches the app", "Claims from the wrong node reach the app", "The trace models an ACS creating an identity from data outside the validated signature reference.", "This is a synthetic control-flow trace only; it contains no XML exploit, cryptographic implementation, or real user data.", base.Add(5*time.Second)),
	)
	flow.LearningOutcome = "A signature can be cryptographically valid while the application still consumes a different, unverified assertion node."
	return flow, nil
}
