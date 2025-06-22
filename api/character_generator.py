import json
import os
import argparse
from character import generate_character_image, generate_all_character_images

def main():
    parser = argparse.ArgumentParser(description='Generate character images from story elements')
    parser.add_argument('--json-file', default='/Users/chengyibo/hackathon/src/app/api/story_elements.json', 
                       help='Path to the story elements JSON file (default: /Users/chengyibo/hackathon/src/app/api/story_elements.json)')
    parser.add_argument('--character', type=str, 
                       help='Generate image for a specific character by name')
    parser.add_argument('--output-dir', default='character_images',
                       help='Output directory for generated images (default: character_images)')
    parser.add_argument('--all', action='store_true',
                       help='Generate images for all characters')
    
    args = parser.parse_args()
    
    if args.character:
        # Generate image for a specific character
        try:
            with open(args.json_file, 'r', encoding='utf-8') as f:
                story_data = json.load(f)
            
            characters = story_data.get("Characters", [])
            target_character = None
            
            for char in characters:
                if char["Name"].lower() == args.character.lower():
                    target_character = char
                    break
            
            if target_character:
                print(f"Generating image for {target_character['Name']}...")
                image_path = generate_character_image(target_character, args.output_dir)
                if image_path:
                    print(f"Successfully generated image: {image_path}")
                else:
                    print("Failed to generate image")
            else:
                print(f"Character '{args.character}' not found in the story")
                print("Available characters:")
                for char in characters:
                    print(f"- {char['Name']}")
                    
        except FileNotFoundError:
            print(f"Error: Could not find {args.json_file}")
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON in {args.json_file}")
        except Exception as e:
            print(f"Error: {e}")
    
    elif args.all:
        # Generate images for all characters
        generate_all_character_images(args.json_file)
    
    else:
        # Default behavior: generate all characters
        print("No specific character specified. Generating images for all characters...")
        generate_all_character_images(args.json_file)

if __name__ == "__main__":
    main()
