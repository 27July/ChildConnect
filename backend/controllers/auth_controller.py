# controllers/auth_controller.py

from fastapi import APIRouter, Depends, HTTPException, Body
from firebase_admin import firestore
from services.firebase_auth import get_current_user

router = APIRouter()

db = firestore.client()

@router.post("/registerparent")
def register_parent(data: dict, current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    email = current_user["email"]

    db.collection("users").document(uid).set({
        "name": data["name"],
        "phone": data["phone"],
        "email": email,
        "role": "parent",
        "profilepic": "",
        "children": [],
        "address": "",
        "workPhone": "",
        "classes": [],
        "created": firestore.SERVER_TIMESTAMP,
        "school": "",
    })

    return {"status": "success", "uid": uid}


@router.post("/registerteacher")
def register_teacher(data: dict, current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    email = current_user["email"]

    db.collection("users").document(uid).set({
        "name": data["name"],
        "phone": data["phone"],
        "email": email,
        "role": "teacher",
        "profilepic": "",
        "children": [],
        "address": "",
        "workPhone": "",
        "classes": [],
        "created": firestore.SERVER_TIMESTAMP,
        "school": "",
    })

    return {"status": "success", "uid": uid}
