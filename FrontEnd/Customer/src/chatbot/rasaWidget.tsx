'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebChat: any;
  }
}

export default function RasaWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/rasa-webchat@1.0.1.js';
    script.async = true;

    script.onload = () => {
      try {
        window.WebChat.default(
          {
            initPayload: '/greet',
            customData: { language: 'vi' },
            socketUrl: 'http://localhost:5005',
            title: 'DẬT LẠC',
            inputTextFieldHint: 'Nhập tin nhắn...',
            showFullScreenButton: true,
            hideWhenNotConnected: true,
            showMessageDate: true,
            showResetButton: true,
            enableResetButton: true,
            connectOn: 'mount',
            params: {
              storage: 'session',
              connectTimeout: 5000,
            },
          },
          null
        );
      } catch {}
    };

    script.onerror = () => {};

    document.head.appendChild(script);
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    const hiddenPaths = ['/carts', '/checkout'];
    const isHidden = hiddenPaths.some((path) => pathname.startsWith(path));

    const el = document.getElementById('rasaWebchatPro');
    if (el) {
      el.style.display = isHidden ? 'none' : 'block';
    }
  }, [pathname]);

  return null;
}
