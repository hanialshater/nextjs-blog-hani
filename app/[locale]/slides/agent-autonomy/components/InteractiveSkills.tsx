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
    knowledge:
      'Before writing a single line of code, the agent must understand the problem space. Analyzing papers, existing implementations, and theoretical limits to form a robust plan.',
  },
  {
    id: 'visual',
    name: 'Visual Thinking',
    icon: '👁️',
    gallery: [
      { label: 'Merge Sort', image: '/static/images/agent-autonomy/merge-sort-visual.png' },
      {
        label: 'Count-Min Sketch',
        image: '/static/images/agent-autonomy/count-min-sketch-visual.png',
      },
      { label: 'Poincaré Embeddings', image: '/static/images/agent-autonomy/poincare-visual.png' },
      { label: 'A* Search', image: '/static/images/agent-autonomy/astar-visual.png' },
    ],
  },
  {
    id: 'complexity',
    name: 'Computational Complexity',
    icon: '🌳',
    image: '/static/images/slides/arc1_04_flip_final.png',
    knowledge:
      "Standard generation leads to fragile code. To tackle extreme complexity, we switch to **Code Evolution**: searching the algorithm space to discover robust solutions that 'prompting' alone cannot find.",
  },
  {
    id: 'decision',
    name: 'Iterative Refinement',
    icon: '📈',
    image: '/static/images/slides/arc3_ms_refinement_v2.png',
    knowledge:
      'Agency is iterative. The agent starts with raw logic (Step 1), refines the visuals (Step 2), and finally adds interactivity (Step 3) to create a compelling demo.',
  },
  {
    id: 'tom',
    name: 'Theory of Mind',
    icon: '🧠',
    image: '/static/images/slides/arc3_ms_tom.png',
    knowledge:
      "To teach or explain, the agent must simulate the user's mental state. 'Is this confusing?' 'Will they understand this variable name?' Empathy is a technical skill.",
  },
  {
    id: 'creativity',
    name: 'Creative Horizons',
    icon: '🔭',
    image: '/static/images/slides/arc3_ms_creativity_v2.png',
    knowledge:
      "Creativity isn't magic; it's **Novelty Search**. The agent escapes local optima by actively exploring the 'Horizon'—regions of the search space that are high-quality but fundamentally different from standard solutions.",
  },
  {
    id: 'evaluation',
    name: 'Evaluation',
    icon: '⚖️',
    image: '/static/images/slides/arc3_ms_evaluation.png',
    knowledge:
      "Evaluation must be **Rubric-Free** (capture 'vibe' without rigid rules), **Isolated** (prevent contamination), and use **ELO-like Scaling** (comparative ranking) to measure progress.",
    gallery: [
      { label: 'Isolation', image: '/static/images/agent-autonomy/eval_04_isolation.png' },
      { label: 'Rubric Free', image: '/static/images/agent-autonomy/eval_05_rubric_free.png' },
      { label: 'ELO Scaling', image: '/static/images/agent-autonomy/eval_06_elo_scaling.png' },
    ],
  },
]

export default function InteractiveSkills() {
  const [activeSkillId, setActiveSkillId] = useState<string>(skills[0].id)
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)

  const activeSkill = skills.find((s) => s.id === activeSkillId) || skills[0]

  // We need to render based on current state, images are derived
  const currentImage = activeSkill.gallery
    ? activeSkill.gallery[activeGalleryIndex].image
    : activeSkill.image

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-8">
      <h2 className="mb-8 text-3xl font-bold text-gray-800">The Vibe Coder's Workbench</h2>

      <div className="flex h-[600px] w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Left Column: Skill Menu */}
        <div className="flex w-1/3 flex-col border-r border-gray-100 bg-gray-50/50">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              Core Capabilities
            </h3>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
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
                className={`group flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 ${
                  activeSkillId === skill.id
                    ? 'scale-100 border border-orange-100 bg-white text-orange-600 shadow-md'
                    : 'border border-transparent text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <span className="text-2xl transition-transform group-hover:scale-110">
                  {skill.icon}
                </span>
                <span className={`font-semibold ${activeSkillId === skill.id ? 'font-bold' : ''}`}>
                  {skill.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: The Stage */}
        <div className="relative flex w-2/3 items-center justify-center overflow-hidden bg-white p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSkillId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex h-full w-full flex-col items-center"
            >
              {/* Tabs for Gallery (if present) */}
              {activeSkill.gallery && (
                <div className="mb-4 flex gap-2 rounded-lg bg-gray-100 p-1">
                  {activeSkill.gallery.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        activeGalleryIndex === idx
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
              <div className="relative mb-6 h-[65%] w-full overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                <img
                  src={currentImage}
                  alt={activeSkill.name}
                  className="h-full w-full object-contain p-4"
                />
              </div>

              {/* The Knowledge Card */}
              <div className="w-full rounded-xl border border-orange-100 bg-orange-50 p-6">
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xl">{activeSkill.icon}</span>
                  <h3 className="text-lg font-bold text-orange-900">{activeSkill.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 md:text-base">
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
