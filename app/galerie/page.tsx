import { Metadata } from 'next';
import PaintingCard from '@/components/PaintingCard';

export const metadata: Metadata = {
  title: 'Galerie - Victoria Ocara',
  description: 'Explorează întreaga colecție de tablouri originale de Victoria Ocara.',
};

async function getPaintings() {
  try {
    // Construiește URL-ul dinamic pentru a funcționa și pe Vercel
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = 'http://localhost:3000';
      }
    }
    
    console.log('Fetching paintings from:', `${baseUrl}/api/paintings`);
    
    const res = await fetch(`${baseUrl}/api/paintings`, {
      cache: 'no-store',
    });
    
    console.log('Paintings response status:', res.status);
    
    if (!res.ok) {
      console.log('Paintings fetch failed:', res.statusText);
      return [];
    }
    
    const data = await res.json();
    console.log('Paintings count:', data.length);
    
    return data;
  } catch (error) {
    console.error('Error fetching paintings:', error);
    return [];
  }
}

export default async function GaleriePage() {
  const paintings = await getPaintings();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-serif font-bold text-center mb-4">Galerie</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Explorează colecția noastră completă de tablouri originale
      </p>

      {paintings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">
            Nu există tablouri disponibile momentan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paintings.map((painting: any) => (
            <PaintingCard key={painting._id} painting={painting} />
          ))}
        </div>
      )}
    </div>
  );
}
