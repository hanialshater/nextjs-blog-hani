'use client'

import { useState, useEffect } from 'react'

export default function CountMinSketchDemo() {
    const [htmlContent, setHtmlContent] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch('/demos/count-min-sketch-evolved.html')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load demo')
                return res.text()
            })
            .then(html => {
                // Modify the HTML to work better in iframe
                const modified = html
                    .replace('height: 100vh;', 'height: 100%;')
                    .replace('height: 100%;', 'height: 100%;')
                    .replace('overflow: hidden;', 'overflow: auto;')
                setHtmlContent(modified)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading demo...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <div className="text-red-500">Error: {error}</div>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-white">
            <h2 className="text-2xl font-bold text-gray-800 text-center py-3 flex-shrink-0">
                Count-Min Sketch: Evolved Demo
            </h2>
            <div className="flex-1 overflow-hidden mx-4 mb-4 border border-gray-200 rounded-xl" style={{ minHeight: '500px' }}>
                <iframe
                    srcDoc={htmlContent}
                    className="w-full h-full border-0"
                    style={{ minHeight: '800px' }}
                    title="Count-Min Sketch Evolved Demo"
                    sandbox="allow-scripts"
                />
            </div>
        </div>
    )
}
