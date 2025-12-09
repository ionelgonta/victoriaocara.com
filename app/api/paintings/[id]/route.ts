import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Painting from '@/models/Painting';
import { generateSlug } from '@/lib/utils';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const painting = await Painting.findById(params.id);
    
    if (!painting) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }
    
    return NextResponse.json(painting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch painting' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    if (data.title) {
      data.slug = generateSlug(data.title);
    }
    
    const painting = await Painting.findByIdAndUpdate(params.id, data, { new: true });
    
    if (!painting) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }
    
    return NextResponse.json(painting);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update painting' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const painting = await Painting.findByIdAndDelete(params.id);
    
    if (!painting) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Painting deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete painting' }, { status: 500 });
  }
}
