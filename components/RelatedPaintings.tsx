'use client';

import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import PaintingCard from './PaintingCard';
import axios from 'axios';

interface RelatedPaintingsProps {
  currentPaintingId: string;
}

export default function RelatedPaintings({ currentPaintingId }: RelatedPaintingsProps) {
  const { t } = useLanguage();
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRelatedPaintings();
  }, [currentPaintingId]);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [paintings]);

  const fetchRelatedPaintings = async () => {
    try {
      const res = await axios.get('/api/paintings');
      // Exclude current painting and get other available paintings
      const otherPaintings = res.data.filter((p: any) => p._id !== currentPaintingId && !p.sold);
      setPaintings(otherPaintings);
    } catch (error) {
      console.error('Error fetching related paintings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320; // Width of one card + gap
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-serif font-bold mb-6">{t('related.title')}</h2>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-80 h-80 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (paintings.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-serif font-bold mb-6">{t('related.title')}</h2>
      
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            style={{ marginLeft: '-20px' }}
          >
            <FiChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
            style={{ marginRight: '-20px' }}
          >
            <FiChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {paintings.map((painting: any) => (
            <div key={painting._id} className="w-80 flex-shrink-0">
              <PaintingCard painting={painting} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}