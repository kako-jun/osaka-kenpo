/**
 * テキストを段落配列に分割する
 *
 * 注: 現在のデータは既に配列形式なので、この関数は使用されていません。
 * 将来的にテキスト形式のデータを処理する場合のために残しています。
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [''];
  return text
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
