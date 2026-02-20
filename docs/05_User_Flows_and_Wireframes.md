# User Flows & Wireframes — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16

---

## Screen Inventory

The MVP has **5 screens**:

| # | Screen Name | Purpose |
|---|------------|---------|
| S1 | Landing / Upload | User uploads source material |
| S2 | Topic Selection | User specifies subtopic to teach |
| S3 | Teaching Chat | Free-form teaching dialogue with Tutee |
| S4 | Test-Taking | Tutee takes the test (loading/transition state) |
| S5 | Grading Report | Final results with per-question breakdown |

---

## Tutee Character States

The Tutee is a visible illustrated student character displayed as the **central focus** of the teaching screen. The interface uses a **face-to-face conversation** metaphor — NOT a traditional chat log. The Tutee's speech appears as a bubble above its head; the user's speech rises from the bottom toward the Tutee. Only the latest exchange is visible at a time, with a collapsible "Conversation History" panel for review.

The Tutee character has **4 visual states** driven by the Tutee agent's current action:

| State | Trigger | Visual Description |
|-------|---------|-------------------|
| **Idle** | Default / user is typing / Capy understood (happy bounce via CSS) | Calm, attentive, gentle smile. Ink illustration style |
| **Thinking** | Capy is processing the user's explanation | Half-closed eyes, contemplative, head slightly lowered |
| **Confused** | Capy sends a clarifying question | Wide eyes, head tilted, one ear flopped |
| **Test-Taking** | Grading phase (S4) | Focused, tense, pencil near face, slight tremble via CSS |

**Asset requirements:** 4 static illustrations (PNG, transparent background, 512×512). Ink illustration style — fine pen crosshatch linework, monochrome body with terracotta bandana (#E07A5F) as only color accent. Generate with AI image tool before hackathon. No animation framework needed — CSS handles float, wobble, bounce, tremble.

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [S1] LANDING / UPLOAD                                                  │
│  ┌─────────────────────────────┐                                        │
│  │  "Teach what you've learned" │                                       │
│  │                              │                                       │
│  │  [ Upload PDF ]              │                                       │
│  │       — or —                 │                                       │
│  │  [ Paste text here... ]      │                                       │
│  │                              │                                       │
│  │  [ Continue → ]              │                                       │
│  └──────────────┬───────────────┘                                       │
│                 │                                                        │
│                 ▼                                                        │
│        ┌── Validation ──┐                                               │
│        │ File uploaded   │──── No ──→ Show error: "Please upload a      │
│        │ OR text pasted? │           PDF or paste your notes"            │
│        └───────┬─────────┘           (stay on S1)                       │
│                │ Yes                                                     │
│                ▼                                                        │
│        ┌── Validation ──┐                                               │
│        │ Source text     │──── No ──→ Show error: "Your source is too   │
│        │ ≥500 chars?     │           short. Provide more detailed       │
│        └───────┬─────────┘           notes." (stay on S1)              │
│                │ Yes                                                     │
│                ▼                                                        │
│  [S2] TOPIC SELECTION                                                   │
│  ┌─────────────────────────────┐                                        │
│  │  "What topic will you       │                                        │
│  │   teach today?"             │                                        │
│  │                              │                                       │
│  │  [ Type your topic... ]      │                                       │
│  │                              │                                       │
│  │  [ Start Teaching → ]        │                                       │
│  └──────────────┬───────────────┘                                       │
│                 │                                                        │
│                 ▼                                                        │
│        ┌── Processing ──┐                                               │
│        │ Oracle parses   │──── Fail ──→ Show error: "Couldn't find      │
│        │ source for      │             that topic in your source.        │
│        │ subtopic        │             Try a different topic."           │
│        └───────┬─────────┘             (stay on S2)                     │
│                │ Success                                                 │
│                ▼                                                        │
│        ┌── Validation ──┐                                               │
│        │ Oracle generated │──── No ──→ Show error: "Couldn't generate   │
│        │ ≥3 questions?    │            enough questions. Try a more      │
│        └───────┬──────────┘            detailed source or broader        │
│                │ Yes                    topic." (stay on S2)             │
│                │ (Oracle sends topic outline → Tutee)                    │
│                │ (Oracle sends answer key + questions → Grader)          │
│                ▼                                                        │
│  [S3] TEACHING SESSION (Face-to-Face Conversation)                      │
│  ┌─────────────────────────────────────────────┐                        │
│  │  Topic: Photosynthesis        [History ▼]   │                        │
│  │                                              │                       │
│  │        ┌─────────────────────────┐          │                        │
│  │        │ "What do you mean by    │ ← Tutee  │                       │
│  │        │  'convert sunlight'?    │   speech  │                       │
│  │        │  How does that happen?" │   bubble  │                       │
│  │        └──────────┬──────────────┘          │                        │
│  │              ┌────┴─────┐                   │                        │
│  │              │ [TUTEE   │                   │                        │
│  │              │  AVATAR] │                   │                        │
│  │              │ Confused │                   │                        │
│  │              └──────────┘                   │                        │
│  │                                              │                       │
│  │  ┌─────────────────────────────┐            │                        │
│  │  │ "Photosynthesis is the      │ ← User    │                        │
│  │  │  process by which plants    │   speech   │                       │
│  │  │  convert sunlight..."       │   bubble   │                       │
│  │  └─────────────────────────────┘   (rises   │                       │
│  │                                     from     │                       │
│  │                                     bottom)  │                       │
│  │  [ Type your explanation... ]                │                        │
│  │  [ Send ]         [ I'm Done Teaching ✓ ]    │                       │
│  └──────────────────────┬───────────────────────┘                       │
│                         │                                                │
│                         ▼                                               │
│        ┌── Confirmation ──┐                                             │
│        │ "Are you sure     │──── No ──→ Return to S3 chat               │
│        │  you're done?"    │                                            │
│        └───────┬───────────┘                                            │
│                │ Yes                                                     │
│                ▼                                                        │
│  [S4] TEST-TAKING (Transition Screen)                                   │
│  ┌─────────────────────────────────────────────┐                        │
│  │                                              │                       │
│  │  ┌──────────────────┐                       │                        │
│  │  │  [TUTEE AVATAR]  │                       │                        │
│  │  │  Test-Taking     │                       │                        │
│  │  │  state (pencil   │                       │                        │
│  │  │  animation)      │                       │                        │
│  │  └──────────────────┘                       │                        │
│  │                                              │                       │
│  │  "Capy is taking the test..."                 │                       │
│  │                                              │                       │
│  │  Question 3 of 10...                         │                       │
│  │  ████████░░░░░░░░░░  30%                     │                       │
│  │                                              │                       │
│  └──────────────────────┬───────────────────────┘                       │
│                         │ (auto-advances when grading completes)         │
│                         ▼                                               │
│  [S5] GRADING REPORT                                                    │
│  ┌─────────────────────────────────────────────┐                        │
│  │                                              │                       │
│  │  "Your Teaching Score"                       │                       │
│  │  ┌────────────┐                              │                       │
│  │  │   7 / 10   │  ← Overall score             │                      │
│  │  └────────────┘                              │                       │
│  │                                              │                       │
│  │  Per-Question Breakdown:                     │                       │
│  │  ┌───────────────────────────────────────┐   │                       │
│  │  │ ✅ Q1: What is photosynthesis?        │   │                       │
│  │  │    Tutee answered: "..." → Correct     │   │                      │
│  │  ├───────────────────────────────────────┤   │                       │
│  │  │ ❌ Q2: What role does chlorophyll     │   │                       │
│  │  │    play?                               │   │                      │
│  │  │    Tutee answered: "..." → Incorrect   │   │                      │
│  │  │    Expected: "..."                     │   │                      │
│  │  │    Gap: You didn't explain the role    │   │                      │
│  │  │    of chlorophyll in light absorption  │   │                      │
│  │  ├───────────────────────────────────────┤   │                       │
│  │  │ ...                                    │   │                      │
│  │  └───────────────────────────────────────┘   │                       │
│  │                                              │                       │
│  │  [ Start New Session ]                       │                       │
│  └──────────────────────────────────────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Decision Nodes Summary

| Node | Condition | Yes | No |
|------|-----------|-----|----|
| Source provided? | User uploaded PDF or pasted text | Check source length | Error message, stay on S1 |
| Source long enough? | Source text ≥500 characters (FR-21) | Proceed to S2 | Error: "source too short", stay on S1 |
| Topic found in source? | Oracle successfully extracts subtopic | Check question count | Error message, stay on S2 |
| Enough questions? | Oracle generated ≥3 test questions (FR-22) | Proceed to S3 | Error: "not enough questions", stay on S2 |
| Done teaching? | User clicks "I'm Done Teaching" | Confirmation dialog | Continue chat |
| Confirm done? | User confirms in dialog | Proceed to S4 | Return to S3 |

---

## Error States

| Error | Screen | Message | Recovery |
|-------|--------|---------|----------|
| No source provided | S1 | "Please upload a PDF or paste your notes to get started." | User uploads/pastes, tries again |
| Source text too short | S1 | "Your source material is too short. Please provide more detailed notes (at least a few paragraphs)." | User provides longer source |
| PDF processing failure | S1 → S2 | "We couldn't read your PDF. Try a different file or paste the text directly." | User retries with different input |
| Topic not found in source | S2 | "We couldn't find that topic in your source material. Try a different topic name." | User types different subtopic |
| Too few questions generated | S2 | "We couldn't generate enough questions from this source. Try a more detailed source or a broader subtopic." | User provides better source or broader topic |
| Oracle processing timeout | S2 | "Processing is taking longer than expected. Please wait or try a shorter source." | Auto-retry or user re-submits |
| Chat API failure mid-session | S3 | "Connection lost. Your conversation is preserved locally. [Retry]" | Retry resends from client state |
| Grading failure | S4 | "Something went wrong while grading. [Retry Test]" | Re-run grading step (client resends all data) |

---

## Screen Transition Summary

```
S1 (Upload) ──→ S2 (Topic) ──→ S3 (Chat) ──→ S4 (Test) ──→ S5 (Report)
                                                                    │
                                                                    ▼
                                                          [ Start New Session ]
                                                                    │
                                                                    ▼
                                                                S1 (Upload)
```

Linear flow. No branching paths. No back navigation needed (except returning from confirmation dialog to S3). Clean and simple for a hackathon.
