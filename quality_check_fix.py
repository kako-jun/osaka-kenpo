#!/usr/bin/env python3
"""
法律データの品質確認と修正スクリプト
1. 「あたし」→「わたし」への置換
2. 空の解説フィールドの検出
3. 解説品質チェック（300文字未満、段落不足、具体例なし）
"""

import os
import yaml
import re
from pathlib import Path
from typing import Dict, List, Tuple

# 対象法律のパスマッピング
LAW_PATHS = {
    "南極条約": "src/data/laws/treaty/antarctic_treaty",
    "マグナ・カルタ": "src/data/laws/foreign_old/magna_carta",
    "十七条憲法": "src/data/laws/jp_old/jushichijo_kenpo",
    "アメリカ憲法": "src/data/laws/foreign/us_constitution",
    "ドイツ基本法": "src/data/laws/foreign/german_basic_law",
    "中国憲法": "src/data/laws/foreign/prc_constitution",
    "AI推進法": "src/data/laws/jp/ai_suishin_hou",
    "日本国憲法": "src/data/laws/jp/constitution",
    "会社法": "src/data/laws/jp/kaisya_hou",
    "民法": "src/data/laws/jp/minpou",
    "商法": "src/data/laws/jp/shouhou",
    "刑法": "src/data/laws/jp/keihou",
    "民事訴訟法": "src/data/laws/jp/minji_soshou_hou",
    "刑事訴訟法": "src/data/laws/jp/keiji_soshou_hou",
}


class QualityChecker:
    def __init__(self):
        self.replacement_count = {law: 0 for law in LAW_PATHS.keys()}
        self.empty_fields = []
        self.quality_issues = []
        self.modified_files = []

    def check_and_fix_file(self, file_path: Path, law_name: str) -> bool:
        """単一ファイルのチェックと修正"""
        # law_metadata.yamlと特殊ファイルはスキップ
        if file_path.name in [
            "law_metadata.yaml",
            "chapters.yaml",
            "famous_articles.yaml",
        ]:
            return False

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                data = yaml.safe_load(content)

            if not data:
                return False

            # 「あたし」→「わたし」の置換
            original_content = content
            modified = False

            # osakaTextとcommentaryOsakaフィールド内の「あたし」を置換
            if "あたし" in content:
                # YAMLの構造を保持しながら置換
                new_content = content

                # osakaTextとcommentaryOsakaの行を特定して置換
                lines = content.split("\n")
                in_osaka_field = False
                field_indent = 0

                for i, line in enumerate(lines):
                    # フィールドの開始を検出
                    if re.match(r"^(\s*)(osakaText|commentaryOsaka):", line):
                        in_osaka_field = True
                        field_indent = len(line) - len(line.lstrip())
                        continue

                    # フィールドの終了を検出（インデントが戻った、または新しいフィールド）
                    if in_osaka_field:
                        current_indent = (
                            len(line) - len(line.lstrip())
                            if line.strip()
                            else field_indent + 2
                        )
                        if line.strip() and current_indent <= field_indent:
                            in_osaka_field = False
                        elif "あたし" in line:
                            lines[i] = line.replace("あたし", "わたし")
                            modified = True
                            self.replacement_count[law_name] += line.count("あたし")

                if modified:
                    new_content = "\n".join(lines)
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    self.modified_files.append(str(file_path))

            # 再度YAMLを読み込んで品質チェック
            with open(file_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f.read())

            # 空のフィールドチェック
            if "osakaText" in data:
                if not data["osakaText"] or (
                    isinstance(data["osakaText"], list) and len(data["osakaText"]) == 0
                ):
                    self.empty_fields.append((str(file_path), "osakaText が空"))

            if "commentaryOsaka" in data:
                commentary = data["commentaryOsaka"]
                if not commentary or (
                    isinstance(commentary, list) and len(commentary) == 0
                ):
                    self.empty_fields.append((str(file_path), "commentaryOsaka が空"))
                elif isinstance(commentary, list):
                    # 解説品質チェック
                    full_text = "\n".join(commentary)

                    # 300文字未満チェック
                    if len(full_text) < 300:
                        self.quality_issues.append(
                            (
                                str(file_path),
                                f"commentaryOsaka {len(full_text)}文字（300文字未満）",
                            )
                        )

                    # 段落数チェック（3未満）
                    paragraph_count = len([p for p in commentary if p.strip()])
                    if paragraph_count < 3:
                        self.quality_issues.append(
                            (str(file_path), f"段落数{paragraph_count}（3未満）")
                        )

                    # 具体例チェック
                    has_example = any(
                        "例えばな、" in p or "例えば、" in p or "たとえば" in p
                        for p in commentary
                    )
                    if not has_example:
                        self.quality_issues.append((str(file_path), "具体例なし"))

            return modified

        except Exception as e:
            print(f"エラー: {file_path}: {e}")
            return False

    def process_law(self, law_name: str, law_path: str):
        """法律ディレクトリ全体を処理"""
        path = Path(law_path)
        if not path.exists():
            print(f"警告: {law_name} のディレクトリが見つかりません: {law_path}")
            return

        yaml_files = list(path.glob("*.yaml"))
        print(f"\n処理中: {law_name} ({len(yaml_files)} ファイル)")

        for yaml_file in yaml_files:
            self.check_and_fix_file(yaml_file, law_name)

    def generate_report(self) -> str:
        """レポート生成"""
        report = []
        report.append("=" * 80)
        report.append("## 修正完了サマリー")
        report.append("=" * 80)
        report.append("")

        # 「あたし」→「わたし」置換結果
        report.append("### 「あたし」→「わたし」置換結果")
        report.append("")
        total_replacements = 0
        for law_name, count in self.replacement_count.items():
            if count > 0:
                report.append(f"- {law_name}: {count}件")
                total_replacements += count
        if total_replacements == 0:
            report.append("- 置換対象なし（すべて修正済み）")
        report.append(f"\n**合計: {total_replacements}件の置換**")
        report.append("")

        # 空の解説フィールド
        report.append("### 空の解説フィールド")
        report.append("")
        if self.empty_fields:
            for file_path, issue in self.empty_fields:
                report.append(f"- {file_path}: {issue}")
        else:
            report.append("- なし（すべてのフィールドにデータあり）")
        report.append("")

        # 品質不十分な解説
        report.append("### 品質不十分な解説")
        report.append("")
        if self.quality_issues:
            # 問題ごとに集計
            issues_by_type = {}
            for file_path, issue in self.quality_issues:
                if "300文字未満" in issue:
                    key = "300文字未満"
                elif "段落数" in issue:
                    key = "段落不足"
                elif "具体例なし" in issue:
                    key = "具体例なし"
                else:
                    key = "その他"

                if key not in issues_by_type:
                    issues_by_type[key] = []
                issues_by_type[key].append((file_path, issue))

            for issue_type, items in issues_by_type.items():
                report.append(f"#### {issue_type} ({len(items)}件)")
                for file_path, issue in items[:10]:  # 最初の10件のみ表示
                    report.append(f"- {file_path}: {issue}")
                if len(items) > 10:
                    report.append(f"  ... 他 {len(items) - 10}件")
                report.append("")
        else:
            report.append("- なし（すべて基準を満たしています）")
        report.append("")

        # 統計情報
        report.append("### 統計情報")
        report.append("")
        report.append(f"- 修正ファイル数: {len(self.modified_files)}")
        report.append(f"- 空フィールド: {len(self.empty_fields)}件")
        report.append(f"- 品質問題: {len(self.quality_issues)}件")
        report.append("")

        return "\n".join(report)


def main():
    checker = QualityChecker()

    print("=" * 80)
    print("法律データ品質確認・修正ツール")
    print("=" * 80)

    for law_name, law_path in LAW_PATHS.items():
        checker.process_law(law_name, law_path)

    # レポート生成
    report = checker.generate_report()
    print("\n" + report)

    # レポートをファイルに保存
    with open("quality_check_report.txt", "w", encoding="utf-8") as f:
        f.write(report)

    print("\n" + "=" * 80)
    print("レポートを quality_check_report.txt に保存しました")
    print("=" * 80)


if __name__ == "__main__":
    main()
