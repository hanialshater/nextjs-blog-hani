'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Caption from './Caption'

const N = 26
const GRID = 10
const TOP_K = 5
const SEED_ITERS = 30
const HC_ITERS = 150
const ES_ITERS = 70

type Circle = { x: number; y: number; r: number }
type Solution = { solution: Circle[]; fitness: number }
type Cell = { x: number; y: number }

// --- Pure Helper Functions (Moved outside to be stable) ---
const clone = (c: Circle[]): Circle[] => c.map((p) => ({ ...p }))

const fitness = (c: Circle[]) => c.reduce((sum, p) => sum + p.r, 0)

const isValid = (c: Circle[]) => {
  for (let i = 0; i < N; i++) {
    const ci = c[i]
    if (
      ci.x - ci.r < -1e-9 ||
      ci.x + ci.r > 1 + 1e-9 ||
      ci.y - ci.r < -1e-9 ||
      ci.y + ci.r > 1 + 1e-9
    )
      return false
  }
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = c[j].x - c[i].x,
        dy = c[j].y - c[i].y
      const min = c[i].r + c[j].r - 1e-9
      if (dx * dx + dy * dy < min * min) return false
    }
  }
  return true
}

const applyVF = (c: Circle[]) => {
  c = clone(c)
  for (let iter = 0; iter < 500; iter++) {
    let maxF = 0
    const fx = new Float64Array(N)
    const fy = new Float64Array(N)

    for (let i = 0; i < N; i++) {
      const ci = c[i]
      // Boundaries
      if (ci.x < ci.r) {
        fx[i] += ci.r - ci.x
        maxF = Math.max(maxF, ci.r - ci.x)
      }
      if (ci.x > 1 - ci.r) {
        fx[i] -= ci.x - 1 + ci.r
        maxF = Math.max(maxF, ci.x - 1 + ci.r)
      }
      if (ci.y < ci.r) {
        fy[i] += ci.r - ci.y
        maxF = Math.max(maxF, ci.r - ci.y)
      }
      if (ci.y > 1 - ci.r) {
        fy[i] -= ci.y - 1 + ci.r
        maxF = Math.max(maxF, ci.y - 1 + ci.r)
      }

      // Overlaps
      for (let j = i + 1; j < N; j++) {
        const cj = c[j]
        const dx = cj.x - ci.x,
          dy = cj.y - ci.y
        const d2 = dx * dx + dy * dy
        const min = ci.r + cj.r
        if (d2 < min * min) {
          const d = Math.sqrt(d2) || 0.001
          const f = (min - d) * 0.5
          const nx = dx / d,
            ny = dy / d
          fx[i] -= nx * f
          fy[i] -= ny * f
          fx[j] += nx * f
          fy[j] += ny * f
          maxF = Math.max(maxF, f)
        }
      }
    }

    if (maxF < 1e-10) break

    for (let i = 0; i < N; i++) {
      c[i].x = Math.max(c[i].r, Math.min(1 - c[i].r, c[i].x + fx[i] * 0.4))
      c[i].y = Math.max(c[i].r, Math.min(1 - c[i].r, c[i].y + fy[i] * 0.4))
    }
  }
  return c
}

const generateForCell = (targetX: number, targetY: number) => {
  const targetNumLarge = Math.round((targetY / 9) * 10)
  const targetVariance = targetX / 9

  const radii: number[] = []

  for (let i = 0; i < N; i++) {
    let r
    if (i < targetNumLarge) {
      r = 0.08 + Math.random() * 0.08
    } else {
      if (targetVariance < 0.3) {
        r = 0.04 + Math.random() * 0.02
      } else if (targetVariance < 0.6) {
        r = 0.02 + Math.random() * 0.05
      } else {
        r = 0.015 + Math.random() * 0.025
      }
    }
    radii.push(r)
  }

  for (let i = radii.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[radii[i], radii[j]] = [radii[j], radii[i]]
  }

  const targetSum = 1.4 + Math.random() * 0.3
  const currentSum = radii.reduce((a, b) => a + b, 0)
  const scale = targetSum / currentSum

  const c: Circle[] = []
  for (let i = 0; i < N; i++) {
    const r = radii[i] * scale
    c.push({
      x: r + Math.random() * (1 - 2 * r),
      y: r + Math.random() * (1 - 2 * r),
      r,
    })
  }

  return c
}

const mutateHC = (c: Circle[]) => {
  c = clone(c)
  const num = (1 + Math.random() * 2) | 0
  for (let m = 0; m < num; m++) {
    const i = (Math.random() * N) | 0
    c[i].x += (Math.random() - 0.5) * 0.05
    c[i].y += (Math.random() - 0.5) * 0.05
    c[i].r += (Math.random() - 0.2) * 0.01
    c[i].r = Math.max(0.01, c[i].r)
  }
  return c
}

const crossover = (p1: Circle[], p2: Circle[], numSwaps: number) => {
  const child = clone(p1)
  for (let m = 0; m < numSwaps; m++) {
    const i = (Math.random() * N) | 0
    let bestJ = 0,
      bestD = Infinity
    for (let j = 0; j < N; j++) {
      const dx = p1[i].x - p2[j].x,
        dy = p1[i].y - p2[j].y
      const d = dx * dx + dy * dy
      if (d < bestD) {
        bestD = d
        bestJ = j
      }
    }
    const pick = Math.random() < 0.7 ? bestJ : (bestJ + ((Math.random() * 5) | 0) - 2 + N) % N
    child[i].r = p2[pick].r
  }
  return child
}

const getBehavior = (c: Circle[]) => {
  let sum = 0,
    sum2 = 0,
    numLarge = 0
  for (let i = 0; i < N; i++) {
    sum += c[i].r
    sum2 += c[i].r * c[i].r
    if (c[i].r > 0.07) numLarge++
  }
  const mean = sum / N
  const variance = sum2 / N - mean * mean
  return {
    x: Math.min(GRID - 1, (variance * 300 * GRID) | 0),
    y: Math.min(GRID - 1, ((numLarge / 10) * GRID) | 0),
  }
}

export default function MapElitesDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number | undefined>(undefined)
  const archiveRef = useRef<Solution[][][]>([])
  const allSolutionsRef = useRef<{ solution: Circle[]; cell: Cell }[]>([])

  // Simulation State Refs (to avoid re-renders during loop)
  const circlesRef = useRef<Circle[]>([])
  const bestFitnessRef = useRef(0)
  const bestSolutionRef = useRef<Circle[] | null>(null)
  const stepsRef = useRef(0)
  const runningRef = useRef(false)
  const viewingCellRef = useRef<Cell | null>(null)

  // Focus State
  const focusCellRef = useRef<Cell | null>(null)
  const focusPhaseRef = useRef<'idle' | 'seed' | 'hc' | 'es' | 'done'>('idle')
  const phaseItersRef = useRef(0)
  const cellQueueRef = useRef<Cell[]>([])

  // UI State (for rendering stats)
  const [stats, setStats] = useState({
    bestR: 0,
    steps: 0,
    archiveSize: 0,
    filledCells: 0,
    phase: '-',
    phaseIter: 0,
    phaseMax: 0,
    valid: false,
  })
  const [isRunning, setIsRunning] = useState(false)

  // --- Simulation Logic Wrappers ---

  const rebuildCache = useCallback(() => {
    allSolutionsRef.current = []
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        for (const entry of archiveRef.current[x][y]) {
          allSolutionsRef.current.push({ solution: entry.solution, cell: { x, y } })
        }
      }
    }
  }, [])

  const addToArchive = useCallback(
    (c: Circle[], targetCell: Cell | null = null) => {
      const f = fitness(c)
      const b = getBehavior(c)

      if (targetCell && (b.x !== targetCell.x || b.y !== targetCell.y)) {
        return { added: false, newBest: false }
      }

      const arr = archiveRef.current[b.x][b.y]
      if (arr.length >= TOP_K && f <= arr[TOP_K - 1].fitness) {
        return { added: false, newBest: false }
      }

      arr.push({ solution: clone(c), fitness: f })
      arr.sort((a, b) => b.fitness - a.fitness)
      if (arr.length > TOP_K) arr.length = TOP_K

      rebuildCache()

      let newBest = false
      if (f > bestFitnessRef.current) {
        bestFitnessRef.current = f
        bestSolutionRef.current = clone(c)
        newBest = true
      }
      return { added: true, newBest }
    },
    [rebuildCache]
  )

  const getBestFromCell = useCallback((x: number, y: number) => {
    const arr = archiveRef.current[x][y]
    return arr.length > 0 ? clone(arr[0].solution) : null
  }, [])

  const startNextCell = useCallback(() => {
    if (cellQueueRef.current.length === 0) {
      focusCellRef.current = null
      focusPhaseRef.current = 'done'
      return
    }
    focusCellRef.current = cellQueueRef.current.shift()!
    focusPhaseRef.current = 'seed'
    phaseItersRef.current = 0
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Auto-resize
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Draw logic
    const size = rect.width
    ctx.fillStyle = '#111827' // gray-900
    ctx.fillRect(0, 0, size, size)

    const circlesToDraw =
      viewingCellRef.current &&
      archiveRef.current[viewingCellRef.current.x][viewingCellRef.current.y].length > 0
        ? archiveRef.current[viewingCellRef.current.x][viewingCellRef.current.y][0].solution
        : bestSolutionRef.current || circlesRef.current

    circlesToDraw.forEach((c, i) => {
      const hue = (i / N) * 360
      ctx.beginPath()
      ctx.arc(c.x * size, c.y * size, c.r * size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.6)`
      ctx.fill()
      ctx.strokeStyle = `hsl(${hue}, 90%, 70%)`
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Bounds
    ctx.strokeStyle = viewingCellRef.current ? '#d946ef' : '#06b6d4' // fuchsia-500 : cyan-500
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, size, size)
  }, [])

  const init = useCallback(() => {
    archiveRef.current = Array(GRID)
      .fill(0)
      .map(() =>
        Array(GRID)
          .fill(0)
          .map(() => [])
      )
    bestFitnessRef.current = 0
    bestSolutionRef.current = null
    stepsRef.current = 0
    allSolutionsRef.current = []
    viewingCellRef.current = null

    cellQueueRef.current = []
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) cellQueueRef.current.push({ x, y })
    }
    // Shuffle
    for (let i = cellQueueRef.current.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0
      ;[cellQueueRef.current[i], cellQueueRef.current[j]] = [
        cellQueueRef.current[j],
        cellQueueRef.current[i],
      ]
    }

    startNextCell()
    circlesRef.current = []
    // Initial UI update
    setStats({
      bestR: 0,
      steps: 0,
      archiveSize: 0,
      filledCells: 0,
      phase: 'SEED',
      phaseIter: 0,
      phaseMax: SEED_ITERS,
      valid: false,
    })
    draw()
  }, [draw, startNextCell])

  const meStep = useCallback(() => {
    stepsRef.current++

    if (focusPhaseRef.current === 'done' || !focusCellRef.current) {
      // Global optimization
      if (allSolutionsRef.current.length > 0) {
        const idx = (Math.random() * allSolutionsRef.current.length) | 0
        let child = mutateHC(allSolutionsRef.current[idx].solution)
        child = applyVF(child)
        if (isValid(child)) addToArchive(child)
      }
      return
    }

    const { x: tx, y: ty } = focusCellRef.current

    if (focusPhaseRef.current === 'seed') {
      let child = generateForCell(tx, ty)
      child = applyVF(child)
      if (isValid(child)) addToArchive(child, focusCellRef.current)

      phaseItersRef.current++
      if (phaseItersRef.current >= SEED_ITERS) {
        focusPhaseRef.current = 'hc'
        phaseItersRef.current = 0
      }
    } else if (focusPhaseRef.current === 'hc') {
      const best = getBestFromCell(tx, ty)
      if (best) {
        let child = mutateHC(best)
        child = applyVF(child)
        if (isValid(child)) addToArchive(child, focusCellRef.current)
      }
      phaseItersRef.current++
      if (phaseItersRef.current >= HC_ITERS) {
        focusPhaseRef.current = 'es'
        phaseItersRef.current = 0
      }
    } else if (focusPhaseRef.current === 'es') {
      const arr = archiveRef.current[tx][ty]
      if (arr.length >= 2) {
        const p1 = clone(arr[(Math.random() * arr.length) | 0].solution)
        const p2 = clone(arr[(Math.random() * arr.length) | 0].solution)
        let child = crossover(p1, p2, (3 + Math.random() * 5) | 0)
        if (Math.random() < 0.5) child = mutateHC(child)
        child = applyVF(child)
        if (isValid(child)) addToArchive(child, focusCellRef.current)
      } else if (arr.length === 1) {
        let child = mutateHC(clone(arr[0].solution))
        child = applyVF(child)
        if (isValid(child)) addToArchive(child, focusCellRef.current)
      }

      phaseItersRef.current++
      if (phaseItersRef.current >= ES_ITERS) {
        startNextCell()
      }
    }
  }, [addToArchive, getBestFromCell, startNextCell])

  const animate = useCallback(() => {
    if (!runningRef.current) return

    // Batch steps for performance
    for (let i = 0; i < 50; i++) meStep()

    // Update stats rarely to save React renders
    if (stepsRef.current % 200 === 0) {
      let filled = 0
      for (let x = 0; x < GRID; x++)
        for (let y = 0; y < GRID; y++) if (archiveRef.current[x][y].length > 0) filled++

      setStats({
        bestR: bestFitnessRef.current,
        steps: stepsRef.current,
        archiveSize: allSolutionsRef.current.length,
        filledCells: filled,
        phase: focusPhaseRef.current.toUpperCase(),
        phaseIter: phaseItersRef.current,
        phaseMax:
          focusPhaseRef.current === 'seed'
            ? SEED_ITERS
            : focusPhaseRef.current === 'hc'
              ? HC_ITERS
              : focusPhaseRef.current === 'es'
                ? ES_ITERS
                : 0,
        valid: bestSolutionRef.current ? isValid(bestSolutionRef.current) : false,
      })
    }

    draw() // Draw every frame
    requestRef.current = requestAnimationFrame(animate)
  }, [draw, meStep])

  const toggleRun = useCallback(() => {
    runningRef.current = !runningRef.current
    setIsRunning(runningRef.current)
    if (runningRef.current) {
      requestRef.current = requestAnimationFrame(animate)
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [animate])

  const manualStep = useCallback(
    (n: number) => {
      // Must have some initial state
      if (!archiveRef.current.length || archiveRef.current[0][0] === undefined) return
      for (let i = 0; i < n; i++) meStep()
      draw()
      // Forced update
      let filled = 0
      for (let x = 0; x < GRID; x++)
        for (let y = 0; y < GRID; y++) if (archiveRef.current[x][y].length > 0) filled++
      setStats({
        bestR: bestFitnessRef.current,
        steps: stepsRef.current,
        archiveSize: allSolutionsRef.current.length,
        filledCells: filled,
        phase: focusPhaseRef.current.toUpperCase(),
        phaseIter: phaseItersRef.current,
        phaseMax:
          focusPhaseRef.current === 'seed'
            ? SEED_ITERS
            : focusPhaseRef.current === 'hc'
              ? HC_ITERS
              : focusPhaseRef.current === 'es'
                ? ES_ITERS
                : 0,
        valid: true,
      })
    },
    [draw, meStep]
  )

  // Handle cell click
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      viewingCellRef.current = { x, y }
      draw()
      // Force update to show we are viewing a cell could be added here if needed
    },
    [draw]
  )

  const handleGlobalClick = useCallback(() => {
    viewingCellRef.current = null
    draw()
  }, [draw])

  // Init on mount
  useEffect(() => {
    init()
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [init])

  return (
    <div className="my-8 rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left: Canvas */}
        <div className="relative aspect-square w-full md:w-[400px]">
          <canvas
            ref={canvasRef}
            className="h-full w-full rounded-lg border border-gray-700 bg-black"
          />
          <div className="absolute top-2 left-2 font-mono text-xs text-cyan-400">
            {viewingCellRef.current
              ? `VIEW: Cell (${viewingCellRef.current.x}, ${viewingCellRef.current.y})`
              : 'VIEW: Global Best'}
          </div>
        </div>

        {/* Right: Controls & Stats */}
        <div className="flex flex-1 flex-col gap-4 font-mono text-sm text-gray-300">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={init}
              className="rounded bg-gray-700 px-3 py-1 hover:bg-gray-600 active:bg-gray-500"
            >
              Reset
            </button>
            <button
              onClick={toggleRun}
              className={`min-w-[80px] rounded px-3 py-1 font-bold text-black transition-colors ${
                isRunning ? 'bg-orange-500 hover:bg-orange-400' : 'bg-cyan-500 hover:bg-cyan-400'
              }`}
            >
              {isRunning ? 'Stop' : 'Run'}
            </button>
            <button
              onClick={() => manualStep(100)}
              className="rounded bg-gray-800 px-2 py-1 hover:bg-gray-700"
            >
              +100
            </button>
            <button
              onClick={() => manualStep(1000)}
              className="rounded bg-gray-800 px-2 py-1 hover:bg-gray-700"
            >
              +1k
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-gray-700 bg-gray-800 p-2">
              <div className="text-gray-500">Global Best</div>
              <div className="text-xl font-bold text-cyan-400">{stats.bestR.toFixed(4)}</div>
            </div>
            <div className="rounded border border-gray-700 bg-gray-800 p-2">
              <div className="text-gray-500">Archive</div>
              <div className="text-xl font-bold">
                {stats.filledCells}
                <span className="text-sm text-gray-600">/100</span>
              </div>
            </div>
            <div className="col-span-2 flex justify-between rounded border border-gray-700 bg-gray-800 p-2">
              <div>
                <div className="text-gray-500">Steps</div>
                <div>{stats.steps}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">Phase</div>
                <div
                  className={`font-bold ${
                    stats.phase === 'DONE' ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {stats.phase}{' '}
                  {stats.phase !== 'DONE' &&
                    stats.phase !== '-' &&
                    `(${stats.phaseIter}/${stats.phaseMax})`}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Viz */}
          <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
              <span className="text-xs text-gray-400">
                Archive Grid <span className="text-gray-600">(Click cells to inspect)</span>
              </span>
              <button onClick={handleGlobalClick} className="text-xs text-cyan-400 hover:underline">
                View Global
              </button>
            </div>
            <div
              className="grid gap-[1px] border border-gray-700 bg-gray-800"
              style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
            >
              {(() => {
                const cells = []
                // MAP-Elites grid is x (variance) by y (symmetry/large-count)
                // We render Y top-down (init y=9 down to 0)
                for (let y = GRID - 1; y >= 0; y--) {
                  for (let x = 0; x < GRID; x++) {
                    const count = archiveRef.current[x]?.[y]?.length || 0
                    const isViewing =
                      viewingCellRef.current?.x === x && viewingCellRef.current?.y === y
                    // Check if focus cell
                    const isFocus = focusCellRef.current?.x === x && focusCellRef.current?.y === y

                    // Determine color based on count
                    let bgClass = 'bg-gray-900'
                    if (count > 0) bgClass = 'bg-cyan-900/40 text-cyan-200'
                    if (count >= TOP_K) bgClass = 'bg-cyan-700 text-white'
                    if (isViewing) bgClass = 'ring-2 ring-fuchsia-500 z-10'
                    if (isFocus) bgClass += ' ring-1 ring-yellow-400'

                    cells.push(
                      <div
                        key={`${x}-${y}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => count > 0 && handleCellClick(x, y)}
                        onKeyDown={(e) => {
                          if ((e.key === 'Enter' || e.key === ' ') && count > 0) {
                            handleCellClick(x, y)
                          }
                        }}
                        className={`flex aspect-square cursor-pointer items-center justify-center text-[8px] hover:bg-gray-600 ${bgClass}`}
                        title={`Cell (${x},${y}): ${count} solutions`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    )
                  }
                }
                return cells
              })()}
            </div>
          </div>
        </div>
      </div>
      <Caption>
        Interactive MAP-Elites simulation. The grid represents the behavioral space (Symmetry vs.
        Radius Variance). The algorithm illuminates the map by finding the best circle packing for
        each cell. <strong>Click on any filled grid cell to view that specific solution.</strong>
      </Caption>
    </div>
  )
}
