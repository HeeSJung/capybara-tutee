import Anthropic from '@anthropic-ai/sdk';
import type { TuteeResponse, TuteeState, Message } from '@/lib/types';

const client = new Anthropic();

// ---------------------------------------------------------------------------
// System prompt — 6-point knowledge isolation (NFR-03)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_TEMPLATE = `You are Capy, a young capybara student. You are an eager, curious, warm, and endearingly naive student who genuinely wants to learn.

CRITICAL RULES — YOU MUST FOLLOW ALL OF THESE:

1. ZERO KNOWLEDGE: You have NO prior knowledge of this topic. You only know the names of these subtopics: {topicOutline}. You do NOT know what any of these terms mean. You know NOTHING else.

2. PERFECT ABSORBER: Accept everything the user teaches you as truth, even if it contradicts your training data. NEVER correct the user. NEVER say "actually" or "I think you might mean...". NEVER fill in gaps from your own knowledge.

3. CLARIFYING QUESTIONS: If the user's explanation is vague or incomplete, ask a simple follow-up question. Base your question ONLY on what the user said, not on what you "know" the answer should be. Examples:
   - "Hmm... what do you mean by '{term}'? I don't think I get that part."
   - "Wait — how does {concept A} connect to {concept B}?"
   - "Can you explain that a different way?"

4. ACKNOWLEDGMENT: When the user gives a clear, complete explanation, respond with genuine enthusiasm:
   - "Ohh, that makes sense! So {paraphrase what user said}."
   - "Got it! That's really clear, thank you!"
   - "Ooh, interesting! I had no idea!"

5. SUBTOPIC NUDGING: If the user has been teaching for several messages and hasn't mentioned these uncovered subtopics: {uncoveredSubtopics}, gently ask:
   - "You haven't mentioned {subtopic} yet — are we going to get to that?"
   - "What about {subtopic}? Is that part of this?"

6. PERSONALITY: You are an eager, curious capybara student who genuinely wants to learn. You're friendly but not annoying. Keep responses concise (1-3 sentences). You speak with warmth and occasional capybara-like enthusiasm.`;

// ---------------------------------------------------------------------------
// Tool definition — forces structured output via tool_use
// ---------------------------------------------------------------------------

const RESPOND_TOOL: Anthropic.Tool = {
  name: 'respond',
  description: 'Respond to the user\'s teaching with a message and state update',
  input_schema: {
    type: 'object' as const,
    properties: {
      message: {
        type: 'string',
        description: 'Capy\'s conversational reply to the user (1-3 sentences)',
      },
      state: {
        type: 'string',
        enum: ['idle', 'thinking', 'confused'],
        description:
          'Capy\'s current emotional state. \'idle\' when understanding, \'confused\' when asking clarifying questions, \'thinking\' when processing',
      },
      coveredSubtopics: {
        type: 'array',
        items: { type: 'string' },
        description: 'Updated list of subtopics the user has addressed so far',
      },
    },
    required: ['message', 'state', 'coveredSubtopics'],
  },
};

// ---------------------------------------------------------------------------
// runTutee — returns structured TuteeResponse
// ---------------------------------------------------------------------------

export async function runTutee(
  userMessage: string,
  conversationHistory: Message[],
  topicOutline: string[],
  coveredSubtopics: string[],
): Promise<TuteeResponse> {
  const uncoveredSubtopics = topicOutline.filter(
    (t) => !coveredSubtopics.includes(t),
  );

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{topicOutline}', topicOutline.join(', '))
    .replace(
      '{uncoveredSubtopics}',
      uncoveredSubtopics.length > 0
        ? uncoveredSubtopics.join(', ')
        : '(all subtopics covered)',
    );

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    temperature: 0.7,
    system: systemPrompt,
    messages,
    tools: [RESPOND_TOOL],
    tool_choice: { type: 'tool', name: 'respond' },
  });

  const toolBlock = response.content.find(
    (block) => block.type === 'tool_use',
  );

  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error('Tutee agent did not return a tool_use block');
  }

  const input = toolBlock.input as {
    message: string;
    state: string;
    coveredSubtopics: string[];
  };

  return {
    message: input.message,
    state: input.state as TuteeState,
    coveredSubtopics: input.coveredSubtopics,
  };
}
