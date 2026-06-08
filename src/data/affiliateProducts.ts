// osaka-kenpo: Amazon affiliate products.
//
// アソシエイト ID は kako-jun の `ultimate-battle-22`。
// amzn.to 短縮リンクを使用 (Associates ダッシュボードで生成)。
// 画像 URL は `https://m.media-amazon.com/images/P/{ASIN}.01._SL1500_.jpg` 形式。

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
    imageUrl: 'https://m.media-amazon.com/images/P/404916194X.01._SL1500_.jpg',
    caption: '大阪先生を要チェックや！',
  },
  {
    url: 'https://amzn.to/3Sqt4EE',
    title: 'あずまんが大王1年生 新装版',
    imageUrl: 'https://m.media-amazon.com/images/P/B0DYNRNC4Y.01._SL1500_.jpg',
    caption: 'いや、原典……！',
  },
  {
    url: 'https://amzn.to/4vF4bDQ',
    title: 'こども六法 第2版',
    imageUrl: 'https://m.media-amazon.com/images/P/433535990X.01._SL1500_.jpg',
    caption: 'いじめ防止対策推進法！',
  },
];
