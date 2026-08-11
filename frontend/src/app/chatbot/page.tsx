'use client';

import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
  Bot, 
  User, 
  Send, 
  Stethoscope, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  HeartPulse, 
  Pill, 
  Apple, 
  Bandage, 
  Activity,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface AnalysisSection {
  heading: string;
  items: string[];
}

interface DoctorRef {
  specialist_title: string;
  hospitals: string[];
  maps_url: string;
}

interface QuickAction {
  text: string;
  message: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickActions?: QuickAction[];
  triage_level?: 'emergency' | 'pharmacology' | 'consultation' | 'nutrition' | 'first_aid' | 'self_care';
  triage_title?: string;
  clinical_summary?: string;
  analysis_sections?: AnalysisSection[];
  doctor_ref?: DoctorRef;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rId = 'sess_' + Math.random().toString(36).substring(2, 11);
    setSessionId(rId);

    setMessages([
      {
        id: 'greet_1',
        sender: 'bot',
        text: "👋 **Hello! Welcome to the MedAssist AI Medical Workspace.**\n\nI am your **24/7 Comprehensive Healthcare Assistant**. Ask me **anything about health, symptoms, medications, nutrition, fitness, or first aid!**\n\nHow can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { text: '🤒 Analyze Symptoms', message: 'I have a fever and headache' },
          { text: '💊 Drug Side Effects', message: 'What are side effects of Paracetamol?' },
          { text: '🍏 Diet for Cholesterol', message: 'What is the best diet to reduce high cholesterol?' },
          { text: '🩹 First Aid for Burns', message: 'What is the immediate first aid for minor skin burns?' }
        ]
      }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await axiosClient.post('/api/chatbot', {
        message: text,
        session_id: sessionId,
        history
      });

      if (res.data?.success) {
        const botMsg: Message = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: res.data.response || 'MedAssist AI is ready for your query.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickActions: res.data.quickActions || [],
          triage_level: res.data.triage_level,
          triage_title: res.data.triage_title,
          clinical_summary: res.data.clinical_summary,
          analysis_sections: res.data.analysis_sections,
          doctor_ref: res.data.doctor_ref
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Request failed');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'bot',
          text: 'I encountered an issue connecting to the AI engine. Please ask your healthcare question again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    const rId = 'sess_' + Math.random().toString(36).substring(2, 11);
    setSessionId(rId);
    setMessages([
      {
        id: 'greet_' + Date.now(),
        sender: 'bot',
        text: "Conversation restarted. **I am MedAssist AI.** Ask me anything about health, medications, symptoms, or diets!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { text: '🤒 Analyze Symptoms', message: 'I have a fever and headache' },
          { text: '💊 Drug Side Effects', message: 'What are side effects of Paracetamol?' }
        ]
      }
    ]);
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      const linkRegex = /\[(.*?)\]\((.*?)\)/g;
      if (linkRegex.test(line)) {
        const linkParts = [];
        let lastIdx = 0;
        let match;
        linkRegex.lastIndex = 0;
        while ((match = linkRegex.exec(line)) !== null) {
          if (match.index > lastIdx) {
            linkParts.push(line.substring(lastIdx, match.index));
          }
          const label = match[1];
          const url = match[2];
          linkParts.push(
            <a
              key={match.index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 font-bold text-xs px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl my-1 transition-all shadow-2xs hover:scale-[1.02]"
            >
              <span>{label}</span>
            </a>
          );
          lastIdx = linkRegex.lastIndex;
        }
        if (lastIdx < line.length) {
          linkParts.push(line.substring(lastIdx));
        }
        return <div key={lineIdx} className="my-1.5">{linkParts}</div>;
      }

      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith('## ')) {
        return <h3 key={lineIdx} className="text-base font-extrabold text-slate-900 mt-2 mb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('🔹 ')) {
        return (
          <div key={lineIdx} className="flex items-start my-1 pl-1 text-xs sm:text-sm">
            <span className="text-teal-600 font-bold mr-2">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      return line.trim() === '' ? <div key={lineIdx} className="h-2" /> : <p key={lineIdx} className="leading-relaxed text-xs sm:text-sm my-1">{renderedParts}</p>;
    });
  };

  const renderClinicalCard = (msg: Message) => {
    const level = msg.triage_level || 'self_care';
    const badgeStyles = {
      emergency: 'bg-red-50 text-red-800 border-red-200',
      pharmacology: 'bg-purple-50 text-purple-800 border-purple-200',
      nutrition: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      consultation: 'bg-amber-50 text-amber-800 border-amber-200',
      first_aid: 'bg-amber-50 text-amber-800 border-amber-200',
      self_care: 'bg-teal-50 text-teal-800 border-teal-200'
    }[level];

    return (
      <div className="space-y-4">
        {/* Triage Badge */}
        {msg.triage_title && (
          <div className={`px-4 py-2 rounded-xl border text-xs font-black flex items-center justify-between shadow-2xs ${badgeStyles}`}>
            <span>{msg.triage_title}</span>
            <Activity className="h-4 w-4 opacity-80" />
          </div>
        )}

        {/* Clinical Summary Highlight Box */}
        {msg.clinical_summary && (
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              CLINICAL OBSERVATION
            </span>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {msg.clinical_summary}
            </p>
          </div>
        )}

        {/* Formatted Text Body */}
        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          {formatMessageText(msg.text)}
        </div>

        {/* Specialist Doctor Referral Card */}
        {msg.doctor_ref && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/90 via-slate-50 to-indigo-50/30 border border-teal-100 space-y-2.5 shadow-2xs mt-4">
            <div className="flex items-center space-x-2 text-teal-900">
              <Stethoscope className="h-5 w-5 text-teal-600 shrink-0" />
              <span className="font-extrabold text-sm sm:text-base">{msg.doctor_ref.specialist_title}</span>
            </div>
            
            <p className="text-xs text-slate-600">
              Verified Centers: <strong>{msg.doctor_ref.hospitals.slice(0, 2).join(', ')}</strong>
            </p>

            <a
              href={msg.doctor_ref.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full sm:w-auto py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-sm hover:scale-[1.01] cursor-pointer"
            >
              <MapPin className="h-4 w-4" />
              <span>Find Top Specialists Near Me on Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] flex flex-col space-y-4">
      {/* Title Bar */}
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 text-white rounded-2xl shadow-md">
            <Stethoscope className="h-6 w-6 text-teal-200" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center">
              MedAssist AI Workspace
              <span className="ml-3 text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                24/7 Health Assistant
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive medical guidance, symptom assessment, drug inquiries, and nutrition
            </p>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>Clear Workspace</span>
        </button>
      </div>

      {/* Suggested Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => handleSendMessage('I have a fever and headache')}
          className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-teal-50 hover:border-teal-200 text-left transition-all cursor-pointer flex items-center space-x-2"
        >
          <HeartPulse className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-xs font-medium text-slate-700 truncate">Symptom Assessment</span>
        </button>

        <button
          onClick={() => handleSendMessage('What are side effects of Paracetamol?')}
          className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-purple-50 hover:border-purple-200 text-left transition-all cursor-pointer flex items-center space-x-2"
        >
          <Pill className="h-4 w-4 text-purple-600 shrink-0" />
          <span className="text-xs font-medium text-slate-700 truncate">Drug & Dosage Info</span>
        </button>

        <button
          onClick={() => handleSendMessage('What is the best diet to lower high cholesterol?')}
          className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-left transition-all cursor-pointer flex items-center space-x-2"
        >
          <Apple className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-medium text-slate-700 truncate">Diets & Nutrition</span>
        </button>

        <button
          onClick={() => handleSendMessage('What is the immediate first aid for minor skin burns?')}
          className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-amber-50 hover:border-amber-200 text-left transition-all cursor-pointer flex items-center space-x-2"
        >
          <Bandage className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-xs font-medium text-slate-700 truncate">First Aid Guidance</span>
        </button>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 glass-card rounded-2xl border border-slate-200/60 p-5 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 max-w-[88%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
            }`}
          >
            <div className={`p-2 rounded-xl text-white shadow-sm shrink-0 mt-0.5 ${
              msg.sender === 'user' ? 'bg-slate-700' : 'bg-teal-600'
            }`}>
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className="space-y-2">
              <div className={`p-4 rounded-2xl shadow-xs text-xs sm:text-sm border ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white border-teal-600 rounded-tr-none'
                  : 'bg-white border-slate-200 text-slate-800 rounded-tl-none w-full max-w-2xl'
              }`}>
                {msg.sender === 'bot' ? renderClinicalCard(msg) : formatMessageText(msg.text)}
              </div>

              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.quickActions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(act.message)}
                      className="text-xs font-medium py-1.5 px-3 rounded-full border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 cursor-pointer transition-all shadow-2xs"
                    >
                      {act.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3 mr-auto max-w-[85%]">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center space-x-2 shadow-xs">
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs text-slate-500 ml-2 font-medium">MedAssist AI is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} 
        className="relative flex items-center"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
          placeholder="Ask MedAssist AI any question about health, medications, symptoms, or diets..."
          className="w-full pl-5 pr-14 py-4 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-900 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="absolute right-2 p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md disabled:opacity-40 transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
