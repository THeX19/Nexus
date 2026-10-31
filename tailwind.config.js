/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        raised: token('raised'),
        overlay: token('overlay'),
        line: 'rgb(var(--line) / var(--line-a))',
        'line-strong': token('line-strong'),
        fg: token('fg'),
        muted: token('muted'),
        subtle: token('subtle'),
        accent: token('accent'),
        'accent-fg': token('accent-fg'),
        danger: token('danger'),
        warning: token('warning'),
        success: token('success'),
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'Geist', '"Noto Sans"', 'Cantarell', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', '14px'],
        xs: ['12px', '16px'],
        sm: ['13px', '18px'],
        base: ['14px', '20px'],
        lg: ['16px', '22px'],
        xl: ['20px', '26px'],
      },
      spacing: {
        row: 'var(--row-h)',
        ctl: 'var(--ctl-h)',
        gutter: 'var(--gutter)',
      },
      borderRadius: { sm: '4px', DEFAULT: '6px', md: '6px', lg: '8px', xl: '10px' },
      boxShadow: {
        pop: '0 0 0 1px rgb(var(--line-strong) / 1), 0 12px 32px -8px rgb(0 0 0 / var(--shadow-a))',
      },
      transitionDuration: { fast: 'var(--dur-fast)', base: 'var(--dur-base)' },
      transitionTimingFunction: { out: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'pop-in': { from: { opacity: 0, transform: 'translateY(4px) scale(0.98)' }, to: { opacity: 1, transform: 'none' } },
        'page-in': { from: { opacity: 0, transform: 'translateY(3px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-in': 'fade-in var(--dur-fast) ease-out',
        'pop-in': 'pop-in var(--dur-base) cubic-bezier(0.2,0.8,0.2,1)',
        'page-in': 'page-in var(--dur-base) cubic-bezier(0.2,0.8,0.2,1)',
      },
    },
  },
  plugins: [],
};
