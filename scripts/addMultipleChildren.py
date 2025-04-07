import firebase_admin
from firebase_admin import credentials, firestore
import random

# 🔐 Initialize Firebase Admin SDK
cred = credentials.Certificate("../backend/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# 🔗 Get Firestore client
db = firestore.client()

# ✅ Name Pools
first_names = [
    "Lucas", "Emma", "Aiden", "Isla", "Noah", "Olivia", "Ethan", "Chloe",
    "Jayden", "Mia", "Liam", "Sophie", "Ryan", "Charlotte", "Isaac", "Grace",
    "Nathan", "Alyssa", "Zachary", "Sarah", "Leo", "Ella", "Caleb", "Emily",
    "Dylan", "Hannah", "Ian", "Nicole", "Jacob"
]

last_names = [
    "Tan", "Lim", "Lee", "Ng", "Chua", "Goh", "Teo", "Wong", "Koh", "Yeo",
    "Ong", "Toh", "Sim", "Seah", "Liew", "Phua", "Lau", "Chan", "Foo", "Low"
]

def generate_random_name():
    first = random.choice(first_names)
    last = random.choice(last_names)
    return f"{first} {last}"

def add_random_children(n=29):
    for i in range(n):
        full_name = generate_random_name()

        child_data = {
            "class": "1A",
            "fatherid": "heyFPfrs5QOBaySyTNVXVBs9fJE3",
            "fathername": "Placeholder Tan",
            "motherid": "heyFPfrs5QOBaySyTNVXVBs9fJE3",
            "mothername": "Placeholder Tan",
            "name": full_name,
            "documents": [],
            "profilepic": "",
            "grade": "Primary 1",
            "school": "ANDERSON PRIMARY SCHOOL"
        }

        db.collection("children").add(child_data)
        print(f"✅ Added child: {full_name}")

# ✅ Run it
if __name__ == "__main__":
    add_random_children(29)
