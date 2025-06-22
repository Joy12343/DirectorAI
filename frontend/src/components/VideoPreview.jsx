// src/components/VideoPreview.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SceneCard from './SceneCard';
import {
  generateImage,
  generateSceneClip,
  regenerateScene,
  mergeSceneVideos,
} from '../utils/api';
import { Button } from "@/components/ui/button";

export default function VideoPreview() {
  const [scenes, setScenes] = useState([]);
  const [busyIdx, setBusyIdx] = useState(null);      // 当前正处理的 index
  const [merging, setMerging] = useState(false);     // 是否正在合成最终视频
  const navigate = useNavigate();

  /* --- 1️⃣ 初始加载：localStorage → scenes --- */
  useEffect(() => {
    const stored = localStorage.getItem('scenes');
    if (!stored) return;
    const parsed = JSON.parse(stored);

    // 给每个 scene 注入默认字段
    const baseScenes = parsed.map((s) => ({
      ...s,
      image: null,
      video: null,
      accepted: false,
    }));
    setScenes(baseScenes);
  }, []);

  /* --- 2️⃣ 对每个 scene 先异步拉图 --- */
  useEffect(() => {
    scenes.forEach(async (scene, idx) => {
      if (scene.image || scene.video) return; // 已有资源跳过
      const blob = await generateImage(scene.description);
      const url = URL.createObjectURL(blob);
      updateScene(idx, { image: url });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes]);

  /* --- ✨ 通用更新 helper --- */
  function updateScene(index, updates) {
    setScenes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }

  /* --- 3️⃣ 用户点击“满意” --- */
  async function handleAccept(index) {
    const sc = scenes[index];
    if (sc.accepted || sc.video) return;

    setBusyIdx(index);

    try {
      const clipURL = await generateSceneClip(sc.image, sc.dialogue);
      updateScene(index, {
        accepted: true,
        video: clipURL,
        image: null,  // 用视频替掉图片
      });
    } catch (err) {
      console.error('generateSceneClip failed:', err);
      alert('生成视频片段出错，请重试');
    } finally {
      setBusyIdx(null);              // **保证一定重置 busyIdx**
    }

    // // 生成视频片段：image + dialogue
    // const clipBlob = await generateSceneClip(sc.image, sc.dialogue);
    // const clipURL = URL.createObjectURL(clipBlob);

    // updateScene(index, {
    //   accepted: true,
    //   video: clipURL,
    //   image: null, // 把图片替换为视频，便于 SceneCard 统一渲染
    // });
    // setBusyIdx(null);
  }

  /* --- 4️⃣ 用户点击“不满意” --- */
  async function handleRegenerate(index) {
    setBusyIdx(index);

    const old = scenes[index];
    const newScene = await regenerateScene(old); // 返回新的描述、对话、image
    updateScene(index, { ...newScene, video: null, accepted: false });

    setBusyIdx(null);
  }

  /* --- 5️⃣ 所有 scene 是否都确认？ --- */
  const allDone = scenes.length > 0 && scenes.every((s) => s.accepted);

  /* --- 6️⃣ 生成最终视频（拼接） --- */
  async function handleMerge() {
    // setMerging(true);
    // const clips = scenes.map((s) => s.video); // 顺序保证
    // const mergedBlob = await mergeSceneVideos(clips);
    // const finalURL = URL.createObjectURL(mergedBlob);

    // // 👉 方案 A：跳转到新页面展示
    // localStorage.setItem('finalVideo', finalURL);
    // navigate('/final'); // 需要你预先在路由里配置 /final

    // /* 若想直接当前页展示，可改成：
    //    setMerging(false);
    //    window.open(finalURL);
    // */

    //模拟
    setMerging(true);
    const clips = scenes.map((s) => s.video); // 顺序保证

    // ❌ 不再 fetch+blob → ✅ 直接拿到 URL 字符串
    const finalURL = await mergeSceneVideos(clips);

    localStorage.setItem('finalVideo', finalURL); // 直接保存远程地址
    navigate('/final');
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">🎞️ Story Preview</h1>

      {scenes.length === 0 && (
        <p className="text-muted-foreground text-center">
          No scenes found. Please go back and generate a story.
        </p>
      )}

      {scenes.map((scene, idx) => (
        <SceneCard
          key={idx}
          index={idx}
          scene={scene}
          onAccept={handleAccept}
          onRegenerate={handleRegenerate}
          disabled={busyIdx === idx}
        />
      ))}

      {busyIdx !== null && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Processing scene {busyIdx + 1}...
        </p>
      )}

      {allDone && (
        <div className="text-center mt-10">
          <Button
            variant="default"
            className="px-6 py-3 text-lg"
            onClick={handleMerge}
            disabled={merging}
          >
            {merging ? 'Merging...' : '🎬 生成最终视频'}
          </Button>
        </div>
      )}
    </div>
  );
}


