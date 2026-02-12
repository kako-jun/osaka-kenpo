#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
会社法第601-750条の品質チェックスクリプト
"""

import yaml
import json
import os
import re
from pathlib import Path

# チェック対象のディレクトリ
LAW_DIR = Path("src/data/laws/jp/kaisya_hou")

# 問題を格納するリスト
issues = []

# 商人表現のパターン（法律用語は除外）
MERCHANT_PATTERNS = [
    r"(?<!時効の)(?<!利益相反)(?<!現存)利益(?!相反)",  # 時効の利益、利益相反、現存利益を除く
    r"投資",
    r"儲け",
    r"商売(?!人)",  # 商売人は除外
    r"ビジネス",
    r"取引(?!の安全|所)",  # 取引の安全、取引所は除外
]

# 男性表現のパターン
MALE_PATTERNS = [
    r"わい(?![らん])",  # わいら、わいんは後で別途チェック
    r"わいら",
    r"おんどれ",
    r"わし",
]


def read_yaml(filepath):
    """YAMLファイルを読み込む"""
    with open(filepath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def check_male_expression(text, article, location):
    """男性表現をチェック"""
    if not text:
        return

    for pattern in MALE_PATTERNS:
        matches = re.finditer(pattern, text)
        for match in matches:
            issues.append(
                {
                    "article": str(article),
                    "severity": "high",
                    "category": "persona",
                    "description": f"男性表現「{match.group()}」が使用されています。春日歩先生は女性なので、一人称は使わないか「わたし」のみを使用してください。",
                    "location": location,
                    "suggestion": "男性表現を削除してください。",
                }
            )


def check_merchant_expression(text, article, location):
    """商人表現をチェック"""
    if not text:
        return

    for pattern in MERCHANT_PATTERNS:
        matches = re.finditer(pattern, text)
        for match in matches:
            word = match.group()
            # コンテキストを確認（法律用語かどうか）
            context = text[max(0, match.start() - 10) : match.end() + 10]

            # 法律用語の場合はスキップ
            if (
                "時効の利益" in context
                or "利益相反" in context
                or "現存利益" in context
            ):
                continue
            if "取引の安全" in context or "取引所" in context:
                continue

            issues.append(
                {
                    "article": str(article),
                    "severity": "medium",
                    "category": "persona",
                    "description": f"商人表現「{word}」が使用されています。教育者らしい表現に置き換えてください。",
                    "location": location,
                    "suggestion": f"「{word}」を適切な表現に置き換えてください。例：投資→力を注ぐ、利益→メリット・良いこと",
                }
            )


def check_hallucination(commentary, article):
    """ハルシネーションをチェック（疑わしい表現）"""
    if not commentary:
        return

    # 過度な一般化
    general_patterns = [
        (r"よくある", "「よくある」という根拠のない一般化"),
        (r"一般的に", "「一般的に」という根拠のない断定"),
        (r"絶対(?!に[^必])", "「絶対」という強すぎる表現"),  # 「絶対に必要」などは許可
        (r"必ず(?!しも)", "「必ず」という強すぎる表現"),  # 「必ずしも」は許可
    ]

    for pattern, desc in general_patterns:
        matches = re.finditer(pattern, commentary)
        for match in matches:
            issues.append(
                {
                    "article": str(article),
                    "severity": "high",
                    "category": "hallucination",
                    "description": f"{desc}が使用されています。",
                    "location": "commentaryOsaka",
                    "suggestion": "より控えめで具体的な表現に修正してください。",
                }
            )


def check_article_number_confusion(commentary, article):
    """条文番号の取り違えをチェック（枝番条文に特に注意）"""
    if not commentary:
        return

    # 枝番条文かどうかチェック
    if "-" in str(article):
        base_num = article.split("-")[0]
        branch_num = article.split("-")[1]

        # 枝番条文なのに「第XXX条」とだけ記載されている場合
        pattern = f"第{base_num}条"
        if re.search(pattern, commentary):
            # より詳細なチェック：「第XXX-Y条」という正しい形式があるか
            correct_pattern = f"第{base_num}-{branch_num}条"
            if not re.search(correct_pattern, commentary):
                issues.append(
                    {
                        "article": article,
                        "severity": "critical",
                        "category": "legal_accuracy",
                        "description": f"枝番条文（第{article}条）の解説で「{pattern}」とだけ記載されている可能性があります。枝番を含めて「第{article}条」と記載すべきです。",
                        "location": "commentaryOsaka",
                        "suggestion": f"「{pattern}」を「第{article}条」に修正してください。",
                    }
                )


def check_length(commentary, article):
    """解説の長さをチェック"""
    if not commentary:
        return

    # commentaryOsakaを結合
    full_text = "\n".join(commentary) if isinstance(commentary, list) else commentary

    if len(full_text) < 300:
        issues.append(
            {
                "article": str(article),
                "severity": "medium",
                "category": "consistency",
                "description": f"解説が短すぎます（{len(full_text)}文字）。300文字以上の詳細な解説が推奨されます。",
                "location": "commentaryOsaka",
                "suggestion": "具体例や背景説明を追加して、より詳細な解説にしてください。",
            }
        )


def check_character_names(commentary, article):
    """登場人物名をチェック"""
    if not commentary:
        return

    full_text = "\n".join(commentary) if isinstance(commentary, list) else commentary

    bad_names = ["HHH", "XXX", "甲", "乙", "丙"]
    for name in bad_names:
        if name in full_text:
            issues.append(
                {
                    "article": str(article),
                    "severity": "medium",
                    "category": "example",
                    "description": f"不適切な登場人物名「{name}」が使用されています。",
                    "location": "commentaryOsaka",
                    "suggestion": "「太郎さん」「花子さん」「A社」「B銀行」などの分かりやすい名前に変更してください。",
                }
            )


def check_generic_commentary(commentary, article):
    """テンプレート的な汎用解説をチェック"""
    if not commentary:
        return

    # commentaryを結合
    full_text = "\n".join(commentary) if isinstance(commentary, list) else commentary

    # 汎用的すぎる表現
    generic_phrases = [
        "この条文は、会社法上の重要な事項について定めた規定です",
        "本条の目的は、会社の運営における法秩序を確保し",
        "実務上、この規定は株式会社の設立・運営・組織変更等の重要な場面で適用されます",
    ]

    for phrase in generic_phrases:
        if phrase in full_text:
            issues.append(
                {
                    "article": str(article),
                    "severity": "medium",
                    "category": "consistency",
                    "description": f"汎用的すぎる表現「{phrase}...」が含まれています。この条文に特化した具体的な解説が必要です。",
                    "location": "commentary",
                    "suggestion": "この条文の内容に即した、より具体的な解説に書き換えてください。",
                }
            )


def main():
    """メイン処理"""
    print("会社法第601-750条の品質チェックを開始します...")

    # 対象条文のリストを作成
    articles = []
    for i in range(601, 751):
        yaml_file = LAW_DIR / f"{i}.yaml"
        if yaml_file.exists():
            articles.append(str(i))

    # 枝番条文も追加
    branch_articles = [
        "695-2",
        "714-2",
        "714-3",
        "714-4",
        "714-5",
        "714-6",
        "714-7",
        "735-2",
    ]
    for art in branch_articles:
        yaml_file = LAW_DIR / f"{art}.yaml"
        if yaml_file.exists():
            articles.append(art)

    articles.sort(
        key=lambda x: (int(x.split("-")[0]), int(x.split("-")[1]) if "-" in x else 0)
    )

    print(f"対象条文数: {len(articles)}条")

    # 各条文をチェック
    for article in articles:
        yaml_file = LAW_DIR / f"{article}.yaml"

        try:
            data = read_yaml(yaml_file)

            # commentaryOsakaを取得
            commentary_osaka = data.get("commentaryOsaka", [])
            commentary = data.get("commentary", [])

            if isinstance(commentary_osaka, list):
                commentary_osaka_text = "\n".join(commentary_osaka)
            else:
                commentary_osaka_text = commentary_osaka or ""

            if isinstance(commentary, list):
                commentary_text = "\n".join(commentary)
            else:
                commentary_text = commentary or ""

            # 各種チェックを実行
            check_male_expression(commentary_osaka_text, article, "commentaryOsaka")
            check_merchant_expression(commentary_osaka_text, article, "commentaryOsaka")
            check_hallucination(commentary_osaka_text, article)
            check_article_number_confusion(commentary_osaka_text, article)
            check_length(commentary_osaka, article)
            check_character_names(commentary_osaka, article)
            check_generic_commentary(commentary, article)

        except Exception as e:
            print(f"エラー: 第{article}条の処理中にエラーが発生しました: {e}")

    # 結果を出力
    result = {"totalArticles": len(articles), "issues": issues}

    output_file = Path("reports/kaisya_hou/result-kaisya_hou-range5.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ チェック完了！")
    print(f"総条文数: {len(articles)}")
    print(f"発見された問題: {len(issues)}件")
    print(f"結果ファイル: {output_file}")

    # 重大度別の集計
    severity_count = {"critical": 0, "high": 0, "medium": 0, "low": 0}

    for issue in issues:
        severity_count[issue["severity"]] += 1

    print("\n【重大度別集計】")
    print(f"Critical: {severity_count['critical']}件")
    print(f"High: {severity_count['high']}件")
    print(f"Medium: {severity_count['medium']}件")
    print(f"Low: {severity_count['low']}件")


if __name__ == "__main__":
    main()
