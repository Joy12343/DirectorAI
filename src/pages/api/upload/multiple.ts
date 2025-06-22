import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const entries = body.getAll('files'); // this returns FormDataEntryValue[]

  const uploads = await Promise.all(
    entries.map(async (entry) => {
      if (!(entry instanceof File)) {
        throw new Error('Invalid file type');
      }

      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'bulk_upload' },
          (err, result) => {
            if (err || !result) return reject(err);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(buffer);
      });
    })
  );

  return NextResponse.json({ urls: uploads });
}
