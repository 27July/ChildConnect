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
    })

    return {"status": "success", "uid": uid}