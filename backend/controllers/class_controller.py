# controllers/class_controller.py

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import firestore
from services.firebase_auth import get_current_user

router = APIRouter()
db = firestore.client()

@router.get("/myclasses")
def get_my_classes(user=Depends(get_current_user)):
    uid = user["uid"]
    print(f"🔍 Looking for classes with teacherId or subteachers containing: {uid}")

    classes_ref = db.collection("class")

    form_teacher_query = classes_ref.where("teacherId", "==", uid).stream()
    sub_teacher_query = classes_ref.where("subteachers", "array_contains", uid).stream()
    result = []
    seen = set()

    for doc in form_teacher_query:
        data = doc.to_dict()
        print(f"✅ Found as Form Teacher: {data.get('name')}")
        data["id"] = doc.id
        data["role"] = "Form Teacher"
        result.append(data)
        seen.add(doc.id)

    for doc in sub_teacher_query:
        if doc.id not in seen:
            data = doc.to_dict()
            print(f"✅ Found as Sub Teacher: {data.get('name')}")
            data["id"] = doc.id
            data["role"] = "Teacher"
            result.append(data)

    print(f"📦 Total classes returned: {len(result)}")
    return result

@router.get("/classbyname/{classname}")
def get_class_by_name(classname: str, user=Depends(get_current_user)):
    class_ref = db.collection("class").where("name", "==", classname).limit(1).stream()
    for doc in class_ref:
        return doc.to_dict()
    raise HTTPException(status_code=404, detail="Class not found")

@router.get("/classbynamewithid/{classname}")
def get_class_by_name_with_id(classname: str, user=Depends(get_current_user)):
    class_ref = db.collection("class").where("name", "==", classname).limit(1).stream()
    for doc in class_ref:
        return doc.to_dict() | {"id": doc.id}
    raise HTTPException(status_code=404, detail="Class not found")

@router.get("/class/{class_id}")
def get_class_by_id(class_id: str, user=Depends(get_current_user)):
    class_doc = db.collection("class").document(class_id).get()
    if not class_doc.exists:
        raise HTTPException(status_code=404, detail="Class not found")

    return class_doc.to_dict() | {"id": class_doc.id}

@router.get("/classesof/{user_id}")
def get_classes_of_user(user_id: str, user=Depends(get_current_user)):
    print(f"🔍 Looking for classes for user ID: {user_id}")
    classes_ref = db.collection("class")

    form_teacher_query = classes_ref.where("teacherId", "==", user_id).stream()
    sub_teacher_query = classes_ref.where("subteachers", "array_contains", user_id).stream()

    result = []
    seen = set()

    for doc in form_teacher_query:
        data = doc.to_dict()
        data["id"] = doc.id
        data["role"] = "Form Teacher"
        result.append(data)
        seen.add(doc.id)

    for doc in sub_teacher_query:
        if doc.id not in seen:
            data = doc.to_dict()
            data["id"] = doc.id
            data["role"] = "Teacher"
            result.append(data)

    print(f"📦 Total classes returned for {user_id}: {len(result)}")
    return result
