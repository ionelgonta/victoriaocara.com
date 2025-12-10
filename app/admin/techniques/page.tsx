'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { defaultTechniques, Technique } from '@/lib/techniques';

export default function AdminTechniquesPage() {
  const router = useRouter();
  const [customTechniques, setCustomTechniques] = useState<Technique[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    en: '',
    ro: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    loadCustomTechniques();
  }, [router]);

  const loadCustomTechniques = () => {
    const saved = localStorage.getItem('customTechniques');
    if (saved) {
      setCustomTechniques(JSON.parse(saved));
    }
  };

  const saveCustomTechniques = (techniques: Technique[]) => {
    localStorage.setItem('customTechniques', JSON.stringify(techniques));
    setCustomTechniques(techniques);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.en.trim() || !formData.ro.trim()) {
      toast.error('Ambele traduceri sunt obligatorii');
      return;
    }

    if (editingId) {
      // Editare
      const updated = customTechniques.map(tech => 
        tech.id === editingId 
          ? { ...tech, en: formData.en.trim(), ro: formData.ro.trim() }
          : tech
      );
      saveCustomTechniques(updated);
      toast.success('Tehnică actualizată');
    } else {
      // Adăugare nouă
      const newTechnique: Technique = {
        id: `custom-${Date.now()}`,
        en: formData.en.trim(),
        ro: formData.ro.trim()
      };
      saveCustomTechniques([...customTechniques, newTechnique]);
      toast.success('Tehnică adăugată');
    }

    resetForm();
  };

  const handleEdit = (technique: Technique) => {
    setEditingId(technique.id);
    setFormData({
      en: technique.en,
      ro: technique.ro
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Sigur vrei să ștergi această tehnică?')) return;
    
    const updated = customTechniques.filter(tech => tech.id !== id);
    saveCustomTechniques(updated);
    toast.success('Tehnică ștearsă');
  };

  const resetForm = () => {
    setFormData({ en: '', ro: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Gestionează Tehnici</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        <button
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
          className="mb-6 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          <FiPlus /> Adaugă Tehnică Nouă
        </button>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editează Tehnică' : 'Tehnică Nouă'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">🇬🇧 English *</label>
                  <input
                    type="text"
                    value={formData.en}
                    onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Oil on Canvas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">🇷🇴 Română *</label>
                  <input
                    type="text"
                    value={formData.ro}
                    onChange={(e) => setFormData({ ...formData, ro: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Ulei pe Pânză"
                  />
                </div>
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
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-8">
          {/* Tehnici predefinite */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tehnici Predefinite</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {defaultTechniques.map((technique) => (
                <div key={technique.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg mb-2">{technique.en}</h3>
                  <p className="text-gray-600 mb-4">{technique.ro}</p>
                  <div className="text-xs text-gray-500">
                    ID: {technique.id}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tehnici personalizate */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tehnici Personalizate</h2>
            {customTechniques.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                Nu există tehnici personalizate. Adaugă prima tehnică personalizată!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customTechniques.map((technique) => (
                  <div key={technique.id} className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold text-lg mb-2">{technique.en}</h3>
                    <p className="text-gray-600 mb-4">{technique.ro}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(technique)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
                      >
                        <FiEdit /> Editează
                      </button>
                      <button
                        onClick={() => handleDelete(technique.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                      >
                        <FiTrash2 /> Șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}