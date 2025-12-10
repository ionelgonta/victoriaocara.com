import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing database connection...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_URI preview:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    await dbConnect();
    
    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful',
      mongoUri: process.env.MONGODB_URI?.substring(0, 50) + '...'
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error.message,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}