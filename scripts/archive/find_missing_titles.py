#!/usr/bin/env python3
import argparse
import os
from pathlib import Path

import yaml


def load_article_yaml(path: Path) -> dict:
    with path.open(encoding="utf-8") as fp:
        return yaml.safe_load(fp)


def analyze_law(law_dir: Path) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    missing: list[tuple[str, str]] = []
    paren_only: list[tuple[str, str]] = []

    for entry in sorted(law_dir.iterdir()):
        if entry.suffix != ".yaml":
            continue
        data = load_article_yaml(entry)
        if not isinstance(data, dict) or "article" not in data:
            continue

        article = data.get("article", entry.stem)
        title_value = data.get("title", "")
        title_text = title_value.strip() if isinstance(title_value, str) else ""

        if title_text == "":
            missing.append((str(article), entry.name))
        elif (
            title_text.startswith("（")
            and title_text.endswith("）")
            and len(title_text) > 2
        ):
            paren_only.append((str(article), entry.name))

    return missing, paren_only


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Check law data for missing or parenthesised article titles."
    )
    parser.add_argument(
        "--law-category",
        default="jp",
        help="Top-level law category inside src/data/laws (default: jp)",
    )
    parser.add_argument(
        "--law",
        default="minpou",
        help="Law slug to inspect (default: minpou)",
    )
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parents[1]
    law_dir = base_dir / "src" / "data" / "laws" / args.law_category / args.law
    if not law_dir.is_dir():
        raise SystemExit(f"{law_dir} does not exist")

    missing, paren_only = analyze_law(law_dir)

    print(f"Law: {args.law_category}/{args.law}")
    print(f"  missing title count: {len(missing)}")
    print(f"  parenthesised titles: {len(paren_only)} (likely need sanitisation)")

    if missing:
        print("\nArticles without a title:")
        for article, filename in missing:
            print(f"  {article} -> {filename}")

    if paren_only:
        print("\nParenthesised titles (showing exported strings):")
        for article, filename in paren_only[:15]:
            print(f"  {article} -> {filename}")


if __name__ == "__main__":
    main()
