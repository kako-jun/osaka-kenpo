#!/usr/bin/env python3
"""
会社法のcommentaryOsakaを追加するスクリプト
"""

import yaml
import os
import random
from pathlib import Path

# 語尾パターン（バリエーション用）
ENDINGS = [
    "やねん",
    "やで",
    "や",
    "やな",
    "やろ",
    "で",
    "やから",
    "せやから",
    "やし",
    "なあかん",
    "せなあかん",
    "あかん",
    "とちゃうか",
    "やろな",
    "ていうことやねん",
    "やでな",
    "しとる",
    "しよる",
    "へん",
]

# 接続詞・前置きパターン
INTROS = ["この条文は", "ここでは", "これは", "この規定は", "ここで決まっとるのは"]

# 例え話・説明パターン
EXAMPLES = ["つまり", "例えば", "具体的には", "要するに", "言うたら"]


def generate_commentary(article_num, title, original_text, osaka_text):
    """条文内容に基づいてcommentaryOsakaを生成"""

    # タイトルが空の場合はoriginal_textから判断
    if not title:
        title_hint = original_text[0][:30] if original_text else ""
    else:
        title_hint = title

    # 条文の種類に応じた解説パターン
    commentary = []

    # 1つ目のポイント：条文の概要
    intro = random.choice(INTROS)
    ending1 = random.choice(["やねん", "やで", "ていうことやねん", "やな"])

    if "設立" in title_hint or "設立" in str(original_text):
        commentary.append(
            f"{intro}、会社を設立するときのルールについて決めとるん{ending1}。どうやって会社を作るんか、その手続きや条件について定めてるで。"
        )
    elif "株式" in title_hint or "株式" in str(original_text):
        commentary.append(
            f"{intro}、株式に関することを決めとるん{ending1}。株主の権利や、株式の扱い方について定めてるで。"
        )
    elif (
        "取締役" in title_hint
        or "取締役" in str(original_text)
        or "董事" in str(original_text)
    ):
        commentary.append(
            f"{intro}、会社のお偉いさんである取締役に関することを決めとるん{ending1}。誰がどうやって会社を経営するんかについて定めてるで。"
        )
    elif "監査" in title_hint or "監査" in str(original_text):
        commentary.append(
            f"{intro}、会社のカンニングをチェックする監査に関することを決めとるん{ending1}。ちゃんと正しい仕事をしとるか見張る仕組みやで。"
        )
    elif (
        "決算" in title_hint
        or "決算" in str(original_text)
        or "計算" in str(original_text)
    ):
        commentary.append(
            f"{intro}、会社のお金の計算に関することを決めとるん{ending1}。一年間どうやって稼いで、どうやって使うんかを決める大切なルールやで。"
        )
    elif "株主" in title_hint or "株主" in str(original_text):
        commentary.append(
            f"{intro}、会社の持ち主である株主の権利や義務について決めとるん{ending1}。株主がどういうことをできるんか、定めてるで。"
        )
    elif (
        "合併" in title_hint
        or "合併" in str(original_text)
        or "分割" in str(original_text)
    ):
        commentary.append(
            f"{intro}、会社同士がくっついたり分かれたりするときのルールを決めとるん{ending1}。大きな変化の時にどうするんかを定めてるで。"
        )
    elif (
        "解散" in title_hint
        or "解散" in str(original_text)
        or "清算" in str(original_text)
    ):
        commentary.append(
            f"{intro}、会社を終わらせるときのルールを決めとるん{ending1}。会社をなくすときもちゃんと決まりに従わなあかんから、大切な規定やで。"
        )
    elif (
        "債権" in title_hint
        or "債権" in str(original_text)
        or "債務" in str(original_text)
    ):
        commentary.append(
            f"{intro}、会社の借金や貸し借りに関することを決めとるん{ending1}。お金の貸し借りはしっかりルールを決めんと後でめんどくさなるからな。"
        )
    elif "定款" in title_hint or "定款" in str(original_text):
        commentary.append(
            f"{intro}、会社のルールブックである定款について決めとるん{ending1}。定款は会社の憲法みたいなもんやから、大事にせなあかんで。"
        )
    elif (
        "総会" in title_hint
        or "総会" in str(original_text)
        or "招集" in str(original_text)
    ):
        commentary.append(
            f"{intro}、株主総会の開き方や決め方について決めとるん{ending1}。会社の大きな決定をするときのルールを定めてるで。"
        )
    else:
        commentary.append(
            f"{intro}、会社の仕組みやルールについて決めとるん{ending1}。会社を正しく動かすために必要な決まり事やで。"
        )

    # 2つ目のポイント：具体的な内容（original_textから）
    if len(original_text) > 0:
        text_sample = original_text[0][:50]
        ending2 = random.choice(["やで", "な", "やねん", "とちゃうか"])

        if "請求" in str(original_text):
            commentary.append(
                f"具体的には、何かをお願いする権利や、請求の仕方について定めとるん{ending2}。手続きをきちんとしんと、請求は認められへんこともあるで。"
            )
        elif "義務" in str(original_text) or "しなければならない" in str(original_text):
            commentary.append(
                f"これはせなあかんこと、つまり義務について定めとるん{ending2}。会社の関係者みんなが守らなあかんルールを決めてるで。"
            )
        elif "権利" in str(original_text):
            commentary.append(
                f"これはできること、つまり権利について定めとるん{ending2}。誰が何ができるんかをはっきりさせてるで。"
            )
        elif (
            "禁止" in str(original_text)
            or "できない" in str(original_text)
            or "あらへん" in str(osaka_text)
        ):
            commentary.append(
                f"ここでは、してはいけないこと、禁止することを定めとるん{ending2}。こういうことはあかんてことやから、注意しなあかんで。"
            )
        elif (
            "手続" in str(original_text)
            or "届出" in str(original_text)
            or "登記" in str(original_text)
        ):
            commentary.append(
                f"手続きの仕方や、届け出の方法について定めとるん{ending2}。決まった手順でちゃんとしんと、法律上認められへんことになるで。"
            )
        else:
            commentary.append(
                f"細かいことやけど、会社を動かす上でめっちゃ大切なルールや{ending2}。見落としやすいけど、ちゃんと理解しとかなあかんで。"
            )

    # 3つ目のポイント：意義や注意点
    ending3 = random.choice(["やで", "やねん", "な", "や", "せやから"])
    purposes = [
        f"これは会社の関係者みんなが公平に扱われるために必要なルール{ending3}。",
        f"会社の仕事を円滑に進めるために、こういう決まりがあるん{ending3}。",
        f"トラブルを防ぐためにも、こういう規定をしっかり決めとくんは大事なこと{ending3}。",
        f"会社法の中でも重要な部分やから、覚えといて損はないで{ending3}。",
    ]
    commentary.append(random.choice(purposes))

    return commentary


def process_files():
    """会社法のYAMLファイルを処理"""
    base_dir = Path("src/data/laws/jp/kaisya_hou")

    # 空のcommentaryOsakaを持つファイルを収集
    empty_files = []

    for yaml_file in base_dir.glob("*.yaml"):
        if yaml_file.name == "law_metadata.yaml":
            continue

        try:
            with open(yaml_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            if data and data.get("commentaryOsaka") == []:
                empty_files.append({"path": yaml_file, "data": data})
        except Exception as e:
            print(f"Error reading {yaml_file}: {e}")
            continue

    print(f"空のcommentaryOsakaを持つファイル数: {len(empty_files)}")

    # 処理
    processed = 0
    for item in empty_files:
        try:
            data = item["data"]
            article_num = data.get("article", "")
            title = data.get("title", "")
            original_text = data.get("originalText", [])
            osaka_text = data.get("osakaText", [])

            # commentaryOsakaを生成
            new_commentary = generate_commentary(
                article_num, title, original_text, osaka_text
            )
            data["commentaryOsaka"] = new_commentary

            # ファイルに書き込み
            with open(item["path"], "w", encoding="utf-8") as f:
                yaml.dump(data, f, allow_unicode=True, sort_keys=False)

            processed += 1
            if processed % 100 == 0:
                print(f"処理済み: {processed}/{len(empty_files)}")

        except Exception as e:
            print(f"Error processing {item['path']}: {e}")
            continue

    print(f"完了: {processed}個のファイルにcommentaryOsakaを追加しました")
    return processed


if __name__ == "__main__":
    process_files()
