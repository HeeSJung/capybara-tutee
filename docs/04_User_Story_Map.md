# User Story Map — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16

---

## Backbone (Activities — Left to Right)

The user journey flows through 4 high-level activities:

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  1. UPLOAD   │──▶│  2. SELECT   │──▶│  3. TEACH    │──▶│  4. REVIEW   │
│   SOURCE     │   │    TOPIC     │   │    TUTEE     │   │   RESULTS    │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## MVP Slice (Hackathon — 48 hours)

### Activity 1: Upload Source
| Task | User Story | PRD Ref |
|------|-----------|---------|
| Upload PDF file | US-01: As a student, I want to upload my lecture notes so the system has a ground-truth source. | FR-01 |
| Paste plain text | US-01 (alt input) | FR-02 |
| See upload confirmation | User knows the source was accepted and is being processed. | FR-04 |

### Activity 2: Select Topic
| Task | User Story | PRD Ref |
|------|-----------|---------|
| Type/select subtopic to teach | US-02: As a student, I want to specify which subtopic I'm going to teach. | FR-03 |
| Oracle processes source (hidden) | System generates topic outline + answer key + test questions scoped to subtopic. | FR-04, FR-05, FR-06 |

### Activity 3: Teach Tutee
| Task | User Story | PRD Ref |
|------|-----------|---------|
| Send explanation messages in chat | US-03: As a student, I want to teach through free-form chat. | FR-07 |
| Receive clarifying questions from Tutee | US-04: Tutee asks questions to push deeper explanation. | FR-08 |
| Receive acknowledgment from Tutee | Tutee says "I understand" when explanation is clear. | FR-09 |
| Get nudged about uncovered subtopics | US-05: Tutee says "You haven't mentioned X — are we skipping it?" | FR-12, FR-13 |
| Click "I'm Done Teaching" | US-06: End the session and trigger grading. | FR-14 |

### Activity 4: Review Results
| Task | User Story | PRD Ref |
|------|-----------|---------|
| Grader tests the Tutee (hidden) | Grader administers Oracle's questions to Tutee. Tutee answers from taught knowledge only. | FR-15, FR-16 |
| See overall score | US-07: Grading report with score (e.g., 7/10). | FR-17, FR-18 |
| See per-question breakdown | US-07: Which questions right vs. wrong, with Tutee's answer vs. correct answer. | FR-18 |
| See gap mapping | US-08: Wrong answers mapped to what user missed or explained incorrectly. | FR-18 |
| Session ends | FR-20: No re-teach loop. Report is the final screen. | FR-20 |

---

## V2 Slice (Post-Hackathon)

### Activity 1: Upload Source — V2 Enhancements
| Task | Description |
|------|-------------|
| Multi-document upload | Upload multiple PDFs/files as a combined source for broader topics. |
| Image/diagram parsing | Extract meaning from diagrams and figures in PDFs, not just text. |

### Activity 2: Select Topic — V2 Enhancements
| Task | Description |
|------|-------------|
| Multiple subtopics per session | Select several subtopics to teach in one session instead of one at a time. |
| AI-suggested topics | Oracle suggests which topics might be weakest based on source complexity. |

### Activity 3: Teach Tutee — V2 Enhancements
| Task | Description |
|------|-------------|
| Re-teach loop | After seeing the report, go back and re-teach missed topics for a second round of grading. |
| Tutee personality customization | Choose Tutee difficulty level (e.g., "curious beginner" vs. "skeptical peer" who challenges more). |
| Multi-language support | Teach in languages other than English. |

### Activity 4: Review Results — V2 Enhancements
| Task | Description |
|------|-------------|
| Session history | Save past sessions and track improvement over time across multiple study sessions. |
| Export/share grading report | Download or share the report as PDF or link. |
| Improvement tracking | Compare scores across sessions on the same topic to show learning progress. |

---

## Visual Summary

```
                 UPLOAD SOURCE    SELECT TOPIC     TEACH TUTEE         REVIEW RESULTS
                ─────────────   ──────────────   ───────────────────   ────────────────
 ┌─────────┐   │ PDF upload   │ Type subtopic  │ Chat with Tutee    │ Overall score
 │  MVP    │   │ Text paste   │ Oracle procs   │ Clarifying Q's     │ Per-Q breakdown
 │ (48 hr) │   │ Confirmation │   (hidden)     │ Subtopic nudges    │ Gap mapping
 │         │   │              │                │ "I'm Done" button  │ Session ends
 ├─────────┤   ├──────────────┼────────────────┼────────────────────┼────────────────
 │  V2     │   │ Multi-doc    │ Multi-topic    │ Re-teach loop      │ Session history
 │ (Post)  │   │ Image parse  │ AI-suggested   │ Tutee personality  │ Export report
 │         │   │              │   topics       │ Multi-language     │ Progress tracking
 └─────────┘   └──────────────┴────────────────┴────────────────────┴────────────────
```
