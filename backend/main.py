import os
import json
import socket
import firebase_admin
import uuid
import base64
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from services.firebase_auth import get_current_user  # ✅ Firebase authentication
from services.schoolsapi import preload_school_data
from fastapi import FastAPI, HTTPException, Depends, Body
from datetime import datetime
from firebase_admin import credentials, storage, firestore

# import the routers
from location_routes import router as location_router
from homework_route import router as homework_router



cloudinary.config(
    cloud_name="dqatmjayu",       # replace this
    api_key="834117339387158",             # replace this
    api_secret="i7DlGpun3n5836ecuvyXZe3Buiw"        # replace this
)



# ✅ Replace with your actual project ID
PROJECT_ID = "childconnect-1eacf"  # <--- 🔁 Replace this with your actual Firebase Project ID

# ✅ Initialize Firebase Admin with Storage
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")  # Path to your service account key
    firebase_admin.initialize_app(cred, {
        "storageBucket": f"{PROJECT_ID}.appspot.com"
    })

db = firestore.client()

preload_school_data()


app = FastAPI()


# ✅ Enable CORS for Expo & Web Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ✅ Function to get the local IP of the FastAPI server
def get_local_ip():
    hostname = socket.gethostname()
    return socket.gethostbyname(hostname)

# ✅ Save the IP to server_ip.json inside the Expo frontend's utils folder
def save_ip_to_file():
    ip_data = {"ip": get_local_ip()}

    # ✅ Change this to match your frontend's path
    frontend_utils_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../utils/server_ip.json"))

    # ✅ Overwrite server_ip.json every time FastAPI starts
    with open(frontend_utils_path, "w") as file:
        json.dump(ip_data, file)

    print(f"✅ Server IP saved to frontend: {frontend_utils_path} -> {ip_data['ip']}")

# ✅ Run this function when FastAPI starts
save_ip_to_file()

# ✅ API to get the IP (For debugging)
@app.get("/get-ip")
async def get_ip():
    try:
        with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "../utils/server_ip.json")), "r") as file:
            ip_data = json.load(file)
        return ip_data
    except FileNotFoundError:
        return {"error": "IP file not found"}

# ✅ Public route (No authentication required)
@app.get("/")
async def public_route():
    return {"message": "Hello from FastAPI, your FASTAPI is working"}

# ✅ Protected route (Requires Firebase authentication)
@app.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    uid = user.get("uid");
    doc_ref = db.collection("users").document(uid);
    doc = doc_ref.get()
    profile = doc.to_dict()
    return {
        "user_id": uid,
        "email": profile.get("email"),
        "role": profile.get("role"),  # ✅ this is the key piece
        "name": profile.get("name"),
        "message": f"Hello, {profile.get('name', 'User')}"
    }
@app.post("/registerparent")
def register_parent(data: dict, current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    email = current_user["email"]

    # Save to Firestore under users/uid
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

@app.post("/registerteacher")
def register_parent(data: dict, current_user=Depends(get_current_user)):
    uid = current_user["uid"]
    email = current_user["email"]

    # Save to Firestore under users/uid
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

@app.get("/mychildren")
def get_my_children(user=Depends(get_current_user)):
    uid = user["uid"]

    # Query 1: where fatherid == uid
    father_query = db.collection("children").where("fatherid", "==", uid).stream()
    # Query 2: where motherid == uid
    mother_query = db.collection("children").where("motherid", "==", uid).stream()

    # Convert results to list of dicts with document IDs
    children = []

    for child in father_query:
        children.append(child.to_dict() | {"id": child.id})

    for child in mother_query:
        # Avoid duplicates if both fatherid and motherid are same (rare but possible)
        if child.id not in [c["id"] for c in children]:
            children.append(child.to_dict() | {"id": child.id})

    return children

@app.get("/homeparentinfo")
def get_home_data(user=Depends(get_current_user)):
    uid = user["uid"]

    # Step 1: Fetch user profile
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    profile_picture = user_data.get("profilepic", "")

    # Step 2: Get children where user is either father or mother
    children_ref = db.collection("children")
    father_children = children_ref.where("fatherid", "==", uid).stream()
    mother_children = children_ref.where("motherid", "==", uid).stream()

    class_names = set()

    for child in list(father_children) + list(mother_children):
        child_data = child.to_dict()
        class_name = child_data.get("class")
        if class_name:
            class_names.add(class_name)

    # Step 3: Get class document IDs (actual Firestore doc IDs)
    class_ids = set()
    classes_ref = db.collection("class")

    for name in class_names:
        query = classes_ref.where("name", "==", name).limit(1).stream()
        for doc in query:
            class_ids.add(doc.id)

    # Step 4: Fetch announcements for these class IDs where status == "open"
    announcements = []
    for class_id in class_ids:
        query = db.collection("announcements") \
                  .where("classid", "==", class_id) \
                  .where("status", "==", "open") \
                  .stream()
        for doc in query:
            announcements.append({**doc.to_dict(), "id": doc.id})

    return {
        "profilepic": profile_picture,
        "announcements": announcements
    }

@app.get("/myclasses")
def get_my_classes(user=Depends(get_current_user)):
    uid = user["uid"]
    print(f"🔍 Looking for classes with teacherId or subteachers containing: {uid}")

    classes_ref = db.collection("class")

    form_teacher_query = classes_ref.where("teacherId", "==", uid).stream()
    sub_teacher_query = classes_ref.where("subteachers", "array_contains", uid).stream()
    result = []
    seen = set()

    for doc in form_teacher_query:
        data = doc.to_dict()
        print(f"✅ Found as Form Teacher: {data.get('name')}")
        data["id"] = doc.id
        data["role"] = "Form Teacher"
        result.append(data)
        seen.add(doc.id)

    for doc in sub_teacher_query:
        if doc.id not in seen:
            data = doc.to_dict()
            print(f"✅ Found as Sub Teacher: {data.get('name')}")
            data["id"] = doc.id
            data["role"] = "Teacher"
            result.append(data)

    print(f"📦 Total classes returned: {len(result)}")
    return result

@app.get("/child/{child_id}")
def get_child_by_id(child_id: str, user=Depends(get_current_user)):
    doc = db.collection("children").document(child_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Child not found")
    return doc.to_dict() | {"id": doc.id}

@app.get("/classbyname/{classname}")
def get_class_by_name(classname: str, user=Depends(get_current_user)):
    class_ref = db.collection("class").where("name", "==", classname).limit(1).stream()
    for doc in class_ref:
        return doc.to_dict()
    raise HTTPException(status_code=404, detail="Class not found")


@app.get("/users/{user_id}")
def get_user_by_id(user_id: str, user=Depends(get_current_user)):
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    return doc.to_dict() | {"id": user_id}

# ✅ BACKEND: attendance route
@app.get("/attendance-records/{child_id}")
def get_attendance_by_child(child_id: str, user=Depends(get_current_user)):
    attendance_ref = db.collection("attendance").stream()
    result = {}

    for doc in attendance_ref:
        doc_id = doc.id  # e.g. "25032025"
        data = doc.to_dict()
        result[doc_id] = child_id in data.get("children", [])

    return result

@app.get("/attendance/{date}")
def get_attendance_by_date(date: str, user=Depends(get_current_user)):
    doc = db.collection("attendance").document(date).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="No attendance record for that date")

    data = doc.to_dict()
    children = data.get("children", [])  # Present children only
    images = data.get("childrenimage", [])

    # Fetch all children for this user
    all_children_docs = db.collection("children") \
        .where("fatherid", "==", user["uid"]) \
        .stream()

    mother_docs = db.collection("children") \
        .where("motherid", "==", user["uid"]) \
        .stream()

    all_docs = list(all_children_docs) + list(mother_docs)

    results = []
    for doc in all_docs:
        cdata = doc.to_dict()
        cid = doc.id
        present = cid in children
        image = "null"
        if present:
            index = children.index(cid)
            image = images[index] if index < len(images) else "null"

        results.append({
            "childid": cid,
            "present": present,
            "image": image
        })

    return results


# ✅ BACKEND: FastAPI route
@app.get("/schoolsinfo")
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

@app.get("/documents/{childid}")
def get_documents_for_child(childid: str, user=Depends(get_current_user)):
    docs = db.collection("documents").where("childrenid", "==", childid).stream()

    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)

    return results

@app.patch("/documents/{doc_id}/toggle")
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

@app.post("/createdocument")
def create_document(doc: dict = Body(...), user=Depends(get_current_user)):
    try:
        image_url = ""
        image_data = doc.get("image")

        # ✅ Handle optional image upload to Cloudinary
        if isinstance(image_data, str) and image_data.startswith("data:image"):
            print("📸 Image received. Uploading to Cloudinary...")

            try:
                base64_str = image_data.split(";base64,")[1]
                decoded_image = base64.b64decode(base64_str)

                result = cloudinary.uploader.upload(
                    decoded_image,
                    folder="documentation",
                    public_id=str(uuid.uuid4()),
                    resource_type="image"
                )

                image_url = result.get("secure_url", "")
                print("✅ Image uploaded:", image_url)

            except Exception as e:
                print("❌ Cloudinary upload failed:", e)
                raise HTTPException(status_code=500, detail="Image upload failed")

        # ✅ Create the document
        new_doc = {
            "name": doc.get("name", ""),
            "content": doc.get("content", ""),
            "image": image_url,
            "status": "open",
            "createdby": user["uid"],
            "childrenid": doc.get("childid"),
            "created": datetime.now(),
        }

        created_ref = db.collection("documents").document()
        created_ref.set(new_doc)

        return {"message": "Document created", "id": created_ref.id}

    except Exception as e:
        print("❌ General error in /createdocument:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/updateprofile")
def update_profile(data: dict = Body(...), user=Depends(get_current_user)):
    try:
        user_id = user["uid"]
        image_url = data.get("profilepic", "")

        # 🔹 If image is base64, upload it to Cloudinary
        if isinstance(image_url, str) and image_url.startswith("data:image"):
            print("📸 Uploading new profile picture to Cloudinary...")
            base64_str = image_url.split(";base64,")[1]
            decoded_image = base64.b64decode(base64_str)

            result = cloudinary.uploader.upload(decoded_image)
            image_url = result["secure_url"]
            print("✅ Uploaded profile picture to:", image_url)

        # 🔹 Only allow updating selected fields (name & email are excluded)
        update_data = {
            "phone": data.get("phone", ""),
            "workPhone": data.get("workPhone", ""),
            "address": data.get("address", ""),
            "profilepic": image_url,
        }

        db.collection("users").document(user_id).update(update_data)

        return {"message": "Profile updated successfully", "profilepic": image_url}

    except Exception as e:
        print("❌ Error in /updateprofile:", str(e))
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/classbynamewithid/{classname}")
def get_class_by_name_with_id(classname: str, user=Depends(get_current_user)):
    class_ref = db.collection("class").where("name", "==", classname).limit(1).stream()
    for doc in class_ref:
        return doc.to_dict() | {"id": doc.id}
    raise HTTPException(status_code=404, detail="Class not found")

@app.post("/location/update")
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

        # Merge update to avoid overwriting blank strings or other fields
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


@app.post("/location/stop")
async def stop_location_tracking(data: dict = Body(...), user=Depends(get_current_user)):
    """
    Stops location tracking for the given child by setting istracking to false.
    Does not clear location fields.
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


@app.get("/location/{childid}")
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
