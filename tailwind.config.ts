import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'red-primary': '#DC2626',
        'red-dark': '#991B1B',
        'red-darker': '#7F1D1D',
        'red-light': '#FCA5A5',
      },
    },
  },
  plugins: [],
};

export default config;
