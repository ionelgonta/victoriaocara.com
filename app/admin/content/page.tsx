'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminContentPage() {
  const router = useRouter();
  const [content, setContent] = useState({
    heroTitle: {
      en: 'Original Art',
      ro: 'Artă Originală'
    },
    heroSubtitle: {
      en: 'Discover unique oil paintings inspired by nature and emotion',
      ro: 'Descoperă tablouri unice în ulei inspirate de natură și emoție'
    },
    aboutTitle: {
      en: 'About Us',
      ro: 'Despre Noi'
    },
    aboutText: {
      en: 'Each painting is a unique work, created by hand with attention to detail.',
      ro: 'Fiecare tablou este o lucrare unică, creată manual cu atenție la detalii.'
    },
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
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Titlu Principal
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇬🇧 English</label>
                      <input
                        type="text"
                        value={content.heroTitle.en}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            heroTitle: { ...content.heroTitle, en: e.target.value }
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Original Art"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇷🇴 Română</label>
                      <input
                        type="text"
                        value={content.heroTitle.ro}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            heroTitle: { ...content.heroTitle, ro: e.target.value }
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Artă Originală"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Subtitlu
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇬🇧 English</label>
                      <textarea
                        value={content.heroSubtitle.en}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            heroSubtitle: { ...content.heroSubtitle, en: e.target.value }
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Discover unique oil paintings..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇷🇴 Română</label>
                      <textarea
                        value={content.heroSubtitle.ro}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            heroSubtitle: { ...content.heroSubtitle, ro: e.target.value }
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Descoperă tablouri unice..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Secțiunea Despre</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Titlu Despre
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇬🇧 English</label>
                      <input
                        type="text"
                        value={content.aboutTitle.en}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            aboutTitle: { ...content.aboutTitle, en: e.target.value }
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="About Us"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇷🇴 Română</label>
                      <input
                        type="text"
                        value={content.aboutTitle.ro}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            aboutTitle: { ...content.aboutTitle, ro: e.target.value }
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Despre Noi"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    Text Despre
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇬🇧 English</label>
                      <textarea
                        value={content.aboutText.en}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            aboutText: { ...content.aboutText, en: e.target.value }
                          })
                        }
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Each painting is a unique work..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">🇷🇴 Română</label>
                      <textarea
                        value={content.aboutText.ro}
                        onChange={(e) =>
                          setContent({ 
                            ...content, 
                            aboutText: { ...content.aboutText, ro: e.target.value }
                          })
                        }
                        rows={4}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Fiecare tablou este o lucrare unică..."
                      />
                    </div>
                  </div>
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
