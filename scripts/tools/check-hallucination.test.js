import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import yaml from 'js-yaml';
import { getArticles, NON_ARTICLE_YAML_FILES } from './check-hallucination.js';

// getArticles() は law_metadata.yaml / chapters.yaml / famous_articles.yaml を
// 条文としてカウントしてしまうバグ（Issue #70）の再発防止テスト。
// 実データ（src/data/laws/**）には依存させず、使い捨ての一時ディレクトリに
// フィクスチャYAMLを作って検証する。

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'osaka-kenpo-getarticles-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** フィクスチャの条文/メタデータYAMLを書き出す */
function writeYaml(fileName, data) {
  fs.writeFileSync(path.join(tmpDir, fileName), yaml.dump(data), 'utf8');
}

/** 加工なしの生テキストを書き出す（不正YAML・非YAML拡張子の検証用） */
function writeRaw(fileName, content) {
  fs.writeFileSync(path.join(tmpDir, fileName), content, 'utf8');
}

describe('getArticles', () => {
  describe('正常系', () => {
    it('通常条文のみのディレクトリでは全件が返り、file/articleNumberが正しい', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '第一条の本文' });
      writeYaml('2.yaml', { articleNumber: '2', text: '第二条の本文' });
      writeYaml('3.yaml', { articleNumber: '3', text: '第三条の本文' });

      const articles = getArticles(tmpDir);

      expect(articles).toHaveLength(3);
      expect(articles.map((a) => a.file)).toEqual(['1.yaml', '2.yaml', '3.yaml']);
      expect(articles.map((a) => a.articleNumber)).toEqual(['1', '2', '3']);
    });
  });

  describe('メタデータYAMLの除外（過去の事故パターン回帰防止）', () => {
    it('law_metadata.yaml が条文としてカウントされない（本バグの直接再現テスト）', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文' });
      writeYaml('law_metadata.yaml', { title: 'テスト法', articleCount: 1 });

      const articles = getArticles(tmpDir);

      expect(articles).toHaveLength(1);
      expect(articles.some((a) => a.file === 'law_metadata.yaml')).toBe(false);
    });

    it('chapters.yaml が条文としてカウントされない', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文' });
      writeYaml('chapters.yaml', { chapters: [{ title: '第一章' }] });

      const articles = getArticles(tmpDir);

      expect(articles).toHaveLength(1);
      expect(articles.some((a) => a.file === 'chapters.yaml')).toBe(false);
    });

    it('famous_articles.yaml が条文としてカウントされない', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文' });
      writeYaml('famous_articles.yaml', { famous: ['1'] });

      const articles = getArticles(tmpDir);

      expect(articles).toHaveLength(1);
      expect(articles.some((a) => a.file === 'famous_articles.yaml')).toBe(false);
    });

    it('枝番条文ファイル（132-2.yaml, 18-2.yaml等）が誤って除外されない', () => {
      writeYaml('132-2.yaml', { articleNumber: '132-2', text: '枝番条文132-2' });
      writeYaml('18-2.yaml', { articleNumber: '18-2', text: '枝番条文18-2' });

      const articles = getArticles(tmpDir);

      expect(articles.map((a) => a.file).sort()).toEqual(['132-2.yaml', '18-2.yaml']);
    });

    it('suppl-19.yaml のような補則条文ファイル名は除外リストと部分一致せず除外されない', () => {
      writeYaml('suppl-19.yaml', { articleNumber: 'suppl-19', text: '附則条文' });

      const articles = getArticles(tmpDir);

      expect(articles.map((a) => a.file)).toContain('suppl-19.yaml');
    });
  });

  describe('同値分割', () => {
    it('.yaml で終わらないファイルは無条件除外される（.yml/.json/.md/拡張子なし）', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文' });
      writeRaw('2.yml', 'articleNumber: "2"\ntext: 本文2\n');
      writeRaw('3.json', '{"articleNumber":"3"}');
      writeRaw('4.md', '# note');
      writeRaw('README', 'no extension');

      const articles = getArticles(tmpDir);

      expect(articles).toHaveLength(1);
      expect(articles[0].file).toBe('1.yaml');
    });

    it('除外リストに載っていない.yamlは通常どおり条文として処理される', () => {
      writeYaml('unusual_name.yaml', { articleNumber: '99', text: '本文' });

      const articles = getArticles(tmpDir);

      expect(articles).toHaveLength(1);
      expect(articles[0].file).toBe('unusual_name.yaml');
    });
  });

  describe('境界値（完全一致マッチの仕様固定）', () => {
    it('大文字小文字違い（LAW_METADATA.yaml）は除外されない', () => {
      writeYaml('LAW_METADATA.yaml', { articleNumber: 'x', text: '本文' });

      const articles = getArticles(tmpDir);

      expect(articles.map((a) => a.file)).toContain('LAW_METADATA.yaml');
    });

    it('類似だが異なるファイル名（law_metadata2.yaml, law_metadata_backup.yaml）は除外されない', () => {
      writeYaml('law_metadata2.yaml', { articleNumber: 'a', text: '本文' });
      writeYaml('law_metadata_backup.yaml', { articleNumber: 'b', text: '本文' });

      const articles = getArticles(tmpDir);

      expect(articles.map((a) => a.file).sort()).toEqual([
        'law_metadata2.yaml',
        'law_metadata_backup.yaml',
      ]);
    });
  });

  describe('null/空文字/未設定', () => {
    it('除外対象3ファイルのみ存在するディレクトリは空配列を返す', () => {
      writeYaml('law_metadata.yaml', { title: 'テスト法' });
      writeYaml('chapters.yaml', { chapters: [] });
      writeYaml('famous_articles.yaml', { famous: [] });

      const articles = getArticles(tmpDir);

      expect(articles).toEqual([]);
    });

    it('除外対象ファイルの中身が不正YAMLでもエラーにならない（除外はファイル名ベースで内容を読む前に効く）', () => {
      // js-yaml.load() に渡すと実際に例外を投げる壊れたYAML
      writeRaw('law_metadata.yaml', '{{{ invalid yaml [[[');
      writeRaw('chapters.yaml', ': : : broken yaml ::: [');
      writeRaw('famous_articles.yaml', '[unclosed');
      writeYaml('1.yaml', { articleNumber: '1', text: '本文' });

      let articles;
      expect(() => {
        articles = getArticles(tmpDir);
      }).not.toThrow();
      expect(articles.map((a) => a.file)).toEqual(['1.yaml']);
    });
  });

  describe('条件分岐の組み合わせ', () => {
    it('除外対象3ファイルすべてが条文と混在しても条文のみ返る', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文1' });
      writeYaml('2.yaml', { articleNumber: '2', text: '本文2' });
      writeYaml('law_metadata.yaml', { title: 'テスト法' });
      writeYaml('chapters.yaml', { chapters: [] });
      writeYaml('famous_articles.yaml', { famous: [] });

      const articles = getArticles(tmpDir);

      expect(articles.map((a) => a.file).sort()).toEqual(['1.yaml', '2.yaml']);
    });

    it('除外対象ファイルが1〜2個だけ存在する部分ケースでも正しく除外される', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文1' });
      writeYaml('law_metadata.yaml', { title: 'テスト法' });
      writeYaml('chapters.yaml', { chapters: [] });
      // famous_articles.yaml は存在しない

      const articles = getArticles(tmpDir);

      expect(articles.map((a) => a.file)).toEqual(['1.yaml']);
    });

    it('除外対象ファイルが1件も存在しないディレクトリでは全.yamlが条文として処理される', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文1' });
      writeYaml('2.yaml', { articleNumber: '2', text: '本文2' });

      const articles = getArticles(tmpDir);

      expect(articles).toHaveLength(2);
    });

    it('除外ファイルと deleted: true 条文が同一ディレクトリに混在しても互いに影響しない', () => {
      writeYaml('1.yaml', { articleNumber: '1', text: '本文1' });
      writeYaml('2.yaml', { articleNumber: '2', text: '削除済み条文', deleted: true });
      writeYaml('law_metadata.yaml', { title: 'テスト法' });

      const articles = getArticles(tmpDir);

      expect(articles.map((a) => a.file)).toEqual(['1.yaml']);
    });
  });

  describe('console error/ログ汚染', () => {
    it('除外対象ファイルは中身が壊れていても console.error を発生させない', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        writeRaw('law_metadata.yaml', '{{{ invalid yaml [[[');
        writeYaml('1.yaml', { articleNumber: '1', text: '本文' });

        getArticles(tmpDir);

        expect(errorSpy).not.toHaveBeenCalled();
      } finally {
        errorSpy.mockRestore();
      }
    });
  });
});

describe('NON_ARTICLE_YAML_FILES', () => {
  it('除外対象は law_metadata.yaml / chapters.yaml / famous_articles.yaml の3つ', () => {
    expect(NON_ARTICLE_YAML_FILES).toEqual([
      'law_metadata.yaml',
      'chapters.yaml',
      'famous_articles.yaml',
    ]);
  });
});
