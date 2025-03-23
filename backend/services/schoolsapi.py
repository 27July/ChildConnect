import requests
from firebase_admin import firestore

def preload_school_data():
    print("📦 Preloading school data into Firestore...")

    db = firestore.client()
    dataset_id = "d_688b934f82c1059ed0a6993d2a829089"
    url = "https://data.gov.sg/api/action/datastore_search?resource_id="  + dataset_id 

    response = requests.get(url)
    if not response.ok:
        print("❌ Failed to fetch school data:", response.status_code)
        return

    records = response.json()["result"]["records"]
    for record in records:
        school_name = record["school_name"]
        db.collection("schools").document(school_name).set({
            "name": school_name
        }, merge=True)  # merge=True so it won’t overwrite existing fields

    print(f"✅ Preloaded {len(records)} schools into Firestore.")
