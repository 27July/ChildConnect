from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from google.cloud import texttospeech
from google.oauth2 import service_account
import os

router = APIRouter(tags=["Text to Speech"])

# Load service account credentials
credentials = service_account.Credentials.from_service_account_file("speech-to-text-key.json")
tts_client = texttospeech.TextToSpeechClient(credentials=credentials)

# Fixed reusable temp file
TEMP_AUDIO_DIR = "static/audio"
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)
FIXED_FILENAME = "tts_output.mp3"
FIXED_FILE_PATH = os.path.join(TEMP_AUDIO_DIR, FIXED_FILENAME)

@router.post("/speak")
async def speak_text(request: Request):
    try:
        body = await request.json()
        text = body.get("text")
        language_code = body.get("language_code", "en-US")

        if not text:
            raise HTTPException(status_code=400, detail="Text is required")

        input_text = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = tts_client.synthesize_speech(
            input=input_text, voice=voice, audio_config=audio_config
        )

        # Overwrite the fixed output file
        with open(FIXED_FILE_PATH, "wb") as out:
            out.write(response.audio_content)

        base_url = str(request.base_url).rstrip("/")
        audio_url = f"{base_url}/static/audio/{FIXED_FILENAME}"
        return {"audio_url": audio_url}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
