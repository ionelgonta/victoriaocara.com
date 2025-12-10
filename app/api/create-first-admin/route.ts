import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const bcrypt = require('bcryptjs');

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Verifică dacă există deja admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ 
        error: 'Admin already exists',
        message: 'Use existing admin credentials to login'
      }, { status: 400 });
    }

    // Creează admin cu credențiale fixe
    const hashedPassword = await bcrypt.hash('AdminVictoria2024!', 12);
    
    const admin = await User.create({
      email: 'admin@victoriaocara.com',
      password: hashedPassword,
      name: 'Victoria Ocara Admin',
      role: 'admin'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Admin created successfully',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ 
      error: 'Failed to create admin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}