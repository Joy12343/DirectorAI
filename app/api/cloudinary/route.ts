// app/api/cloudinary/route.ts
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// configure from your env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  const { imageBase64 } = await request.json()
  const uploadResult = await cloudinary.uploader.upload(imageBase64, {
    folder: 'your-folder',
    // any other options…
  })
  return NextResponse.json({ url: uploadResult.secure_url })
}
