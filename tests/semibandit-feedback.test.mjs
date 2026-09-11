import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'

// Execute the production inline learners with drawing stubbed; no test-only learner copy.
function loadDemo(kind) {
  const html = readFileSync(`data/posts/learning-the-map/demos/${kind}-semibandit.html`, 'utf8')
  const source = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1]
  const canvas = new global.Proxy(
    { createRadialGradient: () => ({ addColorStop() {} }) },
    { get: (target, key) => target[key] || (() => {}) }
  )
  const node = () => ({
    width: 900,
    height: 440,
    style: {},
    textContent: '',
    innerHTML: '',
    appendChild() {},
    setAttribute() {},
    getContext: () => canvas,
  })
  const nodes = new Map()
  let config
  const context = vm.createContext({
    console,
    Image: class {},
    requestAnimationFrame() {},
    getComputedStyle: () => ({ getPropertyValue: () => '#6688aa' }),
    parent: { postMessage() {} },
    document: {
      documentElement: { scrollHeight: 1200 },
      createElement: node,
      getElementById: (id) => {
        if (!nodes.has(id)) nodes.set(id, node())
        return nodes.get(id)
      },
      querySelector: node,
      querySelectorAll: () => [],
    },
    window: { addEventListener() {} },
    SemiBanditGuide: (value) => {
      config = value
      return { refresh() {} }
    },
  })
  const stride = kind === 'berlin52' ? 'N' : kind === 'matching' ? 'NE' : 'NCELL'
  const probe = `window.read=()=>({states,ORDER,stride:${stride}});`
  const thompsonProbe =
    kind === 'berlin52'
      ? `
    window.checkThompson=()=>{
      var original=solve;
      try {
        solve=function(f){
          for(var i=0;i<N;i++)for(var j=i+1;j<N;j++){
            var v=f(i,j);
            if(v!==f(i,j)||v!==f(j,i))throw Error('Sample changed during solve');
          }
          return [];
        };
        POLICIES.thompson.pick(states.thompson,1);
      } finally { solve=original; }
    };`
      : ''
  vm.runInContext(source.replace(/\}\)\(\);\s*$/, probe + thompsonProbe + '})();'), context)
  return { config, read: context.window.read, checkThompson: context.window.checkThompson }
}

for (const kind of ['berlin52', 'matching', 'schedule']) {
  test(`${kind}: feasible actions reveal selected outcomes before learning`, () => {
    const { config, read } = loadDemo(kind)
    for (let round = 1; round <= 3; round++) {
      const before = Object.fromEntries(
        read().ORDER.map((p) => [p, Array.from(read().states[p].n)])
      )
      config.choose()
      for (const p of read().ORDER) {
        const st = read().states[p]
        assert.equal(new Set(st.tour || st.asg).size, config.count)
        assert.deepEqual(Array.from(st.n), before[p])
      }
      config.reveal()
      const sums = Object.fromEntries(
        read().ORDER.map((p) => [p, Array.from(read().states[p].sum)])
      )
      for (const p of read().ORDER) {
        assert.equal(read().states[p].feedback.length, config.count)
        assert.deepEqual(Array.from(read().states[p].n), before[p])
      }
      config.learn()
      for (const p of read().ORDER) {
        const st = read().states[p]
        const expected = before[p].slice()
        for (const row of st.feedback) {
          expected[row.index]++
          sums[p][row.index] += row.value
          if (kind === 'berlin52') {
            const reverse =
              (row.index % read().stride) * read().stride + Math.floor(row.index / read().stride)
            expected[reverse]++
            sums[p][reverse] += row.value
          }
        }
        assert.deepEqual(Array.from(st.n), expected)
        assert.deepEqual(Array.from(st.sum), sums[p])
        assert.equal(st.hist.length, round)
      }
    }
    config.reset()
    for (const p of read().ORDER)
      assert.equal(
        read().states[p].n.reduce((a, b) => a + b, 0),
        0
      )
  })
}
test('Berlin52 Thompson sampling holds one symmetric sampled world fixed during search', () => {
  loadDemo('berlin52').checkThompson()
})
