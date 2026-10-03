package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/iam-platform/backend/internal/oauthoidc"
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
		{name: "conditions scenario catalog", path: "/api/flows/saml/conditions/scenarios", statusCode: http.StatusOK},
		{name: "default conditions trace", path: "/api/flows/saml/conditions", statusCode: http.StatusOK, wantStatus: "expired_rejected"},
		{name: "conditions ignored trace", path: "/api/flows/saml/conditions?scenario=conditions-ignored", statusCode: http.StatusOK, wantStatus: "expired_accepted"},
		{name: "unsupported conditions scenario", path: "/api/flows/saml/conditions?scenario=unknown", statusCode: http.StatusBadRequest},
		{name: "signature-binding scenario catalog", path: "/api/flows/saml/signature-binding/scenarios", statusCode: http.StatusOK},
		{name: "default signature-binding trace", path: "/api/flows/saml/signature-binding", statusCode: http.StatusOK, wantStatus: "unverified_node_rejected"},
		{name: "signature binding ignored trace", path: "/api/flows/saml/signature-binding?scenario=signature-binding-ignored", statusCode: http.StatusOK, wantStatus: "unverified_node_accepted"},
		{name: "unsupported signature-binding scenario", path: "/api/flows/saml/signature-binding?scenario=unknown", statusCode: http.StatusBadRequest},
		{name: "subject-confirmation scenario catalog", path: "/api/flows/saml/subject-confirmation/scenarios", statusCode: http.StatusOK},
		{name: "default subject-confirmation trace", path: "/api/flows/saml/subject-confirmation", statusCode: http.StatusOK, wantStatus: "no_valid_confirmation_rejected"},
		{name: "mixed subject-confirmation trace", path: "/api/flows/saml/subject-confirmation?scenario=subject-confirmation-mixed", statusCode: http.StatusOK, wantStatus: "mixed_confirmation_accepted"},
		{name: "unsupported subject-confirmation scenario", path: "/api/flows/saml/subject-confirmation?scenario=unknown", statusCode: http.StatusBadRequest},
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

func TestOAuthProtectionRoute(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		statusCode int
		wantID     string
	}{
		{name: "secure configuration", body: `{"state_enabled":true,"pkce_enabled":true}`, statusCode: http.StatusOK, wantID: oauthoidc.ScenarioSecure},
		{name: "state only", body: `{"state_enabled":true,"pkce_enabled":false}`, statusCode: http.StatusOK, wantID: oauthoidc.ScenarioMissingPKCE},
		{name: "PKCE only", body: `{"state_enabled":false,"pkce_enabled":true}`, statusCode: http.StatusOK, wantID: oauthoidc.ScenarioMissingState},
		{name: "both protections disabled", body: `{"state_enabled":false,"pkce_enabled":false}`, statusCode: http.StatusOK, wantID: oauthoidc.ScenarioMissingBoth},
		{name: "missing field", body: `{"state_enabled":true}`, statusCode: http.StatusBadRequest},
		{name: "wrong type", body: `{"state_enabled":"true","pkce_enabled":true}`, statusCode: http.StatusBadRequest},
		{name: "unknown field", body: `{"state_enabled":true,"pkce_enabled":true,"target":"example.test"}`, statusCode: http.StatusBadRequest},
		{name: "malformed JSON", body: `{`, statusCode: http.StatusBadRequest},
		{name: "multiple JSON values", body: `{"state_enabled":true,"pkce_enabled":true} {}`, statusCode: http.StatusBadRequest},
		{name: "oversized body", body: `{"state_enabled":true,"pkce_enabled":true,"padding":"` + strings.Repeat("x", 1100) + `"}`, statusCode: http.StatusBadRequest},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/flows/oauth/authorization-code", strings.NewReader(test.body))
			response := httptest.NewRecorder()
			newHandler().ServeHTTP(response, request)
			if response.Code != test.statusCode {
				t.Fatalf("status = %d, want %d; body=%s", response.Code, test.statusCode, response.Body.String())
			}
			if test.wantID == "" {
				return
			}
			var flow oauthoidc.Flow
			if err := json.NewDecoder(response.Body).Decode(&flow); err != nil {
				t.Fatalf("decode flow: %v", err)
			}
			if flow.Scenario.ID != test.wantID {
				t.Errorf("scenario = %q, want %q", flow.Scenario.ID, test.wantID)
			}
			if len(flow.Events) == 0 || flow.Status == "" || flow.LearningOutcome == "" {
				t.Errorf("incomplete flow: events=%d status=%q learningOutcome=%q", len(flow.Events), flow.Status, flow.LearningOutcome)
			}
			if response.Header().Get("Access-Control-Allow-Methods") == "" || !strings.Contains(response.Header().Get("Access-Control-Allow-Methods"), "POST") {
				t.Errorf("CORS methods do not include POST: %q", response.Header().Get("Access-Control-Allow-Methods"))
			}
		})
	}
}

func TestOAuthScenarioRoutesReturnCompleteFlows(t *testing.T) {
	tests := []struct {
		name       string
		path       string
		statusCode int
		wantID     string
	}{
		{name: "secure scenario", path: "/api/flows/oauth/authorization-code?scenario=secure", statusCode: http.StatusOK, wantID: oauthoidc.ScenarioSecure},
		{name: "missing state scenario", path: "/api/flows/oauth/authorization-code?scenario=missing-state", statusCode: http.StatusOK, wantID: oauthoidc.ScenarioMissingState},
		{name: "missing PKCE scenario", path: "/api/flows/oauth/authorization-code?scenario=missing-pkce", statusCode: http.StatusOK, wantID: oauthoidc.ScenarioMissingPKCE},
		{name: "combined failure scenario", path: "/api/flows/oauth/authorization-code?scenario=missing-state-and-pkce", statusCode: http.StatusOK, wantID: oauthoidc.ScenarioMissingBoth},
		{name: "unknown scenario", path: "/api/flows/oauth/authorization-code?scenario=unknown", statusCode: http.StatusBadRequest},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, test.path, nil)
			response := httptest.NewRecorder()
			newHandler().ServeHTTP(response, request)
			if response.Code != test.statusCode {
				t.Fatalf("status = %d, want %d; body=%s", response.Code, test.statusCode, response.Body.String())
			}
			if test.wantID == "" {
				return
			}
			var flow oauthoidc.Flow
			if err := json.NewDecoder(response.Body).Decode(&flow); err != nil {
				t.Fatalf("decode flow: %v", err)
			}
			if flow.Scenario.ID != test.wantID || len(flow.Events) == 0 || flow.Status == "" || flow.LearningOutcome == "" {
				t.Errorf("incomplete flow: scenario=%q events=%d status=%q learningOutcome=%q", flow.Scenario.ID, len(flow.Events), flow.Status, flow.LearningOutcome)
			}
		})
	}
}
