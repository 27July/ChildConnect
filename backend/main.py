# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from firebase_admin import credentials, initialize_app, firestore
import firebase_admin
import socket
import os
import json

# ------------------------------
# Modular Controller Imports
# ------------------------------
from controllers.auth_controller import router as auth_router
from controllers.profile_controller import router as profile_router
from controllers.child_controller import router as child_router
from controllers.class_controller import router as class_router
from controllers.chat_controller import router as chat_router
from controllers.document_controller import router as document_router
from controllers.attendance_controller import router as attendance_router
from controllers.homework_controller import router as homework_router
from controllers.announcement_controller import router as announcement_router
from controllers.school_controller import router as school_router
from controllers.childmode_controller import router as childmode_router
from controllers.tts_controller import router as tts_router
from controllers.stt_controller import router as stt_router
from controllers.translation_controller import router as translation_router
from controllers.location_controller import router as location_router

# ------------------------------
# Firebase Admin Initialization
# ------------------------------
PROJECT_ID = "childconnect-1eacf"
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    initialize_app(cred, {"storageBucket": f"{PROJECT_ID}.appspot.com"})

# Firestore reference
db = firestore.client()

# ------------------------------
# FastAPI Initialization
# ------------------------------
app = FastAPI()

# Enable CORS (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (e.g., audio output)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ------------------------------
# Include All Modular Routers
# ------------------------------
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(child_router)
app.include_router(class_router)
app.include_router(chat_router)
app.include_router(document_router)
app.include_router(attendance_router)
app.include_router(homework_router)
app.include_router(announcement_router)
app.include_router(school_router)
app.include_router(childmode_router)
app.include_router(tts_router)
app.include_router(stt_router)
app.include_router(translation_router)
app.include_router(location_router)

# ------------------------------
# Utility: IP Detection for Expo Frontend
# ------------------------------
def get_local_ip():
    hostname = socket.gethostname()
    return socket.gethostbyname(hostname)

def save_ip_to_file():
    ip_data = {"ip": get_local_ip()}
    frontend_utils_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../utils/server_ip.json"))
    with open(frontend_utils_path, "w") as file:
        json.dump(ip_data, file)
    print(f"✅ Server IP saved to frontend: {frontend_utils_path} -> {ip_data['ip']}")

save_ip_to_file()

# ------------------------------
# Default Healthcheck Routes
# ------------------------------
@app.get("/")
async def public_route():
    return {"message": "Hello from FastAPI, your backend is working"}

@app.get("/get-ip")
async def get_ip():
    try:
        with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "../utils/server_ip.json")), "r") as file:
            ip_data = json.load(file)
        return ip_data
    except FileNotFoundError:
        return {"error": "IP file not found"}
