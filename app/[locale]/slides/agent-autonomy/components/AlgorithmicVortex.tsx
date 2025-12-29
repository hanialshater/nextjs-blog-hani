'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const operations = [
    {
        id: 'crossover',
        name: 'Crossover',
        icon: '🧬',
        description: 'Blend ideas from multiple agents. Take the tree from Agent A, the lesson structure from Agent B.',
        example: 'Tree + Lessons → Tree in center with lesson sidebar'
    },
    {
        id: 'sophistication',
        name: 'Add Sophistication',
        icon: '🎨',
        description: 'Deepen visual complexity. Add animations, color coding, interactive hints.',
        example: 'Static bars → Animated bars with phase colors'
    },
    {
        id: 'simplify',
        name: 'Simplify',
        icon: '✂️',
        description: 'Strip to core concept. Reduce cognitive load. Less is more.',
        example: '15 UI elements → 5 essential elements'
    },
    {
        id: 'fix_bugs',
        name: 'Fix Bugs',
        icon: '🔧',
        description: 'Repair issues found during browser evaluation. Make it actually work.',
        example: 'Evaluation: "Sort button doesn\'t respond" → Fixed click handler'
    },
    {
        id: 'iterate_patterns',
        name: 'Iterate Patterns',
        icon: '🔄',
        description: 'Try entirely new visual metaphors. Escape local optima.',
        example: 'Tree visualization → Flowchart visualization'
    },
    {
        id: 'pedagogy',
        name: 'Improve Pedagogy',
        icon: '📚',
        description: 'Enhance learning effectiveness. Add explanations, progressive disclosure.',
        example: 'Just show sorting → Show why each step matters'
    }
]

export default function AlgorithmicVortex() {
    const [activeOp, setActiveOp] = useState<string | null>(null)

    const activeOperation = operations.find(op => op.id === activeOp)

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">The Algorithmic Vortex</h2>
            <p className="text-gray-600 mb-8 text-center max-w-2xl">
                The orchestrator assigns <span className="font-semibold text-blue-600">direction</span> and <span className="font-semibold text-orange-600">operations</span>.
                Agents <span className="italic">discover</span> the implementation.
            </p>

            {/* Operations Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl">
                {operations.map((op) => (
                    <button
                        key={op.id}
                        onMouseEnter={() => setActiveOp(op.id)}
                        onClick={() => setActiveOp(op.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${activeOp === op.id
                                ? 'bg-white border-blue-400 shadow-lg scale-105'
                                : 'bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-white'
                            }`}
                    >
                        <span className="text-2xl mb-2 block">{op.icon}</span>
                        <span className={`font-semibold ${activeOp === op.id ? 'text-blue-600' : 'text-gray-700'}`}>
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
                        className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full border border-gray-200"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{activeOperation.icon}</span>
                            <h3 className="text-xl font-bold text-gray-800">{activeOperation.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-4">{activeOperation.description}</p>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Example</span>
                            <p className="text-gray-700 mt-1">{activeOperation.example}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!activeOperation && (
                <div className="bg-gray-100 rounded-xl p-6 max-w-2xl w-full text-center text-gray-500">
                    Hover over an operation to see details
                </div>
            )}
        </div>
    )
}
