'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const reasons = [
    {
        id: 'vortex',
        icon: '🌀',
        title: 'AI in the Algorithm Seat',
        subtitle: 'Changes the Game',
        detail: "You don't write algorithms. You hire agents to invent them. Neuro-symbolic: neural reasoning producing symbolic code."
    },
    {
        id: 'beachhead',
        icon: '🏝️',
        title: 'Bounded Problems = Beachhead',
        subtitle: 'Ever-Expanding Market',
        detail: "Start where autonomy works. Not one-time builds—continuous artifact creation. Break into any domain."
    },
    {
        id: 'architecture',
        icon: '🏗️',
        title: 'Gap = Architecture',
        subtitle: 'LLMs Are Ready',
        detail: "Models are capable. What's missing? Layer 3: orchestration, evaluation, evolution. Build the architecture."
    },
    {
        id: 'layer3',
        icon: '🎯',
        title: 'Layer 3 Frontier',
        subtitle: 'Uncharted Territory',
        detail: "Current platforms say 'you figure it out.' Deep Mode automates Layer 3. Fluent autonomy is the future."
    },
    {
        id: 'moat',
        icon: '📚',
        title: 'Pattern Encyclopedia',
        subtitle: 'Defensible Moat',
        detail: "Named patterns. Right epistemology. The library grows across domains. Patterns transfer. Moat deepens."
    },
    {
        id: 'stack',
        icon: '🔧',
        title: 'Own Your Stack',
        subtitle: 'Strategic Choice',
        detail: "Fluent autonomy needs training on Layer 3 work. Build your own architecture or partner strategically."
    }
]

export default function PitchReasons() {
    const [activeReason, setActiveReason] = useState<string | null>('vortex')

    const activeItem = reasons.find(r => r.id === activeReason)

    return (
        <div className="h-full w-full flex bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Left: Hero Image */}
            <div className="w-2/5 flex items-center justify-center p-4">
                <img
                    src="/static/images/slides/arc7_pitch_hero.png"
                    alt="Deep Mode for Vibe Coding"
                    className="max-w-full max-h-[85%] object-contain rounded-xl shadow-2xl"
                />
            </div>

            {/* Right: Interactive Content */}
            <div className="w-3/5 flex flex-col justify-center p-6">
                <h2 className="text-3xl font-bold mb-1 text-white">Why Deep Mode Matters</h2>
                <p className="text-blue-400 mb-6">For Vibe Coding Platforms</p>

                {/* Reasons Grid - 2x3 */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {reasons.map((reason) => (
                        <button
                            key={reason.id}
                            onClick={() => setActiveReason(reason.id)}
                            className={`p-3 rounded-lg border transition-all duration-200 text-left flex items-center gap-3 ${activeReason === reason.id
                                    ? 'bg-blue-600 border-blue-400 shadow-lg'
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                                }`}
                        >
                            <span className="text-2xl">{reason.icon}</span>
                            <div>
                                <span className={`font-semibold text-sm ${activeReason === reason.id ? 'text-white' : 'text-gray-300'}`}>
                                    {reason.title}
                                </span>
                                <p className={`text-xs ${activeReason === reason.id ? 'text-blue-200' : 'text-gray-500'}`}>
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
                            className="bg-gray-800/80 rounded-lg p-4 border border-gray-700"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{activeItem.icon}</span>
                                <h3 className="text-lg font-bold text-white">{activeItem.title}</h3>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{activeItem.detail}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
