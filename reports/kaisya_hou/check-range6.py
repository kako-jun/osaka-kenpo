#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""会社法第751-979条の品質チェックスクリプト"""

import os
import re
import yaml
import json
from pathlib import Path

# チェック基準
MALE_EXPRESSIONS = ["わい", "わいら", "おんどれ", "わし"]
MERCHANT_EXPRESSIONS = ["投資", "利益", "儲け", "商売", "取引", "ビジネス"]
# 法律用語として許容される「利益」の文脈
LEGAL_BENEFIT_PATTERNS = [
    r"時効.*利益",
    r"利益.*相反",
    r"現存.*利益",
    r"利益.*供与",
    r"利益.*衡量",
    r"公共.*利益",
    r"共同.*利益",
    r"不利益",  # 「不利益」は法律用語
    r"社会.*利益",
    r"全体.*利益",
    r"配当.*利益",
    r"利益.*配当",
    r"剰余.*利益",
]
BAD_CHARACTER_NAMES = ["HHH", "XXX", "甲", "乙", "丙"]


def is_legal_benefit(text, match_pos):
    """利益という表現が法律用語として使われているか判定"""
    context = text[max(0, match_pos - 10) : match_pos + 20]
    for pattern in LEGAL_BENEFIT_PATTERNS:
        if re.search(pattern, context):
            return True
    return False


def check_article(article_num, data, base_dir):
    """1つの条文をチェック"""
    issues = []

    commentary = data.get("commentary", [])
    commentary_osaka = data.get("commentaryOsaka", [])
    original_text = data.get("originalText", [])
    osaka_text = data.get("osakaText", [])

    # 文字列に変換
    commentary_str = (
        "\n".join(commentary) if isinstance(commentary, list) else str(commentary)
    )
    commentary_osaka_str = (
        "\n".join(commentary_osaka)
        if isinstance(commentary_osaka, list)
        else str(commentary_osaka)
    )
    original_str = (
        "\n".join(original_text)
        if isinstance(original_text, list)
        else str(original_text)
    )
    osaka_str = (
        "\n".join(osaka_text) if isinstance(osaka_text, list) else str(osaka_text)
    )

    # 1. 男性表現のチェック (High)
    for expr in MALE_EXPRESSIONS:
        if expr in commentary_osaka_str:
            issues.append(
                {
                    "article": article_num,
                    "severity": "high",
                    "category": "persona",
                    "description": f"男性表現「{expr}」が使用されています。春日歩先生は女性のため、男性表現は使用禁止です。",
                    "location": "commentaryOsaka",
                    "suggestion": "男性表現を削除するか、一人称を使わない表現に書き換えてください。",
                }
            )

    # 2. 商人表現のチェック (Medium)
    for expr in MERCHANT_EXPRESSIONS:
        if expr == "利益":
            # 利益は文脈を確認
            for match in re.finditer(expr, commentary_osaka_str):
                if not is_legal_benefit(commentary_osaka_str, match.start()):
                    issues.append(
                        {
                            "article": article_num,
                            "severity": "medium",
                            "category": "persona",
                            "description": f"商人表現「{expr}」が使用されています。教育者らしい表現に置き換えてください。",
                            "location": "commentaryOsaka",
                            "suggestion": "「メリット」「良いこと」などの表現に置き換えてください。",
                        }
                    )
                    break  # 1つ見つかれば十分
        else:
            if expr in commentary_osaka_str:
                suggestion = {
                    "投資": "「力を注ぐ」「取り組む」などに置き換え",
                    "儲け": "「収入」「お金」などに置き換え",
                    "商売": "「仕事」「事業」などに置き換え",
                    "取引": "法律用語なら可、一般的な意味なら「やりとり」などに置き換え",
                    "ビジネス": "「仕事」「事業」などに置き換え",
                }.get(expr, "教育者らしい表現に置き換えてください")

                issues.append(
                    {
                        "article": article_num,
                        "severity": "medium",
                        "category": "persona",
                        "description": f"商人表現「{expr}」が使用されています。",
                        "location": "commentaryOsaka",
                        "suggestion": suggestion,
                    }
                )

    # 3. 変な登場人物名のチェック (Medium)
    for name in BAD_CHARACTER_NAMES:
        if name in commentary_osaka_str:
            issues.append(
                {
                    "article": article_num,
                    "severity": "medium",
                    "category": "example",
                    "description": f"不適切な登場人物名「{name}」が使用されています。",
                    "location": "commentaryOsaka",
                    "suggestion": "「太郎さん」「花子さん」「A社」「B銀行」など、分かりやすい名前に置き換えてください。",
                }
            )

    # 4. 解説の長さチェック (Medium)
    if len(commentary_osaka_str) < 300:
        issues.append(
            {
                "article": article_num,
                "severity": "medium",
                "category": "consistency",
                "description": f"commentaryOsakaが短すぎます（{len(commentary_osaka_str)}文字）。300文字以上の詳細な解説を推奨。",
                "location": "commentaryOsaka",
                "suggestion": "具体的な例え話や詳しい説明を追加してください。",
            }
        )

    # 5. 条文番号の言及チェック (Critical) - 簡易版
    # 枝番条文で「第XXX条」と誤記していないかチェック
    if "-" in article_num:
        base_num = article_num.split("-")[0]
        wrong_pattern = f"第{base_num}条"
        if wrong_pattern in commentary_osaka_str:
            issues.append(
                {
                    "article": article_num,
                    "severity": "critical",
                    "category": "legal_accuracy",
                    "description": f"枝番条文{article_num}の解説で「{wrong_pattern}」と誤記されている可能性があります。",
                    "location": "commentaryOsaka",
                    "suggestion": f"「第{article_num}条」と正しく記載してください。",
                }
            )

    # 6. ハルシネーションの兆候チェック (High) - 簡易版
    hallucination_keywords = [
        "1986年",
        "2000年",
        "1975年",
        "1980年代",
    ]  # 会社法関連で誤りやすい年号
    for keyword in hallucination_keywords:
        if keyword in commentary_osaka_str:
            issues.append(
                {
                    "article": article_num,
                    "severity": "high",
                    "category": "hallucination",
                    "description": f"「{keyword}」という年号が使用されています。会社法は2005年成立のため、確認が必要です。",
                    "location": "commentaryOsaka",
                    "suggestion": "歴史的事実や年号を信頼できるソースで確認してください。",
                }
            )

    return issues


def main():
    base_dir = Path("/home/d131/repos/2025/osaka-kenpo/src/data/laws/jp/kaisya_hou")

    # 対象条文の取得
    all_files = sorted(base_dir.glob("*.yaml"))
    target_files = []

    for f in all_files:
        name = f.stem
        # 751-979の範囲
        match = re.match(r"^(\d+)(-\d+)?$", name)
        if match:
            num = int(match.group(1))
            if 751 <= num <= 979:
                target_files.append((name, f))

    print(f"対象条文数: {len(target_files)}")

    all_issues = []

    for article_num, filepath in target_files:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            issues = check_article(article_num, data, base_dir)
            all_issues.extend(issues)

        except Exception as e:
            print(f"エラー: {article_num} - {e}")
            all_issues.append(
                {
                    "article": article_num,
                    "severity": "critical",
                    "category": "other",
                    "description": f"ファイル読み込みエラー: {e}",
                    "location": "file",
                    "suggestion": "ファイル形式を確認してください。",
                }
            )

    # 結果をJSON形式で出力
    result = {"totalArticles": len(target_files), "issues": all_issues}

    output_path = "/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range6.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✅ チェック完了！")
    print(f"総条文数: {result['totalArticles']}")
    print(f"発見された問題: {len(all_issues)}件")
    print(f"\n結果を保存しました: {output_path}")

    # サマリー表示
    severity_count = {}
    category_count = {}
    for issue in all_issues:
        sev = issue["severity"]
        cat = issue["category"]
        severity_count[sev] = severity_count.get(sev, 0) + 1
        category_count[cat] = category_count.get(cat, 0) + 1

    print("\n=== 重大度別 ===")
    for sev in ["critical", "high", "medium", "low"]:
        if sev in severity_count:
            print(f"{sev}: {severity_count[sev]}件")

    print("\n=== カテゴリ別 ===")
    for cat, count in sorted(category_count.items()):
        print(f"{cat}: {count}件")


if __name__ == "__main__":
    main()
