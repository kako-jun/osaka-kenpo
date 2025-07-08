import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E94E77',
        cream: '#FFF8DC',
        brown: '#8B4513',
      },
      fontFamily: {
        'handwriting': ['Klee One', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config