'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const SELECTOR = '.reveal:not(.in-view), .reveal-left:not(.in-view), .reveal-right:not(.in-view), .reveal-scale:not(.in-view)';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    function scan() {
      // Stagger delay is set by each component via its own `index` prop (deterministic,
      // SSR-safe). Don't touch transitionDelay here — that fights React's own style
      // reconciliation and causes hydration mismatches.
      document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));
    }

    scan();

    // Re-scan when content changes client-side (e.g. shop filters re-rendering product grids).
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
