'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FiPackage, FiImage, FiFileText, FiLogOut, FiDollarSign } from 'react-icons/fi';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ paintings: 0, orders: 0 });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [paintingsRes, ordersRes] = await Promise.all([
        axios.get('/api/paintings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats({
        paintings: paintingsRes.data.length,
        orders: ordersRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tablouri</p>
                <p className="text-3xl font-bold">{stats.paintings}</p>
              </div>
              <FiImage className="w-12 h-12 text-accent" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Comenzi</p>
                <p className="text-3xl font-bold">{stats.orders}</p>
              </div>
              <FiPackage className="w-12 h-12 text-accent" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <Link
            href="/admin/paintings"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <FiImage className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-semibold mb-2">Gestionează Tablouri</h2>
            <p className="text-gray-600">Adaugă, editează sau șterge tablouri</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <FiPackage className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-semibold mb-2">Comenzi</h2>
            <p className="text-gray-600">Vezi și gestionează comenzile</p>
          </Link>

          <Link
            href="/admin/offers"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <FiDollarSign className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold mb-2">Oferte de Preț</h2>
            <p className="text-gray-600">Gestionează ofertele clienților</p>
          </Link>

          <Link
            href="/admin/similar-requests"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold mb-2">Cereri Tablouri Similare</h2>
            <p className="text-gray-600">Gestionează cererile pentru tablouri personalizate</p>
          </Link>

          <Link
            href="/admin/about"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <FiFileText className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Pagina "Despre"</h2>
            <p className="text-gray-600">Modifică imaginea și conținutul artistei</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/content"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <FiFileText className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-semibold mb-2">Conținut Site</h2>
            <p className="text-gray-600">Editează conținutul paginii principale</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/translations"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <div className="text-4xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold mb-2">Traduceri</h2>
            <p className="text-gray-600">Gestionează traducerile EN/RO</p>
          </Link>

          <Link
            href="/admin/techniques"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <div className="text-4xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold mb-2">Tehnici Pictură</h2>
            <p className="text-gray-600">Gestionează tehnicile de pictură</p>
          </Link>
        </div>

        {/* Debug & Tools Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6">Instrumente de Debug & Testing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/sitemap"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-center"
            >
              <FiFileText className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Sitemap Admin</h3>
              <p className="text-purple-100 text-sm">Toate paginile și link-urile site-ului</p>
            </Link>

            <Link
              href="/setup-complete"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-center"
            >
              <FiPackage className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Setup Complet</h3>
              <p className="text-blue-100 text-sm">Verifică și configurează totul</p>
            </Link>

            <Link
              href="/debug-gallery"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-center"
            >
              <FiImage className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Debug Gallery</h3>
              <p className="text-green-100 text-sm">Testează API-urile pentru tablouri</p>
            </Link>

            <Link
              href="/admin/migrate-techniques"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-center"
            >
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="text-lg font-semibold mb-2">Migrare Tehnici</h3>
              <p className="text-orange-100 text-sm">Actualizează tehnicile vechi la formatul bilingv</p>
            </Link>

            <Link
              href="/admin/update-descriptions"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-center"
            >
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-semibold mb-2">Actualizează Descrieri</h3>
              <p className="text-purple-100 text-sm">Adaugă descrieri artistice pentru tablouri</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
