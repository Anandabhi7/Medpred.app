'use client';

import React, { useState, Suspense } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  HeartPulse, 
  Activity, 
  Flame, 
  Droplet, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  Utensils,
  Heart,
  Pill,
  Trash2,
  Search,
  Plus
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function ToolsPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as any;
  const [activeTab, setActiveTab] = useState<'heart' | 'diabetes' | 'macro' | 'hydration' | 'bmi' | 'drugs'>(
    ['heart', 'diabetes', 'macro', 'hydration', 'bmi', 'drugs'].includes(initialTab) ? initialTab : 'heart'
  );

  // --- 1. Heart Risk State ---
  const [heartAge, setHeartAge] = useState<number | ''>(55);
  const [heartGender, setHeartGender] = useState('Male');
  const [systolicBp, setSystolicBp] = useState<number | ''>(138);
  const [totalChol, setTotalChol] = useState<number | ''>(210);
  const [hdlChol, setHdlChol] = useState<number | ''>(45);
  const [isSmoker, setIsSmoker] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [onBpMeds, setOnBpMeds] = useState(false);
  const [heartResult, setHeartResult] = useState<any>(null);
  const [heartLoading, setHeartLoading] = useState(false);

  // --- 2. Diabetes Risk State ---
  const [diabAge, setDiabAge] = useState<number | ''>(48);
  const [diabGender, setDiabGender] = useState('Male');
  const [familyHist, setFamilyHist] = useState(true);
  const [highBpHist, setHighBpHist] = useState(true);
  const [activeHist, setActiveHist] = useState(false);
  const [diabBmi, setDiabBmi] = useState<number | ''>(27.5);
  const [diabResult, setDiabResult] = useState<any>(null);
  const [diabLoading, setDiabLoading] = useState(false);

  // --- 3. Macro & TDEE State ---
  const [tdeeAge, setTdeeAge] = useState<number | ''>(30);
  const [tdeeGender, setTdeeGender] = useState('Male');
  const [tdeeHeight, setTdeeHeight] = useState<number | ''>(175);
  const [tdeeWeight, setTdeeWeight] = useState<number | ''>(72);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [fitnessGoal, setFitnessGoal] = useState('maintain');
  const [tdeeResult, setTdeeResult] = useState<any>(null);
  const [tdeeLoading, setTdeeLoading] = useState(false);

  // --- 4. Hydration State ---
  const [hydroWeight, setHydroWeight] = useState<number | ''>(70);
  const [exerciseMins, setExerciseMins] = useState<number | ''>(45);
  const [climate, setClimate] = useState('moderate');
  const [hydroResult, setHydroResult] = useState<any>(null);
  const [hydroLoading, setHydroLoading] = useState(false);

  // --- 5. BMI State ---
  const [bmiHeight, setBmiHeight] = useState<number | ''>(175);
  const [bmiWeight, setBmiWeight] = useState<number | ''>(70);
  const [bmiResult, setBmiResult] = useState<any>(null);
  const [bmiLoading, setBmiLoading] = useState(false);

  // --- 6. Drug Interactions State ---
  const [drugs, setDrugs] = useState<string[]>([]);
  const [drugInput, setDrugInput] = useState('');
  const [drugResult, setDrugResult] = useState<any>(null);
  const [drugLoading, setDrugLoading] = useState(false);
  const [drugError, setDrugError] = useState<string | null>(null);

  const sampleMedications = [
    'Warfarin', 'Aspirin', 'Ibuprofen', 'Lisinopril', 
    'Metformin', 'Atorvastatin', 'Insulin', 'Omeprazole',
    'Furosemide', 'Gabapentin', 'Acetaminophen', 'Sertraline'
  ];

  const handleAddDrug = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    if (drugs.includes(formatted)) {
      setDrugError('Medication already added');
      return;
    }
    setDrugs([...drugs, formatted]);
    setDrugInput('');
    setDrugError(null);
    setDrugResult(null);
  };

  const handleRemoveDrug = (name: string) => {
    setDrugs(drugs.filter((d) => d !== name));
    setDrugResult(null);
  };

  const handleCheckDrugInteractions = async () => {
    if (drugs.length < 2) {
      setDrugError('Please add at least two drugs to check compatibility');
      return;
    }
    setDrugLoading(true);
    setDrugError(null);
    try {
      const res = await axiosClient.post('/api/drug-interactions', { drugs });
      if (res.data?.success) setDrugResult(res.data);
    } catch (err: any) {
      setDrugError(err.response?.data?.error || 'Failed to check drug compatibility.');
    } finally {
      setDrugLoading(false);
    }
  };

  // Submit Handlers
  const handleCalculateHeart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heartAge || !systolicBp || !totalChol || !hdlChol) return;
    setHeartLoading(true);
    try {
      const res = await axiosClient.post('/api/calculators/heart-risk', {
        age: Number(heartAge),
        gender: heartGender,
        systolic_bp: Number(systolicBp),
        total_cholesterol: Number(totalChol),
        hdl_cholesterol: Number(hdlChol),
        is_smoker: isSmoker,
        has_diabetes: hasDiabetes,
        on_bp_meds: onBpMeds
      });
      if (res.data?.success) setHeartResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHeartLoading(false);
    }
  };

  const handleCalculateDiabetes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diabAge || !diabBmi) return;
    setDiabLoading(true);
    try {
      const res = await axiosClient.post('/api/calculators/diabetes-risk', {
        age: Number(diabAge),
        gender: diabGender,
        family_history: familyHist,
        high_bp: highBpHist,
        physically_active: activeHist,
        bmi: Number(diabBmi)
      });
      if (res.data?.success) setDiabResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDiabLoading(false);
    }
  };

  const handleCalculateTdee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tdeeAge || !tdeeHeight || !tdeeWeight) return;
    setTdeeLoading(true);
    try {
      const res = await axiosClient.post('/api/calculators/macro-tdee', {
        age: Number(tdeeAge),
        gender: tdeeGender,
        height_cm: Number(tdeeHeight),
        weight_kg: Number(tdeeWeight),
        activity_level: activityLevel,
        goal: fitnessGoal
      });
      if (res.data?.success) setTdeeResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTdeeLoading(false);
    }
  };

  const handleCalculateHydration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hydroWeight) return;
    setHydroLoading(true);
    try {
      const res = await axiosClient.post('/api/calculators/hydration', {
        weight_kg: Number(hydroWeight),
        exercise_minutes: Number(exerciseMins || 0),
        climate: climate
      });
      if (res.data?.success) setHydroResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHydroLoading(false);
    }
  };

  const handleCalculateBmi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmiHeight || !bmiWeight) return;
    setBmiLoading(true);
    try {
      const res = await axiosClient.post('/api/bmi-calculator', {
        height: Number(bmiHeight),
        weight: Number(bmiWeight)
      });
      if (res.data?.success) setBmiResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setBmiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 border border-teal-100">
          <Zap className="h-3.5 w-3.5" />
          <span>Interactive Clinical & Wellness Tools</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">Health Calculators Suite</h1>
        <p className="text-sm text-slate-500 mt-1">
          Evidence-based risk calculators, metabolic estimators, and daily health tools.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('heart')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'heart'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <HeartPulse className="h-4 w-4" />
          <span>Heart Risk (ASCVD)</span>
        </button>

        <button
          onClick={() => setActiveTab('diabetes')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'diabetes'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Diabetes Risk (ADA)</span>
        </button>

        <button
          onClick={() => setActiveTab('macro')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'macro'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Macro & TDEE</span>
        </button>

        <button
          onClick={() => setActiveTab('hydration')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hydration'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Droplet className="h-4 w-4" />
          <span>Hydration Estimator</span>
        </button>

        <button
          onClick={() => setActiveTab('bmi')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bmi'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>BMI Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('drugs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'drugs'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Pill className="h-4 w-4" />
          <span>Drug Interactions</span>
        </button>
      </div>

      {/* TAB 1: HEART RISK (ASCVD) */}
      {activeTab === 'heart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCalculateHeart} className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <HeartPulse className="h-5 w-5 mr-2 text-red-600" />
              10-Year ASCVD Cardiovascular Risk
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={heartAge}
                  onChange={(e) => setHeartAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={heartGender}
                  onChange={(e) => setHeartGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Chol (mg/dL)</label>
                <input
                  type="number"
                  value={totalChol}
                  onChange={(e) => setTotalChol(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HDL Chol (mg/dL)</label>
                <input
                  type="number"
                  value={hdlChol}
                  onChange={(e) => setHdlChol(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSmoker}
                  onChange={(e) => setIsSmoker(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Currently Smoke Cigarettes</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDiabetes}
                  onChange={(e) => setHasDiabetes(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Diagnosed with Diabetes</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onBpMeds}
                  onChange={(e) => setOnBpMeds(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Taking Blood Pressure Medication</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={heartLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              {heartLoading ? 'Calculating ASCVD Score...' : 'Calculate Heart Risk %'}
            </button>
          </form>

          {/* Heart Result */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col justify-center">
            {heartResult ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-red-50/60 rounded-2xl border border-red-100">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">10-Year Heart Attack & Stroke Risk</span>
                  <div className="text-5xl font-black text-red-700 my-2">{heartResult.risk_percentage}%</div>
                  <span className="inline-block px-3 py-1 bg-white text-xs font-bold rounded-full text-red-800 border border-red-200 shadow-sm">
                    {heartResult.category}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center">
                    <Info className="h-4 w-4 mr-1.5 text-red-600" />
                    Clinical Guidance Advisory
                  </div>
                  <p>{heartResult.advisory}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <HeartPulse className="h-12 w-12 mx-auto mb-3 opacity-30 text-red-600" />
                <p className="text-xs font-medium">Enter patient cardiovascular parameters on the left to calculate 10-year risk score.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIABETES RISK (ADA) */}
      {activeTab === 'diabetes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCalculateDiabetes} className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-amber-600" />
              ADA Type 2 Diabetes Risk Score
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={diabAge}
                  onChange={(e) => setDiabAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={diabGender}
                  onChange={(e) => setDiabGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Body Mass Index (BMI)</label>
              <input
                type="number"
                step="0.1"
                value={diabBmi}
                onChange={(e) => setDiabBmi(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                required
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyHist}
                  onChange={(e) => setFamilyHist(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Family History of Diabetes (Mother/Father/Sibling)</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highBpHist}
                  onChange={(e) => setHighBpHist(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Diagnosed with High Blood Pressure</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeHist}
                  onChange={(e) => setActiveHist(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Physically Active (Exercise 3+ times a week)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={diabLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              {diabLoading ? 'Calculating Risk Score...' : 'Calculate Diabetes Risk Score'}
            </button>
          </form>

          {/* Diabetes Result */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col justify-center">
            {diabResult ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-amber-50/70 rounded-2xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">ADA Diabetes Risk Score</span>
                  <div className="text-5xl font-black text-amber-800 my-2">{diabResult.score} / {diabResult.max_score}</div>
                  <span className={`inline-block px-3 py-1 bg-white text-xs font-bold rounded-full border shadow-sm ${
                    diabResult.is_high_risk ? 'text-red-700 border-red-200' : 'text-green-700 border-green-200'
                  }`}>
                    {diabResult.risk_tier}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center">
                    <Info className="h-4 w-4 mr-1.5 text-amber-600" />
                    Screening Recommendation
                  </div>
                  <p>{diabResult.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-30 text-amber-600" />
                <p className="text-xs font-medium">Enter patient details to calculate ADA prediabetes risk score.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MACRO & TDEE CALCULATOR */}
      {activeTab === 'macro' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCalculateTdee} className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Flame className="h-5 w-5 mr-2 text-indigo-600" />
              TDEE & Daily Macronutrient Calculator
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={tdeeAge}
                  onChange={(e) => setTdeeAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={tdeeHeight}
                  onChange={(e) => setTdeeHeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={tdeeWeight}
                  onChange={(e) => setTdeeWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="sedentary">Sedentary (Little/no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (Heavy training)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="lose">Weight Loss (-20% deficit)</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Muscle Gain (+15% surplus)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={tdeeLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              {tdeeLoading ? 'Calculating TDEE...' : 'Calculate Energy & Macro Targets'}
            </button>
          </form>

          {/* TDEE Result */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col justify-center">
            {tdeeResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Basal Metabolic Rate (BMR)</span>
                    <span className="text-2xl font-black text-indigo-900">{tdeeResult.bmr} kcal</span>
                  </div>
                  <div className="p-4 bg-indigo-600 text-white rounded-xl shadow">
                    <span className="text-[10px] font-bold uppercase tracking-widest block opacity-80">Target Daily Calories</span>
                    <span className="text-2xl font-black">{tdeeResult.target_calories} kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Protein</span>
                    <span className="text-lg font-black text-slate-800">{tdeeResult.macros.protein_g}g</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Carbs</span>
                    <span className="text-lg font-black text-slate-800">{tdeeResult.macros.carbs_g}g</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Fats</span>
                    <span className="text-lg font-black text-slate-800">{tdeeResult.macros.fats_g}g</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <Flame className="h-12 w-12 mx-auto mb-3 opacity-30 text-indigo-600" />
                <p className="text-xs font-medium">Enter body metrics to calculate daily TDEE and macro distribution.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: HYDRATION ESTIMATOR */}
      {activeTab === 'hydration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCalculateHydration} className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Droplet className="h-5 w-5 mr-2 text-cyan-600" />
              Daily Fluid Intake & Hydration Target
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Body Weight (kg)</label>
              <input
                type="number"
                value={hydroWeight}
                onChange={(e) => setHydroWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Exercise (Mins)</label>
                <input
                  type="number"
                  value={exerciseMins}
                  onChange={(e) => setExerciseMins(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Climate</label>
                <select
                  value={climate}
                  onChange={(e) => setClimate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="cold">Cool / AC Environment</option>
                  <option value="moderate">Moderate Climate</option>
                  <option value="hot">Hot / Humid Climate</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={hydroLoading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer"
            >
              {hydroLoading ? 'Calculating Water Target...' : 'Calculate Hydration Target'}
            </button>
          </form>

          {/* Hydration Result */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col justify-center">
            {hydroResult ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-cyan-50/70 rounded-2xl border border-cyan-100">
                  <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest block mb-1">Recommended Daily Fluid Target</span>
                  <div className="text-5xl font-black text-cyan-900 my-2">{hydroResult.total_liters} Liters</div>
                  <span className="inline-block px-3 py-1 bg-white text-xs font-bold rounded-full text-cyan-800 border border-cyan-200 shadow-sm">
                    Approx. {hydroResult.glasses} Glasses (250ml)
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hydration Schedule Tips</h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                    {hydroResult.hydration_schedule.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <Droplet className="h-12 w-12 mx-auto mb-3 opacity-30 text-cyan-600" />
                <p className="text-xs font-medium">Enter body mass and exertion level to estimate fluid requirements.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BMI CALCULATOR */}
      {activeTab === 'bmi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left column: Body Metrics input form */}
            <div className="lg:col-span-5">
              <form onSubmit={handleCalculateBmi} className="glass-card rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-teal-600" />
                  Body Metrics
                </h3>

                {/* Height slider & input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>HEIGHT</span>
                    <span className="font-bold text-slate-900 normal-case">{bmiHeight || 170} cm</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    value={bmiHeight || 170}
                    onChange={(e) => setBmiHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      value={bmiHeight}
                      onChange={(e) => setBmiHeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="170"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-xs font-medium"
                      required
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">cm</span>
                  </div>
                </div>

                {/* Weight slider & input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>WEIGHT</span>
                    <span className="font-bold text-slate-900 normal-case">{bmiWeight || 70} kg</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="180"
                    value={bmiWeight || 70}
                    onChange={(e) => setBmiWeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={bmiWeight}
                      onChange={(e) => setBmiWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="70"
                      className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-xs font-medium"
                      required
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">kg</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bmiLoading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
                >
                  {bmiLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Calculate Health Metrics'
                  )}
                </button>
              </form>
            </div>

            {/* Right column: BMI Index Score & Health Analysis */}
            <div className="lg:col-span-7">
              {bmiResult ? (
                <div className="space-y-6 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Score Gauge */}
                    <div className="glass-card rounded-2xl border border-slate-200/60 p-5 space-y-4 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        BMI INDEX SCORE
                      </h4>
                      <div className="text-center py-2 space-y-1">
                        <h2 className="text-5xl font-black text-slate-900">
                          {bmiResult.bmi}
                        </h2>
                        <div className="inline-block mt-2">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 shadow-sm`}>
                            {bmiResult.category}
                          </span>
                        </div>
                      </div>

                      {/* Spectrum range bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 relative">
                          <div
                            className="absolute w-4 h-4 bg-slate-900 border-2 border-white rounded-full -top-1 shadow transition-all"
                            style={{ left: `${Math.min(Math.max((bmiResult.bmi - 15) * 3.3, 2), 98)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span>15 (Under)</span>
                          <span>18.5 (Normal)</span>
                          <span>25 (Over)</span>
                          <span>30 (Obese)</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Analysis */}
                    <div className="glass-card rounded-2xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          HEALTH ANALYSIS
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-500">Risk Assessment:</span>
                            <span className="font-bold text-slate-800">{bmiResult.risk_level}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-500">Ideal Weight Range:</span>
                            <span className="font-bold text-slate-800">
                              {bmiResult.ideal_weight_range.min} - {bmiResult.ideal_weight_range.max} kg
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl flex items-start space-x-2 text-[11px] mt-4">
                        <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-teal-800 leading-relaxed font-medium">
                          Maintaining a BMI between 18.5 and 24.9 decreases the risk of cardiovascular ailments, diabetes, and joint fatigue.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                      HEALTH GUIDANCE RECOMMENDATIONS
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Nutrition Advice */}
                      <div className="glass-card rounded-2xl border border-slate-200/60 p-4 space-y-2 shadow-sm">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Nutrition Advice</h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {bmiResult.recommendations?.diet || 'Maintain a balanced diet rich in fruits and vegetables'}
                        </p>
                      </div>

                      {/* Physical Activity */}
                      <div className="glass-card rounded-2xl border border-slate-200/60 p-4 space-y-2 shadow-sm">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit">
                          <Flame className="h-4 w-4" />
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Physical Activity</h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {bmiResult.recommendations?.exercise || 'Regular physical activity for at least 150 minutes per week'}
                        </p>
                      </div>

                      {/* Lifestyle Habits */}
                      <div className="glass-card rounded-2xl border border-slate-200/60 p-4 space-y-2 shadow-sm">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl w-fit">
                          <Heart className="h-4 w-4" />
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Lifestyle habits</h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {bmiResult.recommendations?.lifestyle || 'Maintain healthy lifestyle habits and regular check-ups'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[350px] flex flex-col items-center justify-center glass-card rounded-2xl border border-slate-200/60 p-8 text-center text-slate-400 shadow-sm">
                  <Scale className="h-16 w-16 opacity-25 mb-4 text-teal-600 animate-pulse-slow" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Assessment Awaiting Metrics</h3>
                  <p className="text-xs max-w-sm mx-auto text-slate-500">
                    Adjust the sliders or enter your height and weight on the left, then click <strong>"Calculate Health Metrics"</strong> to view your detailed BMI report.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DRUG INTERACTIONS CHECKER */}
      {activeTab === 'drugs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left column: Add Medications */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Pill className="h-5 w-5 mr-2 text-purple-600" />
                Prescription Registry
              </h3>

              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={drugInput}
                    onChange={(e) => setDrugInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDrug(drugInput)}
                    placeholder="Type medication (e.g. Aspirin)..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-xs font-medium"
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddDrug(drugInput)}
                  className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Registered Medications ({drugs.length})
                </span>
                {drugs.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                    <p className="text-xs font-medium">Add at least two medications to analyze compatibility.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {drugs.map((d) => (
                      <span
                        key={d}
                        onClick={() => handleRemoveDrug(d)}
                        className="inline-flex items-center text-xs font-semibold py-1.5 pl-3 pr-2 bg-slate-100 text-slate-700 rounded-full border border-slate-200 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer group"
                      >
                        {d}
                        <Trash2 className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckDrugInteractions}
                disabled={drugs.length < 2 || drugLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
              >
                {drugLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Analyze Drug Compatibility'
                )}
              </button>

              {drugError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                  {drugError}
                </div>
              )}
            </div>

            {/* Quick-add test pairs */}
            <div className="glass-card rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Suggested Test Medications
              </h4>
              <p className="text-[11px] text-slate-500">
                Click common drugs to add them immediately and verify clinical interactions:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sampleMedications.map((m) => (
                  <button
                    key={m}
                    disabled={drugs.includes(m)}
                    onClick={() => handleAddDrug(m)}
                    className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 cursor-pointer transition-all"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Results display */}
          <div className="lg:col-span-7">
            {drugResult ? (
              <div className="space-y-5 animate-slide-up">
                {/* Safety summary banner */}
                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 flex items-start space-x-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-purple-900">
                      Safety Assessment: {drugResult.safety_level}
                    </h4>
                    <p className="text-xs text-purple-700 leading-relaxed">
                      {drugResult.recommendation}
                    </p>
                  </div>
                </div>

                {/* Interactions list */}
                {drugResult.interactions_found > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                      Identified Clinical Interactions ({drugResult.interactions_found})
                    </h4>

                    {drugResult.interactions.map((item: any, idx: number) => (
                      <div key={idx} className="glass-card rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="font-bold text-xs text-slate-900 flex items-center">
                            {item.drug1}
                            <ChevronRight className="h-3.5 w-3.5 mx-1 text-slate-400" />
                            {item.drug2}
                          </span>

                          <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider ${
                            item.severity.toLowerCase() === 'severe' || item.severity.toLowerCase() === 'major'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : item.severity.toLowerCase() === 'moderate'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {item.severity} Severity
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Clinical Effect</span>
                          <p className="text-slate-700 font-medium">{item.effect || 'N/A'}</p>
                        </div>

                        <div className="space-y-1 text-xs border-t border-slate-100 pt-2">
                          <span className="font-bold text-slate-400 block uppercase tracking-wider text-[9px]">Mechanism & Management</span>
                          <p className="text-slate-600 leading-relaxed">{item.mechanism || item.warning || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                    No direct severe interactions identified for this specific drug combination in our clinical dataset. Always consult your prescribing physician.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[350px] flex flex-col items-center justify-center glass-card rounded-2xl border border-slate-200/60 p-8 text-center text-slate-400 shadow-sm">
                <Pill className="h-16 w-16 opacity-25 mb-4 text-purple-600 animate-pulse-slow" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">Check Drug Compatibility</h3>
                <p className="text-xs max-w-sm mx-auto text-slate-500">
                  Add two or more prescription or over-the-counter medications on the left, then click <strong>"Analyze Drug Compatibility"</strong> to query clinical interaction data.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-medium">Loading Health Tools Suite...</p>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  );
}
