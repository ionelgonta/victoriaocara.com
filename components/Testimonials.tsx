'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  text: {
    en: string;
    ro: string;
  };
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Mihai Dobre',
    country: 'Romania',
    countryCode: 'RO',
    text: {
      en: 'Outstanding artwork. The painting looks even more vibrant in real life. Excellent quality and presentation.',
      ro: 'Operă de artă remarcabilă. Tabloul arată și mai vibrant în realitate. Calitate și prezentare excelentă.'
    },
    rating: 5
  },
  {
    id: 2,
    name: 'Emily Turner',
    country: 'United Kingdom',
    countryCode: 'GB',
    text: {
      en: 'Beautiful piece. The colors and balance bring a calm energy to my home. Absolutely impressed.',
      ro: 'Piesă frumoasă. Culorile și echilibrul aduc o energie calmă în casa mea. Absolut impresionată.'
    },
    rating: 5
  },
  {
    id: 3,
    name: 'Marco Ferraro',
    country: 'Italy',
    countryCode: 'IT',
    text: {
      en: 'A truly unique artistic style. The painting adds warmth and personality to our living room.',
      ro: 'Un stil artistic cu adevărat unic. Tabloul adaugă căldură și personalitate în sufrageria noastră.'
    },
    rating: 5
  },
  {
    id: 4,
    name: 'Anna Schneider',
    country: 'Germany',
    countryCode: 'DE',
    text: {
      en: 'Exceptional technique and attention to detail. The texture is remarkable and clearly handcrafted.',
      ro: 'Tehnică excepțională și atenție la detalii. Textura este remarcabilă și clar lucrat manual.'
    },
    rating: 5
  },
  {
    id: 5,
    name: 'Andreea Rusu',
    country: 'Romania',
    countryCode: 'RO',
    text: {
      en: 'The artwork exceeded my expectations. It instantly became the centerpiece of my interior.',
      ro: 'Opera de artă mi-a depășit așteptările. A devenit instantaneu piesa centrală a interiorului meu.'
    },
    rating: 5
  },
  {
    id: 6,
    name: 'Daniel Brooks',
    country: 'United Kingdom',
    countryCode: 'GB',
    text: {
      en: 'Fantastic quality. You can feel the emotion in every stroke. A wonderful addition to my collection.',
      ro: 'Calitate fantastică. Poți simți emoția în fiecare pensulă. O adăugare minunată la colecția mea.'
    },
    rating: 5
  },
  {
    id: 7,
    name: 'Giulia Conti',
    country: 'Italy',
    countryCode: 'IT',
    text: {
      en: 'Elegant, expressive, and full of life. Delivery was smooth and the packaging was perfect.',
      ro: 'Elegant, expresiv și plin de viață. Livrarea a fost perfectă și ambalajul impecabil.'
    },
    rating: 5
  },
  {
    id: 8,
    name: 'Franz Keller',
    country: 'Germany',
    countryCode: 'DE',
    text: {
      en: 'A stunning piece that draws attention immediately. Visitors always ask where I bought it.',
      ro: 'O piesă uimitoare care atrage atenția imediat. Vizitatorii întreabă mereu de unde am cumpărat-o.'
    },
    rating: 5
  }
];

export default function Testimonials() {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const testimonialsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  // Auto-play testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalPages]);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setIsAutoPlaying(false);
  };

  const getFlagEmoji = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      'RO': '🇷🇴',
      'GB': '🇬🇧',
      'IT': '🇮🇹',
      'DE': '🇩🇪'
    };
    return flags[countryCode] || '🌍';
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentPage * testimonialsPerPage;
    return testimonials.slice(startIndex, startIndex + testimonialsPerPage);
  };

  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3">
            {t('testimonials.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {getCurrentTestimonials().map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col"
                  >
                    {/* Stars */}
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-sm md:text-base text-gray-700 text-center mb-4 leading-relaxed italic flex-grow">
                      "{testimonial.text[language]}"
                    </blockquote>

                    {/* Author */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-lg">{getFlagEmoji(testimonial.countryCode)}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {testimonial.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {testimonial.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevPage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-primary z-10"
                  aria-label="Previous testimonials"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={nextPage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-primary z-10"
                  aria-label="Next testimonials"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPage
                      ? 'bg-primary'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Auto-play indicator */}
          <div className="text-center mt-3">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isAutoPlaying ? t('testimonials.pauseAutoplay') : t('testimonials.resumeAutoplay')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}