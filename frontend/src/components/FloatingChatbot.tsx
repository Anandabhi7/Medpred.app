'use client';

import React, { useState, useRef, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Minimize2, 
  Maximize2, 
  Stethoscope, 
  HeartPulse, 
  Pill, 
  Apple, 
  ShieldAlert, 
  MessageSquareText,
  User,
  MapPin,
  ExternalLink,
  Activity
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

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickActions?: { text: string; message: string }[];
  triage_level?: 'emergency' | 'pharmacology' | 'consultation' | 'nutrition' | 'first_aid' | 'self_care';
  triage_title?: string;
  clinical_summary?: string;
  analysis_sections?: AnalysisSection[];
  doctor_ref?: DoctorRef;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 **Hello! I am MedAssist AI, your 24/7 Comprehensive Healthcare Assistant.**\n\nYou can ask me **anything about health, symptoms, medications, nutrition, fitness, or first aid!**\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { text: '🤒 Analyze Symptoms', message: 'I have a fever and headache' },
        { text: '💊 Drug Side Effects', message: 'What are side effects of Paracetamol?' },
        { text: '🍏 Diet for Cholesterol', message: 'What is the best diet to reduce high cholesterol?' },
        { text: '🩹 First Aid for Burns', message: 'What is the immediate first aid for minor skin burns?' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/api/chatbot', {
        message: text,
        session_id: sessionId,
        history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
      });

      if (res.data?.success) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: res.data.response || "I am MedAssist AI. How can I assist with your healthcare query?",
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
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: "I encountered an issue processing your query. Please ask me any healthcare, symptom, or medication question!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: "I am having trouble connecting right now. Please try asking your healthcare question again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'bot',
        text: "Conversation cleared. **I'm MedAssist AI.** Ask me anything about symptoms, drugs, nutrition, or health!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { text: '🤒 Analyze Symptoms', message: 'I have a fever and headache' },
          { text: '💊 Drug Side Effects', message: 'What are side effects of Paracetamol?' },
          { text: '🍏 Diet for Cholesterol', message: 'What is the best diet to reduce high cholesterol?' }
        ]
      }
    ]);
  };

  // Format bold, links, and bullets for display
  const renderFormattedText = (txt: string) => {
    const lines = txt.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;

      // Handle markdown links: [label](url)
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
        return <div key={idx} className="my-1.5">{linkParts}</div>;
      }

      // Replace bold markdown **text**
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('🔹 ')) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-1 pl-1">
            <span className="text-teal-600 font-bold">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      return <p key={idx} className={line === '' ? 'h-2' : 'my-1'}>{renderedParts}</p>;
    });
  };

  // Helper for rendering structured clinical card
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
      <div className="space-y-3">
        {/* Triage Badge */}
        {msg.triage_title && (
          <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-extrabold flex items-center justify-between shadow-2xs ${badgeStyles}`}>
            <span>{msg.triage_title}</span>
            <Activity className="h-3.5 w-3.5 opacity-70" />
          </div>
        )}

        {/* Clinical Summary Highlight Box */}
        {msg.clinical_summary && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              CLINICAL OBSERVATION
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {msg.clinical_summary}
            </p>
          </div>
        )}

        {/* Formatted Text Body */}
        <div className="text-xs text-slate-800 leading-relaxed">
          {renderFormattedText(msg.text)}
        </div>

        {/* Specialist Doctor Referral Card */}
        {msg.doctor_ref && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-50/80 to-slate-50 border border-teal-100 space-y-2 shadow-2xs mt-3">
            <div className="flex items-center space-x-2 text-teal-800">
              <Stethoscope className="h-4 w-4 text-teal-600 shrink-0" />
              <span className="font-extrabold text-xs">{msg.doctor_ref.specialist_title}</span>
            </div>
            
            <p className="text-[11px] text-slate-600">
              Verified Centers: <strong>{msg.doctor_ref.hospitals.slice(0, 2).join(', ')}</strong>
            </p>

            <a
              href={msg.doctor_ref.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-all shadow-xs hover:scale-[1.01] cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Find Top Specialists Near Me on Google Maps</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div 
          className={`glass-card rounded-2xl border border-slate-200/80 shadow-2xl flex flex-col transition-all overflow-hidden mb-3 animate-slide-up bg-white/95 backdrop-blur-md ${
            isExpanded ? 'w-[90vw] md:w-[700px] h-[80vh]' : 'w-[92vw] sm:w-[420px] h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="relative p-2 bg-white/10 rounded-xl border border-white/20">
                <Stethoscope className="h-5 w-5 text-teal-200" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-teal-800 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center">
                  MedAssist AI
                  <span className="ml-2 text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Healthcare Assistant
                  </span>
                </h3>
                <p className="text-[11px] text-teal-100 opacity-90">Ask any healthcare, drug, or medical question</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-teal-100">
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/50 text-xs text-slate-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-[88%]">
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs shadow-sm shrink-0 mb-1">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none w-full'
                    }`}
                  >
                    {msg.sender === 'bot' ? renderClinicalCard(msg) : renderFormattedText(msg.text)}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-700 text-white flex items-center justify-center text-xs shadow-sm shrink-0 mb-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                {/* Quick Action Suggestion Chips */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qa.message)}
                        className="text-[11px] font-medium py-1 px-2.5 bg-white hover:bg-teal-50 text-teal-700 border border-teal-100 hover:border-teal-200 rounded-full shadow-2xs transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>{qa.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
                <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xs shadow-sm shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 bg-white border border-slate-200/80 rounded-2xl rounded-bl-none flex items-center space-x-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[11px] text-slate-400 ml-1.5 font-medium">MedAssist AI is analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="p-3 bg-white border-t border-slate-200 space-y-2"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about health, symptoms, drugs..."
                className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-1.5 p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            <p className="text-[9px] text-slate-400 text-center flex items-center justify-center">
              <ShieldAlert className="h-3 w-3 mr-1 text-slate-400" />
              MedAssist AI provides informational health guidance. Consult a doctor for medical diagnosis.
            </p>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative p-3.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-2.5 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Stethoscope className="h-6 w-6 text-white animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-teal-700 rounded-full"></span>
          </div>
          <span className="font-bold text-xs pr-1 hidden sm:inline-block">MedAssist AI</span>
          <span className="inline-flex items-center justify-center p-1 bg-white/20 rounded-lg text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
        </button>
      )}
    </div>
  );
}
