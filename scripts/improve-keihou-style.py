#!/usr/bin/env python3
"""
刑法の全条文YAMLファイルを春日歩スタイルに改善するスクリプト

改善内容：
1. osakaText: バリエーション豊かな語尾に変更
2. commentaryOsaka: 身近な例え話を追加、長さを拡充
"""

import os
import re
import yaml
import random
from pathlib import Path

# 語尾バリエーションのパターン
ENDING_PATTERNS = {
    # 基本セット
    'です': ['や', 'やで', 'やねん', 'やな'],
    'である': ['や', 'やで', 'やねん', 'やな'],
    'する': ['するんや', 'するで', 'するねん', 'しよる'],
    'します': ['するんや', 'するで', 'するねん'],
    'だ': ['や', 'やで', 'やねん'],

    # 義務・禁止セット
    'しなければならない': ['せなあかん', 'せなあかんねん', 'せなしゃあない'],
    'してはならない': ['したらあかん', 'したらあかんで', 'しちゃあかん'],
    'することができる': ['できるんや', 'できるで', 'できるねん'],

    # 推量セット
    'だろう': ['やろ', 'やろな', 'やろうな'],
    'でしょう': ['やろ', 'やろな', 'やろうな'],
}

# 語尾変換の基本ルール
def convert_ending(text, avoid_pattern=None):
    """テキストの語尾をバリエーション豊かな大阪弁に変換"""
    # 既に大阪弁語尾で終わっている場合
    osaka_endings = ['や', 'やで', 'やねん', 'やな', 'やろ', 'やし', 'やから',
                     'せなあかん', 'あかん', 'したらあかん', 'するんや', 'するで',
                     'しよる', 'せえへん', 'あらへん', 'へん', 'なあかん']

    # 語尾パターンを多様化
    patterns = [
        (r'する。$', ['するんや。', 'するで。', 'するねん。', 'しよる。']),
        (r'します。$', ['するんや。', 'するで。', 'するねん。']),
        (r'である。$', ['や。', 'やで。', 'やねん。', 'やな。']),
        (r'です。$', ['や。', 'やで。', 'やねん。', 'やな。']),
        (r'だ。$', ['や。', 'やで。', 'やねん。']),
        (r'しなければならない。$', ['せなあかん。', 'せなあかんねん。', 'なあかん。']),
        (r'してはならない。$', ['したらあかん。', 'したらあかんで。', 'しちゃあかん。']),
        (r'することができる。$', ['できるんや。', 'できるで。', 'できるねん。']),
        (r'される。$', ['されるんや。', 'されるで。', 'されるねん。']),
        (r'れる。$', ['れるんや。', 'れるで。', 'れるねん。']),
        (r'ある。$', ['あるんや。', 'あるで。', 'あるねん。']),
        (r'ない。$', ['あらへん。', 'ないで。', 'ないねん。']),
        (r'いる。$', ['おるんや。', 'おるで。', 'おるねん。']),
    ]

    for pattern, replacements in patterns:
        if re.search(pattern, text):
            # 避けるべきパターンを除外
            available = replacements
            if avoid_pattern:
                available = [r for r in replacements if avoid_pattern not in r]
            if available:
                return re.sub(pattern, random.choice(available), text)

    return text

def improve_osaka_text(original_lines):
    """osakaTextを改善（バリエーション豊かな語尾）"""
    if not original_lines:
        return []

    improved = []
    used_patterns = set()

    for line in original_lines:
        # 単純な語尾変換を避けるため、使用済みパターンを記録
        new_line = line
        attempts = 0
        while attempts < 10:
            new_line = convert_ending(line)
            ending = new_line[-6:] if len(new_line) >= 6 else new_line
            if ending not in used_patterns:
                used_patterns.add(ending)
                break
            attempts += 1

        improved.append(new_line)

    return improved

def improve_commentary_osaka(original_commentary, article_num, title):
    """commentaryOsakaを改善（身近な例え話を追加、長さを拡充）"""
    if not original_commentary:
        return []

    # 既存の解説を取得
    existing_text = '\n'.join(original_commentary) if isinstance(original_commentary, list) else original_commentary

    # 短すぎる場合は拡充
    if len(existing_text) < 200:
        # 例え話のテンプレート（刑法の文脈に合わせて）
        examples = [
            "例えばな、友達同士で喧嘩になったとしても、法律の一線を超えたらあかんねん。",
            "日常生活でも、ついカッとなることはあるやろけど、その時こそ冷静にならなあかんのやで。",
            "大阪の街中でも、いろんな人がおるから、ルールを守ることが大事やねん。",
            "ちょっとした出来心でも、法律に触れたら取り返しがつかんことになるんやで。",
            "人と人との関わりの中で、相手を尊重することが何よりも大切やねん。",
        ]

        # ランダムに例を追加
        additional = random.choice(examples)

        # 既存の解説を基に拡充
        improved = []
        for text in (original_commentary if isinstance(original_commentary, list) else [original_commentary]):
            improved.append(text)

        # 追加の解説を挿入
        improved.append(additional + "法律は難しそうに見えるけど、結局は「人として当たり前のこと」を守るための決まりなんやな。")

        return improved

    # 長さが十分な場合はそのまま（語尾のみ改善）
    improved = []
    for text in (original_commentary if isinstance(original_commentary, list) else [original_commentary]):
        improved.append(convert_ending(text))

    return improved

def process_yaml_file(file_path):
    """YAMLファイルを読み込み、改善して保存"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        if not data:
            return False

        # osakaTextを改善
        if 'osakaText' in data and data['osakaText']:
            data['osakaText'] = improve_osaka_text(data['osakaText'])

        # commentaryOsakaを改善
        if 'commentaryOsaka' in data and data['commentaryOsaka']:
            article = data.get('article', '')
            title = data.get('title', '')
            data['commentaryOsaka'] = improve_commentary_osaka(
                data['commentaryOsaka'],
                article,
                title
            )

        # YAMLファイルに書き戻し
        with open(file_path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

        return True

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """メイン処理"""
    keihou_dir = Path('/home/user/osaka-kenpo/src/data/laws/jp/keihou')

    # 条文番号のYAMLファイルのみを対象
    yaml_files = sorted([
        f for f in keihou_dir.glob('*.yaml')
        if f.name not in ['law_metadata.yaml'] and re.match(r'^\d+\.yaml$', f.name)
    ])

    print(f"Found {len(yaml_files)} article files to process")

    processed = 0
    for yaml_file in yaml_files:
        if process_yaml_file(yaml_file):
            processed += 1
            if processed % 10 == 0:
                print(f"Processed {processed}/{len(yaml_files)} files...")

    print(f"\nCompleted! Processed {processed} files")

if __name__ == '__main__':
    main()
