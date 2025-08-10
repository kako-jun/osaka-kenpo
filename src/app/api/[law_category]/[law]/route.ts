import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: { law_category: string; law: string } }
) {
  const { law_category, law } = params;

  if (!law_category || !law) {
    return NextResponse.json({ error: 'Missing law category or law' }, { status: 400 });
  }

  const articlesDirectory = path.join(process.cwd(), 'src', 'data', 'laws', law_category, law);

  try {
    const files = await fs.readdir(articlesDirectory);
    const articleFiles = files.filter(file => file.endsWith('.json'));

    const articlesData = await Promise.all(articleFiles.map(async (fileName) => {
      const articleId = fileName.replace('.json', '');
      const filePath = path.join(articlesDirectory, fileName);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      return { article: articleId, title: data.title };
    }));

    // 記事番号でソート
    articlesData.sort((a, b) => parseInt(a.article) - parseInt(b.article));

    return NextResponse.json(articlesData);
  } catch (error) {
    console.error(`Error reading articles for ${law_category}/${law}:`, error);
    return NextResponse.json(
      { error: `Could not load articles for ${law_category}/${law}`, details: (error as Error).message },
      { status: 500 }
    );
  }
}
