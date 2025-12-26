'use client'

import React, { useState, useEffect } from 'react'

// Simple hash function
const simpleHash = (str: string, seed: number, max: number): number => {
  let hash = seed
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % max
}

interface ItemData {
  name: string
  color: string
  count: number
}

const CountMinSketchEvolved = () => {
  const [sketchRows] = useState(4)
  const [sketchCols] = useState(10)
  const [sketchTable, setSketchTable] = useState<number[][]>(
    Array(4)
      .fill(0)
      .map(() => Array(10).fill(0))
  )
  const [items, setItems] = useState<ItemData[]>([
    { name: 'apple', color: '#ef4444', count: 0 },
    { name: 'banana', color: '#eab308', count: 0 },
    { name: 'cherry', color: '#dc2626', count: 0 },
    { name: 'date', color: '#a16207', count: 0 },
    { name: 'elderberry', color: '#7c3aed', count: 0 },
  ])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [lastHashedIndices, setLastHashedIndices] = useState<{ row: number; col: number }[]>([])
  const [activeLesson, setActiveLesson] = useState(1)
  const [inputItem, setInputItem] = useState('')
  const [queryResult, setQueryResult] = useState<string | null>(null)

  const addItem = (itemName: string) => {
    const cleanItem = itemName.trim().toLowerCase()
    if (!cleanItem) return

    const newTable = [...sketchTable.map((row) => [...row])]
    const newHashedIndices: { row: number; col: number }[] = []

    for (let r = 0; r < sketchRows; r++) {
      const col = simpleHash(cleanItem, r * 1337, sketchCols)
      newTable[r][col] += 1
      newHashedIndices.push({ row: r, col })
    }

    setSketchTable(newTable)
    setLastHashedIndices(newHashedIndices)
    setSelectedItem(cleanItem)

    // Update item counts
    const existingItem = items.find((i) => i.name === cleanItem)
    if (existingItem) {
      setItems(items.map((i) => (i.name === cleanItem ? { ...i, count: i.count + 1 } : i)))
    }

    setActiveLesson(2)
  }

  const queryItem = (itemName: string) => {
    const cleanItem = itemName.trim().toLowerCase()
    if (!cleanItem) return

    let min = Infinity
    const indices: { row: number; col: number }[] = []

    for (let r = 0; r < sketchRows; r++) {
      const col = simpleHash(cleanItem, r * 1337, sketchCols)
      min = Math.min(min, sketchTable[r][col])
      indices.push({ row: r, col })
    }

    setLastHashedIndices(indices)
    setSelectedItem(cleanItem)
    const actualCount = items.find((i) => i.name === cleanItem)?.count || 0
    setQueryResult(`Estimated: ${min === Infinity ? 0 : min}, Actual: ${actualCount}`)
    setActiveLesson(3)
  }

  const reset = () => {
    setSketchTable(
      Array(sketchRows)
        .fill(0)
        .map(() => Array(sketchCols).fill(0))
    )
    setItems(items.map((i) => ({ ...i, count: 0 })))
    setLastHashedIndices([])
    setSelectedItem(null)
    setQueryResult(null)
    setActiveLesson(1)
  }

  const getMaxCount = () => Math.max(...sketchTable.flat(), 1)

  return (
    <div
      className="overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg dark:from-slate-900 dark:to-slate-800"
      style={{ minHeight: '650px' }}
    >
      {/* Header */}
      <div className="border-b-2 border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-4 dark:border-amber-600 dark:from-slate-800 dark:to-slate-700">
        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200">
          Count-Min Sketch: Interactive Educational Demo
        </h3>
        <p className="text-sm text-amber-700 italic dark:text-amber-400">
          Estimating frequency in large streams with limited space
        </p>
      </div>

      <div className="flex gap-4 p-4" style={{ height: '580px' }}>
        {/* Left: Lessons */}
        <div className="w-1/3 overflow-y-auto rounded-lg border border-amber-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h4 className="mb-4 border-b-2 border-amber-300 pb-2 text-base font-bold text-amber-900 dark:border-amber-600 dark:text-amber-200">
            Learning Path
          </h4>

          <div
            className={`mb-3 rounded-lg border-2 p-3 transition-all ${activeLesson === 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30' : 'border-transparent'}`}
          >
            <h5 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                1
              </span>
              What is Count-Min Sketch?
            </h5>
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              A probabilistic data structure that uses multiple hash functions to estimate item
              frequencies with sub-linear space.
            </p>
            <div className="mt-2 border-l-4 border-amber-400 bg-amber-100 p-2 text-xs text-amber-800 italic dark:bg-amber-900/50 dark:text-amber-300">
              Key insight: Trade exact counts for memory efficiency!
            </div>
          </div>

          <div
            className={`mb-3 rounded-lg border-2 p-3 transition-all ${activeLesson === 2 ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30' : 'border-transparent'}`}
          >
            <h5 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                2
              </span>
              Adding Items
            </h5>
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              Each item is hashed by multiple functions. Each hash maps to a column. We increment
              all mapped cells.
            </p>
          </div>

          <div
            className={`mb-3 rounded-lg border-2 p-3 transition-all ${activeLesson === 3 ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30' : 'border-transparent'}`}
          >
            <h5 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                3
              </span>
              Querying Counts
            </h5>
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              To estimate frequency, hash the item again and take the <strong>minimum</strong> of
              all cells. This gives an upper bound (may overestimate due to collisions).
            </p>
          </div>

          <div className="rounded-lg border-2 border-transparent p-3">
            <h5 className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                4
              </span>
              Why Multiple Hash Functions?
            </h5>
            <p className="mt-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              Collisions are inevitable. Using multiple independent hashes reduces the probability
              that ALL cells collide, improving accuracy.
            </p>
          </div>
        </div>

        {/* Center: Visualization */}
        <div className="flex w-2/5 flex-col gap-3">
          {/* Items */}
          <div className="rounded-lg border border-amber-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-2 border-b border-amber-200 pb-1 text-sm font-bold text-amber-900 dark:border-slate-600 dark:text-amber-200">
              Click to Add Item
            </h4>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => addItem(item.name)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 ${selectedItem === item.name ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
                  style={{ backgroundColor: item.color }}
                >
                  {item.name} {item.count > 0 && `(${item.count})`}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 rounded-lg border border-amber-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-3 text-center text-sm font-bold text-amber-900 dark:text-amber-200">
              Sketch Table
            </h4>
            <div className="flex flex-col gap-2">
              {sketchTable.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center gap-2">
                  <div className="w-10 pr-1 text-right text-xs font-bold text-amber-600 dark:text-amber-400">
                    h{rIdx + 1}(x)
                  </div>
                  <div className="flex flex-1 gap-1">
                    {row.map((val, cIdx) => {
                      const isHashed = lastHashedIndices.some(
                        (idx) => idx.row === rIdx && idx.col === cIdx
                      )
                      const intensity = val / getMaxCount()
                      return (
                        <div
                          key={cIdx}
                          className={`flex aspect-square flex-1 items-center justify-center rounded border-2 font-mono text-xs font-bold transition-all duration-300 ${
                            isHashed
                              ? 'z-10 scale-110 border-amber-500 bg-amber-100 text-amber-900 shadow-lg dark:bg-amber-900 dark:text-amber-100'
                              : 'border-amber-200 text-amber-800 dark:border-slate-600 dark:text-amber-200'
                          }`}
                          style={{
                            backgroundColor: isHashed
                              ? undefined
                              : `rgba(251, 191, 36, ${intensity * 0.5})`,
                          }}
                        >
                          {val}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex w-1/4 flex-col gap-3">
          <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-3 border-b border-amber-200 pb-1 text-sm font-bold text-amber-900 dark:border-slate-600 dark:text-amber-200">
              Add Custom Item
            </h4>
            <input
              type="text"
              placeholder="Type item name..."
              value={inputItem}
              onChange={(e) => setInputItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem(inputItem)}
              className="w-full rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-amber-100"
            />
            <button
              onClick={() => {
                addItem(inputItem)
                setInputItem('')
              }}
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:from-amber-500 hover:to-orange-500"
            >
              ➕ Add
            </button>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-3 border-b border-amber-200 pb-1 text-sm font-bold text-amber-900 dark:border-slate-600 dark:text-amber-200">
              Query Count
            </h4>
            <div className="flex flex-wrap gap-1">
              {items
                .filter((i) => i.count > 0)
                .map((item) => (
                  <button
                    key={item.name}
                    onClick={() => queryItem(item.name)}
                    className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-200 dark:bg-slate-700 dark:text-amber-200 dark:hover:bg-slate-600"
                  >
                    ? {item.name}
                  </button>
                ))}
            </div>
            {queryResult && (
              <div className="mt-3 rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 p-3 text-center text-sm font-bold text-amber-900 dark:border-amber-600 dark:from-slate-700 dark:to-slate-600 dark:text-amber-100">
                {queryResult}
              </div>
            )}
          </div>

          <button
            onClick={reset}
            className="rounded-lg bg-gradient-to-r from-slate-500 to-slate-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-slate-600 hover:to-slate-700"
          >
            🗑️ Reset All
          </button>

          <div className="rounded-lg bg-gradient-to-br from-indigo-900 to-purple-900 p-4 text-white">
            <h4 className="mb-2 text-xs font-bold tracking-wider text-indigo-200 uppercase">
              Mathematical Bound
            </h4>
            <p className="font-mono text-sm leading-tight">
              Estimate ≥ Real Count
              <br />
              <span className="text-xs text-indigo-300 opacity-80">(Always an over-estimate)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CountMinSketchEvolved
