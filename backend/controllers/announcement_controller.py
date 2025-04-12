# controllers/announcement_controller.py

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from services.firebase_auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()
db = firestore.client()

class AnnouncementRequest(BaseModel):
    classid: str
    classname: str
    name: str
    content: str
    teachername: str
    teacheruserid: str

@router.post("/addannouncement")
def add_announcement(data: AnnouncementRequest, user=Depends(get_current_user)):
    doc_ref = db.collection("announcements").document()
    doc_ref.set({
        "classid": data.classid,
        "classname": data.classname,
        "name": data.name,
        "content": data.content,
        "teachername": data.teachername,
        "teacheruserid": data.teacheruserid,
        "status": "open",
        "created": firestore.SERVER_TIMESTAMP,
    })
    return {"success": True, "id": doc_ref.id}

@router.get("/announcements/{classid}")
def get_announcements_for_class(classid: str, user=Depends(get_current_user)):
    announcements = (
        db.collection("announcements")
        .where("classid", "==", classid)
        .stream()
    )

    result = []
    for doc in announcements:
        data = doc.to_dict()
        data["id"] = doc.id
        result.append(data)

    return result

@router.patch("/announcements/{announcement_id}/toggle")
def toggle_announcement_status(announcement_id: str, user=Depends(get_current_user)):
    doc_ref = db.collection("announcements").document(announcement_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Announcement not found")

    data = doc.to_dict()

    if data.get("teacheruserid") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    new_status = "closed" if data["status"] == "open" else "open"
    doc_ref.update({"status": new_status})
    return {"status": new_status}
