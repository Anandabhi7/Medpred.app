'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Bot, 
  Pill, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Database
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Home() {
  const { user } = useAuthStore();

  const services = [
    {
      title: 'Symptom Analyzer',
      description: 'Input symptoms to run a diagnostic prediction check against our scikit-learn ensemble model with 97.1% accuracy.',
      icon: Stethoscope,
      href: '/analyzer',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Advanced ML Model',
    },
    {
      title: 'MedAssist AI',
      description: 'Ask anything about symptoms, drugs, nutrition, or first aid. Receive instant clinical guidance & Google Maps doctor locator.',
      icon: Bot,
      href: '/chatbot',
      color: 'from-blue-500 to-indigo-600',
      badge: '24/7 Healthcare Assistant',
    },
    {
      title: 'Health Tools Hub',
      description: 'Access evidence-based health calculators: Heart Risk (ASCVD), Diabetes Risk (ADA), TDEE/Macro, Hydration, and BMI.',
      icon: Scale,
      href: '/tools',
      color: 'from-amber-500 to-orange-600',
      badge: 'Interactive Calculators',
    },
    {
      title: 'Drug Interaction Checker',
      description: 'Check compatibility and safety guidelines for multiple drugs against our registry of 5,000+ interactions.',
      icon: Pill,
      href: '/tools?tab=drugs',
      color: 'from-purple-500 to-pink-600',
      badge: 'openFDA Drug Safety',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-slide-up">
      {/* Hero Welcome */}
      <div className="text-center max-w-3xl mx-auto space-y-6 mt-4 sm:mt-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-600 text-xs font-semibold border border-teal-100">
          <BrainCircuit className="h-4 w-4" />
          <span>Next-Generation Healthcare AI</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Your Intelligent Portal for{' '}
          <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            Clinical Insights
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 leading-relaxed">
          {user ? `Welcome back, ${user.name}! ` : 'Identify potential health issues, discuss concerns with our chatbot, check medication safety, and track your wellness metrics.'}
          Assess symptoms instantly using our validated machine learning ensemble model.
        </p>

        {!user && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/analyzer"
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center"
            >
              Analyze Symptoms Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/chatbot"
              className="w-full sm:w-auto px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center"
            >
              Consult MedAssist AI
            </Link>
          </div>
        )}
      </div>

      {/* Model Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Model Accuracy', value: '97.1%', icon: TrendingUp, detail: 'scikit-learn Ensemble' },
          { label: 'Mapped Diseases', value: '44', icon: ShieldAlert, detail: 'Comprehensive catalog' },
          { label: 'Mapped Symptoms', value: '117', icon: Stethoscope, detail: 'Granular definitions' },
          { label: 'Training Records', value: '8,800', icon: Database, detail: 'High-density dataset' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl border border-slate-200/60 p-4 sm:p-5 flex items-center space-x-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</h3>
              <p className="text-[10px] text-slate-400">{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Service Cards Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Our AI-Powered Services</h2>
          <p className="text-sm text-slate-500 mt-1">Select a health tool to begin your preliminary assessment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link
                key={index}
                href={service.href}
                className="group relative flex flex-col justify-between glass-card rounded-2xl border border-slate-200/60 p-6 hover:shadow-xl hover:border-teal-500/30 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {service.badge}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-teal-600 font-semibold text-sm mt-5 group-hover:translate-x-1.5 transition-all">
                  Open Tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Advisory Alert */}
      <div className="p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-start space-x-3.5 max-w-4xl mx-auto">
        <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-800">Medical Disclaimer</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            MedPredictor provides preliminary guidance based on AI machine learning predictions. It does not provide medical diagnoses or treatment advice. In case of a medical emergency, immediately contact your local emergency services (102 or 108 in India) or visit the nearest hospital.
          </p>
        </div>
      </div>
    </div>
  );
}
