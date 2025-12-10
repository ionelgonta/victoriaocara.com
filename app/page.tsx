'use client';

import Link from 'next/link';
import Image from 'next/image';
import AboutSection from '@/components/AboutSection';
import FeaturedPaintings from '@/components/FeaturedPaintings';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/uploads/1765357410380_WhatsApp_Image_2025-12-10_at_10.05.43.jpeg"
            alt="Background art"
            fill
            className="object-cover"
            priority
            quality={85}
          />
          {/* Overlay pentru contrast mai bun */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 drop-shadow-2xl leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/galerie"
              className="inline-block bg-white/90 text-primary px-8 py-4 rounded-lg hover:bg-white hover:scale-105 transition-all duration-300 text-lg font-semibold shadow-xl backdrop-blur-sm"
            >
              {t('home.hero.cta')}
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-white/80 text-white px-8 py-4 rounded-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 text-lg font-semibold backdrop-blur-sm"
            >
              {t('home.hero.contact')}
            </Link>
          </div>
        </div>
      </section>

      <AboutSection />

      <FeaturedPaintings />

      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">{t('features.original.title')}</h3>
              <p className="text-gray-600">
                {t('features.original.description')}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">{t('features.delivery.title')}</h3>
              <p className="text-gray-600">
                {t('features.delivery.description')}
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">{t('features.payment.title')}</h3>
              <p className="text-gray-600">
                {t('features.payment.description')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
