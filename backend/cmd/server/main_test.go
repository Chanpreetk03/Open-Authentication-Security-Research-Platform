package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/iam-platform/backend/internal/saml"
)

func TestSAMLReplayRoutes(t *testing.T) {
	handler := newHandler()
	tests := []struct {
		name       string
		path       string
		statusCode int
		wantStatus string
	}{
		{name: "scenario catalog", path: "/api/flows/saml/scenarios", statusCode: http.StatusOK},
		{name: "default secure trace", path: "/api/flows/saml/replay", statusCode: http.StatusOK, wantStatus: "replay_rejected"},
		{name: "replay disabled trace", path: "/api/flows/saml/replay?scenario=replay-disabled", statusCode: http.StatusOK, wantStatus: "replay_accepted"},
		{name: "unsupported scenario", path: "/api/flows/saml/replay?scenario=unknown", statusCode: http.StatusBadRequest},
		{name: "correlation scenario catalog", path: "/api/flows/saml/correlation/scenarios", statusCode: http.StatusOK},
		{name: "default correlation trace", path: "/api/flows/saml/correlation", statusCode: http.StatusOK, wantStatus: "mismatch_rejected"},
		{name: "correlation ignored trace", path: "/api/flows/saml/correlation?scenario=correlation-ignored", statusCode: http.StatusOK, wantStatus: "mismatch_accepted"},
		{name: "unsupported correlation scenario", path: "/api/flows/saml/correlation?scenario=unknown", statusCode: http.StatusBadRequest},
		{name: "audience scenario catalog", path: "/api/flows/saml/audience/scenarios", statusCode: http.StatusOK},
		{name: "default audience trace", path: "/api/flows/saml/audience", statusCode: http.StatusOK, wantStatus: "audience_rejected"},
		{name: "audience ignored trace", path: "/api/flows/saml/audience?scenario=audience-ignored", statusCode: http.StatusOK, wantStatus: "audience_accepted"},
		{name: "unsupported audience scenario", path: "/api/flows/saml/audience?scenario=unknown", statusCode: http.StatusBadRequest},
		{name: "recipient scenario catalog", path: "/api/flows/saml/recipient/scenarios", statusCode: http.StatusOK},
		{name: "default recipient trace", path: "/api/flows/saml/recipient", statusCode: http.StatusOK, wantStatus: "recipient_rejected"},
		{name: "recipient ignored trace", path: "/api/flows/saml/recipient?scenario=recipient-ignored", statusCode: http.StatusOK, wantStatus: "recipient_accepted"},
		{name: "unsupported recipient scenario", path: "/api/flows/saml/recipient?scenario=unknown", statusCode: http.StatusBadRequest},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, test.path, nil)
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, request)
			if response.Code != test.statusCode {
				t.Fatalf("status = %d, want %d; body=%s", response.Code, test.statusCode, response.Body.String())
			}
			if test.wantStatus == "" {
				return
			}
			var flow saml.Flow
			if err := json.NewDecoder(response.Body).Decode(&flow); err != nil {
				t.Fatalf("decode flow response: %v", err)
			}
			if flow.Status != test.wantStatus {
				t.Errorf("flow status = %q, want %q", flow.Status, test.wantStatus)
			}
		})
	}
}
