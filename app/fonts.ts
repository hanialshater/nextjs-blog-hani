import localFont from 'next/font/local'

// Kept in the repository so builds and readers never depend on Google Fonts.
const englishReading = localFont({
  src: [
    { path: './fonts/serif-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/serif-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/serif-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/serif-700-italic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-reading-en',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
})

const arabicReading = localFont({
  src: [
    { path: './fonts/arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/arabic-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-reading-ar',
  display: 'swap',
  preload: false,
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
  adjustFontFallback: false,
})

export const readingFonts = `${englishReading.variable} ${arabicReading.variable}`
