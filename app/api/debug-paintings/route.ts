import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Debug paintings API called');
    
    // Test database connection
    await dbConnect();
    console.log('Database connected successfully');
    
    // Test MongoDB connection directly
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('MongoDB client connected');
    
    const db = client.db('art-gallery');
    const collection = db.collection('paintings');
    
    // Get all paintings
    const paintings = await collection.find({}).toArray();
    console.log('Found paintings:', paintings.length);
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      paintingsCount: paintings.length,
      paintings: paintings.map(p => ({
        id: p._id,
        title: p.title,
        featured: p.featured,
        createdAt: p.createdAt
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug paintings error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}