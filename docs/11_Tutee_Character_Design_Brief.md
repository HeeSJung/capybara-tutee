# 11 — Tutee Character Design Brief

## Character: "Capy" — The Capybara Tutee

### Concept Summary

A young capybara student rendered in **detailed ink illustration** style — fine pen strokes with visible crosshatching for fur texture, mostly monochrome with selective color accents. Think editorial storybook illustration or natural history sketches brought to life. Every strand of fur is individually drawn, giving the character a tactile, handcrafted quality. The world's chillest animal reimagined as an eager younger student who genuinely wants to learn from you. Capy is a blank slate: patient, trusting, and endearingly clueless. It absorbs everything you say — including mistakes — making you *want* to teach it properly.

**Why capybara?**
Capybaras are warm-toned (natural palette match), round-shaped (inherently cute), and famously gentle (perfect "teach me" energy). Nobody else has a capybara mascot. Judges will remember this.

---

## 1. Visual Design Specifications

### Body & Proportions
- **Style**: Detailed ink illustration — fine pen/ink linework with crosshatching. Each fur strand individually drawn. Minimal, clean, editorial storybook quality. Mostly monochrome (black ink on white/transparent) with selective color accents on accessories only.
- **Proportions**: Naturalistic but slightly stylized (head slightly larger than true-to-life for expressiveness). Not chibi — actual capybara proportions with gentle exaggeration
- **Pose**: Upper body only (bust/portrait framing). Shoulders and above visible
- **Viewing angle**: Slight ¾ view, facing the user (not perfectly straight-on)
- **Shape language**: Organic, soft. Natural capybara roundness — barrel-shaped body, blunt snout, small rounded ears. No sharp angles
- **Fur texture**: Individual ink strokes for each tuft and strand of fur. Crosshatching for shading and volume. Dense strokes on shadowed areas, sparser on highlights. The fur texture IS the rendering — no flat fills or color washes on the body

### Color Palette (monochrome body + color accents)
| Part | Color | Hex |
|------|-------|-----|
| Fur / body / face | Black ink linework on white | `#2D2A24` strokes on transparent |
| Fur shading | Crosshatch density (no color fill) | — |
| Nose | Solid dark fill | `#2D2A24` |
| Eyes (iris) | Dark ink with white highlight dot | `#2D2A24` / `#FFFFFF` |
| **Bandana (COLOR ACCENT)** | Terracotta | `#E07A5F` |
| **Pencil accent (optional)** | Warm wood tone | `#C4922E` (dark amber) |
| Background | Transparent (PNG) | — |

**Color rule**: The capybara itself is rendered entirely in black ink on transparent. Color ONLY appears on accessories (bandana, pencil). This creates a striking contrast — the monochrome animal with a pop of the app's terracotta primary accent.

### Accessories
- A small **terracotta scarf or bandana** (`#E07A5F` — matches the app's primary accent) loosely around neck — this is the ONLY color on the character
- Optional: tiny pencil tucked behind one ear (dark amber `#C4922E` wood tone)
- NO hats, glasses, or heavy accessories — keep it minimal and clean

### Rendering Notes
- **Ink illustration style**: Fine pen linework with crosshatching for shading. Every fur strand individually drawn
- **No color fills on the body** — all volume and shading comes from line density and crosshatch patterns
- Dense crosshatching in shadow areas (under chin, behind ears, lower body), sparse/open strokes on lit areas
- Clean, confident line quality — not sketchy or rough. Professional editorial illustration level
- Transparent PNG background (will be composited on `#FFF8F0` cream)
- Target render size: **512×512px** (will display at ~200×200 in app)
- Reference style: Natural history pen illustrations, editorial storybook art, detailed crosshatch animal portraits

---

## 2. Expression States

Four states total. Each is a separate PNG image. The character maintains the same pose/framing — only the face and minor details change. Happy reactions are handled by the `idle` state with a CSS bounce animation.

### State 1: IDLE 👂
**When shown**: Default state. Capy is waiting, listening, or has just understood something (happy bounce via CSS).
- Eyes: Open, looking at user (slight upward gaze), relaxed. White highlight dot in each eye
- Mouth: Closed, tiny gentle smile — single clean curved line
- Ears: Neutral position, slightly perked. Fine fur strokes radiating outward
- Body: Still, attentive posture. Even crosshatch density across the body
- Ink work: Medium-density crosshatching, clean and balanced. Lightest shading of all states
- Mood: Patient, calm, "I'm here, ready to learn"
- **CSS note**: When used for "happy" moments, this image gets a one-shot bounce + gentle glow animation

### State 2: THINKING 💭
**When shown**: Capy is processing what the user taught. Transition state between receiving a message and responding.
- Eyes: Half-closed or looking upward, contemplative. Eyelids drawn with heavier lines
- Mouth: Closed, slight pout — a subtly different curve than idle
- Ears: Both slightly back and lowered (concentrating). Denser hatching behind ears
- Body: Head very slightly lowered, weight shifted
- Ink work: Slightly denser crosshatching overall, especially around the brow area, conveying a "heavier" mood
- Mood: "Let me think about that..."

### State 3: CONFUSED 🤔
**When shown**: When the user's explanation is unclear or incomplete. Capy doesn't follow.
- Eyes: Wide open, one brow area slightly raised. Larger white highlights to show alertness
- Mouth: Slightly open — a small gap in the line
- Ears: One ear tilted/flopped to the side (natural capybara body language)
- Body: Head tilted ~10° to one side
- Ink work: Similar density to idle but with more dynamic line angles to convey movement/energy
- Mood: "Hmm, I'm not sure I follow..."

### State 4: TEST-TAKING 📝
**When shown**: During the grading phase (S4) when Capy is answering test questions.
- Eyes: Slightly worried, focused downward or at an angle. Concentrated
- Mouth: Tight, flat line — focused determination
- Ears: Slightly flattened back against head. Dense hatching showing tension
- Body: Shoulders slightly raised (tense), leaning slightly forward
- Extra: Small pencil held near face. A few short ink lines near temple suggesting sweat
- Ink work: Densest crosshatching of all states, especially around shoulders and brow. Tension expressed through line weight and density
- Mood: "O-okay, I'll try my best..."

---

## 3. Gemini Image Generation Prompts

> **CRITICAL CONSISTENCY INSTRUCTIONS**
> Generate State 1 (IDLE) first. This becomes the **reference image**.
> For all subsequent states, upload State 1 as reference and ask Gemini to modify only the expression while keeping everything else identical.

### Master Style Prompt (prepend to ALL state prompts)

```
Detailed pen-and-ink illustration of a young capybara, upper body portrait,
slight three-quarter view facing the viewer. Black ink on white background.
Fine linework with crosshatching for shading and volume. Every strand of fur
individually drawn with confident pen strokes. Realistic capybara anatomy —
barrel-shaped body, blunt rounded snout, small rounded ears. Dark solid nose.
Expressive eyes with white highlight dots. The capybara body is entirely
monochrome (black ink, no color). ONLY the loose terracotta bandana/scarf
around the neck has color (#E07A5F). Editorial storybook illustration quality.
Clean, professional, minimal. Transparent background. 512x512 pixels.
```

### State 1: IDLE
```
[MASTER STYLE PROMPT]

Expression: Calm and attentive. Eyes open and relaxed, looking gently at the viewer
with a slight upward gaze. White highlight dot in each eye. Tiny gentle closed-mouth
smile — a single clean curved ink line. Ears in neutral relaxed position, slightly
perked up with fine radiating fur strokes. Posture is still and patient. Medium-density
crosshatching across the body — balanced and even. The lightest, most open linework
of all expressions. The character looks ready and waiting — a student sitting
attentively, at peace. Naturalistic, minimal, elegant.
```

### State 2: THINKING
```
[MASTER STYLE PROMPT]

Same character, same pose, same bandana, same ink illustration style as the
reference image. ONLY change the facial expression and crosshatch density:

Expression: Deep in thought. Eyes half-closed or gazing slightly upward,
contemplative. Eyelids drawn with slightly heavier ink lines. Mouth closed with
a subtle thoughtful pout — a slightly different curve. Both ears slightly angled
back in concentration with denser hatching behind them. Head very slightly lowered.
Overall crosshatching is slightly denser than idle, especially around the brow,
conveying a "heavier" contemplative mood. Like a capybara staring into the middle
distance while processing something.
```

### State 3: CONFUSED
```
[MASTER STYLE PROMPT]

Same character, same pose, same bandana, same ink illustration style as the
reference image. ONLY change the facial expression:

Expression: Confused and curious. Eyes slightly wider with larger white highlight
dots showing alertness. Mouth slightly open — a small gap in the ink line. Head
tilted about 10 degrees to the right. One ear tilted/flopped to the side — natural
capybara body language. No cartoon question marks or sparkles — express confusion
purely through naturalistic pen-and-ink body language. Similar crosshatch density
to idle but with more dynamic line angles suggesting movement energy.
```

### State 4: TEST-TAKING
```
[MASTER STYLE PROMPT]

Same character, same pose, same bandana, same ink illustration style as the
reference image. ONLY change the facial expression and add props:

Expression: Focused and slightly nervous. Eyes concentrated, looking downward or
at an angle. Mouth in a tight flat ink line — focused determination. Ears slightly
flattened back against head with dense hatching showing tension. Shoulders slightly
raised. A small pencil held near the face. A few short ink lines near the temple
suggesting sweat drops. This is the DENSEST crosshatching of all states — especially
around shoulders and brow. The tension is expressed entirely through heavier ink
line weight and tighter crosshatch density. Like a student concentrating hard
during an exam.
```

---

## 4. CSS Implementation Spec

### File Structure
```
public/
  tutee/
    idle.png          ← State 1 (default — also used for "happy" with CSS bounce)
    thinking.png      ← State 2
    confused.png      ← State 3
    test-taking.png   ← State 4
```

### React Component: TuteeAvatar

```tsx
// components/TuteeAvatar.tsx
import { useState, useEffect } from 'react';

type TuteeState = 'idle' | 'thinking' | 'confused' | 'test-taking';

interface TuteeAvatarProps {
  state: TuteeState;
  size?: number; // px, default 200
}

export default function TuteeAvatar({ state, size = 200 }: TuteeAvatarProps) {
  const [currentImage, setCurrentImage] = useState(state);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (state !== currentImage) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentImage(state);
        setIsTransitioning(false);
      }, 150); // half of transition duration
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div
      className="tutee-avatar"
      style={{ width: size, height: size, position: 'relative' }}
    >
      <img
        src={`/tutee/${currentImage}.png`}
        alt={`Capy the Tutee is ${currentImage}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          transform: 'scale(1)',
        }}
      />
      {/* Gentle floating animation */}
      <style jsx>{`
        .tutee-avatar {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
```

### State Transition Logic (when to change states)

```
User is typing         → idle (or keep current)
Message sent           → thinking (while waiting for API response)
Response complete      → idle (with one-shot bounce CSS if new subtopic covered)
Unclear explanation    → confused (before Capy asks a clarifying question)
"I'm Done" clicked     → test-taking (entire grading phase)
Grading complete       → idle (with bounce)
```

### CSS Micro-Animations per State

| State | Extra Animation | CSS |
|-------|----------------|-----|
| idle | Gentle float (bob up/down) | `animation: float 3s ease-in-out infinite` |
| idle (happy) | Bounce + glow (one-shot, triggered programmatically) | `animation: bounce 0.5s ease` |
| thinking | Subtle pulse glow | `box-shadow` pulse on container |
| confused | Slight head wobble | `animation: wobble 2s ease-in-out infinite` |
| test-taking | Gentle tremble | `animation: tremble 0.3s ease-in-out infinite` |

```css
@keyframes wobble {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  25% { transform: rotate(-3deg) translateY(-2px); }
  75% { transform: rotate(3deg) translateY(-2px); }
}

@keyframes bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

@keyframes tremble {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}
```

---

## 5. Integration with Screens

### S3: Teach (Hero Screen)
- Capy avatar: **200×200px**, centered horizontally
- Positioned between topic label and user input area
- Speech bubble floats above Capy (peach `#FFD5C2` background)
- State changes driven by `conversation.tuteeState` from session

### S4: Testing
- Capy avatar: **160×160px**, upper-right area
- Locked in `test-taking` state throughout
- Brief bounce animation on idle state when each question is answered

### S5: Report Card
- Capy avatar: **120×120px**, next to overall score
- State: `idle` with bounce (regardless of score — Capy is happy the user tried)

---

## 6. Naming & Copy

**Character Name**: Capy
**Tagline integration**: "Teach Capy what you've learned. Prove you understand."
**Loading state text**: "Capy is getting ready to learn..."
**Empty state (S3 start)**: "Hi! I'm Capy. I don't know anything about this topic yet — can you teach me?"
**After grading (good score)**: "Wow, you're an amazing teacher! I really learned a lot!"
**After grading (low score)**: "I tried my best on the test... maybe we can go over some parts again?"

---

## 7. Gemini Generation Workflow

### Step-by-step:
1. **Generate State 1 (IDLE) first** — iterate until you love the base design
2. Save as `idle.png`, this is your reference
3. For each remaining state, upload `idle.png` as reference and use the corresponding prompt
4. If Gemini drifts from the reference, add: "Match the exact same character design, fur color, bandana, and art style as the reference image. Only change the facial expression."
5. Export all as **transparent PNG, 512×512**
6. Place in `public/tutee/` directory

### Quality Checklist
- [ ] All 4 images have the same character proportions and ink illustration style
- [ ] Terracotta bandana (#E07A5F) is the ONLY color element — consistent across all states
- [ ] Capybara body is entirely monochrome (black ink, no color fills) in all 4
- [ ] Fur is rendered with individual ink strokes / crosshatching in all states
- [ ] Background is transparent on all
- [ ] Eyes are the same size/position (only expression changes)
- [ ] No extra accessories appear/disappear between states
- [ ] Line weight and quality is consistent (no images look more "digital" or "painted" than others)
- [ ] Crosshatch density varies appropriately: lightest in idle, densest in test-taking
