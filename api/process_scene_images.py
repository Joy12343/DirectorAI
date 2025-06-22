"""
Script to resize scene images to 16:9 aspect ratio and upload to Cloudinary.
"""

import os
import json
import cloudinary
import cloudinary.uploader
from PIL import Image
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def resize_to_16_9(image_path, output_dir="resized_scenes"):
    """
    Resize an image to 16:9 aspect ratio while maintaining quality.
    
    :param image_path: Path to the input image
    :param output_dir: Directory to save resized images
    :return: Path to the resized image
    """
    try:
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Open the image
        with Image.open(image_path) as img:
            # Get original dimensions
            original_width, original_height = img.size
            print(f"📏 Original size: {original_width}x{original_height}")
            
            # Calculate target dimensions for 16:9 aspect ratio
            # Common 16:9 resolutions: 1920x1080, 1280x720, 854x480
            target_width = 1920  # Full HD width
            target_height = int(target_width * 9 / 16)  # 1080 for 16:9
            
            # Resize image to 16:9 aspect ratio
            resized_img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Generate output filename
            filename = os.path.basename(image_path)
            output_path = os.path.join(output_dir, filename)
            
            # Save resized image
            resized_img.save(output_path, "PNG", quality=95)
            
            print(f"✅ Resized to: {target_width}x{target_height} (16:9)")
            print(f"💾 Saved to: {output_path}")
            
            return output_path
            
    except Exception as e:
        print(f"❌ Error resizing {image_path}: {e}")
        return None

def upload_to_cloudinary(image_path):
    """
    Upload an image to Cloudinary and return the URL.
    
    :param image_path: Path to the image file
    :return: Cloudinary URL or None if failed
    """
    try:
        if not os.path.exists(image_path):
            print(f"❌ File not found: {image_path}")
            return None
        
        print(f"☁️ Uploading {os.path.basename(image_path)} to Cloudinary...")
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            image_path,
            folder="scene_images",  # Organize in a folder
            public_id=f"scene_{os.path.basename(image_path).split('.')[0]}",  # Custom public ID
            overwrite=True
        )
        
        # Get the secure URL
        cdn_url = upload_result.get('secure_url')
        
        if cdn_url:
            print(f"✅ Upload successful: {cdn_url}")
            return cdn_url
        else:
            print("❌ No URL returned from Cloudinary")
            return None
            
    except Exception as e:
        print(f"❌ Error uploading to Cloudinary: {e}")
        return None

def process_all_scene_images(scene_images_dir="scene_images", 
                           resized_dir="resized_scenes",
                           output_json="scene_urls.json"):
    """
    Process all scene images: resize to 16:9 and upload to Cloudinary.
    
    :param scene_images_dir: Directory containing original scene images
    :param resized_dir: Directory to save resized images
    :param output_json: JSON file to store URLs
    """
    
    # Check if scene images directory exists
    if not os.path.exists(scene_images_dir):
        print(f"❌ Scene images directory not found: {scene_images_dir}")
        return
    
    # Get all PNG files in the scene images directory
    scene_files = [f for f in os.listdir(scene_images_dir) 
                   if f.lower().endswith('.png') and f.startswith('scene_')]
    
    if not scene_files:
        print(f"❌ No scene images found in {scene_images_dir}")
        return
    
    print(f"🎬 Found {len(scene_files)} scene images to process")
    
    # Process each scene image
    processed_scenes = []
    
    for scene_file in sorted(scene_files):
        scene_path = os.path.join(scene_images_dir, scene_file)
        scene_number = scene_file.split('_')[1].split('.')[0]  # Extract scene number
        
        print(f"\n🎬 Processing Scene {scene_number}: {scene_file}")
        print("-" * 50)
        
        # Step 1: Resize to 16:9
        resized_path = resize_to_16_9(scene_path, resized_dir)
        if not resized_path:
            continue
        
        # Step 2: Upload to Cloudinary
        cloudinary_url = upload_to_cloudinary(resized_path)
        if not cloudinary_url:
            continue
        
        # Step 3: Store information
        scene_info = {
            "scene_number": int(scene_number),
            "cloudinary_url": cloudinary_url,
        }
        
        processed_scenes.append(scene_info)
        print(f"✅ Scene {scene_number} processed successfully")
    
    # Save results to JSON file
    if processed_scenes:
        json_data = {
            "metadata": {
                "total_scenes": len(processed_scenes),
                "processed_at": datetime.now().isoformat(),
                "aspect_ratio": "16:9",
                "resolution": "1920x1080",
                "cloudinary_folder": "scene_images"
            },
            "scenes": processed_scenes
        }
        
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n🎉 Successfully processed {len(processed_scenes)} scenes!")
        print(f"📄 Results saved to: {output_json}")
        print(f"📁 Resized images saved to: {resized_dir}/")
        
        # Display summary
        print(f"\n📋 Summary:")
        for scene in processed_scenes:
            print(f"  Scene {scene['scene_number']}: {scene['cloudinary_url']}")
    
    else:
        print("❌ No scenes were successfully processed")

def main():
    """Main function to run the image processing pipeline."""
    # Process all scene images
    process_all_scene_images()

if __name__ == "__main__":
    main()
