import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

# === Firebase Setup ===
cred = credentials.Certificate("../backend/serviceAccountKey.json")  # Adjust path if needed
firebase_admin.initialize_app(cred)
db = firestore.client()

# === Constants ===
start_date = datetime.strptime("01012025", "%d%m%Y")
end_date = datetime.strptime("10042025", "%d%m%Y")

child_ids_to_remove = {
    "KLGLUQisSOWi5FXjehJm",
    "afWvJfapKZqPEmMjwnmo",
    "msMRk8TVpNGmmHrOmpkQ"
}

# === Weekend Cleanup ===
current_date = start_date
while current_date <= end_date:
    if current_date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
        doc_id = current_date.strftime("%d%m%Y")
        doc_ref = db.collection("attendance").document(doc_id)
        doc = doc_ref.get()

        if doc.exists:
            data = doc.to_dict()
            original_children = data.get("children", [])
            original_images = data.get("childrenimage", [])

            # Remove specific children + "null" strings
            cleaned_children = [c for c in original_children if c not in child_ids_to_remove]
            cleaned_images = [img for img in original_images if img != "null"]

            doc_ref.update({
                "children": cleaned_children,
                "childrenimage": cleaned_images
            })

            print(f"🧹 Cleaned up weekend doc {doc_id}")
        else:
            print(f"⚠️ Weekend doc {doc_id} does not exist.")
    else:
        print(f"✅ Skipping weekday: {current_date.strftime('%A %d-%m-%Y')}")

    current_date += timedelta(days=1)

print("✅ Weekend attendance cleanup complete.")
