'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const operations = [
  {
    id: 'crossover',
    name: 'Crossover',
    icon: '🧬',
    description:
      'Blend ideas from multiple agents. Take the tree from Agent A, the lesson structure from Agent B.',
    example: 'Tree + Lessons → Tree in center with lesson sidebar',
  },
  {
    id: 'sophistication',
    name: 'Add Sophistication',
    icon: '🎨',
    description: 'Deepen visual complexity. Add animations, color coding, interactive hints.',
    example: 'Static bars → Animated bars with phase colors',
  },
  {
    id: 'simplify',
    name: 'Simplify',
    icon: '✂️',
    description: 'Strip to core concept. Reduce cognitive load. Less is more.',
    example: '15 UI elements → 5 essential elements',
  },
  {
    id: 'fix_bugs',
    name: 'Fix Bugs',
    icon: '🔧',
    description: 'Repair issues found during browser evaluation. Make it actually work.',
    example: 'Evaluation: "Sort button doesn\'t respond" → Fixed click handler',
  },
  {
    id: 'iterate_patterns',
    name: 'Iterate Patterns',
    icon: '🔄',
    description: 'Try entirely new visual metaphors. Escape local optima.',
    example: 'Tree visualization → Flowchart visualization',
  },
  {
    id: 'pedagogy',
    name: 'Improve Pedagogy',
    icon: '📚',
    description: 'Enhance learning effectiveness. Add explanations, progressive disclosure.',
    example: 'Just show sorting → Show why each step matters',
  },
]

export default function AlgorithmicVortex() {
  const [activeOp, setActiveOp] = useState<string | null>(null)

  const activeOperation = operations.find((op) => op.id === activeOp)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <h2 className="mb-2 text-3xl font-bold text-gray-800">The Algorithmic Vortex</h2>
      <p className="mb-8 max-w-2xl text-center text-gray-600">
        The orchestrator assigns <span className="font-semibold text-blue-600">direction</span> and{' '}
        <span className="font-semibold text-orange-600">operations</span>. Agents{' '}
        <span className="italic">discover</span> the implementation.
      </p>

      {/* Operations Grid */}
      <div className="mb-8 grid max-w-4xl grid-cols-3 gap-4">
        {operations.map((op) => (
          <button
            key={op.id}
            onMouseEnter={() => setActiveOp(op.id)}
            onClick={() => setActiveOp(op.id)}
            className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              activeOp === op.id
                ? 'scale-105 border-blue-400 bg-white shadow-lg'
                : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white'
            }`}
          >
            <span className="mb-2 block text-2xl">{op.icon}</span>
            <span
              className={`font-semibold ${activeOp === op.id ? 'text-blue-600' : 'text-gray-700'}`}
            >
              {op.name}
            </span>
          </button>
        ))}
      </div>

      {/* Detail Panel */}
      <AnimatePresence mode="wait">
        {activeOperation && (
          <motion.div
            key={activeOperation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{activeOperation.icon}</span>
              <h3 className="text-xl font-bold text-gray-800">{activeOperation.name}</h3>
            </div>
            <p className="mb-4 text-gray-600">{activeOperation.description}</p>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Example</span>
              <p className="mt-1 text-gray-700">{activeOperation.example}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeOperation && (
        <div className="w-full max-w-2xl rounded-xl bg-gray-100 p-6 text-center text-gray-500">
          Hover over an operation to see details
        </div>
      )}
    </div>
  )
}
