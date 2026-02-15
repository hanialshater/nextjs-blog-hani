'use client'

import React, { useState, useEffect } from 'react'

// The actual evolved HTML content from gen11/agent_3.html and gen1/agent_1.html
// These demos were created through the evolutionary process described in the blog post

const EvolvedDemos = () => {
  const [activeTab, setActiveTab] = useState<'mergesort' | 'cms'>('mergesort')
  const [mergeSortHtml, setMergeSortHtml] = useState<string>('')
  const [cmsHtml, setCmsHtml] = useState<string>('')

  useEffect(() => {
    // Fetch the HTML files and modify viewport to fit iframe
    fetch('/demos/merge-sort-evolved.html')
      .then((res) => res.text())
      .then((html) => {
        // Remove the min-height: 100vh constraint for iframe embedding
        const modified = html
          .replace('min-height: 100vh;', '')
          .replace('height: 780px;', 'height: auto; min-height: 800px;')
          .replace('overflow: hidden;', 'overflow: visible;')
        setMergeSortHtml(modified)
      })
      .catch((err) => console.error('Failed to load merge sort demo:', err))

    fetch('/demos/count-min-sketch-evolved.html')
      .then((res) => res.text())
      .then((html) => {
        // Remove the height: 100vh constraint for iframe embedding
        const modified = html
          .replace('height: 100vh;', 'height: auto; min-height: 800px;')
          .replace('overflow: hidden;', 'overflow: visible;')
        setCmsHtml(modified)
      })
      .catch((err) => console.error('Failed to load count-min-sketch demo:', err))
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Navigation Tabs */}
      <div className="flex flex-shrink-0 border-b border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={() => setActiveTab('mergesort')}
          className={`m-1 flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-all ${
            activeTab === 'mergesort'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          🌳 Merge Sort (Gen 1)
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`m-1 flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-all ${
            activeTab === 'cms'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          📊 Count-Min Sketch (Gen 11)
        </button>
      </div>

      {/* Demo Container - simple full-height iframe */}
      <div className="relative flex-1 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {activeTab === 'mergesort' ? (
          <iframe
            src="/demos/merge-sort-evolved.html"
            className="h-full w-full border-0"
            title="Merge Sort Evolved Demo"
            sandbox="allow-scripts"
          />
        ) : (
          <iframe
            src="/demos/count-min-sketch-evolved.html"
            className="h-full w-full border-0"
            title="Count-Min Sketch Evolved Demo"
            sandbox="allow-scripts"
          />
        )}
      </div>

      {/* Caption */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600 italic dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        These demos were evolved through the process described above. No single prompt produced
        them.
      </div>
    </div>
  )
}

export default EvolvedDemos
