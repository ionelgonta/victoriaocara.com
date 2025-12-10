'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SetupPage() {
  const [formData, setFormData] = useState({
    email: 'admin@victoriaocara.com',
    password: 'AdminVictoria2024!',
    name: 'Victoria Ocara Admin'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/setup-admin', formData);
      toast.success('Admin creat cu succes!');
      console.log('Admin creat:', response.data);
      
      // Redirect la login după 2 secunde
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (error: any) {
      if (error.response?.data?.error === 'Admin already exists') {
        toast.error('Admin-ul există deja. Mergi la /admin pentru login.');
      } else {
        toast.error('Eroare la crearea admin-ului');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-serif font-bold text-center mb-8">
          Setup Admin
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Creează primul admin pentru site
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Parolă</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nume</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Se creează...' : 'Creează Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/admin" className="text-accent hover:underline">
            Ai deja admin? Login aici
          </a>
        </div>
      </div>
    </div>
  );
}