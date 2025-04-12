#translation_routes.py

from fastapi import APIRouter
from pydantic import BaseModel
import httpx
import traceback

router = APIRouter(tags=["Chat"])

class TranslateRequest(BaseModel):
    text: str
    source: str
    target: str

@router.post("/translate")
async def translate_text(req: TranslateRequest):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://translate-text-565810748414.asia-southeast1.run.app/translate",  # Your Cloud Run URL
                json={  # Send the payload directly (not under 'request')
                    "text": req.text,
                    "source": req.source,
                    "target": req.target
                },
                timeout=10
            )

            if response.status_code != 200:
                return {
                    "error": f"Translation API failed with status {response.status_code}",
                    "detail": response.text
                }

            result = response.json()
            return {"translatedText": result.get("translatedText", "NO_TRANSLATION")}

    except Exception as e:
        return {
            "error": f"Exception occurred: {str(e)}",
            "trace": traceback.format_exc()
        }
