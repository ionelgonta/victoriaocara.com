import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/sqlite';
import { generateSlug } from '@/lib/utils';
import { isAdmin } from '@/lib/authHelpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDatabase();
    const painting = await db.getPaintingById(params.id);
    
    if (!painting) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }
    
    return NextResponse.json(painting);
  } catch (error) {
    console.error('Failed to fetch painting:', error);
    return NextResponse.json({ error: 'Failed to fetch painting' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    const data = await req.json();
    
    if (data.title) {
      // Generează slug din titlul în engleză sau din string-ul simplu
      const titleForSlug = typeof data.title === 'object' ? data.title.en : data.title;
      data.slug = generateSlug(titleForSlug);
    }
    
    const painting = await db.updatePainting(params.id, data);
    
    if (!painting) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }
    
    return NextResponse.json(painting);
  } catch (error) {
    console.error('Failed to update painting:', error);
    return NextResponse.json({ error: 'Failed to update painting' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabase();
    const result = await db.deletePainting(params.id);
    
    if (!result.deleted) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Painting deleted' });
  } catch (error) {
    console.error('Failed to delete painting:', error);
    return NextResponse.json({ error: 'Failed to delete painting' }, { status: 500 });
  }
}
