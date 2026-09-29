package saml

import (
	"fmt"
	"time"
)

const (
	ScenarioSubjectConfirmationEnforced = "subject-confirmation-enforced"
	ScenarioSubjectConfirmationMixed    = "subject-confirmation-mixed"
	bearerConfirmationMethod            = "urn:oasis:names:tc:SAML:2.0:cm:bearer"
)

type BearerConfirmation struct {
	Method       string
	Recipient    string
	NotOnOrAfter time.Time
	InResponseTo string
}

type BearerConfirmationPolicy struct {
	ACSURL              string
	RequestID           string
	RequireRequestMatch bool
	Now                 time.Time
}

// MatchesBearerConfirmation evaluates every required field on one candidate.
func MatchesBearerConfirmation(candidate BearerConfirmation, policy BearerConfirmationPolicy) bool {
	if candidate.Method != bearerConfirmationMethod || !MatchesBearerRecipient(candidate.Recipient, policy.ACSURL) ||
		candidate.NotOnOrAfter.IsZero() || !policy.Now.Before(candidate.NotOnOrAfter) {
		return false
	}
	if policy.RequireRequestMatch && (policy.RequestID == "" || candidate.InResponseTo != policy.RequestID) {
		return false
	}
	return true
}

// HasValidBearerConfirmation accepts when at least one complete candidate passes.
func HasValidBearerConfirmation(candidates []BearerConfirmation, policy BearerConfirmationPolicy) bool {
	for _, candidate := range candidates {
		if MatchesBearerConfirmation(candidate, policy) {
			return true
		}
	}
	return false
}

func SubjectConfirmationScenarios() []Scenario {
	return []Scenario{
		{ID: ScenarioSubjectConfirmationEnforced, Name: "Validate one complete bearer confirmation", Description: "The ACS accepts only when a single bearer confirmation matches its recipient, expiry, and outstanding request.", Secure: true},
		{ID: ScenarioSubjectConfirmationMixed, Name: "Combine fields across confirmations", Description: "The ACS incorrectly combines a matching recipient from one candidate with valid time and request data from another.", Secure: false},
	}
}

func NewSubjectConfirmationFlow(scenarioID string, now time.Time) (Flow, error) {
	var scenario Scenario
	for _, candidate := range SubjectConfirmationScenarios() {
		if candidate.ID == scenarioID {
			scenario = candidate
			break
		}
	}
	if scenario.ID == "" {
		return Flow{}, fmt.Errorf("%w: %s", ErrUnsupportedScenario, scenarioID)
	}

	base := now.UTC()
	policy := BearerConfirmationPolicy{ACSURL: "https://sp.example.test/saml/acs", RequestID: "_request-current", RequireRequestMatch: true, Now: base}
	candidates := []BearerConfirmation{
		{Method: bearerConfirmationMethod, Recipient: policy.ACSURL, NotOnOrAfter: base.Add(-time.Minute), InResponseTo: "_request-current"},
		{Method: bearerConfirmationMethod, Recipient: "https://sp.example.test/saml/alternate-acs", NotOnOrAfter: base.Add(time.Minute), InResponseTo: "_request-current"},
	}
	valid := HasValidBearerConfirmation(candidates, policy)
	flow := Flow{
		ID: fmt.Sprintf("saml_subject_confirmation_%d", base.UnixNano()), Protocol: "SAML 2.0", Scenario: scenario,
		Events: []Event{}, Findings: []Finding{},
	}
	flow.Events = []Event{
		event(1, "service_provider", "confirmation_policy_loaded", "INTERNAL", "ACS configuration", []string{"expected_recipient=" + policy.ACSURL, "request_id=" + policy.RequestID, "bearer_method_required=true"}, []string{"all fields checked per candidate"}, "ACS requires one complete bearer confirmation", "The ACS loads confirmation policy", "The expected recipient, current request ID, bearer method, and expiry must be checked as one candidate.", "An assertion may contain alternatives, but security properties from different alternatives cannot be composed into a passing confirmation.", base),
		event(2, "identity_provider", "subject_confirmations_received", "POST", "/saml/acs", []string{"candidate_1=expected-recipient,expired", "candidate_2=alternate-recipient,unexpired", "candidate_1_and_2=request-matched"}, []string{"synthetic candidates", "signature assumed valid"}, "no single candidate satisfies every required check", "The assertion presents two alternatives", "Candidate 1 has the expected recipient but is expired. Candidate 2 is current but names a different ACS. Both carry the expected request ID.", "SubjectConfirmation elements are alternatives; evaluate the complete candidate rather than combining attributes across elements.", base.Add(time.Second)),
		event(3, "service_provider", "candidate_evaluation_completed", "INTERNAL", "ACS bearer confirmation policy", []string{"candidate_1_valid=false", "candidate_2_valid=false", "any_complete_candidate_valid=" + fmt.Sprint(valid)}, []string{"method=bearer", "recipient exact", "NotOnOrAfter exclusive", "InResponseTo required for solicited response"}, "complete-candidate result = "+fmt.Sprint(valid), "The ACS evaluates candidates independently", "Each candidate is tested for bearer method, exact recipient, a future NotOnOrAfter, and the outstanding request ID.", "The ACS must not take the recipient from one candidate and the expiry or correlation value from another.", base.Add(2*time.Second)),
	}
	if scenarioID == ScenarioSubjectConfirmationEnforced {
		flow.Status = "no_valid_confirmation_rejected"
		flow.Events = append(flow.Events,
			event(4, "service_provider", "response_rejected", "INTERNAL", "ACS policy", []string{"any_complete_candidate_valid=false", "sessions_created=0"}, []string{"no candidate passed all checks"}, "assertion rejected", "The ACS rejects the incomplete alternatives", "Neither bearer confirmation independently satisfies the required recipient, time, and request-correlation checks.", "A response is usable only when at least one complete confirmation meets the relying party's policy.", base.Add(3*time.Second)),
			event(5, "service_provider", "resource_access_denied", "GET", "/app/profile", []string{"sessions_created=0"}, []string{"no authenticated session"}, "no application identity is created", "No identity is established", "The ACS fails closed because no single confirmation authorized this use of the assertion.", "This synthetic policy lab does not parse XML or authenticate a real user.", base.Add(4*time.Second)),
		)
		flow.LearningOutcome = "Evaluate each bearer SubjectConfirmation as a whole. These two alternatives cannot be combined to authorize a session."
		return flow, nil
	}
	flow.Status = "mixed_confirmation_accepted"
	flow.Findings = []Finding{{Severity: "high", Title: "Fields combined across bearer confirmations", Description: "The vulnerable ACS used the recipient from an expired candidate and the valid time from a candidate naming another ACS.", Mitigation: "Evaluate each SubjectConfirmation independently and accept only if one complete bearer confirmation satisfies every required check."}}
	flow.Events = append(flow.Events,
		event(4, "service_provider", "confirmation_fields_aggregated", "INTERNAL", "vulnerable ACS policy", []string{"recipient_source=candidate_1", "time_source=candidate_2", "request_source=candidate_2"}, []string{"cross-candidate field mixing"}, "aggregated fields appear valid", "The vulnerable ACS combines alternatives", "The implementation treats confirmation fields as if they were one shared record, despite no individual candidate passing.", "This is not valid alternative evaluation: all required properties must be established by the same confirmation candidate.", base.Add(3*time.Second)),
		event(5, "service_provider", "response_accepted", "INTERNAL", "vulnerable ACS policy", []string{"session=synthetic", "no_complete_candidate=true"}, []string{"candidate boundaries ignored"}, "assertion accepted without a valid candidate", "The ACS creates an unsafe synthetic session", "Application logic proceeds even though candidate-by-candidate validation returned false.", "Never merge confirmation attributes across XML elements or parsed objects.", base.Add(4*time.Second)),
	)
	flow.LearningOutcome = "A vulnerable ACS can accept an assertion by combining individually insufficient confirmations; validate one complete candidate instead."
	return flow, nil
}
