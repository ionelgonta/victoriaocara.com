'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTranslationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('navigation');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
  }, [router]);

  const translationSections = {
    navigation: {
      title: 'Navigation',
      keys: [
        'nav.home',
        'nav.gallery', 
        'nav.about',
        'nav.contact',
        'nav.cart'
      ]
    },
    homepage: {
      title: 'Homepage',
      keys: [
        'home.hero.title',
        'home.hero.subtitle',
        'home.hero.cta',
        'home.hero.contact',
        'home.featured.title',
        'home.featured.viewAll',
        'home.about.title'
      ]
    },
    gallery: {
      title: 'Gallery',
      keys: [
        'gallery.title',
        'gallery.subtitle',
        'gallery.showSold',
        'gallery.loading',
        'gallery.error',
        'gallery.tryAgain',
        'gallery.noPaintings'
      ]
    },
    paintings: {
      title: 'Paintings',
      keys: [
        'painting.available',
        'painting.sold',
        'painting.dimensions',
        'painting.technique',
        'painting.description',
        'painting.addToCart'
      ]
    },
    about: {
      title: 'About Page',
      keys: [
        'about.title',
        'about.artist.name',
        'about.artist.subtitle',
        'about.artist.description',
        'about.readStory',
        'about.commission'
      ]
    },
    contact: {
      title: 'Contact Page',
      keys: [
        'contact.title',
        'contact.subtitle',
        'contact.name',
        'contact.email',
        'contact.phone',
        'contact.message',
        'contact.send'
      ]
    },
    cart: {
      title: 'Shopping Cart',
      keys: [
        'cart.title',
        'cart.empty',
        'cart.continueShopping',
        'cart.quantity',
        'cart.price',
        'cart.total',
        'cart.checkout'
      ]
    },
    footer: {
      title: 'Footer',
      keys: [
        'footer.artist',
        'footer.description',
        'footer.links',
        'footer.followUs',
        'footer.rights'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Gestionează Traduceri</h1>
          <p className="text-gray-600 mt-2">
            Vizualizează și verifică traducerile pentru site-ul bilingv (EN/RO)
          </p>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {Object.entries(translationSections).map(([key, section]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {translationSections[activeTab as keyof typeof translationSections].title}
            </h2>

            <div className="space-y-4">
              {translationSections[activeTab as keyof typeof translationSections].keys.map((key) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-sm text-gray-700 mb-3">
                    Translation Key: <code className="bg-gray-100 px-2 py-1 rounded">{key}</code>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🇬🇧 English
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                        <span className="text-gray-600">
                          Current: Will be loaded from context
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🇷🇴 Română
                      </label>
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                        <span className="text-gray-600">
                          Current: Will be loaded from context
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📝 Informații despre Traduceri
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>• Traducerile sunt gestionate în <code>context/LanguageContext.tsx</code></p>
            <p>• Site-ul se încarcă implicit în limba engleză</p>
            <p>• Utilizatorii pot comuta între EN/RO folosind selectorul din header</p>
            <p>• Preferința de limbă este salvată în localStorage</p>
            <p>• Toate componentele folosesc hook-ul <code>useLanguage()</code> pentru traduceri</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {Object.values(translationSections).reduce((acc, section) => acc + section.keys.length, 0)}
            </div>
            <div className="text-gray-600">Total Translation Keys</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2</div>
            <div className="text-gray-600">Supported Languages</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Object.keys(translationSections).length}
            </div>
            <div className="text-gray-600">Translation Sections</div>
          </div>
        </div>
      </div>
    </div>
  );
}