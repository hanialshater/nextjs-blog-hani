/* Shared, dependency-free simulation. Usable in the browser and Node tests. */
(function (root) {
  'use strict'
  function random(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0
      let x = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296
    }
  }
  function normal(rng) {
    return Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-10))) * Math.cos(2 * Math.PI * rng())
  }
  const sum = (plan, values) => plan.reduce((s, k) => s + values[k], 0)
  function permutations(values) {
    if (!values.length) return [[]]
    return values.flatMap((v, i) => permutations(values.filter((_, j) => i !== j)).map(p => [v, ...p]))
  }
  function makeWorld(kind, seed = 17, structure = 1, constrained = true) {
    const rng = random(seed), arms = [], plans = [], nodes = [
      [70, 75], [70, 245], [170, 160], [350, 160], [450, 75], [450, 245],
    ]
    const rows = ['Alex', 'Bea', 'Cam', 'Dara']
    const cols = kind === 'schedule' ? ['Mira · Mon', 'Noah · Mon', 'Mira · Tue', 'Noah · Tue', 'Mira · Wed', 'Noah · Wed'] : ['Mira', 'Noah', 'Omar', 'Rae']
    if (kind === 'route') {
      for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) {
        const group = a < 3 && b < 3 ? 0 : a >= 3 && b >= 3 ? 1 : 2
        arms.push({ a, b, name: `${'ABCDEF'[a]}–${'ABCDEF'[b]}`, group,
          base: Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]) / 18,
          context: ['West roads', 'East roads', 'Cross-town roads'][group] })
      }
      const edge = (a, b) => arms.findIndex(x => x.a === Math.min(a, b) && x.b === Math.max(a, b))
      for (const p of permutations([1, 2, 3, 4, 5])) {
        if (p[0] > p[4]) continue // undirected reverse tours are identical
        const tour = [0, ...p]
        plans.push(tour.map((a, i) => edge(a, tour[(i + 1) % 6])))
      }
    } else {
      const prior = [[72, 64, 42, 48], [75, 62, 48, 44], [68, 57, 62, 55], [70, 60, 57, 66]]
      for (let a = 0; a < 4; a++) for (let b = 0; b < cols.length; b++) {
        // Public type/specialty labels are known before booking; residual quality is hidden.
        const specialty = kind === 'schedule' ? b % 2 : Math.floor(b / 2)
        const group = Math.floor(a / 2) * 2 + specialty
        const allowed = kind !== 'schedule' || !constrained || !((a === 0 && b >= 4) || (a === 1 && b < 2) || (a === 2 && b % 2 === 1))
        arms.push({ a, b, name: `${rows[a]} / ${cols[b]}`, group, allowed,
          base: kind === 'schedule' ? 55 + (b % 2 ? 0 : 6) : prior[a][b],
          context: `${a < 2 ? 'Design' : 'Data'} client / ${specialty === 0 ? 'Design' : 'Data'} expert` })
      }
      function visit(row, selected, used) {
        if (row === 4) { plans.push(selected); return }
        arms.forEach((arm, k) => {
          if (arm.a === row && arm.allowed && !used.includes(arm.b)) visit(row + 1, [...selected, k], [...used, arm.b])
        })
      }
      visit(0, [], [])
    }
    const groupEffects = Array.from({ length: kind === 'route' ? 3 : 4 }, () => (rng() - 0.5) * (kind === 'route' ? 13 : 30))
    const truth = arms.map(arm => {
      const privateEffect = (rng() - 0.5) * (kind === 'route' ? 8 : 24)
      return arm.base + structure * groupEffects[arm.group] + (1.35 - 0.6 * structure) * privateEffect
    })
    const world = { kind, seed, structure, constrained, arms, plans, truth, nodes, rows, cols,
      minimize: kind === 'route', noise: kind === 'route' ? 3 : 8, unit: kind === 'route' ? 'min' : 'points' }
    world.optimum = solve(world, truth)
    world.optimalValue = sum(world.optimum, truth)
    return world
  }
  function solve(world, values) {
    let best = world.plans[0], bestValue = sum(best, values)
    for (const plan of world.plans) {
      const v = sum(plan, values)
      if (world.minimize ? v < bestValue : v > bestValue) { best = plan; bestValue = v }
    }
    return best.slice()
  }
  function newState(world) { return { n: world.arms.map(() => 0), total: world.arms.map(() => 0), round: 0 } }
  function estimates(world, state, shared = false) {
    const groupN = [], groupSum = []
    world.arms.forEach((a, k) => {
      groupN[a.group] = (groupN[a.group] || 0) + state.n[k]
      groupSum[a.group] = (groupSum[a.group] || 0) + state.total[k] - state.n[k] * a.base
    })
    return world.arms.map((a, k) => {
      const n = state.n[k]
      // Leave this arm out of shared evidence to avoid counting its samples twice.
      const otherN = (groupN[a.group] || 0) - n
      const otherSum = (groupSum[a.group] || 0) - (state.total[k] - n * a.base)
      const sharedDelta = shared && otherN ? otherSum / (otherN + 2) : 0
      const prior = a.base + sharedDelta
      const mean = (state.total[k] + 2 * prior) / (n + 2)
      const radius = world.noise * 2 / Math.sqrt(n + 1)
      return { mean, radius, n, prior, sharedDelta, otherN: shared ? otherN : 0 }
    })
  }
  function choose(world, state, policy, exploration = 1) {
    const est = estimates(world, state, policy === 'shared')
    const rng = random(world.seed * 1031 + state.round * 7919 + 97)
    // A sampled map is materialized once, then held fixed throughout the solve.
    const values = est.map(e => {
      if (policy === 'thompson') return e.mean + e.radius * normal(rng)
      if (policy === 'greedy') return e.mean
      const bonus = exploration * e.radius * Math.sqrt(Math.log(state.round + 2))
      return e.mean + (world.minimize ? -bonus : bonus)
    })
    return { plan: solve(world, values), values, est }
  }
  function observe(world, round, plan) {
    // Common random numbers: the same component at the same round has the same outcome for every policy.
    return plan.map(k => {
      const rng = random(world.seed * 10007 + (round + 1) * 104729 + k * 1543)
      return { k, value: world.truth[k] + world.noise * normal(rng) }
    })
  }
  function update(state, observations) {
    observations.forEach(({ k, value }) => { state.n[k]++; state.total[k] += value })
    state.round++
  }
  function gap(world, plan) {
    return Math.max(0, world.minimize ? sum(plan, world.truth) - world.optimalValue : world.optimalValue - sum(plan, world.truth))
  }
  function valid(world, plan) {
    const key = [...plan].sort((a, b) => a - b).join(',')
    return world.plans.some(p => [...p].sort((a, b) => a - b).join(',') === key)
  }
  function race(world, rounds = 100, exploration = 1) {
    return ['greedy', 'ucb', 'thompson', 'shared'].map(policy => {
      const state = newState(world), history = []
      let regret = 0
      for (let t = 0; t < rounds; t++) {
        const { plan } = choose(world, state, policy, exploration)
        regret += gap(world, plan)
        update(state, observe(world, t, plan))
        // Recommendation is chosen using the learned means, never hidden truth or best visited plan.
        const recommendation = solve(world, estimates(world, state, policy === 'shared').map(e => e.mean))
        history.push({ regret, gap: gap(world, recommendation) })
      }
      return { policy, history, coverage: state.n.filter((n, k) => n > 0 && world.arms[k].allowed !== false).length }
    })
  }
  const api = { random, makeWorld, solve, sum, newState, estimates, choose, observe, update, gap, valid, race }
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else root.DecisionEngine = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
