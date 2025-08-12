import React from 'react'

// 期間・割合・数字関係のルールのみ
const IMPORTANT_KEYWORDS = [
  // 期間・任期（「とする」「である」「間」「以内」等の文脈）
  /(\d+)年とする/g,
  /(\d+)ヶ月とする/g,
  /(\d+)日とする/g,
  /(\d+)年である/g,
  /(\d+)ヶ月である/g,
  /(\d+)日である/g,
  /(\d+)年間/g,
  /(\d+)ヶ月間/g,
  /(\d+)日間/g,
  /(\d+)週間/g,
  /(\d+)時間/g,
  
  // 期間制限（「以内」「以下」「未満」等）
  /(\d+)日以内/g,
  /(\d+)ヶ月以内/g,
  /(\d+)年以内/g,
  /(\d+)週間以内/g,
  /(\d+)時間以内/g,
  /(\d+)日以下/g,
  /(\d+)ヶ月以下/g,
  /(\d+)年以下/g,
  
  // 期間表現（漢数字と算用数字の組み合わせ）
  /[一二三四五六七八九十百千万]+年/g,
  /[一二三四五六七八九十百千万]+ヶ月/g,
  /[一二三四五六七八九十百千万]+カ月/g,
  /[一二三四五六七八九十百千万]+か月/g,
  /[一二三四五六七八九十百千万]+日/g,
  /[一二三四五六七八九十百千万]+週間/g,
  /[一二三四五六七八九十百千万]+時間/g,
  
  // 分数・割合（包括的パターン）
  /[一二三四五六七八九十百千万]+分の[一二三四五六七八九十百千万]+以上/g,
  /[一二三四五六七八九十百千万]+分の[一二三四五六七八九十百千万]+/g,
  /過半数/g,
  /半数以上/g,
  /半数/g,
  /全員/g,
  /満場一致/g,
  
  // 回数・度数・人数（包括的パターン）
  /[一二三四五六七八九十百千万]+回/g,
  /[一二三四五六七八九十百千万]+人以上/g,
  /[一二三四五六七八九十百千万]+人/g,
  /(\d+)回/g,
  /(\d+)人以上/g,
  /(\d+)人/g,
  
  // 角度・温度（地理的座標や一般的な温度・角度は除外し、法的文脈のみ）
  // 現在は度数のハイライトを無効化
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
  
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  
  // 正規表現のマッチを順次処理
  while ((match = keywordPattern.exec(text)) !== null) {
    // マッチ前のテキストを追加
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    
    // ハイライト対象のキーワードを追加
    parts.push(
      <span 
        key={parts.length}
        style={{
          backgroundColor: '#fef3c7',
          color: '#92400e', 
          padding: '2px 4px',
          borderRadius: '4px',
          fontWeight: '600'
        }}
      >
        {match[0]}
      </span>
    )
    
    lastIndex = keywordPattern.lastIndex
  }
  
  // 最後の部分を追加
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  
  return parts.length > 1 ? parts : text
}