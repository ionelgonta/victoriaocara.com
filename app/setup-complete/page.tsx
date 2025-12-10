'use client';

import { useState } from 'react';
import axios from 'axios';

export default function SetupCompletePage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runCompleteSetup = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🚀 Starting complete setup...');
      
      // Step 1: Create admin user
      addResult('📝 Step 1: Creating admin user...');
      try {
        const adminResponse = await axios.post('/api/create-first-admin');
        if (adminResponse.data.success) {
          addResult('✅ Admin user created successfully');
        } else {
          addResult('ℹ️ Admin user already exists');
        }
      } catch (error: any) {
        if (error.response?.data?.error?.includes('already exists')) {
          addResult('ℹ️ Admin user already exists');
        } else {
          addResult('❌ Failed to create admin: ' + (error.response?.data?.error || error.message));
        }
      }
      
      // Step 2: Test database connection
      addResult('📝 Step 2: Testing database connection...');
      try {
        const dbResponse = await axios.get('/api/debug-paintings');
        if (dbResponse.data.success) {
          addResult(`✅ Database connected. Found ${dbResponse.data.paintingsCount} paintings`);
        } else {
          addResult('❌ Database connection failed');
        }
      } catch (error: any) {
        addResult('❌ Database test failed: ' + (error.response?.data?.error || error.message));
      }
      
      // Step 3: Test admin login
      addResult('📝 Step 3: Testing admin login...');
      try {
        const loginResponse = await axios.post('/api/auth/login', {
          email: 'admin@victoriaocara.com',
          password: 'AdminVictoria2024!'
        });
        if (loginResponse.data.token) {
          addResult('✅ Admin login successful');
          
          // Step 4: Test paintings API with auth
          addResult('📝 Step 4: Testing paintings API with authentication...');
          try {
            const paintingsResponse = await axios.get('/api/paintings', {
              headers: {
                Authorization: `Bearer ${loginResponse.data.token}`
              }
            });
            addResult(`✅ Paintings API working. Found ${paintingsResponse.data.length} paintings`);
          } catch (error: any) {
            addResult('❌ Paintings API failed: ' + (error.response?.data?.error || error.message));
          }
          
        } else {
          addResult('❌ Admin login failed - no token received');
        }
      } catch (error: any) {
        addResult('❌ Admin login failed: ' + (error.response?.data?.error || error.message));
      }
      
      // Step 5: Test upload functionality
      addResult('📝 Step 5: Testing upload functionality...');
      addResult('ℹ️ Upload test requires manual testing in admin panel');
      
      addResult('🎉 Setup complete! Check results above.');
      
    } catch (error) {
      addResult('❌ Setup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testGalleryPages = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🔍 Testing gallery pages...');
      
      // Test gallery API
      const galleryResponse = await axios.get('/api/paintings');
      addResult(`Gallery API: ${galleryResponse.data.length} paintings found`);
      
      // Test featured API
      const featuredResponse = await axios.get('/api/paintings?featured=true');
      addResult(`Featured API: ${featuredResponse.data.length} featured paintings found`);
      
      if (galleryResponse.data.length === 0) {
        addResult('⚠️ No paintings found. You need to add paintings in the admin panel.');
        addResult('👉 Go to: https://victoriaocara-com.vercel.app/admin/paintings');
      } else {
        addResult('✅ Paintings found! They should appear on the gallery page.');
      }
      
    } catch (error: any) {
      addResult('❌ Gallery test failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Setup & Debugging</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={runCompleteSetup}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-lg"
          >
            {loading ? 'Running Setup...' : '🚀 Run Complete Setup'}
          </button>
          
          <button
            onClick={testGalleryPages}
            disabled={loading}
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold text-lg ml-4"
          >
            {loading ? 'Testing...' : '🔍 Test Gallery & Paintings'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Setup Results:</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono max-h-96 overflow-auto">
              {results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4 text-blue-900">Next Steps After Setup:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>
              <strong>Login to Admin:</strong> 
              <a href="/admin" className="text-blue-600 hover:underline ml-2">
                https://victoriaocara-com.vercel.app/admin
              </a>
            </li>
            <li>
              <strong>Add Paintings:</strong> 
              <a href="/admin/paintings" className="text-blue-600 hover:underline ml-2">
                Go to Admin → Paintings → Add New
              </a>
            </li>
            <li>
              <strong>Mark as Featured:</strong> Check "Featured on Homepage" when adding paintings
            </li>
            <li>
              <strong>Check Gallery:</strong> 
              <a href="/galerie" className="text-blue-600 hover:underline ml-2">
                Visit Gallery Page
              </a>
            </li>
            <li>
              <strong>Check Homepage:</strong> 
              <a href="/" className="text-blue-600 hover:underline ml-2">
                Visit Homepage
              </a>
            </li>
          </ol>
        </div>

        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-900">Admin Credentials:</h3>
          <div className="text-sm text-yellow-800">
            <p><strong>Email:</strong> admin@victoriaocara.com</p>
            <p><strong>Password:</strong> AdminVictoria2024!</p>
          </div>
        </div>
      </div>
    </div>
  );
}