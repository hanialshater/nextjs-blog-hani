'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const skills = [
    {
        id: 'research',
        name: 'Deep Research',
        icon: '🔍',
        image: '/static/images/slides/arc3_ms_deep_research_v2.png',
        knowledge: "Before writing a single line of code, the agent must understand the problem space. Analyzing papers, existing implementations, and theoretical limits to form a robust plan."
    },
    {
        id: 'visual',
        name: 'Visual Thinking',
        icon: '👁️',
        gallery: [
            { label: 'Merge Sort', image: '/static/images/agent-autonomy/merge-sort-visual.png' },
            { label: 'Count-Min Sketch', image: '/static/images/agent-autonomy/count-min-sketch-visual.png' },
            { label: 'Poincaré Embeddings', image: '/static/images/agent-autonomy/poincare-visual.png' },
            { label: 'A* Search', image: '/static/images/agent-autonomy/astar-visual.png' }
        ]
    },
    {
        id: 'complexity',
        name: 'Computational Complexity',
        icon: '🌳',
        image: '/static/images/slides/arc1_04_flip_final.png',
        knowledge: "Standard generation leads to fragile code. To tackle extreme complexity, we switch to **Code Evolution**: searching the algorithm space to discover robust solutions that 'prompting' alone cannot find."
    },
    {
        id: 'decision',
        name: 'Iterative Refinement',
        icon: '📈',
        image: '/static/images/slides/arc3_ms_refinement_v2.png',
        knowledge: "Agency is iterative. The agent starts with raw logic (Step 1), refines the visuals (Step 2), and finally adds interactivity (Step 3) to create a compelling demo."
    },
    {
        id: 'tom',
        name: 'Theory of Mind',
        icon: '🧠',
        image: '/static/images/slides/arc3_ms_tom.png',
        knowledge: "To teach or explain, the agent must simulate the user's mental state. 'Is this confusing?' 'Will they understand this variable name?' Empathy is a technical skill."
    },
    {
        id: 'creativity',
        name: 'Creative Horizons',
        icon: '🔭',
        image: '/static/images/slides/arc3_ms_creativity_v2.png',
        knowledge: "Creativity isn't magic; it's **Novelty Search**. The agent escapes local optima by actively exploring the 'Horizon'—regions of the search space that are high-quality but fundamentally different from standard solutions."
    },
    {
        id: 'evaluation',
        name: 'Evaluation',
        icon: '⚖️',
        image: '/static/images/slides/arc3_ms_evaluation.png',
        knowledge: "Evaluation must be **Rubric-Free** (capture 'vibe' without rigid rules), **Isolated** (prevent contamination), and use **ELO-like Scaling** (comparative ranking) to measure progress.",
        gallery: [
            { label: 'Isolation', image: '/static/images/agent-autonomy/eval_04_isolation.png' },
            { label: 'Rubric Free', image: '/static/images/agent-autonomy/eval_05_rubric_free.png' },
            { label: 'ELO Scaling', image: '/static/images/agent-autonomy/eval_06_elo_scaling.png' }
        ]
    }
]

export default function InteractiveSkills() {
    const [activeSkillId, setActiveSkillId] = useState<string>(skills[0].id)
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)

    const activeSkill = skills.find(s => s.id === activeSkillId) || skills[0]

    // We need to render based on current state, images are derived
    const currentImage = activeSkill.gallery
        ? activeSkill.gallery[activeGalleryIndex].image
        : activeSkill.image

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">The Vibe Coder's Workbench</h2>

            <div className="flex w-full max-w-6xl h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Left Column: Skill Menu */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
                    <div className="p-6 pb-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Core Capabilities</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {skills.map((skill) => (
                            <button
                                key={skill.id}
                                onMouseEnter={() => {
                                    setActiveSkillId(skill.id)
                                    setActiveGalleryIndex(0)
                                }}
                                onClick={() => {
                                    setActiveSkillId(skill.id)
                                    setActiveGalleryIndex(0)
                                }}
                                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4 group ${activeSkillId === skill.id
                                    ? 'bg-white shadow-md text-orange-600 border border-orange-100 scale-100'
                                    : 'hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900 border border-transparent'
                                    }`}
                            >
                                <span className="text-2xl group-hover:scale-110 transition-transform">{skill.icon}</span>
                                <span className={`font-semibold ${activeSkillId === skill.id ? 'font-bold' : ''}`}>
                                    {skill.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: The Stage */}
                <div className="w-2/3 relative flex items-center justify-center bg-white overflow-hidden p-8">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeSkillId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full flex flex-col items-center"
                        >
                            {/* Tabs for Gallery (if present) */}
                            {activeSkill.gallery && (
                                <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                                    {activeSkill.gallery.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveGalleryIndex(idx)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeGalleryIndex === idx
                                                ? 'bg-white text-orange-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* The Image */}
                            <div className="relative w-full h-[65%] mb-6 rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                <img
                                    src={currentImage}
                                    alt={activeSkill.name}
                                    className="w-full h-full object-contain p-4"
                                />
                            </div>

                            {/* The Knowledge Card */}
                            <div className="w-full bg-orange-50 p-6 rounded-xl border border-orange-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xl">{activeSkill.icon}</span>
                                    <h3 className="font-bold text-orange-900 text-lg">{activeSkill.name}</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                    {activeSkill.knowledge}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
