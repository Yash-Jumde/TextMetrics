// frontend/src/app/api/score/route.ts
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  const { text } = await request.json();
  
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze text');
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/entries/`);
    if (!response.ok) {
      throw new Error('Failed to fetch entries');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// Add DELETE method handler
export async function DELETE(request: Request) {
  try {
    // Extract ID from the URL
    const id = new URL(request.url).searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing entry ID' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete entry');
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete entry' },
      { status: 500 }
    );
  }
}