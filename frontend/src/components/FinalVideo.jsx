// src/components/FinalVideo.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FinalVideo() {
  const [videoURL, setVideoURL] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedURL = localStorage.getItem('finalVideo');
    if (storedURL) {
      setVideoURL(storedURL);
    } else {
      alert('未找到最终视频，请重新生成');
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 text-center">
      <h1 className="text-3xl font-bold mb-6">🎬 最终视频</h1>

      {videoURL ? (
        <video
          controls
          src={videoURL}
          className="w-full rounded shadow mb-6"
          preload="metadata"
        />
      ) : (
        <p className="text-gray-500">正在加载视频...</p>
      )}

      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        回到首页
      </button>
    </div>
  );
}
