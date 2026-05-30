import { useState, useRef, type FormEvent } from 'react';

const ContactForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    if (!formRef.current) return;
    try {
      const res = await fetch('https://formspree.io/f/xdallyjv', {
        method: 'POST',
        body: new FormData(formRef.current),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('success');
        formRef.current?.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = "w-full rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-white placeholder:text-white/35 focus:outline-none focus:border-[#c7964c] transition-colors text-sm backdrop-blur";

  return (
    <div className="frame-panel p-8 md:p-10">
      {status === 'success' ? (
        <div role="status" aria-live="polite" className="text-center py-12">
          <div className="text-5xl mb-6 text-[#f4c98b]" aria-hidden="true">✓</div>
          <h3 className="text-white font-black text-2xl mb-3">Message Sent</h3>
          <p className="text-white/68">Thank you — I'll be in touch.</p>
          <button onClick={() => setStatus('idle')} className="mt-8 btn-secondary text-xs">Send Another Message</button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" aria-busy={status === 'submitting'}>
          <div>
            <label htmlFor="contact-name" className="text-[10px] font-black uppercase tracking-[0.24em] text-white/48 mb-2 block">Name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" required placeholder="Your full name" className={inputClass} />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-[0.24em] text-white/48 mb-2 block">Email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required placeholder="your@email.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-[0.24em] text-white/48 mb-2 block">Message</label>
            <textarea id="contact-message" name="message" required rows={4} placeholder="Describe the challenge you're facing" className={`${inputClass} resize-none`} />
          </div>
          {status === 'error' && (
            <p role="alert" className="text-red-300 text-sm">Something went wrong. Please try emailing directly.</p>
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
