#!/usr/bin/env python3
"""
全法律の実際の状態を確認するスクリプト
ファイル数と各Stageの完成度を正確にカウント
"""

import os
import yaml
from pathlib import Path
from collections import defaultdict

def check_law_directory(law_dir):
    """法律ディレクトリの実際の状態をチェック"""
    if not os.path.exists(law_dir):
        return None

    yaml_files = [f for f in os.listdir(law_dir)
                  if f.endswith('.yaml') and f != 'law_metadata.yaml']

    total_files = len(yaml_files)
    stage1 = 0  # originalText が空でない
    stage2 = 0  # commentary が空でない
    stage3 = 0  # osakaText が空でない
    stage4 = 0  # commentaryOsaka が空でない

    for yaml_file in yaml_files:
        filepath = os.path.join(law_dir, yaml_file)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)

            # Stage 1: originalText（削除条文は除外）
            if data.get('originalText') and len(data['originalText']) > 0:
                if not (len(data['originalText']) == 1 and data['originalText'][0] == '削除'):
                    stage1 += 1

            # Stage 2: commentary
            if data.get('commentary') and len(data['commentary']) > 0:
                stage2 += 1

            # Stage 3: osakaText
            if data.get('osakaText') and len(data['osakaText']) > 0:
                stage3 += 1

            # Stage 4: commentaryOsaka
            if data.get('commentaryOsaka') and len(data['commentaryOsaka']) > 0:
                stage4 += 1

        except Exception as e:
            print(f"  ⚠️ エラー: {yaml_file} - {e}")

    return {
        'total': total_files,
        'stage1': stage1,
        'stage2': stage2,
        'stage3': stage3,
        'stage4': stage4
    }

def main():
    base_dir = Path(__file__).parent.parent / 'src' / 'data' / 'laws'

    # 日本の法律
    jp_laws = {
        'constitution': '日本国憲法',
        'minpou': '民法',
        'shouhou': '商法',
        'kaisya_hou': '会社法',
        'keihou': '刑法',
        'minji_soshou_hou': '民事訴訟法',
        'keiji_soshou_hou': '刑事訴訟法',
        'ai_suishin_hou': 'AI基本法'
    }

    # 日本歴史法
    jp_old_laws = {
        'jushichijo_kenpo': '十七条憲法',
        'taiho_ritsuryo': '大宝律令',
        'goseibai_shikimoku': '御成敗式目',
        'konden_einen_shizai_hou': '墾田永年私財法',
        'buke_shohatto': '武家諸法度',
        'kinchu_kuge_shohatto': '禁中並公家諸法度',
        'shourui_awaremi_no_rei': '生類憐みの令',
        'gokajou_no_goseimon': '五箇条の御誓文',
        'meiji_kenpo': '明治憲法'
    }

    # 外国現行法
    foreign_laws = {
        'german_basic_law': 'ドイツ基本法',
        'us_constitution': 'アメリカ憲法',
        'prc_constitution': '中国憲法'
    }

    # 外国歴史法
    foreign_old_laws = {
        'hammurabi_code': 'ハンムラビ法典',
        'magna_carta': 'マグナ・カルタ',
        'corpus_iuris_civilis': 'ローマ法大全',
        'bill_of_rights': '権利章典',
        'weimarer_verfassung': 'ワイマール憲法',
        'napoleonic_code': 'ナポレオン法典'
    }

    # 国際条約
    treaties = {
        'antarctic_treaty': '南極条約',
        'ramsar_convention': 'ラムサール条約',
        'un_charter': '国連憲章',
        'npt': '核兵器不拡散条約',
        'outer_space_treaty': '宇宙条約',
        'universal_postal_convention': '万国郵便条約',
        'olympic_charter': 'オリンピック憲章',
        'prime_meridian_conference': '本初子午線会議',
        'road_signs_convention': '道路標識条約',
        'metre_convention': 'メートル条約',
        'itu_constitution': 'ITU憲章',
        'unclos': '海洋法条約',
        'chicago_convention': 'シカゴ条約',
        'extradition_treaty': '日米引渡条約',
        'who_constitution': 'WHO憲章'
    }

    all_categories = [
        ('日本現行法', 'jp', jp_laws),
        ('日本歴史法', 'jp_old', jp_old_laws),
        ('外国現行法', 'foreign', foreign_laws),
        ('外国歴史法', 'foreign_old', foreign_old_laws),
        ('国際条約', 'treaty', treaties)
    ]

    print("=" * 80)
    print("📊 全法律の実際の状態チェック")
    print("=" * 80)
    print()

    grand_total = defaultdict(int)

    for category_name, category_dir, laws in all_categories:
        print(f"\n{'='*80}")
        print(f"📁 {category_name}")
        print(f"{'='*80}")

        category_total = defaultdict(int)

        for law_id, law_name in laws.items():
            law_dir = base_dir / category_dir / law_id
            result = check_law_directory(law_dir)

            if result is None:
                print(f"  ❌ {law_name}: ディレクトリなし")
                continue

            if result['total'] == 0:
                print(f"  ⚠️  {law_name}: 0条")
                continue

            print(f"  ✅ {law_name}: {result['total']}条")
            print(f"     Stage1: {result['stage1']}/{result['total']} ({result['stage1']/result['total']*100:.1f}%)")

            if result['stage3'] > 0:
                print(f"     Stage3: {result['stage3']}/{result['total']} ({result['stage3']/result['total']*100:.1f}%)")
            if result['stage4'] > 0:
                print(f"     Stage4: {result['stage4']}/{result['total']} ({result['stage4']/result['total']*100:.1f}%)")

            for key in ['total', 'stage1', 'stage2', 'stage3', 'stage4']:
                category_total[key] += result[key]
                grand_total[key] += result[key]

        print(f"\n  📊 {category_name}合計:")
        print(f"     総条文数: {category_total['total']}条")
        print(f"     Stage1: {category_total['stage1']}条 ({category_total['stage1']/category_total['total']*100:.1f}%)")
        if category_total['stage3'] > 0:
            print(f"     Stage3: {category_total['stage3']}条 ({category_total['stage3']/category_total['total']*100:.1f}%)")
        if category_total['stage4'] > 0:
            print(f"     Stage4: {category_total['stage4']}条 ({category_total['stage4']/category_total['total']*100:.1f}%)")

    print(f"\n{'='*80}")
    print(f"📊 全体合計")
    print(f"{'='*80}")
    print(f"総条文数: {grand_total['total']}条")
    print(f"Stage1完成: {grand_total['stage1']}条 ({grand_total['stage1']/grand_total['total']*100:.1f}%)")
    print(f"Stage2完成: {grand_total['stage2']}条 ({grand_total['stage2']/grand_total['total']*100:.1f}%)")
    print(f"Stage3完成: {grand_total['stage3']}条 ({grand_total['stage3']/grand_total['total']*100:.1f}%)")
    print(f"Stage4完成: {grand_total['stage4']}条 ({grand_total['stage4']/grand_total['total']*100:.1f}%)")
    print()

if __name__ == '__main__':
    main()
