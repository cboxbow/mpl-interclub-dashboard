import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#010F27', 800: '#00164C' },
        cyan:  { DEFAULT: '#01D0FB', light: '#D0F8FF', dark: '#0099CC' },
        lgrey: '#EBF8FF',
      },
      fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'] },
    },
  },
  plugins: [],
}
export default config
