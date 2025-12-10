'use client';

import { useState } from 'react';
import axios from 'axios';

export default function AdminDebugPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/create-first-admin');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult(JSON.stringify(error.response?.data || error.message, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const checkUsers = async () => {
    setLoading(true);
    try {
      // Încearcă să faci login cu credențialele admin pentru a testa
      const response = await axios.post('/api/auth/login', {
        email: 'admin@victoriaocara.com',
        password: 'AdminVictoria2024!'
      });
      setResult('Login SUCCESS: ' + JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setResult('Login FAILED: ' + JSON.stringify(error.response?.data || error.message, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Debug Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={createAdmin}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Create First Admin'}
          </button>
          
          <button
            onClick={checkUsers}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 ml-4"
          >
            {loading ? 'Loading...' : 'Test Admin Login'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Create First Admin" to create admin user</li>
            <li>Click "Test Admin Login" to verify credentials work</li>
            <li>If successful, go to <a href="/admin" className="text-blue-600 hover:underline">/admin</a> to login</li>
            <li>Use credentials: admin@victoriaocara.com / AdminVictoria2024!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}