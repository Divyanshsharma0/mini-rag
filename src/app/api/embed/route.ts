import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const { text, source, clearPrevious = true } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long' },
        { status: 400 }
      );
    }

    // Clear previous documents if requested
    if (clearPrevious) {
      await ragService.clearVectorStore();
    }

    const stats = await ragService.indexDocument(text, source || 'user_input');

    return NextResponse.json({
      success: true,
      message: 'Document successfully indexed',
      stats,
    });

  } catch (error) {
    console.error('Embed API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to embed document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await ragService.getVectorStoreStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get vector store stats' },
      { status: 500 }
    );
  }
}
