import React, { useState } from 'react';
import { Circle } from '../../types';
import { Users, UserPlus, Copy, Check, Shield, Crown, Plus, AlertCircle } from 'lucide-react';
import { getInitials } from '../../utils/formatters';

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
  const [circleAction, setCircleAction] = useState<'create' | 'join'>('create');

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
    <div className="pulse-content max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Top Title Banner */}
      <div className="pulse-header flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Workspace / Groups</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Trusted circles</h2>
          <p className="text-sm text-slate-500 max-w-xl">
            Private location-sharing groups for the people you trust.
          </p>
        </div>

        {/* Max 5 constraint badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-zinc-600">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Up to 5 members per circle</span>
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
              className={`pulse-card cursor-pointer p-4 rounded-xl border transition-all ${
                isActive
                  ? 'bg-white border-blue-600 ring-1 ring-blue-600/10'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{circle.name}</h3>
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
                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-[11px] text-zinc-600 font-mono flex items-center gap-1.5 transition-colors font-medium"
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
                    const initials = getInitials(m.profile?.displayName);
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
                  <span className="font-mono text-slate-800 font-semibold">{circle.inviteCode}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Circle Members Grid */}
      {activeCircle && (
        <div className="pulse-card bg-white border p-5 rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>Members</span>
              <span className="text-zinc-400">/</span>
              <span className="text-blue-600">{activeCircle.name}</span>
            </h3>

              <div className="text-xs text-slate-500 font-medium">
              <span className="text-slate-900 font-semibold">{activeCircle.members.length}</span>/5 members
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeCircle.members.map((member) => {
              const isOwner = member.role === 'owner';
              const isSelf = member.userId === currentUserId;
              const initials = getInitials(member.profile?.displayName);

              return (
                <div
                  key={member.userId}
                  className="p-3 bg-gray-50/70 border border-gray-200 rounded-lg flex items-center gap-3"
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

      {/* Create / join task switcher */}
      <div className="circle-action-tabs bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center border-b border-gray-200 bg-gray-50/70 p-1.5" role="tablist" aria-label="Circle actions">
          <button
            type="button"
            role="tab"
            aria-selected={circleAction === 'create'}
            onClick={() => setCircleAction('create')}
            className={`circle-action-tab flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${circleAction === 'create' ? 'is-active' : ''}`}
          >
            <Plus className="w-4 h-4" />
            Create circle
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={circleAction === 'join'}
            onClick={() => setCircleAction('join')}
            className={`circle-action-tab flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${circleAction === 'join' ? 'is-active' : ''}`}
          >
            <UserPlus className="w-4 h-4" />
            Join with code
          </button>
        </div>

        {circleAction === 'create' ? (
          <form onSubmit={handleCreateSubmit} className="circle-tab-panel p-5 space-y-3" role="tabpanel">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Create a private circle</h3>
              <p className="text-xs text-gray-500 mt-1">Start a group for your partner, family, or closest friends.</p>
            </div>
            <input
              type="text"
              placeholder="Circle name"
              value={newCircleName}
              onChange={(e) => setNewCircleName(e.target.value)}
              maxLength={50}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
            />
            <button
              type="submit"
              disabled={isCreating || !newCircleName.trim()}
              className="circle-primary-button w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all"
            >
              {isCreating ? 'Creating…' : 'Create circle'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinSubmit} className="circle-tab-panel p-5 space-y-3" role="tabpanel">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Join an existing circle</h3>
              <p className="text-xs text-gray-500 mt-1">Enter the invite code shared by a circle member.</p>
            </div>
            <input
              type="text"
              placeholder="Invite code"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              maxLength={20}
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-slate-900 font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
            />
            <button
              type="submit"
              disabled={isJoining || !inviteCodeInput.trim()}
              className="circle-primary-button w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all"
            >
              {isJoining ? 'Joining…' : 'Join circle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
