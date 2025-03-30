# school_routes.py

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from services.firebase_auth import get_current_user

router = APIRouter(tags=["Schools"])
db = firestore.client()

@router.get("/schoolsinfo")
def get_schools_info(user=Depends(get_current_user)):
    uid = user["uid"]
    schools = set()

    # Fetch children where user is father or mother
    father_query = db.collection("children").where("fatherid", "==", uid).stream()
    mother_query = db.collection("children").where("motherid", "==", uid).stream()

    for doc in father_query:
        data = doc.to_dict()
        if "school" in data:
            schools.add(data["school"])

    for doc in mother_query:
        data = doc.to_dict()
        if "school" in data:
            schools.add(data["school"])

    school_infos = []
    for school_name in schools:
        doc = db.collection("schoolapi").document(school_name).get()
        if doc.exists:
            info = doc.to_dict()
            info["school_name"] = school_name
            school_infos.append(info)

    return school_infos
