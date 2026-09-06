import React, { useState, useEffect } from 'react';
import { X, LogOut, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserName: string;
  currentUserEmail: string;
  onDeleteAccount: () => Promise<void>;
  onUpdateAccount: (displayName: string, email: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUserName,
  currentUserEmail,
  onDeleteAccount,
  onUpdateAccount,
  onLogout,
}) => {
  const [displayName, setDisplayName] = useState(currentUserName);
  const [email, setEmail] = useState(currentUserEmail);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentUserName);
      setEmail(currentUserEmail);
      setShowDeleteConfirm(false);
      setErrorMsg(null);
    }
  }, [isOpen, currentUserName, currentUserEmail]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      await onUpdateAccount(displayName, email);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm" onClick={onClose} />

      <div className="pulse-modal relative w-full max-w-md bg-white text-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 border border-black/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-lg tracking-tight">Settings</h3>
            <p className="text-sm text-zinc-500">Profile, session, and data controls</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 text-rose-700 text-sm">{errorMsg}</div>
        )}

        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-black/8 text-sm focus:outline-none focus:border-zinc-900"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-black/8 text-sm focus:outline-none focus:border-zinc-900"
          />
          <button
            type="submit"
            disabled={isUpdating}
            className="ui-primary-button w-full py-3 bg-zinc-900 text-white text-sm font-medium rounded-2xl disabled:opacity-50"
          >
            {savedSuccess ? 'Saved' : isUpdating ? 'Saving…' : 'Save profile'}
          </button>
        </form>

        <button
          type="button"
          onClick={async () => {
            await onLogout();
            onClose();
          }}
          className="mt-4 w-full py-3 rounded-2xl border border-black/8 text-sm font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        <div className="mt-5 pt-5 border-t border-black/5">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 text-rose-600 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete account and location history
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600">This cannot be undone. Shares, pins, and memberships are removed.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2.5 rounded-2xl border border-black/8 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="py-2.5 rounded-2xl bg-rose-600 text-white text-sm font-medium"
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
