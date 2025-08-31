import { NextRequest, NextResponse } from 'next/server';
import { ragService } from '@/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const { query, topK, rerankTopK } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (query.trim().length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters long' },
        { status: 400 }
      );
    }

    const response = await ragService.query(
      query,
      topK || 8,
      rerankTopK || 3
    );

    return NextResponse.json({
      success: true,
      ...response,
    });

  } catch (error) {
    console.error('Query API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
