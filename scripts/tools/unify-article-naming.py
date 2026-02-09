#!/usr/bin/env python3
"""
条文ファイル名の命名規則統一スクリプト

【統一ルール: ハイブリッド統一案（案C）】
- 通常条文: 123.yaml
- 枝番条文: 121-2.yaml (現状維持)
- 附則: suppl-1.yaml (suppl_1 → suppl-1)
- 修正条項: amend-1.yaml (amendment_1 → amend-1)
- 副条項: sub-12a.yaml (sub_12a → sub-12a)

【変更対象】
1. fusoku_1 → suppl-1 (AI基本法)
2. suppl_1 → suppl-1 (全六法)
3. amendment_1 → amend-1 (アメリカ憲法)
4. sub_12a → sub-12a (ドイツ基本法)
"""

import os
import shutil
from pathlib import Path

def rename_articles(dry_run=True):
    """条文ファイルをリネーム"""
    laws_dir = Path('src/data/laws')
    changes = []
    
    for yaml_file in laws_dir.rglob('*.yaml'):
        if yaml_file.name == 'law_metadata.yaml':
            continue
            
        old_name = yaml_file.stem
        new_name = None
        
        # fusoku_N → suppl-N
        if old_name.startswith('fusoku_'):
            num = old_name.replace('fusoku_', '')
            new_name = f'suppl-{num}'
        
        # suppl_N → suppl-N
        elif old_name.startswith('suppl_'):
            num = old_name.replace('suppl_', '')
            new_name = f'suppl-{num}'
        
        # amendment_N → amend-N
        elif old_name.startswith('amendment_'):
            num = old_name.replace('amendment_', '')
            new_name = f'amend-{num}'
        
        # sub_Na → sub-Na
        elif old_name.startswith('sub_'):
            suffix = old_name.replace('sub_', '')
            new_name = f'sub-{suffix}'
        
        if new_name and new_name != old_name:
            new_path = yaml_file.parent / f'{new_name}.yaml'
            changes.append((yaml_file, new_path))
    
    if not changes:
        print("✅ リネームが必要なファイルはありません")
        return []
    
    print(f"\n📋 リネーム対象: {len(changes)}件\n")
    
    # カテゴリ別に集計
    by_category = {}
    for old, new in changes:
        category = str(old.relative_to(laws_dir)).split('/')[0:2]
        category_key = '/'.join(category)
        if category_key not in by_category:
            by_category[category_key] = []
        by_category[category_key].append((old.name, new.name))
    
    for category, files in sorted(by_category.items()):
        print(f"【{category}】 {len(files)}件")
        for old_name, new_name in files[:3]:
            print(f"  {old_name} → {new_name}")
        if len(files) > 3:
            print(f"  ... 他 {len(files)-3} 件")
        print()
    
    if dry_run:
        print("⚠️  DRY RUN モード: 実際のリネームは行いません")
        print("実行するには: python3 scripts/tools/unify-article-naming.py --execute")
        return []
    
    # 実際にリネーム
    print("🔄 リネーム実行中...")
    for old_path, new_path in changes:
        shutil.move(str(old_path), str(new_path))
        print(f"✅ {old_path.name} → {new_path.name}")
    
    print(f"\n✅ 完了: {len(changes)}件のファイルをリネームしました")
    return changes

if __name__ == '__main__':
    import sys
    dry_run = '--execute' not in sys.argv
    rename_articles(dry_run=dry_run)
