# Product Requirements Document (PRD) — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16
**Author:** Heesoo (Solo Developer)

---

## 1. Problem Statement

Current AI study tools (ChatGPT Learning Mode, Google Learning Guide, NotebookLM) operate in a teacher-to-student paradigm — the AI explains, the user absorbs. This creates **false confidence**: students feel they understand material after reading AI-generated explanations, but discover during exams that their understanding was shallow. There is no mainstream tool that tests **depth of understanding through explanation ability** — the Feynman Technique principle that if you can teach a concept clearly, you truly understand it.

---

## 2. Solution Overview

A 3-agent AI system where the user **teaches** a topic to an AI "student" (Tutee), and the system grades the user's teaching effectiveness against a ground-truth source. The act of teaching reveals gaps in the user's own understanding.

### Agent Architecture

| Agent | Role | Visibility to User |
|-------|------|--------------------|
| **Oracle** | Parses uploaded source material. Produces: (a) topic outline (subtopic names only) for the Tutee, (b) answer key + test questions for the Grader. | Hidden |
| **Tutee** | Engages user in free-form teaching dialogue. Asks clarifying questions. Absorbs everything taught (right or wrong). Nudges user about uncovered subtopics from the outline. Has zero content knowledge — only knows subtopic names. | Visible (chat partner) |
| **Grader** | After teaching ends, administers test questions to the Tutee. Tutee answers based only on what was taught. Grader scores against Oracle's answer key and produces a report. | Visible (report output) |

---

## 3. User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a student, I want to upload my lecture notes (PDF or text) so the system has a ground-truth source to evaluate my teaching against. | Must-Have |
| US-02 | As a student, I want to specify which subtopic I'm going to teach so the system scopes the evaluation to that area. | Must-Have |
| US-03 | As a student, I want to teach the AI tutee through a free-form chat so I can explain concepts in my own words. | Must-Have |
| US-04 | As a student, I want the tutee to ask me clarifying questions so the conversation feels like real teaching and pushes me to explain more deeply. | Must-Have |
| US-05 | As a student, I want the tutee to nudge me if I haven't covered a subtopic from the source (e.g., "You haven't mentioned X — are we skipping it?") so I don't accidentally miss areas. | Must-Have |
| US-06 | As a student, I want to click "I'm done teaching" to end the session and trigger the grading process. | Must-Have |
| US-07 | As a student, I want to see a grading report showing which test questions the tutee got right vs. wrong, so I can identify exactly where my understanding has gaps. | Must-Have |
| US-08 | As a student, I want the report to map wrong answers back to what I missed or explained incorrectly, so the feedback is actionable — not just a score. | Should-Have |

---

## 4. Functional Requirements

### 4.1 Source Upload & Processing
- FR-01: System accepts PDF file upload (single file).
- FR-02: System accepts plain text input via a text paste box.
- FR-03: User can select/type the subtopic they want to teach from the uploaded source.
- FR-04: Oracle agent parses the source and extracts content relevant to the specified subtopic.
- FR-05: Oracle generates a **topic outline** (subtopic names only, no content details) and sends it to the Tutee agent.
- FR-06: Oracle generates an **answer key** (expected correct answers) and a set of **test questions** scoped to the subtopic, and sends them to the Grader agent.
- FR-21: System validates that the source text is at least **500 characters** long. Sources shorter than this are rejected with a user-friendly error message, as they are unlikely to produce meaningful test questions.
- FR-22: System validates that the Oracle generates at least **3 test questions**. If fewer are generated, the source/topic combination is rejected with a user-friendly error, as the grading report would not be meaningful.

### 4.2 Teaching Session (Chat)
- FR-07: Tutee engages in free-form conversational chat with the user.
- FR-08: Tutee asks clarifying questions when the user's explanation is vague or incomplete based on what was said (not based on outside knowledge).
- FR-09: Tutee responds with acknowledgment ("I understand", "Got it") when the explanation is clear and it has no questions.
- FR-10: Tutee **never** corrects the user, **never** fills in gaps from its own knowledge, and **never** references information outside of what the user has explicitly said in the session.
- FR-11: Tutee absorbs all information taught, including incorrect information, without pushback.
- FR-12: Tutee tracks which subtopics from the Oracle's outline have been covered vs. uncovered.
- FR-13: If the user has not addressed a subtopic, the Tutee can prompt: "You haven't mentioned [subtopic name] — are we not covering this for now?"
- FR-14: User can end the teaching session by clicking an "I'm Done Teaching" button.

### 4.3 Grading & Report
- FR-15: After the session ends, the Grader administers the Oracle's test questions to the Tutee.
- FR-16: The Tutee answers each test question based **solely** on what was taught during the session — no outside knowledge.
- FR-17: The Grader compares the Tutee's answers against the Oracle's answer key and produces a score.
- FR-18: The Grader generates a **grading report** that includes:
  - Overall score (e.g., 7/10 questions correct)
  - Per-question breakdown: question text, Tutee's answer, correct answer, and whether it was right/wrong
  - Mapping of wrong answers to identified gaps (what the user missed or explained incorrectly)
- FR-19: The grading report is displayed to the user as the final screen.
- FR-20: Session ends after the report is shown (no re-teach loop in MVP).

---

## 5. Non-Functional Requirements

- NFR-01: **Response Time** — Tutee should respond within 3 seconds during the teaching chat to maintain conversational flow.
- NFR-02: **Source Processing** — Oracle should process a PDF (up to ~30 pages) and generate the topic outline + test questions within 15 seconds.
- NFR-03: **Knowledge Isolation** — The Tutee must demonstrate zero knowledge leakage. This is the most critical non-functional requirement. System prompts must aggressively enforce that the Tutee only uses information from the current teaching session.
- NFR-04: **Grading Accuracy** — The Grader's comparison of Tutee answers vs. Oracle answer key should handle paraphrased answers (semantic similarity, not exact string matching).
- NFR-05: **Single Session** — The MVP operates as a single-session tool. No user accounts, no saved history, no persistent state between sessions.

---

## 6. Features Out (Anti-Scope) — NOT Building for MVP

| Feature | Reason |
|---------|--------|
| User accounts / authentication | No persistent state needed for hackathon demo |
| Re-teach loop (go back and teach missed topics) | V2 feature — adds significant complexity |
| Multi-document upload | One source at a time is sufficient for MVP |
| Image/diagram parsing from PDFs | Text extraction only — image understanding adds LLM complexity |
| Multiple subtopic selection per session | One subtopic per session keeps the scope clean |
| Tutee personality customization | Single "eager naive student" persona for MVP |
| Export/share grading report | View-only in the app for MVP |
| Mobile-responsive design | Desktop browser only for hackathon demo |
| Multi-language support | English only |
| Real-time collaboration (multiple users teaching) | Solo teaching experience only |

---

## 7. Success Metrics (Hackathon Context)

Since this is a hackathon project, success metrics are demo-oriented rather than business-oriented:

| Metric | Target |
|--------|--------|
| **End-to-end flow works** | User can upload → teach → receive a grading report in one session |
| **Knowledge isolation holds** | Tutee demonstrably does not leak outside knowledge during a demo |
| **Grading report is actionable** | Report clearly shows *what* was missed, not just a score |
| **Demo time** | Full flow completes within 3–5 minutes for a hackathon demo |
| **Judge comprehension** | A non-technical judge understands the concept within 30 seconds of the pitch |
