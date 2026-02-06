#!/usr/bin/env python3
"""
刑事訴訟法のcommentaryOsakaから冒頭のマンネリ表現を削除する
"""

import os
import re
import yaml
from pathlib import Path
from typing import Optional

MANNERISM_PATTERNS = [
    r"^これは、",
    r"^この条文は、",
    r"^この附則は、",
    r"^この規定は、",
    r"^これらの規定は、",
    r"^第[0-9０-９〇一二三四五六七八九十百千万]+条は、",
]


def load_yaml_safe(filepath: str) -> tuple[Optional[dict], str]:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        data = yaml.safe_load(content)
        return data, content
    except Exception as e:
        print(f"  ERROR: {e}")
        return None, ""


def remove_mannerism(text: str) -> tuple[str, bool]:
    for pattern in MANNERISM_PATTERNS:
        if re.match(pattern, text):
            modified = re.sub(pattern, "", text, count=1).lstrip()
            return modified, True
    return text, False


def process_file(filepath: str) -> tuple[bool, bool, str]:
    data, original_content = load_yaml_safe(filepath)

    if data is None:
        return False, False, "YAML解析失敗"

    if "commentaryOsaka" not in data or not data["commentaryOsaka"]:
        return False, False, "commentaryOsaka なし"

    commentary_list = data["commentaryOsaka"]

    if not isinstance(commentary_list, list):
        return False, False, "commentaryOsaka がリストではない"

    has_multiple = len(commentary_list) > 1

    first_item = commentary_list[0]
    if not isinstance(first_item, str):
        return False, has_multiple, "最初の項目が文字列ではない"

    modified_text, was_changed = remove_mannerism(first_item)

    if not was_changed:
        return False, has_multiple, "マンネリ表現 なし"

    data["commentaryOsaka"][0] = modified_text

    try:
        modified_content = yaml.dump(
            data,
            default_flow_style=False,
            allow_unicode=True,
            sort_keys=False,
            width=1000,
        )

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(modified_content)

        return True, has_multiple, "削除完了"
    except Exception as e:
        return False, has_multiple, f"書き込み失敗: {e}"


def main():
    law_dir = Path("src/data/laws/jp/keiji_soshou_hou")

    if not law_dir.exists():
        print(f"ERROR: {law_dir} が見つかりません")
        return

    yaml_files = sorted(
        [f for f in law_dir.glob("*.yaml") if f.name != "law_metadata.yaml"]
    )

    print(f"処理ファイル数: {len(yaml_files)}")
    print("-" * 60)

    modified_count = 0
    multi_item_count = 0
    errors = []

    for i, filepath in enumerate(yaml_files, 1):
        filename = filepath.name
        was_modified, has_multiple, message = process_file(str(filepath))

        status = "✓" if was_modified else "·"
        multi_marker = "[複数]" if has_multiple else ""

        if i % 100 == 0 or was_modified:
            print(f"{status} {i:4d}: {filename} {multi_marker} - {message}")

        if was_modified:
            modified_count += 1

        if has_multiple:
            multi_item_count += 1

        if "失敗" in message or "ERROR" in message:
            errors.append((filename, message))

    print("-" * 60)
    print(f"\n【処理結果】")
    print(f"修正ファイル数: {modified_count} / {len(yaml_files)}")
    print(f"複数項目ファイル: {multi_item_count}")
    print(f"エラー数: {len(errors)}")

    if errors:
        print(f"\n【エラー詳細】")
        for filename, msg in errors[:10]:
            print(f"  {filename}: {msg}")


if __name__ == "__main__":
    main()
