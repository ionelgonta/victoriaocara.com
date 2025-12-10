'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AboutContent {
  artistPhoto: string;
  title: string;
  subtitle: string;
  description: string;
  specialties: string[];
}

export default function AdminAboutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    artistPhoto: '/uploads/victoria-studio-photo.jpg',
    title: 'Victoria Ocara',
    subtitle: 'Artistă specializată în pictura cu ulei',
    description: 'Sunt o artistă pasionată de pictura cu ulei, specializată în peisaje urbane iconice și apusuri dramatice.',
    specialties: ['Pictura cu Ulei', 'Peisaje Urbane', 'Tehnica Impasto', 'Apusuri Dramatice']
  });

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const response = await axios.get('/api/about-content');
      setAboutContent(response.data);
    } catch (error) {
      console.error('Error loading about content:', error);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setAboutContent(prev => ({
      ...prev,
      artistPhoto: imageUrl
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('/api/about-content', aboutContent);
      toast.success('Conținutul paginii "Despre" a fost actualizat!');
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error('Eroare la salvarea conținutului');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AboutContent, value: string | string[]) => {
    setAboutContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestionare Pagină "Despre"
            </h1>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Înapoi la Admin
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Upload Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Imaginea Artistei</h2>
              
              {/* Current Image Preview */}
              <div className="mb-4">
                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={aboutContent.artistPhoto}
                    alt="Artist Photo Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Imaginea curentă a artistei
                </p>
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImage={aboutContent.artistPhoto}
              />
            </div>

            {/* Content Edit Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Conținut Text</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titlu Principal
                  </label>
                  <input
                    type="text"
                    value={aboutContent.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subtitlu
                  </label>
                  <input
                    type="text"
                    value={aboutContent.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descriere
                  </label>
                  <textarea
                    value={aboutContent.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Specialități (separate prin virgulă)
                  </label>
                  <input
                    type="text"
                    value={aboutContent.specialties.join(', ')}
                    onChange={(e) => handleInputChange('specialties', e.target.value.split(', '))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pictura cu Ulei, Peisaje Urbane, Tehnica Impasto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Se salvează...' : 'Salvează Modificările'}
            </button>
          </div>

          {/* Preview Section */}
          <div className="mt-12 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Previzualizare</h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="text-2xl font-bold text-blue-900 mb-2">
                    {aboutContent.title}
                  </h4>
                  <p className="text-lg text-gray-700 mb-4">
                    {aboutContent.subtitle}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {aboutContent.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aboutContent.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={aboutContent.artistPhoto}
                    alt="Artist Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}