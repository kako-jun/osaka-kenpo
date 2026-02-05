#!/usr/bin/env python3
"""
国連憲章の原文をWikisourceから取得してYAMLファイルを更新するスクリプト
"""

import re
import yaml
from pathlib import Path
import requests
from bs4 import BeautifulSoup

# Wikisource URL
WIKISOURCE_URL = "https://ja.wikisource.org/wiki/国際連合憲章"

# YAMLファイルのディレクトリ
UN_CHARTER_DIR = Path("src/data/laws/treaty/un_charter")


def fetch_wikisource_html():
    """WikisourceからHTMLを取得"""
    print(f"Fetching from {WIKISOURCE_URL}...")
    response = requests.get(WIKISOURCE_URL)
    response.encoding = "utf-8"
    return response.text


def parse_articles(html):
    """HTMLから条文を抽出"""
    soup = BeautifulSoup(html, "html.parser")
    articles = {}

    # 条文を見つける (### 第X条 の形式)
    current_article = None
    current_title = None
    current_text = []

    # 前文を取得
    preamble_start = soup.find(text=re.compile(r"われら連合国の人民は"))
    if preamble_start:
        # 前文は第1章の前まで
        preamble_text = []
        element = preamble_start.parent
        while element:
            if element.name == "p":
                text = element.get_text(strip=True)
                if text and not text.startswith("[編集]"):
                    preamble_text.append(text)
                    if "国際連合という国際機構を設ける" in text:
                        break
            element = element.find_next()

        if preamble_text:
            articles[0] = {
                "article": 0,
                "title": "前文",
                "text": " ".join(preamble_text),
            }

    # 各条文を検索
    for h4 in soup.find_all(["h4", "h3"]):
        header_text = h4.get_text(strip=True)

        # "第X条" または "第XXX条" のパターンをマッチ
        match = re.match(r"第(\d+)条", header_text)
        if match:
            # 前の条文を保存
            if current_article is not None and current_text:
                articles[current_article] = {
                    "article": current_article,
                    "title": current_title,
                    "text": "\n".join(current_text),
                }

            # 新しい条文を開始
            current_article = int(match.group(1))
            current_title = header_text
            current_text = []

            # 条文の内容を取得 (次のh4まで)
            element = h4.find_next_sibling()
            while element and element.name not in ["h3", "h4", "h2"]:
                if element.name in ["p", "ol", "ul"]:
                    text = element.get_text(strip=True)
                    # [編集]リンクを除外
                    text = re.sub(r"\[編集\]", "", text)
                    if text:
                        current_text.append(text)
                element = element.find_next_sibling()

    # 最後の条文を保存
    if current_article is not None and current_text:
        articles[current_article] = {
            "article": current_article,
            "title": current_title,
            "text": "\n".join(current_text),
        }

    return articles


def update_yaml_files(articles):
    """YAMLファイルを更新"""
    updated_count = 0

    for article_num, article_data in sorted(articles.items()):
        if article_num == 0:
            # 前文はスキップ（別途処理が必要な場合）
            continue

        yaml_path = UN_CHARTER_DIR / f"{article_num}.yaml"

        if not yaml_path.exists():
            print(f"Warning: {yaml_path} does not exist, skipping...")
            continue

        # 既存のYAMLを読み込み
        with open(yaml_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        # originalTextを更新
        data["originalText"] = [article_data["text"]]
        data["title"] = article_data["title"]

        # YAMLに書き戻し
        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(
                data, f, allow_unicode=True, default_flow_style=False, sort_keys=False
            )

        updated_count += 1
        print(f"Updated: {yaml_path.name}")

    return updated_count


def update_metadata():
    """law_metadata.yamlを更新"""
    metadata_path = UN_CHARTER_DIR / "law_metadata.yaml"

    with open(metadata_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    # sourceとsourceUrlを更新
    data["source"] = "Wikisource（国際連合憲章）"
    data["sourceUrl"] = WIKISOURCE_URL

    with open(metadata_path, "w", encoding="utf-8") as f:
        yaml.dump(
            data, f, allow_unicode=True, default_flow_style=False, sort_keys=False
        )

    print(f"Updated: law_metadata.yaml")


def main():
    print("=" * 60)
    print("国連憲章更新スクリプト")
    print("=" * 60)

    # WikisourceからHTMLを取得
    html = fetch_wikisource_html()

    # 条文を抽出
    print("\nParsing articles...")
    articles = parse_articles(html)
    print(f"Found {len(articles)} articles")

    # YAMLファイルを更新
    print("\nUpdating YAML files...")
    updated_count = update_yaml_files(articles)

    # メタデータを更新
    print("\nUpdating metadata...")
    update_metadata()

    print("\n" + "=" * 60)
    print(f"完了: {updated_count}条を更新しました")
    print("=" * 60)


if __name__ == "__main__":
    main()
