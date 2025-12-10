'use client';

import { useState, useEffect } from 'react';
import PaintingCard from '@/components/PaintingCard';
import axios from 'axios';

export default function GaleriePage() {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaintings();
  }, []);

  const loadPaintings = async () => {
    try {
      console.log('Loading paintings...');
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/paintings');
      console.log('Paintings loaded:', response.data.length);
      
      setPaintings(response.data);
    } catch (error: any) {
      console.error('Error loading paintings:', error);
      setError('Eroare la încărcarea tablourilor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-serif font-bold text-center mb-4">Galerie</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Explorează colecția noastră completă de tablouri originale
      </p>

      {/* Debug Info */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg text-sm">
        <p><strong>Status:</strong> {loading ? 'Se încarcă...' : 'Încărcat'}</p>
        <p><strong>Tablouri găsite:</strong> {paintings.length}</p>
        {error && <p className="text-red-600"><strong>Eroare:</strong> {error}</p>}
        <button 
          onClick={loadPaintings}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reîncarcă Tablourile
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Se încarcă tablourile...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadPaintings}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Încearcă din nou
          </button>
        </div>
      ) : paintings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 mb-4">
            Nu există tablouri disponibile momentan.
          </p>
          <p className="text-gray-500">
            Adaugă tablouri din panoul admin pentru a le vedea aici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paintings.map((painting: any) => (
            <PaintingCard key={painting._id} painting={painting} />
          ))}
        </div>
      )}
    </div>
  );
}
