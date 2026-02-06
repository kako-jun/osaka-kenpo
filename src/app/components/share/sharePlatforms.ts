export interface SharePlatform {
  id: string;
  label: string;
  icon: string;
  bg: string;
  rounded: string;
  getUrl: (text: string, url: string) => string;
}

export const platforms: SharePlatform[] = [
  {
    id: 'x',
    label: 'X',
    icon: '𝕏',
    bg: 'bg-black',
    rounded: 'rounded-sm',
    getUrl: (text, url) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'note',
    label: 'note',
    icon: 'n',
    bg: 'bg-black',
    rounded: 'rounded-full',
    getUrl: (text, url) =>
      `https://note.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'hatena',
    label: 'はてブ',
    icon: 'B!',
    bg: 'bg-[#00A4DE]',
    rounded: 'rounded',
    getUrl: (text, url) =>
      `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    id: 'line',
    label: 'LINE',
    icon: 'L',
    bg: 'bg-[#06C755]',
    rounded: 'rounded',
    getUrl: (text, url) =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'f',
    bg: 'bg-[#1877F2]',
    rounded: 'rounded',
    getUrl: (text, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
];
