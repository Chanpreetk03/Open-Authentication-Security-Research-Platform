package saml

import (
	"errors"
	"testing"
)

func TestSatisfiesAudienceRestrictions(t *testing.T) {
	const sp = "https://sp.example.test/entity"
	tests := []struct {
		name         string
		restrictions [][]string
		serviceID    string
		want         bool
	}{
		{name: "single group matches", restrictions: [][]string{{sp}}, serviceID: sp, want: true},
		{name: "OR within a group", restrictions: [][]string{{"https://other.example/entity", sp}}, serviceID: sp, want: true},
		{name: "AND across groups", restrictions: [][]string{{sp, "https://shared.example/entity"}, {sp}}, serviceID: sp, want: true},
		{name: "one separate restriction does not match", restrictions: [][]string{{sp}, {"https://other.example/entity"}}, serviceID: sp, want: false},
		{name: "no restrictions fails closed", restrictions: nil, serviceID: sp, want: false},
		{name: "empty restriction fails closed", restrictions: [][]string{{}}, serviceID: sp, want: false},
		{name: "empty SP entity ID fails closed", restrictions: [][]string{{sp}}, serviceID: "", want: false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := SatisfiesAudienceRestrictions(test.restrictions, test.serviceID); got != test.want {
				t.Errorf("SatisfiesAudienceRestrictions() = %t, want %t", got, test.want)
			}
		})
	}
}

func TestAudienceEnforcementRejectsAssertionWhenAnyRestrictionDoesNotMatch(t *testing.T) {
	flow, err := NewAudienceFlow(ScenarioAudienceEnforced, replayTestTime)
	if err != nil {
		t.Fatalf("create audience-enforced trace: %v", err)
	}
	if flow.Status != "audience_rejected" || !flow.Scenario.Secure || len(flow.Events) != 7 || len(flow.Findings) != 0 {
		t.Fatalf("unexpected enforced-audience trace: %#v", flow)
	}
	if flow.Events[4].Outcome != "audience match = false" || flow.Events[5].Type != "response_rejected" || flow.Events[6].Parameters[0] != "sessions_created=0" {
		t.Fatalf("trace does not prove fail-closed audience decision: %#v", flow.Events)
	}
}

func TestAudienceIgnoredTraceShowsCrossRelyingPartyAcceptance(t *testing.T) {
	flow, err := NewAudienceFlow(ScenarioAudienceIgnored, replayTestTime)
	if err != nil {
		t.Fatalf("create audience-ignored trace: %v", err)
	}
	if flow.Status != "audience_accepted" || flow.Scenario.Secure || len(flow.Findings) != 1 || flow.Findings[0].Severity != "high" {
		t.Fatalf("unexpected audience-ignored trace: %#v", flow)
	}
	if flow.Events[4].Outcome != "audience match = false" || flow.Events[5].Type != "response_accepted" {
		t.Fatalf("trace does not show the policy bypass: %#v", flow.Events)
	}
}

func TestUnsupportedAudienceScenario(t *testing.T) {
	if _, err := NewAudienceFlow("unknown", replayTestTime); !errors.Is(err, ErrUnsupportedScenario) {
		t.Fatalf("error = %v, want ErrUnsupportedScenario", err)
	}
}
