import React, { useState } from 'react';
import { CalendarDays, MapPin, Plus, UserRound } from 'lucide-react';
import { PulseMoment } from '../../types';
import { formatTimeAgo } from '../../utils/formatters';

interface MomentsViewProps {
  moments: PulseMoment[];
  circleName: string;
  onCreateMoment: (title: string, place: string, startsAt: string) => Promise<void>;
}

function defaultStartTime() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export const MomentsView: React.FC<MomentsViewProps> = ({ moments, circleName, onCreateMoment }) => {
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [startsAt, setStartsAt] = useState(defaultStartTime);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !place.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      await onCreateMoment(title.trim(), place.trim(), startsAt);
      setTitle('');
      setPlace('');
      setStartsAt(defaultStartTime());
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not create this plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pulse-content max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      <div className="pulse-header space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Circle plans</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Pulse Moments</h2>
        <p className="text-sm text-slate-500">Make a plan everyone in {circleName} can find.</p>
      </div>

      <form onSubmit={handleSubmit} className="pulse-card bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">Plan something together</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} required placeholder="Plan name, like Movie night" className="min-h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm" />
          <input value={place} onChange={(event) => setPlace(event.target.value)} maxLength={160} required placeholder="Where are you meeting?" className="min-h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm" />
          <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required className="min-h-11 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm" />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button type="submit" disabled={isSaving} className="ui-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold disabled:opacity-50">
          <Plus className="w-4 h-4" /> {isSaving ? 'Creating...' : 'Create Moment'}
        </button>
      </form>

      {moments.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">No plans yet. Create the first one for your circle.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moments.map((moment) => (
            <article key={moment.id} className="pulse-card bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{moment.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{new Date(moment.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700"><MapPin className="w-4 h-4 text-rose-500" />{moment.place}</div>
              <div className="flex items-center gap-2 border-t border-gray-100 pt-3 text-[11px] text-slate-500">
                <UserRound className="w-3.5 h-3.5" /> Planned by {moment.creatorProfile?.displayName || 'a circle member'} · {formatTimeAgo(moment.createdAt)}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
