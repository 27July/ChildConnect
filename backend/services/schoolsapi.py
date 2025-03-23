import requests
from firebase_admin import firestore

def preload_school_data():
    print("📦 Preloading all school data into Firestore (collection: schoolapi)...")

    db = firestore.client()
    dataset_id = "d_688b934f82c1059ed0a6993d2a829089"
    url = f"https://data.gov.sg/api/action/datastore_search?resource_id={dataset_id}&limit=1000"

    response = requests.get(url)
    if not response.ok:
        print("❌ Failed to fetch school data:", response.status_code)
        return

    records = response.json()["result"]["records"]

    for record in records:
        school_name = record.get("school_name", "Unnamed School")
        # Safe Firestore document ID
        doc_id = school_name.replace("/", "_").replace(".", "").strip()

        db.collection("schoolapi").document(doc_id).set(record, merge=True)

    print(f"✅ Preloaded {len(records)} full school records into Firestore collection `schoolapi`.")
