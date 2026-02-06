/**
 * テキストを段落配列に分割する
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [''];
  return text
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * 旧形式のJSONデータを新形式に変換する
 * @param rawData 旧形式のJSONデータ
 * @returns 新形式のデータ
 */
export function transformLegacyJsonData(rawData: {
  article: string | number;
  title?: string;
  titleOsaka?: string;
  original: string;
  osaka: string;
  commentary: string;
  commentaryOsaka?: string;
}): {
  article: string | number;
  title: string;
  titleOsaka?: string;
  originalText: string[];
  osakaText: string[];
  commentary: string[];
  commentaryOsaka?: string[];
} {
  return {
    article: rawData.article,
    title: rawData.title || '',
    ...(rawData.titleOsaka && { titleOsaka: rawData.titleOsaka }),
    originalText: splitIntoParagraphs(rawData.original),
    osakaText: splitIntoParagraphs(rawData.osaka),
    commentary: splitIntoParagraphs(rawData.commentary),
    ...(rawData.commentaryOsaka && {
      commentaryOsaka: splitIntoParagraphs(rawData.commentaryOsaka),
    }),
  };
}
