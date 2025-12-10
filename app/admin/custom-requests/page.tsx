'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiUser, FiClock, FiDollarSign, FiImage } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';

export default function AdminCustomRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [responseForm, setResponseForm] = useState({
    status: '',
    adminNotes: '',
    quotedPrice: '',
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
      const res = await axios.get('/api/custom-painting-request', {
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

      if (responseForm.quotedPrice) {
        updateData.quotedPrice = parseFloat(responseForm.quotedPrice);
      }

      if (responseForm.estimatedDelivery) {
        updateData.estimatedDelivery = responseForm.estimatedDelivery;
      }

      await axios.put(`/api/custom-painting-request/${requestId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Răspuns trimis cu succes');
      setSelectedRequest(null);
      setResponseForm({ status: '', adminNotes: '', quotedPrice: '', estimatedDelivery: '' });
      fetchRequests();
    } catch (error) {
      toast.error('Eroare la trimiterea răspunsului');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'În așteptare';
      case 'quoted': return 'Ofertă trimisă';
      case 'accepted': return 'Acceptat';
      case 'in_progress': return 'În lucru';
      case 'completed': return 'Finalizat';
      case 'cancelled': return 'Anulat';
      default: return status;
    }
  };

  const getStyleText = (style: string) => {
    switch (style) {
      case 'realist': return 'Realist';
      case 'impresionist': return 'Impresionist';
      case 'modern': return 'Modern';
      case 'abstract': return 'Abstract';
      case 'artist_style': return 'Stil artist';
      default: return style;
    }
  };

  const getSizeText = (size: string) => {
    return size.replace('x', '×') + ' cm';
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
          <h1 className="text-2xl font-serif font-bold">Cereri Pictură Personalizată</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        {requests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FiImage className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Nu există cereri</h2>
            <p className="text-gray-600">Când clienții vor comanda picturi personalizate, acestea vor apărea aici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request: any) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    Pictură {getSizeText(request.size)}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                {request.photoUrl && (
                  <img
                    src={request.photoUrl}
                    alt="Referință client"
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
                  <div className="flex items-center gap-2 text-sm">
                    <FiPhone className="text-gray-400" />
                    <span>{request.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock className="text-gray-400" />
                    <span>{new Date(request.createdAt).toLocaleDateString('ro-RO')}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-sm space-y-1">
                    <div><strong>Dimensiune:</strong> {getSizeText(request.size)}</div>
                    <div><strong>Stil:</strong> {getStyleText(request.style)}</div>
                    {request.artistStyleDescription && (
                      <div><strong>Detalii stil:</strong> {request.artistStyleDescription}</div>
                    )}
                  </div>
                </div>

                {request.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Descriere:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded italic">"{request.description}"</p>
                  </div>
                )}

                {request.adminNotes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Notele tale:</p>
                    <p className="text-sm bg-blue-50 p-2 rounded">{request.adminNotes}</p>
                  </div>
                )}

                {request.quotedPrice && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Preț ofertat:</p>
                    <p className="text-lg font-semibold text-primary">{formatPrice(request.quotedPrice)}</p>
                  </div>
                )}

                {request.estimatedDelivery && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Livrare estimată:</p>
                    <p className="text-sm font-medium">{new Date(request.estimatedDelivery).toLocaleDateString('ro-RO')}</p>
                  </div>
                )}

                {request.status === 'pending' && (
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    Trimite Ofertă
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
                  Trimite ofertă pentru pictură {getSizeText(selectedRequest.size)}
                </h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p><strong>Client:</strong> {selectedRequest.customerName}</p>
                  <p><strong>Stil:</strong> {getStyleText(selectedRequest.style)}</p>
                  <p><strong>Dimensiune:</strong> {getSizeText(selectedRequest.size)}</p>
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
                      <option value="quoted">Trimite ofertă</option>
                      <option value="accepted">Acceptat - încep lucrul</option>
                      <option value="in_progress">În lucru</option>
                      <option value="completed">Finalizat</option>
                      <option value="cancelled">Refuz comanda</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preț ofertat (EUR):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={responseForm.quotedPrice}
                      onChange={(e) => setResponseForm({ ...responseForm, quotedPrice: e.target.value })}
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
                      placeholder="Detalii despre proces, materiale, modificări posibile..."
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