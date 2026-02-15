'use client'

import { useState, useEffect } from 'react'

export default function CountMinSketchDemo() {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/demos/count-min-sketch-evolved.html')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load demo')
        return res.text()
      })
      .then((html) => {
        // Modify the HTML to work better in iframe
        const modified = html
          .replace('height: 100vh;', 'height: 100%;')
          .replace('height: 100%;', 'height: 100%;')
          .replace('overflow: hidden;', 'overflow: auto;')
        setHtmlContent(modified)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading demo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <h2 className="flex-shrink-0 py-3 text-center text-2xl font-bold text-gray-800">
        Count-Min Sketch: Evolved Demo
      </h2>
      <div
        className="mx-4 mb-4 flex-1 overflow-hidden rounded-xl border border-gray-200"
        style={{ minHeight: '500px' }}
      >
        <iframe
          srcDoc={htmlContent}
          className="h-full w-full border-0"
          style={{ minHeight: '800px' }}
          title="Count-Min Sketch Evolved Demo"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}
