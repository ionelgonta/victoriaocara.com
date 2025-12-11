'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SimilarRequestFormProps {
  painting: {
    _id: string;
    title: any;
    price: number;
    dimensions: { width: number; height: number; unit: string };
    images: { url: string; alt: string }[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function SimilarRequestForm({ painting, isOpen, onClose }: SimilarRequestFormProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    preferredSize: 'same',
    customDimensions: {
      width: painting.dimensions.width,
      height: painting.dimensions.height,
      unit: painting.dimensions.unit
    },
    budgetRange: {
      min: Math.round(painting.price * 0.8),
      max: Math.round(painting.price * 1.2)
    },
    message: '',
    urgency: 'medium'
  });

  const getTitle = () => {
    if (typeof painting.title === 'object') {
      return painting.title[language] || painting.title.en;
    }
    return painting.title;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        soldPaintingId: painting._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        preferredSize: formData.preferredSize,
        customDimensions: formData.preferredSize === 'custom' ? formData.customDimensions : undefined,
        budgetRange: formData.budgetRange,
        message: formData.message,
        urgency: formData.urgency
      };

      await axios.post('/api/similar-requests', requestData);
      
      toast.success(t('similarRequest.success'));
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        preferredSize: 'same',
        customDimensions: {
          width: painting.dimensions.width,
          height: painting.dimensions.height,
          unit: painting.dimensions.unit
        },
        budgetRange: {
          min: Math.round(painting.price * 0.8),
          max: Math.round(painting.price * 1.2)
        },
        message: '',
        urgency: 'medium'
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('similarRequest.error');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiImage className="text-primary" />
                  {t('similarRequest.title')}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex gap-4">
                {painting.images && painting.images[0] && (
                  <img
                    src={painting.images[0].url}
                    alt={getTitle()}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-medium">{getTitle()}</h3>
                  <p className="text-sm text-gray-600">
                    {String(painting.dimensions?.width || '')} × {String(painting.dimensions?.height || '')} {String(painting.dimensions?.unit || '')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('similarRequest.originalPrice')}: {formatPrice(painting.price)}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('similarRequest.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t('similarRequest.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('similarRequest.email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t('similarRequest.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('similarRequest.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('similarRequest.phonePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('similarRequest.preferredSize')} *
                  </label>
                  <select
                    value={formData.preferredSize}
                    onChange={(e) => setFormData({ ...formData, preferredSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="same">{t('similarRequest.sameSize')}</option>
                    <option value="smaller">{t('similarRequest.smaller')}</option>
                    <option value="larger">{t('similarRequest.larger')}</option>
                    <option value="custom">{t('similarRequest.custom')}</option>
                  </select>
                </div>

                {formData.preferredSize === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('similarRequest.width')} (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.customDimensions.width}
                        onChange={(e) => setFormData({
                          ...formData,
                          customDimensions: {
                            ...formData.customDimensions,
                            width: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('similarRequest.height')} (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.customDimensions.height}
                        onChange={(e) => setFormData({
                          ...formData,
                          customDimensions: {
                            ...formData.customDimensions,
                            height: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('similarRequest.budget')} (EUR)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        value={formData.budgetRange.min}
                        onChange={(e) => setFormData({
                          ...formData,
                          budgetRange: {
                            ...formData.budgetRange,
                            min: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t('similarRequest.minBudget')}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.budgetRange.max}
                        onChange={(e) => setFormData({
                          ...formData,
                          budgetRange: {
                            ...formData.budgetRange,
                            max: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t('similarRequest.maxBudget')}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('similarRequest.urgency')}
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">{t('similarRequest.lowUrgency')}</option>
                    <option value="medium">{t('similarRequest.mediumUrgency')}</option>
                    <option value="high">{t('similarRequest.highUrgency')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('similarRequest.message')}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('similarRequest.messagePlaceholder')}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors disabled:bg-gray-400"
                  >
                    {loading ? t('similarRequest.sending') : t('similarRequest.send')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}