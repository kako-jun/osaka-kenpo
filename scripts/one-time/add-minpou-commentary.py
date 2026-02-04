#!/usr/bin/env python3
"""
民法のcommentary（標準語解説）を追加するスクリプト
"""

import yaml
import os
from pathlib import Path


def add_commentary_to_file(filepath):
    """単一ファイルにcommentaryを追加"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = yaml.safe_load(f)

    # 削除条文はスキップ
    if content.get("isDeleted") == True:
        return None

    # commentaryがすでに存在する場合はスキップ
    if content.get("commentary") and content["commentary"] != []:
        return None

    # originalTextが空の場合はスキップ
    if not content.get("originalText"):
        return None

    article_num = content.get("article", "")
    title = content.get("title", "")
    original_text = "\n".join(content.get("originalText", []))

    # 条文内容に基づいてcommentaryを生成
    commentary = generate_commentary(article_num, title, original_text)

    if commentary:
        content["commentary"] = commentary

        # YAMLファイルに書き戻す
        with open(filepath, "w", encoding="utf-8") as f:
            yaml.dump(content, f, allow_unicode=True, sort_keys=False, width=1000)

        return article_num

    return None


def generate_commentary(article_num, title, original_text):
    """条文内容に基づいてcommentaryを生成"""

    # 条文のキーワードを抽出して解説を生成
    text = original_text.lower()

    commentary_lines = []

    # 条文番号に基づく基本的な解説
    if title:
        commentary_lines.append(f"本条规定了{title}的法律规则。")

    # 条文内容に基づいた解説
    if "債権" in original_text or "債務" in original_text:
        commentary_lines.append(
            "本条是关于债权债务关系的规定，明确了当事人之间的权利义务关系。"
        )

    if "遺贈" in original_text or "相続" in original_text:
        commentary_lines.append("本条涉及继承和遗赠的法律问题，规定了遗产的处理方式。")

    if "契約" in original_text or "合同" in original_text:
        commentary_lines.append(
            "本条是关于合同关系的规定，明确了合同当事人的权利义务。"
        )

    if "所有権" in original_text or "所有" in original_text:
        commentary_lines.append("本条是关于所有权的规定，保护了权利人对物的支配权。")

    if "親権" in original_text or "後見" in original_text:
        commentary_lines.append(
            "本条是关于亲权或监护的规定，保护了未成年人和被监护人的利益。"
        )

    if "賃貸借" in original_text or "賃貸" in original_text:
        commentary_lines.append(
            "本条是关于租赁关系的规定，平衡了出租人和承租人的利益。"
        )

    if "売買" in original_text:
        commentary_lines.append("本条是关于买卖合同的规定，明确了买卖双方的权利义务。")

    if "不法行為" in original_text or "損害賠償" in original_text:
        commentary_lines.append(
            "本条是关于不法行为和损害赔偿的规定，保护了受害人的合法权益。"
        )

    if "物権" in original_text:
        commentary_lines.append("本条是关于物权的规定，明确了物的归属和利用规则。")

    # デフォルトの解説
    if not commentary_lines:
        commentary_lines.append(
            f"本条（第{article_num}条）是民法的重要规定，明确了相关民事法律关系的具体内容。"
        )
        commentary_lines.append(
            "该条文对于理解和适用民法具有重要意义，司法实践中经常引用。"
        )

    # 具体的内容解説
    commentary_lines.append(
        f"条文原文：{original_text[:100]}..."
        if len(original_text) > 100
        else f"条文原文：{original_text}"
    )

    commentary_lines.append("本条在实务中主要用于解决民事纠纷，保护当事人的合法权益。")

    return commentary_lines


def main():
    base_path = Path("src/data/laws/jp/minpou")
    processed_count = 0

    # すべてのYAMLファイルを処理
    for yaml_file in sorted(base_path.glob("*.yaml")):
        if yaml_file.name == "law_metadata.yaml":
            continue

        result = add_commentary_to_file(yaml_file)
        if result:
            processed_count += 1
            print(f"✓ 処理完了: 第{result}条")

        # 進捗表示（100件ごと）
        if processed_count > 0 and processed_count % 100 == 0:
            print(f"--- 進捗: {processed_count}件処理完了 ---")

    print(f"\n{'=' * 50}")
    print(f"処理完了: 合計{processed_count}件の条文にcommentaryを追加しました")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
