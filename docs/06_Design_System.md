# Design System / UI Kit — Feynman's Mirror

**Project:** Feynman's Mirror (Working Title)
**Context:** HackED 2026 — UAlberta, Solo, 48-hour hackathon
**Date:** 2026-02-16
**Visual Direction:** Light Mode, Playful — "Warm Classroom"

---

## 1. Design Philosophy

The UI should feel like a warm, well-lit classroom — not a sterile tech interface. Everything is rounded, soft-shadowed, and friendly. The Tutee character is the emotional center of the experience. The design invites explanation, not consumption.

**Key principles:**
- **Warm over cold** — cream backgrounds, soft edges, no harsh whites or blacks
- **Character-driven** — the Tutee is always the visual anchor; UI elements support it, not compete with it
- **Minimal chrome** — as few borders and containers as possible; let content breathe
- **Forgiving feel** — even the error/incorrect states feel constructive, not punitive

---

## 2. Color Palette

### Primary Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--bg-primary` | Cream | `#FFF8F0` | Page background, main canvas |
| `--bg-surface` | White | `#FFFFFF` | Cards, panels, elevated surfaces |
| `--accent-primary` | Terracotta | `#E07A5F` | Primary buttons, CTA, active states, links |
| `--accent-secondary` | Soft Teal | `#7EC8B9` | Secondary buttons, user speech bubble, highlights |
| `--accent-tertiary` | Warm Amber | `#F5C542` | Tutee character fill, badges, star ratings |

### Text Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--text-primary` | Dark Cocoa | `#2D2A24` | Headings, body text, primary content |
| `--text-secondary` | Warm Gray | `#7A7568` | Subtitles, hints, timestamps, annotations |
| `--text-muted` | Light Gray | `#B5AFA6` | Placeholders, disabled text |
| `--text-on-accent` | White | `#FFFDF9` | Text on terracotta/teal buttons |

### Semantic Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-success` | Sage Green | `#4CAF7D` | Correct answers, success states, checkmarks |
| `--color-success-bg` | Mint | `#E8F5EC` | Correct answer card background |
| `--color-error` | Warm Red | `#D94C4C` | Incorrect answers, error states |
| `--color-error-bg` | Blush | `#FDE8E8` | Incorrect answer card background |
| `--color-warning` | Amber | `#E5A107` | Warnings, processing states |

### Speech Bubble Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--bubble-tutee-bg` | Peach | `#FFE4D9` | Tutee speech bubble background |
| `--bubble-tutee-border` | Light Coral | `#F0B8A8` | Tutee speech bubble border |
| `--bubble-user-bg` | Teal | `#5BA89D` | User speech bubble background |
| `--bubble-user-border` | Deep Teal | `#4A8F85` | User speech bubble border |
| `--bubble-user-text` | White | `#FFFDF9` | Text inside user bubble |

### Tutee Character Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--tutee-skin` | Warm Amber | `#F5C542` | Tutee head fill |
| `--tutee-outline` | Deep Amber | `#E5A107` | Tutee head stroke |
| `--tutee-feature` | Dark Cocoa | `#2D2A24` | Eyes, eyebrows, mouth |

---

## 3. Typography

### Font Family

**Primary:** `Nunito` (Google Fonts) — rounded, friendly, excellent readability
**Fallback:** `system-ui, -apple-system, sans-serif`

Nunito was chosen for its rounded terminals that match the "playful" design direction and its excellent legibility at small sizes (important for chat bubbles).

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--type-h1` | 28px | 700 (Bold) | 1.3 | Screen titles ("Feynman's Mirror", "Your Teaching Score") |
| `--type-h2` | 22px | 600 (SemiBold) | 1.35 | Section headers ("What topic will you teach today?") |
| `--type-body` | 15px | 400 (Regular) | 1.5 | Body text, descriptions |
| `--type-bubble` | 14px | 400 (Regular) | 1.45 | Text inside speech bubbles |
| `--type-caption` | 12px | 400 (Regular) | 1.4 | Hints, annotations, state labels |
| `--type-button` | 15px | 600 (SemiBold) | 1.2 | Button labels |
| `--type-score` | 48px | 700 (Bold) | 1.0 | Score display ("7/10") |

---

## 4. Spacing & Layout

### Spacing Scale

Base unit: `4px`. All spacing is a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight inner padding |
| `--space-sm` | 8px | Between icon and label |
| `--space-md` | 16px | Standard padding inside cards/bubbles |
| `--space-lg` | 24px | Between sections, card margin |
| `--space-xl` | 32px | Major section gaps |
| `--space-2xl` | 48px | Screen-level vertical padding |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small chips, tags |
| `--radius-md` | 12px | Buttons, input fields, cards |
| `--radius-lg` | 20px | Speech bubbles, avatar container |
| `--radius-full` | 50% | Tutee head (circle), score circle |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(45,42,36,0.08)` | Subtle lift for cards |
| `--shadow-md` | `0 4px 12px rgba(45,42,36,0.10)` | Speech bubbles, elevated panels |
| `--shadow-lg` | `0 8px 24px rgba(45,42,36,0.12)` | Modals, confirmation dialogs |

---

## 5. Component Specifications

### 5.1 Buttons

**Primary Button** (CTA)
- Background: `--accent-primary` (Terracotta)
- Text: `--text-on-accent` (White)
- Radius: `--radius-md` (12px)
- Padding: 12px 24px
- Shadow: `--shadow-sm`
- Hover: darken 10%, shadow → `--shadow-md`

**Secondary Button**
- Background: transparent
- Border: 2px solid `--accent-secondary` (Teal)
- Text: `--accent-secondary`
- Radius: `--radius-md`
- Hover: fill with `--accent-secondary`, text → white

**Danger Button** ("I'm Done Teaching")
- Background: `--color-error` (Warm Red)
- Text: white
- Used sparingly — only for ending the session

### 5.2 Input Fields

- Border: 2px solid `#E8E0D8` (warm light gray)
- Radius: `--radius-md` (12px)
- Background: `--bg-surface` (White)
- Placeholder text: `--text-muted`
- Focus state: border → `--accent-primary`, faint terracotta glow
- Padding: 12px 16px

### 5.3 Speech Bubbles

**Tutee Bubble** (floats above character)
- Background: `--bubble-tutee-bg` (Peach)
- Border: 1px solid `--bubble-tutee-border`
- Radius: 16px 16px 16px 4px (flat bottom-left, pointing toward Tutee)
- Shadow: `--shadow-md`
- Max width: 60% of screen width
- Pointer: CSS triangle or SVG arrow pointing down toward Tutee head

**User Bubble** (rises from bottom)
- Background: `--bubble-user-bg` (Teal)
- Text: `--bubble-user-text` (White)
- Radius: 4px 16px 16px 16px (flat top-left, pointing toward user/input)
- Shadow: `--shadow-md`
- Max width: 60% of screen width
- Pointer: CSS triangle pointing down toward input bar

### 5.4 Cards (Grading Report)

**Correct Card**
- Background: `--color-success-bg` (Mint)
- Left border: 4px solid `--color-success`
- Radius: `--radius-md`
- Icon: ✅ prefix

**Incorrect Card**
- Background: `--color-error-bg` (Blush)
- Left border: 4px solid `--color-error`
- Radius: `--radius-md`
- Icon: ❌ prefix
- Includes "Gap:" section in `--text-secondary`

### 5.5 Progress Bar (Test-Taking Screen)

- Track: `#E8E0D8` (warm gray)
- Fill: `--accent-primary` (Terracotta)
- Height: 12px
- Radius: `--radius-sm` (6px)
- Label below: "Question X of Y" in `--type-caption`

### 5.6 Score Circle (Grading Report)

- Size: 120×120px
- Background: `--accent-primary` (Terracotta)
- Text: `--text-on-accent`, `--type-score` (48px bold)
- Border: none
- Shadow: `--shadow-md`
- Perfectly round: `--radius-full`

---

## 6. Tutee Character Design Guide

### Character Concept

The Tutee is a simple, round-faced illustrated student character — think "emoji meets Duolingo owl" in complexity. Warm amber skin tone, expressive but minimal features. The character should be instantly recognizable and emotionally readable even at small sizes.

### Visual States & Sprite Sheet

| State | Expression | Eyes | Eyebrows | Mouth | Body |
|-------|-----------|------|----------|-------|------|
| **Idle** | Attentive, calm | Open, relaxed upward gaze | Neutral, perked | Gentle closed smile | Still, patient. Also "happy" via CSS bounce |
| **Thinking** | Processing | Half-closed or gazing up | Slightly back | Slight pout | Head slightly lowered |
| **Confused** | Curious, puzzled | Wide, alert, searching | One tilted/flopped | Slightly open | Head tilted ~10° |
| **Test-Taking** | Focused, nervous | Concentrated, downward | Flattened back | Tight flat line | Tense, pencil near face |

### Asset Requirements

- Format: PNG with transparency (or SVG for scalability)
- Size: Design at 300×300px, display at 120-160px on screen
- File naming: `idle.png`, `thinking.png`, `confused.png`, `test-taking.png`
- Total assets: 4 images (CSS handles all animation — no frame sprites needed)
- Generation: AI image tool (Gemini/Midjourney, before hackathon)
- Style: **Ink illustration** — fine pen linework with crosshatching for fur, monochrome body with terracotta bandana (#E07A5F) as only color accent. Editorial storybook quality

### Animation Implementation

No animation framework needed. CSS class toggling between image sources:

```css
/* Speaking animation: swap between frames every 400ms */
.tutee-speaking {
  animation: speak 0.8s steps(1) infinite;
}

@keyframes speak {
  0%, 100% { content: url('tutee-speaking-1.png'); }
  50% { content: url('tutee-speaking-2.png'); }
}

/* Test-taking animation: pencil moves every 500ms */
.tutee-testing {
  animation: write 1s steps(1) infinite;
}

@keyframes write {
  0%, 100% { content: url('tutee-testing-1.png'); }
  50% { content: url('tutee-testing-2.png'); }
}
```

---

## 7. Layout Structure (Per Screen)

### Screen Container

- Max width: 800px (centered on large screens)
- Background: `--bg-primary` (Cream)
- Horizontal padding: `--space-xl` (32px) on each side

### S1 — Landing / Upload

```
┌────────────────────────────────────────┐
│        [Logo/Title centered]           │
│        [Subtitle]                      │
│                                        │
│   ┌──── Upload Area (dashed border) ──┐│
│   │     Drag & drop or click          ││
│   └───────────────────────────────────┘│
│              — or —                    │
│   ┌──── Text Paste Box ──────────────┐│
│   │     Paste your notes here...     ││
│   └───────────────────────────────────┘│
│                                        │
│        [ Continue → ] (Terracotta)     │
└────────────────────────────────────────┘
```

### S3 — Teaching Chat (Face-to-Face)

```
┌────────────────────────────────────────┐
│  Topic: Photosynthesis    [History ▼]  │
│  ─────────────────────────────────     │
│                                        │
│      ┌──────────────────────┐          │
│      │  "What do you mean   │ ← Peach  │
│      │   by convert?"       │   bubble  │
│      └──────────┬───────────┘          │
│            ┌────┴────┐                 │
│            │  TUTEE  │ ← 140px circle  │
│            │ (amber) │                 │
│            └─────────┘                 │
│           Your Tutee                   │
│          State: Confused               │
│                                        │
│      ┌──────────────────────┐          │
│      │ "Photosynthesis is..." │ ← Teal │
│      └──────────┬───────────┘  bubble  │
│                 ▲                      │
│  [ Type your explanation...  ] [Done]  │
└────────────────────────────────────────┘
```

---

## 8. Responsive Notes (Hackathon Scope)

- **MVP: Desktop only** (1024px+ width)
- Center content in an 800px container
- No mobile layouts needed for hackathon demo
- If time permits: scale down Tutee character and stack elements vertically below 768px

---

## 9. Accessibility Baseline (Hackathon Scope)

Even for a hackathon, these are low-effort, high-impact:
- Text contrast: All text meets WCAG AA (4.5:1 ratio minimum)
- Button size: Minimum 44×44px touch target
- Focus states: Visible focus ring on all interactive elements
- Alt text: Describe Tutee states in alt attributes for screen readers
- Color alone: Never use color as the only indicator (✅/❌ icons supplement green/red)
