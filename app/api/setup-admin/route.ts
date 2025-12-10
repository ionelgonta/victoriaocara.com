import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const bcrypt = require('bcryptjs');

export async function POST(req: NextRequest) {
  try {
    // Verifică dacă este primul setup
    await dbConnect();
    
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
    }

    const { email, password, name } = await req.json();
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin'
    });

    return NextResponse.json({ 
      message: 'Admin created successfully',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}