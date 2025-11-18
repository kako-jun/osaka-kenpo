#!/usr/bin/env python3
"""
刑事訴訟法の全条文YAMLファイルを春日歩スタイルに改善するスクリプト

使用方法:
    export ANTHROPIC_API_KEY="your-api-key"
    python scripts/improve-keiji-soshou-hou.py
"""

import os
import sys
import yaml
import anthropic
from pathlib import Path
import time
from typing import Dict, List

# 設定
LAW_DIR = Path("/home/user/osaka-kenpo/src/data/laws/jp/keiji_soshou_hou")
STYLE_GUIDE_PATH = Path("/home/user/osaka-kenpo/.claude/translation-style-guide.md")
BATCH_SIZE = 5  # 一度に処理する条文数
DELAY_BETWEEN_BATCHES = 2  # バッチ間の待機時間（秒）

def load_style_guide() -> str:
    """翻訳スタイルガイドを読み込む"""
    with open(STYLE_GUIDE_PATH, 'r', encoding='utf-8') as f:
        return f.read()

def load_yaml_file(file_path: Path) -> Dict:
    """YAMLファイルを読み込む"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml_file(file_path: Path, data: Dict):
    """YAMLファイルを保存する"""
    with open(file_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)

def create_improvement_prompt(article_data: Dict, style_guide: str) -> str:
    """改善プロンプトを作成"""
    original_text = "\n".join(article_data.get('originalText', []))
    commentary = "\n".join(article_data.get('commentary', []))
    current_osaka_text = "\n".join(article_data.get('osakaText', []))
    current_commentary_osaka = "\n".join(article_data.get('commentaryOsaka', []))

    prompt = f"""以下の刑事訴訟法第{article_data['article']}条の大阪弁訳と解説を、春日歩スタイルに改善してください。

## 翻訳スタイルガイド（抜粋）

{style_guide}

## 現在の条文データ

### 原文（originalText）
{original_text}

### 原文の解説（commentary）
{commentary}

### 現在の大阪弁訳（osakaText）
{current_osaka_text}

### 現在の大阪弁解説（commentaryOsaka）
{current_commentary_osaka}

## 改善方針

### 1. osakaText（原文の大阪弁訳）の改善
- 問題: 単純な語尾変換のみ（「〜するんや」「〜やで」程度）
- 修正: バリエーション豊かな語尾を使用
  - 基本セット: 「〜や」「〜やで」「〜やねん」「〜やな」
  - 感情セット: 「〜やろ」「〜やし」「〜やから」
  - 義務セット: 「〜せなあかん」「〜なあかん」
- 注意: 原文の意味は絶対に変更しない、語尾と語彙のみ変換

### 2. commentaryOsaka（大阪弁での解説）の改善
- 問題: 日本語の解説をただ大阪弁に訳しただけ、身近な例え話が不足、短すぎる
- 修正:
  - 春日歩のキャラクター（優しく包容力がある教育者、天然な視点で本質を突く）を意識
  - 具体的な身近な例え話を追加（長さ: 最低3-4文、できれば5-6文程度）
  - 例: 「例えばな、警察に捕まった時に...」「裁判の仕組みっていうのは...」など
  - 手続法なので、分かりやすく丁寧に説明

## 出力形式

以下のYAML形式で出力してください。originalTextとcommentaryは変更しないでください。

```yaml
osakaText:
  - [改善された大阪弁訳の段落1]
  - [改善された大阪弁訳の段落2（もしあれば）]
commentaryOsaka:
  - [改善された大阪弁解説の段落1]
  - [改善された大阪弁解説の段落2]
  - [改善された大阪弁解説の段落3（もしあれば）]
```

YAMLコードブロックのみを出力し、説明は不要です。
"""
    return prompt

def improve_article_with_claude(client: anthropic.Anthropic, article_data: Dict, style_guide: str) -> Dict:
    """Claude APIを使用して条文を改善"""
    prompt = create_improvement_prompt(article_data, style_guide)

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=4000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # レスポンスからYAMLを抽出
        response_text = message.content[0].text

        # YAMLコードブロックを抽出
        if "```yaml" in response_text:
            yaml_start = response_text.find("```yaml") + 7
            yaml_end = response_text.find("```", yaml_start)
            yaml_text = response_text[yaml_start:yaml_end].strip()
        elif "```" in response_text:
            yaml_start = response_text.find("```") + 3
            yaml_end = response_text.find("```", yaml_start)
            yaml_text = response_text[yaml_start:yaml_end].strip()
        else:
            yaml_text = response_text.strip()

        # YAMLをパース
        improved_data = yaml.safe_load(yaml_text)

        # 元のデータを更新
        result = article_data.copy()
        if 'osakaText' in improved_data:
            result['osakaText'] = improved_data['osakaText']
        if 'commentaryOsaka' in improved_data:
            result['commentaryOsaka'] = improved_data['commentaryOsaka']

        return result

    except Exception as e:
        print(f"  ⚠️ エラー: {e}")
        return article_data  # エラーの場合は元のデータを返す

def get_article_files(law_dir: Path) -> List[Path]:
    """条文ファイルのリストを取得（law_metadata.yamlを除外）"""
    all_yaml_files = sorted(law_dir.glob("*.yaml"))
    return [f for f in all_yaml_files if f.name != "law_metadata.yaml"]

def main():
    # APIキーの確認
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ エラー: ANTHROPIC_API_KEY環境変数が設定されていません")
        print("使用方法: export ANTHROPIC_API_KEY='your-api-key'")
        sys.exit(1)

    # Claudeクライアントを初期化
    client = anthropic.Anthropic(api_key=api_key)

    # スタイルガイドを読み込む
    print("📖 翻訳スタイルガイドを読み込み中...")
    style_guide = load_style_guide()

    # 条文ファイルのリストを取得
    article_files = get_article_files(LAW_DIR)
    total_files = len(article_files)
    print(f"📋 処理対象: {total_files}条文")

    # バッチ処理
    improved_count = 0
    error_count = 0

    for i in range(0, total_files, BATCH_SIZE):
        batch_files = article_files[i:i+BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total_files + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"\n📦 バッチ {batch_num}/{total_batches} 処理中...")

        for file_path in batch_files:
            article_num = file_path.stem
            print(f"  🔄 第{article_num}条を処理中...", end=" ")

            # YAMLファイルを読み込む
            article_data = load_yaml_file(file_path)

            # Claudeで改善
            improved_data = improve_article_with_claude(client, article_data, style_guide)

            # 改善されたデータを保存
            if improved_data != article_data:
                save_yaml_file(file_path, improved_data)
                improved_count += 1
                print("✅ 完了")
            else:
                error_count += 1
                print("⚠️ スキップ")

        # バッチ間で待機（API制限対策）
        if i + BATCH_SIZE < total_files:
            print(f"  ⏳ {DELAY_BETWEEN_BATCHES}秒待機中...")
            time.sleep(DELAY_BETWEEN_BATCHES)

    # 結果を表示
    print(f"\n{'='*60}")
    print(f"✨ 処理完了")
    print(f"  - 改善された条文: {improved_count}/{total_files}")
    print(f"  - エラー/スキップ: {error_count}/{total_files}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
