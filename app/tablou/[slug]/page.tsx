'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import axios from 'axios';

export default function PaintingPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [painting, setPainting] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPainting = async () => {
      try {
        const res = await axios.get('/api/paintings');
        const found = res.data.find((p: any) => p.slug === params.slug);
        setPainting(found);
      } catch (error) {
        console.error('Error fetching painting:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPainting();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl">Se încarcă...</p>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Tablou negăsit</h1>
        <p className="text-gray-600">Ne pare rău, acest tablou nu există.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-lg"
          >
            {painting.images && painting.images[selectedImage] && (
              <Image
                src={painting.images[selectedImage].url}
                alt={painting.images[selectedImage].alt || painting.title}
                fill
                className={`object-cover ${painting.sold ? 'grayscale opacity-75' : ''}`}
                priority
              />
            )}
            
            {painting.sold && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-xl transform rotate-12">
                  VÂNDUT
                </div>
              </div>
            )}
          </motion.div>

          {painting.images && painting.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {painting.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden ${
                    selectedImage === idx ? 'ring-2 ring-accent' : ''
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${painting.title} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-serif font-bold mb-4">{painting.title}</h1>
          
          <div className="mb-6">
            <p className="text-3xl font-bold text-primary">{formatPrice(painting.price)}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <span className="font-semibold">Dimensiuni:</span>{' '}
              {painting.dimensions.width} × {painting.dimensions.height} {painting.dimensions.unit}
            </div>
            <div>
              <span className="font-semibold">Tehnică:</span> {painting.technique}
            </div>
            {painting.sold ? (
              <div className="text-red-600">
                <span className="font-semibold">Vândut</span>
              </div>
            ) : painting.stock > 0 ? (
              <div className="text-green-600">
                <span className="font-semibold">Disponibil</span>
              </div>
            ) : (
              <div className="text-red-600">
                <span className="font-semibold">Stoc epuizat</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Descriere</h2>
            <p className="text-gray-700 leading-relaxed">{painting.description}</p>
          </div>

          <button
            onClick={() => addToCart(painting)}
            disabled={painting.stock === 0 || painting.sold}
            className="w-full bg-primary text-white py-4 rounded-lg hover:bg-accent transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {painting.sold ? 'Vândut' : painting.stock > 0 ? 'Adaugă în Coș' : 'Stoc Epuizat'}
          </button>
        </div>
      </div>
    </div>
  );
}
