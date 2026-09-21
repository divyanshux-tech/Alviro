import io
import edge_tts

class TTSService:
    def __init__(self):
        # We use a natural Indian English female voice for "Sofia"
        self.voice = "en-IN-NeerjaNeural"

    async def generate_audio_stream(self, text: str) -> io.BytesIO:
        """Generates MP3 audio from text using edge-tts and returns it as a BytesIO stream."""
        communicate = edge_tts.Communicate(text, self.voice, rate="+5%")
        
        audio_stream = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_stream.write(chunk["data"])
        
        audio_stream.seek(0)
        return audio_stream

tts_service = TTSService()
