import Link from 'next/link';
import { FacebookIcon, InstagramIcon, PinterestIcon } from '@/components/ui/Icons';

export default function Footer() {
  return (
    <footer className="relative bg-charcoal text-cream overflow-hidden">
      <div className="container pt-14 pb-8">
        <div className="font-anton uppercase leading-none text-[26px] md:text-[32px] text-cream/95 select-none">
          Kailash <span className="text-gold">Enterprises</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-9 mt-10 pt-10 border-t border-white/10">
          <div className="col-span-2 md:col-span-1">
            <p className="text-[13.5px] text-cream/60 max-w-[260px] leading-relaxed">
              Real stock, honestly photographed. Kalamkari, Warli print, Bandhani border and woven cotton sarees, sourced directly.
            </p>
            <p className="text-[13px] text-cream/60 mt-4">
              +91 98765 43210
              <br />
              hello@kailashenterprises.com
            </p>
            <div className="flex gap-2.5 mt-6">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold-light hover:bg-gold hover:text-maroon-dark hover:border-gold transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold-light hover:bg-gold hover:text-maroon-dark hover:border-gold transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Pinterest" className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold-light hover:bg-gold hover:text-maroon-dark hover:border-gold transition-colors">
                <PinterestIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-gold mb-5">Shop</h5>
            <ul className="space-y-3">
              <li><Link href="/shop?category=kalamkari" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Kalamkari &amp; Warli</Link></li>
              <li><Link href="/shop?category=bandhani" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Bandhani Border</Link></li>
              <li><Link href="/shop?category=printed" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Woven Stripe</Link></li>
              <li><Link href="/shop" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">All Sarees</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-gold mb-5">Help</h5>
            <ul className="space-y-3">
              <li><Link href="/track" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Track My Order</Link></li>
              <li><Link href="/contact" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Returns &amp; Exchange</Link></li>
              <li><Link href="/wishlist" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Wishlist</Link></li>
              <li><Link href="/cart" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-gold mb-5">Company</h5>
            <ul className="space-y-3">
              <li><Link href="/about" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="link-slide text-[13.5px] text-cream/70 hover:text-gold-light transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-5 border-t border-white/10 flex flex-wrap justify-between gap-2.5 font-mono text-[10.5px] text-cream/45">
          <span>&copy; 2026 KAILASH ENTERPRISES. All silks handwoven in India.</span>
          <span>UPI &middot; QR Payments Available</span>
        </div>
      </div>
    </footer>
  );
}
