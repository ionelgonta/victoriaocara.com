'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import axios from 'axios';

export default function PaintingPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [painting, setPainting] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Funcții helper pentru a obține textul în limba corectă
  const getTitle = () => {
    if (!painting) return '';
    if (typeof painting.title === 'object') {
      return painting.title[language] || painting.title.en;
    }
    return painting.title;
  };
  
  const getTechnique = () => {
    if (!painting) return '';
    if (typeof painting.technique === 'object') {
      return painting.technique[language] || painting.technique.en;
    }
    return painting.technique;
  };

  const getDescription = () => {
    if (!painting) return '';
    if (typeof painting.description === 'object') {
      return painting.description[language] || painting.description.en;
    }
    return painting.description;
  };

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
        <p className="text-xl">{t('painting.loading')}</p>
      </div>
    );
  }

  if (!painting) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('painting.notFound.title')}</h1>
        <p className="text-gray-600">{t('painting.notFound.message')}</p>
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
                alt={painting.images[selectedImage].alt || getTitle()}
                fill
                className="object-cover"
                priority
              />
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
                    alt={img.alt || `${getTitle()} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-serif font-bold mb-4">{getTitle()}</h1>
          
          <div className="mb-6">
            <p className="text-3xl font-bold text-primary">{formatPrice(painting.price)}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <span className="font-semibold">{t('painting.dimensions')}:</span>{' '}
              {painting.dimensions.width} × {painting.dimensions.height} {painting.dimensions.unit}
            </div>
            <div>
              <span className="font-semibold">{t('painting.technique')}:</span> {getTechnique()}
            </div>
            {painting.sold ? (
              <div className="text-red-600">
                <span className="font-semibold">{t('painting.sold.status')}</span>
              </div>
            ) : painting.stock > 0 ? (
              <div className="text-green-600">
                <span className="font-semibold">{t('painting.available.status')}</span>
              </div>
            ) : (
              <div className="text-red-600">
                <span className="font-semibold">{t('painting.outOfStock')}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{t('painting.description')}</h2>
            <p className="text-gray-700 leading-relaxed">{getDescription()}</p>
          </div>

          <button
            onClick={() => addToCart(painting)}
            disabled={painting.stock === 0 || painting.sold}
            className="w-full bg-primary text-white py-4 rounded-lg hover:bg-accent transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {painting.sold ? t('painting.sold.status') : painting.stock > 0 ? t('painting.addToCart') : t('painting.outOfStock')}
          </button>
        </div>
      </div>
    </div>
  );
}
