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
        "class": "1E4",
        "fatherid": "JaVurUsjegNoR6WbZwM8Ym9WYCA3",
        "fathername": "Bob Tan",
        "motherid": "",
        "mothername": "",
        "name" : "Jack Tan",
        "documents" : [],
        "profilepic": "",
        "grade": "",
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
