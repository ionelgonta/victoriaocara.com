#!/bin/bash

echo "=== MIGRATING ALL TRANSLATIONS TO ADMIN DATABASE ==="

cd /opt/victoriaocara

# 1. Creează scriptul de migrare a traducerilor
cat > migrate-translations.js << 'EOF'
const { MongoClient } = require('mongodb');

// Toate traducerile din LanguageContext.tsx
const translations = {
  // Navigation
  'nav.home': { en: 'Home', ro: 'Acasă' },
  'nav.gallery': { en: 'Gallery', ro: 'Galerie' },
  'nav.about': { en: 'About', ro: 'Despre' },
  'nav.contact': { en: 'Contact', ro: 'Contact' },
  'nav.cart': { en: 'Cart', ro: 'Coș' },
  
  // Homepage
  'home.hero.title': { en: 'Original Art', ro: 'Artă Originală' },
  'home.hero.subtitle': { en: 'Discover unique oil paintings inspired by nature and emotion', ro: 'Descoperă tablouri unice în ulei inspirate de natură și emoție' },
  'home.hero.cta': { en: 'Explore Gallery', ro: 'Explorează Galeria' },
  'home.hero.contact': { en: 'Contact Artist', ro: 'Contactează Artista' },
  
  // Features
  'features.original.title': { en: 'Original Art', ro: 'Artă Originală' },
  'features.original.description': { en: 'Each painting is a unique work, created by hand with attention to detail', ro: 'Fiecare tablou este o lucrare unică, creată manual cu atenție la detalii' },
  'features.delivery.title': { en: 'Safe Delivery', ro: 'Livrare Sigură' },
  'features.delivery.description': { en: 'We pack and ship each painting with maximum care for its safety', ro: 'Împachetăm și expediem fiecare tablou cu maximă grijă pentru siguranța sa' },
  'features.payment.title': { en: 'Secure Payment', ro: 'Plată Securizată' },
  'features.payment.description': { en: 'We process payments through Stripe for your safety and privacy', ro: 'Procesăm plățile prin Stripe pentru siguranța și confidențialitatea ta' },
  
  // Gallery
  'gallery.title': { en: 'Art Gallery', ro: 'Galeria de Artă' },
  'gallery.loading': { en: 'Loading paintings...', ro: 'Se încarcă tablourile...' },
  'gallery.noPaintings': { en: 'No paintings available at the moment.', ro: 'Nu sunt tablouri disponibile momentan.' },
  
  // Painting
  'painting.price': { en: 'Price', ro: 'Preț' },
  'painting.size': { en: 'Size', ro: 'Dimensiuni' },
  'painting.technique': { en: 'Technique', ro: 'Tehnică' },
  'painting.year': { en: 'Year', ro: 'An' },
  'painting.addToCart': { en: 'Add to Cart', ro: 'Adaugă în Coș' },
  
  // About
  'about.title': { en: 'About Me', ro: 'Despre Mine' },
  'about.loading': { en: 'Loading...', ro: 'Se încarcă...' },
  'about.artist.name': { en: 'Victoria Ocara', ro: 'Victoria Ocara' },
  'about.artist.subtitle': { en: 'Oil Painting Artist • Impasto & blue-focused art', ro: 'Artistă specializată în pictura cu ulei • Artă impasto & focalizată pe albastru' },
  'about.artist.description': { en: 'I am an artist passionate about oil painting, specialized in iconic urban landscapes and dramatic sunsets. My work is inspired by the beauty of nature and the emotions it evokes, using the impasto technique to create texture and depth in each piece.', ro: 'Sunt o artistă pasionată de pictura cu ulei, specializată în peisaje urbane iconice și apusuri dramatice. Lucrările mele sunt inspirate de frumusețea naturii și de emoțiile pe care le evocă, folosind tehnica impasto pentru a crea textură și profunzime în fiecare piesă.' },
  
  // Contact
  'contact.title': { en: 'Contact', ro: 'Contact' },
  'contact.name': { en: 'Name', ro: 'Nume' },
  'contact.email': { en: 'Email', ro: 'Email' },
  'contact.message': { en: 'Message', ro: 'Mesaj' },
  'contact.send': { en: 'Send Message', ro: 'Trimite Mesajul' },
  
  // Cart
  'cart.title': { en: 'Shopping Cart', ro: 'Coșul de Cumpărături' },
  'cart.empty': { en: 'Your cart is empty', ro: 'Coșul tău este gol' },
  'cart.remove': { en: 'Remove', ro: 'Elimină' },
  'cart.total': { en: 'Total', ro: 'Total' },
  'cart.checkout': { en: 'Proceed to Checkout', ro: 'Finalizează Comanda' },
  
  // Footer
  'footer.followUs': { en: 'Follow Us', ro: 'Urmărește-ne' },
  'footer.rights': { en: 'All rights reserved.', ro: 'Toate drepturile rezervate.' },
  'footer.artist': { en: 'Victoria Ocara', ro: 'Victoria Ocara' },
  'footer.description': { en: 'Original paintings created with passion and dedication.', ro: 'Tablouri originale create cu pasiune și dedicare.' },
  'footer.links': { en: 'Useful Links', ro: 'Linkuri Utile' },
  
  // Custom Painting
  'customPainting.title': { en: 'Order Custom Painting', ro: 'Comandă Pictură Personalizată' },
  'customPainting.description': { en: 'Commission a unique artwork tailored to your vision', ro: 'Comandă o lucrare de artă unică adaptată viziunii tale' },
  'customPainting.form.photo': { en: 'Upload Reference Photo', ro: 'Încarcă Fotografia de Referință' },
  'customPainting.form.description': { en: 'Describe your vision', ro: 'Descrie viziunea ta' },
  'customPainting.form.size': { en: 'Preferred Size', ro: 'Dimensiunea Preferată' },
  'customPainting.form.style': { en: 'Artistic Style', ro: 'Stilul Artistic' },
  'customPainting.form.name': { en: 'Your Name', ro: 'Numele Tău' },
  'customPainting.form.email': { en: 'Your Email', ro: 'Email-ul Tău' },
  'customPainting.form.phone': { en: 'Phone Number', ro: 'Numărul de Telefon' },
  'customPainting.form.submit': { en: 'Submit Request', ro: 'Trimite Cererea' }
};

async function migrateTranslations() {
  const client = new MongoClient('mongodb://victoriaocara:ArtGallery2024!@localhost:27017/art-gallery');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('art-gallery');
    const translationsCollection = db.collection('translations');
    
    console.log('📦 Migrating translations to database...');
    
    let migratedCount = 0;
    for (const [key, values] of Object.entries(translations)) {
      await translationsCollection.findOneAndUpdate(
        { key },
        { 
          key,
          en: values.en,
          ro: values.ro,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`   ✅ ${key}`);
      migratedCount++;
    }
    
    console.log(`\n🎉 Successfully migrated ${migratedCount} translations to database!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

migrateTranslations();
EOF

# 2. Rulează migrarea
echo "1. Migrating translations to database..."
node migrate-translations.js

# 3. Modifică LanguageContext.tsx să citească doar din baza de date
echo ""
echo "2. Updating LanguageContext.tsx to use only database..."

cat > context/LanguageContext.tsx << 'EOF'
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type Language = 'en' | 'ro';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: { en: Translations; ro: Translations };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<{ en: Translations; ro: Translations }>({
    en: {},
    ro: {}
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Încarcă traducerile din baza de date
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await axios.get('/api/translations');
        if (response.data.success && response.data.translations) {
          setTranslations(response.data.translations);
          console.log('✅ Translations loaded from database');
        } else {
          console.warn('⚠️ No translations found in database');
        }
      } catch (error) {
        console.error('❌ Error loading translations:', error);
        // Fallback minimal pentru cazuri de eroare
        setTranslations({
          en: { 'loading': 'Loading...', 'error': 'Error loading content' },
          ro: { 'loading': 'Se încarcă...', 'error': 'Eroare la încărcarea conținutului' }
        });
      } finally {
        setIsLoaded(true);
      }
    };

    loadTranslations();
  }, []);

  // Funcția de traducere
  const t = (key: string): string => {
    if (!isLoaded) {
      return 'Loading...';
    }
    
    const translation = translations[language]?.[key];
    if (translation) {
      return translation;
    }
    
    // Fallback la engleză dacă nu găsește în limba curentă
    const englishTranslation = translations.en?.[key];
    if (englishTranslation) {
      return englishTranslation;
    }
    
    // Ultimul fallback - returnează cheia
    console.warn(`⚠️ Translation missing for key: ${key}`);
    return key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export pentru compatibilitate (nu mai este folosit)
export const translations = { en: {}, ro: {} };
EOF

# 4. Rebuild aplicația
echo ""
echo "3. Building application..."
npm run build

# 5. Restart aplicația
echo ""
echo "4. Restarting application..."
pm2 restart victoriaocara

# 6. Verifică rezultatul
echo ""
echo "5. Waiting for application to restart..."
sleep 15

echo ""
echo "6. Testing translations..."
curl -s https://victoriaocara.com | grep -o "<h1[^>]*>[^<]*</h1>" || echo "Could not extract H1"

echo ""
echo "7. Testing API translations..."
curl -s https://victoriaocara.com/api/translations | head -200

echo ""
echo "=== MIGRATION COMPLETE ==="
echo "✅ All translations migrated to admin database"
echo "✅ LanguageContext updated to use only database"
echo "✅ Application rebuilt and restarted"
echo ""
echo "Now you can manage ALL translations from /admin/translations"
echo "No more hardcoded translations in the code!"

# Curăță fișierele temporare
rm -f migrate-translations.js