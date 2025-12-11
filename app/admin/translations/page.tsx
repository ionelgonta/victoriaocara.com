'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminTranslationsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('navigation');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{en: string, ro: string}>({en: '', ro: ''});
  const [dbTranslations, setDbTranslations] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    
    // Încarcă traducerile din baza de date
    loadTranslations();
  }, [router]);

  const loadTranslations = async () => {
    try {
      const response = await fetch('/api/translations');
      const result = await response.json();
      
      if (result.success && result.translations) {
        setDbTranslations(result.translations);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  // Obiect cu traducerile hardcodate pentru afișare în admin
  const translations = {
    en: {
      'nav.home': 'Home',
      'nav.gallery': 'Gallery',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.cart': 'Cart',
      'home.hero.title': 'Original Art',
      'home.hero.subtitle': 'Discover unique oil paintings inspired by nature and emotion',
      'home.hero.cta': 'Explore Gallery',
      'home.hero.contact': 'Contact Artist',
      'home.featured.title': 'Featured Works',
      'home.featured.viewAll': 'View All Paintings',
      'home.about.title': 'About the Artist',
      'gallery.title': 'Gallery',
      'gallery.subtitle': 'Explore our complete collection of original paintings',
      'gallery.showSold': 'Show sold paintings',
      'gallery.loading': 'Loading paintings...',
      'gallery.error': 'Error loading paintings',
      'gallery.tryAgain': 'Try again',
      'gallery.noPaintings': 'No paintings available at the moment.',
      'painting.available': 'Available',
      'painting.sold': 'Sold',
      'painting.dimensions': 'Dimensions',
      'painting.technique': 'Technique',
      'painting.description': 'Description',
      'painting.addToCart': 'Add to Cart',
      'about.title': 'About Me',
      'about.artist.name': 'Victoria Ocara',
      'about.artist.subtitle': 'Oil Painting Artist • Impasto & blue-focused art',
      'about.artist.description': 'I am an artist passionate about oil painting, specialized in iconic urban landscapes and dramatic sunsets.',
      'about.readStory': 'Read My Story',
      'about.commission': 'Commission a Work',
      'contact.title': 'Contact',
      'contact.subtitle': 'Have questions? We would love to hear from you!',
      'contact.name': 'Name',
      'contact.email': 'Email',
      'contact.phone': 'Phone',
      'contact.message': 'Message',
      'contact.send': 'Send Message',
      'cart.title': 'Shopping Cart',
      'cart.empty': 'Your cart is empty',
      'cart.continueShopping': 'Continue Shopping',
      'cart.quantity': 'Quantity',
      'cart.price': 'Price',
      'cart.total': 'Total',
      'cart.checkout': 'Proceed to Checkout',
      'footer.artist': 'Victoria Ocara',
      'footer.description': 'Original paintings created with passion and dedication.',
      'footer.links': 'Useful Links',
      'footer.followUs': 'Follow Us',
      'footer.rights': 'All rights reserved.'
    },
    ro: {
      'nav.home': 'Acasă',
      'nav.gallery': 'Galerie',
      'nav.about': 'Despre',
      'nav.contact': 'Contact',
      'nav.cart': 'Coș',
      'home.hero.title': 'Artă Originală',
      'home.hero.subtitle': 'Descoperă tablouri unice în ulei inspirate de natură și emoție',
      'home.hero.cta': 'Explorează Galeria',
      'home.hero.contact': 'Contactează Artistul',
      'home.featured.title': 'Lucrări Selectate',
      'home.featured.viewAll': 'Vezi Toate Tablourile',
      'home.about.title': 'Despre Artist',
      'gallery.title': 'Galerie',
      'gallery.subtitle': 'Explorează colecția noastră completă de tablouri originale',
      'gallery.showSold': 'Afișează tablourile vândute',
      'gallery.loading': 'Se încarcă tablourile...',
      'gallery.error': 'Eroare la încărcarea tablourilor',
      'gallery.tryAgain': 'Încearcă din nou',
      'gallery.noPaintings': 'Nu există tablouri disponibile momentan.',
      'painting.available': 'Disponibil',
      'painting.sold': 'Vândut',
      'painting.dimensions': 'Dimensiuni',
      'painting.technique': 'Tehnică',
      'painting.description': 'Descriere',
      'painting.addToCart': 'Adaugă în Coș',
      'about.title': 'Despre Mine',
      'about.artist.name': 'Victoria Ocara',
      'about.artist.subtitle': 'Artistă specializată în pictura cu ulei • Artă impasto & focalizată pe albastru',
      'about.artist.description': 'Sunt o artistă pasionată de pictura cu ulei, specializată în peisaje urbane iconice și apusuri dramatice.',
      'about.readStory': 'Citește Povestea Mea',
      'about.commission': 'Comandă o Lucrare',
      'contact.title': 'Contact',
      'contact.subtitle': 'Ai întrebări? Ne-ar plăcea să auzim de la tine!',
      'contact.name': 'Nume',
      'contact.email': 'Email',
      'contact.phone': 'Telefon',
      'contact.message': 'Mesaj',
      'contact.send': 'Trimite Mesajul',
      'cart.title': 'Coșul de Cumpărături',
      'cart.empty': 'Coșul tău este gol',
      'cart.continueShopping': 'Continuă Cumpărăturile',
      'cart.quantity': 'Cantitate',
      'cart.price': 'Preț',
      'cart.total': 'Total',
      'cart.checkout': 'Finalizează Comanda',
      'footer.artist': 'Victoria Ocara',
      'footer.description': 'Tablouri originale create cu pasiune și dedicare.',
      'footer.links': 'Linkuri Utile',
      'footer.followUs': 'Urmărește-ne',
      'footer.rights': 'Toate drepturile rezervate.'
    }
  };

  // Funcție pentru a obține traducerea pentru o cheie specifică
  const getTranslation = (key: string, lang: 'en' | 'ro') => {
    // Încearcă să citească din baza de date mai întâi
    if (dbTranslations[lang] && dbTranslations[lang][key]) {
      return dbTranslations[lang][key];
    }
    // Fallback la traducerile hardcodate
    return translations[lang][key as keyof typeof translations['en']] || `[Missing: ${key}]`;
  };

  const handleEdit = (key: string) => {
    setEditingKey(key);
    setEditValues({
      en: getTranslation(key, 'en'),
      ro: getTranslation(key, 'ro')
    });
  };

  const handleSave = async () => {
    if (!editingKey) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: editingKey,
          translations: editValues
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Traducerea pentru "${editingKey}" a fost salvată cu succes!`);
        setEditingKey(null);
        // Reîncarcă traducerile din baza de date
        loadTranslations();
      } else {
        alert(`❌ Eroare la salvare: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      alert('❌ Eroare la salvarea traducerii');
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValues({en: '', ro: ''});
  };

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
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-sm text-gray-700">
                      Translation Key: <code className="bg-gray-100 px-2 py-1 rounded">{key}</code>
                    </div>
                    {editingKey === key ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(key)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🇬🇧 English
                      </label>
                      {editingKey === key ? (
                        <textarea
                          value={editValues.en}
                          onChange={(e) => setEditValues({...editValues, en: e.target.value})}
                          className="w-full p-3 border border-blue-300 rounded text-sm resize-none"
                          rows={3}
                        />
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                          <span className="text-gray-800">
                            {getTranslation(key, 'en')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🇷🇴 Română
                      </label>
                      {editingKey === key ? (
                        <textarea
                          value={editValues.ro}
                          onChange={(e) => setEditValues({...editValues, ro: e.target.value})}
                          className="w-full p-3 border border-red-300 rounded text-sm resize-none"
                          rows={3}
                        />
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                          <span className="text-gray-800">
                            {getTranslation(key, 'ro')}
                          </span>
                        </div>
                      )}
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