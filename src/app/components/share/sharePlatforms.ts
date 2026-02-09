export interface SharePlatform {
  id: string;
  label: string;
  getUrl: (text: string, url: string) => string;
}

export const platforms: SharePlatform[] = [
  {
    id: 'x',
    label: 'X',
    getUrl: (text, url) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'note',
    label: 'note',
    getUrl: (text, url) =>
      `https://note.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'hatena',
    label: 'はてブ',
    getUrl: (text, url) =>
      `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    id: 'line',
    label: 'LINE',
    getUrl: (text, url) =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    getUrl: (text, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    id: 'mypace',
    label: 'MY PACE',
    getUrl: (text, url) =>
      `https://mypace.llll-ll.com/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
];
