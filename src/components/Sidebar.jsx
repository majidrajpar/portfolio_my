import React from 'react';

const metrics = [
  { value: 'AED 3.2M', label: 'Annual Recovery' },
  { value: '78%',      label: 'Fraud Reduced' },
  { value: '100%',     label: 'Population Testing' },
  { value: '20 Yrs',   label: 'GCC Experience' },
];

const Sidebar = () => (
  <aside className="hidden lg:flex fixed top-0 right-0 h-screen w-64 z-40 flex-col bg-slate-900/95 border-l border-white/5 backdrop-blur-xl overflow-y-auto">
    <div className="flex flex-col flex-1 px-6 py-10">

      {/* Profile */}
      <div className="flex flex-col items-center text-center mb-7">
        <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-white/10 ring-4 ring-blue-500/20 mb-4 flex-shrink-0">
          <img
            src="/portfolio_my/images/majid-profile.jpg"
            alt="Majid Mumtaz"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <h2 className="text-white font-black text-sm mb-1 tracking-tight">Majid Mumtaz</h2>
        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">CIA · ACA · FCCA</p>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-7">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">Available for Advisory</span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-7" />

      {/* Metrics */}
      <div className="space-y-3 mb-7">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between gap-2">
            <span className="text-slate-500 text-[11px] font-bold">{m.label}</span>
            <span className="text-white font-black text-xs">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-7" />

      {/* Contact */}
      <div className="space-y-3">
        <a
          href="mailto:majidrajpar@gmail.com"
          className="flex items-center gap-3 w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-blue-500/30 hover:bg-white/10 transition-all group"
        >
          <span className="text-sm">✉</span>
          <span className="text-[11px] font-black uppercase tracking-wider">Email</span>
        </a>
        <a
          href="https://www.linkedin.com/in/majid-m-4b097118/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-blue-500/30 hover:bg-white/10 transition-all group"
        >
          <span className="text-sm font-black">in</span>
          <span className="text-[11px] font-black uppercase tracking-wider">LinkedIn</span>
        </a>
        <a
          href="https://wa.me/971507471708"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-emerald-500/30 hover:bg-white/10 transition-all group"
        >
          <span className="text-sm">WA</span>
          <span className="text-[11px] font-black uppercase tracking-wider">WhatsApp</span>
        </a>
      </div>

      {/* Spacer pushes bottom content down */}
      <div className="flex-1" />

      {/* Bottom label */}
      <div className="text-center mt-8">
        <p className="text-slate-700 text-[9px] uppercase tracking-[0.3em] font-black">Board Advisory</p>
        <p className="text-slate-700 text-[9px] uppercase tracking-[0.3em] font-black">UAE · KSA · GCC</p>
      </div>
    </div>
  </aside>
);

export default Sidebar;
