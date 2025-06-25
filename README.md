## Inspiration
As AI-generated content floods social media, we were struck by how often these videos fail to tell a coherent story: Scenes jump erratically, Characters teleport, and plots unravel after just a quick seconds. At the same time, as avid fans of movies and TV shows, we often ask “what if?” - picturing scenes that have never been filmed. In this project, we aim to build an AI that could direct a “micro-film” with the narrative flow and emotional continuity of a human storyteller, and turn every “What if?” into a vivid reality. Not only were we intrigued by the creative potential, but we also left room for the users to unleash their creativity by freely adding, removing, and modifying every scene in the film.

## How We Built It: Core Ideas
That’s why we built DirectorAI, an AI pipeline that transforms a single text prompt into a short film, complete with character, plot, environment, and sound. The system is structured as four major components:

1. Script Builder: Expands a prompt into a concrete, multi-scene screenplay with environment details, character profiles, and dialogue. We designed this module to mimic how human writers sketch out a story.
2. Character & Scene Renderer: Generates reference portraits for each character for consistency and a key visual frame for every scene, resized to the appropriate size for the next step
3. Video Composer: Generates a video of each scene based on the key visual frame
4. Audio & Integration Engine: Extracts dialogue or sound cues from the script, generates matching voice or sound effects, and merges them with visuals for the final output.
If the results are non-satisfactory, we provide options for users to

Regenerate a scene by changing the scene description or key figure
1. Insert an interpolated transition frame, crafted to follow the preceding scene naturally to smooth out awkward transitions.
2. Users can iterate on either option until satisfied.

## Challenges We Faced
The biggest challenge was temporal coherence—ensuring that character positions, camera angles, and scene flow felt natural across shots. For example, humans could intuitively understand that Michael walked from a roller-coaster to a carousel, but AI skips the journey entirely, and Michael will somehow disappear from the roller-coaster and teleport to a carousel. We tackled this by:

1. Introducing cinematic shot types (wide, medium, close) into the script
2. Designing detailed prompt engineering that guides the continuity of scene generation
3. Allowing user-inserted interpolation frames for manual refinement

Also, integrating all the parts - scripts, images, video, sounds, i.e., multiple APIs - into one frontend/backend system proved unexpectedly complex. Debugging handoffs between modules became a technical challenge.

## Conclusion & Takeaways
What began as a simple idea—a better way to generate AI videos—evolved into a platform that captures the essence of cinematic storytelling through AI. We learned that directing with AI isn't just about generating pretty images. It's about rhythm, structure, and the invisible threads that tie one scene to the next. There’s still a long way to go before AI can match a human director’s intuition, but this project showed us how much potential lies ahead. With each iteration, the line between human storytelling and AI assistance gets thinner. We hope Director AI can be a small step toward democratizing the art of filmmaking. Thanks for all the suggestions and feedback!

