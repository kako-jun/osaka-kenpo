#!/usr/bin/env python3
"""
会社法第151-300条の品質チェックスクリプト
"""

import os
import re
import json
import yaml
from pathlib import Path

# チェック項目
MALE_EXPRESSIONS = ["わい", "わいら", "おんどれ", "わし"]
MERCHANT_EXPRESSIONS = {
    "投資": ["投資する", "投資して", "投資が", "投資を", "投資に", "投資の"],
    "利益": [],  # 法律用語との区別が必要
    "儲け": ["儲け", "儲かる", "儲ける"],
    "商売": ["商売"],
    "取引": [],  # 法律用語なので基本的にOK
    "ビジネス": ["ビジネス"],
}

# 法律用語の利益（除外対象）
LEGAL_PROFIT_TERMS = [
    "時効の利益",
    "利益相反",
    "現存利益",
    "利益配当",
    "利益の配当",
    "利益準備金",
    "当期純利益",
    "分配可能額",
    "配当可能利益",
]


def load_yaml_file(filepath):
    """YAMLファイルを読み込む"""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None


def check_male_expression(text, article_num):
    """男性表現をチェック"""
    issues = []
    if not text:
        return issues

    for expr in MALE_EXPRESSIONS:
        if expr in text:
            issues.append(
                {
                    "article": article_num,
                    "severity": "high",
                    "category": "persona",
                    "description": f"男性表現「{expr}」が使用されています（春日歩先生は女性です）",
                    "location": "commentaryOsaka",
                    "suggestion": f"「{expr}」を削除または「わたし」に置き換えてください",
                }
            )

    return issues


def check_merchant_expression(text, article_num):
    """商人表現をチェック（法律用語を除く）"""
    issues = []
    if not text:
        return issues

    # 利益の文脈チェック
    if "利益" in text:
        # 法律用語かどうかチェック
        is_legal_term = False
        for legal_term in LEGAL_PROFIT_TERMS:
            if legal_term in text:
                is_legal_term = True
                break

        # 法律用語でない場合のみチェック
        if not is_legal_term:
            # 文脈を確認
            patterns = ["利益を得る", "利益が出る", "利益を上げる", "利益になる"]
            for pattern in patterns:
                if pattern in text:
                    issues.append(
                        {
                            "article": article_num,
                            "severity": "medium",
                            "category": "persona",
                            "description": f"商人表現「{pattern}」が使用されています",
                            "location": "commentaryOsaka",
                            "suggestion": "「メリット」「良いこと」「プラス」などに置き換えてください",
                        }
                    )

    # その他の商人表現
    for expr, patterns in MERCHANT_EXPRESSIONS.items():
        if expr in ["利益", "取引"]:  # 既にチェック済みまたはスキップ
            continue
        for pattern in patterns:
            if pattern in text:
                issues.append(
                    {
                        "article": article_num,
                        "severity": "medium",
                        "category": "persona",
                        "description": f"商人表現「{pattern}」が使用されています",
                        "location": "commentaryOsaka",
                        "suggestion": "教育者らしい表現に置き換えてください",
                    }
                )

    return issues


def check_article_number_confusion(data, article_num):
    """条文番号の取り違えをチェック"""
    issues = []

    # commentaryOsakaの取得（リストまたは文字列に対応）
    commentary_osaka_raw = data.get("commentaryOsaka", [])
    if isinstance(commentary_osaka_raw, list):
        commentary_osaka = "\n".join(
            [str(item) if item else "" for item in commentary_osaka_raw]
        )
    elif isinstance(commentary_osaka_raw, str):
        commentary_osaka = commentary_osaka_raw
    else:
        commentary_osaka = ""

    if not commentary_osaka:
        return issues

    # 枝番条文の場合、親条文との混同をチェック
    if "-" in str(article_num):
        base_num = article_num.split("-")[0]
        # 「第XXX条」という記述があるか（枝番なしで言及）
        pattern = f"第{base_num}条"
        if pattern in commentary_osaka and f"{article_num}条" not in commentary_osaka:
            # 実際に親条文の内容を説明していないかチェック
            issues.append(
                {
                    "article": article_num,
                    "severity": "critical",
                    "category": "legal_accuracy",
                    "description": f"枝番条文{article_num}の解説で「第{base_num}条」と記載されています。条文番号の取り違えの可能性があります",
                    "location": "commentaryOsaka",
                    "suggestion": f"解説内容が第{article_num}条のものであることを確認してください",
                }
            )

    return issues

    # 枝番条文の場合、親条文との混同をチェック
    if "-" in str(article_num):
        base_num = article_num.split("-")[0]
        # 「第XXX条」という記述があるか（枝番なしで言及）
        pattern = f"第{base_num}条"
        if pattern in commentary_osaka and f"{article_num}条" not in commentary_osaka:
            # 実際に親条文の内容を説明していないかチェック
            issues.append(
                {
                    "article": article_num,
                    "severity": "critical",
                    "category": "legal_accuracy",
                    "description": f"枝番条文{article_num}の解説で「第{base_num}条」と記載されています。条文番号の取り違えの可能性があります",
                    "location": "commentaryOsaka",
                    "suggestion": f"解説内容が第{article_num}条のものであることを確認してください",
                }
            )

    return issues


def check_length(data, article_num):
    """解説の長さをチェック（300文字以上推奨）"""
    issues = []

    # commentaryOsakaの取得（リストまたは文字列に対応）
    commentary_osaka_raw = data.get("commentaryOsaka", [])
    if isinstance(commentary_osaka_raw, list):
        commentary_osaka = "\n".join(
            [str(item) if item else "" for item in commentary_osaka_raw]
        )
    elif isinstance(commentary_osaka_raw, str):
        commentary_osaka = commentary_osaka_raw
    else:
        commentary_osaka = ""

    if not commentary_osaka:
        return issues

    length = len(commentary_osaka)
    if length < 300:
        issues.append(
            {
                "article": article_num,
                "severity": "medium",
                "category": "consistency",
                "description": f"解説が短すぎます（{length}文字）。300文字以上推奨",
                "location": "commentaryOsaka",
                "suggestion": "具体例や詳細な説明を追加してください",
            }
        )

    return issues

    length = len(commentary_osaka)
    if length < 300:
        issues.append(
            {
                "article": article_num,
                "severity": "medium",
                "category": "consistency",
                "description": f"解説が短すぎます（{length}文字）。300文字以上推奨",
                "location": "commentaryOsaka",
                "suggestion": "具体例や詳細な説明を追加してください",
            }
        )

    return issues


def check_structure(data, article_num):
    """解説の構成をチェック（3段落以上推奨）"""
    issues = []

    commentary_osaka = data.get("commentaryOsaka", [])
    if not commentary_osaka:
        return issues

    # リスト形式の場合のみ段落数をチェック
    if isinstance(commentary_osaka, list):
        paragraph_count = len([p for p in commentary_osaka if p and str(p).strip()])
    else:
        # 文字列の場合は改行で分割して判定
        paragraph_count = len(
            [p for p in str(commentary_osaka).split("\n") if p.strip()]
        )

    if paragraph_count < 2:
        issues.append(
            {
                "article": article_num,
                "severity": "medium",
                "category": "consistency",
                "description": f"解説の段落が少なすぎます（{paragraph_count}段落）。2-3段落以上推奨",
                "location": "commentaryOsaka",
                "suggestion": "段落を分けて、構造的な解説を心がけてください",
            }
        )

    return issues

    paragraph_count = len([p for p in commentary_osaka if p.strip()])
    if paragraph_count < 2:
        issues.append(
            {
                "article": article_num,
                "severity": "medium",
                "category": "consistency",
                "description": f"解説の段落が少なすぎます（{paragraph_count}段落）。2-3段落以上推奨",
                "location": "commentaryOsaka",
                "suggestion": "段落を分けて、構造的な解説を心がけてください",
            }
        )

    return issues


def check_typos(text, article_num):
    """明らかな誤字をチェック"""
    issues = []
    if not text:
        return issues

    # 明らかな誤字パターン
    typo_patterns = [
        ("せえへんn", "せえへん"),
        ("やんan", "やん"),
        ("あかんn", "あかん"),
        ("　　", ""),  # 全角スペースの連続
    ]

    for wrong, correct in typo_patterns:
        if wrong in text:
            issues.append(
                {
                    "article": article_num,
                    "severity": "low",
                    "category": "other",
                    "description": f"誤字「{wrong}」があります",
                    "location": "commentaryOsaka",
                    "suggestion": f"「{correct}」に修正してください",
                }
            )

    return issues


def check_article(filepath):
    """1つの条文をチェック"""
    data = load_yaml_file(filepath)
    if not data:
        return []

    article_num = data.get("article", "")
    if isinstance(article_num, int):
        article_num = str(article_num)

    issues = []

    # commentaryOsakaの取得（リストまたは文字列に対応）
    commentary_osaka_raw = data.get("commentaryOsaka", [])
    if isinstance(commentary_osaka_raw, list):
        # リストの各要素を文字列化
        commentary_osaka = "\n".join(
            [str(item) if item else "" for item in commentary_osaka_raw]
        )
    elif isinstance(commentary_osaka_raw, str):
        commentary_osaka = commentary_osaka_raw
    else:
        commentary_osaka = ""

    # 各種チェック実行
    issues.extend(check_male_expression(commentary_osaka, article_num))
    issues.extend(check_merchant_expression(commentary_osaka, article_num))
    issues.extend(check_article_number_confusion(data, article_num))
    issues.extend(check_length(data, article_num))
    issues.extend(check_structure(data, article_num))
    issues.extend(check_typos(commentary_osaka, article_num))

    return issues


def main():
    """メイン処理"""
    law_dir = Path("/home/d131/repos/2025/osaka-kenpo/src/data/laws/jp/kaisya_hou")

    # 第151-300条を取得
    article_files = []
    for f in law_dir.glob("*.yaml"):
        # 補則ファイルは除外
        if "suppl" in f.name:
            continue

        # 条文番号を抽出
        match = re.match(r"(\d+)(-\d+)?\.yaml", f.name)
        if match:
            base_num = int(match.group(1))
            if 151 <= base_num <= 300:
                article_files.append(f)

    # ソート
    def sort_key(filepath):
        match = re.match(r"(\d+)(-(\d+))?\.yaml", filepath.name)
        if match:
            base = int(match.group(1))
            branch = int(match.group(3)) if match.group(3) else 0
            return (base, branch)
        return (0, 0)

    article_files.sort(key=sort_key)

    print(f"チェック対象: {len(article_files)}条文")

    all_issues = []
    checked_count = 0

    for filepath in article_files:
        issues = check_article(filepath)
        all_issues.extend(issues)
        checked_count += 1

        if checked_count % 20 == 0:
            print(f"進捗: {checked_count}/{len(article_files)} 条文")

    # 結果をJSON形式で出力
    result = {"totalArticles": checked_count, "issues": all_issues}

    output_path = "/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range2.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n完了: {checked_count}条文をチェック")
    print(f"発見した問題: {len(all_issues)}件")
    print(f"結果を保存: {output_path}")

    # サマリー表示
    severity_count = {}
    category_count = {}
    for issue in all_issues:
        sev = issue["severity"]
        cat = issue["category"]
        severity_count[sev] = severity_count.get(sev, 0) + 1
        category_count[cat] = category_count.get(cat, 0) + 1

    print("\n【重大度別】")
    for sev in ["critical", "high", "medium", "low"]:
        if sev in severity_count:
            print(f"  {sev}: {severity_count[sev]}件")

    print("\n【カテゴリ別】")
    for cat, count in sorted(category_count.items()):
        print(f"  {cat}: {count}件")


if __name__ == "__main__":
    main()
