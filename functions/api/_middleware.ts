// Cloudflare Pages Functions ミドルウェア
// CORSヘッダーを追加

/// <reference path="../env.d.ts" />

export const onRequest: PagesFunction<Env> = async (context) => {
  // OPTIONSリクエスト（プリフライト）に即座に応答
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const response = await context.next();

  // CORSヘッダーを追加
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
};
