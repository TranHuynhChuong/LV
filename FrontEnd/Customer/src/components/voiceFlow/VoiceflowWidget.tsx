'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    voiceflow?: any;
  }
}

export default function VoiceflowWidget() {
  const pathname = usePathname();
  const isLoadedRef = useRef(false);

  // Load script chỉ 1 lần
  useEffect(() => {
    const launchUrl = process.env.NEXT_PUBLIC_BE_API_CHATBOT;
    if (!launchUrl) {
      console.warn('Voiceflow launch URL is not defined');
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';

    script.onload = () => {
      if (window.voiceflow?.chat?.load) {
        window.voiceflow.chat
          .load({
            verify: { projectID: '686204b7de64374aed273dc7' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production',
            voice: { url: 'https://runtime-api.voiceflow.com' },
            launch: {
              event: {
                type: 'launch',
                payload: { url: launchUrl },
              },
            },
          })
          .then(() => {
            isLoadedRef.current = true;
            adjustVisibility(pathname);
          });
      }
    };

    document.body.appendChild(script);
  }, []);

  // Theo dõi pathname
  useEffect(() => {
    if (!isLoadedRef.current) return;
    adjustVisibility(pathname);
  }, [pathname]);

  function adjustVisibility(path: string) {
    const hiddenPaths = ['/carts', '/checkout'];
    const shouldHide = hiddenPaths.some((p) => path.startsWith(p));
    if (shouldHide) {
      window.voiceflow?.chat?.hide?.();
    } else {
      window.voiceflow?.chat?.show?.();
    }
  }

  return null;
}
