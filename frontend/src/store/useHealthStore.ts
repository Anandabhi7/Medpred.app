import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

interface Prediction {
  rank: number;
  disease: string;
  confidence: number;
  probability: number;
  severity: string;
  urgency: string;
}

interface TopPredictionDetail {
  disease: string;
  confidence: number;
  severity: string;
  urgency: string;
  description: string;
  precautions: string[];
  home_remedies: string[];
  clinical_notes?: string[];
}

interface PatientInfo {
  gender?: string;
  age?: number | null;
  duration_days?: number | null;
}

interface PredictResponse {
  success: boolean;
  selected_symptoms: string[];
  patient_info?: PatientInfo;
  predictions: Prediction[];
  top_prediction: TopPredictionDetail;
  total_diseases_analyzed: number;
  analysis_timestamp: string;
  triage_info?: {
    level: string;
    badge: string;
    timeframe: string;
    color: string;
  };
  case_match?: {
    total_cases_analyzed: number;
    match_percentage: number;
    demographic_cohort: string;
    prevalence_note: string;
  };
  differential_radar?: Prediction[];
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  taken_today: boolean;
}

interface Appointment {
  id: number;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
}

interface HealthState {
  symptoms: string[];
  selectedSymptoms: string[];
  patientGender: string;
  patientAge: number | '';
  patientDurationDays: number | '';
  predictionResults: PredictResponse | null;
  medications: Medication[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  
  setPatientGender: (gender: string) => void;
  setPatientAge: (age: number | '') => void;
  setPatientDurationDays: (days: number | '') => void;
  fetchSymptoms: () => Promise<void>;
  selectSymptom: (symptom: string) => void;
  deselectSymptom: (symptom: string) => void;
  clearSelectedSymptoms: () => void;
  extractSymptomsFromText: (text: string) => Promise<string[]>;
  analyzeSymptoms: (extraContext?: { gender?: string; age?: number; duration_days?: number }) => Promise<boolean>;
  
  fetchMedications: () => Promise<void>;
  addMedication: (name: string, dosage: string, frequency: string) => Promise<boolean>;
  toggleMedication: (id: number) => Promise<void>;
  
  fetchAppointments: () => Promise<void>;
  bookAppointment: (data: { doctor_name: string; specialty: string; date: string; time: string }) => Promise<boolean>;
  
  clearError: () => void;
  resetHealthState: () => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  symptoms: [],
  selectedSymptoms: [],
  patientGender: 'Male',
  patientAge: '',
  patientDurationDays: 1,
  predictionResults: null,
  medications: [],
  appointments: [],
  loading: false,
  error: null,

  setPatientGender: (gender: string) => set({ patientGender: gender }),
  setPatientAge: (age: number | '') => set({ patientAge: age }),
  setPatientDurationDays: (days: number | '') => set({ patientDurationDays: days }),

  fetchSymptoms: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.get('/api/symptoms');
      if (res.data?.success) {
        // Handle both API response styles (array directly or wrapped in list)
        const syms = Array.isArray(res.data.symptoms) ? res.data.symptoms : [];
        set({ symptoms: syms, loading: false });
      } else {
        set({ error: 'Failed to load symptoms', loading: false });
      }
    } catch (err) {
      set({ error: 'Failed to load symptoms list', loading: false });
    }
  },

  selectSymptom: (symptom) => {
    const current = get().selectedSymptoms;
    if (!current.includes(symptom)) {
      set({ selectedSymptoms: [...current, symptom] });
    }
  },

  deselectSymptom: (symptom) => {
    set({
      selectedSymptoms: get().selectedSymptoms.filter((s) => s !== symptom),
    });
  },

  clearSelectedSymptoms: () => {
    set({ selectedSymptoms: [], predictionResults: null });
  },

  extractSymptomsFromText: async (text: string) => {
    if (!text.trim()) return [];
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.post('/api/extract-symptoms', { text });
      if (res.data?.success && Array.isArray(res.data.extracted_symptoms)) {
        const extracted: string[] = res.data.extracted_symptoms;
        const current = get().selectedSymptoms;
        const updated = Array.from(new Set([...current, ...extracted]));
        set({ selectedSymptoms: updated, loading: false });
        return extracted;
      }
      set({ loading: false });
      return [];
    } catch (err) {
      set({ error: 'Failed to extract symptoms from text', loading: false });
      return [];
    }
  },

  analyzeSymptoms: async (extraContext) => {
    const selected = get().selectedSymptoms;
    if (selected.length === 0) return false;
    
    const { patientGender, patientAge, patientDurationDays } = get();
    
    set({ loading: true, error: null });
    try {
      const payload = {
        symptoms: selected,
        gender: extraContext?.gender || patientGender,
        age: extraContext?.age !== undefined ? extraContext.age : (patientAge === '' ? null : Number(patientAge)),
        duration_days: extraContext?.duration_days !== undefined ? extraContext.duration_days : (patientDurationDays === '' ? null : Number(patientDurationDays))
      };
      
      const res = await axiosClient.post('/api/predict', payload);
      if (res.data?.success) {
        set({ predictionResults: res.data, loading: false });
        return true;
      }
      set({ error: res.data?.error || 'Analysis failed', loading: false });
      return false;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to complete health analysis',
        loading: false,
      });
      return false;
    }
  },

  fetchMedications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.get('/api/medications');
      if (res.data?.success) {
        set({ medications: res.data.medications, loading: false });
      } else {
        set({ error: 'Failed to fetch medications', loading: false });
      }
    } catch (err) {
      // Don't set error on console if unauthenticated, since profile handles it
      set({ loading: false });
    }
  },

  addMedication: async (name, dosage, frequency) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.post('/api/medications', { name, dosage, frequency });
      if (res.data?.success) {
        await get().fetchMedications();
        return true;
      }
      set({ error: 'Failed to add medication', loading: false });
      return false;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to add medication',
        loading: false,
      });
      return false;
    }
  },

  toggleMedication: async (id) => {
    try {
      const res = await axiosClient.post(`/api/medications/${id}/toggle`);
      if (res.data?.success) {
        set({
          medications: get().medications.map((m) =>
            m.id === id ? { ...m, taken_today: res.data.taken_today } : m
          ),
        });
      }
    } catch (err) {
      console.error('Failed to toggle medication compliance', err);
    }
  },

  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.get('/api/appointments');
      if (res.data?.success) {
        set({ appointments: res.data.appointments, loading: false });
      } else {
        set({ error: 'Failed to fetch appointments', loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },

  bookAppointment: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosClient.post('/api/appointments', data);
      if (res.data?.success) {
        await get().fetchAppointments();
        return true;
      }
      set({ error: 'Failed to book appointment', loading: false });
      return false;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to book appointment',
        loading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  
  resetHealthState: () => {
    set({
      selectedSymptoms: [],
      predictionResults: null,
      medications: [],
      appointments: [],
      error: null,
    });
  },
}));
