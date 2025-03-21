import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer
from typing import Dict
import os

# Load Firebase Service Account Key
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, "..", "serviceAccountKey.json")

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

# HTTP Bearer Token Security
bearer_scheme = HTTPBearer()

class FirebaseAuthService:
    @staticmethod
    def verify_token(token: str) -> Dict:
        """
        Verifies Firebase ID token and extracts user info.
        """
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid Firebase token")

# FastAPI Dependency for Authentication
def get_current_user(token: str = Security(bearer_scheme)):
    """
    Extracts user info from Firebase token.
    """
    return FirebaseAuthService.verify_token(token.credentials)
