import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export async function GET() {
  try {
    const progressPath = path.join(process.cwd(), '.claude', 'roppou-progress.yaml');
    const fileContent = fs.readFileSync(progressPath, 'utf8');
    const progressData = yaml.load(fileContent);

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error loading roppou progress:', error);
    return NextResponse.json(
      { error: 'Failed to load progress data' },
      { status: 500 }
    );
  }
}
