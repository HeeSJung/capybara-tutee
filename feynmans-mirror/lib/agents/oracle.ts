import Anthropic from '@anthropic-ai/sdk';
import type { OracleOutput } from '@/lib/types';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an Oracle agent for a study tool. Your job is to analyze source material and generate educational assessment content.

Given a source text and a subtopic, you must:
1. Extract a topic outline — a list of key subtopic names relevant to the specified subtopic (just names, no detailed content)
2. Generate 5-10 test questions that assess conceptual understanding of the subtopic (not rote recall)
3. Create an answer key with expected answers, key concepts, and source excerpts

Rules:
- Extract ONLY from the provided source text. Do not use outside knowledge.
- Questions should test understanding, not memorization.
- Answer keys should list key concepts that allow for paraphrased correct answers.
- Generate between 5 and 10 questions. Never fewer than 3.`;

const TOOL_DEFINITION: Anthropic.Tool = {
  name: 'generate_assessment',
  description: 'Generate a structured educational assessment from source material',
  input_schema: {
    type: 'object' as const,
    properties: {
      topicOutline: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of key subtopic names relevant to the specified topic',
      },
      testQuestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique question ID (q1, q2, etc.)' },
            question: { type: 'string', description: 'The test question' },
          },
          required: ['id', 'question'],
        },
        description: '5-10 test questions assessing conceptual understanding',
      },
      answerKey: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string', description: 'References a testQuestion id' },
            expectedAnswer: { type: 'string', description: 'The correct answer from the source' },
            keyConcepts: {
              type: 'array',
              items: { type: 'string' },
              description: 'Core concepts that must be present for a correct answer',
            },
            sourceExcerpt: { type: 'string', description: 'Relevant excerpt from source material' },
          },
          required: ['questionId', 'expectedAnswer', 'keyConcepts', 'sourceExcerpt'],
        },
        description: 'Answer key entries matching each test question',
      },
    },
    required: ['topicOutline', 'testQuestions', 'answerKey'],
  },
};

export async function runOracle(
  sourceText: string,
  subtopic: string,
): Promise<OracleOutput> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    tools: [TOOL_DEFINITION],
    tool_choice: { type: 'tool', name: 'generate_assessment' },
    messages: [
      {
        role: 'user',
        content: `Source Material:\n\n${sourceText}\n\nSubtopic to assess: ${subtopic}`,
      },
    ],
  });

  const toolUseBlock = response.content.find(
    (block) => block.type === 'tool_use',
  );

  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('Oracle failed: no tool_use block in response');
  }

  return toolUseBlock.input as OracleOutput;
}
