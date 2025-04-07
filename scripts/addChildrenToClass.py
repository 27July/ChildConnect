import firebase_admin
from firebase_admin import credentials, firestore

# 🔐 Initialize Firebase Admin
cred = credentials.Certificate("../backend/serviceAccountKey.json")  # Adjust path
firebase_admin.initialize_app(cred)

db = firestore.client()

# 📚 Class details
class_name = "1A"
school_name = "ANDERSON PRIMARY SCHOOL"

# 🧒 Children IDs to add
new_child_ids = [
    "4MLlujQ35RUbcd6i9ry7", "BUkbnfb0qHKvw2HCxWAw", "DVtwoz5IBWgeFCfOPOSy",
    "DqPLrqCCVerNfp66SGq0", "EPQHJbd2I1wPykm0fnBT", "EuVIW3Zfb34Fz0dOiC27",
    "HAe0PKy58w7aXNeGd1dZ", "Hu0agO9VU25RjXoqGOPJ", "M8p2IaEWh48ln3YVIPhL",
    "MJHUBA8gzS1VFtfci9Iu", "Myo8YkhmEUhZh1n5SWn0", "OMN98gMNt8ayJInTCAEJ",
    "PteIPfHhjnFNZjxNORbz", "QYqxRxPwu9ymkHVI2xIM", "RxhOTsRcQ1Fuc7RQs9c7",
    "Z7LSUPoUDdYJmdFJF8aP", "Zmtxuv3sn9m1A2hbJwqr", "aA2cC6yHHq6u0aEve0Fr",
    "bjEyyPmbaCMFmp888zfc", "cKwABh6Zb1mq0jEuq04K", "emDaetpkVabFrRfRiU8X",
    "f8205uk3zET8xNP7D5TP", "jPLTJc3du49GjenPvlTa", "jZwG66etXq5tru0umg6m",
    "le0QeJoUgmvajQx5SnBt", "n6lFNK7p6Q22V8aGHEc5", "nroOScpeQpOg3NEhKhpE",
    "sZhp5ZuKAAl6MvEGOWr1", "tharnMZDlhoALXqiZEgU"
]

def update_class_with_children():
    # 🔍 Query class document by name and school
    class_ref = db.collection("class").where("name", "==", class_name).where("schoolname", "==", school_name).limit(1)
    results = class_ref.get()

    if not results:
        print("❌ Class not found.")
        return

    doc = results[0]
    doc_ref = doc.reference
    doc_data = doc.to_dict()

    existing_children = doc_data.get("children", [])

    # ➕ Add new children without duplicates
    updated_children = list(set(existing_children + new_child_ids))

    # 🔄 Update Firestore
    doc_ref.update({
        "children": updated_children
    })

    print(f"✅ Updated class '{class_name}' with {len(new_child_ids)} new children.")

# ✅ Run it
if __name__ == "__main__":
    update_class_with_children()
