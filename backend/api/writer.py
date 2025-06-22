import sys
import os
import json
import anthropic
from dotenv import load_dotenv

class SceneGenerator:
    def __init__(
        self,
        api_key,
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        temperature=0.5
    ):
        """
        Initializes the SceneGenerator.

        :param api_key: Your Anthropic API key.
        :param model: The Claude model to use.
        :param max_tokens: Maximum number of tokens to generate.
        :param temperature: Sampling temperature (0 to 1).
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.system_prompt = (
            "You are a screenwriter. The user is going to input a short text description. "
            "Break the user's story into a concise list of cinematic scenes, and provide background and character information. "
            "Return ONLY valid JSON, no markdown, no commentary.\n\n"
            "The JSON structure MUST have:\n"
            "- Background: A detailed description of the general setting, real life or fantasy, time period, atmosphere, and world where the story takes place\n"
            "- Characters: An array of character objects, each with:\n"
            "  * Name: Character's name\n"
            "  * Description: Physical appearance, age, clothing style, distinguishing features\n"
            "  * Personality: Brief personality traits and mannerisms\n"
            "  * Role: Their role in the story (protagonist, antagonist, supporting, etc.)\n"
            "- Scenes: An array of scene objects, each with:\n"
            "  * Scene: an index describing the order\n"
            "  * Description: around 20 to 30 words describing visuals, including camera shots, lighting, style, and mood\n"
            "  * Dialogue: Possible dialogue between characters as required\n\n"
            "Be very descriptive. Include camera shots (wide shot, close-up), lighting (dramatic lighting, golden hour), "
            "style (film noir, anime), and mood (ominous, serene). Determine the appropriate number of characters based on the story and keep each scenes under 5 seconds."
        )

    def generate_story_elements(self, story_text):
        """
        Calls the Claude model and parses its JSON output into Python objects.

        :param story_text: The input story text.
        :return: A dictionary containing background, characters, and scenes.
        """
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=self.system_prompt,
                messages=[{"role": "user", "content": story_text}]
            )

            print(f"Response type: {type(response)}")
            print(f"Response content: {response.content}")
            
            raw_text = "".join(
                block.text for block in response.content
                if getattr(block, "type", None) == "text"
            ).strip()
            
            print(f"Raw text: '{raw_text}'")
            print(f"Raw text length: {len(raw_text)}")
            
            if not raw_text:
                print("Error: No text content received from API")
                return {}
            
            # Strip markdown code block formatting if present
            if raw_text.startswith('```json'):
                raw_text = raw_text[7:]  # Remove '```json'
            if raw_text.startswith('```'):
                raw_text = raw_text[3:]  # Remove '```'
            if raw_text.endswith('```'):
                raw_text = raw_text[:-3]  # Remove trailing '```'
            
            raw_text = raw_text.strip()
            print(f"Cleaned text: '{raw_text}'")
                
            story_elements = json.loads(raw_text)
            return story_elements
        except Exception as e:
            print(f"Error in generate_story_elements: {e}")
            print(f"Error type: {type(e)}")
            return {}

    def save_to_file(self, story_elements, filename="story_elements.json"):
        """
        Saves the story elements (background, characters, scenes) to a JSON file in the current directory.

        :param story_elements: Dictionary containing background, characters, and scenes.
        :param filename: Output filename (default: story_elements.json).
        """
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(story_elements, f, indent=2, ensure_ascii=False)
        print(f"Saved story elements to {os.path.abspath(filename)}")

if __name__ == "__main__":
    # Retrieve the API key from an environment variable
    load_dotenv()
    api_key = os.getenv("ANTHROPIC_API_KEY")
    story_text = sys.stdin.read().strip()

    generator = SceneGenerator(api_key=api_key)
    story_elements = generator.generate_story_elements(story_text)
    generator.save_to_file(story_elements)
