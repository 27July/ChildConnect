# controllers/chat_controller.py

from fastapi import APIRouter, Depends, HTTPException, Body
from firebase_admin import firestore
from services.firebase_auth import get_current_user
import cloudinary.uploader
import base64
from datetime import datetime

router = APIRouter()
db = firestore.client()

@router.get("/findchats")
async def find_chats(user_data=Depends(get_current_user)):
    user_id = user_data["uid"]
    chats_ref = db.collection("chat")

    query1 = chats_ref.where("userID1", "==", user_id).stream()
    query2 = chats_ref.where("userID2", "==", user_id).stream()

    chats = []
    for doc in list(query1) + list(query2):
        chat_data = doc.to_dict()
        chat_data["id"] = doc.id

        other_user_id = (
            chat_data["userID2"] if chat_data["userID1"] == user_id else chat_data["userID1"]
        )

        other_user_doc = db.collection("users").document(other_user_id).get()
        if other_user_doc.exists:
            other_data = other_user_doc.to_dict()
            chat_data["otherUserName"] = other_data.get("name", "Unknown User")
            chat_data["otherUserPic"] = other_data.get("profilepic", "")
        else:
            chat_data["otherUserName"] = "Unknown User"
            chat_data["otherUserPic"] = ""

        messages_ref = db.collection("chat").document(doc.id).collection("messages")
        unread = messages_ref.where("receiver", "==", user_id).where("isRead", "==", False).limit(1).stream()
        has_unread = any(True for _ in unread)
        chat_data["isRead"] = not has_unread

        chats.append(chat_data)

    return chats

@router.get("/findspecificchat/{chat_id}")
async def find_specific_chat(chat_id: str, user=Depends(get_current_user)):
    messages_ref = db.collection("chat").document(chat_id).collection("messages")
    messages = messages_ref.order_by("timestamp").stream()
    return [dict(m.to_dict()) for m in messages]

@router.post("/sendmessage")
def send_message(data: dict = Body(...), user=Depends(get_current_user)):
    try:
        user_id = user["uid"]
        chat_id = data["chatId"]
        message = data.get("message", "")
        image = data.get("image", "")

        receiver = None
        chat_ref = db.collection("chat").document(chat_id)
        chat_doc = chat_ref.get()
        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            receiver = chat_data["userID2"] if chat_data["userID1"] == user_id else chat_data["userID1"]
        else:
            raise HTTPException(status_code=404, detail="Chat not found")

        image_url = ""
        if isinstance(image, str) and image.startswith("data:image"):
            base64_str = image.split(";base64,")[1]
            decoded_image = base64.b64decode(base64_str)
            result = cloudinary.uploader.upload(decoded_image)
            image_url = result["secure_url"]

        message_data = {
            "sender": user_id,
            "receiver": receiver,
            "message": message,
            "image": image_url,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "isRead": False,
        }
        messages_ref = chat_ref.collection("messages")
        messages_ref.add(message_data)

        chat_ref.update({
            "lastMessage": message,
            "lastUpdated": firestore.SERVER_TIMESTAMP,
            "lastSender": user_id
        })

        return {"message": "Message sent successfully"}

    except Exception as e:
        print("❌ Error sending message:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/markread/{chat_id}")
def mark_chat_as_read(chat_id: str, user=Depends(get_current_user)):
    try:
        user_id = user["uid"]
        messages_ref = db.collection("chat").document(chat_id).collection("messages")
        unread_messages = messages_ref.where("receiver", "==", user_id).where("isRead", "==", False).stream()

        batch = db.batch()
        for msg in unread_messages:
            msg_ref = msg.reference
            batch.update(msg_ref, {"isRead": True})
        batch.commit()

        return {"message": "Marked as read"}
    except Exception as e:
        print("❌ Error marking as read:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/{chat_id}/otheruser")
def get_other_user_profile(chat_id: str, user=Depends(get_current_user)):
    user_id = user["uid"]
    chat_doc = db.collection("chat").document(chat_id).get()
    if not chat_doc.exists:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = chat_doc.to_dict()
    other_user_id = chat["userID2"] if chat["userID1"] == user_id else chat["userID1"]
    other_user_doc = db.collection("users").document(other_user_id).get()
    if other_user_doc.exists:
        return other_user_doc.to_dict()
    else:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/startchatwith/{other_user_id}")
async def start_chat_with(other_user_id: str, user=Depends(get_current_user)):
    current_user_id = user["uid"]

    if current_user_id == other_user_id:
        raise HTTPException(status_code=400, detail="Cannot start chat with yourself.")

    chats_ref = db.collection("chat")

    existing_query1 = chats_ref.where("userID1", "==", current_user_id).where("userID2", "==", other_user_id).stream()
    existing_query2 = chats_ref.where("userID1", "==", other_user_id).where("userID2", "==", current_user_id).stream()

    for doc in list(existing_query1) + list(existing_query2):
        return {"id": doc.id}

    new_chat_ref = chats_ref.document()
    new_chat_ref.set({
        "userID1": current_user_id,
        "userID2": other_user_id,
        "lastMessage": "",
        "lastUpdated": datetime.now(),
    })

    return {"id": new_chat_ref.id}
