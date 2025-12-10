import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { isAdmin } from '@/lib/authHelpers';

// Model pentru conținutul paginii Despre
interface AboutContent {
  artistPhoto: string;
  title: string;
  subtitle: string;
  description: string;
  specialties: string[];
}

export async function GET() {
  try {
    await dbConnect();
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('art-gallery');
    const collection = db.collection('about-content');
    
    const content = await collection.findOne({ type: 'about-page' });
    await client.close();
    
    if (content) {
      return NextResponse.json(content);
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
    
    console.log('Connecting to database...');
    await dbConnect();
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('art-gallery');
    const collection = db.collection('about-content');
    
    // Upsert (update sau insert)
    console.log('Saving content to database...');
    const result = await collection.replaceOne(
      { type: 'about-page' },
      { 
        type: 'about-page',
        ...aboutContent,
        updatedAt: new Date()
      },
      { upsert: true }
    );
    
    console.log('Database operation result:', result);
    await client.close();
    
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