import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# 🔐 Initialize Firebase Admin
cred = credentials.Certificate("../backend/serviceAccountKey.json")  # Adjust path if needed
firebase_admin.initialize_app(cred)

db = firestore.client()

def add_announcement():
    announcement_data = {
        # Change these values
        "name": "Exam Reminder",
        "content": "Science exam this Friday at 9am.",
        "classname": "1E1",
        "classid": "9QGMIqtwt0u78iMUo5Mu",  # Class document ID
        "teachername": "Jane Tan",
        "teacheruserid": "7kDZIIrxT2PUusXsnh3T2q2jRUb2",
        "created": firestore.SERVER_TIMESTAMP  # Automatically capture timestamp
    }

    # 🔹 Add to the "announcements" collection
    db.collection("announcements").add(announcement_data)

    print("✅ Announcement added successfully!")

if __name__ == "__main__":
    add_announcement()
