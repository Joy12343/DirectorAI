// src/components/InputForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateScenes } from '../utils/api';

export default function InputForm() {
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!story.trim()) return;
    setLoading(true);

    try {
      const scenes = await generateScenes(story);
      localStorage.setItem('scenes', JSON.stringify(scenes)); // 临时存储
      navigate('/preview');
    } catch (err) {
      console.error('Failed to generate scenes:', err);
      alert('Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Dream2Movie</h1>
      <textarea
        rows={6}
        className="w-full border rounded p-2 mb-4"
        placeholder="Write or paste your story here..."
        value={story}
        onChange={(e) => setStory(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Video'}
      </button>
    </div>
  );
}
