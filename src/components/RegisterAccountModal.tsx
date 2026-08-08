import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Check, Mail, User, UserPlus, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface RegisterAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newUser: UserProfile) => void;
  existingUsers: UserProfile[];
  onSelectExistingUser: (userId: string) => void;
}

const AVATAR_COLORS = [
  { label: 'Indigo', class: 'bg-indigo-600' },
  { label: 'Rose', class: 'bg-rose-500' },
  { label: 'Emerald', class: 'bg-emerald-500' },
  { label: 'Amber', class: 'bg-amber-500' },
  { label: 'Violet', class: 'bg-violet-600' },
  { label: 'Sky', class: 'bg-sky-500' },
];

export const RegisterAccountModal: React.FC<RegisterAccountModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  existingUsers,
  onSelectExistingUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [displayName, setDisplayName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [avatarColor, setAvatarColor] = useState('bg-indigo-600');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (name: string, mailStr: string, color: string) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const normalizedEmail = mailStr.trim().toLowerCase();

      // Check if user with this email already exists in system
      const foundUser = existingUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (foundUser) {
        onSelectExistingUser(foundUser.id);
        onClose();
        return;
      }

      // Register new user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: name.trim() || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          avatarColor: color,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Authentication failed');
      }

      const newUser: UserProfile = await response.json();
      onRegisterSuccess(newUser);
      setDisplayName('');
      setEmailInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error authenticating account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Please enter your email address to log in.');
      return;
    }
    handleAuth('', emailInput, 'bg-indigo-600');
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !emailInput.trim()) {
      setErrorMsg('Please enter both your name and email address.');
      return;
    }
    handleAuth(displayName, emailInput, avatarColor);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 overflow-hidden space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
                {activeTab === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeTab === 'login' ? 'Log In to Pulse' : 'Create Account'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Pulse Circles Location Sharing
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* LOG IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Logging In...' : 'Log In'}</span>
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name / Display Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Choose Avatar Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((color) => {
                    const isSelected = avatarColor === color.class;
                    return (
                      <button
                        key={color.class}
                        type="button"
                        onClick={() => setAvatarColor(color.class)}
                        className={`w-8 h-8 rounded-full ${color.class} flex items-center justify-center text-white transition-transform cursor-pointer ${
                          isSelected ? 'ring-4 ring-indigo-500/30 scale-110' : 'hover:scale-105'
                        }`}
                        title={color.label}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Account...' : 'Sign Up'}</span>
              </button>
            </form>
          )}

          {/* Switch Existing Active Registered Users if any exist in DB */}
          {existingUsers.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Or switch to an active user session:
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {existingUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSelectExistingUser(u.id);
                      onClose();
                    }}
                    className="w-full p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-6 h-6 rounded-full ${u.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                      >
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 truncate">
                        {u.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">
                        ({u.email})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 shrink-0">
                      Switch
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Your account allows circle members to view your live GPS location & send pings securely.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
