import React, { useState } from 'react';
import { X, UserPlus, Radio, Check, User } from 'lucide-react';
import { api } from '../../api';
import { UserProfile } from '../../types';
import { getInitials } from '../../utils/formatters';

interface RegisterAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: UserProfile) => Promise<void>;
  existingUsers?: UserProfile[];
  onSelectExistingUser?: (userId: string) => void;
}

export const RegisterAccountModal: React.FC<RegisterAccountModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  existingUsers = [],
  onSelectExistingUser,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-indigo-600');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const colorOptions = [
    { label: 'Indigo', class: 'bg-indigo-600' },
    { label: 'Rose', class: 'bg-rose-600' },
    { label: 'Emerald', class: 'bg-emerald-600' },
    { label: 'Amber', class: 'bg-amber-600' },
    { label: 'Sky', class: 'bg-sky-600' },
    { label: 'Purple', class: 'bg-purple-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const newUser = await api.registerUser({
        displayName: displayName.trim(),
        email: email.trim(),
        avatarColor: selectedColor,
      });

      await onRegisterSuccess(newUser);
      setDisplayName('');
      setEmail('');
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-white z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Register Pulse Profile</h3>
              <p className="text-xs text-slate-400">Join trusted circle live map</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={50}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Avatar Color Theme
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  key={c.class}
                  onClick={() => setSelectedColor(c.class)}
                  className={`w-8 h-8 rounded-full ${c.class} flex items-center justify-center transition-all ${
                    selectedColor === c.class
                      ? 'ring-2 ring-white scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {selectedColor === c.class && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !displayName.trim() || !email.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Registering...</span>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                <span>Join & Start Sharing</span>
              </>
            )}
          </button>
        </form>

        {existingUsers.length > 0 && onSelectExistingUser && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[11px] text-slate-400 mb-2 font-medium">Or select existing demo account:</p>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {existingUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectExistingUser(u.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                >
                  <div
                    className={`w-6 h-6 rounded-lg ${u.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                  >
                    {getInitials(u.displayName)}
                  </div>
                  <span className="truncate text-left font-medium">{u.displayName} ({u.email})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
