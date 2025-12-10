'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function UpdateDescriptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paintings, setPaintings] = useState([]);

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

  const updatedDescriptions = {
    'sunset': {
      en: 'A breathtaking sunset over a tranquil sea, painted with rich impasto technique. The warm golden and orange hues blend seamlessly with deep blues, creating a mesmerizing reflection on the calm waters. This piece captures the serene moment when day transitions to night, evoking feelings of peace and contemplation. The thick application of paint adds texture and depth, making the light seem to dance across the canvas.',
      ro: 'Un apus de soare uluitoare peste o mare liniștită, pictat cu tehnica bogată impasto. Nuanțele calde de aur și portocaliu se îmbină perfect cu albastrul profund, creând o reflecție fascinantă pe apele calme. Această lucrare surprinde momentul senin când ziua trece în noapte, evocând sentimente de pace și contemplare. Aplicarea groasă a vopselei adaugă textură și profunzime, făcând lumina să pară că dansează pe pânză.'
    },
    'mare-galbena': {
      en: 'An abstract interpretation of the sea in golden tones, showcasing the artist\'s signature impasto technique. The painting captures the essence of sunlight dancing on ocean waves, with bold brushstrokes creating movement and energy. The dominant yellow and gold palette evokes warmth and joy, while subtle blue undertones add depth and mystery. This piece represents the eternal dance between light and water.',
      ro: 'O interpretare abstractă a mării în tonuri aurii, prezentând tehnica impasto caracteristică artistei. Pictura surprinde esența luminii solare dansând pe valurile oceanului, cu pensulări îndrăznețe care creează mișcare și energie. Paleta dominantă de galben și aur evocă căldură și bucurie, în timp ce subtonurile subtile de albastru adaugă profunzime și mister. Această lucrare reprezintă dansul etern dintre lumină și apă.'
    },
    'lalele': {
      en: 'Vibrant tulips painted against a rich blue background, demonstrating the artist\'s mastery of color contrast and impasto technique. The flowers seem to emerge from the canvas with their bold red and pink petals, while the deep blue backdrop creates a striking visual impact. Each brushstroke is deliberate and expressive, capturing the delicate beauty and strength of these spring flowers. The painting celebrates the renewal of life and the joy of blooming.',
      ro: 'Lalele vibrante pictate pe un fundal albastru bogat, demonstrând măiestria artistei în contrastul de culori și tehnica impasto. Florile par să iasă din pânză cu petalele lor îndrăznețe roșii și roz, în timp ce fundalul albastru profund creează un impact vizual izbitor. Fiecare pensulare este deliberată și expresivă, surprinzând frumusețea delicată și puterea acestor flori de primăvară. Pictura celebrează reînnoirea vieții și bucuria înfloririi.'
    }
  };

  const updateDescriptions = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    let successCount = 0;
    let errorCount = 0;

    for (const painting of paintings) {
      const newDescription = updatedDescriptions[painting.slug as keyof typeof updatedDescriptions];
      
      if (newDescription) {
        try {
          await axios.put(`/api/paintings/${painting._id}`, {
            ...painting,
            description: newDescription
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          successCount++;
        } catch (error) {
          console.error(`Error updating ${painting.slug}:`, error);
          errorCount++;
        }
      }
    }

    setLoading(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} descrieri actualizate cu succes!`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} erori la actualizare`);
    }

    fetchPaintings();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Actualizează Descrierile Tablourilor</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Descrieri Noi Disponibile</h2>
          
          <div className="space-y-4 mb-6">
            {Object.entries(updatedDescriptions).map(([slug, desc]) => (
              <div key={slug} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 capitalize">{slug.replace('-', ' ')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">🇬🇧 English:</p>
                    <p className="text-sm text-gray-700">{desc.en.substring(0, 150)}...</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">🇷🇴 Română:</p>
                    <p className="text-sm text-gray-700">{desc.ro.substring(0, 150)}...</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={updateDescriptions}
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Se actualizează...' : 'Actualizează Toate Descrierile'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tablouri Curente</h2>
          
          <div className="space-y-4">
            {paintings.map((painting: any) => (
              <div key={painting._id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {painting.title?.en || painting.title} / {painting.title?.ro || painting.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Descriere actuală EN:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {painting.description?.en || painting.description || 'Fără descriere'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Descriere actuală RO:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {painting.description?.ro || painting.description || 'Fără descriere'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}