'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (url: string, alt: string) => void;
  existingUrl?: string;
  existingAlt?: string;
}

export default function ImageUpload({ onImageUploaded, existingUrl, existingAlt }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingUrl || '');
  const [alt, setAlt] = useState(existingAlt || '');
  const [useUrl, setUseUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(existingUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifică tipul fișierului
    if (!file.type.startsWith('image/')) {
      toast.error('Te rog selectează doar imagini');
      return;
    }

    // Verifică mărimea (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imaginea trebuie să fie mai mică de 5MB');
      return;
    }

    // Creează preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload fișierul
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('adminToken');
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const uploadedUrl = response.data.url;
      setPreview(uploadedUrl);
      onImageUploaded(uploadedUrl, alt || file.name);
      toast.success('Imagine încărcată cu succes!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Eroare la încărcarea imaginii');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Te rog introdu un URL valid');
      return;
    }
    
    setPreview(urlInput);
    onImageUploaded(urlInput, alt);
    toast.success('Imagine adăugată din URL!');
  };

  const clearImage = () => {
    setPreview('');
    setAlt('');
    setUrlInput('');
    onImageUploaded('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
      {/* Toggle între Upload și URL */}
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setUseUrl(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            !useUrl 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FiUpload className="inline mr-2" />
          Upload din Computer
        </button>
        <button
          type="button"
          onClick={() => setUseUrl(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            useUrl 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FiImage className="inline mr-2" />
          URL Imagine
        </button>
      </div>

      {!useUrl ? (
        /* Upload din computer */
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`block w-full p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading 
                ? 'border-gray-400 bg-gray-50' 
                : 'border-gray-300 hover:border-accent hover:bg-gray-50'
            }`}
          >
            {uploading ? (
              <div>
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600">Se încarcă imaginea...</p>
              </div>
            ) : (
              <div>
                <FiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  Click pentru a selecta o imagine
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, GIF până la 5MB
                </p>
              </div>
            )}
          </label>
        </div>
      ) : (
        /* Input URL */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL Imagine</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
              >
                Adaugă
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview imagine */}
      {preview && (
        <div className="mt-4">
          <div className="relative">
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => {
                  toast.error('Eroare la încărcarea imaginii');
                  setPreview('');
                }}
              />
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Text alternativ */}
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Descriere imagine</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => {
                setAlt(e.target.value);
                onImageUploaded(preview, e.target.value);
              }}
              placeholder="Descriere pentru accesibilitate"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
}