import React, { useState, useRef } from 'react';

const ContactForm = () => {
  const formRef = useRef(null);
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('https://formspree.io/f/xdallyjv', {
        method: 'POST',
        body: new FormData(formRef.current),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('success');
        formRef.current.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = "w-full bg-white border border-slate-300 rounded px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#001F5B] transition-colors text-sm";

  return (
    <div className="glass-card p-10">
      {status === 'success' ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-6">✓</div>
          <h3 className="text-slate-900 font-black text-2xl mb-3">Message Sent</h3>
          <p className="text-slate-600">Thank you — I'll be in touch within 24 hours.</p>
          <button onClick={() => setStatus('idle')} className="mt-8 btn-secondary text-xs">Send Another</button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Name</label>
              <input name="name" type="text" required placeholder="Your full name" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Organisation</label>
              <input name="organisation" type="text" placeholder="Company / Entity" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Email</label>
            <input name="email" type="email" required placeholder="your@email.com" className={inputClass} />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Engagement Type</label>
            <select name="engagement_type" className={inputClass}>
              <option value="">Select engagement type...</option>
              <option value="Fractional CAE Engagement">Fractional CAE Engagement</option>
              <option value="IPO Readiness / ICOFR">IPO Readiness / ICOFR</option>
              <option value="Fraud Investigation">Fraud Investigation</option>
              <option value="ERM Programme">ERM Programme</option>
              <option value="Speaking / Advisory">Speaking / Advisory</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Message</label>
            <textarea name="message" required rows={5} placeholder="Describe the challenge you're facing" className={`${inputClass} resize-none`} />
          </div>
          {status === 'error' && (
            <p className="text-red-500 text-sm">Something went wrong. Please try emailing directly.</p>
          )}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
