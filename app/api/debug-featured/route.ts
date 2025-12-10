import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Painting from '@/models/Painting';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const allPaintings = await Painting.find({});
    const featuredPaintings = await Painting.find({ featured: true });
    
    return NextResponse.json({
      success: true,
      totalPaintings: allPaintings.length,
      featuredPaintings: featuredPaintings.length,
      allPaintings: allPaintings.map(p => ({
        _id: p._id,
        title: p.title,
        featured: p.featured
      })),
      featuredList: featuredPaintings.map(p => ({
        _id: p._id,
        title: p.title,
        featured: p.featured
      }))
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to fetch paintings',
      details: error.message
    }, { status: 500 });
  }
}