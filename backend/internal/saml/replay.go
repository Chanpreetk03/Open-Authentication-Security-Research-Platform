package saml

import (
	"errors"
	"fmt"
	"time"
)

const (
	ScenarioReplayProtected = "replay-protected"
	ScenarioReplayDisabled  = "replay-disabled"
)

var ErrUnsupportedScenario = errors.New("unsupported SAML replay scenario")

type Scenario struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Secure      bool   `json:"secure"`
}

type Finding struct {
	Severity    string `json:"severity"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Mitigation  string `json:"mitigation"`
}

type Explanation struct {
	Heading      string `json:"heading"`
	WhatHappened string `json:"what_happened"`
	WhyItMatters string `json:"why_it_matters"`
}

type Event struct {
	Sequence           int         `json:"sequence"`
	Actor              string      `json:"actor"`
	Type               string      `json:"type"`
	Method             string      `json:"method"`
	URI                string      `json:"uri"`
	Parameters         []string    `json:"parameters,omitempty"`
	SecurityProperties []string    `json:"security_properties"`
	Outcome            string      `json:"outcome"`
	Explanation        Explanation `json:"explanation"`
	Timestamp          string      `json:"timestamp"`
}

type Flow struct {
	ID              string    `json:"id"`
	Protocol        string    `json:"protocol"`
	Status          string    `json:"status"`
	Scenario        Scenario  `json:"scenario"`
	Events          []Event   `json:"events"`
	Findings        []Finding `json:"findings"`
	LearningOutcome string    `json:"learning_outcome"`
}

func Scenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioReplayProtected, Name: "Replay cache enabled", Description: "The ACS records accepted assertion IDs and rejects a repeated assertion before creating another session.", Secure: true},
		{ID: ScenarioReplayDisabled, Name: "Replay cache disabled", Description: "The ACS validates the assertion but accepts the same valid response again because it does not remember the assertion ID.", Secure: false},
	}
}

func NewReplayFlow(scenarioID string, now time.Time) (Flow, error) {
	var scenario Scenario
	for _, candidate := range Scenarios() {
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
		ID:       fmt.Sprintf("saml_replay_%d", base.UnixNano()),
		Protocol: "SAML 2.0",
		Scenario: scenario,
		Events:   []Event{},
		Findings: []Finding{},
	}
	flow.Events = []Event{
		event(1, "service_provider", "authentication_requested", "GET", "/saml/login", []string{"SAMLRequest=********", "RelayState=********"}, []string{"SP-initiated browser SSO"}, "browser redirected to configured IdP", "The service provider starts SSO", "This trace starts after the service provider has selected a preconfigured IdP.", "The metadata inspector only reads endpoint declarations; a real deployment must establish trust in metadata and validate its origin.", base),
		event(2, "identity_provider", "response_issued", "POST", "/saml/acs", []string{"SAMLResponse=********", "Assertion ID=_assertion-demo"}, []string{"synthetic response", "signature validity assumed"}, "synthetic response prepared for ACS", "The IdP prepares a response", "The simulated IdP returns a response containing one synthetic bearer assertion.", "This lab does not create XML, sign a response, or authenticate an identity. It assumes a configured trusted issuer and valid signature to isolate replay behavior.", base.Add(time.Second)),
		event(3, "browser", "response_delivered", "POST", "/saml/acs", []string{"SAMLResponse=********"}, []string{"HTTP-POST binding", "browser transports response"}, "response delivered to ACS", "The browser posts the response", "The browser carries the response to the service provider's assertion consumer service.", "The browser is a delivery channel, not a trusted validator. The ACS owns all acceptance decisions.", base.Add(2*time.Second)),
		event(4, "service_provider", "assertion_validated", "INTERNAL", "ACS validation", []string{"issuer=trusted-demo-idp", "audience=demo-sp", "recipient=/saml/acs", "NotOnOrAfter=valid", "assertion_id=_assertion-demo"}, []string{"signature and issuer trust assumed", "conditions checked", "audience checked", "recipient checked"}, "first delivery passes modeled checks", "The ACS validates the assertion", "The lab models issuer, audience, recipient, and time checks as successful for both deliveries.", "Replay protection is separate from checking whether one delivery is otherwise valid. A previously accepted assertion may still be dangerous when replayed.", base.Add(3*time.Second)),
		event(5, "service_provider", "assertion_accepted", "INTERNAL", "session creation", []string{"assertion_id=_assertion-demo", "session=synthetic"}, []string{"one-time assertion use"}, "first delivery creates one synthetic session", "The first delivery is accepted", "The ACS accepts the first assertion and establishes one synthetic session.", "The accepted assertion ID should be retained until it can no longer pass time-condition validation.", base.Add(4*time.Second)),
		event(6, "attacker", "response_replayed", "POST", "/saml/acs", []string{"SAMLResponse=********", "Assertion ID=_assertion-demo"}, []string{"replayed captured demo response", "no real credentials"}, "same synthetic response posted again", "The identical response is replayed", "An attacker resubmits the exact same demo response while its assertion would otherwise still be valid.", "A valid signature does not by itself make an assertion single-use. The ACS must enforce replay resistance as part of its acceptance policy.", base.Add(5*time.Second)),
	}

	if scenarioID == ScenarioReplayProtected {
		flow.Events[4] = event(5, "service_provider", "assertion_accepted", "INTERNAL", "session creation", []string{"assertion_id=_assertion-demo", "cache_entry=recorded", "session=synthetic"}, []string{"atomic replay-cache insert", "one-time assertion use"}, "first delivery creates one session and records its ID", "The first delivery is accepted", "The ACS accepts the first assertion, records its ID, and establishes one synthetic session.", "The accepted assertion ID should be retained until it can no longer pass time-condition validation.", base.Add(4*time.Second))
		flow.Status = "replay_rejected"
		flow.Events = append(flow.Events,
			event(7, "service_provider", "replay_rejected", "INTERNAL", "replay cache", []string{"assertion_id=_assertion-demo", "cache_entry=present"}, []string{"atomic one-time ID check", "duplicate rejected"}, "duplicate assertion ID rejected; no second session", "The replay cache blocks reuse", "The ACS finds the assertion ID recorded during the first acceptance and rejects the duplicate.", "The replay check must be atomic with acceptance, shared across ACS instances, and retained for at least the assertion's remaining validity window.", base.Add(6*time.Second)),
			event(8, "service_provider", "resource_access_granted", "GET", "/app/profile", []string{"sessions_created=1"}, []string{"one accepted assertion", "synthetic resource"}, "only the original synthetic session exists", "Only one session reaches the app", "The original sign-in remains; replay did not create a second session.", "Replay controls complement, rather than replace, signature, issuer, time, audience, recipient, and request-correlation validation.", base.Add(7*time.Second)),
		)
		flow.LearningOutcome = "The assertion passed modeled validation once. The ACS recorded its ID and rejected the repeated response before it could create another session."
		return flow, nil
	}

	flow.Events[4] = event(5, "service_provider", "assertion_accepted", "INTERNAL", "session creation", []string{"assertion_id=_assertion-demo", "replay_cache=disabled", "session=synthetic"}, []string{"replay cache disabled"}, "first delivery creates one synthetic session", "The first delivery is accepted", "The ACS accepts the first assertion but stores no identifier that would expose later reuse.", "Without recording accepted IDs, the ACS cannot distinguish this assertion from a new delivery while it remains otherwise valid.", base.Add(4*time.Second))
	flow.Status = "replay_accepted"
	flow.Findings = []Finding{{Severity: "high", Title: "SAML assertion replay accepted", Description: "The second delivery passed the modeled checks and created another synthetic session because no accepted assertion IDs were retained.", Mitigation: "Maintain a shared, atomic replay cache keyed by issuer and assertion ID until the assertion can no longer be accepted. Keep all other SAML validation checks enabled."}}
	flow.Events = append(flow.Events,
		event(7, "service_provider", "assertion_accepted", "INTERNAL", "session creation", []string{"assertion_id=_assertion-demo", "session=synthetic-2"}, []string{"replay cache disabled", "duplicate accepted"}, "second delivery creates another synthetic session", "The replay is accepted", "With replay detection disabled, the ACS treats the second delivery like a new sign-in.", "A response may still have a valid signature and satisfy time, audience, and recipient checks while being a replay. The replay cache is a distinct control.", base.Add(6*time.Second)),
		event(8, "service_provider", "resource_access_granted", "GET", "/app/profile", []string{"sessions_created=2"}, []string{"replayed assertion", "synthetic resource"}, "two synthetic sessions exist", "The replay creates a second session", "The trace models a second application session from the same assertion ID.", "This is a controlled simulation with synthetic values only; it does not expose a real ACS or accept uploaded assertions.", base.Add(7*time.Second)),
	)
	flow.LearningOutcome = "Without replay detection, a still-valid assertion can be accepted more than once. A signature proves integrity/origin under configured trust; it does not enforce one-time use."
	return flow, nil
}

func event(sequence int, actor, eventType, method, uri string, parameters, properties []string, outcome, heading, whatHappened, whyItMatters string, timestamp time.Time) Event {
	return Event{
		Sequence: sequence, Actor: actor, Type: eventType, Method: method, URI: uri,
		Parameters: parameters, SecurityProperties: properties, Outcome: outcome,
		Explanation: Explanation{Heading: heading, WhatHappened: whatHappened, WhyItMatters: whyItMatters},
		Timestamp:   timestamp.UTC().Format(time.RFC3339),
	}
}
