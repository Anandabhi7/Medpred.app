'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, User as UserIcon, LogOut, Menu, X, LogIn } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout, checkAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navLinks = [
    { name: 'Symptom Analyzer', href: '/analyzer' },
    { name: 'Health Tools', href: '/tools' },
  ];

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  return (
    <>
      <nav className="glass-panel sticky top-0 z-40 border-b border-slate-200 transition-colors w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-teal-600 rounded-xl text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Activity className="h-5 w-5 animate-pulse-slow" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              MedPredictor
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all py-1.5 px-3 rounded-lg ${
                    isActive
                      ? 'bg-teal-50 text-teal-600 font-semibold'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-slate-100/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Authentication & Profile Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 pr-1 max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl glass-card border border-slate-200 py-1 shadow-lg ring-1 ring-black/5 z-50 animate-slide-up">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-all"
                    >
                      <UserIcon className="h-4 w-4 mr-2 text-teal-600" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="text-sm font-medium text-slate-700 hover:text-teal-600 pr-2 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 py-2 px-4 rounded-xl shadow-md shadow-teal-600/10 hover:scale-105 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 animate-slide-up">
            <div className="flex flex-col space-y-2 pb-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium py-2 px-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-600 font-bold'
                        : 'text-slate-600 hover:text-teal-600 hover:bg-slate-100/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="pt-4 border-t border-slate-200 pb-2">
              {user ? (
                <div className="flex flex-col space-y-3 px-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-700">{user.name}</h4>
                      <p className="text-xs text-slate-500">{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full py-2 px-4 border border-red-200 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-3">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="flex items-center justify-center w-full py-2 px-4 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="flex items-center justify-center w-full py-2 px-4 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  );
}
