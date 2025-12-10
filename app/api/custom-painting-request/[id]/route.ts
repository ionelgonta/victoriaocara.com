import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CustomPaintingRequest from '@/models/CustomPaintingRequest';
import { isAdmin } from '@/lib/authHelpers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    
    // Update the request
    const updatedRequest = await CustomPaintingRequest.findByIdAndUpdate(
      params.id,
      {
        ...data,
        respondedAt: data.status !== 'pending' ? new Date() : undefined
      },
      { new: true }
    );
    
    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedRequest);
  } catch (error: any) {
    console.error('Update custom painting request error:', error);
    return NextResponse.json({ 
      error: 'Failed to update request',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const deletedRequest = await CustomPaintingRequest.findByIdAndDelete(params.id);
    
    if (!deletedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error: any) {
    console.error('Delete custom painting request error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete request',
      details: error.message 
    }, { status: 500 });
  }
}