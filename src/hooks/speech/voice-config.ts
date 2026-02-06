import { logger } from '@/lib/logger';

export interface VoiceConfig {
  voice?: 'male' | 'female';
  rate?: number;
  pitch?: number;
  volume?: number;
}

// 女性の声として知られている音声名のパターン
const FEMALE_VOICE_PATTERNS = [
  'haruka',
  'nanami',
  'kyoko',
  'o-ren',
  'siri',
  'google',
  'female',
  'ayumi',
  'mizuki',
  'sayaka',
  'mei',
];

// 男性の声として知られている音声名のパターン
const MALE_VOICE_PATTERNS = ['ichiro', 'keita', 'otoya', 'takumi', 'male', 'hiro'];

// 一度選択した声をキャッシュ（同じ性別の要求には必ず同じ声を返す）
const voiceCache: {
  male: SpeechSynthesisVoice | null;
  female: SpeechSynthesisVoice | null;
} = {
  male: null,
  female: null,
};

/**
 * 音声名から性別を推測する
 */
function guessVoiceGender(voiceName: string): 'male' | 'female' | 'unknown' {
  const lowerName = voiceName.toLowerCase();

  if (FEMALE_VOICE_PATTERNS.some((pattern) => lowerName.includes(pattern))) {
    return 'female';
  }
  if (MALE_VOICE_PATTERNS.some((pattern) => lowerName.includes(pattern))) {
    return 'male';
  }
  return 'unknown';
}

/**
 * 日本語音声を選択する
 * 同じ性別の要求には必ず同じ声を返す（キャッシュ使用）
 * @param config 音声設定
 * @returns 選択された音声、または未定義
 */
export function selectJapaneseVoice(config: VoiceConfig): SpeechSynthesisVoice | undefined {
  const preferredGender = config.voice || 'female';

  // キャッシュがあればそれを返す
  if (voiceCache[preferredGender]) {
    logger.debug(`Using cached voice for ${preferredGender}`, {
      voiceName: voiceCache[preferredGender]!.name,
    });
    return voiceCache[preferredGender]!;
  }

  const voices = window.speechSynthesis.getVoices();
  logger.debug('Available voices', {
    voices: voices.map((v) => `${v.name} (${v.lang})`),
  });

  if (voices.length === 0) {
    return undefined;
  }

  // 日本語音声のみをフィルタリング
  const japaneseVoices = voices.filter((voice) => voice.lang.includes('ja'));

  if (japaneseVoices.length === 0) {
    logger.debug('No Japanese voice found');
    return undefined;
  }

  // まず希望する性別の音声を探す
  const matchingVoice = japaneseVoices.find(
    (voice) => guessVoiceGender(voice.name) === preferredGender
  );

  // 見つかればそれを使用、なければ最初の日本語音声を使用
  const selectedVoice = matchingVoice || japaneseVoices[0];

  // キャッシュに保存
  voiceCache[preferredGender] = selectedVoice;

  logger.debug(`Selected and cached voice for ${preferredGender}`, {
    voiceName: selectedVoice.name,
    guessedGender: guessVoiceGender(selectedVoice.name),
  });

  return selectedVoice;
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
