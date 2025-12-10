'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiDollarSign, FiMail, FiPhone, FiUser, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';

export default function AdminOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [responseForm, setResponseForm] = useState({
    status: '',
    adminResponse: '',
    counterOffer: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchOffers();
  }, [router]);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/price-offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(res.data);
    } catch (error) {
      toast.error('Eroare la încărcarea ofertelor');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (offerId: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.put(`/api/price-offers/${offerId}`, responseForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Răspuns trimis cu succes');
      setSelectedOffer(null);
      setResponseForm({ status: '', adminResponse: '', counterOffer: '' });
      fetchOffers();
    } catch (error) {
      toast.error('Eroare la trimiterea răspunsului');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'countered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'În așteptare';
      case 'accepted': return 'Acceptată';
      case 'rejected': return 'Respinsă';
      case 'countered': return 'Contraofertă';
      default: return status;
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Se încarcă ofertele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Oferte de Preț</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        {offers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FiDollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Nu există oferte</h2>
            <p className="text-gray-600">Când clienții vor face oferte pentru tablouri, acestea vor apărea aici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {offers.map((offer: any) => (
              <div key={offer._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {offer.paintingId?.title?.en || offer.paintingId?.title || 'Tablou necunoscut'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                    {getStatusText(offer.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="text-gray-400" />
                    <span>{offer.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiMail className="text-gray-400" />
                    <span>{offer.customerEmail}</span>
                  </div>
                  {offer.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="text-gray-400" />
                      <span>{offer.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock className="text-gray-400" />
                    <span>{new Date(offer.createdAt).toLocaleDateString('ro-RO')}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Preț original:</span>
                    <span className="font-medium">{formatPrice(offer.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Oferta clientului:</span>
                    <span className="font-bold text-primary">{formatPrice(offer.offeredPrice)}</span>
                  </div>
                  {offer.counterOffer && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="text-sm text-gray-600">Contraoferta ta:</span>
                      <span className="font-bold text-blue-600">{formatPrice(offer.counterOffer)}</span>
                    </div>
                  )}
                </div>

                {offer.message && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Mesaj:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded italic">"{offer.message}"</p>
                  </div>
                )}

                {offer.adminResponse && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Răspunsul tău:</p>
                    <p className="text-sm bg-blue-50 p-2 rounded">{offer.adminResponse}</p>
                  </div>
                )}

                {offer.status === 'pending' && (
                  <button
                    onClick={() => setSelectedOffer(offer)}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    Răspunde la Ofertă
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal pentru răspuns */}
        {selectedOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Răspunde la oferta pentru "{selectedOffer.paintingId?.title?.en || selectedOffer.paintingId?.title}"
                </h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p><strong>Client:</strong> {selectedOffer.customerName}</p>
                  <p><strong>Ofertă:</strong> {formatPrice(selectedOffer.offeredPrice)}</p>
                  <p><strong>Preț original:</strong> {formatPrice(selectedOffer.originalPrice)}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Decizia ta:</label>
                    <select
                      value={responseForm.status}
                      onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Selectează...</option>
                      <option value="accepted">Acceptă oferta</option>
                      <option value="rejected">Respinge oferta</option>
                      <option value="countered">Fă o contraofertă</option>
                    </select>
                  </div>

                  {responseForm.status === 'countered' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Contraoferta ta (EUR):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={responseForm.counterOffer}
                        onChange={(e) => setResponseForm({ ...responseForm, counterOffer: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Mesaj pentru client:</label>
                    <textarea
                      value={responseForm.adminResponse}
                      onChange={(e) => setResponseForm({ ...responseForm, adminResponse: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Mesajul tău pentru client..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedOffer(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={() => handleResponse(selectedOffer._id)}
                      disabled={!responseForm.status}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent disabled:bg-gray-400"
                    >
                      Trimite Răspuns
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}