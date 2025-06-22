import { Button } from "@/components/ui/button";

export default function SceneCard({
  scene,
  index,
  onAccept,
  onRegenerate,
  disabled = false,   // 可选：父组件传入控制按钮 disabled
}) {
  const hasVideo = !!scene.video;
  const hasImage = !!scene.image && !hasVideo;

  return (
    <div className="border rounded-lg p-4 mb-4 shadow">
      <h2 className="font-bold mb-2">Scene {index + 1}</h2>

      {/* --- 媒体区域：优先渲染 video，其次 image，最后占位 --- */}
      {hasVideo ? (
        <video
          src={scene.video}
          controls
          className="w-full rounded mb-2"
          preload="metadata"
        />
      ) : hasImage ? (
        <img
          src={scene.image}
          alt={`Scene ${index + 1}`}
          className="w-full rounded mb-2"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
          Loading...
        </div>
      )}

      <p className="italic mb-4">"{scene.dialogue}"</p>

      {/* --- 按钮区 --- */}
      {!scene.accepted ? (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(index)}
            disabled={disabled}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
            variant="default"
          >
            满意
          </button>
          <button
            onClick={() => onRegenerate(index)}
            disabled={disabled}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
            variant="destructive"
          >
            不满意
          </button>
        </div>
      ) : (
        <p className="text-green-600 font-semibold">✅ 已确认</p>
      )}
    </div>
  );
}
