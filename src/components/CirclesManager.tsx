import React, { useState } from 'react';
import { Circle, UserProfile } from '../types';
import { Users, UserPlus, Copy, Check, Shield, Crown, Sparkles, Plus, AlertCircle } from 'lucide-react';

interface CirclesManagerProps {
  circles: Circle[];
  activeCircleId: string;
  onSelectCircle: (id: string) => void;
  onCreateCircle: (name: string) => Promise<void>;
  onJoinCircle: (inviteCode: string) => Promise<void>;
  currentUserId: string;
}

export const CirclesManager: React.FC<CirclesManagerProps> = ({
  circles,
  activeCircleId,
  onSelectCircle,
  onCreateCircle,
  onJoinCircle,
  currentUserId,
}) => {
  const [newCircleName, setNewCircleName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeCircle = circles.find((c) => c.id === activeCircleId) || circles[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;
    setIsCreating(true);
    setErrorMsg(null);
    try {
      await onCreateCircle(newCircleName.trim());
      setNewCircleName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create circle');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setIsJoining(true);
    setErrorMsg(null);
    try {
      await onJoinCircle(inviteCodeInput.trim());
      setInviteCodeInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join circle');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-extrabold text-slate-900">Trusted Circles</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Small, intentional groups (strictly max 5 members) for close family & partners.
          </p>
        </div>

        {/* Max 5 constraint badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Max 5 People Per Circle Enforced</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Circle Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {circles.map((circle) => {
          const isActive = circle.id === activeCircleId;
          const memberCount = circle.members.length;

          return (
            <div
              key={circle.id}
              onClick={() => onSelectCircle(circle.id)}
              className={`cursor-pointer p-5 rounded-3xl border transition-all ${
                isActive
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{circle.name}</h3>
                    <p className="text-xs text-slate-500">
                      {memberCount} / 5 trusted members
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(circle.inviteCode);
                    }}
                    className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs text-indigo-600 font-mono flex items-center gap-1.5 transition-colors font-bold"
                    title="Copy Invite Code"
                  >
                    {copiedCode === circle.inviteCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>{circle.inviteCode}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Member Avatars */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {circle.members.map((m) => {
                    const initials =
                      m.profile?.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'U';
                    return (
                      <div
                        key={m.userId}
                        className={`w-8 h-8 rounded-full ${
                          m.profile?.avatarColor || 'bg-indigo-600'
                        } text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-xs`}
                        title={m.profile?.displayName}
                      >
                        {initials}
                      </div>
                    );
                  })}
                </div>

                <span className="text-[11px] text-gray-500 font-medium">
                  Invite Code: <span className="font-mono text-slate-800 font-bold">{circle.inviteCode}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Circle Members Grid */}
      {activeCircle && (
        <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Members in</span>
              <span className="text-indigo-600">{activeCircle.name}</span>
            </h3>

            <div className="text-xs text-slate-500 font-semibold">
              Capacity: <span className="text-emerald-600 font-bold">{activeCircle.members.length}/5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeCircle.members.map((member) => {
              const isOwner = member.role === 'owner';
              const isSelf = member.userId === currentUserId;
              const initials =
                member.profile?.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'U';

              return (
                <div
                  key={member.userId}
                  className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full ${
                      member.profile?.avatarColor || 'bg-indigo-600'
                    } text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {member.profile?.displayName}
                      </span>
                      {isSelf && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded">
                          You
                        </span>
                      )}
                    </div>
                    {member.profile?.email && (
                      <div className="text-[10px] text-indigo-600 font-mono truncate">
                        {member.profile.email}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                      {isOwner ? (
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Crown className="w-3 h-3" /> Circle Creator
                        </span>
                      ) : (
                        <span>Member</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Sections: Create or Join Circle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Circle Form */}
        <form onSubmit={handleCreateSubmit} className="p-5 bg-white border border-gray-200 rounded-3xl space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Create New Circle
          </h3>
          <p className="text-[11px] text-gray-500">
            Create a private location-sharing group for your partner or family.
          </p>
          <input
            type="text"
            placeholder="Circle Name (e.g., 'Sam & Alex')"
            value={newCircleName}
            onChange={(e) => setNewCircleName(e.target.value)}
            maxLength={50}
            required
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={isCreating || !newCircleName.trim()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            {isCreating ? 'Creating...' : 'Create Circle'}
          </button>
        </form>

        {/* Join Circle Form */}
        <form onSubmit={handleJoinSubmit} className="p-5 bg-white border border-gray-200 rounded-3xl space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Join with Invite Code
          </h3>
          <p className="text-[11px] text-gray-500">
            Enter the 6-character code shared by your partner or family member.
          </p>
          <input
            type="text"
            placeholder="Invite Code (e.g. PULSE7)"
            value={inviteCodeInput}
            onChange={(e) => setInviteCodeInput(e.target.value)}
            maxLength={20}
            required
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-slate-900 font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={isJoining || !inviteCodeInput.trim()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            {isJoining ? 'Joining Circle...' : 'Join Circle'}
          </button>
        </form>
      </div>
    </div>
  );
};
