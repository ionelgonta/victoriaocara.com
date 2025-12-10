'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiInstagram } from 'react-icons/fi';
import { SiThreads, SiFacebook } from 'react-icons/si';
import axios from 'axios';
import { getCachedAboutContent, setCachedAboutContent } from '@/lib/aboutContentCache';

interface AboutContent {
  artistPhoto: string;
  title: string;
  subtitle: string;
  description: string;
  specialties: string[];
}

export default function DesprePage() {
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
      <div className="min-h-screen bg-white">
        <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="animate-pulse">
                  <div className="h-16 bg-gray-300 rounded mb-6"></div>
                  <div className="space-y-4 mb-8">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-20 bg-gray-300 rounded"></div>
                    <div className="flex flex-wrap gap-3">
                      <div className="h-8 w-32 bg-gray-300 rounded-full"></div>
                      <div className="h-8 w-28 bg-gray-300 rounded-full"></div>
                      <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gray-300 animate-pulse">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Se încarcă conținutul...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Despre Victoria Ocara - Artist Page */}
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
                {aboutContent.title}
              </h1>
              <div className="text-xl text-gray-700 mb-8 space-y-4">
                <p className="flex items-center gap-2">
                  🎨 <span className="font-semibold">{aboutContent.subtitle}</span>
                </p>
                <p className="text-lg leading-relaxed">
                  {aboutContent.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  {aboutContent.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mb-8">
                <a
                  href="https://www.instagram.com/victoria.ocara/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <FiInstagram className="w-5 h-5" />
                  Instagram
                </a>
                <a
                  href="https://www.threads.com/@victoria.ocara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <SiThreads className="w-5 h-5" />
                  Threads
                </a>
                <a
                  href="https://www.facebook.com/victoria.ocara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <SiFacebook className="w-5 h-5" />
                  Facebook
                </a>
              </div>

              <Link
                href="/contact"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-accent transition-colors text-lg font-semibold"
              >
                Contactează-mă pentru Comisii
              </Link>
            </div>

            {/* Artist Photo */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={aboutContent.artistPhoto}
                    alt={`${aboutContent.title} în atelierul său`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              Povestea Mea Artistică
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-serif font-semibold mb-4 text-blue-600">
                  Pasiunea pentru Albastru
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Albastrul nu este doar o culoare în arta mea - este limbajul prin care îmi exprim emoțiile și viziunea. 
                  Fiecare nuanță de albastru povestește o poveste diferită, de la liniștea cerului până la profunzimea oceanului.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Tehnica impasto îmi permite să creez texturi bogate și expresive, aducând viață și dimensiune 
                  fiecărei pânze prin straturi groase de culoare.
                </p>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-2xl">
                <h4 className="text-xl font-semibold mb-4 text-primary">Inspirații & Stil</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Peisaje urbane iconice - Paris, Turnul Eiffel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span>Apusuri și răsărituri dramatice</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>Tehnica impasto pentru texturi bogate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span>Paleta de albastru și portocaliu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span>Inspirație din Monet și Van Gogh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Section */}
            <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-8 rounded-2xl mb-16">
              <h3 className="text-2xl font-serif font-semibold mb-6 text-center">
                În Atelierul Meu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Fiecare tablou prinde viață în atelierul meu, unde pasiunea pentru culoare și textură 
                    se transformă în opere de artă unice. Lucrez cu tehnica impasto, creând straturi groase 
                    de vopsea care dau dimensiune și viață fiecărei pânze.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Peisajele urbane, în special cele cu Turnul Eiffel, sunt o sursă constantă de inspirație. 
                    Îmi place să surprind jocul de lumină și umbră, contrastul dintre cerul albastru și 
                    căldura apusurilor portocalii.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h4 className="font-semibold mb-4 text-primary">Procesul Meu Creativ</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                      <span>Schițez compoziția pe pânză</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                      <span>Aplic straturile de bază cu pensule late</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                      <span>Construiesc textura cu tehnica impasto</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                      <span>Finalizez detaliile și contrastele</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technique Section */}
            <div className="bg-secondary p-8 rounded-2xl mb-16">
              <h3 className="text-2xl font-serif font-semibold mb-6 text-center">
                Tehnica Mea
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🗼</span>
                  </div>
                  <h4 className="font-semibold mb-2">Peisaje Urbane</h4>
                  <p className="text-sm text-gray-600">
                    Specializată în peisaje iconice - Turnul Eiffel, Paris
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🌅</span>
                  </div>
                  <h4 className="font-semibold mb-2">Apusuri Dramatice</h4>
                  <p className="text-sm text-gray-600">
                    Captez jocul de lumină și culoare în apusuri spectaculoase
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">✨</span>
                  </div>
                  <h4 className="font-semibold mb-2">Tehnica Impasto</h4>
                  <p className="text-sm text-gray-600">
                    Straturi groase de vopsea pentru texturi expresive și vibrante
                  </p>
                </div>
              </div>
            </div>

            {/* Commission Section */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-serif font-bold mb-4">
                Comisii Personalizate
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Îți pot crea o lucrare unică, personalizată după viziunea ta. 
                Fiecare comision este o colaborare artistică specială.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Solicită o Comision
                </Link>
                <Link
                  href="/galerie"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Vezi Portofoliul
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}