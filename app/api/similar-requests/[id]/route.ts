import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SimilarRequest from '@/models/SimilarRequest';
import { isAdmin } from '@/lib/authHelpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const request = await SimilarRequest.findById(params.id).populate('soldPaintingId');
    
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
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

    if (data.adminNotes) {
      updateData.adminNotes = data.adminNotes;
    }

    if (data.estimatedPrice) {
      updateData.estimatedPrice = data.estimatedPrice;
    }

    if (data.estimatedDelivery) {
      updateData.estimatedDelivery = data.estimatedDelivery;
    }
    
    const request = await SimilarRequest.findByIdAndUpdate(params.id, updateData, { new: true });
    
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const request = await SimilarRequest.findByIdAndDelete(params.id);
    
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Request deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}