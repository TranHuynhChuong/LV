'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    voiceflow?: any;
  }
}

export default function VoiceflowWidget() {
  const pathname = usePathname();

  // Các đường dẫn cần ẩn widget
  const hiddenPaths = ['/carts', '/order'];

  const shouldHide = hiddenPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (shouldHide) return;

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
        window.voiceflow.chat.load({
          verify: { projectID: '686204b7de64374aed273dc7' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: 'https://runtime-api.voiceflow.com',
          },
          launch: {
            event: {
              type: 'launch',
              payload: {
                url: process.env.NEXT_PUBLIC_BE_API_CHATBOT,
              },
            },
          },
        });
      }
    };

    document.body.appendChild(script);
  }, [shouldHide]);

  return null;
}
