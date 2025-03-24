import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase app
cred = credentials.Certificate("../backend/serviceAccountKey.json")  # ✅ Update path if needed
firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()

# Homework data
homework_data = {
    "name": "Science Homework",
    "content": "Math TYS page 2000",
    "classid": "9QGMIqtwt0u78iMUo5Mu",
    "teacherid": "7kDZIIrxT2PUusXsnh3T2q2jRUb2",
    "status": "open",
    "duedate": datetime(2025, 3, 27, 16, 0),  # 📅 March 27, 2025 at 4:00 PM
}

# Add to 'homework' collection
doc_ref = db.collection("homework").add(homework_data)

print("✅ Homework added successfully:", doc_ref)
