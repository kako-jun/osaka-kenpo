/**
 * 法律の設定データを動的に取得するユーティリティ
 */

export interface LawSource {
  name: string
  source: string
  description: string
  links?: Array<{
    text: string
    url: string
  }>
}

export interface ChapterInfo {
  chapter: number
  title: string
  titleOsaka?: string
  articles: number[]
  description: string
  descriptionOsaka?: string
}

export interface ChaptersData {
  chapters: ChapterInfo[]
}

/**
 * 指定された法律の出典情報を取得する
 * @param lawCategory - 法律カテゴリ（例: 'jp', 'foreign_old'）
 * @param lawName - 法律名（例: 'constitution', 'magna_carta'）
 * @returns 出典情報またはnull（ファイルが存在しない場合）
 */
export async function getLawSource(
  lawCategory: string, 
  lawName: string
): Promise<LawSource | null> {
  try {
    const lawSource = await import(`@/data/laws/${lawCategory}/${lawName}/law-source.json`)
    return lawSource.default as LawSource
  } catch (error) {
    return null
  }
}

/**
 * 指定された法律の章構成情報を取得する
 * @param lawCategory - 法律カテゴリ（例: 'jp', 'foreign_old'）
 * @param lawName - 法律名（例: 'constitution'）
 * @returns 章構成情報またはnull（ファイルが存在しない場合）
 */
export async function getChapters(
  lawCategory: string, 
  lawName: string
): Promise<ChaptersData | null> {
  try {
    const chapters = await import(`@/data/laws/${lawCategory}/${lawName}/chapters.json`)
    return chapters.default as ChaptersData
  } catch (error) {
    return null
  }
}