import { logger } from '@/lib/logger';

export interface VoiceConfig {
  voice?: 'male' | 'female';
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * 日本語音声を選択する
 * @param config 音声設定
 * @returns 選択された音声、または未定義
 */
export function selectJapaneseVoice(config: VoiceConfig): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  logger.debug('Available voices', {
    voices: voices.map((v) => `${v.name} (${v.lang})`),
  });

  if (voices.length === 0) {
    return undefined;
  }

  const japaneseVoice = voices.find((voice) => voice.lang.includes('ja'));

  if (!japaneseVoice) {
    logger.debug('No Japanese voice found');
    return undefined;
  }

  logger.debug(`Selected voice for ${config.voice || 'default'}`, {
    voiceName: japaneseVoice.name,
  });

  return japaneseVoice;
}

/**
 * 音声設定を適用する（男性用・女性用の設定）
 * @param utterance SpeechSynthesisUtterance オブジェクト
 * @param config 音声設定
 */
export function applyVoiceConfig(utterance: SpeechSynthesisUtterance, config: VoiceConfig): void {
  // 音声設定のデフォルト値
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = config.volume || 0.8;

  const voice = selectJapaneseVoice(config);
  if (!voice) {
    return;
  }

  utterance.voice = voice;

  if (config.voice === 'male') {
    // 男性らしい低いピッチに設定
    utterance.pitch = 0.7;
    utterance.rate = 0.9;
  } else if (config.voice === 'female') {
    // 女性らしい設定（春日歩風だが控えめに）
    utterance.pitch = 1.1;
    utterance.rate = 0.9;
  }
}
