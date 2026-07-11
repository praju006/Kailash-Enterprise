'use client';

import { FormEvent, useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const { showToast } = useStore();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Thanks for subscribing! Watch your inbox for exclusive offers.');
      setEmail('');
    } else {
      showToast('Please enter a valid email address.');
    }
  }

  return (
    <section className="relative overflow-hidden py-24" style={{ background: 'linear-gradient(160deg, #8B1D2C 0%, #671420 100%)', color: '#FBEFCE' }}>
      <div className="container relative reveal-scale text-center">
        <span className="eyebrow justify-center" style={{ color: '#F4E4B8' }}>Join the List</span>
        <h2 className="display-big mt-4" style={{ color: '#F4E4B8' }}>
          ₹500 off<span className="text-gold">.</span> Early access<span className="text-gold">.</span>
        </h2>
        <p className="opacity-80 mt-4 max-w-[440px] mx-auto">New drops, festive offers, and weaver stories — no more than twice a month.</p>
        <form onSubmit={handleSubmit} className="flex max-w-[460px] mx-auto mt-9 border border-gold">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 min-w-0 bg-transparent border-none px-5 py-4 text-[14px] outline-none placeholder:text-gold-pale/55"
            style={{ color: '#FBEFCE' }}
          />
          <button type="submit" className="bg-gold text-maroon-dark border-none px-7 font-mono text-[12px] tracking-[0.06em] uppercase hover:bg-gold-light transition-colors shrink-0">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
