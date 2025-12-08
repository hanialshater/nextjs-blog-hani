// Root layout - passes through to [locale]/layout.tsx
// Middleware redirects / to /en/ so this is mainly for static file routes
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
