import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Schema pentru traduceri
const translationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  en: { type: String, required: true },
  ro: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const Translation = mongoose.models.Translation || mongoose.model('Translation', translationSchema);

export async function GET() {
  try {
    await dbConnect();
    
    // Încearcă să citească din baza de date
    const translations = await Translation.find({});
    
    if (translations.length > 0) {
      // Returnează traducerile din baza de date în format corect
      const translationsObj = {
        en: {},
        ro: {}
      };
      
      translations.forEach(t => {
        // Asigură-te că valorile sunt string-uri, nu obiecte
        translationsObj.en[t.key] = typeof t.en === 'string' ? t.en : String(t.en);
        translationsObj.ro[t.key] = typeof t.ro === 'string' ? t.ro : String(t.ro);
      });
      
      return NextResponse.json({
        success: true,
        translations: translationsObj,
        source: 'database'
      });
    } else {
      // Fallback la traducerile hardcodate din LanguageContext
      const { translations: defaultTranslations } = await import('@/context/LanguageContext');
      
      return NextResponse.json({
        success: true,
        translations: defaultTranslations || {
          en: "// No translations found",
          ro: "// Nu s-au găsit traduceri"
        },
        source: 'fallback'
      });
    }
  } catch (error) {
    console.error('Error reading translations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read translations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { key, translations } = await request.json();
    
    // Verifică autentificarea admin (simplificată pentru demo)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Salvează traducerea în baza de date
    await Translation.findOneAndUpdate(
      { key },
      { 
        key,
        en: translations.en,
        ro: translations.ro,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Translation saved to database:', { key, translations });
    
    return NextResponse.json({
      success: true,
      message: `Translation for ${key} saved successfully`
    });
  } catch (error) {
    console.error('Error saving translation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save translation' },
      { status: 500 }
    );
  }
}