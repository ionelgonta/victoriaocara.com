import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Schema pentru conținut admin
const contentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const Content = mongoose.models.Content || mongoose.model('Content', contentSchema);

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key parameter required' },
        { status: 400 }
      );
    }
    
    const contentDoc = await Content.findOne({ key });
    
    if (contentDoc) {
      return NextResponse.json({
        success: true,
        content: contentDoc.content
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Content not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error reading content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { key, content } = await request.json();
    
    // Verifică autentificarea admin (simplificată pentru demo)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Salvează conținutul în baza de date
    await Content.findOneAndUpdate(
      { key },
      { 
        key,
        content,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Content saved to database:', { key, content });
    
    return NextResponse.json({
      success: true,
      message: `Content for ${key} saved successfully`
    });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key parameter required' },
        { status: 400 }
      );
    }
    
    // Verifică autentificarea admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await Content.deleteOne({ key });
    
    return NextResponse.json({
      success: true,
      message: `Content for ${key} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}