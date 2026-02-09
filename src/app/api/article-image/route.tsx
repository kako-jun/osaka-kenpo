import { ImageResponse } from 'next/og';
import { getArticle, getLawMetadata } from '@/lib/db';

export const runtime = 'edge';

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const law = searchParams.get('law');
  const article = searchParams.get('article');
  const widthParam = searchParams.get('width');

  if (!category || !law || !article) {
    return new Response('category, law, article are required', { status: 400 });
  }

  const width = Math.min(1920, Math.max(320, Number(widthParam) || 1080));

  // D1からデータ取得
  let articleRow, lawMetadata;
  try {
    [articleRow, lawMetadata] = await Promise.all([
      getArticle(category, law, article),
      getLawMetadata(category, law),
    ]);
  } catch {
    return new Response('Database error', { status: 500 });
  }

  if (!articleRow) {
    return new Response('Article not found', { status: 404 });
  }

  const lawName = lawMetadata?.short_name || lawMetadata?.display_name || law;

  // テキストを解析
  let osakaText: string[] = [];
  let commentaryOsaka: string[] = [];
  try {
    if (articleRow.osaka_text) osakaText = JSON.parse(articleRow.osaka_text);
    if (articleRow.commentary_osaka) commentaryOsaka = JSON.parse(articleRow.commentary_osaka);
  } catch {
    return new Response('Invalid article data', { status: 500 });
  }

  const displayText = osakaText.map(stripHtml);
  const displayCommentary = commentaryOsaka.map(stripHtml);

  const titleOsaka = articleRow.title_osaka || articleRow.title || '';
  const articleLabel = `第${article}条`;

  // Klee One フォントを Google Fonts から取得
  let fontData: ArrayBuffer;
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Klee+One:wght@400&display=swap'
    );
    const css = await cssRes.text();
    const urlMatch = css.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (!urlMatch) throw new Error('Font URL not found');
    fontData = await fetch(urlMatch[1]).then((r) => r.arrayBuffer());
  } catch {
    return new Response('Font loading failed', { status: 500 });
  }

  // テキスト量に応じて高さを動的に計算
  const textLines = displayText.join('\n').length;
  const commentaryLines = displayCommentary.join('\n').length;
  const estimatedHeight = Math.max(
    600,
    Math.min(2400, 300 + textLines * 1.5 + commentaryLines * 1.5)
  );
  const finalHeight = Math.round(estimatedHeight);

  const fontSize = width < 600 ? 14 : 16;
  const titleFontSize = width < 600 ? 20 : 24;
  const lawNameFontSize = width < 600 ? 16 : 20;

  const headers = { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' };

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#FFF8DC',
          padding: '40px',
          fontFamily: '"Klee One"',
        }}
      >
        {/* 法律名 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            color: '#8B4513',
            fontSize: lawNameFontSize,
            marginBottom: '8px',
          }}
        >
          {lawName}
        </div>

        {/* 条文タイトル */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            color: '#E94E77',
            fontSize: titleFontSize,
            fontWeight: 'bold',
            marginBottom: '20px',
          }}
        >
          {articleLabel}
          {titleOsaka ? `（${stripHtml(titleOsaka)}）` : ''}
        </div>

        {/* 大阪弁原文セクション */}
        {displayText.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #E94E77',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                color: '#E94E77',
                fontSize: fontSize - 2,
                fontWeight: 'bold',
                marginBottom: '12px',
              }}
            >
              おおさか弁
            </div>
            {displayText.map((paragraph, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  color: '#333',
                  fontSize: fontSize,
                  lineHeight: 1.8,
                  marginBottom: '8px',
                }}
              >
                {paragraph}
              </div>
            ))}
          </div>
        )}

        {/* ワンポイント解説セクション */}
        {displayCommentary.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #ef4444',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                color: '#ef4444',
                fontSize: fontSize - 2,
                fontWeight: 'bold',
                marginBottom: '12px',
              }}
            >
              ワンポイント解説
            </div>
            {displayCommentary.map((paragraph, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  color: '#333',
                  fontSize: fontSize,
                  lineHeight: 1.8,
                  marginBottom: '8px',
                }}
              >
                {paragraph}
              </div>
            ))}
          </div>
        )}

        {/* フッター */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#8B4513',
              fontSize: fontSize - 2,
            }}
          >
            おおさかけんぽう - osaka-kenpo.llll-ll.com
          </div>
        </div>
      </div>
    ),
    {
      width,
      height: finalHeight,
      fonts: [
        {
          name: 'Klee One',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
      headers,
    }
  );
}
