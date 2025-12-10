'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiUser, FiClock, FiDollarSign, FiImage } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';

export default function AdminSimilarRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseForm, setResponseForm] = useState({
    status: '',
    adminNotes: '',
    estimatedPrice: '',
    estimatedDelivery: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/similar-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (error) {
      toast.error('Eroare la încărcarea cererilor');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string) => {
    const token = localStorage.getItem('adminToken');
    try {
      const updateData: any = {
        status: responseForm.status,
        adminNotes: responseForm.adminNotes
      };

      if (responseForm.estimatedPrice) {
        updateData.estimatedPrice = parseFloat(responseForm.estimatedPrice);
      }

      if (responseForm.estimatedDelivery) {
        updateData.estimatedDelivery = responseForm.estimatedDelivery;
      }

      await axios.put(`/api/similar-requests/${requestId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Răspuns trimis cu succes');
      setSelectedRequest(null);
      setResponseForm({ status: '', adminNotes: '', estimatedPrice: '', estimatedDelivery: '' });
      fetchRequests();
    } catch (error) {
      toast.error('Eroare la trimiterea răspunsului');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'În așteptare';
      case 'contacted': return 'Contactat';
      case 'in_progress': return 'În lucru';
      case 'completed': return 'Finalizat';
      case 'cancelled': return 'Anulat';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Normal';
      case 'low': return 'Fără grabă';
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Se încarcă cererile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Cereri Tablouri Similare</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        {requests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FiImage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Nu există cereri</h2>
            <p className="text-gray-600">Când clienții vor cere tablouri similare, acestea vor apărea aici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request: any) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {request.soldPaintingId?.title?.en || request.soldPaintingId?.title || 'Tablou necunoscut'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                {request.soldPaintingId?.images?.[0] && (
                  <img
                    src={request.soldPaintingId.images[0].url}
                    alt={request.soldPaintingId.title?.en || 'Painting'}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="text-gray-400" />
                    <span>{request.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiMail className="text-gray-400" />
                    <span>{request.customerEmail}</span>
                  </div>
                  {request.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="text-gray-400" />
                      <span>{request.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock className="text-gray-400" />
                    <span>{new Date(request.createdAt).toLocaleDateString('ro-RO')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Urgență:</span>
                    <span className={`font-medium ${getUrgencyColor(request.urgency)}`}>
                      {getUrgencyText(request.urgency)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-sm space-y-1">
                    <div><strong>Dimensiune:</strong> {request.preferredSize === 'same' ? 'Aceeași' : 
                      request.preferredSize === 'smaller' ? 'Mai mică' :
                      request.preferredSize === 'larger' ? 'Mai mare' : 'Personalizată'}</div>
                    {request.customDimensions && (
                      <div><strong>Dimensiuni:</strong> {request.customDimensions.width} × {request.customDimensions.height} cm</div>
                    )}
                    <div><strong>Buget:</strong> {formatPrice(request.budgetRange.min)} - {formatPrice(request.budgetRange.max)}</div>
                  </div>
                </div>

                {request.message && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Mesaj:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded italic">"{request.message}"</p>
                  </div>
                )}

                {request.adminNotes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Notele tale:</p>
                    <p className="text-sm bg-blue-50 p-2 rounded">{request.adminNotes}</p>
                  </div>
                )}

                {request.estimatedPrice && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Preț estimat:</p>
                    <p className="text-lg font-semibold text-primary">{formatPrice(request.estimatedPrice)}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    Răspunde la Cerere
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal pentru răspuns */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Răspunde la cererea pentru "{selectedRequest.soldPaintingId?.title?.en || selectedRequest.soldPaintingId?.title}"
                </h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p><strong>Client:</strong> {selectedRequest.customerName}</p>
                  <p><strong>Buget:</strong> {formatPrice(selectedRequest.budgetRange.min)} - {formatPrice(selectedRequest.budgetRange.max)}</p>
                  <p><strong>Urgență:</strong> {getUrgencyText(selectedRequest.urgency)}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status:</label>
                    <select
                      value={responseForm.status}
                      onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Selectează...</option>
                      <option value="contacted">Am contactat clientul</option>
                      <option value="in_progress">Încep lucrul la tablou</option>
                      <option value="completed">Tablou finalizat</option>
                      <option value="cancelled">Anulează cererea</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preț estimat (EUR):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={responseForm.estimatedPrice}
                      onChange={(e) => setResponseForm({ ...responseForm, estimatedPrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data estimată de livrare:</label>
                    <input
                      type="date"
                      value={responseForm.estimatedDelivery}
                      onChange={(e) => setResponseForm({ ...responseForm, estimatedDelivery: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Note pentru client:</label>
                    <textarea
                      value={responseForm.adminNotes}
                      onChange={(e) => setResponseForm({ ...responseForm, adminNotes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Detalii despre tablou, proces, etc..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={() => handleResponse(selectedRequest._id)}
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