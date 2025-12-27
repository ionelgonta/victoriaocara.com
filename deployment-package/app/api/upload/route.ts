import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/authHelpers';
import dbConnect from '@/lib/mongodb';
import { saveImageToDisk } from '@/lib/imageStorage';

// Model pentru imagini (salvăm doar metadata în MongoDB)
interface ImageDocument {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string; // URL public către fișierul de pe disk
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

    // Verifică mărimea (max 15MB)
    console.log('File size:', file.size);
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 15MB' }, { status: 400 });
    }

    console.log('Saving image to disk...');
    // Salvează imaginea pe disk în loc de base64
    const imageUrl = await saveImageToDisk(file, 'paintings');
    console.log('Image saved to:', imageUrl);

    // Creează numele fișierului unic
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;

    // Salvează doar metadata în MongoDB
    try {
      await dbConnect();
      
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
        url: imageUrl, // URL public către fișier
        uploadedAt: new Date()
      };
      
      const result = await collection.insertOne(imageDoc);
      await client.close();
      
      console.log('Image metadata saved to MongoDB:', result.insertedId);
      
      // Returnează URL-ul public către fișier
      return NextResponse.json({
        success: true,
        url: imageUrl, // URL direct către fișier, nu base64
        id: result.insertedId,
        fileName: fileName,
        originalName: file.name,
        size: file.size
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fallback: returnează URL-ul fișierului chiar dacă DB eșuează
      console.log('Using fallback: returning file URL directly');
      return NextResponse.json({
        success: true,
        url: imageUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        note: 'Image stored on disk, metadata not saved to DB'
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