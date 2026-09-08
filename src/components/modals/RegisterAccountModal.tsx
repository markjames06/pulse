import React, { useState } from 'react';
import { Eye, EyeOff, X, Radio } from 'lucide-react';
import { api } from '../../api';
import { UserProfile } from '../../types';

interface RegisterAccountModalProps {
  isOpen: boolean;
  required?: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: UserProfile) => Promise<void>;
  initialMode?: 'login' | 'register';
}

const colorOptions = [
  { label: 'Ink', class: 'bg-zinc-800' },
  { label: 'Rose', class: 'bg-rose-600' },
  { label: 'Emerald', class: 'bg-emerald-600' },
  { label: 'Amber', class: 'bg-amber-600' },
  { label: 'Sky', class: 'bg-sky-600' },
  { label: 'Violet', class: 'bg-violet-600' },
];

export const RegisterAccountModal: React.FC<RegisterAccountModalProps> = ({
  isOpen,
  required = false,
  onClose,
  onRegisterSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedColor, setSelectedColor] = useState('bg-zinc-800');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address (e.g., name@example.com).';
    }
    if (!password) return 'Please enter your password.';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (password.length > 72) {
      return 'Password must be less than 72 characters.';
    }
    if (mode === 'register') {
      if (!displayName.trim()) return 'Please enter your display name.';
      if (displayName.trim().length < 2) {
        return 'Display name must be at least 2 characters.';
      }
      if (displayName.trim().length > 50) {
        return 'Display name must be less than 50 characters.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const user =
        mode === 'login'
          ? await api.loginUser({ email: email.trim(), password })
          : await api.registerUser({
              displayName: displayName.trim(),
              email: email.trim(),
              password,
              avatarColor: selectedColor,
            });

      await onRegisterSuccess(user);
      setDisplayName('');
      setEmail('');
      setPassword('');
      setErrorMsg(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      
      // Improve error messages for common authentication failures
      let userFriendlyMessage = message;
      if (message === 'Invalid email or password') {
        userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (message === 'An account with this email already exists') {
        userFriendlyMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (message.includes('Network error')) {
        userFriendlyMessage = 'Network error. Please check your connection and try again.';
      } else if (message.includes('fetch')) {
        userFriendlyMessage = 'Unable to connect to the server. Please try again later.';
      }
      
      setErrorMsg(userFriendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm"
        onClick={required ? undefined : onClose}
      />

      <div className="pulse-modal relative w-full max-w-md bg-white text-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 border border-black/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center mb-3">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-xl tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create your Pulse'}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Private circles. Consent-first location sharing.
            </p>
          </div>
          {!required && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 p-1 rounded-full bg-zinc-100 mb-5 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-full ${mode === 'login' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-full ${mode === 'register' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-700 text-sm">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={50}
              autoComplete="name"
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-black/8 text-sm focus:outline-none focus:border-zinc-900"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-black/8 text-sm focus:outline-none focus:border-zinc-900"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Password (8-72 characters)' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={72}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-zinc-50 border border-black/8 text-sm focus:outline-none focus:border-zinc-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="password-toggle absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-900"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="flex items-center gap-2 pt-1">
              {colorOptions.map((color) => (
                <button
                  type="button"
                  key={color.class}
                  aria-label={color.label}
                  aria-pressed={selectedColor === color.class}
                  onClick={() => setSelectedColor(color.class)}
                  className={`color-option ${color.class} ${
                    selectedColor === color.class ? 'ring-2 ring-offset-2 ring-zinc-900' : ''
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="ui-primary-button w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm font-medium rounded-2xl"
          >
            {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};
