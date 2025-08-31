import { NextRequest, NextResponse } from 'next/server';
import { processFile } from '@/lib/fileProcessing';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const source = formData.get('source') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // File size check (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Process the file
    const processedFile = await processFile(file);

    return NextResponse.json({
      success: true,
      text: processedFile.text,
      fileName: processedFile.fileName,
      fileType: processedFile.fileType,
      size: processedFile.size,
      source: source || processedFile.fileName,
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
