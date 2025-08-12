// 年度フォーマット用のユーティリティ関数

export function formatLawYear(year: number | null): string {
  if (year === null) return '年不明'
  if (year < 0) return `紀元前${Math.abs(year)}年`
  return `${year}年`
}