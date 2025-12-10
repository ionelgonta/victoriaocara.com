import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/authHelpers';
import dbConnect from '@/lib/mongodb';

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

export async function GET() {
  try {
    console.log('GET about content - connecting to database...');
    await dbConnect();
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('art-gallery');
    const collection = db.collection('about-content');
    
    const content = await collection.findOne({ type: 'about-page' });
    await client.close();
    
    if (content) {
      console.log('Found saved content:', content.artistPhoto);
      // Remove MongoDB specific fields
      const { _id, type, updatedAt, ...cleanContent } = content;
      return NextResponse.json(cleanContent);
    }
    
    console.log('No saved content found, returning default');
    return NextResponse.json(defaultContent);
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
    console.log('Artist photo to save:', aboutContent.artistPhoto);
    
    // Validare de bază
    if (!aboutContent.title || !aboutContent.artistPhoto) {
      return NextResponse.json({ error: 'Title and artist photo are required' }, { status: 400 });
    }
    
    // Salvează în MongoDB
    console.log('Connecting to database for save...');
    await dbConnect();
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('art-gallery');
    const collection = db.collection('about-content');
    
    // Upsert (update sau insert)
    const result = await collection.replaceOne(
      { type: 'about-page' },
      { 
        type: 'about-page',
        ...aboutContent,
        updatedAt: new Date()
      },
      { upsert: true }
    );
    
    console.log('Database save result:', result);
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