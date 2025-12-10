'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiImage, FiUser, FiMail, FiPhone, FiCheck } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CustomPaintingPage() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    size: '',
    style: '',
    artistStyleDescription: '',
    description: '',
  });

  const sizes = [
    { value: '30x40', label: '30×40 cm', price: '€150-200' },
    { value: '40x50', label: '40×50 cm', price: '€200-300' },
    { value: '50x70', label: '50×70 cm', price: '€300-450' },
    { value: '70x100', label: '70×100 cm', price: '€450-650' },
  ];

  const styles = [
    { value: 'realist', label: t('customPainting.styles.realist') },
    { value: 'impresionist', label: t('customPainting.styles.impressionist') },
    { value: 'modern', label: t('customPainting.styles.modern') },
    { value: 'abstract', label: t('customPainting.styles.abstract') },
    { value: 'artist_style', label: t('customPainting.styles.artistStyle') },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('customPainting.errors.invalidFile'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('customPainting.errors.fileTooLarge'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedImage(response.data.url);
      toast.success(t('customPainting.imageUploaded'));
    } catch (error) {
      toast.error(t('customPainting.errors.uploadFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description && !uploadedImage) {
      toast.error(t('customPainting.errors.descriptionOrPhoto'));
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        size: formData.size,
        style: formData.style,
        artistStyleDescription: formData.style === 'artist_style' ? formData.artistStyleDescription : undefined,
        description: formData.description,
        photo_url: uploadedImage,
      };

      await axios.post('/api/custom-painting-request', requestData);
      
      setStep('success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('customPainting.errors.submitFailed');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('customPainting.success.title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('customPainting.success.message')}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors"
          >
            {t('customPainting.success.backHome')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {t('customPainting.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('customPainting.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image Upload & Description */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiImage className="text-primary" />
                      {t('customPainting.inspiration.title')}
                    </h3>
                    
                    {/* Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        {t('customPainting.inspiration.uploadPhoto')}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        {uploadedImage ? (
                          <div className="relative">
                            <img
                              src={uploadedImage}
                              alt="Uploaded inspiration"
                              className="max-w-full h-48 object-cover rounded-lg mx-auto"
                            />
                            <button
                              type="button"
                              onClick={() => setUploadedImage('')}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div>
                            <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">{t('customPainting.inspiration.dragDrop')}</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="inline-block bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                            >
                              {t('customPainting.inspiration.selectFile')}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('customPainting.inspiration.description')}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t('customPainting.inspiration.descriptionPlaceholder')}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Specifications & Contact */}
                <div className="space-y-6">
                  {/* Size Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiImage className="text-primary" />
                      {t('customPainting.specifications.title')}
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        {t('customPainting.specifications.size')} *
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">{t('customPainting.specifications.selectSize')}</option>
                        {sizes.map((size) => (
                          <option key={size.value} value={size.value}>
                            {size.label} - {size.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Style Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        {t('customPainting.specifications.style')} *
                      </label>
                      <select
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">{t('customPainting.specifications.selectStyle')}</option>
                        {styles.map((style) => (
                          <option key={style.value} value={style.value}>
                            {style.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Artist Style Description */}
                    {formData.style === 'artist_style' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          {t('customPainting.specifications.artistStyleDescription')}
                        </label>
                        <input
                          type="text"
                          value={formData.artistStyleDescription}
                          onChange={(e) => setFormData({ ...formData, artistStyleDescription: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t('customPainting.specifications.artistStylePlaceholder')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiUser className="text-primary" />
                      {t('customPainting.contact.title')}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('customPainting.contact.name')} *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t('customPainting.contact.namePlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('customPainting.contact.email')} *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t('customPainting.contact.emailPlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('customPainting.contact.phone')} *
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={t('customPainting.contact.phonePlaceholder')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-lg hover:bg-accent transition-colors disabled:bg-gray-400 text-lg font-semibold"
                >
                  {loading ? t('customPainting.submitting') : t('customPainting.submitButton')}
                </button>
                <p className="text-center text-sm text-gray-600 mt-3">
                  {t('customPainting.responseTime')}
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}