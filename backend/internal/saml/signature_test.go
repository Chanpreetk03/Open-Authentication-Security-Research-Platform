package saml

import (
	"errors"
	"testing"
)

func TestConsumesVerifiedAssertionUsesObjectIdentityNotIDEquality(t *testing.T) {
	verified := &AssertionNode{ID: "_duplicate", Subject: "_user-verified"}
	otherNodeSameID := &AssertionNode{ID: "_duplicate", Subject: "_user-injected"}
	tests := []struct {
		name     string
		verified *AssertionNode
		consumed *AssertionNode
		want     bool
	}{
		{name: "same verified object", verified: verified, consumed: verified, want: true},
		{name: "distinct objects with duplicate IDs", verified: verified, consumed: otherNodeSameID, want: false},
		{name: "missing verified result", verified: nil, consumed: verified, want: false},
		{name: "missing consumed assertion", verified: verified, consumed: nil, want: false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := ConsumesVerifiedAssertion(test.verified, test.consumed); got != test.want {
				t.Errorf("ConsumesVerifiedAssertion() = %t, want %t", got, test.want)
			}
		})
	}
}

func TestSignatureBindingEnforcedRejectsDifferentNode(t *testing.T) {
	flow, err := NewSignatureBindingFlow(ScenarioSignatureBindingEnforced, replayTestTime)
	if err != nil {
		t.Fatalf("create signature-binding flow: %v", err)
	}
	if flow.Status != "unverified_node_rejected" || !flow.Scenario.Secure || len(flow.Events) != 6 || len(flow.Findings) != 0 {
		t.Fatalf("unexpected protected signature-binding trace: %#v", flow)
	}
	if flow.Events[3].Outcome != "consumes verified node = false" || flow.Events[4].Type != "response_rejected" || flow.Events[5].Parameters[0] != "sessions_created=0" {
		t.Fatalf("trace does not establish exact-node enforcement: %#v", flow.Events)
	}
}

func TestSignatureBindingIgnoredShowsUnverifiedNodeConsumption(t *testing.T) {
	flow, err := NewSignatureBindingFlow(ScenarioSignatureBindingIgnored, replayTestTime)
	if err != nil {
		t.Fatalf("create vulnerable signature-binding trace: %v", err)
	}
	if flow.Status != "unverified_node_accepted" || flow.Scenario.Secure || len(flow.Findings) != 1 || flow.Findings[0].Severity != "critical" {
		t.Fatalf("unexpected vulnerable signature-binding trace: %#v", flow)
	}
	if flow.Events[4].Type != "assertion_accepted" || flow.Events[5].Parameters[0] != "subject=_user-attacker" {
		t.Fatalf("trace does not expose consumption of unverified node: %#v", flow.Events)
	}
}

func TestUnsupportedSignatureBindingScenario(t *testing.T) {
	if _, err := NewSignatureBindingFlow("unknown", replayTestTime); !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want ErrUnsupportedScenario", err)
	}
}
