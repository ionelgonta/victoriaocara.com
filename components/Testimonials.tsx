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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
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

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
              >
                {/* Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed italic">
                  "{currentTestimonial.text[language]}"
                </blockquote>

                {/* Author */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-2xl">{getFlagEmoji(currentTestimonial.countryCode)}</span>
                    <div>
                      <p className="font-semibold text-lg text-gray-900">
                        {currentTestimonial.name}
                      </p>
                      <p className="text-gray-600">
                        {currentTestimonial.country}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-primary"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-primary"
              aria-label="Next testimonial"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-primary'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play indicator */}
          <div className="text-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isAutoPlaying ? t('testimonials.pauseAutoplay') : t('testimonials.resumeAutoplay')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}