#!/bin/bash

commits=("97b6c8c3" "31c6d664" "3b1db073" "b4ff4e81" "03cc8434")

echo "問題のあるファイル一覧:" > /tmp/problem_files.txt

for commit in "${commits[@]}"; do
  echo "チェック中: $commit"
  
  # commentaryOsakaで2行以上削除されたファイルを検出
  git diff $commit^..$commit | grep -B 5 "^-.*commentaryOsaka" | grep "^diff --git" | awk '{print $3}' | sed 's|a/||' | while read file; do
    # そのファイルで実際に2行以上の削除があるか確認
    deleted_lines=$(git diff $commit^..$commit -- "$file" | grep "^-" | grep -v "^---" | wc -l)
    if [ "$deleted_lines" -ge 2 ]; then
      echo "$file"
      echo "$file" >> /tmp/problem_files.txt
    fi
  done
done

cat /tmp/problem_files.txt | sort | uniq
