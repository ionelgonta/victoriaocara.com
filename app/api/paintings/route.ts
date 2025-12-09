import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Painting from '@/models/Painting';
import { generateSlug } from '@/lib/utils';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    
    const query = featured === 'true' ? { featured: true } : {};
    const paintings = await Painting.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(paintings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch paintings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    const slug = generateSlug(data.title);
    const painting = await Painting.create({ ...data, slug });
    
    return NextResponse.json(painting, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create painting' }, { status: 500 });
  }
}
