# controllers/school_controller.py

import requests
from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from services.firebase_auth import get_current_user

router = APIRouter(tags=["Schools"])
db = firestore.client()

@router.get("/school/child/{child_id}")
def get_school_by_child_id(child_id: str, user=Depends(get_current_user)):
    """
    Retrieves the school details for a specific child by child_id, enriched with lat/lng via OneMap.
    """
    child_doc = db.collection("children").document(child_id).get()
    if not child_doc.exists:
        raise HTTPException(status_code=404, detail="Child not found")

    child_data = child_doc.to_dict()
    school_name = child_data.get("school")
    if not school_name:
        raise HTTPException(status_code=404, detail="No school assigned to this child")

    school_doc = db.collection("schoolapi").document(school_name).get()
    if not school_doc.exists:
        raise HTTPException(status_code=404, detail="School not found")

    school_data = school_doc.to_dict()
    postal_code = school_data.get("postal_code")
    if not postal_code:
        raise HTTPException(status_code=400, detail="School has no postal code")

    try:
        onemap_url = (
            f"https://www.onemap.gov.sg/api/common/elastic/search"
            f"?searchVal={postal_code}&returnGeom=Y&getAddrDetails=Y&pageNum=1"
        )
        response = requests.get(onemap_url)
        response.raise_for_status()
        onemap_data = response.json()

        results = onemap_data.get("results")
        if not results:
            raise HTTPException(status_code=404, detail="Postal code not found in OneMap")

        latitude = float(results[0]["LATITUDE"])
        longitude = float(results[0]["LONGITUDE"])

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"OneMap API error: {str(e)}")

    return {
        "school_name": school_name,
        "latitude": latitude,
        "longitude": longitude,
        **school_data,
    }

@router.get("/schoolsinfo")
def get_schools_info(user=Depends(get_current_user)):
    uid = user["uid"]
    schools = set()

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
