'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, safeRender } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { getTechniqueText } from '@/lib/techniques';

interface PaintingCardProps {
  painting: {
    _id: string;
    title: {
      en: string;
      ro: string;
    } | string;
    slug: string;
    price: number;
    images: { url: string; alt: string }[];
    technique: {
      en: string;
      ro: string;
    } | string;
    dimensions: { width: number; height: number; unit: string };
    sold?: boolean;
    negotiable?: boolean;
  };
}

export default function PaintingCard({ painting }: PaintingCardProps) {
  const { t, language } = useLanguage();
  
  // Funcții helper pentru a obține textul în limba corectă
  const getTitle = () => {
    if (typeof painting.title === 'object') {
      return painting.title[language] || painting.title.en;
    }
    return painting.title;
  };
  
  const getTechnique = () => {
    return getTechniqueText(painting.technique, language);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link href={`/tablou/${painting.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          {painting.images && painting.images[0] && painting.images[0].url ? (
            <Image
              src={painting.images[0].url}
              alt={painting.images[0].alt || getTitle()}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                console.error('Image load error:', painting.images[0].url);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🎨</div>
                <div>Fără imagine</div>
              </div>
            </div>
          )}

        </div>
        <div className="mt-4">
          <h3 className="text-lg font-serif font-semibold text-primary group-hover:text-accent transition-colors">
            {getTitle()}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {safeRender(painting.dimensions?.width)} × {safeRender(painting.dimensions?.height)} {safeRender(painting.dimensions?.unit)}
          </p>
          <p className="text-sm text-gray-500">{getTechnique()}</p>
          
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xl ${
                  painting.sold ? 'text-gray-400' : 'text-primary'
                }`}>
                  {formatPrice(painting.price)}
                </p>
                {painting.negotiable && !painting.sold && (
                  <p className="text-xs text-blue-600 font-medium">
                    💰 {t('offer.negotiable')}
                  </p>
                )}
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                painting.sold 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {painting.sold ? t('painting.sold') : t('painting.available')}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
