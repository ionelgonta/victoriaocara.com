import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PriceOffer from '@/models/PriceOffer';
import { isAdmin } from '@/lib/authHelpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const offer = await PriceOffer.findById(params.id).populate('paintingId');
    
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    
    return NextResponse.json(offer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    const updateData: any = {
      status: data.status,
      respondedAt: new Date(),
    };

    if (data.adminResponse) {
      updateData.adminResponse = data.adminResponse;
    }

    if (data.counterOffer) {
      updateData.counterOffer = data.counterOffer;
    }
    
    const offer = await PriceOffer.findByIdAndUpdate(params.id, updateData, { new: true });
    
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    
    return NextResponse.json(offer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const offer = await PriceOffer.findByIdAndDelete(params.id);
    
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Offer deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete offer' }, { status: 500 });
  }
}