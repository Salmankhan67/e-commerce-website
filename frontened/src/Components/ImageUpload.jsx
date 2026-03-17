import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { API } from '../config';
function ImageUpload({ onImageUploaded, existingImage }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(
    existingImage ? `${API_BASE_URL}${existingImage}` : null
  );
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setError('');
    setUploading(true);

    // Upload to backend
    const formData = new FormData();
    formData.append('image', file);

    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const token = auth?.token;

      const response = await fetch(API.upload, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Pass the image path to parent component
        onImageUploaded(data.imageUrl);
        setError('');
      } else {
        setError(data.message || 'Upload failed');
        setPreview(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to connect to server');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded(null);
  };

  return (
    <div className="space-y-2">
      {!preview ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition cursor-pointer bg-gray-50"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload product image'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 5MB)</p>
        </div>
      ) : (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default ImageUpload;