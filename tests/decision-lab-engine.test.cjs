const { test } = require('node:test')
const assert = require('node:assert/strict')
const E = require('../data/posts/learning-the-map/demos/decision-engine.js')

test('feasible sets encode connected tours, one-to-one assignments and calendar restrictions', () => {
  for (const kind of ['route', 'matching', 'schedule']) {
    const w = E.makeWorld(kind)
    assert.equal(w.plans.length, { route: 60, matching: 24, schedule: 84 }[kind])
    assert.equal(new Set(w.plans.map(p => p.slice().sort((a, b) => a - b).join(','))).size, w.plans.length)
    for (const p of w.plans) {
      const arms = p.map(k => w.arms[k])
      if (kind === 'route') {
        const degrees = Array(6).fill(0), reached = new Set([0])
        arms.forEach(a => { degrees[a.a]++; degrees[a.b]++ })
        for (let i = 0; i < 6; i++) arms.forEach(a => {
          if (reached.has(a.a) || reached.has(a.b)) { reached.add(a.a); reached.add(a.b) }
        })
        assert.deepEqual(degrees, [2, 2, 2, 2, 2, 2]); assert.equal(reached.size, 6)
      } else {
        assert.equal(new Set(arms.map(a => a.a)).size, 4)
        assert.equal(new Set(arms.map(a => a.b)).size, 4)
        assert.ok(arms.every(a => a.allowed))
      }
    }
  }
})

test('the three tempting shortcuts are genuinely invalid', () => {
  const r = E.makeWorld('route')
  const cheapest = r.arms.map((_, k) => k).sort((a, b) => r.arms[a].base - r.arms[b].base).slice(0, 6)
  assert.equal(E.valid(r, cheapest), false)
  assert.equal(E.valid(E.makeWorld('matching'), [0, 4, 8, 12]), false)
  assert.equal(E.valid(E.makeWorld('schedule'), [0, 7, 15, 22]), false)
})

test('calendar ablation changes only feasible plans, preserving all potential outcomes', () => {
  const on = E.makeWorld('schedule', 21, 1, true), off = E.makeWorld('schedule', 21, 1, false)
  assert.deepEqual(on.truth, off.truth)
  assert.equal(off.plans.length, 360)
  assert.ok(on.plans.every(p => E.valid(off, p)))
  assert.ok(off.optimalValue >= on.optimalValue)
})

test('feedback updates selected pieces only; shared predictions can move without new direct samples', () => {
  const w = E.makeWorld('schedule'), s = E.newState(w)
  const k = 0, peer = w.arms.findIndex((a, j) => j !== k && a.group === w.arms[k].group && a.allowed)
  const before = E.estimates(w, s, true)
  E.update(s, [{ k, value: w.arms[k].base + 20 }])
  const after = E.estimates(w, s, true), tabular = E.estimates(w, s)
  assert.equal(s.n[k], 1); assert.equal(s.n[peer], 0)
  assert.notEqual(after[peer].mean, before[peer].mean)
  assert.equal(tabular[peer].mean, w.arms[peer].base)
  assert.equal(after[k].otherN, 0, 'own observation is not counted again as peer evidence')
})

test('all policies choose valid plans without consulting hidden truth or evaluation optimum', () => {
  for (const kind of ['route', 'matching', 'schedule']) for (const policy of ['greedy', 'ucb', 'thompson', 'shared']) {
    const w = E.makeWorld(kind), s = E.newState(w)
    Object.defineProperty(w, 'truth', { get() { throw Error('hidden truth accessed') } })
    Object.defineProperty(w, 'optimalValue', { get() { throw Error('oracle accessed') } })
    for (let t = 0; t < 8; t++) {
      const p = E.choose(w, s, policy)
      assert.ok(E.valid(w, p.plan))
      assert.deepEqual(E.solve(w, p.values), p.plan, 'solver consumes one fixed set of values')
      E.update(s, p.plan.map(k => ({ k, value: w.arms[k].base + t % 3 })))
    }
  }
})

test('outcomes depend on world, time and piece, not policy, plan order or policy execution order', () => {
  const w = E.makeWorld('route'), p = w.plans[0], q = p.slice().reverse()
  assert.deepEqual(E.observe(w, 7, p).slice().sort((a, b) => a.k - b.k), E.observe(w, 7, q).sort((a, b) => a.k - b.k))
  assert.notDeepEqual(E.observe(w, 8, p), E.observe(w, 7, p))
  const s = E.newState(w)
  const one = E.choose(w, s, 'thompson')
  E.choose(w, s, 'shared')
  assert.deepEqual(one, E.choose(w, s, 'thompson'))
})

test('reported recommendation gap evaluates a mean-selected plan, and cumulative regret accounts for executed actions', () => {
  const w = E.makeWorld('schedule', 17), result = E.race(w, 12).find(r => r.policy === 'shared')
  const s = E.newState(w); let bill = 0
  for (let t = 0; t < 12; t++) {
    const p = E.choose(w, s, 'shared').plan
    bill += w.optimalValue - E.sum(p, w.truth)
    E.update(s, E.observe(w, t, p))
    const recommend = E.solve(w, E.estimates(w, s, true).map(e => e.mean))
    const expectedGap = w.optimalValue - E.sum(recommend, w.truth)
    assert.ok(Math.abs(result.history[t].regret - bill) < 1e-8)
    assert.ok(Math.abs(result.history[t].gap - expectedGap) < 1e-8)
  }
})
