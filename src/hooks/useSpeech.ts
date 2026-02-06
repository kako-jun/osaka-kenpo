'use client';
import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { normalizeTextForSpeech } from './speech/text-normalizer';
import { applyVoiceConfig, type VoiceConfig } from './speech/voice-config';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const speak = useCallback((text: string, options: VoiceConfig = {}) => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      logger.warn('Speech Synthesis is not supported in this browser');
      return;
    }

    // 既存の音声を停止
    window.speechSynthesis.cancel();

    // テキストの正規化（HTMLタグ削除 + 発音修正）
    const cleanText = normalizeTextForSpeech(text);

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 音声リストが読み込まれていない場合の対処
    const setupVoice = () => {
      applyVoiceConfig(utterance, options);

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    // 音声が読み込まれていない場合は少し待ってから実行
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      let hasExecuted = false;

      const executeOnce = () => {
        if (!hasExecuted) {
          hasExecuted = true;
          setupVoice();
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', executeOnce, { once: true });
      // フォールバック: 1秒後に実行（voiceschangedが発火しない場合のみ）
      setTimeout(executeOnce, 1000);
    } else {
      setupVoice();
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
};
