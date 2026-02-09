#!/usr/bin/env python3
"""
ドイツ基本法の条文番号を公式表記に修正

修正内容:
sub-12a.yaml → 12a.yaml (54件)

根拠: ドイツ公式サイト gesetze-im-internet.de の表記が「Art 12a」
"""

import shutil
from pathlib import Path

def fix_german_articles(dry_run=True):
    """ドイツ基本法のsub-接頭辞を削除"""
    german_law_dir = Path('src/data/laws/world/german_basic_law')
    
    if not german_law_dir.exists():
        print("❌ ドイツ基本法のディレクトリが見つかりません")
        return []
    
    changes = []
    
    for yaml_file in german_law_dir.glob('sub-*.yaml'):
        old_name = yaml_file.stem  # 例: sub-12a
        new_name = old_name.replace('sub-', '')  # 例: 12a
        new_path = yaml_file.parent / f'{new_name}.yaml'
        
        changes.append((yaml_file, new_path))
    
    if not changes:
        print("✅ 修正が必要なファイルはありません")
        return []
    
    print(f"\n📋 リネーム対象: {len(changes)}件\n")
    
    for old_path, new_path in sorted(changes)[:10]:
        print(f"  {old_path.name} → {new_path.name}")
    
    if len(changes) > 10:
        print(f"  ... 他 {len(changes)-10} 件")
    
    if dry_run:
        print("\n⚠️  DRY RUN モード: 実際のリネームは行いません")
        print("実行するには: python3 scripts/tools/fix-german-articles.py --execute")
        return []
    
    # 実際にリネーム
    print("\n🔄 リネーム実行中...")
    for old_path, new_path in changes:
        shutil.move(str(old_path), str(new_path))
    
    print(f"\n✅ 完了: {len(changes)}件のファイルをリネームしました")
    
    # コード内のsub-参照もチェック
    print("\n📝 コード内の参照チェック...")
    print("  src/lib/utils.ts を確認してください")
    print("  startsWith('sub-') の処理を削除する必要があります")
    
    return changes

if __name__ == '__main__':
    import sys
    dry_run = '--execute' not in sys.argv
    fix_german_articles(dry_run=dry_run)
