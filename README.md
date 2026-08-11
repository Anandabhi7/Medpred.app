# 🏥 MedPredictor Advanced AI Healthcare Platform

> **Next-Generation Clinical AI Portal for Machine-Learning Disease Diagnostics, Real-Time openFDA Pharmacology, 24/7 MedAssist AI, and Evidence-Based Health Risk Assessment.**

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)
![scikit-learn](https://img.shields.io/badge/scikit--learn-Ensemble_97.1%25-F7931E?style=for-the-badge&logo=scikit-learn)
![openFDA](https://img.shields.io/badge/openFDA-Live_API-blue?style=for-the-badge)

---

## 🌟 Key Features & Capabilities

### 1. 🩺 AI Symptom Analyzer & Adaptive Triage (`/analyzer`)
- **Machine Learning Diagnostic Engine**: Predicts across **49 diseases** using a scikit-learn Random Forest ensemble trained on the **DDXPlus clinical dataset**.
- **NLP Natural Language Symptom Extractor**: Patients can describe symptoms in plain text (e.g., *"I woke up with a sharp throbbing headache and chills..."*) and AI automatically extracts clinical symptom tokens.
- **Ada Health-Style Adaptive Refinement**: Asks targeted follow-up questions to refine diagnostic precision and eliminate false positives.
- **K Health-Style "Patients Like You" Case Match**: Compares patient demographics (Age, Gender, Duration) against an **8,800 clinical record cohort**.
- **Downloadable Clinical Diagnostic Reports**: Generates formal `.txt` medical diagnostic summary reports for healthcare providers.
- **Google Maps Specialist Referral**: Automatically maps predicted conditions to recommended specialists (*Cardiologist, Neurologist, Pulmonologist, Gastroenterologist, Endocrinologist, General Physician*) with direct Google Maps locator links.

### 2. 🤖 MedAssist AI (24/7 Global Healthcare Assistant)
- **Global Floating Widget**: Available on the bottom-right corner across **every page of the application**.
- **Real US openFDA API Integration**: Queries `api.fda.gov` in real-time for official medication indications, adverse reactions, side effects, and boxed warnings.
- **Generative Gemini / Medical LLM Integration**: Formats empathetic, medically structured guidance.
- **Structured Clinical Response Cards**: Displays color-coded triage badges (`🔴 EMERGENCY TRIAGE`, `💊 PHARMACOLOGY PROFILE`, `🟡 PHYSICIAN CONSULTATION`, `🍏 NUTRITION PROTOCOL`, `🟢 GENERAL HEALTH`).

### 3. 🧮 Unified Clinical Health Tools Hub (`/tools`)
- 🫀 **ASCVD Heart Risk Score**: Calculates 10-year cardiovascular risk % using the official ACC/AHA clinical point equation.
- 🍬 **ADA Diabetes Risk Score**: Evaluates Type 2 diabetes / prediabetes risk based on American Diabetes Association guidelines.
- 🥗 **TDEE & Macro Estimator**: Computes Total Daily Energy Expenditure & protein/carb/fat split tailored to fitness goals.
- 💧 **Hydration Estimator**: Calculates daily fluid requirements based on body mass, physical exercise, and climate.
- ⚖️ **Interactive BMI Calculator**: Features dual-slider inputs, WHO classification spectrum, and customized nutrition/exercise recommendations.
- 💊 **openFDA Drug Interaction Checker**: Screens multiple drug combinations against a database of **5,000+ clinical drug interaction pairs**.

### 4. 🔒 Authentication & Account Management
- **JWT Session Security**: Secure user registration, password hashing (Bcrypt), login, and persistent session state.
- **Pre-filled Patient Profile**: Automatically pre-fills Age, Gender, Height, and Weight across all diagnostic tools.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Web App** | Next.js 16 (App Router), React 19, Tailwind CSS, Chart.js, Lucide Icons, Axios, Zustand |
| **Backend API Engine** | FastAPI (Python 3.11+), Uvicorn, SQLAlchemy, PyJWT, Passlib, Pydantic |
| **Machine Learning** | scikit-learn (RandomForestClassifier ensemble), pandas, joblib |
| **Database** | SQLite (`medpredictor.db`) |
| **External APIs** | US openFDA REST API (`api.fda.gov`), Google Gemini LLM API, Google Maps Locator API |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & `npm`

### 1. Backend Setup (FastAPI)
```bash
# Clone the repository
git clone https://github.com/Anandabhi7/Medpred.app.git
cd Medpred.app

# Create & activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
python main.py
```
> Backend runs at: **`http://127.0.0.1:5000`**

### 2. Frontend Setup (Next.js)
```bash
# Open a new terminal in project root
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
> Web Portal runs at: **`http://localhost:3000`**

---

## 🔌 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predict` | Runs ML disease diagnostic prediction with Differential Radar & Ada Triage |
| `POST` | `/api/adaptive-questions` | Generates 3 targeted follow-up clinical questions based on selected symptoms |
| `POST` | `/api/extract-symptoms` | Extracts clinical symptom tokens from natural language text |
| `POST` | `/api/chatbot` | MedAssist AI endpoint (openFDA + Gemini AI + Doctor referral) |
| `POST` | `/api/check-drug-interactions` | Checks drug combinations against 5,000+ interaction dataset |
| `POST` | `/api/calculators/heart-risk` | Calculates ACC/AHA 10-Year ASCVD Cardiovascular Risk % |
| `POST` | `/api/calculators/diabetes-risk` | Calculates ADA Prediabetes / Diabetes Risk Score |
| `POST` | `/api/calculators/bmi` | Calculates Body Mass Index and health risk tier |
| `POST` | `/api/calculators/macro-tdee` | Calculates TDEE calories and macronutrient distribution |
| `POST` | `/api/auth/register` | Registers a new user account |
| `POST` | `/api/auth/login` | Authenticates user and returns JWT access token |

---

## 📄 License & Disclaimer

**Medical Disclaimer**: MedPredictor Advanced provides informational health guidance and machine-learning risk predictions for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. In a medical emergency, call emergency services immediately (108 / 112 / 911).
