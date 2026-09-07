import React from 'react';
import { ArrowRight, BellRing, CalendarDays, Check, MapPin, Radio, ShieldCheck, Sparkles, Users } from 'lucide-react';

interface LandingPageProps {
  onCreateAccount: () => void;
  onSignIn: () => void;
}

const signals = [
  { icon: Radio, label: 'Live circle', value: '4 people connected', tone: 'sky' },
  { icon: BellRing, label: 'Latest pulse', value: 'Maya arrived safely', tone: 'rose' },
  { icon: CalendarDays, label: 'Next moment', value: 'Dinner · 7:30 PM', tone: 'amber' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateAccount, onSignIn }) => (
  <div className="landing-page min-h-dvh overflow-hidden bg-[#f4f5ef] text-[#111318]">
    <header className="landing-nav relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <button type="button" onClick={onCreateAccount} className="flex items-center gap-2.5" aria-label="Open Pulse signup">
        <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#111318] text-white shadow-lg shadow-[#111318]/10">
          <Radio className="h-4 w-4 text-sky-300" />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.02em]">Pulse</span>
      </button>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-[#d9ddd3] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#73766f] sm:inline-flex">Private beta</span>
        <button type="button" onClick={onSignIn} className="rounded-full px-3 py-2 text-xs font-semibold text-[#4b504a] transition-colors hover:bg-white hover:text-[#111318]">Sign in</button>
      </div>
    </header>

    <main>
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[.88fr_1.12fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="relative z-10 max-w-xl landing-reveal">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7ddd4] bg-white/75 px-3 py-1.5 text-[11px] font-semibold text-[#536056] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            A calmer way to stay close
          </div>
          <h1 className="max-w-[680px] text-[clamp(2.8rem,7vw,5.9rem)] font-semibold leading-[.95] tracking-[-0.065em] text-[#111318]">
            Know they’re okay.<br /><span className="text-[#2855ff]">Keep life private.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#62685f] sm:text-lg sm:leading-8">
            Pulse gives small trusted circles a live map, simple safety check-ins, and shared plans without turning your life into a public feed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onCreateAccount} className="landing-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#111318] px-5 text-sm font-semibold text-white shadow-xl shadow-[#111318]/15 transition-transform hover:-translate-y-0.5 active:translate-y-0">
              Start your free beta <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={onSignIn} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#d5dad1] bg-white/60 px-5 text-sm font-semibold text-[#353a35] transition-colors hover:bg-white">Sign in to Pulse</button>
          </div>
          <p className="mt-4 text-[11px] font-medium text-[#858b82]">Free while we test with small trusted groups. No credit card.</p>
        </div>

        <div className="relative landing-reveal landing-reveal-delay">
          <div className="landing-glow" />
          <div className="landing-map-frame relative overflow-hidden rounded-[28px] border border-white/80 bg-[#dce5df] p-2 shadow-[0_30px_90px_rgba(35,49,42,.16)] sm:p-3">
            <div className="landing-map relative aspect-[1.03/1] overflow-hidden rounded-[21px] bg-[#d9e3df]">
              <div className="landing-map-grid" />
              <div className="landing-road landing-road-one" />
              <div className="landing-road landing-road-two" />
              <div className="landing-road landing-road-three" />
              <div className="landing-water" />
              <div className="absolute left-[17%] top-[18%] text-[10px] font-semibold uppercase tracking-[.16em] text-[#75877d]">Greenway</div>
              <div className="absolute right-[12%] top-[42%] text-[10px] font-semibold uppercase tracking-[.16em] text-[#75877d]">Home area</div>
              <div className="landing-pin landing-pin-main left-[49%] top-[48%]"><span><MapPin className="h-4 w-4" /></span><b>Alex</b></div>
              <div className="landing-pin landing-pin-small left-[25%] top-[29%]"><span><MapPin className="h-3.5 w-3.5" /></span><b>Maya</b></div>
              <div className="landing-pin landing-pin-small left-[72%] top-[68%]"><span><MapPin className="h-3.5 w-3.5" /></span><b>Sam</b></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/70 bg-white/85 px-3 py-2.5 shadow-lg backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5 sm:px-4">
                <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111318] text-white"><ShieldCheck className="h-4 w-4 text-emerald-300" /></span><div><p className="text-[10px] font-bold text-[#111318]">The Rivera circle</p><p className="text-[9px] text-[#7b837a]">4 trusted members · Live now</p></div></div>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Active</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-2 hidden w-44 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-md sm:block lg:-left-8"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-500"><BellRing className="h-3.5 w-3.5" /></span><div><p className="text-[10px] font-bold">Maya arrived safely</p><p className="text-[9px] text-[#858b82]">Just now</p></div></div></div>
        </div>
      </section>

      <section className="border-y border-[#dfe3da] bg-white/45">
        <div className="mx-auto grid max-w-7xl gap-px px-5 sm:grid-cols-3 sm:px-8 lg:px-12">
          {signals.map(({ icon: Icon, label, value, tone }) => (
            <div key={label} className="flex items-center gap-3 border-[#e5e8e2] py-5 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone === 'sky' ? 'bg-sky-50 text-sky-600' : tone === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'}`}><Icon className="h-4 w-4" /></span>
              <div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8a9087]">{label}</p><p className="mt-0.5 text-xs font-semibold text-[#30352f]">{value}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2855ff]">Made for the inner circle</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">The useful middle ground between a text and a tracking app.</h2></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <article className="landing-feature border-t-2 border-[#2855ff] pt-5"><Users className="h-5 w-5 text-[#2855ff]" /><h3 className="mt-5 text-lg font-semibold">Small by design</h3><p className="mt-2 text-sm leading-6 text-[#73766f]">Private circles for family, partners, roommates, and the friends who actually need to know.</p></article>
          <article className="landing-feature border-t-2 border-[#111318] pt-5"><ShieldCheck className="h-5 w-5 text-[#111318]" /><h3 className="mt-5 text-lg font-semibold">Consent comes first</h3><p className="mt-2 text-sm leading-6 text-[#73766f]">Every share has a timer, a clear audience, and a one-tap stop. Your location is never the default.</p></article>
          <article className="landing-feature border-t-2 border-[#f0a83b] pt-5"><Sparkles className="h-5 w-5 text-[#d58a17]" /><h3 className="mt-5 text-lg font-semibold">More than a dot</h3><p className="mt-2 text-sm leading-6 text-[#73766f]">Check-ins, plans, pings, and meaningful places turn location into context people can use.</p></article>
        </div>
      </section>

      <section className="mx-5 mb-8 overflow-hidden rounded-[26px] bg-[#111318] px-6 py-12 text-white sm:mx-8 sm:px-10 lg:mx-auto lg:max-w-7xl lg:px-16"><div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-sky-300">Join the beta</p><h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">Keep your people close without giving the whole world a window.</h2></div><button type="button" onClick={onCreateAccount} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#111318] transition-transform hover:-translate-y-0.5">Create a free circle <ArrowRight className="h-4 w-4" /></button></div></section>
    </main>
    <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 pb-8 text-[10px] font-medium text-[#8b9188] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span>Pulse · Trusted circles, thoughtfully connected.</span><span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-600" /> Free during private beta</span></footer>
  </div>
);
