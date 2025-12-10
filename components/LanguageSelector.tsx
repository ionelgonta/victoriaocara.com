'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          language === 'en' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="English"
      >
        <span className="text-lg">🇬🇧</span>
        <span className="text-sm font-medium">EN</span>
      </button>
      
      <button
        onClick={() => setLanguage('ro')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          language === 'ro' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title="Română"
      >
        <span className="text-lg">🇷🇴</span>
        <span className="text-sm font-medium">RO</span>
      </button>
    </div>
  );
}