import os
import uuid
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

from dotenv import load_dotenv


# Load environment variables
load_dotenv()
ELEVENLABS_API_KEY=os.getenv("ELEVENLABS_API_KEY")

elevenlabs = ElevenLabs(
    api_key=ELEVENLABS_API_KEY,
)

def text_to_speech_file(text: str) -> str:
    # Calling the text_to_speech conversion API with detailed parameters
    voice_id_kid = "PzuBz8h2SxBvQ7lnUC44"
    voice_id_operator = "TX3LPaxmHKxFdv7VOQHJ"
    response = elevenlabs.text_to_speech.convert(
        voice_id=voice_id_kid, # Adam pre-made voice
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_multilingual_v2", # use the turbo model for low latency
        # Optional voice settings that allow you to customize the output
        voice_settings=VoiceSettings(
            stability=1.0,
            similarity_boost=1.0,
            style=0.0,
            use_speaker_boost=True,
            speed=1.0,
        ),
    )
    save_file_path = f"{uuid.uuid4()}.mp3"

    with open(save_file_path, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)
                
    print(f"{save_file_path}: A new audio file was saved successfully!")
    # Return the path of the saved audio file
    return save_file_path

test_txt="Wow, this place is amazing! Where should I start?"
text_to_speech_file(test_txt)