// osaka-kenpo: Amazon affiliate products.
//
// アソシエイト ID は kako-jun の `ultimate-battle-22`。
// amzn.to 短縮リンクを使用 (Associates ダッシュボードで生成)。
// 画像 URL は `https://m.media-amazon.com/images/P/{ASIN}.01._SL500_.jpg` 形式。

export interface AffiliateProduct {
  /** amzn.to 短縮 URL */
  url: string;
  /** 商品タイトル（短縮可） */
  title: string;
  /** Amazon CDN 商品画像 URL */
  imageUrl: string;
  /** kako-jun の一言コメント */
  caption: string;
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    url: 'https://amzn.to/4ufazjL',
    title: 'よつばと! 16巻',
    imageUrl: 'https://m.media-amazon.com/images/P/404916194X.01._SL500_.jpg',
    caption: '大阪先生の今を見届ける枠',
  },
  {
    url: 'https://amzn.to/3Sqt4EE',
    title: 'あずまんが大王1年生 新装版',
    imageUrl: 'https://m.media-amazon.com/images/P/B0DYNRNC4Y.01._SL500_.jpg',
    caption: 'おおさか弁の原点みたいな本',
  },
  {
    url: 'https://amzn.to/43hsX0z',
    title: 'デイリー六法2026',
    imageUrl: 'https://m.media-amazon.com/images/P/4385158827.01._SL500_.jpg',
    caption: '紙の六法も手元にあると強い',
  },
];
