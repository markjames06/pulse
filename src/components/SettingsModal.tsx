import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Shield, Bell, Trash2, AlertTriangle, UserPlus, Save, CheckCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserName: string;
  currentUserEmail: string;
  onDeleteAccount: () => Promise<void>;
  onUpdateAccount?: (displayName: string, email: string) => Promise<void>;
  onOpenRegisterModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUserName,
  currentUserEmail,
  onDeleteAccount,
  onUpdateAccount,
  onOpenRegisterModal,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editName, setEditName] = useState(currentUserName);
  const [editEmail, setEditEmail] = useState(currentUserEmail);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  useEffect(() => {
    setEditName(currentUserName);
    setEditEmail(currentUserEmail);
  }, [currentUserName, currentUserEmail, isOpen]);

  if (!isOpen) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateAccount) return;
    try {
      setIsSavingProfile(true);
      await onUpdateAccount(editName.trim(), editEmail.trim().toLowerCase());
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
      setIsDeleting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Account Settings</h3>
                <p className="text-xs text-slate-500 font-medium">Manage your real email and privacy</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-slate-800 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Form */}
          <form onSubmit={handleProfileSave} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Real Account Profile
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-full">
                Live Account
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Real Email Address
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 font-mono font-medium focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {profileSavedSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated!</span>
                </div>
              ) : (
                <span className="text-[10px] text-gray-500 font-medium">
                  Visible on map markers & circle lists
                </span>
              )}

              {onUpdateAccount && (
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              )}
            </div>
          </form>

          {/* Option to Add New Real Account */}
          {onOpenRegisterModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRegisterModal();
              }}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>Connect / Register Another Real Account</span>
            </button>
          )}

          {/* Privacy Rules List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Consent-First Guarantees
            </h4>
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-slate-800">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Zero Always-On Surveillance</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                Every share requires explicit timer selection. Expired shares older than 24h are automatically hard-deleted.
              </p>
            </div>
          </div>

          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Web Push Notifications
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  Alerts when circle members share location or ping
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Danger Zone: Full Account Data Purge */}
          <div className="pt-3 border-t border-gray-100">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Account & Purge Location History</span>
              </button>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Confirm Full Data Purge</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                  This will permanently delete your profile, circle memberships, and all location history records instantly.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    {isDeleting ? 'Purging...' : 'Yes, Delete Everything'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 bg-white border border-gray-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
