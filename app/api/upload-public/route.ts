import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

// Model pentru imagini publice (pentru cereri de pictură personalizată)
interface PublicImageDocument {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  data: string; // base64
  uploadedAt: Date;
  type: 'custom_painting_request';
}

export async function POST(req: NextRequest) {
  try {
    console.log('Public upload API called');
    
    console.log('Getting form data...');
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    console.log('File received:', file ? `${file.name} (${file.size} bytes)` : 'No file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Verifică tipul fișierului
    console.log('File type:', file.type);
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Verifică mărimea (max 10MB pentru cereri publice)
    console.log('File size:', file.size);
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    console.log('Converting file to base64...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Creează numele fișierului unic
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `custom_${timestamp}_${originalName}`;
    console.log('Generated filename:', fileName);

    // Salvează în MongoDB
    try {
      await dbConnect();
      
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      
      const db = client.db('art-gallery');
      const collection = db.collection('public_images');
      
      const imageDoc: PublicImageDocument = {
        filename: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        data: base64Data,
        uploadedAt: new Date(),
        type: 'custom_painting_request'
      };
      
      const result = await collection.insertOne(imageDoc);
      await client.close();
      
      console.log('Public image saved to MongoDB:', result.insertedId);
      
      // Returnează data URL pentru afișare imediată
      return NextResponse.json({
        success: true,
        url: dataUrl,
        id: result.insertedId,
        fileName: fileName,
        originalName: file.name,
        size: file.size
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fallback: returnează direct data URL (temporar)
      console.log('Fallback: returning data URL without saving to DB');
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        fallback: true
      });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}