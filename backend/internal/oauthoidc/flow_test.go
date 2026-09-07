package oauthoidc

import (
	"testing"
	"time"
)

func TestAuthorizationCodeFlowIsRedactedAndOrdered(t *testing.T) {
	flow, err := NewAuthorizationCodeFlow(time.Date(2026, 8, 30, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("create flow: %v", err)
	}
	if flow.Status != "completed" || len(flow.Events) != 6 {
		t.Fatalf("unexpected flow summary: status=%q events=%d", flow.Status, len(flow.Events))
	}
	for index, event := range flow.Events {
		if event.Sequence != index+1 {
			t.Errorf("event %d has sequence %d", index, event.Sequence)
		}
		for _, parameter := range event.Parameters {
			if parameter == "code=demo-code" || parameter == "access_token=demo-token" {
				t.Errorf("event %d contains an unredacted secret: %s", index+1, parameter)
			}
		}
	}
}
