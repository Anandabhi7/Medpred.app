'use client';

import React, { useEffect, useState } from 'react';
import { useHealthStore } from '../../store/useHealthStore';
import { useAuthStore } from '../../store/useAuthStore';
import axiosClient from '../../api/axiosClient';
import { 
  Search, 
  Trash2, 
  AlertTriangle, 
  Activity, 
  Download, 
  FileText, 
  CheckCircle,
  HelpCircle,
  Clock,
  HeartPulse,
  Info,
  User,
  Calendar,
  Plus,
  Stethoscope,
  Sparkles,
  MapPin,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function AnalyzerPage() {
  const { 
    symptoms, 
    selectedSymptoms, 
    patientGender,
    patientAge,
    patientDurationDays,
    predictionResults, 
    loading, 
    error, 
    setPatientGender,
    setPatientAge,
    setPatientDurationDays,
    fetchSymptoms, 
    selectSymptom, 
    deselectSymptom, 
    clearSelectedSymptoms, 
    extractSymptomsFromText,
    analyzeSymptoms 
  } = useHealthStore();
  
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [naturalText, setNaturalText] = useState('');
  const [nlpExtracting, setNlpExtracting] = useState(false);
  const [nlpMessage, setNlpMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Adaptive Questioning State
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<{ symptom: string; question: string }[]>([]);
  const [showAdaptiveModal, setShowAdaptiveModal] = useState(false);
  const [fetchingAdaptive, setFetchingAdaptive] = useState(false);

  const startAdaptiveFlow = async () => {
    if (selectedSymptoms.length === 0) return;
    setFetchingAdaptive(true);
    try {
      const res = await axiosClient.post('/api/adaptive-questions', {
        symptoms: selectedSymptoms
      });
      if (res.data?.success && res.data?.questions && res.data.questions.length > 0) {
        setAdaptiveQuestions(res.data.questions);
        setShowAdaptiveModal(true);
      } else {
        // Fallback directly to analysis if no questions returned
        analyzeSymptoms();
      }
    } catch (err) {
      analyzeSymptoms();
    } finally {
      setFetchingAdaptive(false);
    }
  };

  const handleAnswerQuestion = (symptomName: string, answer: 'yes' | 'no') => {
    if (answer === 'yes') {
      selectSymptom(symptomName);
    }
    // Remove answered question from list
    setAdaptiveQuestions((prev) => prev.filter((q) => q.symptom !== symptomName));
  };

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  // Pre-fill user age if logged in and age is empty
  useEffect(() => {
    if (user?.age && (patientAge === '' || patientAge === null)) {
      setPatientAge(user.age);
    }
  }, [user, patientAge, setPatientAge]);

  // Filtered symptoms list
  const filteredSymptomsList = symptoms.filter(
    (sym) => 
      sym.replace(/_/g, ' ').toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedSymptoms.includes(sym)
  );

  const handleSelect = (sym: string) => {
    selectSymptom(sym);
    setSearchQuery('');
  };

  const handleNlpExtract = async () => {
    if (!naturalText.trim()) return;
    setNlpExtracting(true);
    setNlpMessage(null);
    try {
      const extracted = await extractSymptomsFromText(naturalText);
      if (extracted.length > 0) {
        setNlpMessage(`Successfully extracted ${extracted.length} symptom(s) from your description!`);
      } else {
        setNlpMessage('No standard symptoms recognized in text. Try describing your symptoms in different words or selecting from the catalog below.');
      }
    } catch (err) {
      setNlpMessage('Failed to extract symptoms. Please try selecting manually below.');
    } finally {
      setNlpExtracting(false);
    }
  };

  const handleDownload = async () => {
    if (!predictionResults) return;
    setDownloading(true);
    try {
      const res = await axiosClient.post('/api/generate-report', {
        prediction_data: predictionResults
      });
      if (res.data?.success && res.data?.report_content) {
        const element = document.createElement("a");
        const file = new Blob([res.data.report_content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = res.data.filename || "medpredictor_report.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error('Failed to download report', err);
    } finally {
      setDownloading(false);
    }
  };

  // Helper to determine specialist type from disease name
  const getSpecialtyName = (disease: string) => {
    const d = disease.toLowerCase();
    if (d.includes('heart') || d.includes('cardiac') || d.includes('hypertension') || d.includes('blood pressure')) return 'Cardiologist';
    if (d.includes('brain') || d.includes('neurolog') || d.includes('migraine') || d.includes('stroke') || d.includes('seizure')) return 'Neurologist';
    if (d.includes('lung') || d.includes('pneumonia') || d.includes('asthma') || d.includes('bronchitis') || d.includes('tb') || d.includes('tuberculosis')) return 'Pulmonologist';
    if (d.includes('stomach') || d.includes('digestive') || d.includes('gastric') || d.includes('hepatitis') || d.includes('ulcer')) return 'Gastroenterologist';
    if (d.includes('diabetes') || d.includes('thyroid') || d.includes('hormone')) return 'Endocrinologist';
    return 'General Physician';
  };

  // Radar Chart configurations
  const getChartData = () => {
    if (!predictionResults || !predictionResults.predictions) return null;
    const topPreds = predictionResults.predictions.slice(0, 5);
    
    return {
      labels: topPreds.map(p => p.disease),
      datasets: [
        {
          label: 'AI Confidence Score (%)',
          data: topPreds.map(p => p.confidence),
          backgroundColor: 'rgba(13, 148, 136, 0.2)',
          borderColor: 'rgba(13, 148, 136, 1)',
          pointBackgroundColor: 'rgba(13, 148, 136, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(13, 148, 136, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        pointLabels: {
          font: {
            family: 'Geist, sans-serif',
            size: 11,
          },
          color: '#64748b',
        },
        ticks: {
          display: false,
        },
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const chartData = getChartData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full mb-2 border border-teal-100">
            <Stethoscope className="h-3.5 w-3.5" />
            <span>AI Symptom Diagnostics & Health Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">AI Symptom Analyzer</h1>
          <p className="text-sm text-slate-500 mt-1">Provide your patient profile and symptoms for personalized disease probability predictions.</p>
        </div>
        {predictionResults && (
          <button
            onClick={clearSelectedSymptoms}
            className="mt-3 sm:mt-0 px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            Reset Analyzer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Questionnaire & Symptoms Selection */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 1: Patient Demographics */}
          <div className="glass-card rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-teal-600" />
                Step 1: Patient Information
              </h3>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                Required for Accuracy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>

              {/* Age Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="e.g. 28"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Duration Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>From how many days do you have these symptoms?</span>
                <span className="text-[10px] text-slate-400 font-normal">Duration in days</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={patientDurationDays}
                  onChange={(e) => setPatientDurationDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="e.g. 3"
                  className="w-full pl-9 pr-16 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <span className="absolute right-3 top-2.5 text-xs font-medium text-slate-400">
                  {patientDurationDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Symptom Entry Panel */}
          <div className="glass-card rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <HeartPulse className="h-5 w-5 mr-2 text-teal-600" />
                Step 2: Select Symptoms
              </h3>
              <span className="text-xs font-bold text-teal-600">
                {selectedSymptoms.length} Selected
              </span>
            </div>

            {/* NATURAL LANGUAGE SYMPTOM EXTRACTION (NLP Input) */}
            <div className="p-4 bg-gradient-to-br from-teal-50/70 to-indigo-50/70 rounded-xl border border-teal-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1.5 text-teal-600 animate-pulse" />
                  Describe How You Feel (AI Extractor)
                </label>
                <span className="text-[10px] text-teal-700 bg-white/80 px-2 py-0.5 rounded-full font-semibold border border-teal-100">
                  Natural Text
                </span>
              </div>
              <textarea
                rows={2}
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g. 'I woke up with a sharp stomach pain, felt nauseous, and have a slight fever...'"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800 resize-none"
              />
              <button
                type="button"
                onClick={handleNlpExtract}
                disabled={!naturalText.trim() || nlpExtracting}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer"
              >
                {nlpExtracting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Extract Symptoms with AI
                  </>
                )}
              </button>
              {nlpMessage && (
                <p className="text-[11px] font-medium text-teal-800 bg-white/90 p-2 rounded-lg border border-teal-100">
                  {nlpMessage}
                </p>
              )}
            </div>

            {/* Manual Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Or search symptoms manually (e.g. headache, fever)..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-xs"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scrollable Symptoms Catalog */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                {searchQuery ? 'Matching Symptoms' : 'Available Symptoms Catalog'}
              </span>
              <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl bg-slate-50/50 p-2 space-y-1">
                {filteredSymptomsList.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">
                    {searchQuery ? 'No matching symptoms found.' : 'All available symptoms have been added.'}
                  </p>
                ) : (
                  filteredSymptomsList.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => handleSelect(sym)}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-teal-50 hover:text-teal-700 text-slate-700 flex items-center justify-between group transition-all cursor-pointer"
                    >
                      <span className="capitalize">{sym.replace(/_/g, ' ')}</span>
                      <Plus className="h-3.5 w-3.5 text-slate-300 group-hover:text-teal-600 transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Scrollable Active Symptoms Container */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">
                  Active Symptoms List ({selectedSymptoms.length})
                </span>
                {selectedSymptoms.length > 0 && (
                  <button
                    onClick={clearSelectedSymptoms}
                    className="text-xs font-medium text-red-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {selectedSymptoms.length === 0 ? (
                <div className="p-6 text-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Activity className="h-7 w-7 mx-auto opacity-30 mb-2 text-teal-600" />
                  <p className="text-xs font-medium">Describe how you feel above or select symptoms from the catalog.</p>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-2.5 bg-white space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((sym) => (
                      <span
                        key={sym}
                        onClick={() => deselectSymptom(sym)}
                        className="inline-flex items-center text-xs font-medium py-1.5 pl-3 pr-2 bg-teal-50 text-teal-700 border border-teal-100 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer group"
                      >
                        <span className="capitalize">{sym.replace(/_/g, ' ')}</span>
                        <Trash2 className="ml-1.5 h-3.5 w-3.5 text-teal-500 group-hover:text-red-500 transition-colors" />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={startAdaptiveFlow}
              disabled={selectedSymptoms.length === 0 || loading || fetchingAdaptive}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg disabled:opacity-40 disabled:hover:scale-100 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
            >
              {loading || fetchingAdaptive ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Analyze Symptoms Now
                </>
              )}
            </button>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Diagnostic Results */}
        <div className="lg:col-span-7 space-y-6">
          {predictionResults ? (
            <div className="space-y-6">
              {/* Top Prediction Overview */}
              <div className="glass-card rounded-2xl border border-slate-200/60 p-6 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                      Step 3: Primary AI Finding
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">
                      {predictionResults.top_prediction.disease}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center text-xs font-bold py-1.5 px-3 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg">
                      {predictionResults.top_prediction.confidence}% Match Confidence
                    </span>
                    
                    {/* Severity Badge */}
                    <span className={`inline-flex items-center text-xs font-semibold py-1.5 px-3 rounded-lg border ${
                      predictionResults.top_prediction.severity.toLowerCase() === 'severe'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : predictionResults.top_prediction.severity.toLowerCase() === 'moderate'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {predictionResults.top_prediction.severity} Severity
                    </span>
                  </div>
                </div>

                {/* Patient Summary Header inside Results */}
                {predictionResults.patient_info && (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-medium">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-teal-600" />
                      <span>
                        Gender: <strong className="text-slate-900">{predictionResults.patient_info.gender || 'Not Specified'}</strong>
                      </span>
                    </div>
                    {predictionResults.patient_info.age !== null && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        <span>
                          Age: <strong className="text-slate-900">{predictionResults.patient_info.age} yrs</strong>
                        </span>
                      </div>
                    )}
                    {predictionResults.patient_info.duration_days !== null && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-teal-600" />
                        <span>
                          Duration: <strong className="text-slate-900">{predictionResults.patient_info.duration_days} day(s)</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ada-Style Clinical Triage Banner */}
                {predictionResults.triage_info && (
                  <div className={`p-4 rounded-xl border space-y-1.5 shadow-2xs ${
                    predictionResults.triage_info.level === 'emergency'
                      ? 'bg-red-50 text-red-900 border-red-200'
                      : predictionResults.triage_info.level === 'urgent'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs flex items-center">
                        <Activity className="h-4 w-4 mr-1.5 shrink-0" />
                        {predictionResults.triage_info.badge}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70">
                        {predictionResults.triage_info.level}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 font-medium">
                      ⏱️ {predictionResults.triage_info.timeframe}
                    </p>
                  </div>
                )}

                {/* K Health-Style "Patients Like You" Case Match Statistics */}
                {predictionResults.case_match && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-slate-50 border border-indigo-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-900 flex items-center">
                        <Sparkles className="h-4 w-4 mr-1.5 text-indigo-600" />
                        K Health Case Match: {predictionResults.case_match.demographic_cohort}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                        {predictionResults.case_match.match_percentage}% Statistical Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {predictionResults.case_match.prevalence_note}
                    </p>
                  </div>
                )}

                {/* Clinical duration notes alert */}
                {predictionResults.top_prediction.clinical_notes && predictionResults.top_prediction.clinical_notes.length > 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center text-xs font-bold text-amber-800">
                      <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-600" />
                      Clinical Context Advisory
                    </div>
                    <ul className="text-xs text-amber-700 list-disc pl-5 space-y-0.5">
                      {predictionResults.top_prediction.clinical_notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Condition Overview</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    {predictionResults.top_prediction.description}
                  </p>
                </div>

                {/* Precautions and remedies grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1.5 text-teal-600" />
                      Recommended Precautions
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2">
                      {predictionResults.top_prediction.precautions.map((p, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-teal-600 rounded-full mt-1.5 mr-2 shrink-0"></span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                      <HelpCircle className="h-4 w-4 mr-1.5 text-indigo-600" />
                      Home Care & Remedies
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2">
                      {predictionResults.top_prediction.home_remedies.map((r, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 mr-2 shrink-0"></span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* VERIFIED DOCTORS & CLINIC SEARCH Integration */}
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-800">Verified Doctor & Specialist Referral</h4>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {getSpecialtyName(predictionResults.top_prediction.disease)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    For a formal clinical evaluation, consult a verified <strong>{getSpecialtyName(predictionResults.top_prediction.disease)}</strong> or visit your nearest primary health center.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(getSpecialtyName(predictionResults.top_prediction.disease) + ' doctors and clinics near me')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all inline-flex items-center shadow-sm cursor-pointer"
                    >
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      Find {getSpecialtyName(predictionResults.top_prediction.disease)}s on Google Maps
                      <ExternalLink className="h-3 w-3 ml-1.5 opacity-80" />
                    </a>
                  </div>
                </div>

                {/* Actions: Download Report */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Analyzed at {new Date(predictionResults.analysis_timestamp).toLocaleTimeString()}
                  </span>
                  
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md"
                  >
                    {downloading ? (
                      <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Download Full Medical Report (.txt)
                  </button>
                </div>
              </div>

              {/* Chart and Top Predictions split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Predictions Confidence Chart */}
                <div className="md:col-span-7 glass-card rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Confidence Distribution
                  </h4>
                  <div className="h-56 relative flex items-center justify-center">
                    {chartData && <Radar data={chartData} options={chartOptions} />}
                  </div>
                </div>

                {/* Top 5 list */}
                <div className="md:col-span-5 glass-card rounded-2xl border border-slate-200/60 p-5 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Differential Diagnosis
                  </h4>
                  
                  <div className="space-y-3.5">
                    {predictionResults.predictions.map((p) => (
                      <div key={p.rank} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs font-bold w-5 h-5 rounded bg-slate-100 text-slate-500 flex items-center justify-center">
                            {p.rank}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {p.disease}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          {p.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[440px] flex flex-col items-center justify-center glass-card rounded-2xl border border-slate-200/60 p-8 text-center text-slate-400 shadow-sm">
              <FileText className="h-16 w-16 opacity-25 mb-4 animate-pulse-slow text-teal-600" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Awaiting Diagnosis Input</h3>
              <p className="text-xs max-w-sm mx-auto text-slate-500 leading-relaxed">
                Describe how you feel or pick symptoms, then click <strong>"Analyze Symptoms Now"</strong> to generate your diagnostic prediction report.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ada Health-Style Adaptive Questioning Modal */}
      {showAdaptiveModal && adaptiveQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-slide-up">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-teal-600 animate-pulse" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Ada Adaptive Follow-Up Refinement
                </h3>
              </div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                {adaptiveQuestions.length} Questions Remaining
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              To refine diagnostic precision, please answer these targeted clinical questions based on your reported symptoms:
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {adaptiveQuestions.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    {q.question}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAnswerQuestion(q.symptom, 'yes')}
                      className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Yes, I have this
                    </button>
                    <button
                      onClick={() => handleAnswerQuestion(q.symptom, 'no')}
                      className="flex-1 py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      No / Unsure
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[10px] text-slate-400">
                Questions optimize diagnostic accuracy
              </span>
              <button
                onClick={() => {
                  setShowAdaptiveModal(false);
                  analyzeSymptoms();
                }}
                className="py-2.5 px-5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Generate Final Diagnostic Report ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
