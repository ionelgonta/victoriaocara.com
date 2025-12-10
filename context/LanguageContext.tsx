'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'ro';
  setLanguage: (lang: 'en' | 'ro') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    
    // Homepage
    'home.hero.title': 'Original Art',
    'home.hero.subtitle': 'Discover unique oil paintings inspired by nature and emotion',
    'home.hero.cta': 'Explore Gallery',
    'home.hero.contact': 'Contact Artist',
    'home.featured.title': 'Featured Works',
    'home.featured.viewAll': 'View All Paintings',
    'home.featured.noFeatured': 'No featured paintings available at the moment.',
    'home.featured.addFromAdmin': 'To display paintings here, add paintings in the admin panel and check "Featured on Homepage".',
    'home.about.title': 'About the Artist',
    
    // Gallery
    'gallery.title': 'Gallery',
    'gallery.subtitle': 'Explore our complete collection of original paintings',
    'gallery.showSold': 'Show sold paintings',
    'gallery.loading': 'Loading paintings...',
    'gallery.error': 'Error loading paintings',
    'gallery.tryAgain': 'Try again',
    'gallery.noPaintings': 'No paintings available at the moment.',
    'gallery.addFromAdmin': 'Add paintings from the admin panel to see them here.',
    
    // Painting Card
    'painting.available': 'Available',
    'painting.sold': 'Sold',
    
    // Individual Painting
    'painting.dimensions': 'Dimensions',
    'painting.technique': 'Technique',
    'painting.available.status': 'Available',
    'painting.sold.status': 'Sold',
    'painting.outOfStock': 'Out of Stock',
    'painting.description': 'Description',
    'painting.addToCart': 'Add to Cart',
    'painting.notFound.title': 'Painting Not Found',
    'painting.notFound.message': 'Sorry, this painting does not exist.',
    'painting.loading': 'Loading...',
    
    // About Page
    'about.title': 'About Me',
    'about.loading': 'Loading...',
    
    // Contact Page
    'contact.title': 'Contact',
    'contact.subtitle': 'Get in touch for commissions or inquiries',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.info.title': 'Contact Information',
    'contact.info.email': 'Email',
    'contact.info.social': 'Follow me on social media',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continueShopping': 'Continue Shopping',
    'cart.quantity': 'Quantity',
    'cart.price': 'Price',
    'cart.total': 'Total',
    'cart.remove': 'Remove',
    'cart.checkout': 'Proceed to Checkout',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.orderSummary': 'Order Summary',
    'checkout.shippingInfo': 'Shipping Information',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.postalCode': 'Postal Code',
    'checkout.country': 'Country',
    'checkout.phone': 'Phone',
    'checkout.placeOrder': 'Place Order',
    'checkout.processing': 'Processing...',
    
    // Success
    'success.title': 'Order Successful!',
    'success.message': 'Thank you for your purchase. You will receive a confirmation email shortly.',
    'success.orderNumber': 'Order Number',
    'success.backToGallery': 'Back to Gallery',
    
    // Footer
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.update': 'Update',
  },
  ro: {
    // Navigation
    'nav.home': 'Acasă',
    'nav.gallery': 'Galerie',
    'nav.about': 'Despre',
    'nav.contact': 'Contact',
    'nav.cart': 'Coș',
    
    // Homepage
    'home.hero.title': 'Artă Originală',
    'home.hero.subtitle': 'Descoperă tablouri unice în ulei inspirate de natură și emoție',
    'home.hero.cta': 'Explorează Galeria',
    'home.hero.contact': 'Contactează Artistul',
    'home.featured.title': 'Lucrări Selectate',
    'home.featured.viewAll': 'Vezi Toate Tablourile',
    'home.featured.noFeatured': 'Nu există tablouri selectate momentan.',
    'home.featured.addFromAdmin': 'Pentru a afișa tablouri aici, adaugă tablouri în panoul admin și bifează "Featured on Homepage".',
    'home.about.title': 'Despre Artist',
    
    // Gallery
    'gallery.title': 'Galerie',
    'gallery.subtitle': 'Explorează colecția noastră completă de tablouri originale',
    'gallery.showSold': 'Afișează tablourile vândute',
    'gallery.loading': 'Se încarcă tablourile...',
    'gallery.error': 'Eroare la încărcarea tablourilor',
    'gallery.tryAgain': 'Încearcă din nou',
    'gallery.noPaintings': 'Nu există tablouri disponibile momentan.',
    'gallery.addFromAdmin': 'Adaugă tablouri din panoul admin pentru a le vedea aici.',
    
    // Painting Card
    'painting.available': 'Disponibil',
    'painting.sold': 'Vândut',
    
    // Individual Painting
    'painting.dimensions': 'Dimensiuni',
    'painting.technique': 'Tehnică',
    'painting.available.status': 'Disponibil',
    'painting.sold.status': 'Vândut',
    'painting.outOfStock': 'Stoc epuizat',
    'painting.description': 'Descriere',
    'painting.addToCart': 'Adaugă în Coș',
    'painting.notFound.title': 'Tablou negăsit',
    'painting.notFound.message': 'Ne pare rău, acest tablou nu există.',
    'painting.loading': 'Se încarcă...',
    
    // About Page
    'about.title': 'Despre Mine',
    'about.loading': 'Se încarcă...',
    
    // Contact Page
    'contact.title': 'Contact',
    'contact.subtitle': 'Contactează-mă pentru comisii sau întrebări',
    'contact.name': 'Nume',
    'contact.email': 'Email',
    'contact.message': 'Mesaj',
    'contact.send': 'Trimite Mesaj',
    'contact.info.title': 'Informații de Contact',
    'contact.info.email': 'Email',
    'contact.info.social': 'Urmărește-mă pe rețelele sociale',
    
    // Cart
    'cart.title': 'Coșul de Cumpărături',
    'cart.empty': 'Coșul tău este gol',
    'cart.continueShopping': 'Continuă Cumpărăturile',
    'cart.quantity': 'Cantitate',
    'cart.price': 'Preț',
    'cart.total': 'Total',
    'cart.remove': 'Elimină',
    'cart.checkout': 'Finalizează Comanda',
    
    // Checkout
    'checkout.title': 'Finalizare Comandă',
    'checkout.orderSummary': 'Sumar Comandă',
    'checkout.shippingInfo': 'Informații de Livrare',
    'checkout.firstName': 'Prenume',
    'checkout.lastName': 'Nume',
    'checkout.address': 'Adresă',
    'checkout.city': 'Oraș',
    'checkout.postalCode': 'Cod Poștal',
    'checkout.country': 'Țară',
    'checkout.phone': 'Telefon',
    'checkout.placeOrder': 'Plasează Comanda',
    'checkout.processing': 'Se procesează...',
    
    // Success
    'success.title': 'Comandă Reușită!',
    'success.message': 'Mulțumim pentru achiziție. Vei primi un email de confirmare în scurt timp.',
    'success.orderNumber': 'Numărul Comenzii',
    'success.backToGallery': 'Înapoi la Galerie',
    
    // Footer
    'footer.followUs': 'Urmărește-ne',
    'footer.rights': 'Toate drepturile rezervate.',
    
    // Common
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.success': 'Succes',
    'common.cancel': 'Anulează',
    'common.save': 'Salvează',
    'common.edit': 'Editează',
    'common.delete': 'Șterge',
    'common.add': 'Adaugă',
    'common.update': 'Actualizează',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ro'>('en'); // Default to English

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ro';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'ro') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};