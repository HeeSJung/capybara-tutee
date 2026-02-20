# Opportunity Hypothesis — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16

---

## Problem Statement

Current AI study tools (ChatGPT Learning Mode, Google Learning Guide, NotebookLM) operate in a **teacher-to-student** paradigm — the AI explains concepts, and the user passively absorbs. While these tools are effective at *delivering* information, they are poor at **verifying whether the user truly understands** what they've learned. Students can nod along, feel confident, and still have significant gaps in their understanding that only surface during exams or real-world application.

There is no mainstream tool that tests **depth of understanding through explanation ability** — the principle that if you can teach a concept clearly to someone else, you genuinely understand it. If you can't, the gaps in your explanation reveal the gaps in your knowledge.

---

## Target Persona

University students (primarily) who use AI tools to study and want to verify that they've actually internalized concepts — not just consumed them. Especially relevant for concept-heavy subjects (biology, physics, philosophy, etc.) where the ability to explain coherently is a strong signal of understanding.

*(Detailed persona to be defined in the next doc: User Persona Profile)*

---

## Hypothesis Statement

We believe that **building an AI "tutee" that students must teach a topic to** (rather than learn from) **will reveal gaps in the user's understanding** by forcing them to articulate concepts clearly — and that a grading system comparing their teaching against a ground-truth source will provide **actionable feedback on where their understanding breaks down**.

---

## Assumptions (What Must Be True)

1. **Students are willing to "teach" an AI** — the interaction model (user as teacher) is intuitive enough that users engage with it rather than reverting to asking the AI questions.
2. **Explanation quality correlates with understanding** — the Feynman Technique premise holds: if you can explain it well, you understand it; if you can't, you don't.
3. **The AI can convincingly act as a naive student** — the Tutee agent can suppress its built-in knowledge and only respond based on what the user has taught it in the session (Knowledge Leakage risk identified).
4. **A ground-truth source can serve as a reliable answer key** — the Oracle agent can generate a meaningful evaluation rubric from user-uploaded material (PDF/notes), and the Grader can compare the Tutee's learned state against it to produce a useful score.
5. **This is complementary to existing AI study tools, not a replacement** — users would first learn a topic using existing tools (ChatGPT, NotebookLM, etc.), then use Feynman's Mirror to test whether they truly absorbed it.
