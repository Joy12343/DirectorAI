'use client';

import { useState } from 'react';

export default function Base64Uploader() {
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file); // creates data:image/png;base64,...
    });
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const input = e.currentTarget.elements.namedItem('file') as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    const base64 = await convertToBase64(file);
    setPreview(base64);

    const res = await fetch('/api/upload/single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image: base64 }),
    });

    const data = await res.json();
    setImageUrl(data.url);
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <input type="file" name="file" accept="image/*" />
        <button type="submit">Convert & Upload</button>
      </form>

      {preview && (
        <>
          <p>🖼️ Base64 Preview:</p>
          <img src={preview} alt="Base64 Preview" style={{ maxWidth: '300px' }} />
        </>
      )}

      {imageUrl && (
        <>
          <p>✅ Uploaded to Cloudinary:</p>
          <a href={imageUrl} target="_blank">{imageUrl}</a>
          <img src={imageUrl} alt="Cloudinary Upload" style={{ maxWidth: '300px' }} />
        </>
      )}
    </div>
  );
}
