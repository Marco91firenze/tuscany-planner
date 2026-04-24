import type { Config } from 'tailwindcss';
import { colors } from '../../packages/ui-tokens/src';

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
