import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { isAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    if (key) {
      const content = await SiteContent.findOne({ key });
      return NextResponse.json(content || { key, content: {} });
    }
    
    const allContent = await SiteContent.find();
    return NextResponse.json(allContent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { key, content } = await req.json();
    
    const updated = await SiteContent.findOneAndUpdate(
      { key },
      { key, content },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
