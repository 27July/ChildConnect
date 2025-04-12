# controllers/attendance_controller.py

from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Form
from firebase_admin import firestore
from services.firebase_auth import get_current_user
from datetime import datetime
import cloudinary.uploader

router = APIRouter()
db = firestore.client()

@router.get("/attendance-records/{child_id}")
def get_attendance_by_child(child_id: str, user=Depends(get_current_user)):
    attendance_ref = db.collection("attendance").stream()
    result = {}

    for doc in attendance_ref:
        doc_id = doc.id
        data = doc.to_dict()
        result[doc_id] = child_id in data.get("children", [])

    return result

@router.get("/attendance/{date}")
def get_attendance_by_date(date: str, childid: str = None, user=Depends(get_current_user)):
    doc = db.collection("attendance").document(date).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="No attendance record for that date")

    data = doc.to_dict()
    children = data.get("children", [])
    images = data.get("childrenimage", [])

    if childid:
        present = childid in children
        image = "null"
        if present:
            index = children.index(childid)
            image = images[index] if index < len(images) else "null"

        child_doc = db.collection("children").document(childid).get()
        if child_doc.exists:
            child_data = child_doc.to_dict()
            return [{
                "childid": childid,
                "present": present,
                "image": image,
                "name": child_data.get("name", ""),
                "class": child_data.get("class", ""),
                "grade": child_data.get("grade", ""),
                "profilepic": child_data.get("profilepic", "")
            }]
        else:
            return []

    all_children_docs = db.collection("children") \
        .where("fatherid", "==", user["uid"]) \
        .stream()
    mother_docs = db.collection("children") \
        .where("motherid", "==", user["uid"]) \
        .stream()
    all_docs = list(all_children_docs) + list(mother_docs)

    results = []
    for doc in all_docs:
        cdata = doc.to_dict()
        cid = doc.id
        present = cid in children
        image = "null"
        if present:
            index = children.index(cid)
            image = images[index] if index < len(images) else "null"

        results.append({
            "childid": cid,
            "present": present,
            "image": image
        })

    return results

@router.get("/attendance-for-date/{date}")
def get_attendance_for_date(date: str, user=Depends(get_current_user)):
    doc = db.collection("attendance").document(date).get()
    if not doc.exists:
        return []

    data = doc.to_dict()
    children = data.get("children", [])
    images = data.get("childrenimage", [])

    results = []
    for index, cid in enumerate(children):
        results.append({
            "childid": cid,
            "present": True,
            "image": images[index] if index < len(images) else "null"
        })

    return results

@router.post("/attendance/update")
async def update_attendance(
    childid: str = Form(...),
    date: str = Form(...),
    present: bool = Form(...),
    image: UploadFile = File(None),
    user=Depends(get_current_user)
):
    doc_ref = db.collection("attendance").document(date)
    doc = doc_ref.get()

    children = []
    childrenimage = []

    if doc.exists:
        data = doc.to_dict()
        children = data.get("children", [])
        childrenimage = data.get("childrenimage", [])

    if childid in children:
        index = children.index(childid)
        children.pop(index)
        childrenimage.pop(index)

    if present:
        children.append(childid)
        if image:
            try:
                upload_result = cloudinary.uploader.upload(image.file)
                image_url = upload_result.get("secure_url", "null")
            except Exception as e:
                print("Image upload failed:", e)
                image_url = "null"
        else:
            image_url = "null"
        childrenimage.append(image_url)

    doc_ref.set({
        "children": children,
        "childrenimage": childrenimage,
    })

    return {
        "success": True,
        "childid": childid,
        "present": present,
        "image": image_url if present else None
    }

@router.post("/attendance/toggle")
def toggle_attendance(data: dict = Body(...), user=Depends(get_current_user)):
    childid = data.get("childid")
    date = data.get("date")

    if not childid or not date:
        raise HTTPException(status_code=400, detail="Missing childid or date")

    doc_ref = db.collection("attendance").document(date)
    doc = doc_ref.get()

    children = []
    childrenimage = []

    if doc.exists:
        data = doc.to_dict()
        children = data.get("children", [])
        childrenimage = data.get("childrenimage", [])

    if childid in children:
        index = children.index(childid)
        children.pop(index)
        childrenimage.pop(index)
        new_status = "absent"
    else:
        children.append(childid)
        childrenimage.append("null")
        new_status = "present"

    doc_ref.set({
        "children": children,
        "childrenimage": childrenimage,
    })

    return {"status": new_status}
