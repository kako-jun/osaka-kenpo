#!/usr/bin/env python3
"""
条文ファイル名とコードの命名規則統一スクリプト（完全版）

統一ルール:
- fusoku_1 → suppl-1
- suppl_1 → suppl-1  
- amendment_1 → amend-1
- sub_12a → sub-12a
"""

import os
import re
import shutil
from pathlib import Path

def rename_yaml_files(dry_run=True):
    """YAMLファイルをリネーム"""
    laws_dir = Path('src/data/laws')
    changes = []
    
    for yaml_file in laws_dir.rglob('*.yaml'):
        if yaml_file.name == 'law_metadata.yaml':
            continue
            
        old_name = yaml_file.stem
        new_name = None
        
        if old_name.startswith('fusoku_'):
            num = old_name.replace('fusoku_', '')
            new_name = f'suppl-{num}'
        elif old_name.startswith('suppl_'):
            num = old_name.replace('suppl_', '')
            new_name = f'suppl-{num}'
        elif old_name.startswith('amendment_'):
            num = old_name.replace('amendment_', '')
            new_name = f'amend-{num}'
        elif old_name.startswith('sub_'):
            suffix = old_name.replace('sub_', '')
            new_name = f'sub-{suffix}'
        
        if new_name and new_name != old_name:
            new_path = yaml_file.parent / f'{new_name}.yaml'
            changes.append((yaml_file, new_path))
    
    return changes

def update_code_files(dry_run=True):
    """コード内の参照を更新"""
    replacements = [
        # fusoku_
        (r"'fusoku_'", "'suppl-'"),
        (r'"fusoku_"', '"suppl-"'),
        (r'fusoku_', 'suppl-'),
        
        # suppl_
        (r"'suppl_'", "'suppl-'"),
        (r'"suppl_"', '"suppl-"'),
        (r"suppl_(\d+)", r"suppl-\1"),
        (r"\.startsWith\('suppl_'\)", ".startsWith('suppl-')"),
        (r'\.startsWith\("suppl_"\)', '.startsWith("suppl-")'),
        (r"\.replace\('suppl_', ''\)", ".replace('suppl-', '')"),
        (r'\.replace\("suppl_", ""\)', '.replace("suppl-", "")'),
        
        # amendment_
        (r"'amendment_'", "'amend-'"),
        (r'"amendment_"', '"amend-"'),
        (r"amendment_(\d+)", r"amend-\1"),
        (r"\.startsWith\('amendment_'\)", ".startsWith('amend-')"),
        (r'\.startsWith\("amendment_"\)', '.startsWith("amend-")'),
        (r"\.replace\('amendment_', ''\)", ".replace('amend-', '')"),
        (r'\.replace\("amendment_", ""\)', '.replace("amend-", "")'),
        
        # sub_
        (r"'sub_'", "'sub-'"),
        (r'"sub_"', '"sub-"'),
        (r"sub_(\w+)", r"sub-\1"),
    ]
    
    code_files = [
        'src/app/law/[law_category]/[law]/page.tsx',
        'src/lib/utils.ts',
        'src/lib/seo.ts',
        'src/components/StructuredData.tsx',
    ]
    
    changes = []
    
    for filepath in code_files:
        path = Path(filepath)
        if not path.exists():
            continue
            
        content = path.read_text(encoding='utf-8')
        new_content = content
        
        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, new_content)
        
        if new_content != content:
            changes.append((path, content, new_content))
    
    return changes

def main(dry_run=True):
    print("=" * 60)
    print("条文ファイル名・コード統一スクリプト")
    print("=" * 60)
    
    # 1. YAMLファイルのリネーム
    yaml_changes = rename_yaml_files(dry_run)
    
    print(f"\n📋 YAMLリネーム対象: {len(yaml_changes)}件\n")
    
    by_category = {}
    for old, new in yaml_changes:
        category = '/'.join(str(old.relative_to('src/data/laws')).split('/')[:2])
        by_category.setdefault(category, []).append((old.name, new.name))
    
    for category, files in sorted(by_category.items()):
        print(f"【{category}】 {len(files)}件")
        for old_name, new_name in files[:2]:
            print(f"  {old_name} → {new_name}")
        if len(files) > 2:
            print(f"  ... 他 {len(files)-2} 件")
    
    # 2. コードファイルの更新
    code_changes = update_code_files(dry_run)
    
    print(f"\n\n📝 コード更新対象: {len(code_changes)}ファイル\n")
    
    for path, old_content, new_content in code_changes:
        print(f"【{path}】")
        # 変更箇所を表示
        old_lines = old_content.split('\n')
        new_lines = new_content.split('\n')
        for i, (old_line, new_line) in enumerate(zip(old_lines, new_lines), 1):
            if old_line != new_line:
                print(f"  L{i}: {old_line.strip()[:60]}")
                print(f"    → {new_line.strip()[:60]}")
        print()
    
    if dry_run:
        print("\n⚠️  DRY RUN モード: 実際の変更は行いません")
        print("実行するには: python3 scripts/tools/unify-article-naming-full.py --execute")
        return
    
    # 実行
    print("\n🔄 実行中...\n")
    
    # YAMLリネーム
    for old_path, new_path in yaml_changes:
        shutil.move(str(old_path), str(new_path))
    print(f"✅ YAMLファイル {len(yaml_changes)}件 リネーム完了")
    
    # コード更新
    for path, old_content, new_content in code_changes:
        path.write_text(new_content, encoding='utf-8')
    print(f"✅ コードファイル {len(code_changes)}件 更新完了")
    
    print("\n✅ 全ての統一作業が完了しました！")

if __name__ == '__main__':
    import sys
    dry_run = '--execute' not in sys.argv
    main(dry_run=dry_run)
