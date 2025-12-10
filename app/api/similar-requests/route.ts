import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SimilarRequest from '@/models/SimilarRequest';
import Painting from '@/models/Painting';
import { isAdmin } from '@/lib/authHelpers';

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const requests = await SimilarRequest.find()
      .populate('soldPaintingId', 'title slug price images')
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
    if (!data.soldPaintingId || !data.customerName || !data.customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verifică dacă tabloul există și este vândut
    const painting = await Painting.findById(data.soldPaintingId);
    if (!painting) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }

    if (!painting.sold) {
      return NextResponse.json({ error: 'This painting is not sold' }, { status: 400 });
    }

    // Creează cererea
    const request = await SimilarRequest.create(data);
    
    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error('Create similar request error:', error);
    return NextResponse.json({ 
      error: 'Failed to create request',
      details: error.message 
    }, { status: 500 });
  }
}