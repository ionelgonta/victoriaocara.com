'use client';

import { useState } from 'react';
import axios from 'axios';

export default function DebugGalleryPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testPaintingsAPI = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/debug-paintings');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult(JSON.stringify(error.response?.data || error.message, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testGalleryAPI = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/paintings');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult(JSON.stringify(error.response?.data || error.message, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const testFeaturedAPI = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/paintings?featured=true');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult(JSON.stringify(error.response?.data || error.message, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Gallery Debug Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testPaintingsAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 mr-4"
          >
            {loading ? 'Loading...' : 'Test Debug Paintings API'}
          </button>
          
          <button
            onClick={testGalleryAPI}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 mr-4"
          >
            {loading ? 'Loading...' : 'Test Gallery API'}
          </button>

          <button
            onClick={testFeaturedAPI}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Test Featured API'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Test Debug Paintings API" to see database connection and paintings count</li>
            <li>Click "Test Gallery API" to test the main paintings endpoint</li>
            <li>Click "Test Featured API" to test featured paintings for homepage</li>
            <li>Check the results to see if paintings are being saved and retrieved correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}