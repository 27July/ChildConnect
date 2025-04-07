    import firebase_admin
    from firebase_admin import credentials, firestore

    # 🔐 Initialize Firebase Admin
    cred = credentials.Certificate("../backend/serviceAccountKey.json")  # adjust path as needed
    firebase_admin.initialize_app(cred)

    db = firestore.client()

    def add_class():
        class_data = {
            #Change this values
            "name": "3B",
            "schoolname": "RIVERVALE PRIMARY SCHOOL",
            "teacherId": "2c5YlCJn5GTtr72BqpIHsgoHWgm2",
            "children": [
                "KLGLUQisSOWi5FXjehJm",
            ],
            "homework" : [],
            "subteachers": [],

        }

        # 🔹 Optional: set a fixed class ID like the class name (e.g., "1E4")
        # db.collection("class").document("1E4").set(class_data)

        # 🔹 Or let Firestore auto-generate a document ID
        db.collection("class").add(class_data)

        print("✅ Class added successfully!")

    if __name__ == "__main__":
        add_class()
