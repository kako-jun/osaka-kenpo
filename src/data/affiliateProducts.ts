// osaka-kenpo: Amazon affiliate products.
//
// アソシエイト ID は kako-jun の `ultimate-battle-22`。
// amzn.to 短縮リンクを使用 (Associates ダッシュボードで生成)。
// 画像 URL は商品ページのギャラリーにある `images/I/{imageId}._SL1500_.jpg` を使用。
// ASIN 直指定の `images/P/{ASIN}.01...` は低解像度になることがある。

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
    imageUrl: 'https://m.media-amazon.com/images/I/81Fj5V8VcZL._SL1500_.jpg',
    caption: '大阪先生を要チェックや！',
  },
  {
    url: 'https://amzn.to/3Sqt4EE',
    title: 'あずまんが大王1年生 新装版',
    imageUrl: 'https://m.media-amazon.com/images/I/512mu1PgoYL._SL1500_.jpg',
    caption: 'いや、原典……！',
  },
  {
    url: 'https://amzn.to/4vF4bDQ',
    title: 'こども六法 第2版',
    imageUrl: 'https://m.media-amazon.com/images/I/81k3e3QrLxL._SL1500_.jpg',
    caption: 'いじめ防止対策推進法！',
  },
];
