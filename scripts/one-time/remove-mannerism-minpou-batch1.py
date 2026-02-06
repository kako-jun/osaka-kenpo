#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
民法YAMLファイルのcommentaryOsakaの1段落目冒頭から
マンネリ表現を削除するスクリプト
"""

import re
import sys
from pathlib import Path

# 削除対象パターン（優先順位付き）
PATTERNS = [
    r"^この第\d+条は、",
    r"^この第\d+条は　",
    r"^この条文は、",
    r"^この条文は　",
    r"^この規定は、",
    r"^この規定は　",
    r"^これは、",
    r"^これは　",
    r"^ここは、",
    r"^ここは　",
]


def remove_mannerism_from_commentary(commentary_osaka_lines):
    """commentaryOsakaの1段落目冒頭からマンネリ表現を削除"""
    if not commentary_osaka_lines or len(commentary_osaka_lines) == 0:
        return commentary_osaka_lines, False

    first_line = commentary_osaka_lines[0]
    original_first_line = first_line

    # 各パターンをチェック
    for pattern in PATTERNS:
        if re.match(pattern, first_line):
            first_line = re.sub(pattern, "", first_line)
            break

    # 変更があった場合のみ更新
    if first_line != original_first_line:
        result = [first_line] + commentary_osaka_lines[1:]
        return result, True

    return commentary_osaka_lines, False


def process_yaml_file(filepath):
    """YAMLファイルを処理（手動パース）"""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # commentaryOsaka部分を特定
    in_commentary_osaka = False
    commentary_osaka_start = -1
    commentary_osaka_indent = 0
    first_item_start = -1
    first_item_end = -1

    for i, line in enumerate(lines):
        if line.startswith("commentaryOsaka:"):
            in_commentary_osaka = True
            commentary_osaka_start = i
            continue

        if in_commentary_osaka:
            # インデントをチェック
            if line.strip() == "":
                continue

            # 次のキーが始まったら終了
            if not line.startswith(" ") and not line.startswith("\t"):
                break

            # リストアイテムの検出
            stripped = line.lstrip()
            if stripped.startswith("- "):
                if first_item_start == -1:
                    # 最初のリストアイテム
                    first_item_start = i
                    commentary_osaka_indent = len(line) - len(stripped)
                elif first_item_end == -1:
                    # 2番目のリストアイテムが始まった = 1番目の終わり
                    first_item_end = i - 1
                    break

    # 最後までリストアイテムが1つだけの場合
    if first_item_start != -1 and first_item_end == -1:
        # 次のキーまたはファイル末尾まで
        for i in range(first_item_start + 1, len(lines)):
            if (
                lines[i].strip()
                and not lines[i].startswith(" ")
                and not lines[i].startswith("\t")
            ):
                first_item_end = i - 1
                break
        else:
            first_item_end = len(lines) - 1

    if first_item_start == -1:
        # commentaryOsakaが見つからない
        return False

    # 1段落目のテキストを抽出
    first_item_text = lines[first_item_start].lstrip()[2:]  # "- " を除去

    # マンネリ表現を削除
    original_text = first_item_text
    for pattern in PATTERNS:
        if re.match(pattern, first_item_text):
            first_item_text = re.sub(pattern, "", first_item_text)
            break

    # 変更がない場合
    if first_item_text == original_text:
        return False

    # 1段落目の行を更新
    indent_str = " " * commentary_osaka_indent
    lines[first_item_start] = f"{indent_str}- {first_item_text}"

    # ファイルに書き戻し
    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(lines)

    return True


def main():
    # バッチファイルを読み込み
    batch_file = Path("/tmp/minpou_batch1.txt")
    if not batch_file.exists():
        print(f"エラー: {batch_file} が見つかりません")
        sys.exit(1)

    with open(batch_file, "r", encoding="utf-8") as f:
        file_paths = [line.strip() for line in f if line.strip()]

    # 各ファイルを処理
    processed_count = 0
    skipped_count = 0

    for file_path in file_paths:
        full_path = Path("/home/d131/repos/2025/osaka-kenpo") / file_path

        if not full_path.exists():
            print(f"スキップ: {file_path} (ファイルが存在しません)")
            skipped_count += 1
            continue

        try:
            changed = process_yaml_file(full_path)
            if changed:
                print(f"✓ {file_path}")
                processed_count += 1
            else:
                skipped_count += 1
        except Exception as e:
            print(f"エラー: {file_path} - {e}")
            skipped_count += 1

    print(f"\n完了: {processed_count}件処理、{skipped_count}件スキップ")


if __name__ == "__main__":
    main()
