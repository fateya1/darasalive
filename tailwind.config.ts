import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        board: {
          DEFAULT: '#22392E', // chalkboard green
          light: '#2E4D3E',
          dark: '#152920'
        },
        chalk: '#F4F1E8',
        gold: {
          DEFAULT: '#D9A441',
          dark: '#B4842E'
        },
        sage: '#6B8F71',
        sky: '#5B84A6',
        terracotta: '#C0654B',
        plum: '#8B6A9C',
        teal: '#4E8C86',
        ink: '#1B1B18'
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
