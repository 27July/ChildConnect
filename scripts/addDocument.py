import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin with service account
cred = credentials.Certificate("../backend/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()

# === Data to insert ===
document_data = {
    "name": "MC for 200/04/24",
    "status": "open",
    "created": firestore.SERVER_TIMESTAMP,  # or datetime.utcnow()
    "classid": "9QGMIqtwt0u78iMUo5Mu",
    "childrenid": "nkyN2Lz6GMCvHKEaolyY",
    "parentid": "",  # Add parent ID if you have it
}

# Add to Firestore (auto-ID document)
doc_ref = db.collection("documents").add(document_data)

print("✅ Document added to Firestore with ID:", doc_ref[1].id)
