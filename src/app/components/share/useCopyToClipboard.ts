'use client';
import { useState } from 'react';
import { logger } from '@/lib/logger';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return true;
      } else {
        // フォールバック: 古いブラウザや制限のある環境用
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
          return true;
        } else {
          logger.error('Failed to copy to clipboard');
          return false;
        }
      }
    } catch (err) {
      logger.error('Failed to copy to clipboard', err);
      return false;
    }
  };

  return { copied, copyToClipboard };
}
