'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { HeartIcon, BagIcon, MenuIcon, CloseIcon, UserIcon } from '@/components/ui/Icons';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

// Kalyan-style category strip below the main header.
const CATEGORY_STRIP = [
  { href: '/shop', label: 'All Sarees' },
  { href: '/shop?category=kalamkari', label: 'Kalamkari & Warli' },
  { href: '/shop?category=bandhani', label: 'Bandhani Border' },
  { href: '/shop?category=printed', label: 'Woven Stripe' },
  { href: '/shop', label: 'Bridal' },
  { href: '/shop', label: 'New Arrivals' },
  { href: '/shop', label: 'Sale' },
];

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const { cartCount, wishlistCount } = useStore();
  const pathname = usePathname();

  const closeNav = () => setNavOpen(false);

  return (
    <>
      <div className="bg-maroon text-gold-pale text-center py-2 sm:py-2.5 px-3 sm:px-4 font-mono text-[10px] sm:text-[12px] tracking-[0.04em] sm:tracking-[0.08em] leading-snug">
        Free shipping above &#8377;2,999 &nbsp;&middot;&nbsp; <strong className="text-white">Use code SAREE10</strong> for 10% off your first order
      </div>

      <header className="sticky top-0 z-[100] bg-white">
        <div className="container flex items-center justify-between gap-2 py-3 sm:py-5">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 font-anton text-maroon uppercase leading-none shrink-0 min-w-0"
          >
            <Image
              src="/logo.jpeg"
              alt="Kailash Enterprises"
              width={56}
              height={56}
              className="h-9 w-9 sm:h-14 sm:w-14 object-cover rounded-full border border-gold/40 shrink-0"
              priority
            />
            {/* Stacks vertically on mobile (Kailash / Enterprises), sits side-by-side from sm up */}
            <span className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 tracking-[0.02em] min-w-0">
              <span className="text-[15px] sm:text-[26px] leading-tight truncate">Kailash</span>
              <span className="text-[10px] sm:text-[26px] text-gold-deep leading-tight truncate">Enterprises</span>
            </span>
          </Link>

          <nav className={`main-nav ${navOpen ? 'nav-open' : ''}`}>
            <ul className="flex flex-col md:flex-row md:gap-8">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href} className="nav-item">
                    <Link
                      href={link.href}
                      onClick={closeNav}
                      className={`text-[14px] tracking-[0.03em] nav-link ${active ? 'text-maroon nav-link-active' : 'text-charcoal'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/login" aria-label="Sign in" className="hidden xs:flex items-center text-charcoal hover:text-maroon transition-colors">
              <UserIcon className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative flex items-center gap-1.5 text-charcoal hover:text-maroon transition-colors">
              <HeartIcon className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-maroon text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="flex items-center gap-1.5 sm:gap-2 border border-gold px-2 sm:px-3.5 py-1.5 sm:py-2 text-maroon font-mono text-[11px] sm:text-[12px] tracking-[0.05em] hover:bg-gold-pale transition-colors"
            >
              <BagIcon className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]" />
              <span className="hidden sm:inline">Bag &middot;&nbsp;</span>{cartCount}
            </Link>
            <button
              aria-label="Menu"
              onClick={() => setNavOpen((v) => !v)}
              className="md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-maroon shrink-0"
            >
              {navOpen ? <CloseIcon className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px]" /> : <MenuIcon className="w-[18px] h-[18px] sm:w-[19px] sm:h-[19px]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Category strip (desktop only — collapses into the mobile nav dropdown instead) */}
      <div className="hidden md:block bg-ink text-white sticky top-0 z-[99]">
        <div className="container">
          <ul className="flex items-center justify-center gap-7 py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.06em]">
            {CATEGORY_STRIP.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className={`transition-colors ${c.label === 'Sale' ? 'text-maroon-light hover:text-white' : 'text-white/85 hover:text-maroon-light'}`}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="h-px bg-line" />

      <style jsx>{`
        .main-nav {
          display: flex;
        }
        .nav-link {
          position: relative;
          border-bottom: 1px solid transparent;
          transition: border-color 0.25s, color 0.25s;
          padding-bottom: 4px;
        }
        .nav-link:hover,
        .nav-link-active {
          border-color: #C89B3C;
        }
        @media (max-width: 768px) {
          .main-nav {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #FFFCF4;
            border-top: 1px solid rgba(200, 155, 60, 0.35);
            border-bottom: 1px solid rgba(200, 155, 60, 0.35);
            box-shadow: 0 16px 28px rgba(0, 0, 0, 0.12);
            padding: 6px 24px 10px;
            max-height: calc(100vh - 60px);
            overflow-y: auto;
          }
          .nav-open {
            display: block;
            animation: navDrop 0.22s ease;
          }
          .nav-item {
            border-bottom: 1px solid rgba(200, 155, 60, 0.18);
          }
          .nav-item:last-child {
            border-bottom: none;
          }
          .main-nav :global(.nav-link) {
            display: block;
            padding: 12px 0;
            border-bottom: none;
          }
        }
        @keyframes navDrop {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}