# controllers/homework_controller.py

from fastapi import APIRouter, Depends, HTTPException, Body
from firebase_admin import firestore
from services.firebase_auth import get_current_user
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()
db = firestore.client()

class HomeworkRequest(BaseModel):
    classid: str
    name: str
    content: str
    duedate: str  # ISO format or convertable
    subject: str
    teacherid: str

@router.post("/addhomework")
def add_homework(data: HomeworkRequest, user=Depends(get_current_user)):
    try:
        duedate_obj = datetime.fromisoformat(data.duedate.replace("Z", "+00:00"))
        homework_ref = db.collection("homework").document()
        homework_ref.set({
            "name": data.name,
            "content": data.content,
            "duedate": duedate_obj,
            "classid": data.classid,
            "subject": data.subject,
            "status": "open",
            "teacherid": data.teacherid,
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/homework/{classid}")
def get_homework_by_class(classid: str, user=Depends(get_current_user)):
    homework_docs = db.collection("homework").where("classid", "==", classid).stream()
    result = []

    for doc in homework_docs:
        hw = doc.to_dict()
        hw["id"] = doc.id
        result.append(hw)

    return result

@router.patch("/homework/{homework_id}/toggle")
def toggle_homework_status(homework_id: str, user=Depends(get_current_user)):
    doc_ref = db.collection("homework").document(homework_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Homework not found")

    data = doc.to_dict()

    if data.get("teacherid") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    new_status = "closed" if data["status"] == "open" else "open"
    doc_ref.update({"status": new_status})
    return {"status": new_status}
