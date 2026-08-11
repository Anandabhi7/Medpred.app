'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { X, Lock, Mail, User as UserIcon, Calendar, Weight, Ruler } from 'lucide-react';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const { login, register, error, loading, clearError } = useAuthStore();
  
  // Login fields
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regWeight, setRegWeight] = useState('');
  const [regHeight, setRegHeight] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (mode === 'login') {
      if (!loginUser || !loginPass) {
        setFormError('Please fill in all fields');
        return;
      }
      const success = await login(loginUser, loginPass);
      if (success) onClose();
    } else {
      if (!regName || !regUser || !regPass || !regAge || !regWeight || !regHeight) {
        setFormError('Please fill in all fields');
        return;
      }
      const ageNum = parseInt(regAge);
      const weightNum = parseFloat(regWeight);
      const heightNum = parseFloat(regHeight);

      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        setFormError('Please enter a valid age (1-120)');
        return;
      }
      if (isNaN(weightNum) || weightNum <= 0) {
        setFormError('Please enter a valid weight');
        return;
      }
      if (isNaN(heightNum) || heightNum <= 0) {
        setFormError('Please enter a valid height');
        return;
      }

      const success = await register({
        username: regUser,
        password: regPass,
        name: regName,
        age: ageNum,
        weight_kg: weightNum,
        height_cm: heightNum,
      });
      if (success) onClose();
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md glass-card rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 animate-slide-up bg-white/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Error Display */}
        {(formError || error) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-slide-up">
            {formError || error}
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'login' ? (
            <>
              {/* Login Form */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Register Form */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Username / Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder="e.g. johndoe"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      value={regAge}
                      onChange={(e) => setRegAge(e.target.value)}
                      placeholder="e.g. 25"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      value={regWeight}
                      onChange={(e) => setRegWeight(e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Height (cm)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="number"
                      value={regHeight}
                      onChange={(e) => setRegHeight(e.target.value)}
                      placeholder="e.g. 175"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-medium rounded-xl shadow-lg shadow-teal-500/20 hover:scale-[1.01] hover:shadow-teal-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-5 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <>
              New to MedPredictor?{' '}
              <button
                onClick={() => onSwitchMode('register')}
                className="text-teal-600 font-semibold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                className="text-teal-600 font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
