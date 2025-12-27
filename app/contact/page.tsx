'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiFacebook, FiInstagram, FiMessageCircle } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import axios from 'axios';

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
}

export default function ContactPage() {
  const { t } = useLanguage();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'contact@victoriaocara.com',
    phone: '+40 123 456 789',
    address: 'București, România',
    workingHours: 'Luni - Vineri: 9:00 - 18:00',
    socialMedia: {
      facebook: '',
      instagram: '',
      whatsapp: ''
    }
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const response = await axios.get('/api/contact-info');
      if (response.data.success) {
        setContactInfo(response.data.contactInfo);
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
      // Folosește valorile default dacă nu se pot încărca
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-serif font-bold text-center mb-4">{t('contact.title')}</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        {t('contact.subtitle')}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-6">{t('contact.sendForm')}</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.name')} *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.email')} *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.phone')}</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.message')} *</label>
              <textarea
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors duration-300 font-semibold"
            >
              {t('contact.send')}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">{t('contact.info.title')}</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <FiMail className="w-6 h-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{t('contact.info.email')}</h3>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-gray-600 hover:text-primary"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiPhone className="w-6 h-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{t('contact.info.phone')}</h3>
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-gray-600 hover:text-primary"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiMapPin className="w-6 h-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{t('contact.info.address')}</h3>
                <p className="text-gray-600">
                  {contactInfo.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiClock className="w-6 h-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{t('contact.info.hours')}</h3>
                <p className="text-gray-600">
                  {contactInfo.workingHours}
                </p>
              </div>
            </div>
          </div>

          {/* Rețele sociale */}
          {(contactInfo.socialMedia.facebook || contactInfo.socialMedia.instagram || contactInfo.socialMedia.whatsapp) && (
            <div className="mt-8 p-6 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-4">Urmărește-ne</h3>
              <div className="flex gap-4">
                {contactInfo.socialMedia.facebook && (
                  <a
                    href={contactInfo.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiFacebook className="w-5 h-5" />
                    Facebook
                  </a>
                )}
                {contactInfo.socialMedia.instagram && (
                  <a
                    href={contactInfo.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiInstagram className="w-5 h-5" />
                    Instagram
                  </a>
                )}
                {contactInfo.socialMedia.whatsapp && (
                  <a
                    href={`https://wa.me/${contactInfo.socialMedia.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiMessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
