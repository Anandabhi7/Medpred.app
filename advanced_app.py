"""
MedPredictor Advanced Flask Backend v2.1 - COMPLETE
Complete healthcare AI application with advanced chatbot integration
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
import pickle
import joblib
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import logging
from werkzeug.exceptions import RequestEntityTooLarge
import traceback
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Enable CORS for all routes
CORS(app, origins=['*'])

# Global variables for data and models
symptoms_data = []
diseases_data = []
ml_model = None
symptom_to_index = {}
chatbot_sessions = {}  # Store user sessions

# COMPLETE: 194 symptoms database
SAMPLE_SYMPTOMS = [
    # General Symptoms
    'fever', 'headache', 'fatigue', 'weakness', 'dizziness', 'fainting', 'sweating', 'chills',
    'night_sweats', 'weight_loss', 'weight_gain', 'loss_of_appetite', 'increased_appetite',
    'dehydration', 'excessive_thirst', 'frequent_urination', 'decreased_urination',
    
    # Respiratory Symptoms
    'cough', 'shortness_of_breath', 'difficulty_breathing', 'wheezing', 'chest_pain',
    'chest_tightness', 'persistent_cough', 'dry_cough', 'productive_cough', 'coughing_blood',
    'sore_throat', 'throat_pain', 'hoarseness', 'runny_nose', 'stuffy_nose', 'sneezing',
    'sinus_pressure', 'post_nasal_drip', 'voice_changes', 'throat_clearing',
    
    # Cardiovascular Symptoms
    'palpitations', 'irregular_heartbeat', 'rapid_heartbeat', 'slow_heartbeat',
    'high_blood_pressure', 'low_blood_pressure', 'chest_pressure', 'heart_murmur',
    'swelling_in_legs', 'leg_swelling', 'ankle_swelling', 'foot_swelling', 'edema',
    
    # Gastrointestinal Symptoms
    'nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal_pain', 'stomach_pain',
    'heartburn', 'acid_reflux', 'indigestion', 'bloating', 'gas', 'flatulence', 'burping',
    'stomach_cramps', 'intestinal_cramps', 'blood_in_stool', 'black_stool', 'pale_stool',
    'difficulty_swallowing', 'painful_swallowing', 'loss_of_taste', 'metallic_taste',
    
    # Neurological Symptoms
    'memory_problems', 'confusion', 'disorientation', 'difficulty_concentrating',
    'brain_fog', 'seizures', 'tremors', 'muscle_twitching', 'numbness', 'tingling',
    'pins_and_needles', 'burning_sensation', 'loss_of_coordination', 'balance_problems',
    'speech_difficulties', 'slurred_speech', 'loss_of_consciousness', 'blackouts',
    
    # Musculoskeletal Symptoms
    'muscle_pain', 'muscle_weakness', 'muscle_cramps', 'muscle_spasms', 'joint_pain',
    'joint_stiffness', 'joint_swelling', 'back_pain', 'neck_pain', 'shoulder_pain',
    'knee_pain', 'hip_pain', 'elbow_pain', 'wrist_pain', 'ankle_pain', 'bone_pain',
    'muscle_aches', 'body_aches', 'stiff_neck', 'limited_range_of_motion',
    
    # Skin Symptoms
    'rash', 'skin_rash', 'itching', 'itchy_skin', 'dry_skin', 'oily_skin', 'acne',
    'hives', 'eczema', 'psoriasis', 'bruising', 'easy_bruising', 'discoloration',
    'pale_skin', 'yellow_skin', 'blue_skin', 'red_skin', 'skin_lesions', 'ulcers',
    'blisters', 'bumps', 'moles_changes', 'hair_loss', 'excessive_hair_growth',
    
    # Eye Symptoms
    'eye_pain', 'eye_redness', 'eye_irritation', 'dry_eyes', 'watery_eyes',
    'blurred_vision', 'double_vision', 'vision_loss', 'light_sensitivity', 'eye_discharge',
    'eye_swelling', 'droopy_eyelids', 'bulging_eyes', 'flashing_lights', 'floaters',
    'night_blindness', 'color_blindness', 'eye_twitching',
    
    # Ear Symptoms
    'ear_pain', 'earache', 'ear_discharge', 'hearing_loss', 'ringing_in_ears', 'tinnitus',
    'ear_fullness', 'ear_pressure', 'dizziness_from_ear', 'vertigo', 'balance_issues',
    'ear_infection_symptoms', 'itchy_ears',
    
    # Mental Health Symptoms
    'anxiety', 'depression', 'mood_swings', 'irritability', 'restlessness', 'agitation',
    'panic_attacks', 'fear', 'worry', 'sadness', 'hopelessness', 'guilt', 'worthlessness',
    'loss_of_interest', 'social_withdrawal', 'insomnia', 'excessive_sleeping', 'nightmares',
    
    # Reproductive/Urogenital Symptoms
    'painful_urination', 'burning_urination', 'blood_in_urine', 'cloudy_urine',
    'strong_urine_odor', 'pelvic_pain', 'genital_pain', 'discharge', 'irregular_periods',
    'heavy_periods', 'missed_periods', 'painful_periods', 'breast_pain', 'breast_swelling',
    
    # Sleep Related Symptoms
    'difficulty_falling_asleep', 'difficulty_staying_asleep', 'early_waking',
    'excessive_daytime_sleepiness', 'sleep_disturbances', 'snoring', 'sleep_apnea_symptoms',
    'restless_legs', 'teeth_grinding', 'sleep_walking',
    
    # Temperature Related
    'hot_flashes', 'cold_intolerance', 'heat_intolerance', 'excessive_sweating',
    'cold_hands_feet', 'flushing', 'goosebumps',
    
    # Digestive Specific
    'loss_of_bowel_control', 'urgency_to_defecate', 'incomplete_bowel_movements',
    'mucus_in_stool', 'foul_smelling_stool', 'greasy_stool', 'floating_stool',
    
    # Additional Symptoms
    'lymph_node_swelling', 'enlarged_lymph_nodes', 'swollen_glands', 'neck_stiffness',
    'jaw_pain', 'tooth_pain', 'toothache', 'gum_pain', 'mouth_sores', 'dry_mouth',
    'excessive_saliva', 'bad_breath', 'tongue_problems', 'lip_swelling',
    
    # Specialized Symptoms
    'phantom_pain', 'referred_pain', 'radiating_pain', 'sharp_pain', 'dull_pain',
    'throbbing_pain', 'stabbing_pain', 'burning_pain', 'cramping_pain', 'aching_pain'
]

SAMPLE_DISEASES = [
    'Common Cold', 'Influenza', 'COVID-19', 'Pneumonia', 'Bronchitis', 'Asthma',
    'Hypertension', 'Diabetes Type 2', 'Migraine', 'Tension Headache', 'Gastritis',
    'Food Poisoning', 'Urinary Tract Infection', 'Kidney Stones', 'Arthritis',
    'Fibromyalgia', 'Depression', 'Anxiety Disorder', 'Allergic Reaction', 'Sinusitis',
    'Tuberculosis', 'Malaria', 'Dengue Fever', 'Typhoid', 'Hepatitis', 'Anemia',
    'Heart Disease', 'Stroke', 'Epilepsy', 'Thyroid Disorder', 'Osteoporosis',
    'COPD', 'Acid Reflux', 'IBS', 'Crohns Disease', 'Ulcerative Colitis', 'Celiac Disease',
    'Lupus', 'Multiple Sclerosis', 'Parkinsons Disease', 'Alzheimers Disease',
    'Bipolar Disorder', 'Schizophrenia', 'PTSD', 'OCD', 'ADHD', 'Sleep Apnea',
    'Chronic Fatigue Syndrome', 'Lyme Disease', 'Mononucleosis', 'Shingles',
    'Chickenpox', 'Measles', 'Mumps', 'Whooping Cough', 'Meningitis', 'Sepsis',
    'Appendicitis', 'Gallstones', 'Pancreatitis', 'Liver Disease', 'Cirrhosis',
    'Kidney Disease', 'Bladder Infection', 'Prostate Problems', 'Endometriosis',
    'PCOS', 'Osteoarthritis', 'Rheumatoid Arthritis', 'Gout', 'Tendinitis', 'Bursitis',
    'Carpal Tunnel Syndrome', 'Sciatica', 'Herniated Disc', 'Scoliosis', 'Fracture',
    'Concussion', 'Vertigo', 'Tinnitus', 'Glaucoma', 'Cataracts', 'Macular Degeneration',
    'Diabetic Retinopathy', 'Eczema', 'Psoriasis', 'Acne', 'Rosacea', 'Skin Cancer',
    'Melanoma', 'Basal Cell Carcinoma', 'Varicose Veins', 'Blood Clots', 'High Cholesterol',
    'Atrial Fibrillation', 'Heart Failure', 'Coronary Artery Disease', 'Peripheral Artery Disease',
    'Aortic Stenosis', 'Mitral Valve Prolapse', 'Pericarditis', 'Myocarditis'
]

# COMPLETE: Specialist doctors database by city
SPECIALIST_DOCTORS = {
    'mumbai': {
        'cardiologist': ['Dr. Rajesh Sharma - Kokilaben Hospital', 'Dr. Priya Mehta - Lilavati Hospital', 'Dr. Amit Kumar - Hinduja Hospital', 'Dr. Sunita Rao - Breach Candy Hospital'],
        'neurologist': ['Dr. Amit Kumar - Jaslok Hospital', 'Dr. Sunita Rao - Breach Candy Hospital', 'Dr. Vikram Singh - Tata Memorial Hospital', 'Dr. Anjali Desai - BYL Nair Hospital'],
        'pulmonologist': ['Dr. Vikram Singh - Tata Memorial Hospital', 'Dr. Anjali Desai - BYL Nair Hospital', 'Dr. Ravi Patel - Hinduja Hospital', 'Dr. Meera Shah - JJ Hospital'],
        'gastroenterologist': ['Dr. Ravi Patel - Hinduja Hospital', 'Dr. Meera Shah - JJ Hospital', 'Dr. Suresh Gupta - KEM Hospital', 'Dr. Kavita Jain - Sion Hospital'],
        'endocrinologist': ['Dr. Suresh Gupta - KEM Hospital', 'Dr. Kavita Jain - Sion Hospital', 'Dr. Ashok Kumar - Bombay Hospital', 'Dr. Sita Devi - King Edward Memorial Hospital'],
        'general': ['Dr. Ashok Kumar - General Physician', 'Dr. Sita Devi - Family Medicine', 'Dr. Ramesh Patel - Community Health Center', 'Dr. Lakshmi Nair - Primary Care']
    },
    'delhi': {
        'cardiologist': ['Dr. Anil Sharma - AIIMS Delhi', 'Dr. Ritu Gupta - Fortis Hospital', 'Dr. Manoj Singh - Apollo Hospital', 'Dr. Deepika Rani - Max Hospital'],
        'neurologist': ['Dr. Manoj Singh - Apollo Hospital', 'Dr. Deepika Rani - Max Hospital', 'Dr. Raj Kumar - Safdarjung Hospital', 'Dr. Pooja Mittal - BLK Hospital'],
        'pulmonologist': ['Dr. Raj Kumar - Safdarjung Hospital', 'Dr. Pooja Mittal - BLK Hospital', 'Dr. Vinod Agarwal - Sir Ganga Ram Hospital', 'Dr. Neha Kapoor - Indraprastha Apollo'],
        'gastroenterologist': ['Dr. Vinod Agarwal - Sir Ganga Ram Hospital', 'Dr. Neha Kapoor - Indraprastha Apollo', 'Dr. Rakesh Jain - Maulana Azad Medical College', 'Dr. Shivani Sharma - RML Hospital'],
        'endocrinologist': ['Dr. Rakesh Jain - Maulana Azad Medical College', 'Dr. Shivani Sharma - RML Hospital', 'Dr. Ramesh Kumar - LNJP Hospital', 'Dr. Sunita Singh - GTB Hospital'],
        'general': ['Dr. Ramesh Kumar - General Physician', 'Dr. Sunita Singh - Family Medicine', 'Dr. Ashok Gupta - Community Health', 'Dr. Priya Sharma - Primary Care']
    },
    'bangalore': {
        'cardiologist': ['Dr. Suresh Rao - Narayana Hrudayalaya', 'Dr. Lakshmi Nair - Apollo Hospital', 'Dr. Krishnan Iyer - Manipal Hospital', 'Dr. Radha Kumari - Fortis Hospital'],
        'neurologist': ['Dr. Krishnan Iyer - NIMHANS', 'Dr. Radha Kumari - Manipal Hospital', 'Dr. Mohan Das - Victoria Hospital', 'Dr. Praveena Singh - Columbia Asia'],
        'pulmonologist': ['Dr. Mohan Das - Victoria Hospital', 'Dr. Praveena Singh - Columbia Asia', 'Dr. Venkat Reddy - BGS Global Hospital', 'Dr. Anita Menon - Fortis Hospital'],
        'gastroenterologist': ['Dr. Venkat Reddy - BGS Global Hospital', 'Dr. Anita Menon - Fortis Hospital', 'Dr. Santosh Kumar - St. Johns Hospital', 'Dr. Maya Shetty - Sakra Hospital'],
        'endocrinologist': ['Dr. Santosh Kumar - St. Johns Hospital', 'Dr. Maya Shetty - Sakra Hospital', 'Dr. Ravi Shankar - Baptist Hospital', 'Dr. Geetha Rao - Jayadeva Institute'],
        'general': ['Dr. Ravi Shankar - General Physician', 'Dr. Geetha Rao - Family Medicine', 'Dr. Kumar Swamy - Community Health', 'Dr. Suma Rao - Primary Care']
    },
    'chennai': {
        'cardiologist': ['Dr. Murugan Tamil - Apollo Hospital', 'Dr. Kamala Devi - Stanley Medical College', 'Dr. Selvam Raja - MIOT Hospital', 'Dr. Priya Lakshmi - Gleneagles Hospital'],
        'neurologist': ['Dr. Selvam Raja - MIOT Hospital', 'Dr. Priya Lakshmi - Gleneagles Hospital', 'Dr. Raman Kutty - SIMS Hospital', 'Dr. Janaki Ramesh - Fortis Malar'],
        'pulmonologist': ['Dr. Raman Kutty - SIMS Hospital', 'Dr. Janaki Ramesh - Fortis Malar', 'Dr. Venkatesh Babu - VHS Hospital', 'Dr. Saroja Devi - Billroth Hospital'],
        'gastroenterologist': ['Dr. Venkatesh Babu - VHS Hospital', 'Dr. Saroja Devi - Billroth Hospital', 'Dr. Krishnamurthy - RGGGH', 'Dr. Vasantha Kumari - Apollo Speciality'],
        'endocrinologist': ['Dr. Krishnamurthy - RGGGH', 'Dr. Vasantha Kumari - Apollo Speciality', 'Dr. Subramanian - Madras Medical College', 'Dr. Meera Balaji - Sri Ramachandra'],
        'general': ['Dr. Subramanian - General Physician', 'Dr. Meera Balaji - Family Medicine', 'Dr. Raja Kumar - Community Health', 'Dr. Lakshmi Devi - Primary Care']
    }
}

# FIXED: Only Police, Fire, and Ambulance
EMERGENCY_CONTACTS = {
    'Police': '100',
    'Fire Department': '101', 
    'Ambulance': '108'
}


HEALTH_INSTRUCTIONS = [
    'Always wash hands frequently with soap for at least 20 seconds',
    'Maintain social distancing of at least 6 feet from others',
    'Wear a mask when in public places',
    'Get adequate sleep of 7-9 hours daily',
    'Stay hydrated by drinking 8-10 glasses of water daily',
    'Exercise regularly for at least 30 minutes, 5 days a week',
    'Eat a balanced diet rich in fruits and vegetables',
    'Avoid smoking and limit alcohol consumption',
    'Take prescribed medications as directed by your doctor',
    'Schedule regular health check-ups and screenings'
]

class FixedMLModel:
    """FIXED ML model for better predictions"""
    
    def __init__(self):
        self.diseases = SAMPLE_DISEASES
        # Create symptom-disease mappings for better predictions
        self.symptom_disease_map = {
            'fever': ['Influenza', 'COVID-19', 'Malaria', 'Typhoid', 'Common Cold'],
            'headache': ['Migraine', 'Tension Headache', 'Hypertension', 'Sinusitis'],
            'cough': ['Common Cold', 'Bronchitis', 'Pneumonia', 'COVID-19', 'Tuberculosis'],
            'chest_pain': ['Heart Disease', 'Pneumonia', 'Asthma', 'Anxiety Disorder'],
            'shortness_of_breath': ['Asthma', 'Pneumonia', 'Heart Disease', 'COVID-19'],
            'abdominal_pain': ['Gastritis', 'Food Poisoning', 'Kidney Stones', 'Hepatitis'],
            'nausea': ['Food Poisoning', 'Gastritis', 'Migraine', 'Kidney Stones'],
            'fatigue': ['Anemia', 'Diabetes Type 2', 'Thyroid Disorder', 'Depression'],
            'dizziness': ['Hypertension', 'Anemia', 'Migraine', 'Anxiety Disorder'],
            'joint_pain': ['Arthritis', 'Dengue Fever', 'Fibromyalgia'],
            'muscle_pain': ['Influenza', 'Fibromyalgia', 'Dengue Fever'],
            'high_blood_pressure': ['Hypertension', 'Heart Disease', 'Kidney Stones'],
            'frequent_urination': ['Diabetes Type 2', 'Urinary Tract Infection'],
            'excessive_thirst': ['Diabetes Type 2', 'Kidney Stones'],
            'memory_problems': ['Depression', 'Thyroid Disorder', 'Anxiety Disorder'],
            'seizures': ['Epilepsy', 'Stroke', 'Malaria'],
            'skin_rash': ['Allergic Reaction', 'Dengue Fever', 'Typhoid']
        }
        
    def predict_proba(self, symptoms_vector, selected_symptoms):
        """FIXED: Generate realistic predictions based on actual symptoms"""
        probabilities = np.zeros(len(self.diseases))
        
        # Calculate scores based on symptom-disease relationships
        for symptom in selected_symptoms:
            if symptom in self.symptom_disease_map:
                related_diseases = self.symptom_disease_map[symptom]
                for disease in related_diseases:
                    if disease in self.diseases:
                        disease_idx = self.diseases.index(disease)
                        probabilities[disease_idx] += np.random.uniform(0.1, 0.3)
        
        # Add some random noise for other diseases
        for i in range(len(probabilities)):
            if probabilities[i] == 0:
                probabilities[i] = np.random.uniform(0.01, 0.05)
        
        # Normalize probabilities
        probabilities = probabilities / probabilities.sum()
        return probabilities
    
    def get_disease_info(self, disease_name):
        """Get comprehensive disease information"""
        precautions_map = {
            'Common Cold': [
                'Get plenty of rest and sleep',
                'Drink lots of fluids, especially warm liquids',
                'Use a humidifier to ease congestion',
                'Wash hands frequently to prevent spread'
            ],
            'Influenza': [
                'Stay home and rest for at least 24 hours after fever subsides',
                'Drink plenty of fluids to prevent dehydration',
                'Take antiviral medications if prescribed',
                'Cover coughs and sneezes with tissue or elbow'
            ],
            'COVID-19': [
                'Isolate immediately and follow local health guidelines',
                'Monitor symptoms and seek medical care if severe',
                'Wear a mask when around others',
                'Disinfect frequently touched surfaces'
            ],
            'Pneumonia': [
                'Take prescribed antibiotics exactly as directed',
                'Get plenty of rest and avoid strenuous activities',
                'Stay hydrated and use a humidifier',
                'Follow up with healthcare provider regularly'
            ],
            'Hypertension': [
                'Monitor blood pressure regularly',
                'Follow a low-sodium, heart-healthy diet',
                'Exercise regularly as recommended by doctor',
                'Take blood pressure medications as prescribed'
            ],
            'Diabetes Type 2': [
                'Monitor blood sugar levels regularly',
                'Follow a balanced diet with controlled carbohydrates',
                'Exercise regularly to help control blood sugar',
                'Take medications as prescribed by your doctor'
            ],
            'Migraine': [
                'Identify and avoid personal migraine triggers',
                'Maintain regular sleep schedule',
                'Stay hydrated and eat regular meals',
                'Consider preventive medications if frequent'
            ]
        }
        
        home_remedies_map = {
            'Common Cold': [
                'Drink warm tea with honey and lemon',
                'Gargle with warm salt water for sore throat',
                'Use saline nasal drops for congestion',
                'Apply warm compress to face for sinus pressure'
            ],
            'Influenza': [
                'Drink chicken soup for hydration and comfort',
                'Use honey to soothe throat irritation',
                'Apply cool compress to reduce fever',
                'Rest in a cool, comfortable environment'
            ],
            'COVID-19': [
                'Stay hydrated with water, herbal teas, and clear broths',
                'Use honey for cough relief (not for children under 1 year)',
                'Practice deep breathing exercises if mild symptoms',
                'Maintain good nutrition with vitamin-rich foods'
            ],
            'Pneumonia': [
                'Drink warm fluids to help loosen mucus',
                'Use a humidifier to ease breathing',
                'Apply warm compress to chest for comfort',
                'Practice controlled coughing to clear airways'
            ],
            'Hypertension': [
                'Practice deep breathing and meditation',
                'Limit caffeine and alcohol intake',
                'Maintain a healthy weight through diet and exercise',
                'Reduce stress through regular relaxation techniques'
            ],
            'Diabetes Type 2': [
                'Include cinnamon in diet for natural blood sugar control',
                'Eat small, frequent meals to avoid sugar spikes',
                'Stay physically active with regular walking',
                'Monitor portion sizes and avoid processed foods'
            ],
            'Migraine': [
                'Apply cold or warm compress to head or neck',
                'Practice relaxation techniques and stress management',
                'Maintain consistent sleep schedule',
                'Stay in a quiet, dark room during attacks'
            ]
        }
        
        default_precautions = [
            'Consult with a healthcare professional',
            'Monitor symptoms carefully',
            'Follow prescribed treatments',
            'Maintain good hygiene practices'
        ]
        
        default_remedies = [
            'Get adequate rest and sleep',
            'Stay well hydrated',
            'Eat nutritious foods',
            'Avoid smoking and alcohol'
        ]
        
        return {
            'precautions': precautions_map.get(disease_name, default_precautions),
            'home_remedies': home_remedies_map.get(disease_name, default_remedies),
            'description': f'{disease_name} is a medical condition that requires proper evaluation and treatment.'
        }

def load_data():
    """FIXED: Load symptoms and diseases data (limit to 194 symptoms)"""
    global symptoms_data, diseases_data, ml_model, symptom_to_index
    
    EXPECTED_SYMPTOM_COUNT = 194  # enforce only 194 symptoms
    
    try:
        # Load complete symptoms list
        symptoms_data = SAMPLE_SYMPTOMS.copy()  # Use copy to avoid reference issues
        diseases_data = SAMPLE_DISEASES.copy()
        
        # Remove duplicates while preserving order
        seen = set()
        symptoms_data = [x for x in symptoms_data if not (x in seen or seen.add(x))]
        
        # Trim to exactly 194 if longer
        if len(symptoms_data) != EXPECTED_SYMPTOM_COUNT:
            logger.warning(
                f"SAMPLE_SYMPTOMS has {len(symptoms_data)} items, "
                f"but expected {EXPECTED_SYMPTOM_COUNT}. "
                "Trimming to expected count."
            )
            symptoms_data = symptoms_data[:EXPECTED_SYMPTOM_COUNT]
        
        # Create symptom to index mapping
        symptom_to_index = {symptom: idx for idx, symptom in enumerate(symptoms_data)}
        
        # Load FIXED ML model
        ml_model = FixedMLModel()
        
        logger.info(f"✅ Loaded {len(symptoms_data)} symptoms and {len(diseases_data)} diseases")
        logger.info(f"✅ Sample symptoms: {symptoms_data[:5]}")  # Log first 5 for verification
        logger.info("✅ FIXED ML model loaded successfully")
        
    except Exception as e:
        logger.error(f"❌ Error loading data: {e}")
        # Fallback: first 194
        symptoms_data = SAMPLE_SYMPTOMS.copy()[:EXPECTED_SYMPTOM_COUNT]
        diseases_data = SAMPLE_DISEASES.copy()
        ml_model = FixedMLModel()
        symptom_to_index = {symptom: idx for idx, symptom in enumerate(symptoms_data)}


def create_symptom_vector(selected_symptoms):
    """Convert selected symptoms to ML model input vector"""
    vector = np.zeros(len(symptoms_data))
    for symptom in selected_symptoms:
        if symptom in symptom_to_index:
            vector[symptom_to_index[symptom]] = 1
        else:
            logger.warning(f"⚠️ Symptom '{symptom}' not found in database")
    return vector.reshape(1, -1)


def calculate_severity_urgency(disease, confidence):
    """FIXED: Calculate severity and urgency based on disease and confidence"""
    high_severity_diseases = ['pneumonia', 'covid-19', 'heart disease', 'stroke', 'tuberculosis', 'malaria']
    moderate_severity_diseases = ['influenza', 'bronchitis', 'hypertension', 'diabetes', 'asthma']
    
    disease_lower = disease.lower()
    
    # Determine severity
    if any(severe_disease in disease_lower for severe_disease in high_severity_diseases):
        severity = 'Severe'
    elif any(moderate_disease in disease_lower for moderate_disease in moderate_severity_diseases):
        severity = 'Moderate' 
    else:
        severity = 'Mild'
    
    # Determine urgency based on severity and confidence
    if severity == 'Severe' and confidence > 70:
        urgency = 'High'
    elif severity == 'Severe' and confidence > 50:
        urgency = 'Medium'
    elif severity == 'Moderate' and confidence > 80:
        urgency = 'Medium'
    else:
        urgency = 'Low'
    
    return severity, urgency

def get_specialist_for_disease(disease_name):
    """Get appropriate specialist for a disease"""
    disease_lower = disease_name.lower()
    
    if any(term in disease_lower for term in ['heart', 'cardiac', 'hypertension', 'blood pressure']):
        return 'cardiologist'
    elif any(term in disease_lower for term in ['brain', 'neurological', 'seizure', 'stroke', 'migraine', 'epilepsy']):
        return 'neurologist'
    elif any(term in disease_lower for term in ['lung', 'respiratory', 'asthma', 'pneumonia', 'bronchitis', 'tuberculosis']):
        return 'pulmonologist'
    elif any(term in disease_lower for term in ['stomach', 'digestive', 'gastritis', 'hepatitis', 'food poisoning']):
        return 'gastroenterologist'
    elif any(term in disease_lower for term in ['diabetes', 'thyroid', 'hormone', 'endocrine']):
        return 'endocrinologist'
    else:
        return 'general'

# Initialize data on startup
load_data()

# Routes
@app.route('/')
def index():
    """Serve the main application"""
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

# API Routes
@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Get all available symptoms"""
    try:
        return jsonify({
            'success': True,
            'symptoms': symptoms_data,
            'count': len(symptoms_data)
        })
    except Exception as e:
        logger.error(f"❌ Error getting symptoms: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve symptoms'
        }), 500

@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    """Get all available diseases"""
    try:
        return jsonify({
            'success': True,
            'diseases': diseases_data,
            'count': len(diseases_data)
        })
    except Exception as e:
        logger.error(f"❌ Error getting diseases: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve diseases'
        }), 500

@app.route('/api/emergency-contacts', methods=['GET'])
def get_emergency_contacts():
    """Get emergency contact numbers"""
    try:
        return jsonify({
            'success': True,
            'emergency_contacts': EMERGENCY_CONTACTS
        })
    except Exception as e:
        logger.error(f"❌ Error getting emergency contacts: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve emergency contacts'
        }), 500

@app.route('/api/health-instructions', methods=['GET'])
def get_health_instructions():
    """Get health instructions"""
    try:
        return jsonify({
            'success': True,
            'health_instructions': HEALTH_INSTRUCTIONS
        })
    except Exception as e:
        logger.error(f"❌ Error getting health instructions: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve health instructions'
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    """FIXED: Predict diseases based on symptoms"""
    try:
        data = request.get_json()
        logger.info(f"🔍 Received prediction request: {data}")
        
        if not data or 'symptoms' not in data:
            logger.error("❌ No symptoms provided in request")
            return jsonify({
                'success': False,
                'error': 'No symptoms provided'
            }), 400
        
        selected_symptoms = data['symptoms']
        
        if not selected_symptoms or len(selected_symptoms) == 0:
            logger.error("❌ Empty symptoms list provided")
            return jsonify({
                'success': False,
                'error': 'At least one symptom must be selected'
            }), 400
        
        logger.info(f"🔍 Analyzing symptoms: {selected_symptoms}")
        
        # FIXED: Create symptom vector for ML model
        symptom_vector = create_symptom_vector(selected_symptoms)
        logger.info(f"✅ Created symptom vector: shape={symptom_vector.shape}")
        
        # FIXED: Get predictions from ML model
        probabilities = ml_model.predict_proba(symptom_vector, selected_symptoms)
        logger.info(f"✅ Generated predictions: {len(probabilities)} diseases analyzed")
        
        # Create predictions list with disease info
        predictions = []
        for i, (disease, prob) in enumerate(zip(diseases_data, probabilities)):
            confidence = round(prob * 100, 1)
            severity, urgency = calculate_severity_urgency(disease, confidence)
            
            predictions.append({
                'rank': i + 1,
                'disease': disease,
                'confidence': confidence,
                'probability': float(prob),  # Convert to float for JSON serialization
                'severity': severity,
                'urgency': urgency
            })
        
        # Sort by confidence (descending) and limit to top 5
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        top_predictions = predictions[:5]
        
        # Update ranks after sorting
        for i, pred in enumerate(top_predictions):
            pred['rank'] = i + 1
        
        # FIXED: Use double quotes in f-string to avoid conflict
        prediction_summary = [f"{p['disease']} ({p['confidence']}%)" for p in top_predictions]
        logger.info(f"✅ Top 5 predictions: {prediction_summary}")
        
        # Get detailed info for top prediction
        top_disease = top_predictions[0]['disease']
        disease_info = ml_model.get_disease_info(top_disease)
        
        top_prediction_detail = {
            'disease': top_disease,
            'confidence': top_predictions[0]['confidence'],
            'severity': top_predictions[0]['severity'],
            'urgency': top_predictions[0]['urgency'],
            'description': disease_info['description'],
            'precautions': disease_info['precautions'],
            'home_remedies': disease_info['home_remedies']
        }
        
        response_data = {
            'success': True,
            'selected_symptoms': selected_symptoms,
            'predictions': top_predictions,
            'top_prediction': top_prediction_detail,
            'total_diseases_analyzed': len(diseases_data),
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"✅ Prediction completed successfully for {len(selected_symptoms)} symptoms")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': f'Failed to analyze symptoms: {str(e)}'
        }), 500

@app.route('/api/disease-lookup', methods=['POST'])
def disease_lookup():
    """Look up information about a specific disease"""
    try:
        data = request.get_json()
        disease_name = data.get('disease', '').strip()
        
        if not disease_name:
            return jsonify({
                'success': False,
                'error': 'Disease name is required'
            }), 400
        
        # Find matching disease (case insensitive)
        matching_disease = None
        for disease in diseases_data:
            if disease.lower() == disease_name.lower():
                matching_disease = disease
                break
        
        # If exact match not found, try partial match
        if not matching_disease:
            for disease in diseases_data:
                if disease_name.lower() in disease.lower() or disease.lower() in disease_name.lower():
                    matching_disease = disease
                    break
        
        if not matching_disease:
            return jsonify({
                'success': False,
                'error': f'Disease "{disease_name}" not found in our database'
            })
        
        # Get disease information
        disease_info = ml_model.get_disease_info(matching_disease)
        
        return jsonify({
            'success': True,
            'disease': matching_disease,
            'description': disease_info['description'],
            'precautions': disease_info['precautions'],
            'home_remedies': disease_info['home_remedies']
        })
        
    except Exception as e:
        logger.error(f"❌ Disease lookup error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to lookup disease information'
        }), 500

@app.route('/api/bmi-calculator', methods=['POST'])
def calculate_bmi():
    """Calculate BMI and provide health recommendations"""
    try:
        data = request.get_json()
        
        height = data.get('height')  # in cm
        weight = data.get('weight')  # in kg
        
        if not height or not weight:
            return jsonify({
                'success': False,
                'error': 'Height and weight are required'
            }), 400
        
        try:
            height = float(height)
            weight = float(weight)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Height and weight must be valid numbers'
            }), 400
        
        if height <= 0 or weight <= 0:
            return jsonify({
                'success': False,
                'error': 'Height and weight must be positive numbers'
            }), 400
        
        # Convert height from cm to meters
        height_m = height / 100
        
        # Calculate BMI
        bmi = round(weight / (height_m ** 2), 1)
        
        # Determine category and risk level
        if bmi < 18.5:
            category = 'Underweight'
            risk_level = 'Low'
        elif 18.5 <= bmi < 25:
            category = 'Normal Weight'
            risk_level = 'Low'
        elif 25 <= bmi < 30:
            category = 'Overweight'
            risk_level = 'Moderate'
        elif 30 <= bmi < 35:
            category = 'Obese Class I'
            risk_level = 'High'
        elif 35 <= bmi < 40:
            category = 'Obese Class II'
            risk_level = 'Very High'
        else:
            category = 'Obese Class III'
            risk_level = 'Extremely High'
        
        # Calculate ideal weight range (BMI 18.5-24.9)
        ideal_min = round(18.5 * (height_m ** 2), 1)
        ideal_max = round(24.9 * (height_m ** 2), 1)
        
        return jsonify({
            'success': True,
            'bmi': bmi,
            'category': category,
            'risk_level': risk_level,
            'ideal_weight_range': {
                'min': ideal_min,
                'max': ideal_max
            },
            'recommendations': {
                'diet': 'Maintain a balanced diet rich in fruits and vegetables',
                'exercise': 'Regular physical activity for at least 150 minutes per week',
                'lifestyle': 'Maintain healthy lifestyle habits and regular check-ups'
            }
        })
        
    except Exception as e:
        logger.error(f"❌ BMI calculation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate BMI'
        }), 500

@app.route('/api/drug-interactions', methods=['POST'])
def check_drug_interactions():
    """Check for drug interactions (simplified version)"""
    try:
        data = request.get_json()
        drugs = data.get('drugs', [])
        
        if len(drugs) < 2:
            return jsonify({
                'success': False,
                'error': 'At least two drugs are required for interaction check'
            }), 400
        
        # Simple mock interaction database - Replace with real drug interaction database
        known_interactions = {
            ('warfarin', 'aspirin'): {
                'severity': 'Major',
                'effect': 'Increased bleeding risk',
                'warning': 'Monitor for signs of bleeding. Consider alternative pain relief.'
            },
            ('warfarin', 'ibuprofen'): {
                'severity': 'Major',
                'effect': 'Increased bleeding risk',
                'warning': 'Avoid concurrent use. Use acetaminophen instead.'
            },
            ('metformin', 'alcohol'): {
                'severity': 'Moderate',
                'effect': 'Increased risk of lactic acidosis',
                'warning': 'Limit alcohol consumption while taking metformin.'
            },
            ('lisinopril', 'potassium'): {
                'severity': 'Moderate',
                'effect': 'Increased potassium levels',
                'warning': 'Monitor potassium levels regularly.'
            },
            ('paracetamol', 'rabeprazol'): {
                'severity': 'Minor',
                'effect': 'Minimal interaction',
                'warning': 'Generally safe to use together but monitor for effectiveness.'
            }
        }
        
        interactions_found = []
        
        # Check all drug combinations
        for i in range(len(drugs)):
            for j in range(i + 1, len(drugs)):
                drug1 = drugs[i].lower().strip()
                drug2 = drugs[j].lower().strip()
                
                # Check both combinations
                interaction_key = (drug1, drug2)
                reverse_key = (drug2, drug1)
                
                if interaction_key in known_interactions:
                    interaction = known_interactions[interaction_key].copy()
                    interaction['drug1'] = drugs[i]
                    interaction['drug2'] = drugs[j]
                    interactions_found.append(interaction)
                elif reverse_key in known_interactions:
                    interaction = known_interactions[reverse_key].copy()
                    interaction['drug1'] = drugs[j]
                    interaction['drug2'] = drugs[i]
                    interactions_found.append(interaction)
        
        # Determine safety level
        if not interactions_found:
            safety_level = 'Safe'
        elif any(i['severity'] == 'Major' for i in interactions_found):
            safety_level = 'High Risk'
        elif any(i['severity'] == 'Moderate' for i in interactions_found):
            safety_level = 'Moderate Risk'
        else:
            safety_level = 'Low Risk'
        
        return jsonify({
            'success': True,
            'interactions_found': len(interactions_found),
            'interactions': interactions_found,
            'safety_level': safety_level,
            'recommendation': 'Always consult your healthcare provider before combining medications.'
        })
        
    except Exception as e:
        logger.error(f"❌ Drug interaction check error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to check drug interactions'
        }), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """ADVANCED: Handle chatbot conversations with medical consultation flow"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        chat_history = data.get('history', [])
        
        if not user_message:
            return jsonify({
                'success': False,
                'error': 'No message provided'
            })
        
        logger.info(f"🤖 Chatbot request - Session: {session_id}, Message: {user_message}")
        
        # Initialize session if not exists
        if session_id not in chatbot_sessions:
            chatbot_sessions[session_id] = {
                'stage': 'greeting',
                'user_data': {},
                'conversation_started': datetime.now()
            }
        
        session = chatbot_sessions[session_id]
        
        # Generate response based on conversation stage
        response_data = generate_advanced_chatbot_response(user_message, session, chat_history)
        
        logger.info(f"✅ Chatbot response generated for session {session_id}")
        
        return jsonify({
            'success': True,
            'response': response_data['message'],
            'quickActions': response_data.get('quickActions', []),
            'session_stage': session['stage'],
            'collected_data': session['user_data']
        })
        
    except Exception as e:
        logger.error(f"❌ Chatbot error: {e}")
        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': 'Failed to process message. Please try again.'
        }), 500

def generate_advanced_chatbot_response(user_message, session, history):
    """ADVANCED: Generate contextual medical consultation chatbot responses"""
    
    user_message_lower = user_message.lower()
    stage = session['stage']
    user_data = session['user_data']
    
    # Medical disclaimer
    disclaimer = "\n\n⚠️ **Medical Disclaimer:** This is an AI assistant for preliminary guidance only. Always consult qualified healthcare professionals for proper medical diagnosis and treatment."
    
    # Stage 1: Greeting and Name Collection
    if stage == 'greeting':
        if any(greeting in user_message_lower for greeting in ['hello', 'hi', 'hey', 'start', 'begin']):
            session['stage'] = 'collect_name'
            return {
                'message': f"👋 **Hello! I'm Dr. AI, your medical consultation assistant.**\n\nI'll help you with preliminary health assessment and connect you with appropriate specialists in your city.\n\n🔹 **First, may I know your name?**\n\nPlease tell me what I should call you.{disclaimer}",
                'quickActions': [
                    {'text': 'My name is...', 'message': 'My name is John', 'icon': 'fas fa-user'},
                    {'text': 'Emergency Help', 'message': 'This is an emergency', 'icon': 'fas fa-exclamation-triangle'}
                ]
            }
        else:
            return {
                'message': f"👋 **Welcome to MedPredictor AI Medical Assistant!**\n\nI'm here to help you with:\n• Preliminary health assessment\n• Symptom analysis\n• Specialist doctor recommendations\n• Emergency guidance\n\n🔹 **Say 'Hello' or 'Start' to begin your medical consultation.**{disclaimer}",
                'quickActions': [
                    {'text': 'Start Consultation', 'message': 'Hello, start consultation', 'icon': 'fas fa-stethoscope'},
                    {'text': 'Emergency', 'message': 'This is an emergency', 'icon': 'fas fa-phone'}
                ]
            }
    
    # Stage 2: Collect Name
    elif stage == 'collect_name':
        # Extract name from message
        name_patterns = [
            r'my name is (\w+)',
            r'i am (\w+)',
            r'call me (\w+)',
            r'^(\w+)$'  # Just a single word
        ]
        
        name = None
        for pattern in name_patterns:
            match = re.search(pattern, user_message_lower)
            if match:
                name = match.group(1).title()
                break
        
        if name:
            user_data['name'] = name
            session['stage'] = 'collect_age'
            return {
                'message': f"Nice to meet you, **{name}**! 😊\n\n🔹 **Now, could you please tell me your age?**\n\nThis helps me provide more accurate health guidance.\n\nExample: 'I am 25 years old' or just '25'",
                'quickActions': [
                    {'text': 'I am 25', 'message': 'I am 25 years old', 'icon': 'fas fa-calendar'},
                    {'text': 'I am 35', 'message': 'I am 35 years old', 'icon': 'fas fa-calendar'},
                    {'text': 'I am 45', 'message': 'I am 45 years old', 'icon': 'fas fa-calendar'}
                ]
            }
        else:
            return {
                'message': f"I didn't catch your name clearly. 😅\n\n🔹 **Please tell me your name:**\n\nYou can say:\n• 'My name is John'\n• 'I am Sarah'\n• 'Call me Mike'\n• Or just type your name",
                'quickActions': [
                    {'text': 'My name is...', 'message': 'My name is Alex', 'icon': 'fas fa-user'}
                ]
            }
    
    # Stage 3: Collect Age
    elif stage == 'collect_age':
        # Extract age from message
        age_patterns = [
            r'i am (\d+)',
            r'my age is (\d+)',
            r'(\d+) years old',
            r'^(\d+)$'  # Just a number
        ]
        
        age = None
        for pattern in age_patterns:
            match = re.search(pattern, user_message_lower)
            if match:
                age = int(match.group(1))
                break
        
        if age and 1 <= age <= 120:
            user_data['age'] = age
            session['stage'] = 'collect_city'
            
            # Age-appropriate message
            if age < 18:
                age_note = "Since you're under 18, please make sure a parent or guardian is aware of this consultation."
            elif age >= 65:
                age_note = "I'll keep your age in mind for age-specific health considerations."
            else:
                age_note = "Thanks for sharing your age information."
            
            return {
                'message': f"Thank you, **{user_data['name']}**! {age_note}\n\n🔹 **Which city are you located in?**\n\nThis helps me recommend specialist doctors in your area.\n\nCurrently supported cities: Mumbai, Delhi, Bangalore, Chennai",
                'quickActions': [
                    {'text': 'Mumbai', 'message': 'I am in Mumbai', 'icon': 'fas fa-map-marker-alt'},
                    {'text': 'Delhi', 'message': 'I am in Delhi', 'icon': 'fas fa-map-marker-alt'},
                    {'text': 'Bangalore', 'message': 'I am in Bangalore', 'icon': 'fas fa-map-marker-alt'},
                    {'text': 'Chennai', 'message': 'I am in Chennai', 'icon': 'fas fa-map-marker-alt'}
                ]
            }
        else:
            return {
                'message': f"Please provide a valid age between 1 and 120.\n\n🔹 **How old are you?**\n\nYou can say:\n• 'I am 30 years old'\n• 'My age is 25'\n• Or just type the number like '35'",
                'quickActions': [
                    {'text': '25', 'message': '25', 'icon': 'fas fa-calendar'},
                    {'text': '35', 'message': '35', 'icon': 'fas fa-calendar'},
                    {'text': '45', 'message': '45', 'icon': 'fas fa-calendar'}
                ]
            }
    
    # Stage 4: Collect City
    elif stage == 'collect_city':
        # Extract city from message
        city_patterns = [
            r'i am in (\w+)',
            r'i live in (\w+)',
            r'from (\w+)',
            r'^(\w+)$'  # Just the city name
        ]
        
        city = None
        for pattern in city_patterns:
            match = re.search(pattern, user_message_lower)
            if match:
                city = match.group(1).lower()
                break
        
        # Check if city is supported
        supported_cities = ['mumbai', 'delhi', 'bangalore', 'chennai']
        if city in supported_cities:
            user_data['city'] = city
            session['stage'] = 'collect_symptoms'
            return {
                'message': f"Perfect! I have specialist doctors available in **{city.title()}**. 🏥\n\n🔹 **Now, please describe your symptoms:**\n\nTell me what health concerns or symptoms you're experiencing. Be as detailed as possible.\n\nFor example:\n• 'I have fever and headache'\n• 'Experiencing chest pain and shortness of breath'\n• 'Stomach pain and nausea for 2 days'",
                'quickActions': [
                    {'text': 'Fever & Headache', 'message': 'I have fever and headache', 'icon': 'fas fa-thermometer'},
                    {'text': 'Chest Pain', 'message': 'I have chest pain', 'icon': 'fas fa-heartbeat'},
                    {'text': 'Stomach Pain', 'message': 'I have stomach pain', 'icon': 'fas fa-hand-holding-medical'}
                ]
            }
        else:
            return {
                'message': f"I currently have specialist doctors available in: **Mumbai, Delhi, Bangalore, and Chennai**.\n\n🔹 **Which of these cities are you in?**\n\nIf you're in a different city, please choose the nearest one for specialist recommendations.",
                'quickActions': [
                    {'text': 'Mumbai', 'message': 'Mumbai', 'icon': 'fas fa-map-marker-alt'},
                    {'text': 'Delhi', 'message': 'Delhi', 'icon': 'fas fa-map-marker-alt'},
                    {'text': 'Bangalore', 'message': 'Bangalore', 'icon': 'fas fa-map-marker-alt'},
                    {'text': 'Chennai', 'message': 'Chennai', 'icon': 'fas fa-map-marker-alt'}
                ]
            }
    
    # Stage 5: Collect Symptoms and Provide Analysis
    elif stage == 'collect_symptoms':
        user_data['symptoms_description'] = user_message
        
        # Extract symptoms from the description
        symptom_keywords = {
            'fever': ['fever', 'temperature', 'hot'],
            'headache': ['headache', 'head pain', 'migraine'],
            'cough': ['cough', 'coughing'],
            'chest_pain': ['chest pain', 'chest hurt'],
            'shortness_of_breath': ['shortness of breath', 'breathing problem', 'breathless'],
            'nausea': ['nausea', 'feel sick', 'queasy'],
            'vomiting': ['vomiting', 'throwing up', 'vomit'],
            'diarrhea': ['diarrhea', 'loose motions', 'stomach upset'],
            'abdominal_pain': ['stomach pain', 'abdominal pain', 'belly pain'],
            'dizziness': ['dizzy', 'dizziness', 'lightheaded'],
            'fatigue': ['tired', 'fatigue', 'weak', 'exhausted'],
            'sore_throat': ['sore throat', 'throat pain']
        }
        
        detected_symptoms = []
        for symptom, keywords in symptom_keywords.items():
            if any(keyword in user_message_lower for keyword in keywords):
                detected_symptoms.append(symptom)
        
        if not detected_symptoms:
            # If no symptoms detected, ask for clarification
            return {
                'message': f"I want to make sure I understand your symptoms correctly.\n\n🔹 **Could you please describe your symptoms more specifically?**\n\nCommon symptoms include:\n• Fever, headache, cough\n• Chest pain, breathing problems\n• Stomach pain, nausea, vomiting\n• Body ache, tiredness, dizziness",
                'quickActions': [
                    {'text': 'Fever & Cough', 'message': 'I have fever and cough', 'icon': 'fas fa-thermometer'},
                    {'text': 'Headache', 'message': 'I have severe headache', 'icon': 'fas fa-head-side-virus'},
                    {'text': 'Stomach Issues', 'message': 'I have stomach pain and nausea', 'icon': 'fas fa-stomach'}
                ]
            }
        
        try:
            # Analyze symptoms using the ML model
            symptom_vector = create_symptom_vector(detected_symptoms)
            probabilities = ml_model.predict_proba(symptom_vector, detected_symptoms)
            
            # Create predictions
            predictions = []
            for i, (disease, prob) in enumerate(zip(diseases_data, probabilities)):
                confidence = round(prob * 100, 1)
                severity, urgency = calculate_severity_urgency(disease, confidence)
                predictions.append({
                    'rank': i + 1,
                    'disease': disease,
                    'confidence': confidence,
                    'severity': severity,
                    'urgency': urgency
                })
            
            # Sort and get top 3 predictions
            predictions.sort(key=lambda x: x['confidence'], reverse=True)
            top_predictions = predictions[:3]
            
            # Get specialist and doctor recommendations
            top_disease = top_predictions[0]['disease']
            specialist_type = get_specialist_for_disease(top_disease)
            
            city_doctors = SPECIALIST_DOCTORS.get(user_data['city'], {})
            recommended_doctors = city_doctors.get(specialist_type, ['General physicians available'])
            
            # Generate comprehensive response
            response = f"## 🏥 **Medical Analysis for {user_data['name']} (Age: {user_data['age']})**\n\n"
            response += f"**Symptoms Analyzed:** {', '.join([s.replace('_', ' ').title() for s in detected_symptoms])}\n\n"
            response += "### 📊 **Top 3 Possible Conditions:**\n"
            
            for i, pred in enumerate(top_predictions, 1):
                urgency_emoji = "🔴" if pred['urgency'] == 'High' else "🟡" if pred['urgency'] == 'Medium' else "🟢"
                response += f"{i}. **{pred['disease']}** - {pred['confidence']}% confidence {urgency_emoji}\n"
            
            response += f"\n### 👨‍⚕️ **Recommended Specialists in {user_data['city'].title()}:**\n"
            response += f"**{specialist_type.replace('_', ' ').title()}:**\n"
            
            for doctor in recommended_doctors[:2]:  # Show top 2 doctors
                response += f"• {doctor}\n"
            
            # Add urgency message
            if top_predictions[0]['urgency'] == 'High':
                response += f"\n🚨 **URGENT:** Please seek immediate medical attention!\n"
            elif top_predictions[0]['urgency'] == 'Medium':
                response += f"\n⚠️ **IMPORTANT:** Please consult a doctor soon.\n"
            
            response += disclaimer
            
            # Reset session for new consultation
            session['stage'] = 'completed'
            
            return {
                'message': response,
                'quickActions': [
                    {'text': 'New Consultation', 'message': 'Start new consultation', 'icon': 'fas fa-redo'},
                    {'text': 'Emergency Help', 'message': 'Show emergency contacts', 'icon': 'fas fa-phone'},
                    {'text': 'More Doctors', 'message': f'Show more {specialist_type} doctors in {user_data["city"]}', 'icon': 'fas fa-user-md'}
                ]
            }
            
        except Exception as e:
            logger.error(f"❌ Error in symptom analysis: {e}")
            return {
                'message': f"I encountered an issue analyzing your symptoms. Let me connect you with our regular symptom checker.\n\n🔹 **Please try using the main Symptom Checker** on our website for detailed analysis.\n\nAlternatively, here are emergency contacts if this is urgent:\n• Medical Emergency: 102\n• Ambulance: 108{disclaimer}",
                'quickActions': [
                    {'text': 'Try Again', 'message': 'Analyze my symptoms again', 'icon': 'fas fa-redo'},
                    {'text': 'Emergency', 'message': 'Show emergency contacts', 'icon': 'fas fa-phone'}
                ]
            }
    
    # Stage 6: Completed - Handle follow-up questions
    elif stage == 'completed':
        if 'new consultation' in user_message_lower or 'start again' in user_message_lower:
            # Reset session
            session['stage'] = 'greeting'
            session['user_data'] = {}
            return {
                'message': f"👋 **Starting a new medical consultation...**\n\nHello! I'm Dr. AI, your medical consultation assistant.\n\n🔹 **May I know your name?**{disclaimer}",
                'quickActions': [
                    {'text': 'My name is...', 'message': 'My name is John', 'icon': 'fas fa-user'}
                ]
            }
        
        elif 'more doctors' in user_message_lower:
            # Show more doctors for the user's city and specialist type
            city = user_data.get('city', 'mumbai')
            # Extract specialist type from message or use general
            specialist_type = 'general'  # Default
            
            city_doctors = SPECIALIST_DOCTORS.get(city, {})
            all_doctors = city_doctors.get(specialist_type, [])
            
            response = f"### 👨‍⚕️ **More Doctors in {city.title()}:**\n\n"
            for doctor in all_doctors:
                response += f"• {doctor}\n"
            
            response += f"\n💡 **Tip:** Call ahead to book appointments and confirm availability.{disclaimer}"
            
            return {
                'message': response,
                'quickActions': [
                    {'text': 'New Consultation', 'message': 'Start new consultation', 'icon': 'fas fa-redo'},
                    {'text': 'Emergency', 'message': 'Show emergency contacts', 'icon': 'fas fa-phone'}
                ]
            }
        
        elif 'emergency' in user_message_lower:
            return generate_emergency_response()
        
        else:
            return {
                'message': f"Hi **{user_data.get('name', 'there')}**! 👋\n\nHow can I help you today?\n\n🔹 **I can:**\n• Start a new medical consultation\n• Show more specialist doctors\n• Provide emergency contact information\n• Answer general health questions{disclaimer}",
                'quickActions': [
                    {'text': 'New Consultation', 'message': 'Start new consultation', 'icon': 'fas fa-stethoscope'},
                    {'text': 'Emergency Help', 'message': 'Show emergency contacts', 'icon': 'fas fa-phone'}
                ]
            }
    
    # Handle emergency requests at any stage
    if 'emergency' in user_message_lower or 'urgent' in user_message_lower:
        return generate_emergency_response()
    
    # Fallback response
    return {
        'message': f"I'm here to help with your medical consultation! 🏥\n\n🔹 **Let's start properly:**\n\nSay 'Hello' or 'Start consultation' to begin your medical assessment.{disclaimer}",
        'quickActions': [
            {'text': 'Start Consultation', 'message': 'Hello, start consultation', 'icon': 'fas fa-stethoscope'},
            {'text': 'Emergency', 'message': 'This is an emergency', 'icon': 'fas fa-phone'}
        ]
    }

def generate_emergency_response():
    """Generate emergency response with contact information"""
    return {
        'message': f"🚨 **EMERGENCY CONTACTS (INDIA):**\n\n**Immediate Help:**\n• 🚑 **Medical Emergency:** 102\n• 🚑 **Ambulance:** 108\n• 🆘 **All Emergency Services:** 112\n\n**Other Important Numbers:**\n• 🚒 Fire Department: 101\n• 👮 Police: 100\n• 👩 Women Helpline: 1091\n• 👶 Child Helpline: 1098\n\n**⚠️ If this is a medical emergency, please call immediately or go to the nearest hospital!**\n\n**Signs requiring immediate medical attention:**\n• Chest pain or difficulty breathing\n• Severe bleeding or injury\n• Loss of consciousness\n• Signs of stroke or heart attack\n• Severe allergic reactions",
        'quickActions': [
            {'text': 'Call 102', 'message': 'tel:102', 'icon': 'fas fa-phone'},
            {'text': 'Call 108', 'message': 'tel:108', 'icon': 'fas fa-ambulance'}
        ]
    }

@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    """Generate downloadable health report"""
    try:
        data = request.get_json()
        prediction_data = data.get('prediction_data')
        
        if not prediction_data:
            return jsonify({
                'success': False,
                'error': 'No prediction data provided'
            }), 400
        
        # Generate report content
        report_lines = [
            "=" * 60,
            "MEDPREDICTOR HEALTH ANALYSIS REPORT",
            "=" * 60,
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "SELECTED SYMPTOMS:",
            "-" * 20
        ]
        
        for symptom in prediction_data.get('selected_symptoms', []):
            report_lines.append(f"• {symptom.replace('_', ' ').title()}")
        
        report_lines.extend([
            "",
            "TOP 5 DISEASE PREDICTIONS:",
            "-" * 30,
            f"{'Rank':<6}{'Disease':<25}{'Confidence':<12}{'Severity':<10}"
        ])
        
        for pred in prediction_data.get('predictions', [])[:5]:
            report_lines.append(
                f"{pred['rank']:<6}{pred['disease']:<25}{pred['confidence']:<11}%{pred['severity']:<10}"
            )
        
        # Add top prediction details
        top_pred = prediction_data.get('top_prediction', {})
        if top_pred:
            report_lines.extend([
                "",
                "DETAILED ANALYSIS - TOP PREDICTION:",
                "-" * 40,
                f"Disease: {top_pred.get('disease', 'N/A')}",
                f"Confidence: {top_pred.get('confidence', 'N/A')}%",
                f"Severity: {top_pred.get('severity', 'N/A')}",
                f"Urgency: {top_pred.get('urgency', 'N/A')}",
                "",
                "RECOMMENDED PRECAUTIONS:",
            ])
            
            for precaution in top_pred.get('precautions', []):
                report_lines.append(f"• {precaution}")
            
            report_lines.append("\nHOME REMEDIES:")
            for remedy in top_pred.get('home_remedies', []):
                report_lines.append(f"• {remedy}")
        
        report_lines.extend([
            "",
            "=" * 60,
            "IMPORTANT MEDICAL DISCLAIMER",
            "=" * 60,
            "This analysis is for educational purposes only and should not",
            "replace professional medical advice. Always consult qualified",
            "healthcare professionals for medical concerns and treatment.",
            "",
            "In case of medical emergency, call:",
            "• Medical Emergency: 102",
            "• Ambulance: 108", 
            "• All Emergency Services: 112",
            "",
            "Report generated by MedPredictor AI Healthcare Assistant",
            "=" * 60
        ])
        
        report_content = "\n".join(report_lines)
        filename = f"medpredictor_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        return jsonify({
            'success': True,
            'report_content': report_content,
            'filename': filename,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Report generation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate report'
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 16MB.'
    }), 413

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.1',
        'features': {
            'symptoms_loaded': len(symptoms_data) > 0,
            'diseases_loaded': len(diseases_data) > 0,
            'ml_model_loaded': ml_model is not None,
            'chatbot_enabled': True,
            'advanced_chatbot': True,
            'specialist_doctors': True
        }
    })

if __name__ == '__main__':
    # Development server configuration
    logger.info("🚀 Starting MedPredictor Advanced Server...")
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
