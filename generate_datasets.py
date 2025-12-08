import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# ============================================================================
# 1. ENHANCED SYMPTOM-DISEASE DATASET (8000+ records)
# ============================================================================

enhanced_symptoms = [
    "fever", "high_fever", "low_grade_fever", "chills", "night_sweats", "excessive_sweating",
    "cough", "dry_cough", "productive_cough", "persistent_cough", "wheezing", "shortness_of_breath",
    "difficulty_breathing", "chest_tightness", "chest_pain", "sharp_chest_pain", "crushing_chest_pain",
    "headache", "severe_headache", "throbbing_headache", "tension_headache", "cluster_headache",
    "migraine", "dizziness", "lightheadedness", "vertigo", "balance_problems", "coordination_problems",
    "fatigue", "extreme_fatigue", "weakness", "lethargy", "malaise", "energy_loss",
    "nausea", "vomiting", "persistent_vomiting", "blood_vomiting", "dry_heaving",
    "diarrhea", "bloody_diarrhea", "watery_diarrhea", "constipation", "severe_constipation",
    "abdominal_pain", "severe_abdominal_pain", "cramping", "bloating", "gas", "indigestion",
    "heartburn", "acid_reflux", "difficulty_swallowing", "loss_of_appetite", "increased_appetite",
    "weight_loss", "unexplained_weight_loss", "weight_gain", "rapid_weight_gain",
    "joint_pain", "severe_joint_pain", "joint_stiffness", "joint_swelling", "joint_warmth",
    "muscle_pain", "muscle_weakness", "muscle_cramps", "muscle_spasms", "muscle_stiffness",
    "back_pain", "lower_back_pain", "upper_back_pain", "neck_pain", "shoulder_pain",
    "bone_pain", "growing_pains", "morning_stiffness", "evening_stiffness",
    "skin_rash", "red_rash", "itchy_rash", "painful_rash", "blistering_rash",
    "dry_skin", "oily_skin", "pale_skin", "yellow_skin", "blue_skin", "mottled_skin",
    "hair_loss", "excessive_hair_growth", "brittle_nails", "nail_changes", "nail_discoloration",
    "sore_throat", "severe_sore_throat", "scratchy_throat", "hoarse_voice", "voice_loss",
    "runny_nose", "stuffy_nose", "nasal_congestion", "sneezing", "post_nasal_drip",
    "itchy_eyes", "red_eyes", "watery_eyes", "dry_eyes", "eye_pain", "eye_discharge",
    "blurred_vision", "double_vision", "vision_loss", "light_sensitivity", "night_blindness",
    "hearing_loss", "ringing_ears", "ear_pain", "ear_discharge", "ear_pressure",
    "frequent_urination", "urgent_urination", "painful_urination", "blood_in_urine",
    "dark_urine", "cloudy_urine", "strong_urine_odor", "difficulty_urinating",
    "irregular_heartbeat", "rapid_heartbeat", "slow_heartbeat", "palpitations", "heart_murmur",
    "high_blood_pressure", "low_blood_pressure", "blood_pressure_spikes",
    "cold_hands_feet", "numbness", "tingling", "pins_needles", "burning_sensation",
    "swelling", "leg_swelling", "ankle_swelling", "facial_swelling", "hand_swelling",
    "bruising", "easy_bruising", "unexplained_bruising", "bleeding", "nosebleeds",
    "memory_problems", "concentration_issues", "confusion", "disorientation", "mood_swings",
    "irritability", "anxiety", "panic_attacks", "depression", "sadness", "hopelessness",
    "sleep_problems", "difficulty_sleeping", "insomnia", "excessive_sleepiness", "sleep_apnea",
    "snoring", "restless_sleep", "nightmares", "night_terrors", "sleepwalking",
    "tremors", "shaking", "seizures", "convulsions", "fainting", "loss_of_consciousness",
    "dental_pain", "toothache", "gum_pain", "mouth_sores", "dry_mouth", "excessive_thirst",
    "bad_breath", "metallic_taste", "loss_of_taste", "loss_of_smell", "altered_taste",
    "hot_flashes", "cold_flashes", "temperature_intolerance", "sensitivity_to_cold", "sensitivity_to_heat"
]

enhanced_diseases = [
    "Common Cold", "Flu", "COVID-19", "Asthma", "Diabetes Type 1", "Diabetes Type 2",
    "Hypertension", "Pneumonia", "Bronchitis", "Arthritis", "Rheumatoid Arthritis",
    "Osteoarthritis", "Migraine", "Tension Headache", "Cluster Headache", "Depression",
    "Anxiety Disorder", "Panic Disorder", "Insomnia", "Sleep Apnea", "Gastritis",
    "Peptic Ulcer", "Diarrhea", "Constipation", "IBS", "Acid Reflux", "GERD",
    "Kidney Stones", "UTI", "Chronic Kidney Disease", "Skin Allergies", "Eczema",
    "Psoriasis", "Dermatitis", "Heart Disease", "Coronary Artery Disease", "Heart Attack",
    "Heart Failure", "Anemia", "Iron Deficiency", "Thyroid Disorder", "Hyperthyroidism",
    "Hypothyroidism", "Osteoporosis", "Gout", "Sinusitis", "Tonsillitis", "Laryngitis",
    "Food Poisoning", "Salmonella", "Malaria", "Dengue Fever", "Typhoid", "Chickenpox",
    "Measles", "Mumps", "Hepatitis A", "Hepatitis B", "Hepatitis C", "Tuberculosis",
    "Appendicitis", "Gallstones", "Cholecystitis", "Hernia", "Hemorrhoids", "Varicose Veins",
    "Deep Vein Thrombosis", "Cataracts", "Glaucoma", "Macular Degeneration", "Ear Infection",
    "Hearing Loss", "Vertigo", "Meniere Disease", "Back Pain", "Sciatica", "Fibromyalgia",
    "Chronic Fatigue", "Multiple Sclerosis", "Parkinsons Disease", "Alzheimers Disease",
    "Stroke", "Epilepsy", "Crohns Disease", "Ulcerative Colitis", "Celiac Disease",
    "Lactose Intolerance", "Obesity", "Metabolic Syndrome", "PCOS", "Endometriosis",
    "Prostate Cancer", "Breast Cancer", "Lung Cancer", "Colon Cancer", "Skin Cancer",
    "Leukemia", "Lymphoma", "Bipolar Disorder", "Schizophrenia", "PTSD", "ADHD"
]

# Disease-symptom relationships for realistic data
disease_symptom_map = {
    "Common Cold": ["runny_nose", "sneezing", "sore_throat", "cough", "headache", "fatigue", "low_grade_fever"],
    "Flu": ["high_fever", "cough", "headache", "fatigue", "muscle_pain", "chills", "nausea", "weakness"],
    "COVID-19": ["fever", "dry_cough", "fatigue", "loss_of_taste", "loss_of_smell", "shortness_of_breath", "headache"],
    "Asthma": ["shortness_of_breath", "wheezing", "chest_tightness", "cough", "difficulty_breathing", "fatigue"],
    "Diabetes Type 2": ["frequent_urination", "excessive_thirst", "fatigue", "blurred_vision", "weight_gain", "slow_healing"],
    "Hypertension": ["headache", "dizziness", "chest_pain", "shortness_of_breath", "nausea", "fatigue"],
    "Heart Disease": ["chest_pain", "shortness_of_breath", "palpitations", "fatigue", "dizziness", "swelling"],
    "Depression": ["sadness", "hopelessness", "fatigue", "sleep_problems", "concentration_issues", "loss_of_appetite"],
    "Anxiety Disorder": ["anxiety", "panic_attacks", "rapid_heartbeat", "sweating", "tremors", "sleep_problems"],
    "Migraine": ["severe_headache", "nausea", "vomiting", "light_sensitivity", "dizziness", "throbbing_headache"]
}

# Generate symptom-disease dataset
symptom_disease_data = []
for _ in range(8000):
    disease = random.choice(enhanced_diseases)
    
    # Create symptom vector (binary)
    symptom_vector = {}
    
    # Add related symptoms with high probability
    if disease in disease_symptom_map:
        related_symptoms = disease_symptom_map[disease]
        for symptom in related_symptoms:
            if symptom in enhanced_symptoms:
                symptom_vector[symptom] = 1 if random.random() > 0.1 else 0
    
    # Add random symptoms with low probability
    for symptom in enhanced_symptoms:
        if symptom not in symptom_vector:
            symptom_vector[symptom] = 1 if random.random() > 0.95 else 0
    
    # Add disease to record
    symptom_vector['disease'] = disease
    symptom_disease_data.append(symptom_vector)

symptom_disease_df = pd.DataFrame(symptom_disease_data)
symptom_disease_df.to_csv('enhanced_symptom_disease_dataset.csv', index=False)

print(f"✅ Created enhanced_symptom_disease_dataset.csv with {len(symptom_disease_df)} records")

# ============================================================================
# 2. ENHANCED PRECAUTIONS DATASET (7000+ records)
# ============================================================================

precautions_map = {
    "Common Cold": [
        "Get 7-9 hours of quality sleep daily",
        "Drink 8-10 glasses of warm fluids (water, herbal teas, warm broths)",
        "Use a cool-mist humidifier to maintain 40-50% humidity",
        "Gargle with salt water (1/2 teaspoon salt in 8oz warm water) 3-4 times daily",
        "Take 1000mg vitamin C supplements daily",
        "Avoid smoking and secondhand smoke exposure",
        "Wash hands frequently with soap for 20+ seconds"
    ],
    "COVID-19": [
        "Isolate for minimum 5-10 days from symptom onset",
        "Monitor oxygen saturation with pulse oximeter",
        "Get vaccinated and boosted as recommended",
        "Wear N95 or KN95 masks in public spaces",
        "Maintain 6+ feet distance from others",
        "Disinfect frequently touched surfaces daily",
        "Seek immediate medical attention if breathing difficulties occur"
    ],
    "Heart Disease": [
        "Follow DASH diet (low sodium, high potassium, whole grains)",
        "Engage in 150 minutes moderate aerobic exercise weekly",
        "Maintain healthy weight (BMI 18.5-24.9)",
        "Limit alcohol intake (1 drink/day women, 2 drinks/day men)",
        "Quit smoking and avoid all tobacco products",
        "Monitor blood pressure daily at same time",
        "Take prescribed medications exactly as directed"
    ],
    "Diabetes Type 2": [
        "Check blood glucose levels 2-4 times daily as directed",
        "Follow carbohydrate counting and portion control",
        "Exercise 30 minutes daily, 5 days per week minimum",
        "Maintain HbA1c levels below 7% (individual targets may vary)",
        "Get annual eye exams and foot inspections",
        "Monitor for signs of diabetic complications",
        "Take metformin or other medications as prescribed"
    ]
}

precautions_data = []
for _ in range(7000):
    disease = random.choice(enhanced_diseases)
    
    if disease in precautions_map:
        available_precautions = precautions_map[disease]
    else:
        available_precautions = [
            "Consult healthcare provider for proper diagnosis and treatment",
            "Follow prescribed medication regimen exactly as directed",
            "Maintain healthy lifestyle with balanced diet and regular exercise",
            "Get adequate rest and manage stress levels effectively",
            "Monitor symptoms and report changes to healthcare provider",
            "Attend all scheduled follow-up appointments"
        ]
    
    # Select 4-6 precautions
    num_precautions = random.randint(4, min(6, len(available_precautions)))
    selected_precautions = random.sample(available_precautions, num_precautions)
    
    record = {
        'disease': disease,
        'precaution_1': selected_precautions[0] if len(selected_precautions) > 0 else '',
        'precaution_2': selected_precautions[1] if len(selected_precautions) > 1 else '',
        'precaution_3': selected_precautions[2] if len(selected_precautions) > 2 else '',
        'precaution_4': selected_precautions[3] if len(selected_precautions) > 3 else '',
        'precaution_5': selected_precautions[4] if len(selected_precautions) > 4 else '',
        'precaution_6': selected_precautions[5] if len(selected_precautions) > 5 else '',
        'severity_level': random.choice(['Mild', 'Moderate', 'Severe', 'Critical']),
        'urgency': random.choice(['Low', 'Medium', 'High', 'Emergency']),
        'follow_up_days': random.randint(1, 90)
    }
    precautions_data.append(record)

precautions_df = pd.DataFrame(precautions_data)
precautions_df.to_csv('enhanced_precautions.csv', index=False)

print(f"✅ Created enhanced_precautions.csv with {len(precautions_df)} records")

# ============================================================================
# 3. ENHANCED HOME REMEDIES DATASET (7500+ records)
# ============================================================================

remedies_map = {
    "Common Cold": [
        "Drink warm ginger-honey-lemon tea (1 tsp each in hot water) 3 times daily",
        "Use eucalyptus steam inhalation for 10-15 minutes twice daily",
        "Consume 2-3 cloves fresh garlic daily for immune support",
        "Apply warm compress on sinuses for 10 minutes, 3 times daily",
        "Drink bone broth rich in minerals and amino acids",
        "Take echinacea supplements (400mg twice daily)",
        "Use saline nasal spray every 2-3 hours while awake"
    ],
    "Heart Disease": [
        "Consume 2-3 cloves fresh garlic daily (allicin for heart health)",
        "Drink 2-3 cups green tea daily (catechins and antioxidants)",
        "Include omega-3 rich foods: salmon, walnuts, flaxseeds daily",
        "Practice 20 minutes deep breathing meditation daily",
        "Take 200mg CoQ10 supplement with meals",
        "Consume 1-2 tbsp olive oil daily (monounsaturated fats)",
        "Include hawthorn berry tea (1 cup twice daily)"
    ],
    "Diabetes Type 2": [
        "Drink bitter melon juice (100ml) on empty stomach daily",
        "Consume 1 tsp cinnamon powder with meals (blood sugar control)",
        "Take 1 tbsp apple cider vinegar in water before meals",
        "Include fenugreek seeds (1 tsp soaked overnight) daily",
        "Drink green tea without sugar 2-3 times daily",
        "Consume chromium-rich foods: broccoli, whole grains, lean meats",
        "Practice 30 minutes yoga daily for insulin sensitivity"
    ]
}

remedies_data = []
for _ in range(7500):
    disease = random.choice(enhanced_diseases)
    
    if disease in remedies_map:
        available_remedies = remedies_map[disease]
    else:
        available_remedies = [
            "Stay well hydrated with 8-10 glasses water daily",
            "Get adequate rest and sleep (7-9 hours nightly)",
            "Eat nutrient-dense whole foods and avoid processed foods",
            "Practice gentle exercise as tolerated (walking, stretching)",
            "Use stress reduction techniques (meditation, deep breathing)",
            "Apply hot or cold therapy as appropriate for symptoms"
        ]
    
    # Select 3-5 remedies
    num_remedies = random.randint(3, min(5, len(available_remedies)))
    selected_remedies = random.sample(available_remedies, num_remedies)
    
    record = {
        'disease': disease,
        'home_remedy_1': selected_remedies[0] if len(selected_remedies) > 0 else '',
        'home_remedy_2': selected_remedies[1] if len(selected_remedies) > 1 else '',
        'home_remedy_3': selected_remedies[2] if len(selected_remedies) > 2 else '',
        'home_remedy_4': selected_remedies[3] if len(selected_remedies) > 3 else '',
        'home_remedy_5': selected_remedies[4] if len(selected_remedies) > 4 else '',
        'effectiveness_rating': round(random.uniform(3.0, 9.5), 1),
        'preparation_time_minutes': random.randint(5, 60),
        'cost_level': random.choice(['Very Low', 'Low', 'Moderate', 'High']),
        'safety_level': random.choice(['Very Safe', 'Safe', 'Caution Required', 'Consult Doctor'])
    }
    remedies_data.append(record)

remedies_df = pd.DataFrame(remedies_data)
remedies_df.to_csv('enhanced_home_remedies.csv', index=False)

print(f"✅ Created enhanced_home_remedies.csv with {len(remedies_df)} records")

# ============================================================================
# 4. ENHANCED DISEASE DESCRIPTIONS DATASET (8000+ records)
# ============================================================================

description_templates = {
    "Common Cold": {
        "description": "A viral upper respiratory infection caused primarily by rhinoviruses, coronaviruses, and adenoviruses. Characterized by inflammation of the nasal passages, throat, and sinuses.",
        "icd_10_code": "J00",
        "category": "Respiratory",
        "contagious": "Yes",
        "duration_days": "7-10",
        "mortality_rate": 0.001,
        "prevalence_per_100k": 2500
    },
    "COVID-19": {
        "description": "Coronavirus disease caused by SARS-CoV-2 virus affecting respiratory system, cardiovascular system, and multiple organs. Can range from asymptomatic to severe respiratory failure.",
        "icd_10_code": "U07.1",
        "category": "Infectious Disease",
        "contagious": "Yes",
        "duration_days": "5-14",
        "mortality_rate": 2.1,
        "prevalence_per_100k": 1200
    },
    "Heart Disease": {
        "description": "Broad term for conditions affecting heart and blood vessels, including coronary artery disease, heart failure, arrhythmias, and valvular diseases. Leading cause of death globally.",
        "icd_10_code": "I25.9",
        "category": "Cardiovascular",
        "contagious": "No",
        "duration_days": "Chronic",
        "mortality_rate": 23.1,
        "prevalence_per_100k": 665
    }
}

descriptions_data = []
for _ in range(8000):
    disease = random.choice(enhanced_diseases)
    
    if disease in description_templates:
        template = description_templates[disease]
    else:
        template = {
            "description": f"{disease} is a medical condition that requires proper diagnosis and treatment by qualified healthcare professionals.",
            "icd_10_code": f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(10,99)}.{random.randint(0,9)}",
            "category": random.choice(['Infectious', 'Cardiovascular', 'Respiratory', 'Neurological', 'Endocrine']),
            "contagious": random.choice(['Yes', 'No', 'Partially']),
            "duration_days": random.choice(['3-7', '7-14', '14-30', 'Chronic']),
            "mortality_rate": round(random.uniform(0.001, 15.0), 3),
            "prevalence_per_100k": random.randint(1, 5000)
        }
    
    record = {
        'disease': disease,
        'description': template['description'],
        'icd_10_code': template['icd_10_code'],
        'category': template['category'],
        'contagious': template['contagious'],
        'duration_days': template['duration_days'],
        'mortality_rate': template['mortality_rate'],
        'prevalence_per_100k': template['prevalence_per_100k'],
        'age_group_risk': random.choice(['Children', 'Adults', 'Elderly', 'All ages']),
        'complications': 'May lead to various complications if left untreated',
        'last_updated': (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
    }
    descriptions_data.append(record)

descriptions_df = pd.DataFrame(descriptions_data)
descriptions_df.to_csv('enhanced_disease_descriptions.csv', index=False)

print(f"✅ Created enhanced_disease_descriptions.csv with {len(descriptions_df)} records")

# ============================================================================
# 5. DRUG INTERACTIONS DATABASE (5000+ records)
# ============================================================================

common_drugs = [
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Amoxicillin', 'Metformin', 'Lisinopril',
    'Atorvastatin', 'Levothyroxine', 'Omeprazole', 'Warfarin', 'Prednisone', 'Albuterol',
    'Insulin', 'Hydrochlorothiazide', 'Losartan', 'Furosemide', 'Gabapentin', 'Tramadol',
    'Sertraline', 'Lorazepam', 'Clonazepam', 'Diphenhydramine', 'Cetirizine', 'Montelukast'
]

drug_interactions_data = []
for _ in range(5000):
    drug1 = random.choice(common_drugs)
    drug2 = random.choice([d for d in common_drugs if d != drug1])
    
    severity = random.choice(['Minor', 'Moderate', 'Major', 'Severe'])
    interaction_type = random.choice(['Pharmacokinetic', 'Pharmacodynamic', 'Synergistic', 'Antagonistic'])
    
    effects_map = {
        'Minor': ['Mild side effect increase', 'Slight efficacy reduction'],
        'Moderate': ['Increased side effects', 'Reduced effectiveness', 'Requires monitoring'],
        'Major': ['Significant adverse effects', 'Substantial efficacy loss', 'Dosage adjustment needed'],
        'Severe': ['Life-threatening reactions', 'Contraindicated combination', 'Avoid concurrent use']
    }
    
    record = {
        'drug_1': drug1,
        'drug_2': drug2,
        'interaction_severity': severity,
        'interaction_type': interaction_type,
        'clinical_effect': random.choice(effects_map[severity]),
        'mechanism': f'{interaction_type} interaction affecting drug metabolism/action',
        'management': 'Consult healthcare provider before combining medications',
        'evidence_level': random.choice(['Theoretical', 'Case Report', 'Clinical Study', 'Established']),
        'onset_time': random.choice(['Rapid (hours)', 'Delayed (days)', 'Chronic (weeks)', 'Variable']),
        'age_considerations': random.choice(['All ages', 'Elderly', 'Pediatric', 'Adults only'])
    }
    drug_interactions_data.append(record)

drug_interactions_df = pd.DataFrame(drug_interactions_data)
drug_interactions_df.to_csv('drug_interactions_database.csv', index=False)

print(f"✅ Created drug_interactions_database.csv with {len(drug_interactions_df)} records")

# ============================================================================
# 6. HEALTH RISK ASSESSMENTS DATABASE (6000+ records)
# ============================================================================

risk_factors = [
    'Age', 'Gender', 'BMI', 'Smoking Status', 'Alcohol Consumption', 'Physical Activity',
    'Family History', 'Blood Pressure', 'Cholesterol Level', 'Blood Sugar Level',
    'Stress Level', 'Sleep Quality', 'Diet Quality', 'Environmental Factors'
]

risk_assessments_data = []
for _ in range(6000):
    disease = random.choice(enhanced_diseases)
    
    # Generate risk factor scores
    risk_scores = {}
    for factor in risk_factors:
        risk_scores[f'{factor.lower().replace(" ", "_")}_score'] = round(random.uniform(1.0, 10.0), 2)
    
    total_risk_score = sum(risk_scores.values()) / len(risk_scores)
    risk_category = 'Low' if total_risk_score <= 3.5 else 'Moderate' if total_risk_score <= 6.5 else 'High'
    
    record = {
        'disease': disease,
        'total_risk_score': round(total_risk_score, 2),
        'risk_category': risk_category,
        'primary_risk_factors': ', '.join(random.sample(risk_factors, 3)),
        'modifiable_factors': ', '.join(random.sample(['Diet', 'Exercise', 'Smoking', 'Stress', 'Sleep'], 2)),
        'genetic_predisposition': random.choice(['Low', 'Moderate', 'High', 'Unknown']),
        'environmental_risk': random.choice(['Low', 'Moderate', 'High']),
        'age_adjusted_risk': round(total_risk_score * random.uniform(0.8, 1.5), 2),
        'gender_adjusted_risk': round(total_risk_score * random.uniform(0.9, 1.3), 2),
        'prevention_potential': random.choice(['Low', 'Moderate', 'High']),
        **risk_scores
    }
    risk_assessments_data.append(record)

risk_assessments_df = pd.DataFrame(risk_assessments_data)
risk_assessments_df.to_csv('health_risk_assessments.csv', index=False)

print(f"✅ Created health_risk_assessments.csv with {len(risk_assessments_df)} records")

# ============================================================================
# 7. BMI HEALTH METRICS DATABASE (2000+ records)
# ============================================================================

bmi_data = []
for _ in range(2000):
    age = random.randint(18, 80)
    height_cm = random.randint(150, 200)
    weight_kg = random.randint(45, 150)
    
    # Calculate BMI
    bmi = weight_kg / ((height_cm / 100) ** 2)
    
    # BMI categories
    if bmi < 18.5:
        bmi_category = 'Underweight'
    elif bmi < 25:
        bmi_category = 'Normal'
    elif bmi < 30:
        bmi_category = 'Overweight'
    else:
        bmi_category = 'Obese'
    
    # Generate other health metrics
    systolic_bp = random.randint(90, 180)
    diastolic_bp = random.randint(60, 110)
    heart_rate = random.randint(60, 120)
    blood_sugar = random.randint(70, 300)
    cholesterol = random.randint(150, 350)
    
    # Health risk score (0-100)
    risk_score = min(100, max(0, 
        (bmi - 25) * 2 + 
        (systolic_bp - 120) * 0.5 + 
        (diastolic_bp - 80) * 0.8 + 
        (heart_rate - 70) * 0.3 + 
        (blood_sugar - 100) * 0.2 + 
        (cholesterol - 200) * 0.1 +
        (age - 30) * 0.5
    ))
    
    record = {
        'age': age,
        'height_cm': height_cm,
        'weight_kg': weight_kg,
        'bmi': round(bmi, 2),
        'bmi_category': bmi_category,
        'systolic_bp': systolic_bp,
        'diastolic_bp': diastolic_bp,
        'heart_rate': heart_rate,
        'blood_sugar_mg_dl': blood_sugar,
        'total_cholesterol_mg_dl': cholesterol,
        'health_risk_score': round(risk_score, 1),
        'risk_level': 'Low' if risk_score < 30 else 'Moderate' if risk_score < 60 else 'High',
        'recommendations': 'Maintain healthy lifestyle' if risk_score < 30 else 'Consider lifestyle modifications' if risk_score < 60 else 'Consult healthcare provider'
    }
    bmi_data.append(record)

bmi_df = pd.DataFrame(bmi_data)
bmi_df.to_csv('bmi_health_metrics.csv', index=False)

print(f"✅ Created bmi_health_metrics.csv with {len(bmi_df)} records")

# ============================================================================
# 8. APPOINTMENT SCHEDULING DATABASE (3000+ records)
# ============================================================================

doctors = [
    'Dr. Sarah Johnson - Cardiologist',
    'Dr. Michael Chen - Neurologist', 
    'Dr. Emily Rodriguez - Dermatologist',
    'Dr. David Kim - Endocrinologist',
    'Dr. Lisa Brown - Gastroenterologist',
    'Dr. James Wilson - Orthopedist',
    'Dr. Maria Garcia - Psychiatrist',
    'Dr. Robert Lee - Pulmonologist',
    'Dr. Jennifer Davis - Gynecologist',
    'Dr. Ahmed Hassan - Oncologist'
]

appointment_types = [
    'Consultation', 'Follow-up', 'Diagnosis', 'Treatment', 'Screening',
    'Physical Exam', 'Lab Review', 'Procedure', 'Emergency', 'Telemedicine'
]

appointments_data = []
for _ in range(3000):
    doctor = random.choice(doctors)
    appointment_type = random.choice(appointment_types)
    
    # Generate random date within next 90 days
    appointment_date = datetime.now() + timedelta(days=random.randint(1, 90))
    
    # Generate time slots
    hour = random.choice([9, 10, 11, 14, 15, 16, 17])
    minute = random.choice([0, 15, 30, 45])
    
    appointment_time = appointment_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
    
    record = {
        'appointment_id': f'APT{random.randint(10000, 99999)}',
        'doctor': doctor,
        'appointment_type': appointment_type,
        'appointment_datetime': appointment_time.strftime('%Y-%m-%d %H:%M'),
        'duration_minutes': random.choice([15, 30, 45, 60]),
        'status': random.choice(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled']),
        'location': random.choice(['Main Hospital', 'Clinic A', 'Clinic B', 'Telemedicine', 'Emergency']),
        'cost_usd': random.randint(50, 500),
        'insurance_covered': random.choice(['Yes', 'No', 'Partial']),
        'notes': 'Standard appointment' if random.random() > 0.3 else 'Follow-up required',
        'priority': random.choice(['Low', 'Medium', 'High', 'Urgent'])
    }
    appointments_data.append(record)

appointments_df = pd.DataFrame(appointments_data)
appointments_df.to_csv('appointment_scheduling.csv', index=False)

print(f"✅ Created appointment_scheduling.csv with {len(appointments_df)} records")

# Summary
print("\n" + "="*80)
print("🎉 DATASET CREATION COMPLETE!")
print("="*80)
print(f"📊 Total Records Created: {8000+7000+7500+8000+5000+6000+2000+3000:,}")
print("\nDataset Files:")
print("   1. enhanced_symptom_disease_dataset.csv - 8,000 records")
print("   2. enhanced_precautions.csv - 7,000 records")
print("   3. enhanced_home_remedies.csv - 7,500 records")  
print("   4. enhanced_disease_descriptions.csv - 8,000 records")
print("   5. drug_interactions_database.csv - 5,000 records")
print("   6. health_risk_assessments.csv - 6,000 records")
print("   7. bmi_health_metrics.csv - 2,000 records")
print("   8. appointment_scheduling.csv - 3,000 records")
print("="*80)
