#!/usr/bin/env python3
"""刑事訴訟法431-516条のcommentaryOsaka品質チェック"""

import yaml
import re
from pathlib import Path


def check_quality(file_path):
    """1ファイルの品質をチェック"""
    with open(file_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    commentary = data.get("commentaryOsaka", [])
    if not commentary:
        return {
            "needs_improvement": True,
            "reason": "commentaryOsaka が空",
            "length": 0,
        }

    # リストを結合
    text = "\n".join(commentary) if isinstance(commentary, list) else commentary
    length = len(text)

    issues = []

    # 1. 文字数チェック（200文字未満は要改善）
    if length < 200:
        issues.append(f"文字数不足: {length}文字（目標200+）")

    # 2. 具体例チェック
    has_example = bool(re.search(r"例えば|考えてみ", text))
    if not has_example:
        issues.append("具体例なし")

    # 3. 商人表現チェック（禁止）
    merchant_terms = ["利益", "商売", "投資", "儲け"]
    found_terms = [term for term in merchant_terms if term in text]
    if found_terms:
        issues.append(f"商人表現あり: {', '.join(found_terms)}")

    # 4. NG語尾チェック
    ng_words = ["わい", "わいら", "おんどれ"]
    found_ng = [word for word in ng_words if word in text]
    if found_ng:
        issues.append(f"NG語尾: {', '.join(found_ng)}")

    # 5. 「知らんけど」の多用チェック
    shiranakedo_count = text.count("知らんけど")
    if shiranakedo_count >= 2:
        issues.append(f"「知らんけど」多用: {shiranakedo_count}回")

    return {
        "needs_improvement": len(issues) > 0 or length < 200,
        "reason": "; ".join(issues) if issues else "OK",
        "length": length,
    }


def main():
    base_dir = Path("src/data/laws/jp/keiji_soshou_hou")

    # 431-516の全ファイルを取得
    files = []
    for i in range(431, 517):
        yaml_file = base_dir / f"{i}.yaml"
        if yaml_file.exists():
            files.append(yaml_file)

        # 枝番もチェック
        for j in range(2, 20):
            branch_file = base_dir / f"{i}-{j}.yaml"
            if branch_file.exists():
                files.append(branch_file)

    files.sort(
        key=lambda x: (
            int(x.stem.split("-")[0]),
            int(x.stem.split("-")[1]) if "-" in x.stem else 0,
        )
    )

    needs_improvement = []
    ok_files = []

    for file_path in files:
        result = check_quality(file_path)
        if result["needs_improvement"]:
            needs_improvement.append(
                {
                    "file": file_path.name,
                    "length": result["length"],
                    "reason": result["reason"],
                }
            )
        else:
            ok_files.append(file_path.name)

    print(f"=== 刑事訴訟法 第431条〜第516条 品質チェック結果 ===\n")
    print(f"対象ファイル総数: {len(files)}")
    print(f"改善不要: {len(ok_files)}")
    print(f"改善必要: {len(needs_improvement)}\n")

    if needs_improvement:
        print("=== 改善が必要なファイル ===")
        for item in needs_improvement:
            print(f"{item['file']:20s} | {item['length']:3d}文字 | {item['reason']}")

    print(f"\n改善率: {len(ok_files) / len(files) * 100:.1f}%")


if __name__ == "__main__":
    main()
