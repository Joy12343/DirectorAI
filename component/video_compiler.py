"""
Simple video compilation service using moviepy
"""

import os
import tempfile
import requests
from moviepy.editor import VideoFileClip, concatenate_videoclips
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_video(url, filename):
    """Download a video from URL to local file"""
    try:
        logger.info(f"📥 Downloading video: {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"✅ Downloaded: {filename}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to download {url}: {e}")
        return False

def compile_videos(video_urls, output_path="compiled_video.mp4"):
    """
    Download and compile multiple videos into one
    
    :param video_urls: List of video URLs
    :param output_path: Path for the compiled video
    :return: Path to compiled video or None if failed
    """
    if not video_urls:
        logger.error("❌ No video URLs provided")
        return None
    
    if len(video_urls) == 1:
        logger.info("📹 Only one video provided, returning original URL")
        return video_urls[0]
    
    temp_files = []
    video_clips = []
    
    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        logger.info(f"📁 Using temp directory: {temp_dir}")
        
        # Download all videos
        for i, url in enumerate(video_urls):
            temp_file = os.path.join(temp_dir, f"video_{i}.mp4")
            
            if download_video(url, temp_file):
                temp_files.append(temp_file)
            else:
                logger.warning(f"⚠️  Skipping video {i} due to download failure")
        
        if not temp_files:
            logger.error("❌ No videos were downloaded successfully")
            return None
        
        # Load video clips
        logger.info(f"🎬 Loading {len(temp_files)} video clips...")
        for temp_file in temp_files:
            try:
                clip = VideoFileClip(temp_file)
                video_clips.append(clip)
                logger.info(f"✅ Loaded clip: {os.path.basename(temp_file)} ({clip.duration:.1f}s)")
            except Exception as e:
                logger.error(f"❌ Failed to load {temp_file}: {e}")
        
        if not video_clips:
            logger.error("❌ No video clips were loaded successfully")
            return None
        
        # Concatenate videos
        logger.info("🔗 Concatenating videos...")
        final_clip = concatenate_videoclips(video_clips)
        
        # Write final video
        logger.info(f"💾 Writing final video to: {output_path}")
        final_clip.write_videofile(
            output_path,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True
        )
        
        # Clean up
        for clip in video_clips:
            clip.close()
        final_clip.close()
        
        # Remove temporary files
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except:
                pass
        
        try:
            os.rmdir(temp_dir)
        except:
            pass
        
        logger.info(f"✅ Video compilation complete: {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"❌ Video compilation failed: {e}")
        
        # Clean up on error
        for clip in video_clips:
            try:
                clip.close()
            except:
                pass
        
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except:
                pass
        
        return None

if __name__ == "__main__":
    # Test with sample URLs
    test_urls = [
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4"
    ]
    
    result = compile_videos(test_urls, "test_compilation.mp4")
    if result:
        print(f"✅ Compilation successful: {result}")
    else:
        print("❌ Compilation failed")
