// components/RasaWidget.js

'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WebChat: any;
  }
}

export default function RasaWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'rasa-webchat@1.0.1.js';
    script.async = true;
    script.onload = () => {
      window.WebChat.default(
        {
          initPayload: '/greet',
          customData: { language: 'vi' },
          socketUrl: 'http://localhost:5005',
          title: 'DẬT LẠC',
          inputTextFieldHint: 'Nhập tin nhắn...',
          showFullScreenButton: true,
          hideWhenNotConnected: false,
          showMessageDate: true,
          showResetButton: true,
          enableResetButton: true,
          params: {
            storage: 'session',
          },
        },
        null
      );
    };

    document.head.appendChild(script);
  }, []);

  return null; // không cần render gì cả
}
