#!/usr/bin/env python3
"""
刑法の全条文YAMLファイルを春日歩スタイルに改善するスクリプト（改良版）

改善内容：
1. osakaText: バリエーション豊かな語尾に変更
2. commentaryOsaka: 身近な例え話を追加、長さを拡充（3-6文程度）
"""

import os
import re
import yaml
import random
from pathlib import Path

class OsakaBenConverter:
    """大阪弁変換クラス"""

    def __init__(self):
        # 語尾パターンのバリエーション
        self.ending_patterns = {
            r'する。$': ['するんや。', 'するで。', 'するねん。', 'するんやで。', 'しよる。'],
            r'します。$': ['するんや。', 'するで。', 'するねん。'],
            r'である。$': ['や。', 'やで。', 'やねん。', 'やな。', 'なんや。'],
            r'です。$': ['や。', 'やで。', 'やねん。', 'やな。'],
            r'だ。$': ['や。', 'やで。', 'やねん。'],
            r'しない。$': ['せえへん。', 'あらへん。', 'ないで。', 'せんで。'],
            r'ない。$': ['あらへん。', 'ないで。', 'ないねん。', 'へん。'],
            r'しなければならない。$': ['せなあかん。', 'せなあかんねん。', 'なあかん。', 'せんとあかん。'],
            r'しなければなりません。$': ['せなあかん。', 'せなあかんねん。', 'なあかん。'],
            r'してはならない。$': ['したらあかん。', 'したらあかんで。', 'しちゃあかん。', 'しちゃあかんねん。'],
            r'することができる。$': ['できるんや。', 'できるで。', 'できるねん。', 'できよる。'],
            r'できる。$': ['できるんや。', 'できるで。', 'できるねん。'],
            r'される。$': ['されるんや。', 'されるで。', 'されるねん。', 'されよる。'],
            r'れる。$': ['れるんや。', 'れるで。', 'れるねん。'],
            r'ある。$': ['あるんや。', 'あるで。', 'あるねん。', 'あるやろ。'],
            r'いる。$': ['おるんや。', 'おるで。', 'おるねん。', 'おるやろ。'],
            r'なる。$': ['なるんや。', 'なるで。', 'なるねん。', 'なるやろ。'],
            r'という。$': ['っちゅうんや。', 'っちゅうで。', 'っちゅうねん。', 'ていうんや。'],
            r'とする。$': ['とするんや。', 'とするで。', 'とするねん。'],
            r'とされる。$': ['とされるんや。', 'とされるで。', 'とされるねん。'],
            r'いう。$': ['いうんや。', 'いうで。', 'いうねん。', 'ゆうんや。'],
            r'せよ。$': ['せえ。', 'しい。', 'せなあかん。'],
            r'しろ。$': ['しい。', 'せえ。', 'せなあかん。'],
        }

        # 使用済み語尾パターンの記録（ワンパターン回避）
        self.used_patterns = []

    def convert_ending(self, text):
        """語尾を大阪弁に変換（バリエーション豊か）"""
        for pattern, replacements in self.ending_patterns.items():
            if re.search(pattern, text):
                # 最近使ったパターンを避ける
                available = [r for r in replacements]
                if len(self.used_patterns) > 0:
                    last_used = self.used_patterns[-1] if len(self.used_patterns) > 0 else None
                    available = [r for r in replacements if r != last_used]

                if not available:
                    available = replacements

                chosen = random.choice(available)
                self.used_patterns.append(chosen)

                # 履歴が長くなりすぎないよう制限
                if len(self.used_patterns) > 10:
                    self.used_patterns.pop(0)

                return re.sub(pattern, chosen, text)

        return text

    def improve_osaka_text(self, original_lines):
        """osakaTextを改善（バリエーション豊かな語尾）"""
        if not original_lines:
            return []

        improved = []
        for line in original_lines:
            new_line = self.convert_ending(line)
            improved.append(new_line)

        return improved

    def improve_commentary_osaka(self, original_text_lines, commentary_lines, commentary_osaka_lines, article_num, title):
        """commentaryOsakaを改善（身近な例え話を追加、長さを拡充）"""
        if not commentary_osaka_lines:
            return []

        # 既存の解説を取得
        existing = '\n'.join(commentary_osaka_lines) if isinstance(commentary_osaka_lines, list) else commentary_osaka_lines

        # 各段落を処理
        improved_paragraphs = []

        for para in commentary_osaka_lines:
            # 語尾をバリエーション豊かに
            improved_para = self.convert_ending(para)

            # 短すぎる場合（200文字未満）は拡充
            if len(para) < 200:
                # 条文の内容に応じた例え話を追加
                example = self._generate_example(original_text_lines, title, article_num)
                if example:
                    improved_para = improved_para + " " + example

            improved_paragraphs.append(improved_para)

        # 全体が短すぎる場合（3文未満）は追加の例え話を挿入
        total_length = sum(len(p) for p in improved_paragraphs)
        if total_length < 300:
            additional = self._generate_additional_explanation(title, article_num)
            if additional:
                improved_paragraphs.append(additional)

        return improved_paragraphs

    def _generate_example(self, original_text, title, article_num):
        """条文の内容に応じた例え話を生成"""
        # タイトルや内容から適切な例を生成
        original_full = '\n'.join(original_text) if isinstance(original_text, list) else original_text

        # キーワードベースで例を選択
        examples = {
            '殺人': "例えばな、どんなに怒っても、人の命を奪うっちゅうのは絶対あかんねん。一瞬の感情で取り返しのつかんことになるんやで。",
            '傷害': "例えば、喧嘩になって相手を殴ってケガさせたら、この傷害罪になるんやで。カッとなる気持ちは分かるけど、手を出したらあかんねん。",
            '窃盗': "例えば、コンビニで商品をポケットに入れて出たら、それは立派な窃盗や。「ちょっとくらいええやろ」は通用せえへんで。",
            '詐欺': "例えば、嘘ついて人からお金を騙し取ったら、これは詐欺罪や。「後で返すつもりやった」言うても、最初から嘘ついとったらアウトやねん。",
            '横領': "例えば、会社のお金を勝手に使い込んだら横領や。「ちょっと借りただけ」言うても、許可なく使ったらあかんねん。",
            '放火': "例えば、ムカついて家に火をつけたら、これは放火罪や。火事っちゅうのは周りの人も巻き込む危険な犯罪やねん。",
            '脅迫': "例えば、「言うこと聞かんかったら痛い目に遭わすぞ」って脅したら、これは脅迫罪や。冗談のつもりでも、相手が怖がったらアウトやで。",
            '強盗': "例えば、ナイフ持ってコンビニに押し入って金を奪ったら強盗や。脅して奪うっちゅうのは、めちゃくちゃ重い罪やねん。",
            '住居侵入': "例えば、勝手に人の家に入り込んだら、これは住居侵入罪や。「玄関開いてたから」は言い訳にならへんで。",
            '名誉毀損': "例えば、SNSで嘘の悪口を書いて人の評判を傷つけたら名誉毀損や。ネットでも犯罪は犯罪やで。",
        }

        # タイトルや本文からキーワードマッチ
        for keyword, example in examples.items():
            if keyword in title or keyword in original_full:
                return example

        # デフォルトの例
        default_examples = [
            "日常生活でも、法律のルールは身近にあるんやで。知らんかったでは済まされへんから、しっかり理解しとかなあかんねん。",
            "法律っちゅうのは、みんなが安心して暮らせるための約束事やねん。難しそうに見えるけど、要は「人に迷惑かけたらあかん」ってことやな。",
            "この条文は、社会のルールを守るために大事なもんやねん。一人一人が気をつけることで、みんなが幸せに暮らせるんやで。",
            "法律の本質っちゅうのは、「他人の権利を尊重する」ことやねん。自分がされて嫌なことは人にもしたらあかんっちゅうことやな。",
        ]
        return random.choice(default_examples)

    def _generate_additional_explanation(self, title, article_num):
        """追加の解説を生成"""
        additions = [
            "法律は難しそうやけど、結局は「人として当たり前のこと」を守るための決まりなんやな。ルールを守ることで、みんなが安心して暮らせるんやで。",
            "この条文も、社会で人と人が関わり合う中で、トラブルを防ぐために大事なルールやねん。一人一人が意識することが大切やで。",
            "法律の背景には、「みんなが幸せに暮らせるように」っちゅう思いがあるんやな。堅苦しいようで、実は優しい仕組みなんやで。",
            "条文の言葉は難しいけど、要するに「相手を尊重して、ルールを守ろうな」ってことやねん。それができたら、社会は平和やで。",
        ]
        return random.choice(additions)

def process_yaml_file(file_path, converter):
    """YAMLファイルを読み込み、改善して保存"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)

        if not data:
            return False

        # osakaTextを改善
        if 'osakaText' in data and data['osakaText']:
            data['osakaText'] = converter.improve_osaka_text(data['osakaText'])

        # commentaryOsakaを改善
        if 'commentaryOsaka' in data and data['commentaryOsaka']:
            article = data.get('article', '')
            title = data.get('title', '')
            original_text = data.get('originalText', [])
            commentary = data.get('commentary', [])

            data['commentaryOsaka'] = converter.improve_commentary_osaka(
                original_text,
                commentary,
                data['commentaryOsaka'],
                article,
                title
            )

        # YAMLファイルに書き戻し
        with open(file_path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

        return True

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """メイン処理"""
    keihou_dir = Path('/home/user/osaka-kenpo/src/data/laws/jp/keihou')

    # 条文番号のYAMLファイルのみを対象
    yaml_files = sorted([
        f for f in keihou_dir.glob('*.yaml')
        if f.name not in ['law_metadata.yaml'] and re.match(r'^\d+\.yaml$', f.name)
    ], key=lambda x: int(x.stem))

    print(f"Found {len(yaml_files)} article files to process")

    converter = OsakaBenConverter()
    processed = 0
    errors = []

    for yaml_file in yaml_files:
        if process_yaml_file(yaml_file, converter):
            processed += 1
            if processed % 10 == 0:
                print(f"Processed {processed}/{len(yaml_files)} files...")
        else:
            errors.append(yaml_file.name)

    print(f"\n{'='*60}")
    print(f"Completed!")
    print(f"{'='*60}")
    print(f"Successfully processed: {processed}/{len(yaml_files)} files")
    if errors:
        print(f"Errors in: {', '.join(errors)}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
