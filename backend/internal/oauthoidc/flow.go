package oauthoidc

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
)

type Flow struct {
	ID        string  `json:"id"`
	Protocol  string  `json:"protocol"`
	GrantType string  `json:"grant_type"`
	Status    string  `json:"status"`
	Events    []Event `json:"events"`
}

type Event struct {
	Sequence          int      `json:"sequence"`
	Actor             string   `json:"actor"`
	Type              string   `json:"type"`
	Method            string   `json:"method"`
	URI               string   `json:"uri"`
	Parameters        []string `json:"parameters,omitempty"`
	SecurityProperties []string `json:"security_properties"`
	Outcome           string   `json:"outcome"`
	Timestamp         string   `json:"timestamp"`
}

func NewAuthorizationCodeFlow(now time.Time) (Flow, error) {
	flowID, err := randomID("flow")
	if err != nil {
		return Flow{}, err
	}
	return Flow{
		ID:        flowID,
		Protocol:  "OAuth 2.0",
		GrantType: "authorization_code",
		Status:    "completed",
		Events: []Event{
			{1, "client", "authorization_requested", "GET", "/authorize", []string{"response_type=code", "client_id=demo-client", "redirect_uri=http://localhost:5173/callback", "scope=read:profile", "state=••••••••", "code_challenge=••••••••", "code_challenge_method=S256"}, []string{"exact redirect URI", "state", "PKCE S256"}, "request accepted", now.Format(time.RFC3339)},
			{2, "authorization_server", "user_authenticated", "POST", "/login", []string{"username=learner"}, []string{"local demo identity"}, "demo user authenticated", now.Add(time.Second).Format(time.RFC3339)},
			{3, "resource_owner", "consent_granted", "POST", "/consent", []string{"scope=read:profile"}, []string{"explicit consent"}, "scope approved", now.Add(2 * time.Second).Format(time.RFC3339)},
			{4, "authorization_server", "code_issued", "302", "/authorize/callback", []string{"code=••••••••", "state=••••••••"}, []string{"short-lived code", "client binding", "redirect URI binding"}, "redirect returned to client", now.Add(3 * time.Second).Format(time.RFC3339)},
			{5, "client", "code_redeemed", "POST", "/token", []string{"grant_type=authorization_code", "code=••••••••", "redirect_uri=http://localhost:5173/callback", "code_verifier=omitted"}, []string{"single-use code", "PKCE verifier", "protected channel"}, "code accepted and invalidated", now.Add(4 * time.Second).Format(time.RFC3339)},
			{6, "authorization_server", "access_token_issued", "200", "/token", []string{"token_type=Bearer", "access_token=••••••••", "expires_in=600", "scope=read:profile"}, []string{"short-lived access token", "redacted secret"}, "token response returned", now.Add(5 * time.Second).Format(time.RFC3339)},
		},
	}, nil
}

func randomID(prefix string) (string, error) {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("generate flow id: %w", err)
	}
	return prefix + "_" + hex.EncodeToString(bytes), nil
}
