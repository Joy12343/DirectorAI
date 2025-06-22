import requests
from dotenv import load_dotenv
import os


# Load environment variables
load_dotenv()
STABILITY_API_KEY=os.getenv("STABILITY")

response = requests.post(
    f"https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio",
    headers={
        "authorization": f"Bearer {STABILITY_API_KEY}",
        "accept": "audio/*"
    },
    files={"none": ''},
    data={
        "prompt": " The sound of waves hitting the beach at the seaside",
        "output_format": "mp3",
        "duration": 20,
        "steps": 30,
    },
)


if response.status_code == 200:
    with open("./output.mp3", 'wb') as file:
        file.write(response.content)
else:
    raise Exception(str(response.json()))