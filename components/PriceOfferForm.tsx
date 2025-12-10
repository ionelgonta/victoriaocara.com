'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiX } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

interface PriceOfferFormProps {
  painting: {
    _id: string;
    title: any;
    price: number;
    negotiable: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function PriceOfferForm({ painting, isOpen, onClose }: PriceOfferFormProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    offeredPrice: '',
    message: ''
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
      const offerData = {
        paintingId: painting._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        offeredPrice: parseFloat(formData.offeredPrice),
        message: formData.message
      };

      await axios.post('/api/price-offers', offerData);
      
      toast.success(t('offer.success'));
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        offeredPrice: '',
        message: ''
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('offer.error');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrices = [
    Math.round(painting.price * 0.8),
    Math.round(painting.price * 0.85),
    Math.round(painting.price * 0.9),
  ];

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
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiDollarSign className="text-primary" />
                  {t('offer.title')}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{getTitle()}</h3>
                <p className="text-sm text-gray-600">
                  {t('offer.currentPrice')}: <span className="font-semibold">{formatPrice(painting.price)}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('offer.name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('offer.namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('offer.email')} *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('offer.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('offer.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('offer.phonePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('offer.yourPrice')} * (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={painting.price}
                    value={formData.offeredPrice}
                    onChange={(e) => setFormData({ ...formData, offeredPrice: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-2">{t('offer.suggestions')}:</p>
                    <div className="flex gap-2">
                      {suggestedPrices.map((price) => (
                        <button
                          key={price}
                          type="button"
                          onClick={() => setFormData({ ...formData, offeredPrice: price.toString() })}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {formatPrice(price)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('offer.message')}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('offer.messagePlaceholder')}
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
                    {loading ? t('offer.sending') : t('offer.send')}
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