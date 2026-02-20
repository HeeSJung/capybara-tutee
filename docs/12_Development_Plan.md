# Development Plan — Feynman's Mirror

**Project:** Feynman's Mirror
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-20
**Author:** Heesoo (Solo Developer)

---

## Build Sequence Overview

No time-boxing — just the correct dependency order. Each step lists exactly what it produces, what it depends on, and how to verify it works before moving on.

```
Step 0: Scaffold
  └→ Step 1: Types + Context
       ├→ Step 2: Oracle API ──────────────────────┐
       │    └→ Step 4: S1 + S2 (wire to Oracle)    │
       ├→ Step 3: Tutee API ───┐                    │
       │                       ├→ Step 6: S3 (hero) │
       └→ Step 5: Capy + UI ──┘                    │
                                                    │
                               Step 7: Grader API ◄─┘
                                 └→ Step 8: S4 + S5
                                      └→ Step 9: Polish
                                           └→ Step 10: Deploy
```

**Parallelizable:** Steps 2, 3, 5 have no cross-dependencies and can overlap.

---

## Step 0: Project Scaffolding

**Depends on:** Nothing
**Produces:**
- `package.json` — next 15, react 18, @anthropic-ai/sdk, pdf-parse, tailwindcss
- `tsconfig.json`
- `tailwind.config.ts` — full Warm Classroom palette (all tokens from doc 06)
- `app/layout.tsx` — root layout with Nunito font import, global Tailwind, cream background
- `app/globals.css` — Tailwind directives + CSS variables for design system tokens
- `.env.local` — `ANTHROPIC_API_KEY` placeholder
- `.gitignore`

**Verify:** `npm run dev` starts without errors. Blank cream page loads at localhost:3000.

---

## Step 1: Shared Types + Session Context

**Depends on:** Step 0
**Produces:**
- `lib/types.ts` — All interfaces:
  - `AppState`, `ScreenName`
  - `OracleOutput`, `TestQuestion`, `AnswerKeyEntry`
  - `Message`, `TuteeState`, `TuteeResponse`
  - `TuteeTestAnswer`, `GradingResult`, `QuestionResult`
- `lib/session-context.tsx` — React Context with:
  - `AppState` as the store
  - `SessionProvider` wrapper component
  - `useSession()` hook
  - Dispatcher actions for screen transitions and state updates
- Wire `SessionProvider` into `app/layout.tsx`

**Verify:** `useSession()` returns default `AppState` in any child component. No TypeScript errors.

---

## Step 2: Oracle Agent (Backend)

**Depends on:** Step 1 (types)
**Produces:**
- `lib/agents/oracle.ts` — System prompt + Claude API call with structured JSON output. Takes `sourceText` + `subtopic` → returns `{ topicOutline, testQuestions, answerKey }`. Validates: reject if <3 questions generated (FR-22).
- `lib/pdf.ts` — PDF text extraction wrapper using `pdf-parse`
- `app/api/process-source/route.ts` — POST handler. Accepts multipart (PDF) or JSON (text). Validates source ≥500 chars (FR-21). Calls Oracle. Returns structured response.

**Verify:** `curl` with sample text + subtopic → valid JSON with `topicOutline` (array of strings), `testQuestions` (5-10 questions with IDs), `answerKey` (matching entries with excerpts).

---

## Step 3: Tutee Agent (Backend)

**Depends on:** Step 1 (types)
**Produces:**
- `lib/agents/tutee.ts` — System prompt (6-point knowledge isolation from doc 07 §3.2) + Claude API call using **tool_use** to force structured `{ message, state, coveredSubtopics }` output. Streaming support via SSE.
- `app/api/chat/route.ts` — POST handler. Receives `{ message, conversationHistory, topicOutline, coveredSubtopics }` from client. Returns SSE stream: token events + final `done` event with structured metadata.

**Verify:** Simulate multi-turn conversation via curl/script. Confirm:
1. Tutee never corrects the user (even with wrong info)
2. Tutee asks clarifying questions for vague explanations
3. `coveredSubtopics` updates correctly per exchange
4. `state` values (`idle` / `thinking` / `confused`) make sense contextually

---

## Step 4: S1 (Upload) + S2 (Topic Selection) Screens

**Depends on:** Step 2 (Oracle API)
**Produces:**
- `app/page.tsx` — S1: Landing/Upload screen
  - PDF upload (drag & drop) + text paste box
  - "Continue →" button
  - Validation: error for no input, error for source too short (<500 chars)
- `app/topic/page.tsx` — S2: Topic selection
  - Text input for subtopic + "Start Teaching →" button
  - Calls `/api/process-source` on submit
  - Loading state: "Capy is getting ready to learn..."
  - Error handling: topic-not-found, too-few-questions
- `components/FileUpload.tsx` — Drag-and-drop PDF upload component with preview
- Screen transitions: S1 → S2 → S3 via `useSession()` context

**Verify:** Upload PDF → select subtopic → Oracle response stored in session context (inspect with React DevTools). All error states display correctly.

---

## Step 5: Capy Avatar + Speech Bubble Components

**Depends on:** Step 1 (types — needs `TuteeState`)
**Produces:**
- `public/tutee/idle.png` — Capy idle state (pre-generated before hackathon)
- `public/tutee/thinking.png` — Capy thinking state
- `public/tutee/confused.png` — Capy confused state
- `public/tutee/test-taking.png` — Capy test-taking state
- `components/TuteeAvatar.tsx` — State-driven sprite swap + CSS animations:
  - `idle`: gentle float (bob up/down, 3s ease-in-out)
  - `idle` (happy): one-shot bounce + glow
  - `thinking`: subtle pulse glow on container
  - `confused`: slight head wobble (rotate ±3°)
  - `test-taking`: gentle tremble (translateX ±1px)
- `components/SpeechBubble.tsx` — Two variants:
  - Peach bubble for Tutee (tail pointing down toward avatar)
  - Teal bubble for User (tail pointing up toward input)
- `components/ChatInput.tsx` — Text input bar + Send button + "I'm Done ✓" button

**Verify:** Render each component in isolation. Cycle through all 4 Capy states manually. Confirm animations play correctly and sprite transitions are smooth.

---

## Step 6: S3 (Teaching Chat) — Hero Screen

**Depends on:** Step 3 (Tutee API) + Step 5 (Capy + UI components)
**Produces:**
- `app/teach/page.tsx` — S3: Teaching chat screen
  - Centered layout: Capy avatar (200×200) + speech bubble above + input bar below
  - Streams Tutee responses in real-time (SSE client)
  - Shows latest exchange prominently; older messages in collapsible history
  - Capy state changes driven by `tuteeState` from API responses
  - "I'm Done ✓" → confirmation dialog → transition to S4
- `components/HistoryPanel.tsx` — Collapsible scrollable panel for full conversation history

**Integration:**
- `useSession()` reads `topicOutline`, `coveredSubtopics`, `conversationHistory`
- SSE streaming client for real-time token display in Tutee speech bubble
- Client appends both user + tutee messages to local state after each exchange

**Verify:** Full teaching flow — upload source → select topic → 5-10 message conversation. Confirm: streaming works, Capy avatar changes state per response, conversation accumulates in context, subtopic tracking updates.

---

## Step 7: Grader Agent (Backend)

**Depends on:** Step 2 (Oracle output — questions + answer key are needed)
**Produces:**
- `lib/agents/grader.ts` — Two functions:
  1. `tuteeAnswerQuestions()` — Single batched LLM call. Sends conversation history + ALL test questions → Tutee answers all at once. Hard "I don't know" isolation rule for uncovered topics. Returns `TuteeTestAnswer[]` with confidence levels.
  2. `evaluateAnswers()` — Single batched LLM call. Sends Tutee answers + answer key → semantic comparison → `GradingResult` with per-question breakdown + gap descriptions.
- `app/api/grade/route.ts` — POST handler. Receives `{ conversationHistory, testQuestions, answerKey }`. Returns SSE stream: `progress` events (question X of Y) + final `done` event with `GradingResult`.

**Verify:** After a real teaching session from Step 6, trigger grading via curl with the accumulated conversation + questions + answer key. Confirm:
1. Tutee answers "I don't know" for topics never discussed
2. Grader correctly marks right/wrong with semantic comparison
3. Gap descriptions are constructive ("you didn't cover X")
4. Total latency: ~5-10s for the 2-call pipeline

---

## Step 8: S4 (Test-Taking) + S5 (Grading Report) Screens

**Depends on:** Step 7 (Grader API)
**Produces:**
- `app/testing/page.tsx` — S4: Test-taking transition screen
  - Capy locked in `test-taking` state with tremble animation
  - Progress bar: "Question X of Y" (terracotta fill on warm gray track)
  - Copy: "Capy is taking the test..." / "Sit tight — Capy is answering questions based only on what you taught."
  - Auto-advances to S5 when grading SSE stream sends `done`
- `components/ProgressBar.tsx` — Warm Classroom styled progress bar
- `app/report/page.tsx` — S5: Grading report
  - Score circle (terracotta, 120×120, e.g. "7/10")
  - Per-question breakdown: correct (mint cards with ✅) and incorrect (blush cards with ❌ + gap)
  - Capy in `idle` state with bounce (happy regardless of score)
  - "Start New Session" button → reset context → back to S1
- `components/GradingCard.tsx` — Correct/incorrect result cards per design system
- `components/ScoreCircle.tsx` — Big terracotta circle with score display

**Verify:** Full end-to-end flow: Upload → Topic → Teach (5+ messages) → Done → Watch grading progress animate → View report with correct/incorrect breakdown → "Start New Session" resets everything.

---

## Step 9: Polish + Error States

**Depends on:** Step 8 (all screens exist)
**Produces:**
- All error states from doc 05:
  - PDF upload failure → suggest text paste fallback
  - Source too short (<500 chars) → character count hint
  - Topic not found in source → suggest different topic
  - Too few questions generated (<3) → suggest longer/different source
  - Connection lost during chat → retry button
  - Grading failure → "Retry Test" button
- Loading spinners/skeletons for all API calls
- Confirmation dialog for "I'm Done Teaching" (with keep/confirm options)
- Fine-tuned CSS animations (timing, easing)
- Tutee system prompt tuning based on real testing:
  - Test with intentionally wrong explanations → verify no correction
  - Test with vague explanations → verify clarifying questions fire
  - Test "I don't know" isolation during grading
- Cap conversation at 50 messages with gentle prompt
- Message length validation (5000 char limit on input)
- Test with 3-4 different source materials (different subjects, different lengths)

---

## Step 10: Deploy + Demo Prep

**Depends on:** Step 9 (app is polished)
**Produces:**
- Vercel deployment:
  - Connect GitHub repo
  - Set `ANTHROPIC_API_KEY` as environment variable
  - Verify build succeeds and live URL works
- End-to-end test on live URL (not localhost)
- Demo prep:
  - Pick a source topic you can teach well (and intentionally skip one subtopic to show gap detection)
  - Prepare a backup text-paste source in case PDF upload has issues during demo
  - Practice 3-minute demo flow: Upload → Topic → Teach 3-4 messages → Done → Show grading report
  - Have the pitch one-liner ready: "Teach a capybara what you know — and find out if you really know it."

---

## Pre-Hackathon Prep Checklist

These can be done before the 48 hours start:

- [ ] Generate Capy PNG illustrations (4 states) using Gemini — iterate until quality is high
- [ ] Verify all 4 PNGs have consistent style, proportions, and terracotta bandana
- [ ] Prepare 2-3 sample source texts for testing (different subjects)
- [ ] Have Anthropic API key ready with sufficient credits
- [ ] Set up GitHub repo
- [ ] Read through all 11 docs one final time

---

## File Structure (Final)

```
feynmans-mirror/
├── app/
│   ├── layout.tsx              # Root layout (Nunito, Tailwind, SessionProvider)
│   ├── globals.css             # Tailwind + CSS variables
│   ├── page.tsx                # S1: Upload
│   ├── topic/
│   │   └── page.tsx            # S2: Topic Selection
│   ├── teach/
│   │   └── page.tsx            # S3: Teaching Chat (hero)
│   ├── testing/
│   │   └── page.tsx            # S4: Test-Taking
│   ├── report/
│   │   └── page.tsx            # S5: Grading Report
│   └── api/
│       ├── process-source/
│       │   └── route.ts        # Oracle Agent
│       ├── chat/
│       │   └── route.ts        # Tutee Agent
│       └── grade/
│           └── route.ts        # Grader Agent
├── components/
│   ├── TuteeAvatar.tsx         # Capy character with state-based sprites
│   ├── SpeechBubble.tsx        # Tutee (peach) and User (teal) bubbles
│   ├── ChatInput.tsx           # Message input + Send + Done buttons
│   ├── FileUpload.tsx          # Drag-and-drop PDF upload
│   ├── HistoryPanel.tsx        # Collapsible conversation history
│   ├── GradingCard.tsx         # Correct/Incorrect result cards
│   ├── ProgressBar.tsx         # Test-taking progress bar
│   └── ScoreCircle.tsx         # Score display (7/10)
├── lib/
│   ├── agents/
│   │   ├── oracle.ts           # Oracle agent logic + prompt
│   │   ├── tutee.ts            # Tutee agent logic + prompt
│   │   └── grader.ts           # Grader agent logic + prompt
│   ├── pdf.ts                  # PDF text extraction
│   ├── types.ts                # All shared TypeScript interfaces
│   └── session-context.tsx     # React Context + SessionProvider + useSession()
├── public/
│   └── tutee/
│       ├── idle.png            # Capy: idle/listening
│       ├── thinking.png        # Capy: processing
│       ├── confused.png        # Capy: didn't follow
│       └── test-taking.png     # Capy: answering test
├── tailwind.config.ts          # Warm Classroom palette
├── package.json
├── tsconfig.json
├── .env.local                  # ANTHROPIC_API_KEY
└── .gitignore
```

---

## Cost Estimate Per Session

| API Call | Est. Input Tokens | Est. Output Tokens | Est. Cost |
|----------|------------------|--------------------|-----------|
| Oracle (1 call) | ~5,000 | ~2,000 | ~$0.021 |
| Tutee Chat (~20 calls) | ~60,000 total | ~3,000 total | ~$0.189 |
| Grader — Tutee Answering (1 call) | ~8,000 | ~2,000 | ~$0.030 |
| Grader — Evaluation (1 call) | ~10,000 | ~3,000 | ~$0.039 |
| **Total per session** | **~83,000** | **~10,000** | **~$0.28** |

50 demo sessions ≈ $14. Well within Anthropic free tier / starter credits.
