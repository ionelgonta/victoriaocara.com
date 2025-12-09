'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FiPackage, FiImage, FiFileText, FiLogOut } from 'react-icons/fi';

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            href="/admin/content"
            className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center"
          >
            <FiFileText className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-semibold mb-2">Conținut Site</h2>
            <p className="text-gray-600">Editează conținutul paginii principale</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
