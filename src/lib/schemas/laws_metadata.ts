import { z } from 'zod'

export const LawItemSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  status: z.enum(['available', 'preparing']).default('preparing')
})

export const CategorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().min(1),
  laws: z.array(LawItemSchema)
})

export const LawsMetadataSchema = z.object({
  categories: z.array(CategorySchema).min(1, 'カテゴリは必須です')
})

export type LawItem = z.infer<typeof LawItemSchema>
export type Category = z.infer<typeof CategorySchema>
export type LawsMetadata = z.infer<typeof LawsMetadataSchema>