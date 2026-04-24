import type { Config } from 'tailwindcss';

const colors = {
  primary: '#8B4513',
  secondary: '#D2B48C',
  accent: '#A0522D',
  error: '#DC143C',
  success: '#228B22',
  warning: '#FF8C00',
  info: '#4169E1',
};

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
