'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const pillars = [
    {
        id: 'layers',
        name: '1. Layered Abstraction',
        icon: '🎯',
        image: '/static/images/slides/arc4_01_layers.png',
        knowledge: "Work at the **right level**. Switching LLMs? Layer 0—marginal gains. Better coding agent? Layer 1—still marginal. The real leverage is **Layer 3**: orchestration, evaluation, evolution."
    },
    {
        id: 'epistemology',
        name: '2. Right Epistemology',
        icon: '🔬',
        image: '/static/images/slides/arc4_02_epistemology.png',
        knowledge: "We don't learn from loss functions. We learn from **real experiments**. Patterns carry *consequences*—understanding them means knowing *why* they work and *what you sacrifice*."
    },
    {
        id: 'encyclopedia',
        name: '3. Pattern Encyclopedia',
        icon: '📚',
        image: '/static/images/slides/arc4_pattern_language.png',
        knowledge: "Like Alexander's *A Pattern Language*: named patterns, documented consequences, explicit composition rules. 'Multi-Evaluator Independence', 'Strategic Constraint', 'Visual-Linguistic Bridge'."
    },
    {
        id: 'architecture',
        name: '4. The Architecture',
        icon: '🏗️',
        image: '/static/images/slides/arc4_04_architecture.png',
        knowledge: "**Separation of concerns**: Builders never see evaluation (no gaming). Evaluators never see each other (no collusion). Browser provides ground truth. Skills encode expertise."
    }
]

export default function InteractivePhilosophy() {
    const [activePillarId, setActivePillarId] = useState<string>(pillars[0].id)

    const activePillar = pillars.find(p => p.id === activePillarId) || pillars[0]

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Philosophy: Deep Mode</h2>

            <div className="flex w-full max-w-6xl h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Left Column: Pillar Menu */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
                    <div className="p-6 pb-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">The 4 Pillars</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {pillars.map((pillar) => (
                            <button
                                key={pillar.id}
                                onMouseEnter={() => setActivePillarId(pillar.id)}
                                onClick={() => setActivePillarId(pillar.id)}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4 group ${activePillarId === pillar.id
                                    ? 'bg-white shadow-md text-blue-600 border border-blue-100 scale-100'
                                    : 'hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 border border-transparent'
                                    }`}
                            >
                                <span className="text-2xl group-hover:scale-110 transition-transform">{pillar.icon}</span>
                                <span className={`font-semibold ${activePillarId === pillar.id ? 'font-bold' : ''}`}>
                                    {pillar.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: The Stage */}
                <div className="w-2/3 relative flex items-center justify-center bg-white overflow-hidden p-8">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activePillarId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full flex flex-col items-center"
                        >
                            {/* The Image */}
                            <div className="relative w-full h-[65%] mb-6 rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                <img
                                    src={activePillar.image}
                                    alt={activePillar.name}
                                    className="w-full h-full object-contain p-4"
                                />
                            </div>

                            {/* The Knowledge Card */}
                            <div className="w-full bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xl">{activePillar.icon}</span>
                                    <h3 className="font-bold text-blue-900 text-lg">{activePillar.name}</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
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
