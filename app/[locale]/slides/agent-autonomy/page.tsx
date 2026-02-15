'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import InteractiveSkills from './components/InteractiveSkills'
import InteractivePhilosophy from './components/InteractivePhilosophy'
import CountMinSketchDemo from './components/CountMinSketchDemo'
import AlgorithmicVortex from './components/AlgorithmicVortex'
import PitchReasons from './components/PitchReasons'

// Dynamic imports for interactive demo components
const EvolvedDemos = dynamic(() => import('@/components/EvolvedDemos'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-gray-400">Loading demos...</div>
  ),
})

const MapElitesDemo = dynamic(() => import('@/components/MapElitesDemo'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-gray-400">Loading MAP-Elites...</div>
  ),
})

interface Slide {
  id: string
  act: string
  type: 'image' | 'component' | 'content'
  imageUrl?: string
  content?: React.ReactNode
}

const slides: Slide[] = [
  // 1. Title (Deep Mode)
  {
    id: 'title',
    act: 'Part 1: The Possibility',
    type: 'image',
    imageUrl: '/static/images/slides/arc1_01_title_final.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <img
          src="/static/images/slides/arc1_01_title_final.png"
          className="max-h-full rounded-xl object-contain shadow-2xl"
          alt="Title Slide"
        />
      </div>
    ),
  },

  // 2. Problem Solver Seat (Circle Packing Example)
  {
    id: 'problem-seat',
    act: 'The Problem',
    type: 'image',
    imageUrl: '/static/images/agent-autonomy/circle-packing-example.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <h2 className="mb-4 text-3xl font-bold text-gray-800">The Problem: Circle Packing</h2>
        <img
          src="/static/images/agent-autonomy/circle-packing-example.png"
          className="max-h-[55%] rounded-xl object-contain shadow-xl"
          alt="Circle Packing Problem"
        />
      </div>
    ),
  },

  // 3. Timeline (Polya -> Neuro-Symbolic)
  {
    id: 'timeline',
    act: 'History of Thought',
    type: 'image',
    imageUrl: '/static/images/slides/arc1_02_timeline_final.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <img
          src="/static/images/slides/arc1_02_timeline_final.png"
          className="max-h-full rounded-xl object-contain shadow-2xl"
          alt="Timeline"
        />
      </div>
    ),
  },

  // 4. Hill Climbing (Context - Getting Stuck)
  {
    id: 'hill-climbing-context',
    act: 'The Symbolic Era',
    type: 'image',
    imageUrl: '/static/images/hill-climbing-progression.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <h2 className="mb-4 text-3xl font-bold text-gray-800">Hill Climbing: Getting Stuck</h2>
        <img
          src="/static/images/hill-climbing-progression.png"
          className="max-h-[80%] rounded-xl border border-gray-100 object-contain shadow-xl"
          alt="Hill Climbing Progression"
        />
      </div>
    ),
  },

  // 5. Evolution (Parallel Exploration)
  {
    id: 'es-context',
    act: 'The Symbolic Era',
    type: 'image',
    imageUrl: '/static/images/evolutionary-strategy-hc.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <h2 className="mb-4 text-3xl font-bold text-gray-800">
          Evolution Strategies: Parallel Exploration
        </h2>
        <img
          src="/static/images/evolutionary-strategy-hc.png"
          className="max-h-[80%] rounded-xl border border-gray-100 object-contain shadow-xl"
          alt="Evolution Strategy"
        />
      </div>
    ),
  },

  // 6. MAP-Elites (Context - Diversity Grid)
  {
    id: 'map-elites-context',
    act: 'The Symbolic Era',
    type: 'component',
    content: (
      <div className="flex h-full flex-col bg-white">
        <div className="border-b border-gray-100 bg-gray-50 p-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            MAP-Elites: Illuminating the Search Space
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto p-8">
          <div className="w-full max-w-6xl">
            <MapElitesDemo />
          </div>
        </div>
      </div>
    ),
  },

  // 7. Algorithm Vortex (The Shift)
  {
    id: 'vortex',
    act: 'The Shift',
    type: 'image',
    imageUrl: '/static/images/slides/arc1_03_vortex_final.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <img
          src="/static/images/slides/arc1_03_vortex_final.png"
          className="max-h-full rounded-xl object-contain shadow-2xl"
          alt="Algorithm Vortex"
        />
      </div>
    ),
  },

  // 8. Expert is You (Content)
  {
    id: 'expert-is-you',
    act: 'The Limitation',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white p-12 text-center">
        <h2 className="mb-8 text-5xl font-bold text-gray-800">The Problem with Symbolic Methods</h2>
        <div className="max-w-4xl rounded-xl border-l-8 border-orange-500 bg-white p-10 shadow-lg">
          <p className="mb-6 text-3xl font-bold text-gray-800">They work...</p>
          <p className="text-2xl text-gray-600">
            ...but <span className="font-bold text-orange-600">YOU</span> have to be the expert.
          </p>
          <p className="mt-8 text-xl text-gray-500 italic">
            You invent the operators. You define the crossover. You tune the parameters.
          </p>
        </div>
      </div>
    ),
  },

  // 9. The Builder (Lego Dragon)
  {
    id: 'the-builder-dragon',
    act: 'The Proposal',
    type: 'image',
    imageUrl: '/static/images/slides/arc2_01_lego_dragon.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          What if we hired the AI to be the expert?
        </h2>
        <img
          src="/static/images/slides/arc2_01_lego_dragon.png"
          className="max-h-[80%] rounded-xl object-contain shadow-2xl"
          alt="The Builder: Lego Dragon"
        />
      </div>
    ),
  },

  // 10. AlphaEvolve (Architecture)
  {
    id: 'alpha-evolve-arch',
    act: 'State of the Art',
    type: 'image',
    imageUrl: '/static/images/agent-autonomy/alpha-evolve.jpeg',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <h2 className="mb-4 text-3xl font-bold text-gray-800">
          AlphaEvolve: The Neuro-Symbolic Architect
        </h2>
        <img
          src="/static/images/agent-autonomy/alpha-evolve.jpeg"
          className="max-h-[80%] rounded-lg object-contain shadow-lg"
          alt="AlphaEvolve Architecture"
        />
      </div>
    ),
  },

  // 11. AlphaEvolve Results (SOTA Score)
  {
    id: 'alpha-evolve-results',
    act: 'State of the Art',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white p-8">
        <h2 className="mb-6 text-3xl font-bold text-gray-800">The Benchmark</h2>
        <img
          src="/static/images/agent-autonomy/alpha-evolve-solution.png"
          className="mb-8 max-h-[60vh] rounded-lg object-contain shadow-lg"
          alt="AlphaEvolve Solution"
        />
        <div className="flex gap-12">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 uppercase">AlphaEvolve Score</p>
            <p className="text-5xl font-bold text-green-600">2.635</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 uppercase">Constraint</p>
            <p className="text-3xl font-bold text-red-500">Immutable Harness</p>
          </div>
        </div>
      </div>
    ),
  },

  // 12. Zero Code (Terminal Simulation)
  {
    id: 'zero-code-terminal',
    act: 'Agent Autonomy',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-gray-900 p-8 md:p-16">
        <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-gray-700 bg-black font-mono text-lg shadow-2xl md:text-xl">
          <div className="flex gap-2 border-b border-gray-700 bg-gray-800 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <div className="ml-4 flex items-center text-xs text-gray-400">agent — claude</div>
          </div>
          <div className="min-h-[400px] p-8 text-green-400">
            <p>
              <span className="text-blue-400">user@agent</span>:
              <span className="text-blue-200">~</span>$ claude
            </p>
            <p className="mt-2 font-bold text-white">Welcome to Claude Code.</p>
            <p className="mt-6">
              <span className="text-blue-400">user@agent</span>:
              <span className="text-blue-200">~</span>$ claude{' '}
              <span className="text-yellow-300">
                "Here is an evaluator.py. Write a solver that maximizes the score. You have full
                autonomy."
              </span>
            </p>
            <p className="mt-6 animate-pulse text-gray-400">Thinking...</p>
            <div className="mt-4 space-y-2 border-l-2 border-gray-700 pl-4 text-gray-300">
              <p>I will start by researching standard algorithms for circle packing.</p>
              <p>
                Found: <span className="text-cyan-400">Greedy</span>,{' '}
                <span className="text-cyan-400">Nelder-Mead</span>,{' '}
                <span className="text-cyan-400">Basin Hopping</span>.
              </p>
              <p>Plan: Create a test harness and benchmark these approaches.</p>
              <p className="text-yellow-500">
                Alert: Greedy works but plateaus. Trying Evolution Strategy next...
              </p>
            </div>
            <p className="mt-6 text-green-400">
              <span className="animate-pulse">_</span>
            </p>
          </div>
        </div>
        <h2 className="mt-12 text-4xl font-bold text-white">Zero Code Evolution</h2>
      </div>
    ),
  },

  // 13. How We Did It (Methodology)
  {
    id: 'methodology',
    act: 'Agent Autonomy',
    type: 'content',
    content: (
      <div className="flex h-full flex-col justify-center bg-white p-12">
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-800">
          How We Did It: The 3 Pillars
        </h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 text-4xl">👮‍♀️</div>
            <p className="mb-2 text-xl font-bold text-blue-800">1. The Vow</p>
            <p className="text-gray-600">
              The Manager never writes code. It only directs. This forces delegation and prevents
              context pollution.
            </p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 text-4xl">⚓️</div>
            <p className="mb-2 text-xl font-bold text-red-800">2. The Harness</p>
            <p className="text-gray-600">
              An Immutable Evaluator. The only anchor of truth. The agent cannot modify the
              definition of success.
            </p>
          </div>
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 text-4xl">✂️</div>
            <p className="mb-2 text-xl font-bold text-purple-800">3. The Pruning</p>
            <p className="text-gray-600">
              Ruthless management of diversity. Kill failing lineages immediately. Invest
              computation only in promising paths.
            </p>
          </div>
        </div>
      </div>
    ),
  },

  // 14. Our Result
  {
    id: 'our-result',
    act: 'The Result',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white p-8">
        <h2 className="mb-6 text-4xl font-bold text-gray-800">Our Result</h2>
        <div className="flex max-w-6xl flex-col items-center gap-12 md:flex-row">
          <img
            src="/static/images/evolutionary-strategy.png"
            className="w-full max-w-2xl rounded-xl shadow-2xl"
            alt="Our Solution: Diagonal Layering"
          />
          <div className="flex flex-col gap-6">
            <div className="scale-110 transform rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center shadow-lg">
              <p className="mb-2 font-bold text-gray-500 uppercase">New State of the Art</p>
              <p className="text-7xl font-bold text-yellow-600">2.636</p>
              <p className="mt-2 flex items-center justify-center gap-2 text-lg font-bold text-green-600">
                <span>▲</span> +0.001 over AlphaEvolve
              </p>
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-gray-800">"Diagonal Layering"</p>
              <p className="text-gray-500 italic">Discovered autonomously by the agent.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // 15. Conclusion
  {
    id: 'conclusion',
    act: 'Conclusion',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white p-12 text-center">
        <h2 className="mb-10 text-5xl font-bold text-gray-800">Algorithm Design is Autonomous</h2>
        <div className="max-w-4xl space-y-8">
          <p className="text-3xl leading-relaxed text-gray-600">
            Terence Tao and Google DeepMind showed that{' '}
            <span className="font-medium text-gray-900">Math</span> can be solved by agents.
          </p>
          <p className="text-3xl leading-relaxed text-gray-600">
            We showed that <span className="font-medium text-gray-900">Algorithm Design</span> can
            be autonomous too.
          </p>
          <hr className="mx-auto w-32 border-gray-200" />
          <p className="text-4xl font-bold text-orange-600">
            The future is hiring agents, not prompting them.
          </p>
        </div>
      </div>
    ),
  },

  // --- ARC 3: THE VIBE CODER'S SEAT ---

  // 16. Hero Slide (The Vibe Coder's Seat)
  {
    id: 'vibe-coder-seat-hero',
    act: 'Part 2: Fluent Autonomy',
    type: 'image',
    imageUrl: '/static/images/slides/arc3_01_hero_seat.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <h2 className="mb-6 text-4xl font-bold text-gray-800">The Vibe Coder's Seat</h2>
        <img
          src="/static/images/slides/arc3_01_hero_seat.png"
          className="animate-float max-h-[80%] rounded-xl object-contain shadow-2xl"
          alt="The Vibe Coder's Seat"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                        100% { transform: translateY(0px); }
                    }
                 `,
          }}
        />
      </div>
    ),
  },

  // 17. The Shift (Algorithms -> Use Cases)
  {
    id: 'shift-to-use-cases',
    act: 'Part 2: Fluent Autonomy',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white p-12">
        <div className="grid w-full max-w-6xl grid-cols-2 gap-12">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 opacity-50">
            <h3 className="mb-4 text-2xl font-bold text-gray-500 uppercase">Part 1: The Lab</h3>
            <p className="mb-4 text-4xl font-bold text-gray-400">Algorithms</p>
            <ul className="space-y-2 text-xl text-gray-400">
              <li>• Objective Success</li>
              <li>• Mathematical Proof</li>
              <li>• Optimal Constants</li>
            </ul>
          </div>
          <div className="scale-105 transform rounded-2xl border border-orange-200 bg-orange-50 p-10 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold text-orange-600 uppercase">
              Part 2: The Real World
            </h3>
            <p className="mb-4 text-4xl font-bold text-gray-800">Use Cases</p>
            <ul className="space-y-4 text-xl font-medium text-gray-700">
              <li>• Subjective Quality</li>
              <li>• "Is this demo educational?"</li>
              <li>• "Is this doc clear?"</li>
              <li className="font-bold text-orange-600">• No Mathematical Harness</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },

  // 18. The Map: Vibe Coding (Interactive Workbench)
  {
    id: 'arc3-interactive-workbench',
    act: 'The Map',
    type: 'content',
    content: <InteractiveSkills />,
  },

  // 27. The Frontier: Layer 3
  {
    id: 'layer-3-frontier',
    act: 'The Frontier',
    type: 'image',
    imageUrl: '/static/images/agent-autonomy/vibe-coding-layers.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <img
          src="/static/images/agent-autonomy/vibe-coding-layers.png"
          className="max-h-[85%] max-w-[85%] object-contain"
          alt="Layer 3 Frontier"
        />
      </div>
    ),
  },

  // --- ARC 4: OUR PHILOSOPHY ---

  // 20. Our Philosophy (Interactive Workbench)
  {
    id: 'arc4-philosophy-workbench',
    act: 'Our Philosophy',
    type: 'content',
    content: <InteractivePhilosophy />,
  },

  // --- ARC 5: THE SYSTEM IN ACTION ---

  // 21. Algorithmic Vortex (Interactive)
  {
    id: 'arc5-vortex',
    act: 'The Vortex',
    type: 'content',
    content: <AlgorithmicVortex />,
  },

  // 22. Evolved Demos (Count-Min Sketch)
  {
    id: 'evolved-demos',
    act: 'The Result',
    type: 'content',
    content: <CountMinSketchDemo />,
  },

  // --- ARC 6: THE FUTURE ---

  // 23. Three Frontiers of Agent Autonomy
  {
    id: 'arc6-three-frontiers',
    act: 'The Future',
    type: 'image',
    imageUrl: '/static/images/slides/arc6_three_frontiers.png',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-white">
        <img
          src="/static/images/slides/arc6_three_frontiers.png"
          className="max-h-[95%] max-w-[95%] object-contain"
          alt="The Three Frontiers of Agent Autonomy"
        />
      </div>
    ),
  },

  // 24. The Vision (Closing)
  {
    id: 'arc6-vision',
    act: 'The Vision',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-12">
        <div className="max-w-4xl text-center">
          <blockquote className="mb-8 text-3xl leading-relaxed font-light text-white md:text-4xl">
            "Not autonomous agents that work alone, but agents that work with{' '}
            <span className="font-semibold text-blue-400">compiled human wisdom</span>—extending it,
            applying it, and occasionally adding to it."
          </blockquote>

          <div className="mt-12 text-xl text-gray-400">
            Agent autonomy isn't magic. It's{' '}
            <span className="font-semibold text-white">architecture</span>.
          </div>
        </div>
      </div>
    ),
  },

  // --- ARC 7: THE PITCH ---

  // 25. Why Deep Mode Matters (Interactive)
  {
    id: 'arc7-pitch-reasons',
    act: 'The Pitch',
    type: 'content',
    content: <PitchReasons />,
  },

  // 26. Call to Action
  {
    id: 'arc7-cta',
    act: 'The Pitch',
    type: 'content',
    content: (
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-12">
        <div className="max-w-3xl text-center">
          <h2 className="mb-8 text-4xl font-bold text-white md:text-5xl">Build the Architecture</h2>

          <div className="mx-auto mb-12 max-w-2xl space-y-6 text-left">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🏝️</span>
              <div>
                <p className="font-semibold text-white">Bounded Problems = Continuous Artifacts</p>
                <p className="text-sm text-blue-200">
                  Not one-time builds. Ever-expanding content creation across domains.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">📚</span>
              <div>
                <p className="font-semibold text-white">Pattern Encyclopedia = Defensible Moat</p>
                <p className="text-sm text-blue-200">
                  Patterns transfer. The library grows. Competitors can't catch up.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🔧</span>
              <div>
                <p className="font-semibold text-white">Own Layer 3 Now</p>
                <p className="text-sm text-blue-200">
                  Don't wait for LLM vendors. The architecture is yours to build.
                </p>
              </div>
            </div>
          </div>

          <div className="text-2xl font-light text-blue-300">
            The question isn't <span className="font-semibold text-white">whether</span> to build
            it.
            <br />
            It's <span className="font-semibold text-white">whether you build it first</span>.
          </div>
        </div>
      </div>
    ),
  },
]

export default function SlidesPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
  }, [])

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0))
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goToNextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevSlide()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextSlide, goToPrevSlide, toggleFullscreen, isFullscreen])

  const slide = slides[currentSlide]

  const renderSlide = () => {
    // Render content directly if present, otherwise render image if imageUrl present
    if (slide.content) {
      return slide.content
    }
    if (slide.imageUrl) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-white">
          <img
            src={slide.imageUrl}
            alt={slide.id}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* Act indicator */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-2">
        <span className="text-sm font-bold tracking-wider text-gray-500 uppercase">
          {slide.act}
        </span>
        <span className="text-xs text-gray-400">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>

      {/* Slide content */}
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <div className="h-full w-full">{renderSlide()}</div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-white p-4">
        <button
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="rounded-full border border-gray-200 bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 w-3 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'scale-125 bg-orange-500 shadow-sm'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            {isFullscreen ? 'Exit' : 'Fullscreen'} (F)
          </button>
        </div>

        <button
          onClick={goToNextSlide}
          disabled={currentSlide === slides.length - 1}
          className="transform rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
