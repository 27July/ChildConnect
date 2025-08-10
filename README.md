<h1 align="center">ChildConnect🏫</h1>

## About the Project:
ChildConnect is a cross-platform mobile application designed to streamline communication between educators and parents for the wellbeing of their children. It offers a dependable solution for tracking children's progress while fully supporting both educational and administrative activities within the school environment. A full list of features that we provide are avaliable [here](#features).

## Project Status:
✅ Development Fully Completed

**IMPORTANT**<br>
<strong>Note that this project was developed using Expo SDK 52. As a result, some users may experience compatibility issues when attempting to run the app with the Expo Go application, as SDK 52 is not fully supported in newer versions of Expo Go. There are currently no plans to take this project into production. You may wish to fork the [`stablity`](https://github.com/27July/ChildConnect/tree/stablity) branch instead of [`main`](https://github.com/27July/ChildConnect/tree/main) as `main` is currently unstable.</strong>

## Technology and Tools:
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) 
[![Python](https://img.shields.io/badge/python-3670A0?style=plastic&logo=python&logoColor=ffdd54)](https://www.python.org/) 
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=plastic&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) 
[![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=plastic&logo=react&logoColor=%2361DAFB)](https://reactnative.dev/) 
[![Expo](https://img.shields.io/badge/expo-1C1E24?style=plastic&logo=expo&logoColor=#D04A37)](https://expo.dev/) 
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=plastic&logo=fastapi)](https://fastapi.tiangolo.com/) 
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=plastic&logo=firebase&logoColor=black)](https://firebase.google.com/) 
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=plastic&logo=cloudinary&logoColor=white)](https://cloudinary.com/) 
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?style=plastic&logo=google-cloud&logoColor=white)](https://cloud.google.com/)

## Demo Video: 
Full screenshots of the project can be found within our documentation [here](https://github.com/27July/ChildConnect/tree/main/ChildConnect-documentation)
although we recommend watching the demo video for a more comprehensive understanding.
<br>
<p align="center">
  <a href="https://www.youtube.com/watch?v=PAgPX3SsDjc">
    <img src="https://img.youtube.com/vi/PAgPX3SsDjc/0.jpg" alt="Watch the demo" />
  </a>
</p>

## Getting Started:
If you’d like to run this project on your own, follow the steps below to set up both the frontend and backend locally.
> **Note:** You may wish to fork the [`stablity`](https://github.com/27July/ChildConnect/tree/stablity) branch instead of [`main`](https://github.com/27July/ChildConnect/tree/main) as `main` is currently unstable.

### Prerequisites🔧:
Make sure you have the following installed:
- Node.js (v18 or newer)
- Python (v3.10 or newer)
- A Firebase account (with a service account and Firestore project set up)
- A Google Cloud Platform account (for Google Translate and other APIs)
### Frontend Setup📱(React Native + Expo):
Make sure you have the Expo Go app installed on your mobile device if you're testing on a physical phone. (Note that this project was developed on SDK52)
```bash
# Clone the repository
git clone https://github.com/yourusername/ChildConnect.git
cd ChildConnect

# Install frontend dependencies
npm install

# Start the Expo development server
npx expo start
```
### Backend Setup🖥️(FastAPI):
Do note that both your frontend and backend setups have to be connected to the same network. A script has been written to enable the backend to utilise your network IP instead of the local IP.
```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Create a .env file from the provided example
cp .env.example .env  # Use 'copy .env.example .env' on Windows

# Add Firebase service account credentials and any required API keys to the .env file
# Checkout the documentation provided by Firebase on instructions for how to setup firebase

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
If anything is still unclear, feel free to contact us or refer to the documentation.
### Project Structure📁:

```
ChildConnect/
│
├── app/               # Screens organized by role (Parent, Teacher, Child)
├── components/        # Reusable UI components
├── backend/           # FastAPI backend
├── assets/            # Static images, icons, logos
└── utils/             # Utility functions & configuration
```
### API Overview:
ChildConnect exposes FastAPI endpoints for:
- User registration & login
- Child location tracking
- Homework and academic records
- Speech-to-text & text-to-speech
- Translation (Google Cloud Translation API)
You may find this useful for future development.

### External APIs and Datasets Used
- Cloudinary [Media Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- Data.gov.sg [MOE School Directory and Information](https://data.gov.sg/collections/457/view)
- Google Firebase [Firebase Authentication and Firestore](https://firebase.google.com/docs/auth)

## Features:
### For Parents👨‍👩‍👧
- Real-time child tracking
- Child Mode with PIN-secure access
- Homework, attendance & academic monitoring
- Direct multilingual messaging with teachers
- Medical & academic documentation access
- Quick access to essential school information
### For Teachers👩‍🏫
- Class & student management
- Messaging with parents
- Grade recording & homework posting
- Notes and performance documentation
### For Children🧒
- View homework tasks
- Passive location tracking when in Child Mode

## 🧾 Project Retrospective

### What Went Well✅ 
- Successfully delivered the product on schedule.
- Rapid prototyping enabled quick testing and iteration of features.
- The UI was designed for clarity and ease of use.
- Documentation was thorough and consistently maintained.

### What Could Be Improved🛠️
- Faced initial challenges implementing the child tracking functionality.
- Encountered issues during the setup of Google Cloud Run.
- Parts of the codebase could benefit from refactoring for improved structure and clarity.
- Dependency management could be improved for easier setup and fewer version conflicts.

### Lessons Learned🎓
- Integrating third-party services (e.g. Cloud Run) earlier in development helps surface configuration issues sooner.
- Investing time in UI mockups early on greatly improved usability and feedback quality.
- Writing modular, maintainable code from the start helps reduce technical debt.

### Possible Action Items / Next Steps🔄
- Refactor key areas of the codebase for better readability and maintainability.
- Develop internal setup guides for features like child tracking and Google Cloud Run.
- Adopt a consistent style guide or linter to improve code quality across the team.
- Upgrade to SDK53

## Contributors 👥

| Name                        | GitHub Profile                                   | Contact                                       |
|-----------------------------|--------------------------------------------------|-----------------------------------------------|
| Wee Zi Hao                  | [27July](https://github.com/27July)              | [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/wee-zi-hao) [![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:weezihao@gmail.com) |
| Tan Yi Jun                  | [whyzaac](https://github.com/whyzaac)            | -                                             |
| Sivaguruanathan Keerthivasan | [keerthivasan2002](https://github.com/keerthivasan2002) | -                                             |
| Edwin Tan Yu Qi            | -                                                | -                                             |
| Kumar Advaith              | -                                                | -                                             |
