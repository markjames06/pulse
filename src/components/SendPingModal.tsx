import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, MapPin, Send, MessageSquare, Car, Home, Plane, Coffee, Clock, Heart } from 'lucide-react';

interface SendPingModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
  onSendPing: (message: string, attachLocation: boolean) => Promise<void>;
}

const PING_PRESETS = [
  { icon: Car, text: 'On my way!' },
  { icon: Home, text: 'Heading home safely' },
  { icon: Plane, text: 'Landed safely' },
  { icon: Coffee, text: 'Coffee run, want anything?' },
  { icon: Clock, text: 'Running 5 minutes late' },
  { icon: Heart, text: 'Thinking of you!' },
];

export const SendPingModal: React.FC<SendPingModalProps> = ({
  isOpen,
  onClose,
  circleId,
  circleName,
  onSendPing,
}) => {
  const [message, setMessage] = useState<string>('');
  const [attachLocation, setAttachLocation] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: { text: string }) => {
    setMessage(preset.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSendPing(message.trim(), attachLocation);
      setIsSending(false);
      setMessage('');
      onClose();
    } catch (err) {
      console.error(err);
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Send Quick Ping</h3>
                <p className="text-xs text-slate-500">
                  Instant notice to <span className="text-indigo-600 font-semibold">{circleName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-slate-800 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Quick Preset Messages
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PING_PRESETS.map((p, idx) => {
                  const IconComp = p.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className="p-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl text-left transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <IconComp className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs text-slate-700 font-medium truncate group-hover:text-indigo-900">
                        {p.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ping Message <span className="text-indigo-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Type a custom ping note..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={280}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
              <div className="flex justify-end text-[10px] text-gray-400 mt-1">
                {message.length}/280
              </div>
            </div>

            {/* Attach Location Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-slate-700">
                  Attach Current Location Snapshot
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachLocation(!attachLocation)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  attachLocation ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    attachLocation ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSending ? (
                <span>Sending Ping...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Ping Now</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
