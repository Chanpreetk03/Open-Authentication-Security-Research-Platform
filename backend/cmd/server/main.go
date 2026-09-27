package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/iam-platform/backend/internal/oauthoidc"
	"github.com/iam-platform/backend/internal/saml"
)

func main() {
	server := &http.Server{Addr: "127.0.0.1:8080", Handler: newHandler()}
	log.Println("IAM Platform API listening on http://localhost:8080")
	log.Fatal(server.ListenAndServe())
}

func newHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /api/flows/oauth/authorization-code", func(w http.ResponseWriter, r *http.Request) {
		scenario := r.URL.Query().Get("scenario")
		if scenario == "" {
			scenario = oauthoidc.ScenarioSecure
		}
		flow, err := oauthoidc.NewAuthorizationCodeFlowForScenario(scenario, time.Now().UTC())
		if err != nil {
			if errors.Is(err, oauthoidc.ErrUnsupportedScenario) {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, flow)
	})
	mux.HandleFunc("GET /api/flows/oauth/scenarios", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, oauthoidc.Scenarios())
	})
	mux.HandleFunc("GET /api/flows/saml/replay", func(w http.ResponseWriter, r *http.Request) {
		scenario := r.URL.Query().Get("scenario")
		if scenario == "" {
			scenario = saml.ScenarioReplayProtected
		}
		flow, err := saml.NewReplayFlow(scenario, time.Now().UTC())
		if err != nil {
			if errors.Is(err, saml.ErrUnsupportedScenario) {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, flow)
	})
	mux.HandleFunc("GET /api/flows/saml/scenarios", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, saml.Scenarios())
	})
	mux.HandleFunc("GET /api/flows/saml/correlation", func(w http.ResponseWriter, r *http.Request) {
		scenario := r.URL.Query().Get("scenario")
		if scenario == "" {
			scenario = saml.ScenarioCorrelationRequired
		}
		flow, err := saml.NewCorrelationFlow(scenario, time.Now().UTC())
		if err != nil {
			if errors.Is(err, saml.ErrUnsupportedScenario) {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, flow)
	})
	mux.HandleFunc("GET /api/flows/saml/correlation/scenarios", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, saml.CorrelationScenarios())
	})
	mux.HandleFunc("GET /api/flows/saml/audience", func(w http.ResponseWriter, r *http.Request) {
		scenario := r.URL.Query().Get("scenario")
		if scenario == "" {
			scenario = saml.ScenarioAudienceEnforced
		}
		flow, err := saml.NewAudienceFlow(scenario, time.Now().UTC())
		if err != nil {
			if errors.Is(err, saml.ErrUnsupportedScenario) {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, flow)
	})
	mux.HandleFunc("GET /api/flows/saml/audience/scenarios", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, saml.AudienceScenarios())
	})
	mux.HandleFunc("GET /api/flows/saml/recipient", func(w http.ResponseWriter, r *http.Request) {
		scenario := r.URL.Query().Get("scenario")
		if scenario == "" {
			scenario = saml.ScenarioRecipientEnforced
		}
		flow, err := saml.NewRecipientFlow(scenario, time.Now().UTC())
		if err != nil {
			if errors.Is(err, saml.ErrUnsupportedScenario) {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, flow)
	})
	mux.HandleFunc("GET /api/flows/saml/recipient/scenarios", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, saml.RecipientScenarios())
	})
	mux.HandleFunc("GET /api/flows/saml/conditions", func(w http.ResponseWriter, r *http.Request) {
		scenario := r.URL.Query().Get("scenario")
		if scenario == "" {
			scenario = saml.ScenarioConditionsEnforced
		}
		flow, err := saml.NewConditionsFlow(scenario, time.Now().UTC())
		if err != nil {
			if errors.Is(err, saml.ErrUnsupportedScenario) {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, flow)
	})
	mux.HandleFunc("GET /api/flows/saml/conditions/scenarios", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, saml.ConditionsScenarios())
	})
	mux.HandleFunc("GET /api/flows/saml/signature-binding", func(w http.ResponseWriter, r *http.Request) {
		scenario := r.URL.Query().Get("scenario")
		if scenario == "" {
			scenario = saml.ScenarioSignatureBindingEnforced
		}
		flow, err := saml.NewSignatureBindingFlow(scenario, time.Now().UTC())
		if err != nil {
			if errors.Is(err, saml.ErrUnsupportedScenario) {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, flow)
	})
	mux.HandleFunc("GET /api/flows/saml/signature-binding/scenarios", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, saml.SignatureBindingScenarios())
	})

	return withCORS(mux)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
