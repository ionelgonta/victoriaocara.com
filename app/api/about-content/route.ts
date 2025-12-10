import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/authHelpers';

// Model pentru conținutul paginii Despre
interface AboutContent {
  artistPhoto: string;
  title: string;
  subtitle: string;
  description: string;
  specialties: string[];
}

// Conținutul implicit
const defaultContent: AboutContent = {
  artistPhoto: '/uploads/victoria-studio-photo.jpg',
  title: 'Victoria Ocara',
  subtitle: 'Artistă specializată în pictura cu ulei',
  description: 'Sunt o artistă pasionată de pictura cu ulei, specializată în peisaje urbane iconice și apusuri dramatice.',
  specialties: ['Pictura cu Ulei', 'Peisaje Urbane', 'Tehnica Impasto', 'Apusuri Dramatice']
};

// Variabilă globală pentru a stoca conținutul (temporar)
let currentContent: AboutContent = { ...defaultContent };

export async function GET() {
  try {
    console.log('GET about content:', currentContent);
    return NextResponse.json(currentContent);
  } catch (error) {
    console.error('Error reading about content:', error);
    return NextResponse.json(defaultContent);
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('About content POST API called');
    
    // Verifică autentificarea admin
    const adminCheck = isAdmin(req);
    console.log('Admin check result:', adminCheck);
    
    if (!adminCheck) {
      console.log('About content save unauthorized');
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }
    
    const aboutContent: AboutContent = await req.json();
    console.log('About content received:', aboutContent);
    
    // Validare de bază
    if (!aboutContent.title || !aboutContent.artistPhoto) {
      return NextResponse.json({ error: 'Title and artist photo are required' }, { status: 400 });
    }
    
    // Salvează în variabila globală (temporar pentru testare)
    currentContent = { ...aboutContent };
    console.log('Content saved successfully:', currentContent);
    
    return NextResponse.json({ 
      success: true, 
      message: 'About content updated successfully',
      content: aboutContent 
    });
  } catch (error) {
    console.error('Error saving about content:', error);
    return NextResponse.json({ 
      error: 'Failed to save content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}