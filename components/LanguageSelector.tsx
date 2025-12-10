'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      flag: '/flags/uk-flag.svg'
    },
    { 
      code: 'ro', 
      name: 'Română', 
      flag: '/flags/ro-flag.svg'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="w-6 h-6 relative">
          <Image
            src={currentLanguage?.flag || '/flags/uk-flag.svg'}
            alt={currentLanguage?.name || 'English'}
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage?.code.toUpperCase()}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as 'en' | 'ro');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div className="w-6 h-6 relative">
                <Image
                  src={lang.flag}
                  alt={lang.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}