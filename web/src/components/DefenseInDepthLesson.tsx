import { useState } from "react";
import { assessDefenseInDepthEvidence, type DefenseInDepthScenario, type EvidenceAssessment } from "../academy/defense-in-depth";
import { runOAuthScenario, type ProtocolExchange } from "../protocols/oauth";

const STEPS: Array<{
  scenario: DefenseInDepthScenario;
  eyebrow: string;
  title: string;
  description: string;
  question?: string;
  answers?: Array<{ id: string; label: string }>;
  correctAnswer?: string;
}> = [
  {
    scenario: "missing-state",
    eyebrow: "Attack observation / 01",
    title: "An unbound callback arrives",
    description: "Observe a callback accepted without state. Predict why the injected authorization code does not produce a token.",
    question: "What stops this injected code at token exchange?",
    answers: [
      { id: "state", label: "The authorization server supplies state even though the client omitted it." },
      { id: "pkce", label: "The client verifier does not match the challenge bound to the injected code." },
      { id: "expiry", label: "The access token expired before the callback arrived." },
    ],
    correctAnswer: "pkce",
  },
  {
    scenario: "missing-pkce",
    eyebrow: "Attack observation / 02",
    title: "An intercepted code has no PKCE binding",
    description: "Observe what the attacker simulation can do when the authorization request has no PKCE challenge.",
    question: "What is the observed impact in this simulation?",
    answers: [
      { id: "rejected", label: "The token endpoint rejects the code because every public client has a secret." },
      { id: "state", label: "State alone makes the intercepted code unusable at the token endpoint." },
      { id: "resource", label: "The attacker simulation redeems the code and reaches the synthetic protected resource." },
    ],
    correctAnswer: "resource",
  },
  {
    scenario: "secure",
    eyebrow: "Defense verification / 03",
    title: "Verify the layered reference flow",
    description: "Run the secure reference flow. The Academy checks state, PKCE S256, client token use, protected-resource access, and absence of findings.",
  },
];

export function DefenseInDepthLesson() {
  const [stepIndex, setStepIndex] = useState(0);
  const [exchange, setExchange] = useState<ProtocolExchange | null>(null);
  const [assessment, setAssessment] = useState<EvidenceAssessment | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerChecked, setAnswerChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const step = STEPS[stepIndex];
  const completed = stepIndex >= STEPS.length;

  async function runScenario() {
    setLoading(true);
    setError("");
    setExchange(null);
    setAssessment(null);
    setSelectedAnswer("");
    setAnswerChecked(false);
    try {
      const result = await runOAuthScenario(step.scenario);
      const evidence = assessDefenseInDepthEvidence(result, step.scenario);
      setExchange(result);
      setAssessment(evidence);
      if (step.scenario === "secure" && evidence.reproduced) setStepIndex(STEPS.length);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to run the OAuth exercise.");
    } finally {
      setLoading(false);
    }
  }

  function checkAnswer() {
    if (!selectedAnswer || !step.correctAnswer) return;
    setAnswerChecked(true);
  }

  function continueLesson() {
    setStepIndex((current) => current + 1);
    setExchange(null);
    setAssessment(null);
    setSelectedAnswer("");
    setAnswerChecked(false);
  }

  return <>
    <header className="hero academy-hero">
      <p className="eyebrow">Cybersecurity Principles Academy / Defense in Depth</p>
      <h1>One boundary is useful. Layers are stronger.</h1>
      <p className="intro">Explore how OAuth state and PKCE address related but distinct parts of an authorization-code flow, then verify the secure reference exchange.</p>
    </header>

    <section className="academy-workbench" aria-label="Defense in depth learning exercise">
      <div className="academy-progress" aria-label={`Lesson progress: ${Math.min(stepIndex, STEPS.length)} of ${STEPS.length} steps`}>
        {STEPS.map((item, index) => <span className={index < stepIndex ? "complete" : index === stepIndex ? "current" : ""} key={item.scenario}>{String(index + 1).padStart(2, "0")} {item.eyebrow.split(" / ")[0]}</span>)}
      </div>

      <aside className="academy-concept">
        <strong>Two controls, distinct bindings</strong>
        <p><code>state</code> lets the client correlate a callback with the browser transaction. PKCE binds the authorization code to the verifier held by the initiating client. Confirmed PKCE support can provide CSRF protection too, but it does not make explicit transaction state meaningless.</p>
      </aside>

      {completed ? <section className="academy-complete" aria-live="polite">
        <p className="eyebrow">Exercise complete</p>
        <h2>You observed both failure paths and verified the reference flow.</h2>
        <p>Missing state left the callback unbound, while PKCE rejected the injected code. Missing PKCE let the attacker simulation redeem an intercepted code. The reference flow included both state and S256 and reached the resource as the client.</p>
        <button className="example-button" onClick={() => { setStepIndex(0); setExchange(null); setAssessment(null); }} type="button">Restart lesson</button>
      </section> : <>
        <div className="academy-step-heading">
          <p className="eyebrow">{step.eyebrow}</p>
          <h2>{step.title}</h2>
          <p>{step.description}</p>
        </div>

        <button className="run-button" onClick={runScenario} disabled={loading} type="button">
          {loading ? "Running local scenario..." : step.scenario === "secure" ? "Run secure verification" : "Run attack observation"}
        </button>
        {error && <p className="error">{error} Start the Go API with <code>go run ./cmd/server</code>.</p>}

        {assessment && <section className="academy-evidence" aria-live="polite">
          <h3>{assessment.reproduced ? step.scenario === "secure" ? "Reference flow verified" : "Expected attack evidence observed" : "Expected evidence was incomplete"}</h3>
          <ul>{assessment.checks.map((check) => <li className={check.passed ? "passed" : "failed"} key={check.label}>
            <strong>{check.passed ? "Observed" : "Not observed"}: {check.label}</strong>
            <span>{check.evidence}</span>
          </li>)}</ul>
        </section>}

        {assessment?.reproduced && step.answers && <section className="academy-question" aria-label="Knowledge check">
          <h3>{step.question}</h3>
          {step.answers.map((answer) => <label className={`academy-answer ${selectedAnswer === answer.id ? "selected" : ""}`} key={answer.id}>
            <input type="radio" name={`academy-answer-${stepIndex}`} value={answer.id} checked={selectedAnswer === answer.id} onChange={() => { setSelectedAnswer(answer.id); setAnswerChecked(false); }} />
            <span>{answer.label}</span>
          </label>)}
          <button className="run-button" onClick={checkAnswer} disabled={!selectedAnswer} type="button">Check answer</button>
          {answerChecked && <p className={`academy-feedback ${selectedAnswer === step.correctAnswer ? "correct" : "incorrect"}`} role="status">
            {selectedAnswer === step.correctAnswer
              ? step.scenario === "missing-state" ? "Correct. The callback was accepted without state, but the token endpoint rejected the injected code because the verifier did not match." : "Correct. Without a PKCE challenge, the simulation accepted the intercepted code and used the resulting token at the protected resource."
              : "Not quite. Recheck the observed events above and consider which control is bound to the callback versus the authorization code."}
          </p>}
          {answerChecked && selectedAnswer === step.correctAnswer && <button className="example-button" onClick={continueLesson} type="button">Continue to next exercise</button>}
        </section>}
      </>}

      {exchange && <details className="academy-trace">
        <summary>View redacted scenario trace ({exchange.messages.length} events)</summary>
        <ol>{exchange.messages.map((message) => <li key={`${message.sequence}-${message.label}`}>
          <span>{String(message.sequence).padStart(2, "0")}</span><strong>{message.participant} / {message.label}</strong><small>{message.outcome}</small>
        </li>)}</ol>
      </details>}
    </section>
  </>;
}
