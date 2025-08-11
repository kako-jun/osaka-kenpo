import React from 'react'

// 期間・割合・数字関係のルールのみ
const IMPORTANT_KEYWORDS = [
  // 期間・日数
  /(\d+)日以内/g,
  /(\d+)ヶ月以内/g,
  /(\d+)年以内/g,
  /(\d+)週間以内/g,
  /(\d+)時間以内/g,
  
  // 割合・数量
  /三分の二以上/g,
  /三分の二/g,
  /三分の一以上/g,
  /三分の一/g,
  /四分の三以上/g,
  /四分の三/g,
  /五分の四/g,
  /過半数/g,
  /半数以上/g,
  /半数/g,
  /全員/g,
  /満場一致/g,
  
  // 数値的な条件
  /(\d+)人以上/g,
  /(\d+)人/g,
  /(\d+)回/g,
  /(\d+)度/g,
  /(\d+)%/g,
  /(\d+)パーセント/g,
]

/**
 * 大阪弁テキストの重要キーワードをハイライトする
 * @param text - ハイライト対象のテキスト  
 * @returns ハイライト済みのReact要素
 */
export function highlightKeywords(text: string): React.ReactNode {
  if (!text) return text
  
  // 全てのキーワードを統合した正規表現を作成
  const keywordPattern = new RegExp(`(${IMPORTANT_KEYWORDS.map(p => p.source).join('|')})`, 'g')
  
  // テキストを分割
  const parts = text.split(keywordPattern)
  
  return parts.map((part, index) => {
    // キーワードにマッチするかチェック
    if (IMPORTANT_KEYWORDS.some(pattern => pattern.test(part))) {
      return (
        <span 
          key={index}
          style={{
            backgroundColor: '#fef3c7',
            color: '#92400e', 
            padding: '2px 4px',
            borderRadius: '4px',
            fontWeight: '600'
          }}
        >
          {part}
        </span>
      )
    }
    return part
  })
}