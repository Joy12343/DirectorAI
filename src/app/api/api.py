'''
terminal preparation:
pip install anthropic
'''

'''
All API keys we have 
Anthropic: Anthropic API key: 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
'''

import sys,json
import anthropic
client = anthropic.Anthropic(api_key='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')

story_text = sys.stdin.read().strip()

response = client.messages.create(
    model = 'claude-sonnet-4-20250514',
    max_tokens = 1024,
    temperature = 0.5, #amount of randomness injected, range from 0 to 1
    system = '''You are a screenwriter. The user is going to input a short text description. 
                Break the user's story into a concise list of sinematic scenes. 
                return ONLY valid JSON, no markdown, no commentary.
                
                Each list element MUST have" 
                - "Scene": an index describing the order
                - "Description": a around 20 words sentence describing visuals. I
                Important: Be very descriptive. Don't just say "a man in an alley." Include camera shots (wide shot, close-up), lighting (dramatic lighting, golden hour), style (film noir, anime), and mood (ominous, serene).
                - "Dialogue": Possible dialogue that could happen between the characters as required by the user
                
                Example format: 
                [
                    {
                        "Scene": 2
                        "Description": "close-up, anime style: A girl happily runs through a field of blooming flowers"
                        "Dialogue": The girl yells out to the sky: "I'm finally done with my finals"
                    }
                ]
                ''',
    messages = [{"role": "user", "content": story_text}]
)
raw_text = "".join(
    block.text for block in response.content       # pull the text field
    if getattr(block, "type", None) == "text"      # skip non-text blocks
).strip()                                          # now .strip() is safe

scenes = json.loads(raw_text)
print(json.dumps(scenes, indent=2))