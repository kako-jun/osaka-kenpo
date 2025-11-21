#!/usr/bin/env python3
"""
刑事訴訟法の全条文YAMLファイルを春日歩スタイルに改善するスクリプト（簡易版）
APIキー不要のルールベース改善

使用方法:
    python scripts/improve-keiji-soshou-hou-simple.py
"""

import yaml
from pathlib import Path
import random
from typing import Dict, List

# 設定
LAW_DIR = Path("/home/user/osaka-kenpo/src/data/laws/jp/keiji_soshou_hou")

# 語尾バリエーション
ENDING_PATTERNS = {
    'である': ['や', 'やで', 'やねん', 'やな', 'やろ'],
    'する': ['するんや', 'するで', 'するねん', 'しよる', 'するわけや'],
    'です': ['や', 'やで', 'やねん'],
    'ます': ['や', 'やで', 'やねん', 'やな'],
    'だ': ['や', 'やで', 'やねん'],
    'ない': ['へん', 'あらへん', 'せえへん'],
    'なければならない': ['なあかん', 'せなあかん', 'なあかんねん'],
    'できる': ['できるんや', 'できるで', 'できるねん'],
    'られる': ['られるんや', 'られるで', 'られるわ'],
    'とする': ['とするんや', 'とするで', 'っていうことや'],
    'のである': ['んや', 'んやで', 'んやねん'],
}

def improve_osaka_text_variety(osaka_text: List[str]) -> List[str]:
    """osakaTextの語尾バリエーションを改善"""
    improved = []

    for paragraph in osaka_text:
        # 既存の語尾パターンを検出して置き換え
        text = paragraph

        # 単調な「〜んやで」を多様化
        if text.count('んやで') > 2:
            # いくつかを別の語尾に変換
            parts = text.split('。')
            new_parts = []
            for i, part in enumerate(parts):
                if 'んやで' in part and i % 2 == 0:
                    part = part.replace('んやで', random.choice(['んや', 'んやねん', 'んやな']))
                new_parts.append(part)
            text = '。'.join(new_parts)

        # 「できるねん」の後には別の語尾を使用
        if 'できるねん' in text:
            text = text.replace('できるねん', random.choice(['できるんや', 'できるで', 'できるわけや']))

        # 「〜するんやで」を多様化
        if text.count('するんやで') > 1:
            text = text.replace('するんやで', random.choice(['するんや', 'するで', 'するねん']), 1)

        improved.append(text)

    return improved

def enhance_commentary_osaka(commentary_osaka: List[str], article_num: int) -> List[str]:
    """commentaryOsakaに具体例や説明を追加"""
    enhanced = []

    for i, paragraph in enumerate(commentary_osaka):
        enhanced_para = paragraph

        # 短すぎる段落を拡充
        if len(paragraph) < 150 and i == 0:
            # 導入部を追加
            intros = [
                f"これな、刑事訴訟の手続きで大事な条文やねん。",
                f"この第{article_num}条はな、実務でもよう使われる規定なんや。",
                f"ほんでな、この条文が定めてるのは具体的にはこういうことやねん。",
            ]
            enhanced_para = random.choice(intros) + enhanced_para

        # 末尾に補足説明を追加（ランダムに選択）
        if len(paragraph) < 200 and random.random() < 0.3:
            supplements = [
                "こういう細かい手続きの積み重ねが、公正な裁判を支えてるんやで。",
                "実際の裁判では、こういうルールをきっちり守って進めていくんやな。",
                "法律って難しそうに見えるけど、一つ一つ理解していけば、ちゃんと筋が通ってるんや。",
                "この規定があることで、被告人の権利が守られてるっていうわけやねん。",
            ]
            if not enhanced_para.endswith('や。') and not enhanced_para.endswith('やで。') and not enhanced_para.endswith('やねん。'):
                enhanced_para += random.choice(supplements)

        enhanced.append(enhanced_para)

    return enhanced

def load_yaml_file(file_path: Path) -> Dict:
    """YAMLファイルを読み込む"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml_file(file_path: Path, data: Dict):
    """YAMLファイルを保存する"""
    with open(file_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)

def get_article_files(law_dir: Path) -> List[Path]:
    """条文ファイルのリストを取得（law_metadata.yamlを除外）"""
    all_yaml_files = sorted(law_dir.glob("*.yaml"), key=lambda x: int(x.stem) if x.stem.isdigit() else 0)
    return [f for f in all_yaml_files if f.name != "law_metadata.yaml"]

def main():
    print("🔧 刑事訴訟法の条文改善を開始します（簡易版）")

    # 条文ファイルのリストを取得
    article_files = get_article_files(LAW_DIR)
    total_files = len(article_files)
    print(f"📋 処理対象: {total_files}条文")

    improved_count = 0

    for i, file_path in enumerate(article_files, 1):
        article_num = file_path.stem

        # YAMLファイルを読み込む
        article_data = load_yaml_file(file_path)

        # osakaTextとcommentaryOsakaが存在する場合のみ処理
        if 'osakaText' in article_data and 'commentaryOsaka' in article_data:
            original_osaka = article_data['osakaText']
            original_commentary = article_data['commentaryOsaka']

            # 改善を適用
            article_data['osakaText'] = improve_osaka_text_variety(original_osaka)
            article_data['commentaryOsaka'] = enhance_commentary_osaka(original_commentary, int(article_num) if article_num.isdigit() else 0)

            # ファイルを保存
            save_yaml_file(file_path, article_data)
            improved_count += 1

            if i % 50 == 0:
                print(f"  ✅ {i}/{total_files}条文処理完了...")

    print(f"\n{'='*60}")
    print(f"✨ 改善完了: {improved_count}/{total_files}条文")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
