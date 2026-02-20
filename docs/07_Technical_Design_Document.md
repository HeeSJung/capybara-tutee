# Technical Design Document (TDD) — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16
**Author:** Heesoo (Solo Developer)

---

## 1. Architecture Overview

Feynman's Mirror is a **monolithic Next.js application** with three LLM-powered agents coordinated through server-side API routes. The system follows a **pipeline architecture**: Oracle → Tutee → Grader, with each agent receiving scoped inputs and producing structured outputs.

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (React)                       │   │
│  │  S1: Upload → S2: Topic → S3: Teaching → S4: Test → S5   │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │ API calls                           │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │                  API ROUTES (Server-side)                 │   │
│  │                                                           │   │
│  │  POST /api/process-source   → Oracle Agent                │   │
│  │  POST /api/chat             → Tutee Agent                 │   │
│  │  POST /api/grade            → Grader Agent                │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │              LLM PROVIDER (Anthropic Claude)              │   │
│  │                                                           │   │
│  │  Oracle: Claude 3.5 Sonnet (source parsing, Q generation) │   │
│  │  Tutee:  Claude 3.5 Sonnet (conversation, knowledge iso.) │   │
│  │  Grader: Claude 3.5 Sonnet (answer evaluation, scoring)   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              CLIENT-SIDE STATE (React Context)             │   │
│  │  (No database, no server memory — client is source of     │   │
│  │   truth. Relevant state slices sent with each API call.)   │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Architecture

- **Monolithic Next.js:** Single codebase, single deployment. No microservices overhead for a 48-hour hackathon. API routes run server-side, so LLM API keys stay secure.
- **No database, no server-side session store:** NFR-05 specifies single-session, no persistence. Rather than an in-memory `Map` (which won't survive Vercel serverless cold starts / function instance rotation), the **client (React Context) is the source of truth** for all session state. Each API call includes the relevant state slice (e.g., conversation history, topic outline). This makes the backend fully stateless and resilient to Vercel's serverless architecture.
- **Claude for all agents:** Consistent API, strongest system prompt adherence for knowledge isolation (NFR-03). Can switch individual agents to OpenAI if needed.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 (App Router) | React frontend + API routes in one project. App Router for modern patterns. Latest stable release. |
| **Language** | TypeScript | Type safety for agent message schemas, catch errors early. |
| **Styling** | Tailwind CSS | Utility-first, fast to build with. Custom config for Warm Classroom palette. |
| **Font** | Nunito (Google Fonts) | Rounded, playful — matches design system. |
| **LLM SDK** | Anthropic JS SDK (`@anthropic-ai/sdk`) | Official SDK, streaming support, typed responses. |
| **PDF Parsing** | `pdf-parse` (npm) | Extract text from uploaded PDFs. Lightweight, no native deps. |
| **File Upload** | Next.js built-in (FormData) | Handle multipart form uploads in API routes. |
| **State Management** | React Context + `useState` | Simple client-side state. No Redux needed for 5 screens. |
| **Deployment** | Vercel (free tier) | One-click deploy from GitHub. Edge functions for API routes. |
| **Version Control** | Git + GitHub | Standard. Also used for Vercel deployment. |

### Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^18",
    "react-dom": "^18",
    "@anthropic-ai/sdk": "^0.30",
    "pdf-parse": "^1.1",
    "tailwindcss": "^3.4"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18",
    "@types/node": "^20"
  }
}
```

---

## 3. Agent Design

### 3.1 Oracle Agent

**Purpose:** Parse the uploaded source material and generate structured outputs scoped to the user's chosen subtopic.

**Input:**
- Raw text extracted from PDF or pasted text
- User-specified subtopic (e.g., "Photosynthesis")

**Output (structured JSON):**
```typescript
interface OracleOutput {
  topicOutline: string[];        // Subtopic names only, e.g. ["Light reactions", "Calvin cycle", ...]
  testQuestions: TestQuestion[];  // 5-10 questions scoped to the subtopic
  answerKey: AnswerKeyEntry[];   // Expected correct answers
}

interface TestQuestion {
  id: string;
  question: string;
}

interface AnswerKeyEntry {
  questionId: string;
  expectedAnswer: string;        // The correct answer based on the source
  sourceExcerpt: string;         // Relevant excerpt from the source material
}
```

**System Prompt Strategy:**
- Instruct Oracle to extract ONLY from the provided source text
- Generate questions that test conceptual understanding, not rote recall
- Produce answer keys that allow for paraphrased correct answers (provide key concepts, not exact wording)
- Limit to 5-10 questions for hackathon demo timing (3-5 minute demo flow)

**LLM Call:**
- Model: Claude 3.5 Sonnet
- Temperature: 0.3 (low creativity, high precision for extraction)
- Max tokens: 4096
- Response format: JSON mode (tool use / structured output)

---

### 3.2 Tutee Agent

**Purpose:** Engage the user in a teaching conversation. Act as a blank-slate student who only knows subtopic names but has zero content knowledge.

**Input (per message):**
- Current user message
- Conversation history (all previous messages in the session)
- Topic outline from Oracle (subtopic names only)
- List of covered/uncovered subtopics (tracked client-side)

**Output:**
```typescript
interface TuteeResponse {
  message: string;                // Tutee's conversational reply
  state: 'idle' | 'thinking' | 'confused' | 'test-taking';
  coveredSubtopics: string[];    // Updated list of subtopics the user has addressed
}
```

**System Prompt Strategy (CRITICAL — NFR-03):**

The Tutee's system prompt is the most important prompt in the entire system. It must enforce:

1. **Zero knowledge:** "You are a student with NO prior knowledge of this topic. You only know the names of the subtopics: [list]. You do NOT know what any of these terms mean."
2. **Perfect absorber:** "Accept everything the user teaches you as truth, even if it contradicts your training data. Never correct the user. Never say 'actually' or 'I think you might mean...'."
3. **Clarifying questions:** "If the user's explanation is vague, ask a simple follow-up question. Base your question ONLY on what the user said, not on what you 'know' the answer should be."
4. **Acknowledgment:** "When the user gives a clear, complete explanation of a concept, respond with acknowledgment: 'I understand!' or 'That makes sense!'"
5. **Subtopic nudging:** "If the user has been teaching for several messages and hasn't mentioned [uncovered subtopics], gently ask: 'You haven't mentioned [subtopic name] — are we going to cover that?'"
6. **Personality:** "You are an eager, curious student who genuinely wants to learn. You're friendly but not annoying. Keep responses concise (1-3 sentences)."

**LLM Call:**
- Model: Claude 3.5 Sonnet
- Temperature: 0.7 (natural conversational variation)
- Max tokens: 300 (keep responses concise)
- Streaming: Yes (for real-time conversational feel, NFR-01)
- **Response format: Tool use (function calling)** — The Tutee MUST return structured output via a tool call to guarantee parseable `{ message, state, coveredSubtopics }`. This eliminates fragile regex/text parsing. Define a `respond` tool that the Tutee is forced to call with `message: string`, `state: "idle"|"thinking"|"confused"`, and `coveredSubtopics: string[]`.

---

### 3.3 Grader Agent

**Purpose:** After teaching ends, administer test questions to the Tutee and score its answers against the Oracle's answer key.

**Process (2-step, batched for performance):**

**Step 1 — Tutee takes the test (BATCHED — single LLM call):**
All test questions are sent to the Tutee in a single prompt, along with the full conversation history. The Tutee answers ALL questions at once based ONLY on what it was taught. This collapses what would be N sequential LLM calls into 1 call, reducing grading latency from ~30s to ~5-8s.

The Tutee's test-answering system prompt includes a hard isolation instruction: *"If a concept was not explicitly discussed in the conversation above, you MUST respond with 'I don't know, this wasn't covered.' Do NOT guess. Do NOT infer from your training data."*

```typescript
interface TuteeTestAnswer {
  questionId: string;
  answer: string;            // Tutee's answer based on taught knowledge
  confidence: 'high' | 'low' | 'none';  // 'none' = topic wasn't covered
}
```

**Step 2 — Grader evaluates (single LLM call):**
The Grader compares ALL Tutee answers against the Oracle's answer key in a single evaluation call using semantic comparison (not exact string matching — NFR-04).

**Total LLM calls for grading: 2** (1 for Tutee test-answering + 1 for Grader evaluation). This keeps the entire grading pipeline well within Vercel's serverless function timeout limits.

```typescript
interface GradingResult {
  overallScore: number;          // e.g., 7
  totalQuestions: number;        // e.g., 10
  questions: QuestionResult[];
}

interface QuestionResult {
  questionId: string;
  question: string;
  tuteeAnswer: string;
  expectedAnswer: string;
  isCorrect: boolean;
  gap?: string;                  // If wrong: what the user missed or explained incorrectly
}
```

**System Prompt Strategy:**
- "You are a fair but strict grader. Compare the student's answer against the expected answer."
- "The student's answer does NOT need to match word-for-word. If the core concepts are present and correct, mark it as correct."
- "If the student's answer is wrong or incomplete, explain what specific concept was missing from the user's teaching."
- "Be constructive in gap descriptions — frame them as 'the teacher didn't cover X' not 'the student failed.'"

**LLM Call:**
- Model: Claude 3.5 Sonnet
- Temperature: 0.2 (high precision for evaluation)
- Max tokens: 2048
- Response format: JSON mode

---

## 4. Data Flow

```
USER UPLOADS SOURCE + SELECTS TOPIC
        │
        ▼
┌──────────────────────────────┐
│  POST /api/process-source    │
│                              │
│  1. Extract text from PDF    │
│     (pdf-parse) or use       │
│     pasted text directly     │
│                              │
│  2. Call Oracle Agent        │
│     Input: source text +     │
│            subtopic name     │
│     Output: topicOutline,    │
│             testQuestions,    │
│             answerKey         │
│                              │
│  3. Store in session:        │
│     - topicOutline → Tutee   │
│     - testQuestions +        │
│       answerKey → Grader     │
│                              │
│  4. Return topicOutline      │
│     to frontend              │
└──────────────┬───────────────┘
               │
               ▼
USER TEACHES (MULTIPLE MESSAGES)
        │
        ▼
┌──────────────────────────────┐
│  POST /api/chat              │  ← Called for each user message
│                              │
│  Input (from client state):  │
│    message,                  │
│    conversationHistory,      │
│    topicOutline,             │
│    coveredSubtopics          │
│                              │
│  1. Call Tutee Agent         │
│     (tool_use for structured │
│      output — see §3.2)      │
│     Output: { message,       │
│       state, coveredTopics } │
│                              │
│  2. Return tuteeResponse     │
│     (streamed) to frontend   │
│                              │
│  3. CLIENT appends both      │
│     user + tutee messages    │
│     to its local state       │
└──────────────┬───────────────┘
               │
               ▼
USER CLICKS "I'M DONE TEACHING"
        │
        ▼
┌──────────────────────────────┐
│  POST /api/grade             │
│                              │
│  Input: conversationHistory, │
│         testQuestions,        │
│         answerKey (all from  │
│         client-side state)   │
│                              │
│  1. BATCHED Tutee test:      │
│     Send ALL questions +     │
│     conversation history     │
│     in ONE LLM call.         │
│     Tutee answers all Qs     │
│     from taught knowledge.   │
│     (Hard "I don't know"     │
│      rule for uncovered      │
│      topics — NFR-03)        │
│                              │
│  2. BATCHED Grader eval:     │
│     Send all tuteeAnswers +  │
│     answerKey in ONE LLM     │
│     call. Grader evaluates   │
│     and produces             │
│     gradingResult.           │
│                              │
│  3. Return gradingResult     │
│     to frontend              │
│                              │
│  Total: 2 LLM calls          │
│  Latency: ~5-10s             │
└──────────────────────────────┘
```

---

## 5. Session State Management

### Client-Side as Source of Truth (No Server-Side Session Store)

The backend is **fully stateless**. There is no `Map`, no database, no server-side session object. All session state lives in the **client (React Context)** and relevant slices are sent with each API call. This architecture survives Vercel serverless cold starts and function instance rotation.

```typescript
// ============================================================
// CLIENT STATE — React Context (single source of truth)
// ============================================================

interface AppState {
  currentScreen: 'upload' | 'topic' | 'teaching' | 'testing' | 'report';

  // S1 data
  sourceFile: File | null;
  sourceText: string;

  // S2 data (populated from /api/process-source response)
  subtopic: string;
  topicOutline: string[];
  testQuestions: TestQuestion[];   // Stored client-side, sent to /api/grade
  answerKey: AnswerKeyEntry[];     // Stored client-side, sent to /api/grade

  // S3 data (accumulated locally during teaching)
  conversationHistory: Message[];
  tuteeState: TuteeState;
  coveredSubtopics: string[];

  // S4 data
  gradingProgress: { current: number; total: number };

  // S5 data
  gradingResult: GradingResult | null;
}
```

### What Each API Receives from the Client

| Endpoint | Client Sends | Server Returns |
|----------|-------------|----------------|
| `/api/process-source` | `sourceText`, `subtopic` | `topicOutline`, `testQuestions`, `answerKey` (client stores all) |
| `/api/chat` | `message`, `conversationHistory`, `topicOutline`, `coveredSubtopics` | `{ message, state, coveredSubtopics }` (client appends to history) |
| `/api/grade` | `conversationHistory`, `testQuestions`, `answerKey` | `GradingResult` (client stores for S5 display) |

### Why No Server-Side Sessions

- **Vercel serverless cold starts** rotate function instances unpredictably. An in-memory `Map<string, Session>` would lose state between requests if they hit different instances.
- **No database** is needed for a single-session hackathon MVP (NFR-05).
- The client already has all the data — sending relevant slices per request is simpler than maintaining a fragile server-side store.
- **Trade-off:** Slightly larger request payloads (~5-50KB of conversation history). Acceptable for a hackathon demo with <50 messages per session.

### Security Note

`testQuestions` and `answerKey` are stored client-side and therefore technically visible in browser DevTools. This is an accepted trade-off for hackathon scope — the user could cheat by reading the answers, but this is a study tool, not an exam proctoring system. In V2, these could be kept server-side with a session token.

---

## 6. API Specification Summary

| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/process-source` | POST | `{ sourceText, subtopic }` | `{ topicOutline, testQuestions, answerKey }` | Multipart for PDF upload. Client stores all outputs. |
| `/api/chat` | POST | `{ message, conversationHistory, topicOutline, coveredSubtopics }` | SSE stream: `{ message, state, coveredSubtopics }` | Stateless — client sends full context each call |
| `/api/grade` | POST | `{ conversationHistory, testQuestions, answerKey }` | SSE stream: `{ progress }` → final `{ gradingResult }` | Batched: 2 LLM calls total (~5-10s) |

*(Full API specification in `09_API_Specification.md`)*

---

## 7. File Structure

```
feynmans-mirror/
├── app/
│   ├── layout.tsx              # Root layout (Nunito font, Tailwind)
│   ├── page.tsx                # S1: Landing / Upload
│   ├── topic/
│   │   └── page.tsx            # S2: Topic Selection
│   ├── teach/
│   │   └── page.tsx            # S3: Teaching Chat (face-to-face)
│   ├── testing/
│   │   └── page.tsx            # S4: Test-Taking (transition)
│   ├── report/
│   │   └── page.tsx            # S5: Grading Report
│   └── api/
│       ├── process-source/
│       │   └── route.ts        # Oracle Agent endpoint
│       ├── chat/
│       │   └── route.ts        # Tutee Agent endpoint
│       └── grade/
│           └── route.ts        # Grader Agent endpoint
├── components/
│   ├── TuteeAvatar.tsx         # Tutee character with state-based sprites
│   ├── SpeechBubble.tsx        # Tutee and User speech bubbles
│   ├── ChatInput.tsx           # Message input bar
│   ├── HistoryPanel.tsx        # Collapsible conversation history
│   ├── GradingCard.tsx         # Correct/Incorrect result cards
│   ├── ProgressBar.tsx         # Test-taking progress
│   └── ScoreCircle.tsx         # Score display (7/10)
├── lib/
│   ├── agents/
│   │   ├── oracle.ts           # Oracle agent logic + prompt
│   │   ├── tutee.ts            # Tutee agent logic + prompt
│   │   └── grader.ts           # Grader agent logic + prompt
│   ├── pdf.ts                  # PDF text extraction
│   └── types.ts                # Shared TypeScript interfaces
├── public/
│   ├── tutee/
│   │   ├── idle.png            # Capy: idle/listening (also "happy" via CSS)
│   │   ├── thinking.png        # Capy: processing explanation
│   │   ├── confused.png        # Capy: didn't follow
│   │   └── test-taking.png     # Capy: answering test questions
├── tailwind.config.ts          # Custom palette (Warm Classroom)
├── package.json
└── tsconfig.json
```

---

## 8. Key Technical Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Knowledge leakage from Tutee** (NFR-03) | Critical | Aggressive system prompting + tool_use forced structured output. Hard "I don't know" isolation rule during test-answering. Test with known-wrong explanations and verify Tutee doesn't correct them. Add "knowledge isolation test" to demo prep. |
| **Oracle generates poor/too-few questions** | High | Use structured output (JSON mode) to enforce format. Provide few-shot examples in system prompt. Validate minimum 3 questions generated — reject source and show error if fewer (see FR-22). Test with 3-4 different source PDFs. |
| **Grading takes too long (many LLM calls)** | Medium | **MITIGATED:** Batched pipeline — 2 LLM calls total (1 batched Tutee test + 1 batched Grader eval). Expected latency: 5-10s. Well within Vercel serverless timeout. |
| **PDF text extraction fails** | Medium | Fallback: show error, suggest pasting text instead (FR-02 is the backup). Test with common PDF formats. |
| **Response latency > 3 seconds (NFR-01)** | Medium | Use streaming (SSE) for Tutee responses. Show typing indicator. Claude 3.5 Sonnet is fast enough for conversational responses. |
| **Client-side state loss (browser refresh)** | Medium | Accepted trade-off for hackathon MVP. State lives in React Context — refreshing loses the session. V2: persist to `sessionStorage` or `localStorage`. |
| **Request payload size (conversation history)** | Low | Cap conversation history at 50 messages (~50KB max). Acceptable for a single-session hackathon demo. |
| **Vercel free tier limits** | Low | Serverless function timeout is 10 seconds on free tier. Batched grading pipeline (~5-10s) should fit. If not, use Vercel Pro ($20/mo) or deploy to Railway/Render. |
| **Answer key visible in client DevTools** | Low | Accepted trade-off — this is a study tool, not an exam proctor. V2: keep answer key server-side with session token. |

---

## 9. Development Order (Hackathon Strategy)

Recommended build sequence for the 48-hour hackathon, prioritizing the demo-critical path:

| Phase | Hours | What to Build | Why This Order |
|-------|-------|---------------|----------------|
| 1 | 0-3 | Project setup: Next.js + Tailwind + Anthropic SDK. Tailwind config with Warm Classroom palette. | Foundation. Everything depends on this. |
| 2 | 3-6 | Oracle agent: `/api/process-source`. Test with a sample PDF. | This produces the data all other agents need. |
| 3 | 6-10 | Tutee agent: `/api/chat`. Test knowledge isolation in terminal first. | Core experience. Most complex agent prompt. |
| 4 | 10-13 | S1 (Upload) + S2 (Topic) screens. Wire up to Oracle API. | Get the first two screens working end-to-end. |
| 5 | 13-18 | S3 (Teaching Chat) with face-to-face UI. Tutee avatar, speech bubbles, input. | The hero screen. Spend the most time here. |
| 6 | 18-22 | Grader agent: `/api/grade`. Test grading pipeline. | Completes the backend pipeline. |
| 7 | 22-26 | S4 (Test-Taking) + S5 (Grading Report). Wire up to Grader API. | End-to-end flow now works. |
| 8 | 26-30 | Polish: animations, error states, edge cases. | Make it demo-ready. |
| 9 | 30-34 | Full end-to-end testing with real content. Fix bugs. | Catch breaking issues before demo. |
| 10 | 34-36 | Deploy to Vercel. Prepare demo script. | Live URL for judges. |
| — | 36-48 | Buffer for unexpected issues, sleep, meals. | Reality of a solo hackathon. |

---

## 10. Environment Variables

```env
# .env.local (never commit this)
ANTHROPIC_API_KEY=sk-ant-...
```

Only one secret needed. No database credentials, no OAuth tokens. Minimal attack surface.
