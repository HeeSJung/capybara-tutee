import { NextRequest } from 'next/server';
import { runTutee } from '@/lib/agents/tutee';
import type { Message } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      conversationHistory,
      topicOutline,
      coveredSubtopics,
    } = body as {
      message: string;
      conversationHistory: Message[];
      topicOutline: string[];
      coveredSubtopics: string[];
    };

    // Validation
    if (!message) {
      return new Response(JSON.stringify({ error: 'Invalid request.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Message is too long. Please keep it under 5000 characters.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Call Tutee agent
    const tuteeResponse = await runTutee(
      message,
      conversationHistory || [],
      topicOutline || [],
      coveredSubtopics || [],
    );

    // Create SSE stream with word-by-word delivery
    const encoder = new TextEncoder();
    const words = tuteeResponse.message.split(' ');

    const stream = new ReadableStream({
      async start(controller) {
        // Stream words as token events
        for (let i = 0; i < words.length; i++) {
          const token = i === 0 ? words[i] : ' ' + words[i];
          const event = `event: token\ndata: ${JSON.stringify({ token })}\n\n`;
          controller.enqueue(encoder.encode(event));
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        // Send final done event with full structured response
        const uncoveredSubtopics = (topicOutline || []).filter(
          (t: string) => !tuteeResponse.coveredSubtopics.includes(t),
        );
        const doneEvent = `event: done\ndata: ${JSON.stringify({
          message: tuteeResponse.message,
          state: 'idle',
          coveredSubtopics: tuteeResponse.coveredSubtopics,
          uncoveredSubtopics,
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
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Connection lost. Please retry.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
