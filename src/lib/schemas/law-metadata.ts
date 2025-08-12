import { z } from 'zod'

export const LinkSchema = z.object({
  text: z.string().min(1),
  url: z.string().url()
})

export const LawMetadataSchema = z.object({
  name: z.string().min(1, '法律名は必須です'),
  year: z.number().int(),
  source: z.string().min(1, '出典は必須です'),
  description: z.string().min(1, '説明は必須です'),
  links: z.array(LinkSchema).optional()
})

export type LawMetadata = z.infer<typeof LawMetadataSchema>
export type Link = z.infer<typeof LinkSchema>