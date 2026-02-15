'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const pillars = [
  {
    id: 'layers',
    name: '1. Layered Abstraction',
    icon: '🎯',
    image: '/static/images/slides/arc4_01_layers.png',
    knowledge:
      'Work at the **right level**. Switching LLMs? Layer 0—marginal gains. Better coding agent? Layer 1—still marginal. The real leverage is **Layer 3**: orchestration, evaluation, evolution.',
  },
  {
    id: 'epistemology',
    name: '2. Right Epistemology',
    icon: '🔬',
    image: '/static/images/slides/arc4_02_epistemology.png',
    knowledge:
      "We don't learn from loss functions. We learn from **real experiments**. Patterns carry *consequences*—understanding them means knowing *why* they work and *what you sacrifice*.",
  },
  {
    id: 'encyclopedia',
    name: '3. Pattern Encyclopedia',
    icon: '📚',
    image: '/static/images/slides/arc4_pattern_language.png',
    knowledge:
      "Like Alexander's *A Pattern Language*: named patterns, documented consequences, explicit composition rules. 'Multi-Evaluator Independence', 'Strategic Constraint', 'Visual-Linguistic Bridge'.",
  },
  {
    id: 'architecture',
    name: '4. The Architecture',
    icon: '🏗️',
    image: '/static/images/slides/arc4_04_architecture.png',
    knowledge:
      '**Separation of concerns**: Builders never see evaluation (no gaming). Evaluators never see each other (no collusion). Browser provides ground truth. Skills encode expertise.',
  },
]

export default function InteractivePhilosophy() {
  const [activePillarId, setActivePillarId] = useState<string>(pillars[0].id)

  const activePillar = pillars.find((p) => p.id === activePillarId) || pillars[0]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-8">
      <h2 className="mb-8 text-3xl font-bold text-gray-800">Our Philosophy: Deep Mode</h2>

      <div className="flex h-[600px] w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Left Column: Pillar Menu */}
        <div className="flex w-1/3 flex-col border-r border-gray-100 bg-gray-50/50">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              The 4 Pillars
            </h3>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {pillars.map((pillar) => (
              <button
                key={pillar.id}
                onMouseEnter={() => setActivePillarId(pillar.id)}
                onClick={() => setActivePillarId(pillar.id)}
                className={`group flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 ${
                  activePillarId === pillar.id
                    ? 'scale-100 border border-blue-100 bg-white text-blue-600 shadow-md'
                    : 'border border-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <span className="text-2xl transition-transform group-hover:scale-110">
                  {pillar.icon}
                </span>
                <span
                  className={`font-semibold ${activePillarId === pillar.id ? 'font-bold' : ''}`}
                >
                  {pillar.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: The Stage */}
        <div className="relative flex w-2/3 items-center justify-center overflow-hidden bg-white p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillarId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex h-full w-full flex-col items-center"
            >
              {/* The Image */}
              <div className="relative mb-6 h-[65%] w-full overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                <img
                  src={activePillar.image}
                  alt={activePillar.name}
                  className="h-full w-full object-contain p-4"
                />
              </div>

              {/* The Knowledge Card */}
              <div className="w-full rounded-xl border border-blue-100 bg-blue-50 p-6">
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xl">{activePillar.icon}</span>
                  <h3 className="text-lg font-bold text-blue-900">{activePillar.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                  {activePillar.knowledge}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
