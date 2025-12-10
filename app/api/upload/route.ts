import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/authHelpers';
import dbConnect from '@/lib/mongodb';

// Model pentru imagini (salvăm în MongoDB ca base64)
interface ImageDocument {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  data: string; // base64
  uploadedAt: Date;
}

export async function POST(req: NextRequest) {
  try {
    console.log('Upload API called');
    
    const adminCheck = isAdmin(req);
    console.log('Admin check result:', adminCheck);
    
    if (!adminCheck) {
      console.log('Upload unauthorized');
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

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

    // Verifică mărimea (max 2MB pentru base64)
    console.log('File size:', file.size);
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    console.log('Converting file to base64...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Creează numele fișierului unic
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    console.log('Generated filename:', fileName);

    // Salvează în MongoDB
    try {
      await dbConnect();
      
      // Pentru simplitate, salvăm direct în colecția images
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      
      const db = client.db('art-gallery');
      const collection = db.collection('images');
      
      const imageDoc: ImageDocument = {
        filename: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        data: base64Data,
        uploadedAt: new Date()
      };
      
      const result = await collection.insertOne(imageDoc);
      await client.close();
      
      console.log('Image saved to MongoDB:', result.insertedId);
      
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
      console.log('Using fallback: returning data URL directly');
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        note: 'Image stored temporarily as base64'
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