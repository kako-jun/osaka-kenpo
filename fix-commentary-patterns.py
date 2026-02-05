#!/usr/bin/env python3
"""
WHO憲章のcommentaryOsakaを修正:
1. 「條」→「条」に統一
2. 冒頭パターンの多様化
"""

import yaml
import re
from pathlib import Path

# 冒頭パターンのバリエーション
OPENING_PATTERNS = [
    "この第{n}条はな、",  # 0, 4, 8, 12...
    "第{n}条を見てみるとな、",  # 1, 5, 9...
    "さて、第{n}条やけど、",  # 2, 6, 10...
    "この条文はな、",  # 3, 7, 11...
]


def get_opening_pattern(article_num):
    """条文番号に応じて冒頭パターンを選択"""
    idx = article_num % 4
    pattern = OPENING_PATTERNS[idx]
    if "{n}" in pattern:
        return pattern.format(n=article_num)
    return pattern


def fix_commentary(commentary_list, article_num):
    """commentaryOsakaを修正"""
    if not commentary_list or len(commentary_list) == 0:
        return commentary_list

    fixed = []
    for i, paragraph in enumerate(commentary_list):
        text = str(paragraph)

        # commentaryOsakaの本文中のみ「條」→「条」に統一
        # （タイトルは公式表記なので保持）
        text = text.replace("條", "条")

        # 第1段落の冒頭パターンを修正
        if i == 0:
            # 既存の冒頭パターンを置換
            patterns_to_replace = [
                r"^この第.{1,3}条はな、",
                r"^この第.{1,3}條はな、",
            ]

            replaced = False
            for pattern in patterns_to_replace:
                if re.match(pattern, text):
                    # パターンにマッチしたら新しい冒頭に置換
                    new_opening = get_opening_pattern(article_num)
                    text = re.sub(pattern, new_opening, text)
                    replaced = True
                    break

        fixed.append(text)

    return fixed


def main():
    who_dir = Path("src/data/laws/treaty/who_constitution")

    for yaml_file in sorted(who_dir.glob("[0-9]*.yaml")):
        if yaml_file.name == "law_metadata.yaml":
            continue

        print(f"Processing {yaml_file.name}...")

        with open(yaml_file, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        article_num = data.get("article", 0)

        # commentaryOsakaのみ修正
        # （title, titleOsaka, originalText, commentaryは公式表記なので保持）
        if "commentaryOsaka" in data and data["commentaryOsaka"]:
            data["commentaryOsaka"] = fix_commentary(
                data["commentaryOsaka"], article_num
            )

        # YAMLとして保存
        with open(yaml_file, "w", encoding="utf-8") as f:
            yaml.dump(
                data, f, allow_unicode=True, sort_keys=False, default_flow_style=False
            )

    print("\n✅ All files fixed!")


if __name__ == "__main__":
    main()
