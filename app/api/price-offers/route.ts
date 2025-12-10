import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PriceOffer from '@/models/PriceOffer';
import Painting from '@/models/Painting';
import { isAdmin } from '@/lib/authHelpers';

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const offers = await PriceOffer.find()
      .populate('paintingId', 'title slug price')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(offers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    
    // Validare date
    if (!data.paintingId || !data.customerName || !data.customerEmail || !data.offeredPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verifică dacă tabloul există și este negociabil
    const painting = await Painting.findById(data.paintingId);
    if (!painting) {
      return NextResponse.json({ error: 'Painting not found' }, { status: 404 });
    }

    if (!painting.negotiable) {
      return NextResponse.json({ error: 'This painting is not negotiable' }, { status: 400 });
    }

    if (painting.sold) {
      return NextResponse.json({ error: 'This painting is already sold' }, { status: 400 });
    }

    // Creează oferta
    const offer = await PriceOffer.create({
      ...data,
      originalPrice: painting.price,
    });
    
    return NextResponse.json(offer, { status: 201 });
  } catch (error: any) {
    console.error('Create offer error:', error);
    return NextResponse.json({ 
      error: 'Failed to create offer',
      details: error.message 
    }, { status: 500 });
  }
}