'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useHealthStore } from '../../store/useHealthStore';
import AuthModal from '../../components/AuthModal';
import { 
  User as UserIcon, 
  Pill, 
  Calendar, 
  Activity, 
  Scale, 
  Ruler, 
  Plus, 
  Check, 
  Clock, 
  Lock,
  Edit2,
  CalendarCheck,
  CheckSquare,
  Square
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, initialized } = useAuthStore();
  const { 
    medications, 
    appointments, 
    fetchMedications, 
    fetchAppointments, 
    addMedication, 
    toggleMedication,
    bookAppointment,
    loading 
  } = useHealthStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Edit Profile fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');

  // Add Medication fields
  const [showAddMed, setShowAddMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');

  // Add Appointment fields
  const [showAddApt, setShowAddApt] = useState(false);
  const [aptDoctor, setAptDoctor] = useState('');
  const [aptSpecialty, setAptSpecialty] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMedications();
      fetchAppointments();
      
      // Seed profile fields
      setEditName(user.name);
      setEditAge(user.age.toString());
      setEditWeight(user.weight_kg.toString());
      setEditHeight(user.height_cm.toString());
    }
  }, [user, fetchMedications, fetchAppointments]);

  if (!initialized) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Unauthenticated Welcome view
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
          <Lock className="h-7 w-7" />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900">Personal Health Tracker Locked</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Sign in or create an account to unlock your personal health panel. Track your medication schedules, book upcoming physician appointments, and monitor your weight metrics over time.
        </p>

        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
            className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            Register
          </button>
        </div>

        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </div>
    );
  }

  // Profile calculations
  const heightM = user.height_cm / 100;
  const bmi = heightM > 0 ? (user.weight_kg / (heightM * heightM)).toFixed(1) : '0';

  // Medication compliance percentage
  const takenMedsCount = medications.filter(m => m.taken_today).length;
  const compliancePct = medications.length > 0 ? Math.round((takenMedsCount / medications.length) * 100) : 0;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const ageVal = parseInt(editAge);
    const weightVal = parseFloat(editWeight);
    const heightVal = parseFloat(editHeight);

    if (!editName || isNaN(ageVal) || isNaN(weightVal) || isNaN(heightVal)) {
      setFormError('Please enter valid details');
      return;
    }

    const success = await updateProfile({
      name: editName,
      age: ageVal,
      weight_kg: weightVal,
      height_cm: heightVal
    });

    if (success) {
      setIsEditingProfile(false);
    }
  };

  const handleAddMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!medName || !medDosage || !medFreq) {
      setFormError('All medication fields are required');
      return;
    }
    const success = await addMedication(medName, medDosage, medFreq);
    if (success) {
      setMedName('');
      setMedDosage('');
      setMedFreq('');
      setShowAddMed(false);
    }
  };

  const handleAddAptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!aptDoctor || !aptSpecialty || !aptDate || !aptTime) {
      setFormError('All appointment fields are required');
      return;
    }
    const success = await bookAppointment({
      doctor_name: aptDoctor,
      specialty: aptSpecialty,
      date: aptDate,
      time: aptTime
    });
    if (success) {
      setAptDoctor('');
      setAptSpecialty('');
      setAptDate('');
      setAptTime('');
      setShowAddApt(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up space-y-8">
      {/* Profile Header */}
      <div className="glass-card rounded-2xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500">Username: <strong className="font-semibold">{user.username}</strong> | Age: {user.age}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="sm:self-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer border border-transparent"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
          {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Profile Panel */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="glass-card rounded-2xl border border-teal-200/60 p-6 space-y-4 animate-slide-up">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Modify Wellness Profile
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
              <input
                type="number"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Height (cm)</label>
              <input
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            {formError && (
              <span className="text-xs font-semibold text-red-500">{formError}</span>
            )}
            <button
              type="submit"
              className="ml-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Profile Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl border border-slate-200/60 p-5 flex items-center space-x-4">
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-xl">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Current Weight</p>
            <h3 className="text-2xl font-bold text-slate-900">{user.weight_kg} kg</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-200/60 p-5 flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Ruler className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Current Height</p>
            <h3 className="text-2xl font-bold text-slate-900">{user.height_cm} cm</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-200/60 p-5 flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Body Mass Index (BMI)</p>
            <h3 className="text-2xl font-bold text-slate-900">{bmi}</h3>
          </div>
        </div>
      </div>

      {/* Main Trackers split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medication Tracker panel */}
        <div className="glass-card rounded-2xl border border-slate-200/60 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Pill className="h-5 w-5 mr-2 text-teal-600" />
              Medication Schedule
            </h3>
            <button
              onClick={() => setShowAddMed(!showAddMed)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-500 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Med
            </button>
          </div>

          {/* Adherence compliance bar */}
          {medications.length > 0 && (
            <div className="space-y-1.5 p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Daily Compliance Rate</span>
                <span className="text-teal-600">{compliancePct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-500"
                  style={{ width: `${compliancePct}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Add med inline form */}
          {showAddMed && (
            <form onSubmit={handleAddMedSubmit} className="p-4 rounded-xl border border-teal-100 bg-teal-50/30 space-y-3 animate-slide-up">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Register New Medication
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="e.g. Aspirin"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="e.g. 50mg"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="e.g. Once daily"
                  value={medFreq}
                  onChange={(e) => setMedFreq(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                {formError && <span className="text-red-500 font-semibold">{formError}</span>}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Medication
                </button>
              </div>
            </form>
          )}

          {/* Medications list */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {medications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No medications scheduled today.</p>
            ) : (
              medications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-200/60 bg-white flex items-center justify-between shadow-sm"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {med.name}
                      <span className="text-xs font-normal text-slate-400">({med.dosage})</span>
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {med.frequency}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleMedication(med.id)}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      med.taken_today
                        ? 'bg-teal-50 border-teal-200 text-teal-600 font-bold'
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {med.taken_today ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appointment Scheduler panel */}
        <div className="glass-card rounded-2xl border border-slate-200/60 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-600" />
              Doctor Appointments
            </h3>
            <button
              onClick={() => setShowAddApt(!showAddApt)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-500 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Book New
            </button>
          </div>

          {/* Add appointment form */}
          {showAddApt && (
            <form onSubmit={handleAddAptSubmit} className="p-4 rounded-xl border border-teal-100 bg-teal-50/30 space-y-3 animate-slide-up">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Schedule Appointment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Doctor Name (e.g. Dr. Sharma)"
                  value={aptDoctor}
                  onChange={(e) => setAptDoctor(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Specialty (e.g. Cardiologist)"
                  value={aptSpecialty}
                  onChange={(e) => setAptSpecialty(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                />
                <input
                  type="date"
                  value={aptDate}
                  onChange={(e) => setAptDate(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                />
                <input
                  type="time"
                  value={aptTime}
                  onChange={(e) => setAptTime(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                {formError && <span className="text-red-500 font-semibold">{formError}</span>}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          )}

          {/* Appointments list */}
          <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No upcoming doctor appointments scheduled.</p>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200/60 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      {apt.doctor_name}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                        {apt.specialty}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center">
                      <CalendarCheck className="h-3.5 w-3.5 mr-1" />
                      {apt.date} at {apt.time}
                    </p>
                  </div>

                  <span className="inline-flex self-start sm:self-center items-center text-[10px] font-bold py-1 px-2.5 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-600">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mr-1.5"></span>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
