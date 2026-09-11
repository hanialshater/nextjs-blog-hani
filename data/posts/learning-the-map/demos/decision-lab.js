(function () {
  'use strict'
  const E = window.DecisionEngine
  const kind = document.body.dataset.kind
  const content = {
    route: {
      number: '01', title: 'Good roads. Impossible route.',
      intro: 'Six stops. One driver. A road can look cheap and still be the wrong choice for the whole journey.',
      instruction: 'Build a round trip', prompt: 'Start at A. Click the other five stops in the order you would visit them. Your last stop connects back to A.',
      rule: 'Visit all six stops once, then return to A.', action: 'Drive this route', piece: 'road', pieces: 'roads', round: 'day',
      trap: 'Try the six cheapest roads',
      trapText: 'Six cheap roads make two separate triangles. Every stop has two neighbours, but the driver cannot get from one triangle to the other. Local bargains do not guarantee a connected tour.',
      learn: 'The driver returns with six travel times. The nine roads outside the route give you no new measurements.',
      compare: 'Does a better map lead to better journeys?',
      takeaway: 'The solver keeps the tour connected. The learner decides which road costs deserve another measurement.',
    },
    matching: {
      number: '02', title: 'Everyone wants Mira.',
      intro: 'Four clients. Four experts. Giving each client their favourite expert is easy—until two clients want the same person.',
      instruction: 'Give each client one expert', prompt: 'Click a score in each client’s row. Each expert can take only one client. The numbers are starting estimates, not known outcomes.',
      rule: 'One expert per client. One client per expert.', action: 'Make these matches', piece: 'pair', pieces: 'pairs', round: 'round',
      trap: 'Give everyone their favourite',
      trapText: 'Every client chose Mira. Those four attractive scores cannot be collected together: Mira has one appointment. A valid matching must consider what each choice leaves for everyone else.',
      learn: 'Four matches return four outcomes. Pairings you did not make remain unobserved, even though every client met somebody.',
      compare: 'Four observations. But are they new?',
      takeaway: 'A matching spreads observations across clients. It can still repeat exactly the same pairs forever. Exploration must come from the policy.',
    },
    schedule: {
      number: '03', title: 'One booking can teach you about another.',
      intro: 'Four clients. Six appointments. Learn which bookings work, while respecting the calendar and using information about similar clients.',
      instruction: 'Make a feasible week', prompt: 'Give each client one appointment. Hatched cells are unavailable for that client. Appointments in the same column cannot be shared.',
      rule: 'One appointment per client. No double bookings. Respect client availability.', action: 'Book this week', piece: 'booking', pieces: 'bookings', round: 'week',
      trap: 'Ignore client availability',
      trapText: 'Bea was booked on Monday, but she cannot attend. Cam was booked with Noah, who cannot meet Cam’s required service. High estimated quality cannot make an unavailable booking feasible.',
      learn: 'Observe four bookings. With shared learning, a result can also change the prediction for an untried booking with the same client type and expert specialty.',
      compare: 'When does sharing experience help?',
      takeaway: 'Turn shared structure down and rerun the same seeds. Public labels are useful only when they help predict the hidden outcomes.',
    },
  }[kind]
  const names = { greedy: 'Trust the estimates', ucb: 'Explore uncertain pieces', thompson: 'Sample a plausible world', shared: 'Share experience + explore' }
  const colors = { greedy: 'var(--orange)', ucb: 'var(--blue)', thompson: 'var(--purple)', shared: 'var(--accent)' }
  let seed = 17, structure = 1, constrained = true, stage = 0, phase = 'choose', policy = kind === 'schedule' ? 'shared' : 'ucb'
  let world, state, picked, routeOrder, observations = [], before = [], proposal, message = '', trap = false, inspected = null
  let comparison = null, metric = 'gap', busy = false, raceToken = 0, worldCount = 12
  const app = document.getElementById('app')
  const fmt = n => Number(n).toFixed(1)
  const availableCount = () => world.arms.filter(a => a.allowed !== false).length
  function reset() {
    raceToken++; busy = false; comparison = null
    world = E.makeWorld(kind, seed, structure, constrained); state = E.newState(world)
    picked = []; routeOrder = [0]; observations = []; before = []; proposal = null
    stage = 0; phase = 'choose'; message = ''; trap = false; inspected = null
    render()
  }
  function values() { return E.estimates(world, state, policy === 'shared') }
  function routeFromPlan(plan) {
    const order = [0]; let current = 0, previous = -1
    while (order.length < 6) {
      const edge = plan.map(k => world.arms[k]).find(a => (a.a === current || a.b === current) && (a.a === current ? a.b : a.a) !== previous && !order.includes(a.a === current ? a.b : a.a))
      if (!edge) break
      const next = edge.a === current ? edge.b : edge.a
      previous = current; current = next; order.push(next)
    }
    return order
  }
  function makeRoute() {
    picked = []
    for (let i = 1; i < routeOrder.length; i++) picked.push(world.arms.findIndex(a => a.a === Math.min(routeOrder[i - 1], routeOrder[i]) && a.b === Math.max(routeOrder[i - 1], routeOrder[i])))
    if (routeOrder.length === 6) picked.push(world.arms.findIndex(a => a.a === 0 && a.b === routeOrder[5]))
  }
  function select(k) {
    inspected = k
    if (stage !== 0) { render(); return }
    trap = false; message = ''
    if (kind === 'route') {
      if (k === 0) routeOrder = [0]
      else if (routeOrder.includes(k)) routeOrder = routeOrder.slice(0, routeOrder.indexOf(k) + 1)
      else if (routeOrder.length < 6) routeOrder.push(k)
      makeRoute()
    } else {
      const a = world.arms[k]
      if (!a.allowed) { message = 'That appointment is unavailable. Choose an unhatched cell in this row.'; render(); return }
      const clash = picked.find(j => world.arms[j].b === a.b && world.arms[j].a !== a.a)
      if (clash !== undefined) { message = `${world.cols[a.b]} is already booked for ${world.rows[world.arms[clash].a]}. Move that client first, or choose another column.`; render(); return }
      const wasSelected = picked.includes(k)
      picked = picked.filter(j => world.arms[j].a !== a.a)
      if (!wasSelected) picked.push(k)
    }
    render()
  }
  function showTrap() {
    trap = true; message = content.trapText
    if (kind === 'route') picked = world.arms.map((a, k) => k).sort((a, b) => world.arms[a].base - world.arms[b].base).slice(0, 6)
    else if (kind === 'matching') picked = [0, 4, 8, 12]
    else picked = [0, 7, 15, 22]
    render()
  }
  function fillPlan() {
    picked = E.solve(world, values().map(e => e.mean)); routeOrder = routeFromPlan(picked)
    trap = false
    message = `The solver checked all ${world.plans.length} valid ${kind === 'route' ? 'tours' : 'plans'} and picked the ${world.minimize ? 'lowest' : 'highest'} estimated total. It has no access to the true outcomes.`
    render()
  }
  function startLearning() {
    if (!E.valid(world, picked)) return
    stage = 1; phase = 'chosen'; observations = []; message = ''; trap = false
    proposal = { plan: picked.slice(), values: values().map(e => e.mean), est: values(), manual: true }
    render()
  }
  function nextPhase() {
    if (phase === 'choose' || phase === 'updated') {
      proposal = E.choose(world, state, policy); picked = proposal.plan; routeOrder = routeFromPlan(picked)
      phase = 'chosen'; observations = []; message = ''; inspected = picked[0]
    } else if (phase === 'chosen') {
      before = values(); observations = E.observe(world, state.round, picked); phase = 'observed'
    } else {
      E.update(state, observations); phase = 'updated'
    }
    render()
  }
  function routeBoard() {
    const est = values()
    const edges = world.arms.map((a, k) => {
      const [x1, y1] = world.nodes[a.a], [x2, y2] = world.nodes[a.b]
      const selected = picked.includes(k), observed = observations.find(o => o.k === k)
      return `<g><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${selected ? (observed ? 'var(--orange)' : 'var(--accent)') : 'var(--line)'}" stroke-width="${selected ? 4 : 1}" ${selected ? '' : 'stroke-dasharray="3 5"'} />${selected ? `<text class="graphlabel" x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" text-anchor="middle">${fmt(observed && phase === 'observed' ? observed.value : est[k].mean)}</text>` : ''}</g>`
    }).join('')
    const nodes = world.nodes.map(([x, y], i) => `<g ${stage === 0 ? `class="routebutton" role="button" tabindex="0" aria-label="Visit stop ${'ABCDEF'[i]}${i === 0 ? ', restart route' : ''}" data-node="${i}"` : ''}><circle class="node ${!trap && routeOrder.includes(i) ? 'chosen' : ''}" cx="${x}" cy="${y}" r="21"/><text class="nodetext ${!trap && routeOrder.includes(i) ? 'chosen' : ''}" x="${x}" y="${y + 6}" text-anchor="middle">${'ABCDEF'[i]}</text></g>`).join('')
    return `<svg viewBox="0 0 520 310" role="group" aria-label="Six-stop route. Solid lines are selected roads. Dotted lines are unselected roads."><text x="95" y="22" class="graphlabel">WEST</text><text x="385" y="22" class="graphlabel">EAST</text>${edges}${nodes}</svg><p class="routeorder">${trap ? 'Two disconnected loops' : routeOrder.map(i => 'ABCDEF'[i]).join(' → ') + (routeOrder.length === 6 ? ' → A' : '')}</p>`
  }
  function matrixBoard() {
    const est = values()
    return `<table class="matrix" aria-label="${kind === 'schedule' ? 'Client appointment' : 'Client expert'} estimates"><thead><tr><th scope="col">Client</th>${world.cols.map((c, i) => `<th scope="col">${c.replace(' · ', '<br>')}<small>${(kind === 'schedule' ? i % 2 === 0 : i < 2) ? 'Design' : 'Data'}</small></th>`).join('')}</tr></thead><tbody>${world.rows.map((r, i) => `<tr><th scope="row">${r}<small>${i < 2 ? 'Design' : 'Data'}</small></th>${world.cols.map((_, j) => {
      const k = i * world.cols.length + j, a = world.arms[k], selected = picked.includes(k), obs = observations.find(o => o.k === k)
      const transferred = phase === 'updated' && !selected && before[k] && Math.abs(est[k].mean - before[k].mean) > 0.01
      const shown = obs && phase === 'observed' ? obs.value : est[k].mean
      return `<td><button data-arm="${k}" class="${a.allowed ? '' : 'blocked'} ${selected ? 'selected' : ''} ${obs ? 'updated' : ''} ${transferred ? 'transferred' : ''}" aria-pressed="${selected}" aria-label="${a.name}: ${a.allowed ? `${fmt(shown)} ${obs && phase === 'observed' ? 'observed' : 'estimated'} points${selected ? ', selected' : ''}` : 'unavailable'}">${a.allowed ? Math.round(shown) : '×'}${a.allowed ? `<small>${obs && phase === 'observed' ? 'observed' : phase === 'updated' && (obs || transferred) ? `was ${Math.round(before[k].mean)}` : state.n[k] ? `${state.n[k]} seen` : 'untried'}</small>` : ''}</button></td>`
    }).join('')}</tr>`).join('')}</tbody></table>`
  }
  function board() {
    return `<div class="board"><div class="boardhead"><h3>${kind === 'route' ? 'Your map' : kind === 'matching' ? 'Your matching' : 'Your week'}</h3><span>${phase === 'updated' ? 'Updated estimates' : observations.length ? 'Orange: outcomes' : 'Current estimates'} · ${world.unit}</span></div>${kind === 'route' ? routeBoard() : matrixBoard()}<div class="legend"><span><i class="key"></i>Selected</span><span><i class="key unseen"></i>Unselected</span>${observations.length ? '<span><i class="key observed"></i>Direct evidence</span>' : ''}${phase === 'updated' && policy === 'shared' ? '<span><i class="key" style="background:var(--purple)"></i>Shared inference</span>' : ''}</div></div>`
  }
  function buildView() {
    const legal = E.valid(world, picked), total = E.sum(picked, values().map(e => e.mean))
    return `<h2>${content.instruction}</h2><div class="split">${board()}<div class="aside"><p>${content.prompt}</p><p class="rule"><strong>The rule:</strong> ${content.rule}</p><div class="stats"><div class="stat"><b>${picked.length}/${kind === 'route' ? 6 : 4}</b><span>pieces selected</span></div><div class="stat"><b>${picked.length ? fmt(total) : '—'}</b><span>estimated ${world.unit}</span></div><div class="stat"><b>${legal ? 'Valid' : 'Not yet'}</b><span>feasibility</span></div></div>${message ? `<div class="callout ${legal ? '' : 'error'}" role="status">${message}</div>` : '<p class="note">Try the tempting shortcut below. What goes wrong when you choose each piece independently?</p>'}<div class="actions"><button class="small" data-action="trap">${content.trap}</button><button class="small" data-action="solve">Find best valid plan</button></div><div class="actions"><button class="primary" data-action="learn" ${legal ? '' : 'disabled'}>${content.action}</button><button class="small" data-action="clear">Clear</button></div></div></div>`
  }
  function inspectView() {
    const k = inspected !== null && world.arms[inspected] ? inspected : picked[0]
    if (k === undefined) return ''
    const arm = world.arms[k], e = values()[k]
    return `<div class="inspect"><b>${arm.name}</b><span>${e.n} direct observation${e.n === 1 ? '' : 's'}. Estimate: ${fmt(e.mean)} ${world.unit}.</span>${policy === 'shared' ? `<p>${e.otherN} observations of other ${content.pieces} in “${arm.context}” contribute a ${e.sharedDelta >= 0 ? '+' : ''}${fmt(e.sharedDelta)} adjustment to its starting estimate.</p>` : ''}${proposal && phase === 'chosen' ? `<p>Value sent to solver: <strong>${fmt(proposal.values[k])}</strong>. ${proposal.manual ? 'Your first plan uses the current estimates. The policy chooses the next plan after you update.' : policy === 'greedy' ? 'No exploration adjustment.' : policy === 'thompson' ? 'One draw, fixed for this entire solve.' : world.minimize ? 'Uncertainty makes a road look cheaper.' : 'Uncertainty makes a pairing look more promising.'}</p>` : ''}</div>`
  }
  function evidence() {
    const est = values()
    const changed = k => phase === 'updated' && !picked.includes(k) && before[k] && Math.abs(est[k].mean - before[k].mean) > 0.01
    return `<details id="evidence"><summary>Inspect all ${availableCount()} ${content.pieces}: estimates, uncertainty and observations</summary><p>Uncertainty is a heuristic exploration scale, not a calibrated confidence interval. “—” means no observation this round. Purple-marked rows changed through shared evidence without a new direct observation.</p><div class="tablewrap"><table class="evidence"><thead><tr><th>Piece</th><th>Direct samples</th><th>Estimate</th><th>Uncertainty scale</th><th>Observed now</th></tr></thead><tbody>${world.arms.map((a, k) => {
      if (a.allowed === false) return ''
      const obs = observations.find(o => o.k === k)
      return `<tr class="${picked.includes(k) ? 'chosen' : ''} ${changed(k) ? 'transferred' : ''}"><td><button class="small" data-inspect="${k}">${a.name}</button></td><td>${est[k].n}</td><td>${phase === 'updated' && before[k] ? `${fmt(before[k].mean)} → ` : ''}${fmt(est[k].mean)}</td><td>±${fmt(est[k].radius)}</td><td>${obs ? fmt(obs.value) : '—'}</td></tr>`
    }).join('')}</tbody></table></div></details>`
  }
  function learnView() {
    const updated = phase === 'updated', observed = phase === 'observed'
    const transferred = updated ? values().filter((e, k) => world.arms[k].allowed !== false && !picked.includes(k) && before[k] && Math.abs(e.mean - before[k].mean) > 0.01).length : 0
    let explanation = phase === 'choose' ? 'Ask the policy to propose a valid plan. Then reveal the observations and update the model in separate steps.' : phase === 'chosen' ? 'The plan is committed. Before revealing feedback, look at the unselected pieces. None of them will receive a new measurement.' : observed ? `${observations.length} noisy outcomes arrived. The estimates have not changed yet. The next step adds these observations to the learner’s memory.` : `${observations.length} selected ${content.pieces} gained one direct observation each. ${transferred ? `${transferred} unselected estimates also moved through shared evidence; their direct sample counts did not change.` : 'Unselected estimates did not change.'}`
    return `<div class="top"><h2>Watch one learning loop</h2><span class="round">${content.round[0].toUpperCase() + content.round.slice(1)} ${state.round + (updated ? 0 : 1)}</span></div><div class="controls"><label>How should the learner choose?<select id="policy" ${phase === 'chosen' || observed ? 'disabled' : ''}>${Object.entries(names).map(([k, n]) => `<option value="${k}" ${policy === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div><div class="phasebar">${['Choose a plan', 'Observe selected pieces', 'Update the model'].map((s, i) => `<span class="${(phase === 'choose' || phase === 'chosen') && i === 0 || observed && i === 1 || updated && i === 2 ? 'active' : ''}">${i + 1}. ${s}</span>`).join('')}</div><div class="split">${board()}<div class="aside"><div class="callout" role="status">${explanation}</div><p class="note">${content.learn}</p>${inspectView()}<div class="actions"><button class="primary" data-action="step">${phase === 'chosen' ? 'Reveal selected outcomes' : observed ? 'Update the estimates' : 'Choose the next plan'}</button></div><button class="small" data-action="compare">Compare learning over 100 rounds →</button></div></div>${evidence()}`
  }
  async function runComparison() {
    busy = true; comparison = null; const token = ++raceToken
    const multi = worldCount === 12
    const count = multi ? 12 : 1, sets = []
    render()
    for (let i = 0; i < count; i++) {
      if (token !== raceToken) return
      sets.push(E.race(E.makeWorld(kind, seed + i, structure, constrained)))
      document.getElementById('progress').textContent = `Evaluated ${i + 1} of ${count} ${count === 1 ? 'world' : 'worlds'}…`
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    if (token !== raceToken) return
    comparison = { count, results: sets[0].map((r, p) => ({ policy: r.policy, coverage: sets.reduce((s, a) => s + a[p].coverage, 0) / count,
      history: r.history.map((_, t) => ({ gap: sets.reduce((s, a) => s + a[p].history[t].gap, 0) / count, regret: sets.reduce((s, a) => s + a[p].history[t].regret, 0) / count })),
      finalGaps: sets.map(a => a[p].history[99].gap),
    })) }
    busy = false; render()
  }
  function chartView() {
    if (!comparison) return ''
    const max = Math.max(1, ...comparison.results.flatMap(r => r.history.map(h => h[metric]))) * 1.1
    const x = t => 48 + t * 6.9, y = v => 218 - v / max * 186
    return `<div class="chart"><div class="chartcontrols"><button class="small" data-metric="gap" aria-pressed="${metric === 'gap'}">Quality of learned recommendation</button><button class="small" data-metric="regret" aria-pressed="${metric === 'regret'}">Total cost of learning</button></div><p class="note">${metric === 'gap' ? 'If exploration stopped here, how far from optimal is the plan chosen using learned estimates? Lower is better.' : 'Add up the expected value sacrificed by every executed plan, compared with the true optimum. Lower is better.'}</p><svg viewBox="0 0 780 260" role="img" aria-label="${metric === 'gap' ? 'Recommendation gap' : 'Cumulative regret'} across 100 rounds; exact final values follow in the table"><text x="48" y="16">${world.unit}${comparison.count > 1 ? ', mean across 12 worlds' : ''}</text>${[0, 0.5, 1].map(f => `<line class="axis" x1="48" x2="738" y1="${y(f * max)}" y2="${y(f * max)}"/><text x="40" y="${y(f * max) + 4}" text-anchor="end">${Math.round(f * max)}</text>`).join('')}${comparison.results.map(r => `<polyline fill="none" stroke="${colors[r.policy]}" stroke-width="2.5" ${r.policy === 'thompson' ? 'stroke-dasharray="5 3"' : ''} points="${r.history.map((h, t) => `${x(t)},${y(h[metric])}`).join(' ')}"/>`).join('')}<text x="48" y="245">Round 1</text><text x="738" y="245" text-anchor="end">100</text></svg><div class="policies">${Object.entries(names).map(([p, name]) => `<span><i class="key" style="background:${colors[p]}"></i>${name}</span>`).join('')}</div><div class="tablewrap"><table class="results"><thead><tr><th>Policy</th><th>Final recommendation gap</th><th>Total cost of learning</th><th>Pieces tried / ${availableCount()}</th></tr></thead><tbody>${comparison.results.map(r => `<tr><td>${names[r.policy]}</td><td>${fmt(r.history[99].gap)} ${comparison.count > 1 ? `<span class="note">(${fmt(Math.min(...r.finalGaps))}–${fmt(Math.max(...r.finalGaps))})</span>` : ''}</td><td>${fmt(r.history[99].regret)}</td><td>${fmt(r.coverage)}</td></tr>`).join('')}</tbody></table></div><p class="caption">${comparison.count === 1 ? `One synthetic world, seed ${seed}. Try 12 worlds before drawing a broad conclusion.` : `Means across seeds ${seed}–${seed + 11}. Parentheses show the minimum and maximum final gap; these are not confidence intervals.`} No winner is hard-coded.</p></div>`
  }
  function compareView() {
    return `<h2>${content.compare}</h2><p class="intro">Run four policies in the same worlds. All use the same exact solver, starting estimates and observation-noise rule. Only the learning policy changes.</p><div class="controls"><label>Shared structure: <strong id="strength">${structure === 0 ? 'None' : structure === 0.5 ? 'Some' : 'Strong'}</strong><input id="structure" type="range" min="0" max="1" step="0.5" value="${structure}" ${busy ? 'disabled' : ''}></label><label>Worlds<select id="worlds" ${busy ? 'disabled' : ''}><option value="1" ${worldCount === 1 ? 'selected' : ''}>Current world · seed ${seed}</option><option value="12" ${worldCount === 12 ? 'selected' : ''}>12 worlds · seeds ${seed}–${seed + 11}</option></select></label>${kind === 'schedule' ? `<label>Client constraints<select id="constraints" ${busy ? 'disabled' : ''}><option value="on" ${constrained ? 'selected' : ''}>Enforced</option><option value="off" ${!constrained ? 'selected' : ''}>Removed</option></select></label>` : ''}<button class="primary" data-action="race" ${busy ? 'disabled' : ''}>${busy ? 'Running…' : 'Run 100 rounds'}</button></div><div class="progress" id="progress" role="status">${comparison ? `Complete · ${comparison.count} ${comparison.count === 1 ? 'world' : 'worlds'}` : busy ? 'Evaluating policies…' : 'Make a prediction, then run: will sharing experience help when the labels carry no signal?'}</div>${chartView()}<div class="callout" style="margin-top:18px">${content.takeaway}</div><details><summary>What exactly does this experiment measure?</summary><p>Each component has a fixed hidden mean and independent Gaussian observation noise. Rewards and costs add across a plan. All feasible plans are enumerated (${world.plans.length} in the current world), so the optimum is exact. The simulator uses hidden means only to generate observations and evaluate decisions. Policies receive public features and observations of their selected components.</p><p>All policies start with the same public baseline. Tabular estimates shrink toward that baseline with two pseudo-observations. The shared learner adjusts this prior using other components in the same public group, then learns a separate component mean. Group labels are supplied; they are not learned from the hidden answer.</p><p>Exploration uses a noise-scaled heuristic bonus. The sampling policy draws independent Gaussian values around the estimates once per round; this is a Thompson-style approximation, not an exact Bayesian posterior. Neither method here claims a regret bound. The shared learner’s uncertainty scale stays conservative and local; it does not claim to be a calibrated hierarchical posterior.</p><p>Shared structure changes the hidden world, not the solver. With no shared structure, group labels do not predict residual quality. Turning off calendar constraints keeps the clients, slots and hidden values fixed, and changes only which plans are allowed. Outcomes for the same component and round use the same seeded noise across policies. Single runs are illustrations, not evidence that one policy always wins.</p></details>`
  }
  function render() {
    const evidenceOpen = document.getElementById('evidence')?.open
    const active = document.activeElement
    const focusKey = active && active !== document.body ? ['data-action', 'data-arm', 'data-inspect', 'data-node', 'data-metric'].map(a => active.hasAttribute(a) ? `[${a}="${active.getAttribute(a)}"]` : '').find(Boolean) || (active.id ? `#${active.id}` : null) : null
    app.innerHTML = `<main class="lab"><div class="top"><div><p class="eyebrow">Decision laboratory / ${content.number}</p><h1>${content.title}</h1></div><button class="restart" data-action="reset">Start over</button></div><p class="intro">${content.intro}</p><nav class="steps" aria-label="Experiment stages">${['Build a plan', 'Watch it learn', 'Compare policies'].map((s, i) => `<button data-stage="${i}" ${stage === i ? 'aria-current="step"' : ''}><span class="stepnum">${i + 1}</span>${s}</button>`).join('')}</nav>${stage === 0 ? buildView() : stage === 1 ? learnView() : compareView()}<p class="foot">Synthetic teaching example · exact small-problem solver · seed ${seed} · ${world.plans.length} feasible plans</p></main>`
    if (evidenceOpen && document.getElementById('evidence')) document.getElementById('evidence').open = true
    if (focusKey) app.querySelector(focusKey)?.focus({ preventScroll: true })
    requestAnimationFrame(reportHeight)
  }
  function reportHeight() { if (parent !== window) parent.postMessage({ type: 'demo-height', height: Math.ceil(document.body.getBoundingClientRect().height) }, '*') }
  app.addEventListener('click', event => {
    const el = event.target.closest('button,[data-node]')
    if (!el || el.disabled) return
    if (el.dataset.node !== undefined) return select(Number(el.dataset.node))
    if (el.dataset.arm !== undefined) return select(Number(el.dataset.arm))
    if (el.dataset.inspect !== undefined) { inspected = Number(el.dataset.inspect); render(); return }
    if (el.dataset.metric) { metric = el.dataset.metric; render(); return }
    if (el.dataset.stage !== undefined) {
      if (busy) return
      const next = Number(el.dataset.stage)
      if (next === 1 && stage === 0) {
        if (!E.valid(world, picked)) { picked = E.solve(world, values().map(e => e.mean)); routeOrder = routeFromPlan(picked) }
        startLearning()
      } else if (next === 0) { reset() } else { stage = next; render() }
      return
    }
    switch (el.dataset.action) {
      case 'reset': reset(); break
      case 'trap': showTrap(); break
      case 'solve': fillPlan(); break
      case 'clear': picked = []; routeOrder = [0]; message = ''; trap = false; render(); break
      case 'learn': startLearning(); break
      case 'step': nextPhase(); break
      case 'compare': stage = 2; render(); break
      case 'race': runComparison(); break
    }
  })
  app.addEventListener('keydown', event => {
    const node = event.target.closest('[data-node]')
    if (node && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); select(Number(node.dataset.node)) }
  })
  app.addEventListener('change', event => {
    if (event.target.id === 'worlds') { worldCount = Number(event.target.value) }
    if (event.target.id === 'policy') { policy = event.target.value; proposal = null; phase = 'choose'; observations = []; render() }
    if (event.target.id === 'structure' || event.target.id === 'constraints') {
      if (event.target.id === 'structure') structure = Number(event.target.value)
      else constrained = event.target.value === 'on'
      world = E.makeWorld(kind, seed, structure, constrained); state = E.newState(world)
      picked = []; routeOrder = [0]; phase = 'choose'; proposal = null; observations = []; before = []; comparison = null
      render()
    }
  })
  window.addEventListener('resize', reportHeight)
  new ResizeObserver(reportHeight).observe(app)
  reset()
})()
