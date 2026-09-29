package saml

import (
	"errors"
	"testing"
	"time"
)

func TestHasValidBearerConfirmationRequiresOneCompleteCandidate(t *testing.T) {
	now := replayTestTime
	policy := BearerConfirmationPolicy{ACSURL: "https://sp.example.test/saml/acs", RequestID: "_request", RequireRequestMatch: true, Now: now}
	valid := BearerConfirmation{Method: bearerConfirmationMethod, Recipient: policy.ACSURL, NotOnOrAfter: now.Add(time.Second), InResponseTo: policy.RequestID}
	tests := []struct {
		name       string
		candidates []BearerConfirmation
		want       bool
	}{
		{name: "one complete candidate", candidates: []BearerConfirmation{valid}, want: true},
		{name: "any complete alternative is enough", candidates: []BearerConfirmation{{Recipient: "wrong"}, valid}, want: true},
		{name: "cannot combine recipient and expiry", candidates: []BearerConfirmation{
			{Method: bearerConfirmationMethod, Recipient: policy.ACSURL, NotOnOrAfter: now.Add(-time.Second), InResponseTo: policy.RequestID},
			{Method: bearerConfirmationMethod, Recipient: "wrong", NotOnOrAfter: now.Add(time.Second), InResponseTo: policy.RequestID},
		}, want: false},
		{name: "exclusive expiry boundary", candidates: []BearerConfirmation{{Method: bearerConfirmationMethod, Recipient: policy.ACSURL, NotOnOrAfter: now, InResponseTo: policy.RequestID}}, want: false},
		{name: "wrong method", candidates: []BearerConfirmation{{Method: "holder-of-key", Recipient: policy.ACSURL, NotOnOrAfter: now.Add(time.Second), InResponseTo: policy.RequestID}}, want: false},
		{name: "wrong request", candidates: []BearerConfirmation{{Method: bearerConfirmationMethod, Recipient: policy.ACSURL, NotOnOrAfter: now.Add(time.Second), InResponseTo: "_other"}}, want: false},
		{name: "empty candidates", candidates: nil, want: false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := HasValidBearerConfirmation(test.candidates, policy); got != test.want {
				t.Errorf("HasValidBearerConfirmation() = %t, want %t", got, test.want)
			}
		})
	}
}

func TestSubjectConfirmationFlows(t *testing.T) {
	for _, test := range []struct {
		scenario string
		status   string
		secure   bool
	}{
		{scenario: ScenarioSubjectConfirmationEnforced, status: "no_valid_confirmation_rejected", secure: true},
		{scenario: ScenarioSubjectConfirmationMixed, status: "mixed_confirmation_accepted", secure: false},
	} {
		flow, err := NewSubjectConfirmationFlow(test.scenario, replayTestTime)
		if err != nil {
			t.Fatalf("NewSubjectConfirmationFlow(%q): %v", test.scenario, err)
		}
		if flow.Status != test.status || flow.Scenario.Secure != test.secure {
			t.Errorf("flow status/secure = %q/%t, want %q/%t", flow.Status, flow.Scenario.Secure, test.status, test.secure)
		}
		if test.secure && len(flow.Findings) != 0 || !test.secure && len(flow.Findings) != 1 {
			t.Errorf("unexpected findings: %#v", flow.Findings)
		}
	}
}

func TestUnsupportedSubjectConfirmationScenario(t *testing.T) {
	if _, err := NewSubjectConfirmationFlow("unknown", replayTestTime); !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want ErrUnsupportedScenario", err)
	}
}
