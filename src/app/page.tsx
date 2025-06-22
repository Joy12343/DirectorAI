import Base64Uploader from '@/components/uploadTester';

export default function UploadTesterPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>🧪 Upload Test: Base64 to Cloudinary</h1>
      <Base64Uploader />
    </main>
  );
}
