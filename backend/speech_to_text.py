from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import os
import uuid
import tempfile
import traceback
from google.cloud import speech
from google.oauth2 import service_account



router = APIRouter(tags=["Speech to Text"])

# Load credentials (ensure this path is correct in your deployment)
credentials = service_account.Credentials.from_service_account_file("speech-to-text-key.json")
speech_client = speech.SpeechClient(credentials=credentials)

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save uploaded file temporarily
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        # Read the file content
        with open(temp_file_path, "rb") as audio_file:
            content = audio_file.read()

        # Setup recognition config (adjust if needed)
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,  # Adjust depending on your recording
            language_code="en-US"
        )
        print(f"[DEBUG] File size: {len(content)} bytes")

        response = speech_client.recognize(config=config, audio=audio)
        print(f"[DEBUG] Transcription results: {response.results}")


        # Cleanup temp file
        os.remove(temp_file_path)

        if not response.results:
            return JSONResponse(status_code=200, content={"text": ""})

        transcript = " ".join([result.alternatives[0].transcript for result in response.results])

        return {"text": transcript}

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={
            "error": str(e),
            "trace": traceback.format_exc()
        })