'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

// --- TYPE DEFINITIONS ---
interface MergeSortStep {
  array: number[]
  activeIndices?: number[]
  comparing?: number[]
  merging?: number[]
  sortedRange?: [number, number]
  isDone?: boolean
  msg: string
}

// --- HELPERS FOR COUNT-MIN SKETCH ---
const simpleHash = (str: string, seed: number, max: number) => {
  let hash = seed
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % max
}

const AlgorithmDemos = () => {
  const [activeTab, setActiveTab] = useState<'mergesort' | 'cms'>('mergesort')

  // --- MERGE SORT STATE ---
  const [array, setArray] = useState<number[]>([])
  const [steps, setSteps] = useState<MergeSortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [arraySize, setArraySize] = useState(8)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // --- COUNT-MIN SKETCH STATE ---
  const [sketchRows, setSketchRows] = useState(4)
  const [sketchCols] = useState(10)
  const [sketchTable, setSketchTable] = useState<number[][]>(
    Array(4)
      .fill(0)
      .map(() => Array(10).fill(0))
  )
  const [realCounts, setRealCounts] = useState<Record<string, number>>({})
  const [inputItem, setInputItem] = useState('')
  const [lastHashedIndices, setLastHashedIndices] = useState<{ row: number; col: number }[]>([])

  // --- SHARED EFFECTS ---
  useEffect(() => {
    if (activeTab === 'mergesort') {
      generateNewArray()
    } else if (activeTab === 'cms') {
      resetSketch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, arraySize, sketchRows])

  useEffect(() => {
    if (activeTab === 'mergesort' && isPlaying && currentStep < steps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, speed)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, speed, activeTab])

  // --- MERGE SORT LOGIC ---
  const generateNewArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10)
    setArray(newArray)
    setCurrentStep(0)
    setIsPlaying(false)

    const allSteps: MergeSortStep[] = []
    const arrCopy = [...newArray]

    allSteps.push({
      array: [...arrCopy],
      activeIndices: [],
      comparing: [],
      merging: [],
      msg: "Ready to start Merge Sort. We'll recursively divide until we reach single elements.",
    })

    const mergeSort = (arr: number[], start: number, end: number) => {
      if (start >= end) return
      const mid = Math.floor((start + end) / 2)

      allSteps.push({
        array: [...arr],
        activeIndices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        msg: `Dividing range [${start}...${end}] into [${start}...${mid}] and [${mid + 1}...${end}].`,
      })

      mergeSort(arr, start, mid)
      mergeSort(arr, mid + 1, end)
      merge(arr, start, mid, end)
    }

    const merge = (arr: number[], start: number, mid: number, end: number) => {
      const left = arr.slice(start, mid + 1)
      const right = arr.slice(mid + 1, end + 1)
      let i = 0,
        j = 0,
        k = start

      while (i < left.length && j < right.length) {
        allSteps.push({
          array: [...arr],
          comparing: [start + i, mid + 1 + j],
          activeIndices: Array.from({ length: end - start + 1 }, (_, idx) => start + idx),
          msg: `Comparing ${left[i]} and ${right[j]}.`,
        })

        if (left[i] <= right[j]) {
          arr[k] = left[i]
          i++
        } else {
          arr[k] = right[j]
          j++
        }

        allSteps.push({
          array: [...arr],
          merging: [k],
          activeIndices: Array.from({ length: end - start + 1 }, (_, idx) => start + idx),
          msg: `Placed ${arr[k]} into the sorted position.`,
        })
        k++
      }

      while (i < left.length) {
        arr[k] = left[i]
        allSteps.push({
          array: [...arr],
          merging: [k],
          activeIndices: Array.from({ length: end - start + 1 }, (_, idx) => start + idx),
          msg: 'Copying remaining elements from left.',
        })
        i++
        k++
      }

      while (j < right.length) {
        arr[k] = right[j]
        allSteps.push({
          array: [...arr],
          merging: [k],
          activeIndices: Array.from({ length: end - start + 1 }, (_, idx) => start + idx),
          msg: 'Copying remaining elements from right.',
        })
        j++
        k++
      }

      allSteps.push({
        array: [...arr],
        activeIndices: [],
        sortedRange: [start, end],
        msg: `Finished merging range [${start}...${end}].`,
      })
    }

    mergeSort(arrCopy, 0, arrCopy.length - 1)
    allSteps.push({ array: [...arrCopy], activeIndices: [], isDone: true, msg: 'Sort complete!' })
    setSteps(allSteps)
  }

  // --- COUNT-MIN SKETCH LOGIC ---
  const resetSketch = () => {
    setSketchTable(
      Array(sketchRows)
        .fill(0)
        .map(() => Array(sketchCols).fill(0))
    )
    setRealCounts({})
    setLastHashedIndices([])
  }

  const addItemToSketch = (item: string) => {
    if (!item || !item.trim()) return
    const cleanItem = item.trim().toLowerCase()
    const newTable = [...sketchTable.map((row) => [...row])]
    const newHashedIndices: { row: number; col: number }[] = []

    for (let r = 0; r < sketchRows; r++) {
      const col = simpleHash(cleanItem, r * 1337, sketchCols)
      newTable[r][col] += 1
      newHashedIndices.push({ row: r, col })
    }

    setSketchTable(newTable)
    setRealCounts((prev) => ({ ...prev, [cleanItem]: (prev[cleanItem] || 0) + 1 }))
    setLastHashedIndices(newHashedIndices)
    setInputItem('')
  }

  const getEstimate = (item: string) => {
    if (!item) return 0
    const cleanItem = item.trim().toLowerCase()
    let min = Infinity
    for (let r = 0; r < sketchRows; r++) {
      const col = simpleHash(cleanItem, r * 1337, sketchCols)
      min = Math.min(min, sketchTable[r][col])
    }
    return min === Infinity ? 0 : min
  }

  const currentData = steps[currentStep] || { array, activeIndices: [], msg: '' }

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-sans text-slate-800 md:p-6 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation Tabs */}
        <div className="mx-auto mb-4 flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('mergesort')}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold transition-all ${activeTab === 'mergesort' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
          >
            📊 Merge Sort
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold transition-all ${activeTab === 'cms' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
          >
            🗄️ Count-Min Sketch
          </button>
        </div>

        {activeTab === 'mergesort' ? (
          <>
            <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center dark:border-slate-700">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-indigo-900 dark:text-indigo-300">
                  Merge Sort Visualizer
                </h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  A Divide and Conquer sorting demonstration.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={generateNewArray}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  🔄 New Array
                </button>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Size</span>
                  <input
                    type="range"
                    min="4"
                    max="16"
                    value={arraySize}
                    onChange={(e) => setArraySize(parseInt(e.target.value))}
                    className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200"
                  />
                  <span className="w-4 text-sm font-bold">{arraySize}</span>
                </div>
              </div>
            </header>

            <main className="overflow-hidden rounded-2xl border border-indigo-50 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <div className="flex min-h-[300px] flex-col items-center justify-center p-8">
                <div className="mb-8 flex h-48 w-full items-end justify-center gap-2 px-4 md:gap-4">
                  {currentData.array &&
                    currentData.array.map((val: number, idx: number) => {
                      const isActive = currentData.activeIndices?.includes(idx)
                      const isComparing = currentData.comparing?.includes(idx)
                      const isMerging = currentData.merging?.includes(idx)
                      const isSorted =
                        currentData.isDone ||
                        (currentData.sortedRange &&
                          idx >= currentData.sortedRange[0] &&
                          idx <= currentData.sortedRange[1])

                      let bgColor = 'bg-slate-200 dark:bg-slate-600'
                      if (isActive) bgColor = 'bg-indigo-400'
                      if (isComparing) bgColor = 'bg-amber-400 scale-110'
                      if (isMerging) bgColor = 'bg-emerald-400 scale-105'
                      if (isSorted) bgColor = 'bg-indigo-600'

                      return (
                        <div
                          key={idx}
                          className="flex max-w-[50px] flex-1 flex-col items-center transition-all duration-300"
                        >
                          <div
                            className={`w-full rounded-t-md shadow-sm transition-all duration-300 ${bgColor}`}
                            style={{ height: `${val * 1.5}px` }}
                          />
                          <span
                            className={`mt-2 text-xs font-bold md:text-sm ${isComparing || isMerging ? 'scale-125 text-indigo-900 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            {val}
                          </span>
                        </div>
                      )
                    })}
                </div>
                <div className="w-full max-w-2xl rounded-r-lg border-l-4 border-indigo-500 bg-indigo-50 p-4 dark:bg-indigo-900/30">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-indigo-500">ℹ️</span>
                    <p className="leading-relaxed font-medium text-indigo-900 dark:text-indigo-200">
                      {currentData.msg || ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-between gap-4 bg-slate-900 p-4 md:flex-row">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentStep((prev) => Math.max(0, prev - 1))
                      setIsPlaying(false)
                    }}
                    className="p-2 text-slate-400 hover:text-white"
                    disabled={currentStep === 0}
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-xl text-white shadow-lg hover:bg-indigo-400"
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
                      setIsPlaying(false)
                    }}
                    className="p-2 text-slate-400 hover:text-white"
                    disabled={currentStep === steps.length - 1}
                  >
                    ▶
                  </button>
                </div>
                <div className="w-full flex-1 px-4">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-indigo-400"
                      style={{
                        width: `${steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-slate-800 px-4 py-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Speed</span>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={1050 - speed}
                    onChange={(e) => setSpeed(1050 - parseInt(e.target.value))}
                    className="w-20 accent-indigo-400"
                  />
                </div>
              </div>
            </main>
          </>
        ) : (
          <>
            <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center dark:border-slate-700">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-indigo-900 dark:text-indigo-300">
                  Count-Min Sketch
                </h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Estimating frequency in large streams with limited space.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={resetSketch}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  🗑️ Clear Table
                </button>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Rows</span>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={sketchRows}
                    onChange={(e) => setSketchRows(parseInt(e.target.value))}
                    className="w-16 accent-indigo-400"
                  />
                  <span className="w-4 text-sm font-bold">{sketchRows}</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-indigo-50 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                      # Sketch Table
                    </h4>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400 dark:bg-slate-700">
                      Rows: Hash Functions, Cols: Counters
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="flex min-w-[500px] flex-col gap-2">
                      {sketchTable.map((row, rIdx) => (
                        <div key={rIdx} className="flex items-center gap-2">
                          <div className="w-12 pr-2 text-right text-xs font-bold text-slate-400">
                            h{rIdx + 1}(x)
                          </div>
                          <div className="flex flex-1 gap-1">
                            {row.map((val, cIdx) => {
                              const isHashed = lastHashedIndices.some(
                                (idx) => idx.row === rIdx && idx.col === cIdx
                              )
                              return (
                                <div
                                  key={cIdx}
                                  className={`flex h-12 flex-1 items-center justify-center rounded border font-mono text-sm transition-all duration-300 ${
                                    isHashed
                                      ? 'z-10 scale-105 border-amber-400 bg-amber-100 font-bold text-amber-900 shadow-md dark:bg-amber-900/50 dark:text-amber-200'
                                      : 'border-slate-100 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                  }`}
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

                <div className="flex flex-col items-center gap-6 rounded-2xl bg-indigo-900 p-6 text-white shadow-lg md:flex-row">
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h4 className="text-sm font-bold tracking-wider text-indigo-200 uppercase">
                      How it works
                    </h4>
                    <p className="text-sm leading-relaxed text-indigo-50">
                      Each item is hashed by several different functions. Each hash maps the item to
                      a column. To estimate frequency, we take the minimum of all relevant cells.
                    </p>
                  </div>
                  <div className="min-w-[200px] rounded-xl border border-indigo-700 bg-indigo-800 p-4">
                    <div className="mb-1 text-xs font-bold tracking-tighter text-indigo-300 uppercase">
                      Mathematical Bound
                    </div>
                    <div className="font-mono text-sm leading-tight">
                      Estimate ≥ Real Count <br />
                      <span className="text-[10px] text-indigo-400 opacity-80">
                        (Always an over-estimate)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-indigo-50 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                    ➕ Add to Stream
                  </h4>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type item name..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-3 transition-all outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                        value={inputItem}
                        onChange={(e) => setInputItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItemToSketch(inputItem)}
                      />
                      <button
                        onClick={() => addItemToSketch(inputItem)}
                        className="absolute top-2 right-2 rounded-lg bg-indigo-600 p-1.5 text-white transition-colors hover:bg-indigo-500"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {['Apple', 'Banana', 'Cat', 'Dog', 'Ego'].map((t) => (
                        <button
                          key={t}
                          onClick={() => addItemToSketch(t)}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto rounded-2xl border border-indigo-50 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <h4 className="mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase">
                    Frequency Analysis
                  </h4>
                  <div className="space-y-3">
                    {Object.keys(realCounts).length === 0 && (
                      <p className="py-8 text-center text-sm text-slate-300 italic dark:text-slate-600">
                        Stream is empty
                      </p>
                    )}
                    {Object.keys(realCounts).map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-bold text-slate-700 capitalize dark:text-slate-200">
                            {item}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            Real: {realCounts[item]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Sketch Estimate:</span>
                          <span
                            className={`font-mono font-bold ${getEstimate(item) > realCounts[item] ? 'text-amber-500' : 'text-indigo-600 dark:text-indigo-400'}`}
                          >
                            {getEstimate(item)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
              ❓ {activeTab === 'mergesort' ? 'Recursion' : 'Hashing'}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activeTab === 'mergesort'
                ? 'Merge sort uses a top-down recursive approach. It divides the array into single elements before merging them back in order.'
                : 'CMS uses multiple independent hash functions to reduce the probability that different items collide across all buckets.'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
              ❓ {activeTab === 'mergesort' ? 'Stability' : 'Space Efficiency'}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activeTab === 'mergesort'
                ? 'Merge sort is stable, meaning elements with equal values maintain their relative order, which is crucial for multi-key sorting.'
                : 'The sketch uses a fixed amount of memory regardless of the number of unique items in the stream.'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
              ❓ Complexity
            </h4>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Time:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {activeTab === 'mergesort' ? 'O(n log n)' : 'O(1) updates'}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Space:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {activeTab === 'mergesort' ? 'O(n)' : 'O(rows * cols)'}
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AlgorithmDemos
