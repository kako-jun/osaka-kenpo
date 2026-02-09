#!/usr/bin/env python3
"""
Nostalgic バッチ登録用のIDリスト生成スクリプト

生成されるID形式: osaka-kenpo-{category}-{law}-{article}
"""

import json
from pathlib import Path

def generate_nostalgic_ids():
    """全条文のNostalgic IDを生成"""
    laws_dir = Path('src/data/laws')
    ids = []
    
    for yaml_file in laws_dir.rglob('*.yaml'):
        if yaml_file.name == 'law_metadata.yaml':
            continue
        
        parts = yaml_file.relative_to(laws_dir).parts
        if len(parts) < 3:
            continue
            
        category = parts[0]
        law = parts[1]
        article = yaml_file.stem
        
        nostalgic_id = f"osaka-kenpo-{category}-{law}-{article}"
        ids.append(nostalgic_id)
    
    return sorted(ids)

def main():
    print("Nostalgic バッチ登録用IDリスト生成中...")
    
    ids = generate_nostalgic_ids()
    
    print(f"\n✅ 生成完了: {len(ids):,}件の条文ID\n")
    
    # 統計表示
    by_category = {}
    for nostalgic_id in ids:
        parts = nostalgic_id.split('-')
        if len(parts) >= 3:
            category = parts[2]  # osaka-kenpo-{category}
            by_category[category] = by_category.get(category, 0) + 1
    
    print("【カテゴリ別集計】")
    for category, count in sorted(by_category.items()):
        print(f"  {category:15s}: {count:5,}件")
    
    # サンプル表示
    print("\n【サンプルID (最初10件)】")
    for nostalgic_id in ids[:10]:
        print(f"  {nostalgic_id}")
    
    # JSON出力
    output_file = Path('nostalgic-batch-ids.json')
    output_file.write_text(json.dumps(ids, indent=2, ensure_ascii=False))
    print(f"\n💾 保存: {output_file} ({len(ids):,}件)")
    
    # テキスト出力（1行1ID）
    output_txt = Path('nostalgic-batch-ids.txt')
    output_txt.write_text('\n'.join(ids))
    print(f"💾 保存: {output_txt} ({len(ids):,}件)")
    
    print("\n【次のステップ】")
    print("1. Nostalgic API のバッチ登録エンドポイントを確認")
    print("2. トークン 'ekumeteroesnu' を使用して登録")
    print("3. curl または Node.js スクリプトで実行")

if __name__ == '__main__':
    main()
