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
        const win = window as Window & { gtag?: (command: string, name: string, params?: Record<string, string>) => void };
        if (typeof win.gtag === 'function') {
          win.gtag('event', 'contact_form_submit', { form: 'contact' });
        }
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = "w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors text-sm";

  return (
    <div className="frame-panel p-6 md:p-8">
      {status === 'success' ? (
        <div role="status" aria-live="polite" className="text-center py-12">
          <div className="text-4xl mb-4 text-slate-900" aria-hidden="true">✓</div>
          <h3 className="text-slate-900 font-semibold text-xl mb-2">Message Sent</h3>
          <p className="text-slate-600 text-sm">Thank you — I'll be in touch.</p>
          <button onClick={() => setStatus('idle')} className="mt-6 btn-secondary text-xs">Send Another Message</button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5" aria-busy={status === 'submitting'}>
          <div>
            <label htmlFor="contact-name" className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2 block">Name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" required placeholder="Your full name" className={inputClass} />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2 block">Email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required placeholder="your@email.com" className={inputClass} />
          </div>
          <div>
            <label htmlFor="contact-message" className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2 block">Message</label>
            <textarea id="contact-message" name="message" required rows={4} placeholder="Describe the challenge you're facing" className={`${inputClass} resize-none`} />
          </div>
          {status === 'error' && (
            <p role="alert" className="text-red-600 text-sm">Something went wrong. Please try emailing directly.</p>
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
