import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { isAdmin } from '@/lib/authHelpers';

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

    // Verifică mărimea (max 5MB)
    console.log('File size:', file.size);
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Creează numele fișierului unic
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    console.log('Generated filename:', fileName);

    // Creează directorul uploads dacă nu există
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    console.log('Uploads directory:', uploadsDir);
    
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('Directory created/verified');
    } catch (error) {
      console.log('Directory already exists or error:', error);
    }

    // Salvează fișierul
    const filePath = join(uploadsDir, fileName);
    console.log('Saving file to:', filePath);
    
    await writeFile(filePath, buffer);
    console.log('File saved successfully');

    // Returnează URL-ul public
    const publicUrl = `/uploads/${fileName}`;
    console.log('Public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}