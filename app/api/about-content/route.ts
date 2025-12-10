import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { writeFile } from 'fs/promises';
import path from 'path';

// Model pentru conținutul paginii Despre
interface AboutContent {
  artistPhoto: string;
  title: string;
  subtitle: string;
  description: string;
  specialties: string[];
}

// Salvăm conținutul într-un fișier JSON pentru simplitate
const ABOUT_CONTENT_FILE = path.join(process.cwd(), 'data', 'about-content.json');

export async function GET() {
  try {
    // Încearcă să citească fișierul existent
    const fs = require('fs');
    if (fs.existsSync(ABOUT_CONTENT_FILE)) {
      const content = fs.readFileSync(ABOUT_CONTENT_FILE, 'utf8');
      return NextResponse.json(JSON.parse(content));
    }
    
    // Returnează conținutul implicit
    const defaultContent: AboutContent = {
      artistPhoto: '/uploads/victoria-studio-photo.jpg',
      title: 'Victoria Ocara',
      subtitle: 'Artistă specializată în pictura cu ulei',
      description: 'Sunt o artistă pasionată de pictura cu ulei, specializată în peisaje urbane iconice și apusuri dramatice.',
      specialties: ['Pictura cu Ulei', 'Peisaje Urbane', 'Tehnica Impasto', 'Apusuri Dramatice']
    };
    
    return NextResponse.json(defaultContent);
  } catch (error) {
    console.error('Error reading about content:', error);
    return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const aboutContent: AboutContent = await req.json();
    
    // Validare de bază
    if (!aboutContent.title || !aboutContent.artistPhoto) {
      return NextResponse.json({ error: 'Title and artist photo are required' }, { status: 400 });
    }
    
    // Creează directorul data dacă nu există
    const fs = require('fs');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Salvează conținutul în fișier
    await writeFile(ABOUT_CONTENT_FILE, JSON.stringify(aboutContent, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'About content updated successfully',
      content: aboutContent 
    });
  } catch (error) {
    console.error('Error saving about content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}