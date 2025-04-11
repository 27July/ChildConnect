
# ChildConnect

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

> A secure mobile app connecting parents, teachers, and children in an educational ecosystem.  
> Built with **React Native**, **FastAPI**, and **Firebase**.
> Built for **NTU SC2006 Software Engineer** module

---

## 🧠 Overview

**ChildConnect** is a feature-rich mobile application designed to streamline communication and collaboration between parents, teachers, and children. It empowers safe, real-time monitoring and supports educational and administrative functions within schools or childcare settings.

---

## ⚙️ Architecture

### Frontend
- **React Native with Expo** – Cross-platform mobile development
- **NativeWind** – Tailwind CSS for styling
- **Expo Router** – File-based routing
- **Firebase Auth** – Secure login and session management

### Backend
- **FastAPI** – High-performance Python backend
- **Firebase Admin SDK** – Admin access to authentication, database
- **Firestore** – Realtime NoSQL database
- **Google Cloud Services** – Speech recognition, TTS, translation
- **Cloudinary** – Media storage (images, documents)

---

## ✨ Features

### 👨‍👩‍👧 For Parents
- 🔍 Real-time child tracking
- 🧒 Child Mode with PIN-secure access
- 📚 Homework, attendance & academic monitoring
- 🗣️ Direct multilingual messaging with teachers
- 📁 Medical & academic documentation access

### 👩‍🏫 For Teachers
- 🏫 Class & student management
- 💬 Messaging with parents
- 📈 Grade recording & homework posting
- 📋 Notes and performance documentation

### 🧒 For Children
- 📖 View homework tasks
- 📍 Passive location tracking when in Child Mode

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (v18+)
- Python 3.10+
- Firebase account
- Google Cloud Platform account

### 📱 Frontend Setup

```bash
git clone https://github.com/yourusername/ChildConnect.git
cd ChildConnect
npm install
npx expo start
```

### 🖥️ Backend Setup

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env based on .env.example
# Add Firebase service account credentials and config

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🔌 API Overview

ChildConnect exposes FastAPI endpoints for:

- ✅ User registration & login
- 📍 Child location tracking
- 📝 Homework and academic records
- 🗣️ Speech-to-text & text-to-speech
- 🌐 Translation (Google Cloud Translation API)

---

## 🔐 Firebase Configuration

To set up Firebase:

1. Create a Firebase project
2. Enable Email/Password authentication
3. Set up Firestore & Storage
4. Generate service account key for server usage
5. Add config to `.env`

---

## 📁 Project Structure

```
ChildConnect/
│
├── app/               # Screens organized by role (Parent, Teacher, Child)
├── components/        # Reusable UI components
├── backend/           # FastAPI backend
├── assets/            # Static images, icons, logos
└── utils/             # Utility functions & configuration
```

---

## 📝 Development Notes

- Uses **Expo Location API** for real-time tracking
- Implements **PIN-based Child Mode exit**
- Chat is **auto-translated** based on selected language
- Voice features use **Google Speech & Text-to-Speech APIs**
- Role-based navigation is handled via **Expo Router**

---

## 👥 Contributors

- [Tan Yi Jun](https://github.com/whyzaac)
- [Wee Zi Hao](https://github.com/27July)
- [Sivaguruanathan Keerthivasan](https://github.com/keerthivasan2002)
- Edwin Tan Yu Qi
- Kumar Advaith


---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

