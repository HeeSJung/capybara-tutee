# API Specification — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16

---

## Overview

Three **stateless** API endpoints power the three agents. All routes are Next.js API routes (server-side). No external API gateway. No authentication (NFR-05: no user accounts in MVP). **The backend maintains no session state** — the client sends relevant state slices with each request (see §5 in `07_Technical_Design_Document.md`).

**Base URL:** `/api`

---

## Endpoints

### 1. POST `/api/process-source`

**Purpose:** Upload source material and specify subtopic. Triggers the Oracle agent to parse the source and generate topic outline + test questions.

**Request:**

Content-Type: `multipart/form-data` (for PDF) or `application/json` (for text)

```typescript
// Option A: PDF upload (multipart/form-data)
{
  file: File,                    // PDF file (max 10MB)
  subtopic: string               // e.g., "Photosynthesis"
}

// Option B: Text paste (application/json)
{
  sourceText: string,            // Pasted text content
  subtopic: string               // e.g., "Photosynthesis"
}
```

**Response:** `200 OK`

```typescript
{
  topicOutline: string[],        // Subtopic names the Tutee will know
  subtopic: string,              // Echoed back for confirmation
  testQuestions: TestQuestion[],  // Questions for grading (client stores these)
  answerKey: AnswerKeyEntry[],   // Expected answers (client stores these)
  questionCount: number          // How many test questions were generated
}
```

**Important:** The client stores `testQuestions` and `answerKey` in React Context. These are sent back to `/api/grade` when the user finishes teaching. The server does not retain any state between calls.

**Validation:** If the Oracle generates fewer than 3 questions, the endpoint returns a 422 error (see FR-22). This prevents low-quality grading sessions from sources that are too short or off-topic.

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | No source text or file provided | `{ error: "Please upload a PDF or paste your notes." }` |
| 400 | Subtopic not specified | `{ error: "Please specify a subtopic to teach." }` |
| 400 | Source text too short (<500 chars) | `{ error: "Your source material is too short. Please provide more detailed notes (at least a few paragraphs)." }` |
| 422 | PDF parsing failed | `{ error: "We couldn't read your PDF. Try pasting the text directly." }` |
| 422 | Oracle couldn't find subtopic in source | `{ error: "We couldn't find that topic in your source material. Try a different topic." }` |
| 422 | Oracle generated fewer than 3 questions | `{ error: "We couldn't generate enough questions from this source. Try a more detailed source or a broader subtopic." }` |
| 500 | LLM API error | `{ error: "Something went wrong. Please try again." }` |

**Processing Time:** 5-15 seconds (NFR-02). Show loading indicator on frontend.

---

### 2. POST `/api/chat`

**Purpose:** Send a user message to the Tutee agent and receive a streamed response.

**Request:** `application/json`

```typescript
{
  message: string,                      // User's teaching message
  conversationHistory: Message[],       // Full conversation so far (from client state)
  topicOutline: string[],              // Subtopic names from Oracle (from client state)
  coveredSubtopics: string[]           // Subtopics covered so far (from client state)
}
```

**Note:** No `sessionId` — the server is stateless. All context needed by the Tutee agent is sent in each request.

**Response:** `text/event-stream` (Server-Sent Events)

The response is streamed as SSE events for real-time display:

```
event: token
data: {"token": "What "}

event: token
data: {"token": "do "}

event: token
data: {"token": "you "}

event: token
data: {"token": "mean "}

event: token
data: {"token": "by that?"}

event: done
data: {
  "message": "What do you mean by that?",
  "state": "confused",
  "coveredSubtopics": ["Light reactions"],
  "uncoveredSubtopics": ["Calvin cycle", "Chlorophyll", "ATP synthesis"]
}
```

**SSE Event Types:**

| Event | Data | Description |
|-------|------|-------------|
| `token` | `{ token: string }` | Incremental text token for streaming display |
| `done` | `{ message, state, coveredSubtopics, uncoveredSubtopics }` | Final complete response with metadata |
| `error` | `{ error: string }` | Error during processing |

**Tutee State Values:**

| State | When |
|-------|------|
| `idle` | Default / waiting for input (also used for "happy" with CSS bounce) |
| `thinking` | Capy is processing the user's explanation |
| `confused` | Capy is asking a clarifying question |
| `test-taking` | Capy is answering test questions (S4) |

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing message or conversationHistory | `{ error: "Invalid request." }` |
| 400 | Message exceeds 5000 characters | `{ error: "Message is too long. Please keep it under 5000 characters." }` |
| 500 | LLM API error | `{ error: "Connection lost. Please retry." }` |

**Latency Target:** First token within 1 second, full response within 3 seconds (NFR-01).

---

### 3. POST `/api/grade`

**Purpose:** Trigger the grading pipeline. The Grader administers test questions to the Tutee and evaluates answers in a **batched 2-step pipeline** (2 total LLM calls).

**Request:** `application/json`

```typescript
{
  conversationHistory: Message[],      // Full teaching conversation (from client state)
  testQuestions: TestQuestion[],       // Oracle's test questions (from client state)
  answerKey: AnswerKeyEntry[]          // Oracle's answer key (from client state)
}
```

**Note:** No `sessionId` — the server is stateless. All data needed for grading is sent in the request.

**Response:** `text/event-stream` (Server-Sent Events)

Grading involves 2 batched LLM calls. Progress is streamed:

```
event: progress
data: {"current": 1, "total": 7, "phase": "testing"}

event: progress
data: {"current": 2, "total": 7, "phase": "testing"}

...

event: progress
data: {"current": 7, "total": 7, "phase": "evaluating"}

event: done
data: {
  "overallScore": 5,
  "totalQuestions": 7,
  "percentage": 71,
  "questionResults": [
    {
      "questionId": "q1",
      "question": "What is photosynthesis?",
      "tuteeAnswer": "It's the process where plants use sunlight to make energy.",
      "expectedAnswer": "Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose, using carbon dioxide and water.",
      "isCorrect": true,
      "gap": null
    },
    {
      "questionId": "q2",
      "question": "What role does chlorophyll play in photosynthesis?",
      "tuteeAnswer": "I'm not sure, this wasn't really covered in our conversation.",
      "expectedAnswer": "Chlorophyll is the green pigment that absorbs light energy to drive the light-dependent reactions.",
      "isCorrect": false,
      "gap": "You didn't explain chlorophyll's role in absorbing light energy. The tutee had no knowledge of this pigment's function."
    }
  ]
}
```

**SSE Event Types:**

| Event | Data | Description |
|-------|------|-------------|
| `progress` | `{ current, total, phase }` | Progress update for S4 screen |
| `done` | `GradingResult` (full JSON) | Final grading report |
| `error` | `{ error: string }` | Error during grading |

**Progress Phases:**

| Phase | Description |
|-------|-------------|
| `testing` | Tutee is answering test questions |
| `evaluating` | Grader is scoring answers |

**Error Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing conversationHistory, testQuestions, or answerKey | `{ error: "Invalid request." }` |
| 400 | Conversation history is empty | `{ error: "No teaching conversation found. Please teach before grading." }` |
| 500 | LLM API error | `{ error: "Something went wrong while grading. Please retry." }` |

**Processing Time:** ~5-10 seconds (batched: 1 LLM call for Tutee test-answering + 1 LLM call for Grader evaluation). Progress bar still shown for UX.

---

## Request/Response Summary

```
┌──────────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│  /api/process-source │     │    /api/chat        │     │   /api/grade     │
│                      │     │                     │     │                  │
│  IN:  source + topic │     │  IN:  message +     │     │  IN:  convHist + │
│  OUT: topicOutline,  │     │       convHistory + │     │       testQs +   │
│       testQuestions,  │     │       topicOutline +│     │       answerKey  │
│       answerKey       │     │       coveredSubs   │     │  OUT: SSE stream │
│                      │     │  OUT: SSE stream    │     │       progress → │
│  Called: once        │     │       (tokens →     │     │       grading    │
│  Timing: 5-15s       │     │        done event)  │     │       result     │
│                      │     │                     │     │                  │
│  Client stores ALL   │     │  Called: many times  │     │  Called: once    │
│  outputs in state    │     │  Timing: <3s each   │     │  Timing: 5-10s   │
│                      │     │  Stateless: client  │     │  Batched: 2 LLM  │
│                      │     │  sends full context │     │  calls total     │
└──────────────────────┘     └────────────────────┘     └──────────────────┘
```

---

## CORS & Security Notes

- **No CORS needed:** API routes run on the same origin as the frontend (Next.js monolith).
- **No auth needed:** No user accounts in MVP (NFR-05).
- **API key security:** `ANTHROPIC_API_KEY` is server-side only (never exposed to client). Next.js API routes run server-side.
- **Input validation:** Sanitize source text input. Cap file upload at 10MB. Cap message length at 5000 characters.
- **Rate limiting:** Not needed for hackathon demo. Add if deploying publicly post-hackathon.
