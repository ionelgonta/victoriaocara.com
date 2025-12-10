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
    
    // Validare date pentru câmpuri bilingve
    const titleValid = (data.title && typeof data.title === 'object' && data.title.en && data.title.ro) || 
                      (typeof data.title === 'string' && data.title.trim());
    const descriptionValid = (data.description && typeof data.description === 'object' && data.description.en && data.description.ro) || 
                            (typeof data.description === 'string' && data.description.trim());
    const techniqueValid = (data.technique && typeof data.technique === 'object' && data.technique.en && data.technique.ro) || 
                          (typeof data.technique === 'string' && data.technique.trim());
    
    if (!titleValid || !descriptionValid || !data.price || !techniqueValid) {
      return NextResponse.json({ error: 'Missing required fields or incomplete bilingual data' }, { status: 400 });
    }

    // Validare dimensiuni
    if (!data.dimensions || !data.dimensions.width || !data.dimensions.height) {
      return NextResponse.json({ error: 'Missing dimensions' }, { status: 400 });
    }

    // Generează slug din titlul în engleză sau din string-ul simplu
    const titleForSlug = typeof data.title === 'object' ? data.title.en : data.title;
    const slug = generateSlug(titleForSlug);
    
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
