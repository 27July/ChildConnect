# controllers/document_controller.py

from fastapi import APIRouter, Depends, HTTPException, Body
from firebase_admin import firestore
from services.firebase_auth import get_current_user
from datetime import datetime
import base64
import cloudinary.uploader

router = APIRouter()
db = firestore.client()

@router.get("/documents/{childid}")
def get_documents_for_child(childid: str, user=Depends(get_current_user)):
    docs = db.collection("documents").where("childrenid", "==", childid).stream()

    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)

    return results

@router.patch("/documents/{doc_id}/toggle")
def toggle_document_status(doc_id: str, user=Depends(get_current_user)):
    doc_ref = db.collection("documents").document(doc_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")

    data = doc.to_dict()
    if data["createdby"] != user["uid"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    new_status = "closed" if data["status"] == "open" else "open"
    doc_ref.update({"status": new_status})
    return {"status": new_status}

@router.post("/createdocument")
def create_document(doc: dict = Body(...), user=Depends(get_current_user)):
    try:
        image_url = ""
        file_url = ""

        image_data = doc.get("image")
        if isinstance(image_data, str) and "base64" in image_data:
            try:
                base64_str = image_data.split(";base64,")[1]
                decoded_image = base64.b64decode(base64_str)

                result = cloudinary.uploader.upload(
                    decoded_image,
                    folder="documentation/images",
                    resource_type="image"
                )
                image_url = result.get("secure_url", "")
            except Exception as e:
                raise HTTPException(status_code=500, detail="Image upload failed")

        file_data = doc.get("file")
        if isinstance(file_data, str) and "base64" in file_data:
            try:
                base64_str = file_data.split(";base64,")[1]
                decoded_file = base64.b64decode(base64_str)

                result = cloudinary.uploader.upload(
                    decoded_file,
                    folder="documentation/files",
                    resource_type="raw"
                )
                file_url = result.get("secure_url", "")
            except Exception as e:
                raise HTTPException(status_code=500, detail="File upload failed")

        new_doc = {
            "name": doc.get("name", ""),
            "content": doc.get("content", ""),
            "image": image_url,
            "file": file_url,
            "status": "open",
            "createdby": user["uid"],
            "childrenid": doc.get("childid"),
            "created": datetime.now(),
        }

        created_ref = db.collection("documents").document()
        created_ref.set(new_doc)

        return {"message": "Document created", "id": created_ref.id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
