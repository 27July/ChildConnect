# controllers/child_controller.py

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from services.firebase_auth import get_current_user

router = APIRouter()
db = firestore.client()

@router.get("/mychildren")
def get_my_children(user=Depends(get_current_user)):
    uid = user["uid"]

    father_query = db.collection("children").where("fatherid", "==", uid).stream()
    mother_query = db.collection("children").where("motherid", "==", uid).stream()

    children = []

    for child in father_query:
        children.append(child.to_dict() | {"id": child.id})

    for child in mother_query:
        if child.id not in [c["id"] for c in children]:
            children.append(child.to_dict() | {"id": child.id})

    return children

@router.get("/child/{child_id}")
def get_child_by_id(child_id: str, user=Depends(get_current_user)):
    doc = db.collection("children").document(child_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Child not found")
    return doc.to_dict() | {"id": doc.id}

@router.get("/childrenof/{user_id}")
def get_children_of_user(user_id: str, user=Depends(get_current_user)):
    father_query = db.collection("children").where("fatherid", "==", user_id).stream()
    mother_query = db.collection("children").where("motherid", "==", user_id).stream()

    children = []
    seen = set()

    for child in father_query:
        data = child.to_dict()
        data["id"] = child.id
        children.append(data)
        seen.add(child.id)

    for child in mother_query:
        if child.id not in seen:
            data = child.to_dict()
            data["id"] = child.id
            children.append(data)

    return children

@router.get("/class/{class_id}/children")
def get_children_of_class(class_id: str, user=Depends(get_current_user)):
    class_doc = db.collection("class").document(class_id).get()
    if not class_doc.exists:
        raise HTTPException(status_code=404, detail="Class not found")

    class_data = class_doc.to_dict()
    child_ids = class_data.get("children", [])
    children_data = []

    for child_id in child_ids:
        child_doc = db.collection("children").document(child_id).get()
        if child_doc.exists:
            children_data.append({**child_doc.to_dict(), "id": child_doc.id})

    return children_data
