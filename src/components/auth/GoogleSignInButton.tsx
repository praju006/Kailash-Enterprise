'use client';

import { useEffect, useRef } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/**
 * Renders the official "Sign in with Google" button. On success it hands the
 * signed ID token (credential) to `onCredential`, which the caller POSTs to
 * /api/auth/google for server-side verification.
 */
export default function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest callback in a ref so the effect doesn't re-init the button on every render.
  const cbRef = useRef(onCredential);
  cbRef.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID) return;

    function init() {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (resp) => cbRef.current(resp.credential),
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 300,
        logo_alignment: 'center',
      });
    }

    if (window.google) {
      init();
      return;
    }

    const SCRIPT_ID = 'google-gsi-client';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', init);
    return () => script?.removeEventListener('load', init);
  }, []);

  if (!CLIENT_ID) {
    return <p className="text-xs text-ink-soft text-center">Google sign-in is not configured.</p>;
  }

  return <div ref={containerRef} className="flex justify-center min-h-[40px]" />;
}
