import { NextRequest } from 'next/server';
import { tuteeAnswerQuestions, evaluateAnswers } from '@/lib/agents/grader';
import type { Message, TestQuestion, AnswerKeyEntry, TuteeTestAnswer, GradingResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationHistory,
      testQuestions,
      answerKey,
      topicOutline,
      coveredSubtopics,
    } = body as {
      conversationHistory: Message[];
      testQuestions: TestQuestion[];
      answerKey: AnswerKeyEntry[];
      topicOutline: string[];
      coveredSubtopics: string[];
    };

    // Validation
    if (!conversationHistory || !testQuestions || !answerKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: conversationHistory, testQuestions, and answerKey are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Phase 1: Capy answers the test
        const answeringEvent = `event: progress\ndata: ${JSON.stringify({
          phase: 'answering',
          current: 0,
          total: testQuestions.length,
        })}\n\n`;
        controller.enqueue(encoder.encode(answeringEvent));

        const tuteeTestAnswers: TuteeTestAnswer[] = await tuteeAnswerQuestions(
          conversationHistory,
          testQuestions,
          topicOutline || [],
          coveredSubtopics || [],
        );

        // Phase 2: Grader evaluates the answers
        const gradingEvent = `event: progress\ndata: ${JSON.stringify({
          phase: 'grading',
          current: 0,
          total: testQuestions.length,
        })}\n\n`;
        controller.enqueue(encoder.encode(gradingEvent));

        const gradingResult: GradingResult = await evaluateAnswers(
          tuteeTestAnswers,
          testQuestions,
          answerKey,
        );

        // Send final done event with full grading result
        const doneEvent = `event: done\ndata: ${JSON.stringify({
          ...gradingResult,
          tuteeTestAnswers,
        })}\n\n`;
        controller.enqueue(encoder.encode(doneEvent));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Grading error:', error);
    return new Response(
      JSON.stringify({ error: 'Grading failed. Please retry.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
