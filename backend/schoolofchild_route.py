import requests
from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from services.firebase_auth import get_current_user

router = APIRouter()
db = firestore.client()

@router.get("/school/child/{child_id}")
def get_school_by_child_id(child_id: str, user=Depends(get_current_user)):
    """
    Retrieves the school details for a specific child by child_id, enriched with lat/lng via OneMap.
    """
    # Step 1: Get child document
    child_doc = db.collection("children").document(child_id).get()
    if not child_doc.exists:
        raise HTTPException(status_code=404, detail="Child not found")

    child_data = child_doc.to_dict()
    school_name = child_data.get("school")
    if not school_name:
        raise HTTPException(status_code=404, detail="No school assigned to this child")

    # Step 2: Get school document
    school_doc = db.collection("schoolapi").document(school_name).get()
    if not school_doc.exists:
        raise HTTPException(status_code=404, detail="School not found")

    school_data = school_doc.to_dict()
    postal_code = school_data.get("postal_code")
    if not postal_code:
        raise HTTPException(status_code=400, detail="School has no postal code")

    # Step 3: Call OneMap API to get lat/lng
    try:
        onemap_url = f"https://www.onemap.gov.sg/api/common/elastic/search?searchVal={postal_code}&returnGeom=Y&getAddrDetails=Y&pageNum=1"
        response = requests.get(onemap_url)
        response.raise_for_status()
        onemap_data = response.json()
        
        # Use the first result
        results = onemap_data.get("results")
        if not results:
            raise HTTPException(status_code=404, detail="Postal code not found in OneMap")
        
        latitude = float(results[0]["LATITUDE"])
        longitude = float(results[0]["LONGITUDE"])

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"OneMap API error: {str(e)}")

    # Step 4: Return full school data with coordinates
    return {
        "school_name": school_name,
        "latitude": latitude,
        "longitude": longitude,
        **school_data,
    }
