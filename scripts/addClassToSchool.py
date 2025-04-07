import firebase_admin
from firebase_admin import credentials, firestore

# Path to your service account key
cred = credentials.Certificate("../backend/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# === Data to add ===
school_name = "RIVERVALE PRIMARY SCHOOL"
class_id_to_add = "CKUUa9NMU6iWBbLTziCp"

# === Firestore Logic ===
school_ref = db.collection("schools").document(school_name)
school_doc = school_ref.get()

if school_doc.exists:
    existing_data = school_doc.to_dict()
    class_ids = existing_data.get("classid", [])
    if class_id_to_add not in class_ids:
        class_ids.append(class_id_to_add)
        school_ref.update({"classid": class_ids})
        print(f"✅ Added class ID {class_id_to_add} to {school_name}")
    else:
        print("⚠️ Class ID already exists in that school.")
else:
    school_ref.set({
        "classid": [class_id_to_add]
    })
    print(f"✅ Created new school entry and added class ID {class_id_to_add}")
