package saml

import (
	"fmt"
	"strings"
	"time"
)

const (
	ScenarioAudienceEnforced = "audience-enforced"
	ScenarioAudienceIgnored  = "audience-ignored"
)

// SatisfiesAudienceRestrictions applies OR within each restriction and AND
// across restrictions. An empty policy or an empty restriction fails closed.
func SatisfiesAudienceRestrictions(restrictions [][]string, serviceProviderEntityID string) bool {
	if len(restrictions) == 0 || strings.TrimSpace(serviceProviderEntityID) == "" {
		return false
	}
	for _, restriction := range restrictions {
		matched := false
		for _, audience := range restriction {
			if audience == serviceProviderEntityID {
				matched = true
				break
			}
		}
		if !matched {
			return false
		}
	}
	return true
}

func AudienceScenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioAudienceEnforced, Name: "Enforce every audience restriction", Description: "The ACS requires its entity ID to match at least one Audience in each AudienceRestriction group.", Secure: true},
		{ID: ScenarioAudienceIgnored, Name: "Ignore audience restrictions", Description: "The ACS accepts an assertion intended for another service provider.", Secure: false},
	}
}

func NewAudienceFlow(scenarioID string, now time.Time) (Flow, error) {
	var scenario Scenario
	for _, candidate := range AudienceScenarios() {
		if candidate.ID == scenarioID {
			scenario = candidate
			break
		}
	}
	if scenario.ID == "" {
		return Flow{}, fmt.Errorf("%w: %s", ErrUnsupportedScenario, scenarioID)
	}

	base := now.UTC()
	expected := "https://sp.example.test/entity"
	restrictions := [][]string{
		{expected, "https://shared.example.test/entity"},
		{"https://other-sp.example.test/entity"},
	}
	passed := SatisfiesAudienceRestrictions(restrictions, expected)
	flow := Flow{
		ID: fmt.Sprintf("saml_audience_%d", base.UnixNano()), Protocol: "SAML 2.0", Scenario: scenario,
		Events: []Event{}, Findings: []Finding{},
	}
	fields := []string{
		"restriction_1=OR(" + strings.Join(restrictions[0], " | ") + ")",
		"restriction_2=OR(" + strings.Join(restrictions[1], " | ") + ")",
		"service_provider=" + expected,
	}
	flow.Events = []Event{
		event(1, "service_provider", "audience_policy_loaded", "INTERNAL", "ACS configuration", []string{"entity_id=" + expected}, []string{"relying-party identity"}, "ACS expects its own entity ID", "The service provider loads its audience identifier", "The configured SP entity ID is the value the ACS must find in each applicable AudienceRestriction.", "Audience values in one restriction are alternatives. Separate restrictions all apply and therefore must each be satisfied.", base),
		event(2, "identity_provider", "response_issued", "POST", "/saml/acs", []string{"SAMLResponse=********", "subject=_user-demo"}, []string{"synthetic assertion", "signature validity assumed"}, "assertion targets a different service provider", "The IdP issues an assertion for another audience", "One restriction includes the intended SP as an alternative, but another restriction names only a different SP.", "A matching Audience in one group does not override a separate restriction that this service provider fails.", base.Add(time.Second)),
		event(3, "browser", "response_delivered", "POST", "/saml/acs", []string{"SAMLResponse=********"}, []string{"HTTP-POST binding"}, "assertion reaches the ACS", "The browser posts the response", "The browser delivers the synthetic response to the service provider.", "Delivery to the correct ACS does not make an assertion intended for another audience applicable to this SP.", base.Add(2*time.Second)),
		event(4, "service_provider", "baseline_assertion_checks", "INTERNAL", "ACS validation", []string{"issuer=trusted-demo-idp", "signature=assumed-valid", "recipient=/saml/acs", "conditions=valid"}, []string{"other checks assumed successful"}, "modeled issuer, signature, recipient, and time checks pass", "Other validation checks are held constant", "The simulation assumes issuer trust, valid signature, recipient, and time conditions.", "This exercise isolates audience policy. A real ACS must perform every applicable check, not only audience matching.", base.Add(3*time.Second)),
		event(5, "service_provider", "audience_restrictions_evaluated", "INTERNAL", "ACS audience policy", fields, []string{"OR within each group", "AND across groups"}, "audience match = "+fmt.Sprint(passed), "The ACS evaluates AudienceRestriction groups", "The ACS compares its entity ID with each restriction group, applying OR inside groups and requiring every group to match.", "AudienceRestrictions are conjunctive groups: each one must contain an audience applicable to this relying party.", base.Add(4*time.Second)),
	}

	if scenarioID == ScenarioAudienceEnforced {
		flow.Status = "audience_rejected"
		flow.Events = append(flow.Events,
			event(6, "service_provider", "response_rejected", "INTERNAL", "ACS policy", []string{"audience_match=false", "sessions_created=0"}, []string{"audience restriction failed closed", "no session created"}, "assertion rejected despite another group matching", "The ACS rejects an inapplicable assertion", "The second restriction has no audience equal to this service provider's entity ID, so the assertion is not applicable.", "Rejecting the whole assertion preserves the AND relationship between distinct AudienceRestriction conditions.", base.Add(5*time.Second)),
			event(7, "service_provider", "resource_access_denied", "GET", "/app/profile", []string{"sessions_created=0"}, []string{"no authenticated session"}, "no application session is created", "The assertion does not establish a session", "The service provider grants no access from this assertion.", "Audience checking prevents one relying party from accepting an assertion scoped to a different relying party.", base.Add(6*time.Second)),
		)
		flow.LearningOutcome = "The service provider was one option in one restriction, but failed another. Since all restrictions must pass, the ACS rejected the assertion."
		return flow, nil
	}

	flow.Status = "audience_accepted"
	flow.Findings = []Finding{{Severity: "high", Title: "Assertion accepted for the wrong audience", Description: "The ACS ignored an AudienceRestriction that did not include its entity ID and accepted an assertion intended for another relying party.", Mitigation: "Evaluate every AudienceRestriction: require the service provider entity ID to match at least one Audience within each restriction. Reject if any restriction is empty or unmatched."}}
	flow.Events = append(flow.Events,
		event(6, "service_provider", "response_accepted", "INTERNAL", "ACS policy", []string{"audience_match=false", "audience_check=ignored", "session=synthetic"}, []string{"audience restriction ignored"}, "assertion accepted despite audience mismatch", "The ACS bypasses audience policy", "The ACS ignores the failed second restriction and creates a synthetic session.", "The assertion may be authentic yet not intended for this relying party. Signature validation cannot substitute for audience enforcement.", base.Add(5*time.Second)),
		event(7, "service_provider", "resource_access_granted", "GET", "/app/profile", []string{"subject=_user-demo", "audience=other-sp"}, []string{"synthetic identity only", "wrong relying party"}, "inapplicable assertion reaches the application", "The wrong audience reaches the app", "The synthetic resource is accessed using an assertion whose AudienceRestriction failed for this SP.", "This trace models a relying-party validation failure only; it does not authenticate a real identity or create a real session.", base.Add(6*time.Second)),
	)
	flow.LearningOutcome = "Ignoring audience restrictions allows an assertion outside this service provider's intended audience to establish an application session."
	return flow, nil
}
