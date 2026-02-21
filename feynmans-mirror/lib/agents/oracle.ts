import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { OracleOutput } from '@/lib/types';

const client = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

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

const responseSchema: import('@google/generative-ai').ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    topicOutline: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    testQuestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING },
        },
        required: ['id', 'question'],
      },
    },
    answerKey: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionId: { type: SchemaType.STRING },
          expectedAnswer: { type: SchemaType.STRING },
          keyConcepts: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          sourceExcerpt: { type: SchemaType.STRING },
        },
        required: ['questionId', 'expectedAnswer', 'keyConcepts', 'sourceExcerpt'],
      },
    },
  },
  required: ['topicOutline', 'testQuestions', 'answerKey'],
};

export async function runOracle(
  sourceText: string,
  subtopic: string,
): Promise<OracleOutput> {
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const result = await model.generateContent(
    `Source Material:\n\n${sourceText}\n\nSubtopic to assess: ${subtopic}`,
  );

  return JSON.parse(result.response.text()) as OracleOutput;
}
