'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiExternalLink, FiHome, FiSettings, FiTool, FiDatabase, FiImage, FiUser, FiShoppingCart, FiFileText, FiSearch } from 'react-icons/fi';

interface SiteLink {
  title: string;
  url: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

export default function AdminSitemapPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const siteLinks: SiteLink[] = [
    // Main Site Pages
    {
      title: 'Homepage',
      url: '/',
      description: 'Pagina principală cu hero section, despre artist și tablouri selectate',
      category: 'main',
      icon: <FiHome className="w-5 h-5" />
    },
    {
      title: 'Galerie',
      url: '/galerie',
      description: 'Toate tablourile disponibile în format grid responsive',
      category: 'main',
      icon: <FiImage className="w-5 h-5" />
    },
    {
      title: 'Despre Victoria Ocara',
      url: '/despre',
      description: 'Pagina cu informații despre artistă, povestea și tehnicile folosite',
      category: 'main',
      icon: <FiUser className="w-5 h-5" />
    },
    {
      title: 'Contact',
      url: '/contact',
      description: 'Formular de contact și informații de contactare',
      category: 'main',
      icon: <FiFileText className="w-5 h-5" />
    },
    {
      title: 'Coș de Cumpărături',
      url: '/cart',
      description: 'Coșul de cumpărături cu produsele selectate',
      category: 'main',
      icon: <FiShoppingCart className="w-5 h-5" />
    },
    {
      title: 'Checkout',
      url: '/checkout',
      description: 'Pagina de finalizare comandă cu formular și plată',
      category: 'main',
      icon: <FiShoppingCart className="w-5 h-5" />
    },
    {
      title: 'Succes Comandă',
      url: '/success',
      description: 'Pagina de confirmare după plata cu succes',
      category: 'main',
      icon: <FiShoppingCart className="w-5 h-5" />
    },

    // Admin Pages
    {
      title: 'Admin Login',
      url: '/admin',
      description: 'Pagina de autentificare pentru panoul admin',
      category: 'admin',
      icon: <FiSettings className="w-5 h-5" />
    },
    {
      title: 'Admin Dashboard',
      url: '/admin/dashboard',
      description: 'Dashboard principal cu statistici și linkuri rapide',
      category: 'admin',
      icon: <FiSettings className="w-5 h-5" />
    },
    {
      title: 'Gestionare Tablouri',
      url: '/admin/paintings',
      description: 'CRUD pentru tablouri - adaugă, editează, șterge tablouri',
      category: 'admin',
      icon: <FiImage className="w-5 h-5" />
    },
    {
      title: 'Gestionare Comenzi',
      url: '/admin/orders',
      description: 'Vezi și gestionează comenzile primite de la clienți',
      category: 'admin',
      icon: <FiShoppingCart className="w-5 h-5" />
    },
    {
      title: 'Gestionare Conținut Site',
      url: '/admin/content',
      description: 'Editează conținutul paginii principale și setările',
      category: 'admin',
      icon: <FiFileText className="w-5 h-5" />
    },
    {
      title: 'Gestionare Pagina "Despre"',
      url: '/admin/about',
      description: 'Modifică imaginea artistei și conținutul paginii despre',
      category: 'admin',
      icon: <FiUser className="w-5 h-5" />
    },

    // Debug & Testing Pages
    {
      title: 'Setup Complet',
      url: '/setup-complete',
      description: 'Rulează setup complet: creează admin, testează DB, verifică API-uri',
      category: 'debug',
      icon: <FiTool className="w-5 h-5" />
    },
    {
      title: 'Debug Gallery',
      url: '/debug-gallery',
      description: 'Testează API-urile pentru galerie și tablouri selectate',
      category: 'debug',
      icon: <FiSearch className="w-5 h-5" />
    },
    {
      title: 'Admin Debug',
      url: '/admin-debug',
      description: 'Creează primul admin și testează autentificarea',
      category: 'debug',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'Setup Initial',
      url: '/setup',
      description: 'Pagina de setup inițial pentru configurarea site-ului',
      category: 'debug',
      icon: <FiTool className="w-5 h-5" />
    },

    // API Endpoints (for testing)
    {
      title: 'API Paintings',
      url: '/api/paintings',
      description: 'API pentru toate tablourile (GET/POST)',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'API Featured Paintings',
      url: '/api/paintings?featured=true',
      description: 'API pentru tablourile selectate pentru homepage',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'API About Content',
      url: '/api/about-content',
      description: 'API pentru conținutul paginii despre (GET/POST)',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'API Debug Paintings',
      url: '/api/debug-paintings',
      description: 'API de debug pentru verificarea tablourilor în DB',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'API Test DB',
      url: '/api/test-db',
      description: 'Testează conexiunea la baza de date MongoDB',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'API Create Admin',
      url: '/api/create-first-admin',
      description: 'Creează primul utilizator admin (POST)',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'API Upload',
      url: '/api/upload',
      description: 'API pentru upload imagini (POST cu FormData)',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    },
    {
      title: 'API Test About',
      url: '/api/test-about',
      description: 'API de test pentru funcționalitatea despre',
      category: 'api',
      icon: <FiDatabase className="w-5 h-5" />
    }
  ];

  const categories = [
    { id: 'all', name: 'Toate', count: siteLinks.length },
    { id: 'main', name: 'Site Principal', count: siteLinks.filter(l => l.category === 'main').length },
    { id: 'admin', name: 'Panoul Admin', count: siteLinks.filter(l => l.category === 'admin').length },
    { id: 'debug', name: 'Debug & Testing', count: siteLinks.filter(l => l.category === 'debug').length },
    { id: 'api', name: 'API Endpoints', count: siteLinks.filter(l => l.category === 'api').length }
  ];

  const filteredLinks = selectedCategory === 'all' 
    ? siteLinks 
    : siteLinks.filter(link => link.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-green-100 text-green-800';
      case 'debug': return 'bg-yellow-100 text-yellow-800';
      case 'api': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sitemap Admin - Victoria Ocara
              </h1>
              <p className="text-gray-600">
                Toate paginile, API-urile și instrumentele de debug generate pentru site
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Înapoi la Dashboard
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {link.icon}
                  <h3 className="font-semibold text-gray-900">{link.title}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(link.category)}`}>
                  {link.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {link.description}
              </p>
              
              <div className="flex items-center justify-between">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                  {link.url}
                </code>
                <Link
                  href={link.url}
                  target={link.isExternal ? '_blank' : '_self'}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Vizitează
                  <FiExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Acțiuni Rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/setup-complete"
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              <FiTool className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Setup Complet</div>
              <div className="text-sm opacity-90">Verifică totul</div>
            </Link>
            
            <Link
              href="/debug-gallery"
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              <FiSearch className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Debug Gallery</div>
              <div className="text-sm opacity-90">Testează tablouri</div>
            </Link>
            
            <Link
              href="/admin/about"
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              <FiUser className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Editează Despre</div>
              <div className="text-sm opacity-90">Modifică conținut</div>
            </Link>
            
            <Link
              href="/admin/paintings"
              className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
            >
              <FiImage className="w-6 h-6 mx-auto mb-2" />
              <div className="font-semibold">Adaugă Tablouri</div>
              <div className="text-sm opacity-90">Gestionează galeria</div>
            </Link>
          </div>
        </div>

        {/* Site Info */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-blue-900">Informații Site</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>URL Principal:</strong> https://victoriaocara-com.vercel.app</p>
              <p><strong>Admin Email:</strong> admin@victoriaocara.com</p>
              <p><strong>Admin Password:</strong> AdminVictoria2024!</p>
            </div>
            <div>
              <p><strong>Total Pagini:</strong> {siteLinks.length}</p>
              <p><strong>Framework:</strong> Next.js 14</p>
              <p><strong>Database:</strong> MongoDB Atlas</p>
              <p><strong>Deployment:</strong> Vercel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}