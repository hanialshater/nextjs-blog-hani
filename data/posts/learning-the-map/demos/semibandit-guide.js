/* Shared walkthrough; the original demos own their solvers, feedback and learners. */
function SemiBanditGuide(config) {
  var phase = 0
  var completed = false
  var playing = false
  var timer = null
  var host = document.getElementById('semibandit-guide')
  host.innerHTML = `
    <section class="guide" aria-label="Semi-bandit walkthrough">
      <div class="guide-heading"><b>One decision. Many observations.</b><span>Semi-bandit feedback</span></div>
      <svg class="guide-flow" viewBox="0 0 720 86" role="img" aria-label="Choose one feasible action, observe its selected components, update estimates">
        <path d="M219 42H248M459 42H488" stroke="currentColor" stroke-width="2" fill="none"/>
        <path d="m241 36 7 6-7 6m240-12 7 6-7 6" stroke="currentColor" stroke-width="2" fill="none"/>
        <g data-phase="1"><rect x="1" y="1" width="217" height="80" rx="12"/><text x="17" y="31">01 · Choose</text><text class="flow-note" x="17" y="57">One feasible ${config.action}</text></g>
        <g data-phase="2"><rect x="249" y="1" width="209" height="80" rx="12"/><text x="265" y="31">02 · Observe</text><text class="flow-note" x="265" y="57">${config.count} selected ${config.parts}</text></g>
        <g data-phase="3"><rect x="489" y="1" width="230" height="80" rx="12"/><text x="505" y="31">03 · Update</text><text class="flow-note" x="505" y="57">Learn, then choose again</text></g>
      </svg>
      <p id="guide-status" role="status" aria-live="polite"></p>
      <details class="feedback"><summary>Inspect selected feedback</summary>
        <p id="feedback-count"></p>
        <p>Each row is one noisy observation. Unselected components return no observations. Shared models can still change their predictions for similar components.</p>
        <div class="feedback-scroll"><table><thead><tr><th>Selected component</th><th>Observed value</th><th>Samples stored</th></tr></thead><tbody id="feedback-rows"></tbody></table></div>
      </details>
    </section>`
  var step = document.getElementById('step')
  var play = document.getElementById('play')
  var speed = document.getElementById('speed')
  var status = document.getElementById('guide-status')
  var rows = document.getElementById('feedback-rows')
  var count = document.getElementById('feedback-count')
  var playIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l14-8z" fill="currentColor"/></svg>'
  var pauseIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z" fill="currentColor"/></svg>'

  step.textContent = 'Next step →'

  function refresh() {
    var st = config.state()
    var label = config.policy()
    status.textContent =
      phase === 0 && !completed
        ? 'Ready. Press Play for the walkthrough, or Next step to choose a ' + config.action + '.'
        : phase === 1
          ? '1 / 3 · Chosen. Next: reveal the ' + config.count + ' selected ' + config.parts + '.'
          : phase === 2
            ? '2 / 3 · Observed. Next: store these ' +
              config.count +
              ' observations and update estimates.'
            : '3 / 3 · Updated. Next: choose a new ' + config.action + ' using what was learned.'
    rows.replaceChildren()
    var feedback = st.feedback || []
    count.textContent = feedback.length
      ? '(' + feedback.length + ' · ' + label + ')'
      : '(not revealed yet)'
    feedback.forEach(function (entry) {
      var row = document.createElement('tr')
      ;[entry.label, entry.value.toFixed(1), String(st.n[entry.index])].forEach(function (value) {
        var cell = document.createElement('td')
        cell.textContent = value
        row.appendChild(cell)
      })
      rows.appendChild(row)
    })
    // Evaluation belongs to the last completed action; hide stale totals while a new one is pending.
    if (phase)
      ['s-cost', 's-gap'].forEach(function (id) {
        document.getElementById(id).textContent = 'Pending update'
      })
  }
  function advance() {
    if (phase === 0) {
      config.choose()
      phase = 1
    } else if (phase === 1) {
      config.reveal()
      phase = 2
    } else {
      config.learn()
      phase = 0
      completed = true
    }
    config.render()
    refresh()
    config.height()
  }
  function schedule() {
    clearTimeout(timer)
    if (playing)
      timer = setTimeout(function () {
        advance()
        schedule()
      }, Number(speed.value))
  }
  function setPlaying(value) {
    playing = value
    config.setPlaying(value)
    play.innerHTML =
      (value ? pauseIcon : playIcon) + (value ? 'Pause walkthrough' : 'Play walkthrough')
    play.setAttribute('aria-pressed', String(value))
    status.setAttribute('aria-live', value ? 'off' : 'polite')
    schedule()
  }
  play.onclick = function () {
    setPlaying(!playing)
  }
  step.onclick = function () {
    setPlaying(false)
    advance()
  }
  speed.onchange = schedule
  document.getElementById('reset').onclick = function () {
    setPlaying(false)
    phase = 0
    completed = false
    config.reset()
    refresh()
    config.height()
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) setPlaying(false)
  })
  document.querySelectorAll('details').forEach(function (node) {
    node.addEventListener('toggle', config.height)
  })
  function resizeFlow() {
    var svg = host.querySelector('.guide-flow')
    var narrow = host.clientWidth < 480
    svg.setAttribute('viewBox', narrow ? '0 0 240 270' : '0 0 720 86')
    svg.querySelectorAll(':scope > path').forEach(function (path) {
      path.style.display = narrow ? 'none' : ''
    })
    svg.querySelectorAll('[data-phase]').forEach(function (node, index) {
      node.setAttribute(
        'transform',
        narrow ? 'translate(' + [0, -248, -488][index] + ',' + index * 90 + ')' : ''
      )
    })
    config.height()
  }
  window.addEventListener('resize', resizeFlow)
  resizeFlow()
  setPlaying(false)
  refresh()
  config.height()
  return { refresh: refresh }
}
