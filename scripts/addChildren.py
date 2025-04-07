import firebase_admin
from firebase_admin import credentials, firestore

# 🔐 Initialize Firebase Admin SDK
cred = credentials.Certificate("../backend/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# 🔗 Get Firestore client
db = firestore.client()

def add_child():
    child_data = {
        #Change these values
        "class": "1A",
        "fatherid": "heyFPfrs5QOBaySyTNVXVBs9fJE3",
        "fathername": "Placeholder Tan",
        "motherid": "heyFPfrs5QOBaySyTNVXVBs9fJE3",
        "mothername": "Placeholder Tan",
        "name" : "Yunjin Tan",
        "documents" : [],
        "profilepic": "",
        "grade": "Primary 1",
        "school": "ANDERSON PRIMARY SCHOOL"
    }

    # Optional: Use custom doc ID
    # doc_id = "custom_child_id"
    # db.collection("children").document(doc_id).set(child_data)

    # OR let Firestore auto-generate doc ID
    db.collection("children").add(child_data)

    print("✅ Child added to Firestore")

# ✅ Run it
if __name__ == "__main__":
    add_child()
