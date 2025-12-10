'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import ImageUpload from '@/components/ImageUpload';

export default function AdminPaintingsPage() {
  const router = useRouter();
  const [paintings, setPaintings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    technique: '',
    width: '',
    height: '',
    stock: '1',
    featured: false,
    sold: false,
    images: [{ url: '', alt: '' }],
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchPaintings();
  }, [router]);

  const fetchPaintings = async () => {
    try {
      const res = await axios.get('/api/paintings');
      setPaintings(res.data);
    } catch (error) {
      toast.error('Eroare la încărcarea tablourilor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    console.log('Admin token:', token ? 'exists' : 'missing');

    // Validare frontend
    if (!formData.title.trim()) {
      toast.error('Titlul este obligatoriu');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Descrierea este obligatorie');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Prețul trebuie să fie mai mare ca 0');
      return;
    }
    if (!formData.width || parseFloat(formData.width) <= 0) {
      toast.error('Lățimea trebuie să fie mai mare ca 0');
      return;
    }
    if (!formData.height || parseFloat(formData.height) <= 0) {
      toast.error('Înălțimea trebuie să fie mai mare ca 0');
      return;
    }

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      dimensions: {
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        unit: 'cm',
      },
      stock: parseInt(formData.stock),
    };

    try {
      if (editingId) {
        await axios.put(`/api/paintings/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tablou actualizat');
      } else {
        await axios.post('/api/paintings', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Tablou adăugat');
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchPaintings();
    } catch (error: any) {
      console.error('Save painting error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Eroare la salvarea tabloului';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur vrei să ștergi acest tablou?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/paintings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Tablou șters');
      fetchPaintings();
    } catch (error) {
      toast.error('Eroare la ștergerea tabloului');
    }
  };

  const handleEdit = (painting: any) => {
    setEditingId(painting._id);
    setFormData({
      title: painting.title,
      description: painting.description,
      price: painting.price.toString(),
      technique: painting.technique,
      width: painting.dimensions.width.toString(),
      height: painting.dimensions.height.toString(),
      stock: painting.stock.toString(),
      featured: painting.featured,
      sold: painting.sold || false,
      images: painting.images.length > 0 ? painting.images : [{ url: '', alt: '' }],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      technique: '',
      width: '',
      height: '',
      stock: '1',
      featured: false,
      sold: false,
      images: [{ url: '', alt: '' }],
    });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', alt: '' }],
    });
  };

  const updateImage = (index: number, field: 'url' | 'alt', value: string, altValue?: string) => {
    const newImages = [...formData.images];
    newImages[index][field] = value;
    if (field === 'url' && altValue !== undefined) {
      newImages[index]['alt'] = altValue;
    }
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Gestionează Tablouri</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            resetForm();
          }}
          className="mb-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          <FiPlus /> Adaugă Tablou Nou
        </button>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editează Tablou' : 'Tablou Nou'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titlu *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tehnică *</label>
                  <input
                    type="text"
                    value={formData.technique}
                    onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preț (EUR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stoc *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lățime (cm) *</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Înălțime (cm) *</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descriere *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Tablou selectat (afișat pe homepage)</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.sold}
                    onChange={(e) => setFormData({ ...formData, sold: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Vândut</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Imagini Tablou</label>
                
                {formData.images.map((img, idx) => (
                  <div key={idx} className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Imagine {idx + 1}</h4>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== idx);
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                    
                    <ImageUpload
                      onImageUploaded={(url, alt) => updateImage(idx, 'url', url, alt)}
                      existingUrl={img.url}
                      existingAlt={img.alt}
                    />
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-2 text-accent hover:text-primary font-medium"
                >
                  <FiPlus /> Adaugă altă imagine
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  {editingId ? 'Actualizează' : 'Adaugă'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paintings.map((painting: any) => (
            <div key={painting._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {painting.images && painting.images[0] && (
                <div className="relative h-48">
                  <Image
                    src={painting.images[0].url}
                    alt={painting.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{painting.title}</h3>
                  {painting.sold && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Vândut
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{painting.technique}</p>
                <p className="font-bold text-primary mb-4">{formatPrice(painting.price)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(painting)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    <FiEdit /> Editează
                  </button>
                  <button
                    onClick={() => handleDelete(painting._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    <FiTrash2 /> Șterge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
