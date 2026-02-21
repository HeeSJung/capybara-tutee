import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type {
  Message,
  TestQuestion,
  AnswerKeyEntry,
  TuteeTestAnswer,
  GradingResult,
  QuestionResult,
} from '@/lib/types';

const client = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// ---------------------------------------------------------------------------
// 1. tuteeAnswerQuestions — Capy answers the test based on what was taught
// ---------------------------------------------------------------------------

const TUTEE_TEST_PROMPT = `You are Capy, a young capybara student who just finished a teaching session. Now you must take a test.

CRITICAL RULES:
1. Answer ONLY based on what was taught in the conversation history below. You learned NOTHING else.
2. If a topic was NEVER discussed in the conversation, you MUST answer "I don't know — we didn't cover this."
3. Do NOT use any knowledge beyond what the user explicitly taught you.
4. For each answer, assess your confidence:
   - "high": The user clearly and thoroughly explained this concept
   - "low": The user mentioned this briefly or partially
   - "none": This was never discussed — answer "I don't know"
5. Stay in character as an eager student recalling what you were taught.`;

const ANSWERS_SCHEMA: import('@google/generative-ai').ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    answers: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionId: { type: SchemaType.STRING },
          answer: { type: SchemaType.STRING },
          confidence: { type: SchemaType.STRING, format: 'enum', enum: ['high', 'low', 'none'] },
        },
        required: ['questionId', 'answer', 'confidence'],
      },
    },
  },
  required: ['answers'],
};

export async function tuteeAnswerQuestions(
  conversationHistory: Message[],
  testQuestions: TestQuestion[],
  topicOutline: string[],
  coveredSubtopics: string[],
): Promise<TuteeTestAnswer[]> {
  const conversationText = conversationHistory
    .map((m) => `${m.role === 'user' ? 'Teacher' : 'Capy'}: ${m.content}`)
    .join('\n\n');

  const questionsText = testQuestions
    .map((q) => `${q.id}: ${q.question}`)
    .join('\n');

  const uncovered = topicOutline.filter((t) => !coveredSubtopics.includes(t));

  const userMessage = `Here is the conversation where I was taught:

---CONVERSATION START---
${conversationText}
---CONVERSATION END---

Topics that were covered: ${coveredSubtopics.join(', ') || 'none'}
Topics that were NOT covered: ${uncovered.join(', ') || 'none'}

Now answer these test questions based ONLY on what was taught above:

${questionsText}`;

  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: TUTEE_TEST_PROMPT,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: ANSWERS_SCHEMA,
    },
  });

  const result = await model.generateContent(userMessage);
  const parsed = JSON.parse(result.response.text()) as { answers: TuteeTestAnswer[] };
  return parsed.answers;
}

// ---------------------------------------------------------------------------
// 2. evaluateAnswers — Grade Capy's answers against the answer key
// ---------------------------------------------------------------------------

const GRADER_PROMPT = `You are a fair, constructive grader evaluating a student's test answers against an answer key.

GRADING RULES:
1. Compare MEANING, not exact wording. If the student captures the key concepts, mark it correct.
2. A paraphrased correct answer IS correct.
3. If the student said "I don't know" or similar, mark it incorrect with gap: "This topic was not covered during teaching."
4. For wrong or incomplete answers, provide a constructive gap description:
   - "Your explanation missed [specific concept]"
   - "You described X but didn't cover Y, which is essential"
   - "This topic was not covered during teaching"
5. Be generous but fair — partial understanding with key concepts present = correct.
6. Count the total correct answers for the overall score.`;

const GRADING_SCHEMA: import('@google/generative-ai').ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questionResults: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionId: { type: SchemaType.STRING },
          isCorrect: { type: SchemaType.BOOLEAN },
          gap: { type: SchemaType.STRING },
        },
        required: ['questionId', 'isCorrect'],
      },
    },
  },
  required: ['questionResults'],
};

export async function evaluateAnswers(
  tuteeAnswers: TuteeTestAnswer[],
  testQuestions: TestQuestion[],
  answerKey: AnswerKeyEntry[],
): Promise<GradingResult> {
  const comparisonText = testQuestions
    .map((q) => {
      const answer = tuteeAnswers.find((a) => a.questionId === q.id);
      const key = answerKey.find((k) => k.questionId === q.id);
      return `Question ${q.id}: ${q.question}
Student's answer: ${answer?.answer ?? 'No answer provided'}
Expected answer: ${key?.expectedAnswer ?? 'N/A'}
Key concepts required: ${key?.keyConcepts.join(', ') ?? 'N/A'}`;
    })
    .join('\n\n---\n\n');

  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: GRADER_PROMPT,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: GRADING_SCHEMA,
    },
  });

  const result = await model.generateContent(
    `Grade the following test answers:\n\n${comparisonText}`,
  );

  const parsed = JSON.parse(result.response.text()) as {
    questionResults: Array<{ questionId: string; isCorrect: boolean; gap?: string }>;
  };

  // Build the full QuestionResult array with all fields
  // Match by index as fallback since Gemini may return different questionId formats
  const questionResults: QuestionResult[] = parsed.questionResults.map((r, idx) => {
    const q = testQuestions.find((tq) => tq.id === r.questionId) ?? testQuestions[idx];
    const qId = q?.id ?? r.questionId;
    const a = tuteeAnswers.find((ta) => ta.questionId === qId) ?? tuteeAnswers[idx];
    const k = answerKey.find((ak) => ak.questionId === qId) ?? answerKey[idx];

    return {
      questionId: qId,
      question: q?.question ?? '',
      tuteeAnswer: a?.answer ?? '',
      expectedAnswer: k?.expectedAnswer ?? '',
      isCorrect: r.isCorrect,
      ...(r.gap ? { gap: r.gap } : {}),
    };
  });

  const overallScore = questionResults.filter((r) => r.isCorrect).length;
  const totalQuestions = testQuestions.length;

  return {
    overallScore,
    totalQuestions,
    percentage: totalQuestions > 0 ? Math.round((overallScore / totalQuestions) * 100) : 0,
    questionResults,
  };
}
