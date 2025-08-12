import { z } from 'zod'

export const FamousArticlesSchema = z.record(z.string().regex(/^\d+$/, '記事番号は数字文字列である必要があります'), z.string().min(1, '記事タイトルは必須です'))

export type FamousArticles = z.infer<typeof FamousArticlesSchema>