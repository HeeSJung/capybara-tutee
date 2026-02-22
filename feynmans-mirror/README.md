# Smart Capy

An AI tutee app where you teach a capybara what you've learned — and it tests whether you truly understand.

Built for **HackED 2026** at University of Alberta.

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Claude Haiku 4.5 (tutee agent)
- Gemini 2.0 Flash (oracle + grader agents)
- Animalese voice synthesis

## How It Works

Smart Capy uses a 3-agent AI architecture to evaluate your understanding through teaching:

1. **Upload** — Upload a PDF or paste your study notes
2. **Topic** — The AI oracle reads your material and generates a topic outline
3. **Teach** — Chat with Capy, explain concepts, and answer Capy's follow-up questions
4. **Report** — Capy takes a test based on your teaching, and you see a detailed grade breakdown

## Setup

```bash
git clone https://github.com/HeeSJung/capybara-tutee.git
cd capybara-tutee/feynmans-mirror
cp .env.example .env.local
# Add your API keys to .env.local
npm install
npm run dev
```

## Required API Keys

| Key | Where to get it |
|-----|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |
