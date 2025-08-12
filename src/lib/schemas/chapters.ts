import { z } from 'zod'

export const ChapterSchema = z.object({
  chapter: z.union([z.number().int().positive(), z.string().min(1)]),
  title: z.string().min(1, '章タイトルは必須です'),
  titleOsaka: z.string().min(1, '大阪弁章タイトルは必須です'),
  articles: z.array(z.union([z.number().int().positive(), z.string().min(1)])).min(1, '条文番号は必須です'),
  description: z.string().min(1, '説明は必須です'),
  descriptionOsaka: z.string().min(1, '大阪弁説明は必須です')
})

export const ChaptersSchema = z.object({
  chapters: z.array(ChapterSchema).min(1, '章データは必須です')
})

export type Chapter = z.infer<typeof ChapterSchema>
export type ChaptersData = z.infer<typeof ChaptersSchema>