# controllers/profile_controller.py

from fastapi import APIRouter, Depends, HTTPException, Body
from firebase_admin import firestore
from services.firebase_auth import get_current_user
import base64
import cloudinary.uploader

router = APIRouter()

db = firestore.client()

@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    uid = user.get("uid")
    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    profile = doc.to_dict()
    return {
        "user_id": uid,
        "email": profile.get("email"),
        "role": profile.get("role"),
        "name": profile.get("name"),
        "profilepic": profile.get("profilepic", ""),
        "message": f"Hello, {profile.get('name', 'User')}"
    }

@router.post("/updateprofile")
def update_profile(data: dict = Body(...), user=Depends(get_current_user)):
    try:
        user_id = user["uid"]
        image_url = data.get("profilepic", "")

        if isinstance(image_url, str) and image_url.startswith("data:image"):
            print("📸 Uploading new profile picture to Cloudinary...")
            base64_str = image_url.split(";base64,")[1]
            decoded_image = base64.b64decode(base64_str)

            result = cloudinary.uploader.upload(decoded_image)
            image_url = result["secure_url"]
            print("✅ Uploaded profile picture to:", image_url)

        update_data = {
            "phone": data.get("phone", ""),
            "workPhone": data.get("workPhone", ""),
            "address": data.get("address", ""),
            "profilepic": image_url,
        }

        db.collection("users").document(user_id).update(update_data)

        return {"message": "Profile updated successfully", "profilepic": image_url}

    except Exception as e:
        print("❌ Error in /updateprofile:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
