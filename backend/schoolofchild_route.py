from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from services.firebase_auth import get_current_user

router = APIRouter()
db = firestore.client()

@router.get("/school/child/{child_id}")
def get_school_by_child_id(child_id: str, user=Depends(get_current_user)):
    """
    Retrieves the school details for a specific child by child_id.
    """
    # Step 1: Get the child document
    child_doc = db.collection("children").document(child_id).get()
    if not child_doc.exists:
        raise HTTPException(status_code=404, detail="Child not found")

    child_data = child_doc.to_dict()
    school_name = child_data.get("school")

    if not school_name:
        raise HTTPException(status_code=404, detail="No school assigned to this child")

    # Step 2: Fetch the school document from 'schoolapi' collection
    school_doc = db.collection("schoolapi").document(school_name).get()
    if not school_doc.exists:
        raise HTTPException(status_code=404, detail="School not found")

    school_data = school_doc.to_dict()
    return {
        "school_name": school_name,
        **school_data
    }
