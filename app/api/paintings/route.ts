import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Painting from '@/models/Painting';
import { generateSlug } from '@/lib/utils';
import { isAdmin } from '@/lib/authHelpers';

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
    console.log('POST /api/paintings called');
    const adminCheck = isAdmin(req);
    console.log('Admin check result:', adminCheck);
    
    if (!adminCheck) {
      console.log('Authorization failed');
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'Admin access required'
      }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    // Validare date
    if (!data.title || !data.description || !data.price || !data.technique) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validare dimensiuni
    if (!data.dimensions || !data.dimensions.width || !data.dimensions.height) {
      return NextResponse.json({ error: 'Missing dimensions' }, { status: 400 });
    }

    const slug = generateSlug(data.title);
    
    // Verifică dacă slug-ul există deja
    const existingPainting = await Painting.findOne({ slug });
    if (existingPainting) {
      return NextResponse.json({ error: 'A painting with this title already exists' }, { status: 400 });
    }

    const painting = await Painting.create({ ...data, slug });
    
    return NextResponse.json(painting, { status: 201 });
  } catch (error: any) {
    console.error('Create painting error:', error);
    return NextResponse.json({ 
      error: 'Failed to create painting',
      details: error.message 
    }, { status: 500 });
  }
}
