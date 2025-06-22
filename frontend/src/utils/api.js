
/* -------------------------------------------------- *
 * 🛠️ 通用工具
 * -------------------------------------------------- */

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * 包装 fetch：成功返回解析 JSON；失败执行 fallback()
 */
async function safeFetch(path, options, fallback) {
  try {
    const res = await fetch(`${API}${path}`, options);
    if (!res.ok) throw new Error("Bad status");
    return await res.json();
  } catch (err) {
    console.warn("[generateScenes] backend error，使用 mock ➜", err.message);
    return await fallback();
  }
}





const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* -------------------------------------------------- *
 * 🖼️ 1. 生成场景（文本层）
 *      - 输入：story string
 *      - 输出：数组，每个包含 description / dialogue / mood
 * -------------------------------------------------- */
export async function generateScenes(story) {
  return safeFetch(
    "/api/generate_scenes",                     // ① 后端路径
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story }),
    },
    async () => {
      /* ② fallback（原 mock 代码不变） */
      await delay(1000);
      return [
        {
          scene: 1,
          description: "A girl runs through a field of sunflowers",
          dialogue: "This is where my story begins...",
          mood: "hopeful",
          image: null,
          video: null,
          accepted: false,
        },
        {
          scene: 2,
          description: "The sky turns dark as thunder rolls in",
          dialogue: "But storms don’t scare me anymore.",
          mood: "resilient",
          image: null,
          video: null,
          accepted: false,
        },
        {
          scene: 3,
          description: "Sunlight breaks through the clouds at dawn",
          dialogue: "Every ending is a new beginning.",
          mood: "uplifting",
          image: null,
          video: null,
          accepted: false,
        },
      ];
    }
  );
}

/* -------------------------------------------------- *
 * 🖼️ 2. 生成单张场景图片
 *      - 输入：description string
 *      - 输出：Blob（示例 PNG）
 * -------------------------------------------------- */
export async function generateImage(description) {
  // ▶️ 真实情况：POST /api/gemini -> blob
  await delay(1200);

  const url =
    'https://placehold.co/640x400/png?font=roboto&text=' +
    encodeURIComponent(description);
  const blob = await fetch(url).then((r) => r.blob());
  return blob; // 供 URL.createObjectURL 使用
}

/* -------------------------------------------------- *
 * 🔁 3. 重新生成单个场景
 *      - 输入：旧 scene 对象
 *      - 输出：新的 scene（含新 image URL，accepted=false）
 * -------------------------------------------------- */


export async function regenerateScene(oldScene) {
  // 通常你会把旧 scene.description 发给 Claude / Gemini
  // 这里简单在文本后追加 " (v2)"
  const newDescription = `${oldScene.description} (v2)`;
  const newDialogue = `${oldScene.dialogue} (revised)`;

  // 重新生成图片
  const imgBlob = await generateImage(newDescription);
  const imgURL = URL.createObjectURL(imgBlob);

  return {
    ...oldScene,
    description: newDescription,
    dialogue: newDialogue,
    mood: oldScene.mood, // 简化： mood 不变
    image: imgURL,
    accepted: false,
  };
}

/* -------------------------------------------------- *
 * 🎞️ 4. 生成单个场景视频片段
 *      - 输入：image URL + dialogue string
 *      - 输出：Blob（示例 MP4 片段 ~5 秒）
 * -------------------------------------------------- */
export async function generateSceneClip(imageURL, dialogue) {
  // ▶️ 真实情况：调用 Vapi / FFmpeg / moviepy 等
//   await delay(1500);

//   const placeholder = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';
//   const blob = await fetch(placeholder).then((r) => r.blob());
//   return blob; // 供 URL.createObjectURL 使用
  await delay(500);               // 模拟延迟
  const samples = [
    'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
  ];
  // 随机挑一条
  return samples[Math.floor(Math.random() * samples.length)];
}

/* -------------------------------------------------- *
 * 🎬 5. 合并所有片段为最终视频
 *      - 输入：videoURLs string[]
 *      - 输出：Blob（示例 MP4 10 秒）
 * -------------------------------------------------- */
export async function mergeSceneVideos(videoURLs) {
  // ▶️ 真实情况：后台用 FFmpeg concat
//   console.log('Merging clips (mock):', videoURLs);
//   await delay(2000);

//   const placeholder = 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4';
//   const blob = await fetch(placeholder).then((r) => r.blob());
//   return blob;
  await delay(500); // 模拟处理时间
  return 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4'; // 直接返回 URL 字符串
}
