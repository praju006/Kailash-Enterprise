'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PhoneIcon, MailIcon } from '@/components/ui/Icons';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY: FormState = { name: '', email: '', subject: '', message: '' };

const VALIDATORS: Record<keyof FormState, (v: string) => boolean> = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  subject: (v) => v.trim().length >= 3,
  message: (v) => v.trim().length >= 10,
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [sent, setSent] = useState(false);

  function validateField(field: keyof FormState, value: string) {
    const valid = VALIDATORS[field](value);
    setErrors((e) => ({ ...e, [field]: !valid }));
    return valid;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let allValid = true;
    (Object.keys(VALIDATORS) as (keyof FormState)[]).forEach((field) => {
      if (!validateField(field, form[field])) allValid = false;
    });
    if (!allValid) return;
    setSent(true);
    setForm(EMPTY);
    setErrors({});
  }

  const fields: { key: keyof FormState; label: string; type: 'text' | 'email' | 'textarea'; error: string }[] = [
    { key: 'name', label: 'Full Name *', type: 'text', error: 'Please enter your name.' },
    { key: 'email', label: 'Email Address *', type: 'email', error: 'Please enter a valid email address.' },
    { key: 'subject', label: 'Subject *', type: 'text', error: 'Please enter a subject.' },
    { key: 'message', label: 'Message *', type: 'textarea', error: 'Please enter your message (at least 10 characters).' },
  ];

  return (
    <>
      <div className="container pt-7 pb-2">
        <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft hover:text-maroon transition-colors">← Back</Link>
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="text-center mb-10 reveal">
            <span className="eyebrow justify-center">Get In Touch</span>
            <h1 className="mt-3.5">We&apos;d Love to Hear From You</h1>
            <p className="section-sub mb-0">Questions about an order, styling advice, or bulk / wedding enquiries — our team typically responds within 24 hours.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 reveal">
            <div>
              <div className="flex gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-full border border-gold/50 flex items-center justify-center text-maroon shrink-0"><PhoneIcon className="w-5 h-5" /></div>
                <div><strong className="font-head">Call Us</strong><p className="mt-0.5 mb-0 text-ink-soft">+91 98765 43210 (Mon–Sat, 10am–7pm IST)</p></div>
              </div>
              <div className="flex gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-full border border-gold/50 flex items-center justify-center text-maroon shrink-0"><MailIcon className="w-5 h-5" /></div>
                <div><strong className="font-head">Email Us</strong><p className="mt-0.5 mb-0 text-ink-soft">hello@kailashenterprises.com</p></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {fields.map((f) => (
                <div key={f.key} className="mb-4">
                  <label htmlFor={f.key} className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={f.key}
                      name={f.key}
                      rows={5}
                      value={form[f.key]}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      onBlur={(e) => validateField(f.key, e.target.value)}
                      className={`w-full px-3.5 py-2.5 border bg-white focus:outline-none focus:ring-2 focus:ring-gold ${errors[f.key] ? 'border-maroon' : 'border-line'}`}
                    />
                  ) : (
                    <input
                      id={f.key}
                      name={f.key}
                      type={f.type}
                      value={form[f.key]}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                      onBlur={(e) => validateField(f.key, e.target.value)}
                      className={`w-full px-3.5 py-2.5 border bg-white focus:outline-none focus:ring-2 focus:ring-gold ${errors[f.key] ? 'border-maroon' : 'border-line'}`}
                    />
                  )}
                  {errors[f.key] && <div className="text-maroon text-xs mt-1">{f.error}</div>}
                </div>
              ))}
              <button type="submit" className="btn-primary w-full py-3.5">Send Message</button>
              {sent && (
                <div className="mt-4 p-3.5 border border-gold/40 text-center text-maroon-dark font-semibold" style={{ background: '#FBF3DF' }}>
                  ✓ Thank you! Your message has been sent — we&apos;ll get back to you within 24 hours.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
