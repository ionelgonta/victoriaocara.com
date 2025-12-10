'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { getCachedAboutContent, setCachedAboutContent } from '@/lib/aboutContentCache';

interface AboutContent {
  artistPhoto: string;
  title: string;
  subtitle: string;
  description: string;
  specialties: string[];
}

export default function AboutSection() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      // Verifică cache-ul mai întâi
      const cached = getCachedAboutContent();
      if (cached) {
        setAboutContent(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await axios.get('/api/about-content');
      setAboutContent(response.data);
      setCachedAboutContent(response.data);
    } catch (error) {
      console.error('Error loading about content:', error);
      // Fallback la conținutul implicit în caz de eroare
      const fallbackContent = {
        artistPhoto: '/uploads/victoria-studio-photo.jpg',
        title: 'Victoria Ocara',
        subtitle: 'Artistă specializată în pictura cu ulei',
        description: 'Sunt o artistă pasionată de pictura cu ulei, specializată în peisaje urbane iconice și apusuri dramatice.',
        specialties: ['Pictura cu Ulei', 'Peisaje Urbane', 'Tehnica Impasto', 'Apusuri Dramatice']
      };
      setAboutContent(fallbackContent);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !aboutContent) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-300 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-20 bg-gray-300 rounded"></div>
                  <div className="flex gap-3">
                    <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                    <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                    <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="relative w-full h-96 lg:h-[450px] rounded-2xl overflow-hidden shadow-2xl bg-gray-300 animate-pulse">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6">
              Despre {aboutContent.title}
            </h2>
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p className="text-xl font-medium text-blue-600">
                {aboutContent.subtitle}
              </p>
              <p>
                {aboutContent.description}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {aboutContent.specialties.map((specialty, index) => {
                  const colors = [
                    'bg-blue-100 text-blue-800',
                    'bg-orange-100 text-orange-800', 
                    'bg-yellow-100 text-yellow-800',
                    'bg-purple-100 text-purple-800'
                  ];
                  const icons = ['🎨', '🗼', '✨', '🌅'];
                  
                  return (
                    <span
                      key={index}
                      className={`${colors[index % colors.length]} px-3 py-1 rounded-full text-sm font-medium`}
                    >
                      {icons[index % icons.length]} {specialty}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                href="/despre"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors font-semibold"
              >
                Citește Povestea Mea
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
              >
                Comandă o Lucrare
              </Link>
            </div>
          </div>

          {/* Artist Photo */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={aboutContent.artistPhoto}
                  alt={`${aboutContent.title} în atelierul său`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-200 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 -left-6 w-16 h-16 bg-yellow-200 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}