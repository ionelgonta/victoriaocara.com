'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminContentPage() {
  const router = useRouter();
  const [content, setContent] = useState({
    heroTitle: 'Artă Originală',
    heroSubtitle: 'Descoperă colecția noastră de tablouri unice, create cu pasiune și dedicare',
    aboutTitle: 'Despre Noi',
    aboutText: 'Fiecare tablou este o lucrare unică, creată manual cu atenție la detalii.',
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchContent();
  }, [router]);

  const fetchContent = async () => {
    try {
      const res = await axios.get('/api/content?key=homepage');
      if (res.data && res.data.content) {
        setContent({ ...content, ...res.data.content });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      await axios.post(
        '/api/content',
        {
          key: 'homepage',
          content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Conținut actualizat');
    } catch (error) {
      toast.error('Eroare la actualizarea conținutului');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Editează Conținut Site</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Secțiunea Hero</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titlu Principal
                  </label>
                  <input
                    type="text"
                    value={content.heroTitle}
                    onChange={(e) =>
                      setContent({ ...content, heroTitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subtitlu
                  </label>
                  <textarea
                    value={content.heroSubtitle}
                    onChange={(e) =>
                      setContent({ ...content, heroSubtitle: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Secțiunea Despre</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titlu Despre
                  </label>
                  <input
                    type="text"
                    value={content.aboutTitle}
                    onChange={(e) =>
                      setContent({ ...content, aboutTitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Text Despre
                  </label>
                  <textarea
                    value={content.aboutText}
                    onChange={(e) =>
                      setContent({ ...content, aboutText: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors"
            >
              Salvează Modificările
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
