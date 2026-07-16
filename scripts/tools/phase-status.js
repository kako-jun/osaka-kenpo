#!/usr/bin/env node
/**
 * phase-status.js — 翻訳フェーズ診断ツール
 *
 * 各条文YAMLのフィールド有無から Phase 1-4 の進捗を集計する。
 *
 * フェーズ定義:
 *   Phase 1: originalText がある
 *   Phase 2: + commentary（標準日本語の解説）
 *   Phase 3: + osakaText（大阪弁訳）
 *   Phase 4: + commentaryOsaka（大阪弁解説）
 *
 * 使い方:
 *   node scripts/tools/phase-status.js              # 全法律のサマリ
 *   node scripts/tools/phase-status.js keihou       # 法律slugで指定（カテゴリ横断検索）
 *   node scripts/tools/phase-status.js jp/keihou    # category/law 形式でも可
 *
 * 集計ルール:
 *   - メタデータファイル（law_metadata.yaml, chapters.yaml, famous_articles.yaml 等）は除外
 *   - isDeleted: true の条文は「削除条文」として有効条文から除外
 *   - originalText が空の条文は未着手としてカウント外（有効条文に含めない）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const LAWS_DIR = path.join(ROOT, 'src', 'data', 'laws');
const CATEGORIES = ['jp', 'jp_hist', 'world', 'world_hist', 'treaty'];
const META = [
  'law_metadata.yaml',
  'law-metadata.yaml',
  'chapters.yaml',
  'famous-articles.yaml',
  'famous_articles.yaml',
];

function analyzeLaw(category, law) {
  const lawDir = path.join(LAWS_DIR, category, law);
  const files = fs.readdirSync(lawDir).filter((f) => f.endsWith('.yaml') && !META.includes(f));
  const stats = {
    category,
    law,
    active: 0,
    deleted: 0,
    empty: 0,
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
    remaining: { commentary: [], osakaText: [], commentaryOsaka: [] },
  };
  for (const f of files) {
    let d;
    try {
      d = yaml.load(fs.readFileSync(path.join(lawDir, f), 'utf8'));
    } catch (e) {
      console.error(`YAML parse error: ${category}/${law}/${f}: ${e.message}`);
      continue;
    }
    if (!d) continue;
    const id = f.replace(/\.yaml$/, '');
    if (d.isDeleted) {
      stats.deleted++;
      continue;
    }
    if (!(d.originalText || []).length) {
      stats.empty++;
      continue;
    }
    stats.active++;
    const hasC = (d.commentary || []).length > 0;
    const hasO = (d.osakaText || []).length > 0;
    const hasCO = (d.commentaryOsaka || []).length > 0;
    if (hasCO) stats.p4++;
    else if (hasO) stats.p3++;
    else if (hasC) stats.p2++;
    else stats.p1++;
    if (!hasC) stats.remaining.commentary.push(id);
    if (!hasO) stats.remaining.osakaText.push(id);
    if (!hasCO) stats.remaining.commentaryOsaka.push(id);
  }
  return stats;
}

function sortIds(ids) {
  return ids.slice().sort((a, b) => {
    const pa = a.split('-');
    const pb = b.split('-');
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const na = parseInt(pa[i], 10);
      const nb = parseInt(pb[i], 10);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      if (pa[i] !== pb[i]) return String(pa[i]).localeCompare(String(pb[i]));
    }
    return 0;
  });
}

function formatList(ids, limit = 40) {
  const sorted = sortIds(ids);
  const head = sorted.slice(0, limit).join(', ');
  return sorted.length > limit ? `${head} ...（他${sorted.length - limit}件）` : head;
}

function listLaws() {
  const all = [];
  for (const cat of CATEGORIES) {
    const catDir = path.join(LAWS_DIR, cat);
    if (!fs.existsSync(catDir)) continue;
    for (const law of fs.readdirSync(catDir)) {
      if (fs.statSync(path.join(catDir, law)).isDirectory()) {
        all.push([cat, law]);
      }
    }
  }
  return all;
}

function printLawDetail(stats) {
  const { category, law, active, deleted, empty, p1, p2, p3, p4 } = stats;
  console.log(`${category}/${law}`);
  console.log(
    `有効条文: ${active} / 削除条文: ${deleted} (除外)` +
      (empty ? ` / 原文なし: ${empty} (未着手)` : '')
  );
  console.log(`Phase 4: ${p4} / Phase 3: ${p3} / Phase 2: ${p2} / Phase 1: ${p1}`);
  if (active === p4) {
    console.log('→ 全フェーズ完了済み。');
    return;
  }
  if (p1 > 0) {
    console.log(
      `WARNING: Phase 1（commentary なし）の条文が ${p1} 条あります。先に /osaka-kenpo-add で commentary を追加してください。`
    );
  }
  console.log(`→ Phase 4 未完了: ${active - p4}条`);
  const r = stats.remaining;
  if (r.commentary.length)
    console.log(`  commentary 残り (${r.commentary.length}): ${formatList(r.commentary)}`);
  if (r.osakaText.length)
    console.log(`  osakaText 残り (${r.osakaText.length}): ${formatList(r.osakaText)}`);
  if (r.commentaryOsaka.length)
    console.log(
      `  commentaryOsaka 残り (${r.commentaryOsaka.length}): ${formatList(r.commentaryOsaka)}`
    );
}

function main() {
  const arg = process.argv[2] || null;
  const laws = listLaws();

  if (arg) {
    let target;
    if (arg.includes('/')) {
      const [cat, law] = arg.split('/');
      target = laws.find(([c, l]) => c === cat && l === law);
    } else {
      const matches = laws.filter(([, l]) => l === arg);
      if (matches.length > 1) {
        console.error(
          `slug "${arg}" が複数カテゴリに存在します: ${matches.map(([c, l]) => `${c}/${l}`).join(', ')}`
        );
        process.exit(1);
      }
      target = matches[0];
    }
    if (!target) {
      console.error(`法律が見つかりません: ${arg}`);
      console.error('例: node scripts/tools/phase-status.js keihou / jp/keihou');
      process.exit(1);
    }
    printLawDetail(analyzeLaw(target[0], target[1]));
    return;
  }

  // サマリ（全法律）
  let tActive = 0;
  let tP4 = 0;
  console.log('category/law: 有効条文(削除) | P4 P3 P2 P1');
  console.log('---');
  for (const [cat, law] of laws) {
    const s = analyzeLaw(cat, law);
    tActive += s.active;
    tP4 += s.p4;
    const done = s.active > 0 && s.active === s.p4 ? ' [完了]' : '';
    console.log(
      `${cat}/${law}: ${s.active}条(${s.deleted}) | P4:${s.p4} P3:${s.p3} P2:${s.p2} P1:${s.p1}${done}`
    );
  }
  console.log('---');
  const pct = tActive ? ((tP4 / tActive) * 100).toFixed(1) : '0.0';
  console.log(`合計: 有効 ${tActive}条 / Phase 4 完了 ${tP4}条 (${pct}%)`);
}

main();
