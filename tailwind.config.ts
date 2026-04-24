import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['Jost', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forest: {
          DEFAULT: '#1B3D2F',
          mid:     '#245240',
          light:   '#3a7a5c',
        },
        teal: {
          DEFAULT: '#4a9e7a',
          pale:    '#c8e6d8',
        },
        paper: {
          DEFAULT: '#F2F0EA',
          dark:    '#E8E5DC',
          darker:  '#DEDAD0',
        },
      },
      animation: {
        rise:  'rise 0.7s ease both',
        fade:  'fadeIn 0.5s ease both',
        float: 'floatCode 6s ease-in-out infinite',
      },
      keyframes: {
        rise: {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
        floatCode: {
          '0%, 100%': { transform: 'translateY(0)',    opacity: '0.55' },
          '50%':      { transform: 'translateY(-10px)', opacity: '0.9'  },
        },
      },
    },
  },
  plugins: [],
}

export default config
