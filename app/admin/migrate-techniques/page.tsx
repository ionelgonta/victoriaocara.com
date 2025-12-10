'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { migrateTechniqueToNewFormat } from '@/lib/techniques';

export default function MigrateTechniquesPage() {
  const router = useRouter();
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [paintingsToMigrate, setPaintingsToMigrate] = useState([]);

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
      
      // Identifică tablourile care au nevoie de migrare
      const needMigration = res.data.filter((painting: any) => {
        return typeof painting.technique === 'string';
      });
      
      setPaintingsToMigrate(needMigration);
      setLoading(false);
    } catch (error) {
      toast.error('Eroare la încărcarea tablourilor');
      setLoading(false);
    }
  };

  const migratePainting = async (painting: any) => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const migratedTechnique = migrateTechniqueToNewFormat(painting.technique);
      
      const updatedData = {
        ...painting,
        technique: migratedTechnique
      };
      
      await axios.put(`/api/paintings/${painting._id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return true;
    } catch (error) {
      console.error(`Error migrating painting ${painting._id}:`, error);
      return false;
    }
  };

  const migrateAllPaintings = async () => {
    setMigrating(true);
    let successCount = 0;
    let errorCount = 0;

    for (const painting of paintingsToMigrate) {
      const success = await migratePainting(painting);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setMigrating(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} tablouri migrate cu succes!`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} tablouri nu au putut fi migrate`);
    }

    // Reîncarcă lista
    fetchPaintings();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-serif font-bold">Migrare Tehnici Tablouri</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Status Migrare</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{paintings.length}</div>
              <div className="text-sm text-blue-800">Total Tablouri</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{paintingsToMigrate.length}</div>
              <div className="text-sm text-yellow-800">Necesită Migrare</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{paintings.length - paintingsToMigrate.length}</div>
              <div className="text-sm text-green-800">Deja Migrate</div>
            </div>
          </div>

          {paintingsToMigrate.length > 0 ? (
            <div>
              <button
                onClick={migrateAllPaintings}
                disabled={migrating}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {migrating ? 'Se migrează...' : `Migrează ${paintingsToMigrate.length} Tablouri`}
              </button>
              
              <p className="text-sm text-gray-600 mt-2">
                Această operație va actualiza tehnicile vechi la formatul bilingv nou.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Toate tablourile sunt migrate!</h3>
              <p className="text-gray-600">Nu există tablouri care să necesite migrare.</p>
            </div>
          )}
        </div>

        {paintingsToMigrate.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tablouri care Necesită Migrare</h2>
            
            <div className="space-y-4">
              {paintingsToMigrate.map((painting: any) => {
                const migratedTechnique = migrateTechniqueToNewFormat(painting.technique);
                
                return (
                  <div key={painting._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {typeof painting.title === 'object' ? painting.title.en : painting.title}
                        </h3>
                        <div className="mt-2">
                          <div className="text-sm text-gray-600">Tehnică actuală:</div>
                          <div className="text-red-600 font-mono bg-red-50 px-2 py-1 rounded inline-block">
                            "{painting.technique}"
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-sm text-gray-600">Va deveni:</div>
                          <div className="text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                            EN: {migratedTechnique.en} | RO: {migratedTechnique.ro}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}