# 🧡 Smart Capy

> Teach a capybara what you learned — then watch it take a test.

Smart Capy is an AI-powered tutee app that helps you study by flipping the script: instead of being tested, you teach an adorable capybara named Capy. After your teaching session, Capy takes a test — and you get a report revealing where your understanding breaks down.

Built solo for **HackED 2026** at the University of Alberta.

## 🎬 Demo

[![Smart Capy Demo](https://img.youtube.com/vi/EunbNQwdYW8/maxresdefault.jpg)](https://youtu.be/EunbNQwdYW8)

## How It Works

Smart Capy uses a **3-agent AI architecture** to validate your understanding through teaching:

| Step | Screen | What happens |
|------|--------|-------------|
| 1 | **Upload** | Upload a PDF or paste your study notes |
| 2 | **Topic** | AI reads your material and generates a topic outline — pick what to teach |
| 3 | **Teach** | Chat with Capy, explain concepts, answer Capy's follow-up questions |
| 4 | **Report** | Capy takes a test based on your teaching — see a detailed grade breakdown |

### The 3 AI Agents

- **Tutee** (Claude Haiku 4.5) — The capybara student. Has zero knowledge of the topic and only learns from what you teach. Asks follow-up questions when your explanation is vague.
- **Oracle** (Gemini 2.0 Flash) — Reads your source material and generates test questions + answer key. Never seen by the user.
- **Grader** (Gemini 2.0 Flash) — Capy answers the test based only on what you taught, then the grader evaluates against the answer key and identifies your teaching gaps.

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: Claude Haiku 4.5 (Anthropic API), Gemini 2.0 Flash (Google AI)
- **PDF Parsing**: unpdf
- **Voice**: Animalese voice synthesis (Animal Crossing-style gibberish)
- **Character Art**: Custom capybara sprites with state-based animations

## Getting Started

### Prerequisites

- Node.js 20+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- Google AI API key ([aistudio.google.com](https://aistudio.google.com))

### Setup

```bash
git clone https://github.com/HeeSJung/capybara-tutee.git
cd capybara-tutee/feynmans-mirror
cp .env.example .env.local
# Add your API keys to .env.local
npm install
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Haiku 4.5 |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI key for Gemini 2.0 Flash |

## Acknowledgments

This project uses the following third-party libraries and assets:

| Library / Asset | Author | License | Usage |
|----------------|--------|---------|-------|
| [animalese.js](https://github.com/acedio/animalese.js) | Josh Simmons | GPL | Animal Crossing-style voice synthesis |
| [riffwave.js](https://github.com/nickytonline/riffwave.js) | Pedro Ladaria | Public Domain | WAV audio generation |
| [Nexila font](https://fontesk.com/nexila-font/) | Fontesk | Free for personal use | UI display font |
| [unpdf](https://github.com/unjs/unpdf) | unjs | MIT | PDF text extraction |
| [Next.js](https://nextjs.org/) | Vercel | MIT | React framework |
| [Tailwind CSS](https://tailwindcss.com/) | Tailwind Labs | MIT | Utility-first CSS |
| [Anthropic Claude API](https://docs.anthropic.com/) | Anthropic | Commercial API | Tutee agent |
| [Google Gemini API](https://ai.google.dev/) | Google | Commercial API | Oracle + Grader agents |

## License

This project was built for HackED 2026. All code is original work by the developer except for the third-party libraries listed above.
