'use client';
import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface SpeechOptions {
  voice?: 'male' | 'female';
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const speak = useCallback((text: string, options: SpeechOptions = {}) => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      logger.warn('Speech Synthesis is not supported in this browser');
      return;
    }

    // 既存の音声を停止
    window.speechSynthesis.cancel();

    // HTMLタグを削除してテキストのみを抽出（ルビの重複読み上げを防ぐ）
    let cleanText = text;
    // ルビタグ <ruby>漢字<rt>よみ</rt></ruby> から漢字部分のみを抽出
    cleanText = cleanText.replace(/<ruby>([^<]+)<rt>[^<]*<\/rt><\/ruby>/g, '$1');
    // 残りのHTMLタグを削除
    cleanText = cleanText.replace(/<[^>]*>/g, '');

    // 助詞の発音修正（は→わ、へ→え）+ 古文の発音修正
    cleanText = cleanText
      // まず「はん」敬称を保護するためにプレースホルダーに置換
      .replace(/はん/g, '__HAN_PLACEHOLDER__')

      // 助詞「は」を「わ」に変換
      .replace(/([あ-んァ-ヶー一-龯])は([あ-んァ-ヶー一-龯、。！？\s]|$)/g, '$1わ$2')
      // 助詞「へ」を「え」に変換
      .replace(/([あ-んァ-ヶー一-龯])へ([あ-んァ-ヶー一-龯、。！？\s]|$)/g, '$1え$2')
      // 文頭の「これは」「それは」なども対応
      .replace(/^([これそれあれどれ])は([あ-んァ-ヶー一-龯])/g, '$1わ$2')
      .replace(/(^|\s)([これそれあれどれ])は([あ-んァ-ヶー一-龯])/g, '$1$2わ$3')

      // プレースホルダーを「はん」に戻す
      .replace(/__HAN_PLACEHOLDER__/g, 'はん')

      // 古文の動詞活用の発音修正
      .replace(/使ふ/g, 'つかう')
      .replace(/思ふ/g, 'おもう')
      .replace(/申ふ/g, 'もうす')
      .replace(/言ふ/g, 'いう')
      .replace(/行ふ/g, 'おこなう')
      .replace(/習ふ/g, 'ならう')
      .replace(/争ふ/g, 'あらそう')
      .replace(/従ふ/g, 'したがう')
      .replace(/養ふ/g, 'やしなう')
      .replace(/救ふ/g, 'すくう')
      .replace(/憂ふ/g, 'うれう')
      .replace(/買ふ/g, 'かう')
      .replace(/問ふ/g, 'とう')
      .replace(/賄ふ/g, 'まかなう')
      .replace(/覆ふ/g, 'おおう')

      // 古文の助動詞・語尾の発音修正
      .replace(/べし/g, 'べし')
      .replace(/べからず/g, 'べからず')
      .replace(/なり/g, 'なり')
      .replace(/かな/g, 'かな')
      .replace(/けり/g, 'けり')
      .replace(/たり/g, 'たり')

      // 古文の特殊な読み方
      .replace(/曰く/g, 'いわく')
      .replace(/承る/g, 'うけたまわる')
      .replace(/詔/g, 'みことのり')
      .replace(/為す/g, 'なす')
      .replace(/有り/g, 'あり')
      .replace(/三寶/g, 'さんぽう')
      .replace(/四生/g, 'ししょう')
      .replace(/百姓/g, 'ひゃくせい')
      .replace(/訟訴/g, 'しょうそ')

      // 古い漢字の読み方
      .replace(/爲/g, 'ため')
      .replace(/於/g, 'おいて')
      .replace(/黨/g, 'とう')
      .replace(/寶/g, 'ほう')

      // 現代語の読み間違いやすい語彙
      .replace(/基く/g, 'もとづく')
      .replace(/基いて/g, 'もとづいて')
      .replace(/基き/g, 'もとづき')
      .replace(/基ける/g, 'もとづける')
      .replace(/基かない/g, 'もとづかない');

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 音声リストが読み込まれていない場合の対処
    const setupVoice = () => {
      // 音声設定のデフォルト値
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = options.volume || 0.8;

      // 音声の選択
      const voices = window.speechSynthesis.getVoices();
      logger.debug('Available voices', {
        voices: voices.map((v) => `${v.name} (${v.lang})`),
      });

      if (voices.length > 0) {
        if (options.voice === 'male') {
          // Google 日本語音声を男性用に使用
          const japaneseVoice = voices.find((voice) => voice.lang.includes('ja'));

          if (japaneseVoice) {
            utterance.voice = japaneseVoice;
            logger.debug('Selected voice for male', { voiceName: japaneseVoice.name });
            // 男性らしい低いピッチに設定
            utterance.pitch = 0.7;
          } else {
            logger.debug('No Japanese voice found');
          }
          utterance.rate = 0.9; // 統一速度
        } else if (options.voice === 'female') {
          // Google 日本語音声を女性用に使用
          const japaneseVoice = voices.find((voice) => voice.lang.includes('ja'));

          if (japaneseVoice) {
            utterance.voice = japaneseVoice;
            logger.debug('Selected voice for female', { voiceName: japaneseVoice.name });
          }
          // 女性らしい設定（春日歩風だが控えめに）
          utterance.pitch = 1.1; // 少し高めに
          utterance.rate = 0.9; // 統一速度
        }
      }

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
