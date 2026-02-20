# Content Strategy & Copy Deck — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16 (Updated 2026-02-19: Capy capybara personality integrated throughout)

---

## 1. Voice & Tone

### Brand Voice

Feynman's Mirror speaks like a **smart, encouraging study buddy** — not a professor, not a corporate product. The tone is warm, direct, and slightly playful. It respects the user's intelligence while making the experience feel low-stakes and approachable.

### Tone Guidelines

| Attribute | Do | Don't |
|-----------|-----|-------|
| **Warm** | "Teach what you've learned." | "Input your educational content." |
| **Encouraging** | "Let's see how well you taught!" | "Your performance will be evaluated." |
| **Direct** | "You missed explaining chlorophyll's role." | "It appears there may be an area for potential improvement regarding..." |
| **Human** | "Capy is taking the test..." | "Processing evaluation pipeline..." |
| **Constructive** | "You didn't cover X — revisit this area." | "You failed to explain X. Incorrect." |

---

## 2. Screen-by-Screen Copy Deck

### S1 — Landing / Upload

| Element | Copy |
|---------|------|
| **Title** | Feynman's Mirror |
| **Subtitle** | Teach Capy what you've learned. Prove you understand. |
| **Upload area label** | Upload PDF |
| **Upload area hint** | Drag & drop your lecture notes here |
| **Divider** | — or — |
| **Text paste placeholder** | Paste your notes here... |
| **CTA button** | Continue → |
| **Error: no input** | Please upload a PDF or paste your notes to get started. |
| **Error: PDF failed** | We couldn't read your PDF. Try a different file or paste the text directly. |

### S2 — Topic Selection

| Element | Copy |
|---------|------|
| **Title** | What topic will you teach today? |
| **Source confirmation** | Source: [filename] ✓ |
| **Topic input placeholder** | e.g., Photosynthesis |
| **Hint text** | Choose a specific subtopic from your uploaded source. The AI will scope the evaluation to this area. |
| **CTA button** | Start Teaching → |
| **Loading state** | Capy is getting ready to learn... |
| **Error: topic not found** | We couldn't find that topic in your source material. Try a different topic name. |
| **Error: timeout** | Processing is taking longer than expected. Please wait or try a shorter source. |

### S3 — Teaching Chat

| Element | Copy |
|---------|------|
| **Topic header** | Topic: [subtopic name] |
| **History toggle** | [History ▼] |
| **Capy intro message** | Hi! I'm Capy! I'm ready to learn about [subtopic]. Go ahead and teach me! |
| **Input placeholder** | Type your explanation... |
| **Send button** | Send |
| **Done button** | I'm Done ✓ |
| **Confirmation dialog title** | Done teaching? |
| **Confirmation dialog body** | Capy will now take a test based on what you taught. You won't be able to add more explanations after this. |
| **Confirmation: confirm** | Yes, grade my teaching |
| **Confirmation: cancel** | Keep teaching |
| **State label: idle** | Capy is listening... |
| **State label: thinking** | Capy is thinking... |
| **State label: confused** | Capy looks confused |
| **Error: connection lost** | Connection lost. Your session has been saved. [Retry] |

### S4 — Test-Taking

| Element | Copy |
|---------|------|
| **Title** | Capy is taking the test... |
| **Progress text** | Question [X] of [Y] |
| **Animation note** | *(2-frame pencil animation on Tutee character)* |
| **Subtext** | Sit tight — Capy is answering questions based only on what you taught. |

### S5 — Grading Report

| Element | Copy |
|---------|------|
| **Title** | Your Teaching Score |
| **Score display** | [X] / [Y] |
| **Section header** | Per-Question Breakdown |
| **Correct card prefix** | ✅ |
| **Correct card suffix** | Capy answered correctly based on your teaching. |
| **Incorrect card prefix** | ❌ |
| **Incorrect card — Capy answer label** | Capy answered: |
| **Incorrect card — Expected label** | Expected: |
| **Incorrect card — Gap label** | Gap: |
| **CTA button** | Start New Session |
| **Error: grading failed** | Something went wrong while grading. [Retry Test] |

---

## 3. Capy's Personality Copy

Capy is a young capybara — an **eager, curious, warm, and endearingly naive student**. Rendered in detailed ink illustration with expressive crosshatch fur, Capy absorbs everything you teach (including mistakes). Responses should feel natural, warm, and capybara-personality-infused.

### Clarifying Questions (Confused State)

Example patterns Capy uses when confused:
- "Hmm... what do you mean by '[term]'? I don't think I get that part."
- "Wait wait wait — how does [concept A] connect to [concept B]?"
- "Can you explain that a different way? My brain's going in circles."
- "You mentioned [X] — but what actually happens during that?"

### Acknowledgments (Idle State — with happy CSS bounce)

Capy's responses when something clicks:
- "Ohh, that makes sense! So [paraphrase what user said]."
- "I think I get it — [brief summary]. Am I on the right track?"
- "Got it! That's really clear, thank you!"
- "Ooh, interesting! I had no idea!"

### Subtopic Nudges (Idle State)

Capy gently nudges uncovered topics:
- "You haven't mentioned [subtopic name] yet — are we going to get to that?"
- "I noticed you skipped [subtopic name]. Should I know about that too?"
- "What about [subtopic name]? Is that part of this?"

### Test Answers — High Confidence (Test-Taking State)

- "[Clear explanation based on what was taught]"

### Test Answers — Low Confidence (Test-Taking State)

- "I think [vague answer]... but I'm not totally sure about this one."
- "Hmm, I vaguely remember something about this... [partial answer]."

### Test Answers — No Knowledge (Test-Taking State)

- "I don't know — we didn't cover this in our conversation."
- "I'm drawing a blank here... I don't remember learning about this."

---

## 4. Error Message Strategy

All error messages follow a **3-part pattern:**

1. **What happened** (brief, plain language)
2. **Why** (if helpful — optional)
3. **What to do** (actionable next step)

Examples:
- "We couldn't read your PDF. **Try a different file or paste the text directly.**"
- "We couldn't find that topic in your source material. **Try a different topic name.**"
- "Connection lost. **Your session has been saved.** [Retry]"

**Tone in errors:** Calm and constructive. Never blame the user. Never use technical jargon ("500 Internal Server Error", "timeout exception"). The app takes responsibility: "We couldn't..." not "You uploaded an invalid file."

---

## 5. Hackathon Pitch Copy (30-Second Version)

> "Every AI study tool today teaches *you*. But understanding isn't about *receiving* information — it's about being able to *explain* it. Feynman's Mirror flips the script: you teach Capy — a capybara who knows nothing — and we grade how well you taught. If you can explain it clearly, you understand it. If you can't — we show you exactly where your understanding breaks down."

### One-liner

> "Teach a capybara what you know — and find out if you really know it."

### Tagline

> "Teach Capy what you've learned. Prove you understand."
