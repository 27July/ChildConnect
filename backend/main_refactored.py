import os
import json
import socket
import firebase_admin
import cloudinary
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from firebase_admin import credentials, firestore

# Initialize Firebase
def initialize_firebase():
    PROJECT_ID = "childconnect-1eacf"  # Replace with your actual Firebase Project ID
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred, {
            "storageBucket": f"{PROJECT_ID}.appspot.com"
        })
    return firestore.client()

# Initialize Cloudinary
def initialize_cloudinary():
    cloudinary.config(
        cloud_name="your_cloud_name",   # Replace this
        api_key="your_api_key",         # Replace this
        api_secret="your_api_secret"    # Replace this
    )

# Get the local IP and save it to a file for the frontend
def save_ip_to_file():
    def get_local_ip():
        hostname = socket.gethostname()
        return socket.gethostbyname(hostname)
    
    ip_data = {"ip": get_local_ip()}
    frontend_utils_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../utils/server_ip.json"))
    
    with open(frontend_utils_path, "w") as file:
        json.dump(ip_data, file)
    
    print(f"✅ Server IP saved to frontend: {frontend_utils_path} -> {ip_data['ip']}")

# Create FastAPI application
def create_app():
    # Initialize services
    db = initialize_firebase()
    initialize_cloudinary()
    save_ip_to_file()
    
    # Create FastAPI app
    app = FastAPI(title="ChildConnect API", version="1.0.0")
    
    # Enable CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins (Change in production)
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Import the views (which contain the routers)
    from src.views.LocationView import location_router
    from src.views.AuthView import auth_router
    from location_routes import router as old_location_router
    from homework_route import router as homework_router
    from schools_route import router as schools_router
    from schoolofchild_route import router as school_of_child_router
    from child_mode_auth_route import router as childmode_router
    from translation_routes import router as translation_router
    from speak_text import router as speak_text_router
    from speech_to_text import router as speech_router
    
    # Include routers
    app.include_router(location_router)        # New pattern-based router
    app.include_router(auth_router)            # New pattern-based router
    app.include_router(old_location_router)    # Legacy router (for backward compatibility)
    app.include_router(schools_router)
    app.include_router(homework_router)
    app.include_router(school_of_child_router)
    app.include_router(childmode_router)
    app.include_router(translation_router)
    app.include_router(speech_router)
    app.include_router(speak_text_router)
    
    # Mount static files directory
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    # Root endpoint for health check
    @app.get("/")
    async def root():
        return {"message": "ChildConnect API is running"}
    
    # IP endpoint for debugging
    @app.get("/get-ip")
    async def get_ip():
        try:
            with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "../utils/server_ip.json")), "r") as file:
                ip_data = json.load(file)
            return ip_data
        except FileNotFoundError:
            return {"error": "IP file not found"}
    
    return app

# Create app instance
app = create_app()

# Run the app with: uvicorn main_refactored:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_refactored:app", host="0.0.0.0", port=8000, reload=True)