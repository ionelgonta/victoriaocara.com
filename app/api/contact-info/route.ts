import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/authHelpers';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Schema pentru informații de contact
const contactInfoSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  workingHours: { type: String, required: true },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
  },
  updatedAt: { type: Date, default: Date.now }
});

const ContactInfo = mongoose.models.ContactInfo || mongoose.model('ContactInfo', contactInfoSchema);

export async function GET() {
  try {
    await dbConnect();
    
    let contactInfo = await ContactInfo.findOne();
    
    // Dacă nu există informații, returnează valorile default
    if (!contactInfo) {
      contactInfo = {
        email: 'contact@victoriaocara.com',
        phone: '+40 123 456 789',
        address: 'București, România',
        workingHours: 'Luni - Vineri: 9:00 - 18:00',
        socialMedia: {
          facebook: '',
          instagram: '',
          whatsapp: ''
        }
      };
    }
    
    return NextResponse.json({
      success: true,
      contactInfo
    });
  } catch (error) {
    console.error('Error reading contact info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read contact info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verifică autentificarea admin
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const data = await request.json();
    const { email, phone, address, workingHours, socialMedia } = data;
    
    // Validare de bază
    if (!email || !phone || !address || !workingHours) {
      return NextResponse.json(
        { success: false, error: 'Email, telefon, adresă și program sunt obligatorii' },
        { status: 400 }
      );
    }

    // Salvează sau actualizează informațiile de contact
    const contactInfo = await ContactInfo.findOneAndUpdate(
      {}, // Găsește primul document (ar trebui să fie unul singur)
      { 
        email,
        phone,
        address,
        workingHours,
        socialMedia: socialMedia || { facebook: '', instagram: '', whatsapp: '' },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Contact info saved:', contactInfo);
    
    return NextResponse.json({
      success: true,
      message: 'Informațiile de contact au fost salvate cu succes',
      contactInfo
    });
  } catch (error) {
    console.error('Error saving contact info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save contact info' },
      { status: 500 }
    );
  }
}