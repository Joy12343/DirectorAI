import argparse
import os
from scene_picture import generate_all_scene_images, generate_scene_image, load_story_elements, load_character_images

def main():
    parser = argparse.ArgumentParser(description='Generate scene images from story elements')
    parser.add_argument('--json-file', default='/Users/chengyibo/hackathon/src/app/api/story_elements.json', 
                       help='Path to the story elements JSON file')
    parser.add_argument('--scene', type=int, 
                       help='Generate image for a specific scene number')
    parser.add_argument('--character-images-dir', default='character_images',
                       help='Directory containing character images')
    parser.add_argument('--output-dir', default='scene_images',
                       help='Output directory for generated scene images')
    parser.add_argument('--all', action='store_true',
                       help='Generate images for all scenes')
    
    args = parser.parse_args()
    
    if args.scene:
        # Generate image for a specific scene
        try:
            story_data = load_story_elements(args.json_file)
            if not story_data:
                return
            
            scenes = story_data.get("Scenes", [])
            target_scene = None
            
            for scene in scenes:
                if scene["Scene"] == args.scene:
                    target_scene = scene
                    break
            
            if target_scene:
                print(f"🎬 Generating image for Scene {args.scene}...")
                
                # Load character images
                characters = story_data.get("Characters", [])
                character_images = load_character_images(characters, args.character_images_dir)
                background = story_data.get("Background", "")
                
                image_path = generate_scene_image(target_scene, character_images, background, story_data, args.output_dir)
                if image_path:
                    print(f"✅ Successfully generated image: {image_path}")
                else:
                    print("❌ Failed to generate image")
            else:
                print(f"❌ Scene {args.scene} not found in the story")
                print("Available scenes:")
                for scene in scenes:
                    print(f"- Scene {scene['Scene']}: {scene['Description'][:50]}...")
                    
        except Exception as e:
            print(f"❌ Error: {e}")
    
    elif args.all:
        # Generate images for all scenes
        generate_all_scene_images(args.json_file, args.character_images_dir, args.output_dir)
    
    else:
        # Default behavior: generate all scenes
        print("No specific scene specified. Generating images for all scenes...")
        generate_all_scene_images(args.json_file, args.character_images_dir, args.output_dir)

if __name__ == "__main__":
    main() 