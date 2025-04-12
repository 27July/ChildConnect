# location_routes.py

from fastapi import APIRouter, Body, HTTPException, Depends
from firebase_admin import firestore
from datetime import datetime
from services.firebase_auth import get_current_user

router = APIRouter()
db = firestore.client()


@router.post("/location/update")
async def update_location(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Updates the current location of a child in Firestore.
    Stores it in 'locations/{childid}' document.
    Requires: childid, latitude, longitude
    Optional: istracking (bool)
    """
    try:
        child_id = data.get("childid")
        lat = data.get("latitude")
        lng = data.get("longitude")
        istracking = data.get("istracking", False)

        if not all([child_id, lat, lng]):
            raise HTTPException(status_code=400, detail="Missing location data")

        doc_ref = db.collection("locations").document(child_id)

        doc_ref.set({
            "latitude": lat,
            "longitude": lng,
            "istracking": istracking,
            "timestamp": datetime.now(),
        }, merge=True)

        return {"status": "success", "message": "Location updated"}

    except Exception as e:
        print("❌ Error updating location:", str(e))
        raise HTTPException(status_code=500, detail="Location update failed")


@router.post("/location/stop")
async def stop_location_tracking(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Stops location tracking for the given child by setting istracking to false.
    """
    try:
        child_id = data.get("childid")
        if not child_id:
            raise HTTPException(status_code=400, detail="Missing childid")

        doc_ref = db.collection("locations").document(child_id)

        doc_ref.set({
            "istracking": False,
            "timestamp": datetime.now(),
        }, merge=True)

        return {"status": "success", "message": "Tracking stopped"}

    except Exception as e:
        print("❌ Error stopping tracking:", str(e))
        raise HTTPException(status_code=500, detail="Failed to stop tracking")


@router.get("/location/{childid}")
def get_latest_location(childid: str, user=Depends(get_current_user)):
    """
    Retrieves the latest location for the given childid.
    """
    try:
        doc = db.collection("locations").document(childid).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Location not found")
        return doc.to_dict()

    except Exception as e:
        print("❌ Error fetching location:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch location")
    
@router.post("/location/set-tracking")
async def set_tracking_flag(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Sets only the tracking flag (istracking) for the given childid.
    """
    try:
        child_id = data.get("childid")
        istracking = data.get("istracking")

        if child_id is None or istracking is None:
            raise HTTPException(status_code=400, detail="Missing childid or istracking")

        doc_ref = db.collection("locations").document(child_id)

        doc_ref.set({
            "istracking": istracking,
            "timestamp": datetime.now(),
        }, merge=True)

        return {"status": "success", "message": f"Tracking set to {istracking}"}

    except Exception as e:
        print("❌ Error setting tracking:", str(e))
        raise HTTPException(status_code=500, detail="Failed to set tracking flag")

