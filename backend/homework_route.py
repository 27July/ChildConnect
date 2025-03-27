#homework_route.py
# This file will contain the routes to manage homework data in Firestore.

from fastapi import APIRouter, Body, HTTPException, Depends
from firebase_admin import firestore
from datetime import datetime
from services.firebase_auth import get_current_user

router = APIRouter()
db = firestore.client()

@router.get("/homework/class/{classid}")
def get_homework_by_class(classid: str, user=Depends(get_current_user)):
    homework_docs = db.collection("homework").where("classid", "==", classid).stream()
    result = []
    for doc in homework_docs:
        data = doc.to_dict()
        data["id"] = doc.id
        result.append(data)
    return result