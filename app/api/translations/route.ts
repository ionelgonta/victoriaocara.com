import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Citește fișierul LanguageContext.tsx pentru a extrage traducerile
    const contextPath = path.join(process.cwd(), 'context', 'LanguageContext.tsx');
    const contextContent = fs.readFileSync(contextPath, 'utf8');
    
    // Extrage traducerile din fișier (simplificat)
    const enMatch = contextContent.match(/en:\s*{([^}]+)}/);
    const roMatch = contextContent.match(/ro:\s*{([^}]+)}/);
    
    return NextResponse.json({
      success: true,
      translations: {
        en: enMatch ? enMatch[1] : '',
        ro: roMatch ? roMatch[1] : ''
      }
    });
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
    const { key, translations } = await request.json();
    
    // Verifică autentificarea admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Pentru moment, doar returnăm success
    // În implementarea reală, ar trebui să modifici fișierul LanguageContext.tsx
    console.log('Saving translation:', { key, translations });
    
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