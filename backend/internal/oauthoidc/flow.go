package oauthoidc

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"
)

const (
	ScenarioSecure       = "secure"
	ScenarioMissingState = "missing-state"
	ScenarioMissingPKCE  = "missing-pkce"
	ScenarioMissingBoth  = "missing-state-and-pkce"
)

var ErrUnsupportedScenario = errors.New("unsupported OAuth scenario")

type Flow struct {
	ID              string    `json:"id"`
	Protocol        string    `json:"protocol"`
	GrantType       string    `json:"grant_type"`
	Status          string    `json:"status"`
	Scenario        Scenario  `json:"scenario"`
	Events          []Event   `json:"events"`
	Findings        []Finding `json:"findings"`
	LearningOutcome string    `json:"learning_outcome"`
}

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

func Scenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioSecure, Name: "Secure reference flow", Description: "State and PKCE protect the authorization-code exchange.", Secure: true},
		{ID: ScenarioMissingState, Name: "Missing state", Description: "The client accepts a callback without state; PKCE then blocks the injected code at redemption.", Secure: false},
		{ID: ScenarioMissingPKCE, Name: "Missing PKCE", Description: "An intercepted authorization code can be redeemed without a verifier.", Secure: false},
		{ID: ScenarioMissingBoth, Name: "Missing state and PKCE", Description: "The client accepts an unbound callback and an intercepted code without PKCE.", Secure: false},
	}
}

func NewAuthorizationCodeFlow(now time.Time) (Flow, error) {
	return NewAuthorizationCodeFlowForScenario(ScenarioSecure, now)
}

func NewAuthorizationCodeFlowForScenario(scenarioID string, now time.Time) (Flow, error) {
	scenario, ok := scenarioByID(scenarioID)
	if !ok {
		return Flow{}, fmt.Errorf("%w: %s", ErrUnsupportedScenario, scenarioID)
	}
	if scenarioID == ScenarioMissingBoth {
		return newFlowWithoutStateOrPKCE(now)
	}
	flowID, err := randomID("flow")
	if err != nil {
		return Flow{}, err
	}

	flow := Flow{ID: flowID, Protocol: "OAuth 2.0", GrantType: "authorization_code", Scenario: scenario, Findings: []Finding{}}
	switch scenarioID {
	case ScenarioSecure:
		flow.Status = "completed"
		flow.Events = secureEvents(now)
		flow.LearningOutcome = "State binds the callback to the browser session, and PKCE binds the code to the client that started the flow."
	case ScenarioMissingState:
		flow.Status = "blocked_with_finding"
		flow.Events = missingStateEvents(now)
		flow.Findings = []Finding{{Severity: "medium", Title: "State validation is missing", Description: "The client accepts a callback without checking its browser transaction state. In this simulation, PKCE rejects the injected code because its verifier belongs to a different authorization request.", Mitigation: "Validate unpredictable state against the browser session. A client may rely on PKCE for CSRF protection only after confirming that the authorization server supports PKCE."}}
		flow.LearningOutcome = "The callback lacks state, but PKCE blocks this injected code at redemption. The protections overlap for CSRF while PKCE also binds the code to the initiating client transaction."
	case ScenarioMissingPKCE:
		flow.Status = "completed_with_finding"
		flow.Events = missingPKCEEvents(now)
		flow.Findings = []Finding{{Severity: "high", Title: "Authorization-code interception risk", Description: "The authorization code was not bound to a PKCE verifier, allowing an attacker to redeem an intercepted code.", Mitigation: "Require an S256 code challenge at authorization time and validate its verifier before issuing tokens."}}
		flow.LearningOutcome = "State protects the callback. PKCE protects the authorization code itself, especially for public clients."
	}
	return flow, nil
}

func NewAuthorizationCodeFlowForProtections(stateEnabled, pkceEnabled bool, now time.Time) (Flow, error) {
	switch {
	case stateEnabled && pkceEnabled:
		return NewAuthorizationCodeFlowForScenario(ScenarioSecure, now)
	case !stateEnabled && pkceEnabled:
		return NewAuthorizationCodeFlowForScenario(ScenarioMissingState, now)
	case stateEnabled && !pkceEnabled:
		return NewAuthorizationCodeFlowForScenario(ScenarioMissingPKCE, now)
	default:
		return NewAuthorizationCodeFlowForScenario(ScenarioMissingBoth, now)
	}
}

func newFlowWithoutStateOrPKCE(now time.Time) (Flow, error) {
	flowID, err := randomID("flow")
	if err != nil {
		return Flow{}, err
	}
	flow := Flow{
		ID: flowID, Protocol: "OAuth 2.0", GrantType: "authorization_code",
		Status:   "completed_with_finding",
		Scenario: Scenario{ID: ScenarioMissingBoth, Name: "Missing state and PKCE", Description: "The client accepts an unbound callback and an intercepted code without PKCE.", Secure: false},
		Findings: []Finding{
			{Severity: "medium", Title: "State validation is missing", Description: "The client accepts a callback without checking that it belongs to the browser transaction that initiated authorization.", Mitigation: "Generate unpredictable state and validate it against the initiating browser session."},
			{Severity: "high", Title: "Authorization-code interception risk", Description: "The code has no PKCE binding, so the attacker simulation can redeem the intercepted code.", Mitigation: "Require an S256 code challenge and validate the verifier before issuing tokens."},
		},
		LearningOutcome: "State binds the callback to the browser session. PKCE binds the authorization code to the client transaction. This simulation omits both protections.",
	}
	flow.Events = missingStateAndPKCEEvents(now)
	return flow, nil
}

func scenarioByID(id string) (Scenario, bool) {
	for _, scenario := range Scenarios() {
		if scenario.ID == id {
			return scenario, true
		}
	}
	return Scenario{}, false
}

func secureEvents(now time.Time) []Event {
	return []Event{
		event(1, "client", "authorization_requested", "GET", "/authorize", []string{"response_type=code", "client_id=demo-client", "redirect_uri=http://localhost:5173/callback", "scope=read:profile", "state=********", "code_challenge=********", "code_challenge_method=S256"}, []string{"exact redirect URI", "state", "PKCE S256"}, "request accepted", "The client starts the authorization request", "The client sends its identity, requested scope, redirect URI, state, and an S256 PKCE challenge to the authorization server.", "State ties a later callback to this browser session. The PKCE challenge makes the code useless without the verifier.", now),
		event(2, "authorization_server", "user_authenticated", "POST", "/login", []string{"username=learner"}, []string{"local demo identity"}, "demo user authenticated", "The authorization server authenticates the resource owner", "The local demo authorization server verifies the learner before it can ask for consent.", "The client never receives the user password; authentication occurs at the authorization server.", now.Add(time.Second)),
		event(3, "resource_owner", "consent_granted", "POST", "/consent", []string{"scope=read:profile"}, []string{"explicit consent"}, "scope approved", "The resource owner approves the requested access", "The learner grants the client the read:profile scope.", "OAuth delegates a limited scope of access instead of sharing the user's credentials.", now.Add(2*time.Second)),
		event(4, "authorization_server", "code_issued", "302", "/authorize/callback", []string{"code=********", "state=********"}, []string{"short-lived code", "client binding", "redirect URI binding"}, "redirect returned to client", "A short-lived code returns through the browser", "The server redirects the browser to the registered callback with a single-use code and the original state value.", "The client must compare state before accepting the response. The code is not yet an access token.", now.Add(3*time.Second)),
		event(5, "client", "code_redeemed", "POST", "/token", []string{"grant_type=authorization_code", "code=********", "redirect_uri=http://localhost:5173/callback", "code_verifier=omitted"}, []string{"single-use code", "PKCE verifier", "protected channel"}, "code accepted and invalidated", "The client exchanges its code privately", "The client sends the code and its PKCE verifier directly to the token endpoint. The trace omits the reusable verifier.", "The server validates the verifier and invalidates the code, preventing a replay.", now.Add(4*time.Second)),
		event(6, "authorization_server", "access_token_issued", "200", "/token", []string{"token_type=Bearer", "access_token=********", "expires_in=600", "scope=read:profile"}, []string{"short-lived access token", "redacted secret"}, "token response returned", "The authorization server issues a limited access token", "The client receives a short-lived bearer token for the approved scope. Its value is masked before it reaches the explorer.", "Access tokens are credentials. Traces should expose their role and lifetime without leaking usable values.", now.Add(5*time.Second)),
		resourceEvent(7, "client", "protected_resource_requested", "GET", "/api/profile", "the signed-in user profile was returned", now.Add(6*time.Second)),
	}
}

func missingStateEvents(now time.Time) []Event {
	events := secureEvents(now)
	events[0].Parameters = []string{"response_type=code", "client_id=demo-client", "redirect_uri=http://localhost:5173/callback", "scope=read:profile", "code_challenge=********", "code_challenge_method=S256"}
	events[0].SecurityProperties = []string{"exact redirect URI", "PKCE S256", "state missing"}
	events[0].Outcome = "request accepted without state"
	events[0].Explanation = Explanation{Heading: "The client starts without callback binding", WhatHappened: "The client omits state from its authorization request.", WhyItMatters: "Without state, the client cannot prove that a callback belongs to the browser session that began this flow."}
	events[3].Parameters = []string{"code=********", "state=missing"}
	events[3].SecurityProperties = []string{"short-lived code", "PKCE S256", "state missing"}
	events[3].Outcome = "redirect returned without state"
	events[3].Explanation = Explanation{Heading: "The authorization response has no state", WhatHappened: "The authorization server redirects with a code but cannot echo a state value the client never sent.", WhyItMatters: "The browser response is not bound to the session that initiated authorization."}
	callbackAccepted := event(5, "client", "callback_accepted_without_state", "GET", "/authorize/callback", []string{"code=********", "state=missing"}, []string{"state validation missing", "PKCE S256"}, "callback received; state was not checked", "The client receives an unbound callback", "The simulation injects an authorization response started for another browser transaction. The client accepts the callback because it does not compare state.", "The callback should be bound to the browser session. The following PKCE verifier check determines whether this injected code can be redeemed.", now.Add(4*time.Second))
	codeRejected := event(6, "authorization_server", "code_redemption_rejected", "POST", "/token", []string{"grant_type=authorization_code", "code=********", "code_verifier=omitted"}, []string{"PKCE S256", "verifier mismatch"}, "invalid_grant: verifier does not match this code", "PKCE blocks the injected authorization code", "The client sends the verifier from its own browser transaction, but the injected authorization code is bound to a different challenge.", "A token is not issued and no protected resource is reached. Confirming PKCE support lets a client rely on this protection for CSRF, while state still explicitly binds the response to its session.", now.Add(5*time.Second))
	return append(events[:4], callbackAccepted, codeRejected)
}

func missingPKCEEvents(now time.Time) []Event {
	events := secureEvents(now)
	events[0].Parameters = []string{"response_type=code", "client_id=demo-client", "redirect_uri=http://localhost:5173/callback", "scope=read:profile", "state=********"}
	events[0].SecurityProperties = []string{"exact redirect URI", "state", "PKCE missing"}
	events[0].Outcome = "request accepted without PKCE"
	events[0].Explanation = Explanation{Heading: "The client starts without a PKCE challenge", WhatHappened: "The authorization request has no code_challenge or code_challenge_method.", WhyItMatters: "An intercepted code is not bound to the client that initiated the browser flow."}
	events[4] = event(5, "attacker", "intercepted_code_redeemed", "POST", "/token", []string{"grant_type=authorization_code", "code=********", "code_verifier=missing"}, []string{"PKCE missing", "simulated interception"}, "code accepted without verifier", "An intercepted code is redeemed", "The attacker simulation sends the intercepted authorization code to the token endpoint without a PKCE verifier.", "Without PKCE, the authorization server cannot distinguish the attacker from the legitimate public client.", now.Add(4*time.Second))
	events[5] = event(6, "authorization_server", "access_token_issued", "200", "/token", []string{"token_type=Bearer", "access_token=********", "expires_in=600", "scope=read:profile"}, []string{"redacted secret", "security finding"}, "token issued to attacker simulation", "The server issues a token despite the missing verifier", "The simulated token endpoint accepts the code because it has no PKCE binding to validate.", "This is the outcome PKCE prevents: a stolen code becoming a usable access token.", now.Add(5*time.Second))
	events[6] = resourceEvent(7, "attacker", "protected_resource_requested", "GET", "/api/profile", "the attacker's synthetic profile was returned", now.Add(6*time.Second))
	return events
}

func missingStateAndPKCEEvents(now time.Time) []Event {
	events := secureEvents(now)
	events[0].Parameters = []string{"response_type=code", "client_id=demo-client", "redirect_uri=http://localhost:5173/callback", "scope=read:profile"}
	events[0].SecurityProperties = []string{"exact redirect URI", "state missing", "PKCE missing"}
	events[0].Outcome = "request accepted without state or PKCE"
	events[0].Explanation = Explanation{Heading: "The client starts without callback or code binding", WhatHappened: "The authorization request omits both state and a PKCE challenge.", WhyItMatters: "The callback is not tied to the browser session, and an intercepted authorization code is not tied to the client transaction."}
	events[3].Parameters = []string{"code=********", "state=missing"}
	events[3].SecurityProperties = []string{"short-lived code", "redirect URI binding", "state missing", "PKCE missing"}
	events[3].Outcome = "redirect returned without state"
	events[3].Explanation = Explanation{Heading: "The authorization response has no state", WhatHappened: "The server redirects with a code but has no state value to echo.", WhyItMatters: "The response is not bound to the browser session that initiated authorization."}
	events[4] = event(5, "attacker", "intercepted_code_redeemed", "POST", "/token", []string{"grant_type=authorization_code", "code=********", "code_verifier=missing"}, []string{"state validation missing", "PKCE missing", "simulated interception"}, "code accepted without state or verifier", "An intercepted code is redeemed", "The attacker simulation submits the intercepted authorization code without a PKCE verifier.", "With neither callback state validation nor PKCE code binding, this modeled attack reaches token issuance.", now.Add(4*time.Second))
	events[5] = event(6, "authorization_server", "access_token_issued", "200", "/token", []string{"token_type=Bearer", "access_token=********", "expires_in=600", "scope=read:profile"}, []string{"redacted secret", "state missing", "PKCE missing"}, "token issued to attacker simulation", "The server issues a token", "The synthetic token endpoint accepts the code because it has no verifier binding to validate.", "A usable token is the modeled impact; its value remains masked.", now.Add(5*time.Second))
	events[6] = resourceEvent(7, "attacker", "protected_resource_requested", "GET", "/api/profile", "the attacker's synthetic profile was returned", now.Add(6*time.Second))
	return events
}

func resourceEvent(sequence int, actor, eventType, method, uri, outcome string, timestamp time.Time) Event {
	heading := "The client calls the protected resource"
	whatHappened := "The client presents the access token and the resource server returns synthetic profile data for the granted scope."
	if actor == "attacker" {
		heading = "The attacker uses the stolen access token"
		whatHappened = "The attacker presents the intercepted code's access token and the resource server returns synthetic profile data for the granted scope."
	}
	return event(sequence, actor, eventType, method, uri, []string{"Authorization=Bearer ********", "scope=read:profile", "profile=synthetic"}, []string{"token presented", "scope checked", "synthetic data only"}, outcome, heading, whatHappened, "OAuth is complete when the access token is used at the resource server. The token stays masked in the trace.", timestamp)
}

func event(sequence int, actor, eventType, method, uri string, parameters, properties []string, outcome, heading, whatHappened, whyItMatters string, timestamp time.Time) Event {
	return Event{Sequence: sequence, Actor: actor, Type: eventType, Method: method, URI: uri, Parameters: parameters, SecurityProperties: properties, Outcome: outcome, Explanation: Explanation{Heading: heading, WhatHappened: whatHappened, WhyItMatters: whyItMatters}, Timestamp: timestamp.Format(time.RFC3339)}
}

func randomID(prefix string) (string, error) {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("generate flow id: %w", err)
	}
	return prefix + "_" + hex.EncodeToString(bytes), nil
}
