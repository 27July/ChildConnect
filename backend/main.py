import os
import json
import socket
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from services.firebase_auth import get_current_user  # ✅ Firebase authentication
from firebase_admin import firestore
from services.schoolsapi import preload_school_data

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

