import { describe, it, expect } from 'vitest';
import {
  extractFirstParagraphFromHead,
  navExcerptFromHead,
  getArticleSortKey,
  getExcerpt,
  formatArticleNumber,
} from '@/lib/utils';

describe('extractFirstParagraphFromHead', () => {
  it('正常な JSON 配列文字列から先頭段落を返す', () => {
    const json = JSON.stringify(['第一条　この憲法は最高法規である。']);
    expect(extractFirstParagraphFromHead(json)).toBe('第一条　この憲法は最高法規である。');
  });

  it('複数要素の場合は最初の要素のみを返す', () => {
    const json = JSON.stringify(['A', 'B']);
    expect(extractFirstParagraphFromHead(json)).toBe('A');
  });

  it('substr で切断された断片でも例外を出さず接頭辞を復元する', () => {
    const full = JSON.stringify(['とても長い第一段落のテキストがここに続いていきます']);
    // 閉じ `"` まで到達しない長さで切る（先頭から途中まで）
    const head = full.slice(0, 12);
    let result: string;
    expect(() => {
      result = extractFirstParagraphFromHead(head);
    }).not.toThrow();
    const complete = extractFirstParagraphFromHead(full);
    result = extractFirstParagraphFromHead(head);
    // 復元結果は完全版の接頭辞になっている
    expect(complete.startsWith(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('エスケープ \\" を " に復元する', () => {
    // JSON: ["a\"b"]  ->  a"b
    const head = '["a\\"b"]';
    expect(extractFirstParagraphFromHead(head)).toBe('a"b');
  });

  it('エスケープ \\\\ を \\ に復元する', () => {
    const json = JSON.stringify(['a\\b']);
    expect(extractFirstParagraphFromHead(json)).toBe('a\\b');
  });

  it('改行 \\n とタブ \\t を制御文字に復元する', () => {
    const json = JSON.stringify(['a\nb\tc']);
    expect(extractFirstParagraphFromHead(json)).toBe('a\nb\tc');
  });

  it('\\uXXXX を対応文字に復元する（\\u0041 -> A）', () => {
    const head = '["\\u0041BC"]';
    expect(extractFirstParagraphFromHead(head)).toBe('ABC');
  });

  it('閉じ引用直前が偶数連バックスラッシュなら正しく終端し第二要素を飲み込まない', () => {
    // JSON: ["ab\\"]  ->  第一要素は "ab\"（バックスラッシュで終わる）。
    // 偶数連（\\\\ = 2個）の後の " が真の終端。
    const head = '["ab\\\\"]';
    // JSON.parse 等価性で確認
    expect(JSON.parse(head)[0]).toBe('ab\\');
    expect(extractFirstParagraphFromHead(head)).toBe('ab\\');
  });

  it('閉じ引用直前が偶数連バックスラッシュでも第二要素を飲み込まない（複数要素）', () => {
    const head = '["ab\\\\","second"]';
    expect(JSON.parse(head)[0]).toBe('ab\\');
    expect(extractFirstParagraphFromHead(head)).toBe('ab\\');
  });

  it('null / undefined / 空文字 / [] / [ ] / 非配列文字列はすべて空文字を返す', () => {
    expect(extractFirstParagraphFromHead(null)).toBe('');
    expect(extractFirstParagraphFromHead(undefined)).toBe('');
    expect(extractFirstParagraphFromHead('')).toBe('');
    expect(extractFirstParagraphFromHead('[]')).toBe('');
    expect(extractFirstParagraphFromHead('[ ]')).toBe('');
    expect(extractFirstParagraphFromHead('foo')).toBe('');
  });

  describe('JSON.parse(json)[0] との等価性（切断していない有効入力）', () => {
    const cases: string[][] = [
      ['シンプルな段落'],
      ['バックスラッシュ\\を含む'],
      ['タブ\tと改行\nを含む'],
      ['引用符"を含む'],
      ['非ASCII：αβγ漢字😀'],
      ['複数要素の先頭', '二番目', '三番目'],
      ['制御文字\r\b\fを含む'],
      ['ユニコードエスケープ対象éあ'],
    ];

    for (const arr of cases) {
      it(`${JSON.stringify(arr).slice(0, 30)} ...`, () => {
        const json = JSON.stringify(arr);
        expect(extractFirstParagraphFromHead(json)).toBe(JSON.parse(json)[0]);
      });
    }
  });
});

describe('getArticleSortKey', () => {
  it('数値条文は数値昇順になるキーを返す（1 < 2 < 10）', () => {
    const k1 = getArticleSortKey('1');
    const k2 = getArticleSortKey('2');
    const k10 = getArticleSortKey('10');
    expect(k1).toBeLessThan(k2);
    expect(k2).toBeLessThan(k10);
    expect(k1).toBe(1);
    expect(k2).toBe(2);
    expect(k10).toBe(10);
  });

  it('枝番 1-2 は 1 と 2 の間に入る', () => {
    const k1 = getArticleSortKey('1');
    const branch = getArticleSortKey('1-2');
    const k2 = getArticleSortKey('2');
    expect(k1).toBeLessThan(branch);
    expect(branch).toBeLessThan(k2);
  });

  it('附則 suppl-1・改正 amend-1 は通常条文より大きいキー（末尾側）', () => {
    const normal = getArticleSortKey('999');
    const suppl = getArticleSortKey('suppl-1');
    const amend = getArticleSortKey('amend-1');
    expect(suppl).toBeGreaterThan(normal);
    expect(amend).toBeGreaterThan(normal);
    // suppl は amend より前
    expect(suppl).toBeLessThan(amend);
    expect(suppl).toBe(100001);
    expect(amend).toBe(200001);
  });

  it('非数値・不正入力で NaN を返さない', () => {
    const k = getArticleSortKey('foo');
    expect(Number.isNaN(k)).toBe(false);
    expect(k).toBe(999999);
    expect(Number.isNaN(getArticleSortKey(''))).toBe(false);
  });
});

describe('getExcerpt', () => {
  it('maxLength（既定50）以下はそのまま返す', () => {
    expect(getExcerpt('短いテキスト')).toBe('短いテキスト');
  });

  it('maxLength を超過したら slice(0, max) + "..." を返す', () => {
    const text = 'a'.repeat(60);
    const result = getExcerpt(text);
    expect(result).toBe('a'.repeat(50) + '...');
    expect(result.length).toBe(53);
  });

  it('明示した maxLength を尊重する', () => {
    expect(getExcerpt('abcdefghij', 5)).toBe('abcde...');
  });

  it('HTML タグを除去する', () => {
    expect(getExcerpt('<p>本文</p>')).toBe('本文');
  });

  it('連続空白を単一スペースに正規化する', () => {
    expect(getExcerpt('a   b\t\nc')).toBe('a b c');
  });

  it('空文字入力は空文字を返す', () => {
    expect(getExcerpt('')).toBe('');
  });
});

describe('navExcerptFromHead', () => {
  it('12文字以内の先頭段落はそのまま返す', () => {
    const head = JSON.stringify(['短い条文']);
    expect(navExcerptFromHead(head)).toBe('短い条文');
  });

  it('ちょうど12文字の先頭段落は切らずにそのまま返す', () => {
    const text = 'あいうえおかきくけこさし'; // 12文字
    expect(text.length).toBe(12);
    expect(navExcerptFromHead(JSON.stringify([text]))).toBe(text);
  });

  it('12文字超は slice(0,12) + "..." に切る（13文字→末尾..., 長さ15）', () => {
    const text = 'あいうえおかきくけこさしす'; // 13文字
    expect(text.length).toBe(13);
    const result = navExcerptFromHead(JSON.stringify([text]));
    expect(result).toBe('あいうえおかきくけこさし' + '...');
    expect(result.endsWith('...')).toBe(true);
    expect(result.length).toBe(15);
  });

  it('明示した maxLength を尊重する（maxLength=5）', () => {
    const head = JSON.stringify(['abcdefgh']);
    expect(navExcerptFromHead(head, 5)).toBe('abcde...');
  });

  it('段落内の改行・タブ・連続空白は単一スペースに正規化してから切る', () => {
    const head = JSON.stringify(['あ\nい\tう  え']);
    expect(navExcerptFromHead(head)).toBe('あ い う え');
  });

  it('null / undefined / 空文字 / [] / [ ] / 非配列文字列はすべて空文字を返す', () => {
    expect(navExcerptFromHead(null)).toBe('');
    expect(navExcerptFromHead(undefined)).toBe('');
    expect(navExcerptFromHead('')).toBe('');
    expect(navExcerptFromHead('[]')).toBe('');
    expect(navExcerptFromHead('[ ]')).toBe('');
    expect(navExcerptFromHead('foo')).toBe('');
  });

  it('substr で切断された断片（閉じ " に届かない長い head）でも例外なく抜粋を返す', () => {
    const full = JSON.stringify([
      'とても長い第一段落のテキストがここに続いていきます、まだまだ終わりません',
    ]);
    const head = full.slice(0, 20); // 閉じ引用まで到達しない長さで切る
    let result: string;
    expect(() => {
      result = navExcerptFromHead(head);
    }).not.toThrow();
    result = navExcerptFromHead(head);
    expect(result).toBe('とても長い第一段落のテキ...');
    expect(result.length).toBe(15);
    // 切断していない完全版と接頭辞関係になっている
    const complete = extractFirstParagraphFromHead(full).replace(/\s+/g, ' ').trim();
    expect(complete.startsWith(result.slice(0, 12))).toBe(true);
  });
});

describe('formatArticleNumber', () => {
  it('数値（number型）は 第N条', () => {
    expect(formatArticleNumber(5)).toBe('第5条');
  });

  it('通常番号（string）は 第N条', () => {
    expect(formatArticleNumber('1')).toBe('第1条');
  });

  it('枝番は 第N条のM', () => {
    expect(formatArticleNumber('1-2')).toBe('第1条の2');
  });

  it('附則は 附則第N条', () => {
    expect(formatArticleNumber('suppl-1')).toBe('附則第1条');
  });

  it('改正は 修正第N条', () => {
    expect(formatArticleNumber('amend-1')).toBe('修正第1条');
  });
});
