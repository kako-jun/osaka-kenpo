#!/usr/bin/env python3
"""
刑法のcommentaryOsakaから定型的な追加文を削除するスクリプト
"""

import os
import re
import yaml
from pathlib import Path

# 削除する定型文のパターン
TEMPLATE_PHRASES = [
    "この条文は、社会のルールを守るために大事なもんやねん。一人一人が気をつけることで、みんなが幸せに暮らせるんやで。",
    "法律っちゅうのは、みんなが安心して暮らせるための約束事やねん。難しそうに見えるけど、要は「人に迷惑かけたらあかん」ってことやな。",
    "法律の本質っちゅうのは、「他人の権利を尊重する」ことやねん。自分がされて嫌なことは人にもしたらあかんっちゅうことやな。",
    "日常生活でも、法律のルールは身近にあるんやで。知らんかったでは済まされへんから、しっかり理解しとかなあかんねん。",
    "法律は難しそうやけど、結局は「人として当たり前のこと」を守るための決まりなんやな。ルールを守ることで、みんなが安心して暮らせるんやで。",
    "条文の言葉は難しいけど、要するに「相手を尊重して、ルールを守ろうな」ってことやねん。それができたら、社会は平和やで。",
    "法律の背景には、「みんなが幸せに暮らせるように」っちゅう思いがあるんやな。堅苦しいようで、実は優しい仕組みなんやで。",
]

def remove_template_phrases(text):
    """定型文を削除"""
    for phrase in TEMPLATE_PHRASES:
        # 前後の空白を含めて削除
        text = text.replace("  " + phrase, "")
        text = text.replace("\n" + phrase, "")
        text = text.replace(phrase, "")

    return text.strip()

def process_yaml_file(file_path):
    """YAMLファイルを読み込み、定型文を削除して保存"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        if not data:
            return False

        modified = False

        # commentaryOsakaの定型文削除
        if 'commentaryOsaka' in data and data['commentaryOsaka']:
            original_commentary = data['commentaryOsaka']
            new_commentary = []

            for para in original_commentary:
                cleaned = remove_template_phrases(para)
                if cleaned:  # 空でない場合のみ追加
                    new_commentary.append(cleaned)

            # 変更があった場合
            if new_commentary != original_commentary:
                data['commentaryOsaka'] = new_commentary
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

    print(f"Checking {len(yaml_files)} article files for template phrases...")

    modified = 0
    for yaml_file in yaml_files:
        if process_yaml_file(yaml_file):
            modified += 1

    print(f"\n{'='*60}")
    print(f"Completed!")
    print(f"{'='*60}")
    print(f"Modified {modified} files (removed template phrases)")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
