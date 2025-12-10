'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PaintingCard from '@/components/PaintingCard';
import axios from 'axios';

export default function FeaturedPaintings() {
  const [featuredPaintings, setFeaturedPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedPaintings();
  }, []);

  const loadFeaturedPaintings = async () => {
    try {
      console.log('Loading featured paintings...');
      setLoading(true);
      
      const response = await axios.get('/api/paintings?featured=true');
      console.log('Featured paintings loaded:', response.data.length);
      
      setFeaturedPaintings(response.data);
    } catch (error) {
      console.error('Error loading featured paintings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif font-bold text-center mb-12">
          Lucrări Selectate
        </h2>
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Se încarcă tablourile selectate...</p>
        </div>
      </section>
    );
  }

  if (featuredPaintings.length > 0) {
    return (
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-serif font-bold text-center mb-12">
          Lucrări Selectate
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPaintings.map((painting: any) => (
            <PaintingCard key={painting._id} painting={painting} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/galerie"
            className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
          >
            Vezi Toate Tablourile
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-4xl font-serif font-bold mb-8">
        Lucrări Selectate
      </h2>
      <p className="text-gray-600 mb-8">
        Nu există tablouri selectate momentan pentru afișare pe homepage.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Pentru a afișa tablouri aici, adaugă tablouri în panoul admin și bifează "Featured on Homepage".
      </p>
      <Link
        href="/galerie"
        className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-accent transition-colors"
      >
        Vezi Toate Tablourile
      </Link>
    </section>
  );
}