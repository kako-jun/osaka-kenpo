import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { LawsMetadataSchema } from '@/lib/schemas/laws_metadata'

export async function GET(request: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'src/data')
    const metadataPath = path.join(dataDir, 'laws_metadata.yaml')
    
    if (!fs.existsSync(metadataPath)) {
      return NextResponse.json({ error: 'Metadata not found' }, { status: 404 })
    }
    
    const yamlContent = fs.readFileSync(metadataPath, 'utf-8')
    const data = yaml.load(yamlContent)
    
    const validatedData = LawsMetadataSchema.parse(data)
    return NextResponse.json(validatedData)
  } catch (error) {
    console.error('Failed to load laws metadata:', error)
    return NextResponse.json({ error: 'Failed to load metadata' }, { status: 500 })
  }
}