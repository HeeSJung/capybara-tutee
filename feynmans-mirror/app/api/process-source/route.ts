import { NextRequest, NextResponse } from 'next/server';
import { runOracle } from '@/lib/agents/oracle';
import { extractTextFromPDF } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let sourceText = '';
    let subtopic = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      subtopic = (formData.get('subtopic') as string) || '';

      if (!file && !formData.get('sourceText')) {
        return NextResponse.json(
          { error: 'Please upload a PDF or paste your notes.' },
          { status: 400 },
        );
      }

      if (file) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          sourceText = await extractTextFromPDF(buffer);
        } catch {
          return NextResponse.json(
            { error: "We couldn't read your PDF. Try pasting the text directly." },
            { status: 422 },
          );
        }
      } else {
        sourceText = (formData.get('sourceText') as string) || '';
      }
    } else {
      const body = await request.json();
      sourceText = body.sourceText || '';
      subtopic = body.subtopic || '';
    }

    // Validation
    if (!sourceText) {
      return NextResponse.json(
        { error: 'Please upload a PDF or paste your notes.' },
        { status: 400 },
      );
    }
    if (!subtopic) {
      return NextResponse.json(
        { error: 'Please specify a subtopic to teach.' },
        { status: 400 },
      );
    }
    if (sourceText.length < 500) {
      return NextResponse.json(
        {
          error:
            'Your source material is too short. Please provide more detailed notes (at least a few paragraphs).',
        },
        { status: 400 },
      );
    }

    // Call Oracle agent
    const result = await runOracle(sourceText, subtopic);

    // Validate question count (FR-22)
    if (result.testQuestions.length < 3) {
      return NextResponse.json(
        {
          error:
            "We couldn't generate enough questions from this source. Try a more detailed source or a broader subtopic.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      topicOutline: result.topicOutline,
      subtopic,
      testQuestions: result.testQuestions,
      answerKey: result.answerKey,
      questionCount: result.testQuestions.length,
    });
  } catch (error) {
    console.error('Process source error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
