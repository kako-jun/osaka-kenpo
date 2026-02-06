/**
 * テキストからHTMLタグを削除してクリーンなテキストを抽出
 * @param text 元のテキスト
 * @returns HTMLタグを削除したテキスト
 */
export function cleanHtmlTags(text: string): string {
  // ルビタグ <ruby>漢字<rt>よみ</rt></ruby> から漢字部分のみを抽出
  let cleanText = text.replace(/<ruby>([^<]+)<rt>[^<]*<\/rt><\/ruby>/g, '$1');
  // 残りのHTMLタグを削除
  cleanText = cleanText.replace(/<[^>]*>/g, '');
  return cleanText;
}

/**
 * 助詞の発音を修正する（は→わ、へ→え）
 * @param text 元のテキスト
 * @returns 発音を修正したテキスト
 */
export function fixParticlePronunciation(text: string): string {
  return (
    text
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
  );
}

/**
 * 古文の動詞活用の発音を修正する
 * @param text 元のテキスト
 * @returns 発音を修正したテキスト
 */
export function fixClassicalVerbPronunciation(text: string): string {
  return text
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
    .replace(/覆ふ/g, 'おおう');
}

/**
 * 古文の助動詞・語尾の発音を修正する（現状変換なし、将来の拡張用）
 * @param text 元のテキスト
 * @returns 発音を修正したテキスト
 */
export function fixClassicalAuxiliaryPronunciation(text: string): string {
  return text
    .replace(/べし/g, 'べし')
    .replace(/べからず/g, 'べからず')
    .replace(/なり/g, 'なり')
    .replace(/かな/g, 'かな')
    .replace(/けり/g, 'けり')
    .replace(/たり/g, 'たり');
}

/**
 * 古文の特殊な読み方を修正する
 * @param text 元のテキスト
 * @returns 発音を修正したテキスト
 */
export function fixClassicalSpecialReading(text: string): string {
  return text
    .replace(/曰く/g, 'いわく')
    .replace(/承る/g, 'うけたまわる')
    .replace(/詔/g, 'みことのり')
    .replace(/為す/g, 'なす')
    .replace(/有り/g, 'あり')
    .replace(/三寶/g, 'さんぽう')
    .replace(/四生/g, 'ししょう')
    .replace(/百姓/g, 'ひゃくせい')
    .replace(/訟訴/g, 'しょうそ');
}

/**
 * 古い漢字の読み方を修正する
 * @param text 元のテキスト
 * @returns 発音を修正したテキスト
 */
export function fixOldKanjiReading(text: string): string {
  return text
    .replace(/爲/g, 'ため')
    .replace(/於/g, 'おいて')
    .replace(/黨/g, 'とう')
    .replace(/寶/g, 'ほう');
}

/**
 * 現代語の読み間違いやすい語彙を修正する
 * @param text 元のテキスト
 * @returns 発音を修正したテキスト
 */
export function fixModernMispronunciation(text: string): string {
  return text
    .replace(/基く/g, 'もとづく')
    .replace(/基いて/g, 'もとづいて')
    .replace(/基き/g, 'もとづき')
    .replace(/基ける/g, 'もとづける')
    .replace(/基かない/g, 'もとづかない');
}

/**
 * テキストの発音を全て修正する（統合関数）
 * @param text 元のテキスト
 * @returns 発音を修正したテキスト
 */
export function normalizeTextForSpeech(text: string): string {
  let normalized = cleanHtmlTags(text);
  normalized = fixParticlePronunciation(normalized);
  normalized = fixClassicalVerbPronunciation(normalized);
  normalized = fixClassicalAuxiliaryPronunciation(normalized);
  normalized = fixClassicalSpecialReading(normalized);
  normalized = fixOldKanjiReading(normalized);
  normalized = fixModernMispronunciation(normalized);
  return normalized;
}
