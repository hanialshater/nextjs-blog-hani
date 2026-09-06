import type { ReactNode } from 'react'

interface TechnicalNoteProps {
  title: string
  children: ReactNode
  open?: boolean
}

// Native disclosure stays usable before hydration and with JavaScript disabled.
export default function TechnicalNote({ title, children, open = false }: TechnicalNoteProps) {
  return (
    <details className="technical-note" open={open}>
      <summary>{title}</summary>
      <div className="technical-note-content">{children}</div>
    </details>
  )
}
