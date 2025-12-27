'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSave, FiMail, FiPhone, FiMapPin, FiClock, FiFacebook, FiInstagram, FiMessageCircle } from 'react-icons/fi';

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

export default function ContactInfoAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    address: '',
    workingHours: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      whatsapp: ''
    }
  });

  useEffect(() => {
    // Verifică autentificarea
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    loadContactInfo();
  }, [router]);

  const loadContactInfo = async () => {
    try {
      const response = await axios.get('/api/contact-info');
      if (response.data.success) {
        setContactInfo(response.data.contactInfo);
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
      toast.error('Eroare la încărcarea informațiilor de contact');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('/api/contact-info', contactInfo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success('Informațiile de contact au fost salvate cu succes!');
      } else {
        toast.error(response.data.error || 'Eroare la salvarea informațiilor');
      }
    } catch (error: any) {
      console.error('Error saving contact info:', error);
      toast.error(error.response?.data?.error || 'Eroare la salvarea informațiilor');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1];
      setContactInfo(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setContactInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FiMail className="mr-3 text-primary" />
              Informații de Contact
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestionează informațiile de contact afișate pe site
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informații de bază */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="contact@victoriaocara.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline mr-2" />
                  Telefon
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+40 123 456 789"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMapPin className="inline mr-2" />
                Adresă
              </label>
              <input
                type="text"
                value={contactInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="București, România"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiClock className="inline mr-2" />
                Program de lucru
              </label>
              <input
                type="text"
                value={contactInfo.workingHours}
                onChange={(e) => handleInputChange('workingHours', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Luni - Vineri: 9:00 - 18:00"
                required
              />
            </div>

            {/* Rețele sociale */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rețele Sociale</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiFacebook className="inline mr-2" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={contactInfo.socialMedia.facebook}
                    onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiInstagram className="inline mr-2" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={contactInfo.socialMedia.instagram}
                    onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMessageCircle className="inline mr-2" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.socialMedia.whatsapp}
                    onChange={(e) => handleInputChange('socialMedia.whatsapp', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+40 123 456 789"
                  />
                </div>
              </div>
            </div>

            {/* Buton salvare */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="mr-2" />
                {saving ? 'Se salvează...' : 'Salvează Modificările'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}