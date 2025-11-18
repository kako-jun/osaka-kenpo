#!/usr/bin/env python3
"""
刑法のcommentaryOsakaから重複する例え話を削除し、さらに洗練するスクリプト
"""

import os
import re
import yaml
from pathlib import Path

def remove_duplicate_paragraphs(paragraphs):
    """重複する段落を削除"""
    if not paragraphs or len(paragraphs) <= 1:
        return paragraphs

    # 各段落を正規化（空白を削除）して比較
    seen = set()
    unique_paragraphs = []

    for para in paragraphs:
        # 正規化（空白・改行を削除）
        normalized = re.sub(r'\s+', '', para)

        # 既に見た段落は除く
        if normalized not in seen:
            seen.add(normalized)
            unique_paragraphs.append(para)

    return unique_paragraphs

def refine_commentary(paragraphs):
    """commentaryOsakaを洗練"""
    if not paragraphs:
        return []

    # 重複削除
    refined = remove_duplicate_paragraphs(paragraphs)

    # 段落の整形（余分な空白を削除）
    refined = [para.strip() for para in refined if para.strip()]

    return refined

def process_yaml_file(file_path):
    """YAMLファイルを読み込み、重複を削除して保存"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        if not data:
            return False

        modified = False

        # commentaryOsakaの重複削除
        if 'commentaryOsaka' in data and data['commentaryOsaka']:
            original_len = len(data['commentaryOsaka'])
            data['commentaryOsaka'] = refine_commentary(data['commentaryOsaka'])
            new_len = len(data['commentaryOsaka'])

            if original_len != new_len:
                modified = True

        # 修正があった場合のみ保存
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
            return True

        return False

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
    ], key=lambda x: int(x.stem))

    print(f"Checking {len(yaml_files)} article files for duplicates...")

    modified = 0
    for yaml_file in yaml_files:
        if process_yaml_file(yaml_file):
            modified += 1

    print(f"\n{'='*60}")
    print(f"Completed!")
    print(f"{'='*60}")
    print(f"Modified {modified} files (removed duplicates)")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
