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
from pydantic import BaseModel
from google.cloud import speech
from speech_to_text import router as speech_router
from fastapi.staticfiles import StaticFiles


client = speech.SpeechClient.from_service_account_file("speech-to-text-key.json")



# import the routers
from location_routes import router as location_router
from homework_route import router as homework_router
from schools_route import router as schools_router
from schoolofchild_route import router as school_of_child_router
from child_mode_auth_route import router as childmode_router
from translation_routes import router as translation_router
from speak_text import router as speak_text_router


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

#preload_school_data()

#External Routers
app = FastAPI()
app.include_router(location_router)
app.include_router(schools_router)
app.include_router(homework_router)
app.include_router(school_of_child_router)
app.include_router(childmode_router)
app.include_router(translation_router)
app.include_router(speech_router)
app.include_router(speak_text_router)
app.mount("/static", StaticFiles(directory="static"), name="static")


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
        "profilepic": profile.get("profilepic", ""),
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

    children = []
    for child in list(father_children) + list(mother_children):
        data = child.to_dict()
        data["id"] = child.id
        children.append(data)

    # Step 3: Map class name → list of children
    class_to_children = {}
    for child in children:
        cname = child.get("class")
        if cname:
            if cname not in class_to_children:
                class_to_children[cname] = []
            class_to_children[cname].append(child.get("name", "Unknown"))

    # Step 4: Get Firestore class doc IDs
    class_ids = set()
    class_name_to_id = {}
    for cname in class_to_children.keys():
        query = db.collection("class").where("name", "==", cname).limit(1).stream()
        for doc in query:
            class_ids.add(doc.id)
            class_name_to_id[doc.id] = cname

    # Step 5: Fetch announcements and map child names
    announcements = []
    for class_id in class_ids:
        query = db.collection("announcements") \
                  .where("classid", "==", class_id) \
                  .where("status", "==", "open") \
                  .stream()
        for doc in query:
            data = doc.to_dict()
            cname = data.get("classname")
            children_for_class = class_to_children.get(cname, [])
            announcements.append({
                **data,
                "id": doc.id,
                "children": children_for_class  # 🔹 Add list of child names here
            })

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
def get_attendance_by_date(date: str, childid: str = None, user=Depends(get_current_user)):
    doc = db.collection("attendance").document(date).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="No attendance record for that date")

    data = doc.to_dict()
    children = data.get("children", [])  # Present children only
    images = data.get("childrenimage", [])

    if childid:
        present = childid in children
        image = "null"
        if present:
            index = children.index(childid)
            image = images[index] if index < len(images) else "null"

        # Get child's class and grade
        child_doc = db.collection("children").document(childid).get()
        if child_doc.exists:
            child_data = child_doc.to_dict()
            return [{
                "childid": childid,
                "present": present,
                "image": image,
                "name": child_data.get("name", ""),
                "class": child_data.get("class", ""),
                "grade": child_data.get("grade", ""),
                "profilepic": child_data.get("profilepic", "")
            }]
        else:
            return []

    # Fallback (for parent)
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
        file_url = ""

        # 🔹 Optional image field (uploaded as 'image')
        image_data = doc.get("image")
        if isinstance(image_data, str) and "base64" in image_data:
            try:
                print("📸 Uploading image to Cloudinary...")
                base64_str = image_data.split(";base64,")[1]
                decoded_image = base64.b64decode(base64_str)

                result = cloudinary.uploader.upload(
                    decoded_image,
                    folder="documentation/images",
                    public_id=str(uuid.uuid4()),
                    resource_type="image"
                )
                image_url = result.get("secure_url", "")
                print("✅ Image uploaded:", image_url)

            except Exception as e:
                print("❌ Image upload failed:", e)
                raise HTTPException(status_code=500, detail="Image upload failed")

        # 🔹 Optional file field (uploaded as 'file') – e.g., PDF
        file_data = doc.get("file")
        if isinstance(file_data, str) and "base64" in file_data:
            try:
                print("📄 Uploading file to Cloudinary...")
                base64_str = file_data.split(";base64,")[1]
                decoded_file = base64.b64decode(base64_str)

                result = cloudinary.uploader.upload(
                    decoded_file,
                    folder="documentation/files",
                    public_id=str(uuid.uuid4()),
                    resource_type="raw"
                )
                file_url = result.get("secure_url", "")
                print("✅ File uploaded:", file_url)

            except Exception as e:
                print("❌ File upload failed:", e)
                raise HTTPException(status_code=500, detail="File upload failed")

        # 🔹 Create the Firestore document
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

@app.get("/findchats")
async def find_chats(user_data=Depends(get_current_user)):
    user_id = user_data["uid"]
    chats_ref = db.collection("chat")

    query1 = chats_ref.where("userID1", "==", user_id).stream()
    query2 = chats_ref.where("userID2", "==", user_id).stream()

    chats = []
    for doc in list(query1) + list(query2):
        chat_data = doc.to_dict()
        chat_data["id"] = doc.id

        # Identify the other participant
        other_user_id = (
            chat_data["userID2"] if chat_data["userID1"] == user_id else chat_data["userID1"]
        )

        # Fetch other user's profile
        other_user_doc = db.collection("users").document(other_user_id).get()
        if other_user_doc.exists:
            other_data = other_user_doc.to_dict()
            chat_data["otherUserName"] = other_data.get("name", "Unknown User")
            chat_data["otherUserPic"] = other_data.get("profilepic", "")
        else:
            chat_data["otherUserName"] = "Unknown User"
            chat_data["otherUserPic"] = ""

        # ✅ Correct isRead check: Are there any messages sent to me that are still unread?
        messages_ref = db.collection("chat").document(doc.id).collection("messages")
        unread = messages_ref.where("receiver", "==", user_id).where("isRead", "==", False).limit(1).stream()
        has_unread = any(True for _ in unread)
        chat_data["isRead"] = not has_unread

        chats.append(chat_data)

    return chats


@app.get("/findspecificchat/{chat_id}")
async def find_specific_chat(chat_id: str, user=Depends(get_current_user)):
    messages_ref = db.collection("chat").document(chat_id).collection("messages")
    messages = messages_ref.order_by("timestamp").stream()
    result = [dict(m.to_dict()) for m in messages]
    return result

@app.post("/sendmessage")
def send_message(data: dict = Body(...), user=Depends(get_current_user)):
    try:
        user_id = user["uid"]
        chat_id = data["chatId"]
        message = data.get("message", "")
        image = data.get("image", "")

        receiver = None
        chat_ref = db.collection("chat").document(chat_id)
        chat_doc = chat_ref.get()
        if chat_doc.exists:
            chat_data = chat_doc.to_dict()
            receiver = chat_data["userID2"] if chat_data["userID1"] == user_id else chat_data["userID1"]
        else:
            raise HTTPException(status_code=404, detail="Chat not found")

        image_url = ""
        if isinstance(image, str) and image.startswith("data:image"):
            base64_str = image.split(";base64,")[1]
            decoded_image = base64.b64decode(base64_str)
            result = cloudinary.uploader.upload(decoded_image)
            image_url = result["secure_url"]

        # Create new message document
        message_data = {
            "sender": user_id,
            "receiver": receiver,
            "message": message,
            "image": image_url,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "isRead": False,
        }
        messages_ref = chat_ref.collection("messages")
        messages_ref.add(message_data)

        # Update chat metadata
        chat_ref.update({
            "lastMessage": message,
            "lastUpdated": firestore.SERVER_TIMESTAMP,
            "lastSender": user_id
        })

        return {"message": "Message sent successfully"}

    except Exception as e:
        print("❌ Error sending message:", e)
        raise HTTPException(status_code=500, detail=str(e))
        
@app.post("/markread/{chat_id}")
def mark_chat_as_read(chat_id: str, user=Depends(get_current_user)):
    try:
        user_id = user["uid"]
        messages_ref = db.collection("chat").document(chat_id).collection("messages")
        unread_messages = messages_ref.where("receiver", "==", user_id).where("isRead", "==", False).stream()

        batch = db.batch()
        for msg in unread_messages:
            msg_ref = msg.reference
            batch.update(msg_ref, {"isRead": True})
        batch.commit()

        return {"message": "Marked as read"}
    except Exception as e:
        print("❌ Error marking as read:", e)
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/chat/{chat_id}/otheruser")
def get_other_user_profile(chat_id: str, user=Depends(get_current_user)):
    user_id = user["uid"]
    chat_doc = db.collection("chat").document(chat_id).get()
    if not chat_doc.exists:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat = chat_doc.to_dict()
    other_user_id = chat["userID2"] if chat["userID1"] == user_id else chat["userID1"]
    other_user_doc = db.collection("users").document(other_user_id).get()
    if other_user_doc.exists:
        return other_user_doc.to_dict()
    else:
        raise HTTPException(status_code=404, detail="User not found")

@app.get("/childrenof/{user_id}")
def get_children_of_user(user_id: str, user=Depends(get_current_user)):
    # Query 1: where fatherid == user_id
    father_query = db.collection("children").where("fatherid", "==", user_id).stream()
    # Query 2: where motherid == user_id
    mother_query = db.collection("children").where("motherid", "==", user_id).stream()

    children = []
    seen = set()

    for child in father_query:
        data = child.to_dict()
        data["id"] = child.id
        children.append(data)
        seen.add(child.id)

    for child in mother_query:
        if child.id not in seen:
            data = child.to_dict()
            data["id"] = child.id
            children.append(data)

    return children

@app.get("/class/{class_id}/children")
def get_children_of_class(class_id: str, user=Depends(get_current_user)):
    class_doc = db.collection("class").document(class_id).get()
    if not class_doc.exists:
        raise HTTPException(status_code=404, detail="Class not found")

    class_data = class_doc.to_dict()
    child_ids = class_data.get("children", [])
    children_data = []

    for child_id in child_ids:
        child_doc = db.collection("children").document(child_id).get()
        if child_doc.exists:
            children_data.append({**child_doc.to_dict(), "id": child_doc.id})

    return children_data

@app.get("/attendance-for-date/{date}")
def get_attendance_for_date(date: str, user=Depends(get_current_user)):
    doc = db.collection("attendance").document(date).get()
    if not doc.exists:
        return []

    data = doc.to_dict()
    children = data.get("children", [])
    images = data.get("childrenimage", [])

    results = []
    for index, cid in enumerate(children):
        results.append({
            "childid": cid,
            "present": True,
            "image": images[index] if index < len(images) else "null"
        })

    return results

from fastapi import UploadFile, File, Form
from fastapi import Depends, HTTPException
import cloudinary.uploader
from datetime import datetime

@app.post("/attendance/update")
async def update_attendance(
    childid: str = Form(...),
    date: str = Form(...),  # Format: DDMMYYYY
    present: bool = Form(...),
    image: UploadFile = File(None),
    user=Depends(get_current_user)
):
    doc_ref = db.collection("attendance").document(date)
    doc = doc_ref.get()

    # Initialize or load existing data
    children = []
    childrenimage = []

    if doc.exists:
        data = doc.to_dict()
        children = data.get("children", [])
        childrenimage = data.get("childrenimage", [])

    # Remove existing entry if child already present
    if childid in children:
        index = children.index(childid)
        children.pop(index)
        childrenimage.pop(index)

    # Add new entry if present
    if present:
        children.append(childid)

        if image:
            try:
                upload_result = cloudinary.uploader.upload(image.file)
                image_url = upload_result.get("secure_url", "null")
            except Exception as e:
                print("Image upload failed:", e)
                image_url = "null"
        else:
            image_url = "null"

        childrenimage.append(image_url)

    # Save back to Firestore
    doc_ref.set({
        "children": children,
        "childrenimage": childrenimage,
    })

    return {
        "success": True,
        "childid": childid,
        "present": present,
        "image": image_url if present else None
    }

@app.get("/classesof/{user_id}")
def get_classes_of_user(user_id: str, user=Depends(get_current_user)):
    print(f"🔍 Looking for classes for user ID: {user_id}")
    classes_ref = db.collection("class")

    form_teacher_query = classes_ref.where("teacherId", "==", user_id).stream()
    sub_teacher_query = classes_ref.where("subteachers", "array_contains", user_id).stream()

    result = []
    seen = set()

    for doc in form_teacher_query:
        data = doc.to_dict()
        data["id"] = doc.id
        data["role"] = "Form Teacher"
        result.append(data)
        seen.add(doc.id)

    for doc in sub_teacher_query:
        if doc.id not in seen:
            data = doc.to_dict()
            data["id"] = doc.id
            data["role"] = "Teacher"
            result.append(data)

    print(f"📦 Total classes returned for {user_id}: {len(result)}")
    return result

# 🔧 Define Pydantic request model FIRST
class HomeworkRequest(BaseModel):
    classid: str
    name: str
    content: str
    duedate: str  # e.g., "March 30, 2025"
    subject: str
    teacherid: str

@app.post("/addhomework")
def add_homework(data: dict, user=Depends(get_current_user)):
    # Parse ISO date to datetime
    duedate_obj = datetime.fromisoformat(data["duedate"])
    
    homework_ref = db.collection("homework").document()
    homework_ref.set({
        "name": data["name"],
        "content": data["content"],
        "duedate": duedate_obj,
        "classid": data["classid"],
        "subject": data["subject"],
        "status": "open",
        "teacherid": data["teacherid"],
    })
    return {"success": True}

class AnnouncementRequest(BaseModel):
    classid: str
    classname: str
    name: str
    content: str
    teachername: str
    teacheruserid: str

@app.post("/addannouncement")
def add_announcement(data: AnnouncementRequest, user=Depends(get_current_user)):
    doc_ref = db.collection("announcements").document()
    doc_ref.set({
        "classid": data.classid,
        "classname": data.classname,
        "name": data.name,
        "content": data.content,
        "teachername": data.teachername,
        "teacheruserid": data.teacheruserid,
        "status": "open",
        "created": firestore.SERVER_TIMESTAMP,
    })
    return {"success": True, "id": doc_ref.id}

# Backend: FastAPI route for fetching announcements by classid

@app.get("/announcements/{classid}")
def get_announcements_for_class(classid: str, user=Depends(get_current_user)):
    announcements = (
        db.collection("announcements")
        .where("classid", "==", classid)
        .stream()
    )

    result = []
    for doc in announcements:
        data = doc.to_dict()
        data["id"] = doc.id
        result.append(data)

    return result


@app.get("/class/{class_id}")
def get_class_by_id(class_id: str, user=Depends(get_current_user)):
    class_doc = db.collection("class").document(class_id).get()
    if not class_doc.exists:
        raise HTTPException(status_code=404, detail="Class not found")

    return class_doc.to_dict() | {"id": class_doc.id}

@app.patch("/announcements/{announcement_id}/toggle")
def toggle_announcement_status(announcement_id: str, user=Depends(get_current_user)):
    doc_ref = db.collection("announcements").document(announcement_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Announcement not found")

    data = doc.to_dict()

    # Optional: only allow the teacher who created it to toggle
    if data.get("teacheruserid") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    new_status = "closed" if data["status"] == "open" else "open"
    doc_ref.update({"status": new_status})
    return {"status": new_status}

@app.patch("/homework/{homework_id}/toggle")
def toggle_homework_status(homework_id: str, user=Depends(get_current_user)):
    doc_ref = db.collection("homework").document(homework_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Homework not found")

    data = doc.to_dict()

    # Optional: Only allow the teacher who created it to toggle
    if data.get("teacherid") != user["uid"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    new_status = "closed" if data["status"] == "open" else "open"
    doc_ref.update({"status": new_status})
    return {"status": new_status}

@app.get("/homework/{classid}")
def get_homework_by_class(classid: str, user=Depends(get_current_user)):
    homework_docs = db.collection("homework").where("classid", "==", classid).stream()
    result = []

    for doc in homework_docs:
        hw = doc.to_dict()
        hw["id"] = doc.id
        result.append(hw)

    return result

@app.post("/attendance/toggle")
def toggle_attendance(data: dict = Body(...), user=Depends(get_current_user)):
    childid = data.get("childid")
    date = data.get("date")  # e.g. "01042025"

    if not childid or not date:
        raise HTTPException(status_code=400, detail="Missing childid or date")

    doc_ref = db.collection("attendance").document(date)
    doc = doc_ref.get()

    children = []
    childrenimage = []

    if doc.exists:
        data = doc.to_dict()
        children = data.get("children", [])
        childrenimage = data.get("childrenimage", [])

    if childid in children:
        index = children.index(childid)
        children.pop(index)
        childrenimage.pop(index)
        new_status = "absent"
    else:
        children.append(childid)
        childrenimage.append("null")  # Default placeholder
        new_status = "present"

    doc_ref.set({
        "children": children,
        "childrenimage": childrenimage,
    })

    return {"status": new_status}

@app.get("/startchatwith/{other_user_id}")
async def start_chat_with(other_user_id: str, user=Depends(get_current_user)):
    current_user_id = user["uid"]

    if current_user_id == other_user_id:
        raise HTTPException(status_code=400, detail="Cannot start chat with yourself.")

    chats_ref = db.collection("chat")

    # 🔍 Check if chat already exists (bi-directionally)
    existing_query1 = chats_ref.where("userID1", "==", current_user_id).where("userID2", "==", other_user_id).stream()
    existing_query2 = chats_ref.where("userID1", "==", other_user_id).where("userID2", "==", current_user_id).stream()

    for doc in list(existing_query1) + list(existing_query2):
        return {"id": doc.id}  # ✅ Return existing chat ID

    # 🆕 Create new chat document
    new_chat_ref = chats_ref.document()
    new_chat_ref.set({
        "userID1": current_user_id,
        "userID2": other_user_id,
        "lastMessage": "",
        "lastUpdated": datetime.now(),
    })

    return {"id": new_chat_ref.id}

@app.get("/grades/by-class/{classid}")
async def get_tests_by_class(classid: str):
    try:
        grades_ref = db.collection("grades")
        query = grades_ref.where("classid", "==", classid)
        results = query.stream()

        test_list = []
        for doc in results:
            data = doc.to_dict()
            test_list.append({
                "testname": data.get("testname", ""),
                "class": data.get("class", ""),
                "classid": data.get("classid", ""),
                "docid": doc.id
            })

        return test_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/grades/add-test")
def add_test_score(data: dict, user=Depends(get_current_user)):
    db.collection("grades").document().set({
        "testname": data["testname"],
        "classid": data["classid"],
        "class": data["class"],
        "childrenid": data["childrenid"],
        "childrenname": data["childrenname"],
        "childrenscore": data["childrenscore"],
    })
    return {"success": True}

@app.get("/grades/{id}")
def get_test_by_id(id: str, user=Depends(get_current_user)):
    doc = db.collection("grades").document(id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Test not found")
    return doc.to_dict()

@app.get("/grades/by-child/{childid}")
async def get_tests_for_child(childid: str, token=Depends(get_current_user)):
    grades_ref = db.collection("grades")
    all_docs = grades_ref.stream()

    matching_tests = []
    for doc in all_docs:
        data = doc.to_dict()
        if childid in data.get("childrenid", []):
            idx = data["childrenid"].index(childid)
            score = data["childrenscore"][idx]
            matching_tests.append({
                "testname": data.get("testname", "Unnamed Test"),
                "score": score,
                "total": 100,
                "docid": doc.id,
                "class": data.get("class"),
                "all_scores": data.get("childrenscore", [])
            })

    return matching_tests
