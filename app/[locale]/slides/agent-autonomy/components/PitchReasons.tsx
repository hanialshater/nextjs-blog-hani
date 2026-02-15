'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const reasons = [
  {
    id: 'vortex',
    icon: '🌀',
    title: 'AI in the Algorithm Seat',
    subtitle: 'Changes the Game',
    detail:
      "You don't write algorithms. You hire agents to invent them. Neuro-symbolic: neural reasoning producing symbolic code.",
  },
  {
    id: 'beachhead',
    icon: '🏝️',
    title: 'Bounded Problems = Beachhead',
    subtitle: 'Ever-Expanding Market',
    detail:
      'Start where autonomy works. Not one-time builds—continuous artifact creation. Break into any domain.',
  },
  {
    id: 'architecture',
    icon: '🏗️',
    title: 'Gap = Architecture',
    subtitle: 'LLMs Are Ready',
    detail:
      "Models are capable. What's missing? Layer 3: orchestration, evaluation, evolution. Build the architecture.",
  },
  {
    id: 'layer3',
    icon: '🎯',
    title: 'Layer 3 Frontier',
    subtitle: 'Uncharted Territory',
    detail:
      "Current platforms say 'you figure it out.' Deep Mode automates Layer 3. Fluent autonomy is the future.",
  },
  {
    id: 'moat',
    icon: '📚',
    title: 'Pattern Encyclopedia',
    subtitle: 'Defensible Moat',
    detail:
      'Named patterns. Right epistemology. The library grows across domains. Patterns transfer. Moat deepens.',
  },
  {
    id: 'stack',
    icon: '🔧',
    title: 'Own Your Stack',
    subtitle: 'Strategic Choice',
    detail:
      'Fluent autonomy needs training on Layer 3 work. Build your own architecture or partner strategically.',
  },
]

export default function PitchReasons() {
  const [activeReason, setActiveReason] = useState<string | null>('vortex')

  const activeItem = reasons.find((r) => r.id === activeReason)

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Left: Hero Image */}
      <div className="flex w-2/5 items-center justify-center p-4">
        <img
          src="/static/images/slides/arc7_pitch_hero.png"
          alt="Deep Mode for Vibe Coding"
          className="max-h-[85%] max-w-full rounded-xl object-contain shadow-2xl"
        />
      </div>

      {/* Right: Interactive Content */}
      <div className="flex w-3/5 flex-col justify-center p-6">
        <h2 className="mb-1 text-3xl font-bold text-white">Why Deep Mode Matters</h2>
        <p className="mb-6 text-blue-400">For Vibe Coding Platforms</p>

        {/* Reasons Grid - 2x3 */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {reasons.map((reason) => (
            <button
              key={reason.id}
              onClick={() => setActiveReason(reason.id)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 ${
                activeReason === reason.id
                  ? 'border-blue-400 bg-blue-600 shadow-lg'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <span className="text-2xl">{reason.icon}</span>
              <div>
                <span
                  className={`text-sm font-semibold ${activeReason === reason.id ? 'text-white' : 'text-gray-300'}`}
                >
                  {reason.title}
                </span>
                <p
                  className={`text-xs ${activeReason === reason.id ? 'text-blue-200' : 'text-gray-500'}`}
                >
                  {reason.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          {activeItem && (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="rounded-lg border border-gray-700 bg-gray-800/80 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">{activeItem.icon}</span>
                <h3 className="text-lg font-bold text-white">{activeItem.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">{activeItem.detail}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
