import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CustomPaintingRequest from '@/models/CustomPaintingRequest';
import { isAdmin } from '@/lib/authHelpers';

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const requests = await CustomPaintingRequest.find()
      .sort({ createdAt: -1 });
    
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // Validare date
    if (!data.name || !data.email || !data.phone || !data.size || !data.style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verifică dacă există descriere sau foto
    if (!data.description && !data.photo_url) {
      return NextResponse.json({ error: 'Either description or photo is required' }, { status: 400 });
    }

    // Creează cererea
    const requestData = {
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      size: data.size,
      style: data.style,
      artistStyleDescription: data.style === 'artist_style' ? data.artistStyleDescription : undefined,
      description: data.description,
      photoUrl: data.photo_url,
    };

    const request = await CustomPaintingRequest.create(requestData);
    
    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error('Create custom painting request error:', error);
    return NextResponse.json({ 
      error: 'Failed to create request',
      details: error.message 
    }, { status: 500 });
  }
}