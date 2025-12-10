import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('art-gallery');
    const collection = db.collection('images');
    
    const image = await collection.findOne({ _id: new ObjectId(params.id) });
    await client.close();
    
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Returnează imaginea ca base64 data URL
    const dataUrl = `data:${image.mimeType};base64,${image.data}`;
    
    return NextResponse.json({
      url: dataUrl,
      filename: image.filename,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size
    });
    
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}