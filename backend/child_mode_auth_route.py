from fastapi import APIRouter, Depends, HTTPException, Body
from firebase_admin import firestore
from services.firebase_auth import get_current_user
from pydantic import BaseModel

router = APIRouter()
db = firestore.client()

class PasswordUpdateRequest(BaseModel):
    password: str

@router.get("/childmode-password/{child_id}")
def get_childmode_password(child_id: str, user=Depends(get_current_user)):
    """
    Fetch the child mode password stored in the child_mode_auth collection.
    Access allowed only if the user is the parent of the child.
    """
    child_doc = db.collection("children").document(child_id).get()
    if not child_doc.exists:
        raise HTTPException(status_code=404, detail="Child not found")

    child_data = child_doc.to_dict()
    parent_id = user.get("uid")

    if parent_id not in [child_data.get("fatherid"), child_data.get("motherid")]:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    password_doc = db.collection("child_mode_auth").document(child_id).get()
    if not password_doc.exists:
        raise HTTPException(status_code=404, detail="Password not set")

    return password_doc.to_dict()

@router.post("/childmode-password/{child_id}")
def update_childmode_password(child_id: str, request: PasswordUpdateRequest, user=Depends(get_current_user)):
    """
    Update or set the child mode password for a given child.
    Only the parent (father or mother) can perform this operation.
    """
    child_doc = db.collection("children").document(child_id).get()
    if not child_doc.exists:
        raise HTTPException(status_code=404, detail="Child not found")

    child_data = child_doc.to_dict()
    parent_id = user.get("uid")

    if parent_id not in [child_data.get("fatherid"), child_data.get("motherid")]:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    db.collection("child_mode_auth").document(child_id).set({
        "password": request.password
    })

    return {"message": "Password updated successfully"}
