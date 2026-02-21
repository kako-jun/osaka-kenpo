/**
 * HTMLサニタイザー
 *
 * DB由来のHTMLを安全に描画するために、許可されたタグ・属性のみを残す。
 * 法律テキストのruby（ふりがな）タグ等を保持しつつ、XSSベクターを除去する。
 */

/** 許可するHTMLタグ */
const ALLOWED_TAGS = new Set([
  'ruby',
  'rt',
  'rp',
  'br',
  'em',
  'strong',
  'span',
  'sub',
  'sup',
  'b',
  'i',
  'u',
]);

/** 許可する属性（タグ問わず） */
const ALLOWED_ATTRS = new Set(['class', 'lang']);

/**
 * HTMLをサニタイズする。許可されたタグ・属性のみを残し、それ以外を除去する。
 * scriptタグ、イベントハンドラ属性（on*）、javascript: URLを除去する。
 */
export function sanitizeHtml(html: string): string {
  // scriptタグとその中身を除去
  let result = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 許可されていないタグを除去（中身は残す）
  result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      return '';
    }

    // 閉じタグはそのまま返す
    if (match.startsWith('</')) {
      return `</${tag}>`;
    }

    // 許可されたタグ: 属性をフィルタリング
    const selfClosing = match.endsWith('/>');
    const attrString = match.slice(match.indexOf(tagName) + tagName.length, selfClosing ? -2 : -1);

    // 属性を解析してフィルタ
    const safeAttrs: string[] = [];
    const attrRegex = /([a-zA-Z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // on* イベントハンドラを除去
      if (attrName.startsWith('on')) continue;
      // javascript: URL を除去
      if (attrValue.replace(/\s/g, '').toLowerCase().startsWith('javascript:')) continue;
      // 許可された属性のみ
      if (!ALLOWED_ATTRS.has(attrName)) continue;

      safeAttrs.push(`${attrName}="${attrValue}"`);
    }

    const attrs = safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : '';
    return selfClosing ? `<${tag}${attrs} />` : `<${tag}${attrs}>`;
  });

  return result;
}
