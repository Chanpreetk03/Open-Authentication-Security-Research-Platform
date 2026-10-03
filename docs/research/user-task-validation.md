# Workbench User-Task Validation Guide

**Status:** Draft — requires product-owner review before recruiting or sessions.
**Roadmap item:** [ROAD-001](../roadmap/backlog.md#road-001--define-the-user-task-validation-rubric)
**Next item:** ROAD-002 runs the sessions and records results separately.

## Purpose

Find out whether developers and security learners can use the current local
workbench to understand an authentication exchange, diagnose a modeled failure,
and interpret what its evidence proves. Learn which task and next capability
matter most to them.

This is a small qualitative product-direction study. It can reveal confusion,
workflow gaps, and repeated requests; it cannot establish market size or
statistically validate demand.

## Decisions this study should inform

After reviewing observations, the product owner decides:

1. Which initial user and task should the workbench optimize for?
2. Does the combined inspect/exercise/mitigate/verify loop help with that task?
3. Do users understand the distinction between a local inspector, a synthetic
   simulation, cryptographic/standards validation, and live interoperability?
4. Which single next capability should be investigated, if any?

The sessions do not approve live-provider connectivity, arbitrary request
replay, executable vulnerable targets, hosted labs, or production IAM scope.

## Suggested participants and session format

- Start with **five participants** as a directional first round: at least two
  developers who work with authentication integrations and at least two
  security learners or practitioners. Use the remaining slot for either group
  or an educator if available.
- This is a practical starting sample, not a statistically representative
  sample. Record how each participant was selected and their relevant
  experience; do not generalize beyond it.
- Suggested duration: **45–60 minutes**. Keep the same core tasks and prompt
  wording across participants. Rotate one focused inspector task (JWT, HTTP, or
  SAML) across sessions rather than asking every participant to test every
  surface. Across the five sessions, include at least one JWT, one HTTP, and
  one SAML task; this is coverage sampling, not a comparative benchmark.
- A facilitator runs the session. A second observer may take notes if the
  participant agrees.

## Safety, consent, and data handling

Before beginning, explain the purpose, expected duration, voluntary nature,
what notes will be kept, and that the participant can stop at any time. Ask
permission before taking notes that include direct quotes. Do not record audio
or video unless separately agreed.

- Use only the app's synthetic examples and local simulations.
- Do not ask for or accept production credentials, live tokens, private keys,
  customer traces, or personally identifying authentication data.
- Do not connect to a third-party provider, send traffic, follow redirects, or
  replay requests. If a participant offers a real secret or target, stop and
  switch to a generated example.
- Use participant codes (P1, P2, …). Avoid retaining names, contact details,
  employer/customer names, or raw sensitive input in research notes.
- Store notes only in the project-approved location and retain only what is
  needed to make the product decision.

## Facilitator preparation

1. Start the current app using the repository's `README.md` instructions.
2. Confirm the OAuth flow tool, Academy lesson, and selected inspector load.
   If a tool or API is unavailable, record the setup failure; do not silently
   exclude it from the findings.
3. Use only generated examples. Do not paste participant-provided tokens or
   request data.
4. Prepare a blank scorecard for each participant and a clock.
5. Before the first session, the product owner reviews and signs off the
   decision thresholds below. Do not change thresholds after seeing results.

## Session script

### Opening (3–5 minutes)

Suggested wording:

> We are evaluating the tool, not you. Some screens show synthetic simulations
> or local inspection only. Please say what you expect and what you think the
> evidence proves. I may stay quiet while you work. You can stop at any time.

Ask permission for note-taking. Briefly ask what authentication work the
participant does or studies and how often, without collecting employer,
customer, or account details.

### Task A — Understand a protocol flow (10–15 minutes)

**Prompt:**

> Imagine you are checking an OAuth authorization-code sign-in. Use the flow
> tool to understand the exchange. Talk me through what happened, where the
> authorization code goes, and what evidence in the screen supports your
> explanation.

Do not tell the participant which events to inspect. Observe whether they find
the timeline, select events, use explanations, and distinguish a code from a
token. Ask only the neutral prompts below if they stop:

- “What are you looking for now?”
- “What would you expect to happen next?”
- “What on the screen led you to that conclusion?”

### Task B — Diagnose a modeled failure and mitigation (10–15 minutes)

**Prompt:**

> A team is concerned that one protection in this flow may be missing. Use a
> failure scenario to work out what behavior is being demonstrated, what risk
> it represents, and what change would reduce that risk. Show me the evidence
> you would use to check the change.

Let the participant choose among the available failure scenarios. Record
whether they understand what the model demonstrates and whether the secure
reference scenario is used as evidence. Do not coach them toward “state” or
“PKCE” before recording their initial interpretation.

### Task C — Interpret one inspector's boundary (5–10 minutes)

Rotate one focused task across participants:

- **JWT:** “Inspect the provided synthetic token. What can you conclude from
  this view, and what would you still need to verify before trusting it?”
- **HTTP:** “Inspect the provided callback or redirect example. What sensitive
  values are visible or masked, and does this tool send the request?”
- **SAML:** “Explore the selected SAML viewer or synthetic lab. What behavior
  does it model or display, and what would it take to validate a real SAML
  response?”

Use only repository-provided examples. The purpose is to see whether participants
notice the tool's stated boundary, not to test protocol trivia.

### Debrief (5–10 minutes)

Ask the same questions of everyone:

1. Which part of the workflow was most useful for a task you actually do or
   study? What made it useful?
2. Where did you hesitate, get stuck, or want information the tool did not
   provide?
3. What do you believe the tool has verified? What has it not verified?
4. Which next capability would you choose: deeper protocol inspection,
   integration testing against a controlled local provider, another synthetic
   attack-and-defense lab, or a learning module? Why?
5. If you could change one thing before using this again, what would it be?

Record the participant's language accurately where permission is given; mark
quotes as quotes and keep moderator interpretation separate.

## Observation rubric

Score each task immediately using the same scale:

| Score | Result | Definition |
|---:|---|---|
| 2 | Independent | Reaches a materially correct outcome without a substantive hint. |
| 1 | Recovered | Reaches a materially correct outcome after one neutral prompt or minor setup help. |
| 0 | Not completed | Does not reach a materially correct outcome, or requires the facilitator to explain the answer. |

Also record:

- elapsed time (approximate is sufficient);
- first point of hesitation or wrong turn;
- every prompt/hint and whether it changed the outcome;
- which screen/event/field the participant relied on;
- their explanation in their own words;
- boundary understanding: **accurate**, **partial**, **incorrect**, or **not expressed**;
- self-reported confidence from 1 (guessing) to 5 (very sure);
- setup/accessibility issues that may have affected the task.

Do not convert confidence into correctness. A confident incorrect conclusion is
still an important observation.

## Draft decision thresholds

These thresholds are provisional and need product-owner signoff before field
sessions. With five participants they are directional decision rules, not
statistical tests.

### Continue the combined workbench-and-lab direction

Recommend **continue** when all are true:

- At least **4 of 5** participants score 2 on Task A or the agreed core task.
- At least **4 of 5** accurately explain the selected tool's simulation or
  inspection boundary without facilitator correction.
- At least **3 of 5** independently connect inspection to a useful diagnostic,
  mitigation, or verification task they would repeat.
- No recurring safety misunderstanding suggests that users are likely to use
  synthetic output as proof of real-world security.

### Revise and retest

Recommend **revise** when 2–3 participants independently complete the core task,
when several participants need the same hint, or when users value only one
surface (for example, offline inspection) and do not see value in the combined
loop. State what should change and which task should be retested.

### Pause or narrow the direction

Recommend **pause/narrow** when 0–1 participants complete the core task, when
most participants cannot tell what the tool has and has not verified, or when
the feature users most need would require a safety boundary the project cannot
define. A safety misunderstanding is a reason to improve labeling even if the
feature otherwise tests well.

### Inconclusive

Use **inconclusive** if setup failures, participant mismatch, or inconsistent
task exposure prevent a fair comparison. Fix the study and recruit a better-fit
sample before making a product-direction claim.

## Participant scorecard

Copy this section once per participant. Use a participant code only.

```text
Participant code:
Relevant experience (broad category only):
Authentication work/study frequency:
Prior familiarity with this project/tool:
Setup issues:

Task A: score (0/1/2) / time / hesitation / prompts / evidence relied on:
Task A explanation (observed words):
Task A interpretation (moderator inference):

Task B: score (0/1/2) / time / chosen scenario / prompts / evidence relied on:
Task B explanation (observed words):
Task B interpretation (moderator inference):

Task C tool tested (JWT / HTTP / SAML):
Task C: score (0/1/2) / time / boundary understanding / prompts:

Confidence by task (1–5):
Useful part and why:
Main confusion or missing capability:
Next capability requested (participant wording):
Safety/boundary misunderstanding:
Other observations (separate observation from inference):
```

## Synthesis and decision record

After the sessions, summarize counts alongside examples; do not report only
averages. Compare patterns by participant segment and task. Include negative and
contradictory evidence. Keep observed actions, participant statements, and
moderator interpretation in separate sections.

```text
Sessions completed / planned:
Participant mix and limitations:
Task A scores (0/1/2):
Task B scores (0/1/2):
Task C coverage and scores:
Boundary-understanding results:
Repeated friction points (with participant codes):
Repeated value signals (with participant codes):
Conflicting evidence:
Most requested next capability:
Recommendation: continue / revise / pause-narrow / inconclusive
Evidence for recommendation:
What would change this recommendation:
Product-owner decision and date:
```

## Evidence and implementation basis

- Current app tool selection and workflow: `web/src/main.tsx`.
- OAuth scenarios and event inspection: `web/src/main.tsx` and
  `web/src/protocols/oauth.ts`.
- JWT local-only and non-verification boundary:
  `web/src/components/JwtInspector.tsx`.
- HTTP offline inspection boundary:
  `web/src/components/RequestInspector.tsx` and
  `docs/architecture/protocols/http-inspector.md`.
- SAML replay simulation boundary: `web/src/components/SamlReplayLab.tsx` and
  `docs/architecture/protocols/saml-replay-lab.md`.
- Product personas: `docs/product/personas.md`.

No participant sessions or external validation have been performed as part of
creating this guide.
