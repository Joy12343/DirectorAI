// src/pages/api/upload/single.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: true, // ✅ needed for JSON body (not multipart)
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: 'Missing base64 image' });
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'base64_upload',
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
