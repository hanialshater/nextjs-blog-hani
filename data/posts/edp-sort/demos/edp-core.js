(() => {
  function mulberry32(seed) {
    let state = seed >>> 0
    return () => {
      state += 0x6D2B79F5
      let value = state
      value = Math.imul(value ^ (value >>> 15), value | 1)
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296
    }
  }

  function normal(rng) {
    const u = Math.max(rng(), 1e-12)
    const v = rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  function sigmoid(value) {
    if (value >= 0) {
      const z = Math.exp(-value)
      return 1 / (1 + z)
    }
    const z = Math.exp(value)
    return z / (1 + z)
  }

  function argmax(values) {
    let best = 0
    for (let index = 1; index < values.length; index += 1) {
      if (values[index] > values[best]) best = index
    }
    return best
  }

  function ranks(values) {
    const order = Array.from({ length: values.length }, (_, index) => index)
    order.sort((left, right) => values[right] - values[left] || left - right)
    const result = new Array(values.length)
    order.forEach((item, rank) => {
      result[item] = rank
    })
    return result
  }

  function kendallTau(firstRanks, secondRanks) {
    let concordant = 0
    let discordant = 0
    for (let left = 0; left < firstRanks.length; left += 1) {
      for (let right = left + 1; right < firstRanks.length; right += 1) {
        const first = Math.sign(firstRanks[left] - firstRanks[right])
        const second = Math.sign(secondRanks[left] - secondRanks[right])
        if (first * second > 0) concordant += 1
        if (first * second < 0) discordant += 1
      }
    }
    const total = firstRanks.length * (firstRanks.length - 1) / 2
    return total ? (concordant - discordant) / total : 1
  }

  // One stochastic-gradient step for a Bradley-Terry logistic likelihood.
  // ratings live on the same scale as the model log-odds.
  function eloUpdate(ratings, left, right, leftWon, learningRate) {
    const expectedLeftWin = sigmoid(ratings[left] - ratings[right])
    const outcome = leftWon ? 1 : 0
    const delta = learningRate * (outcome - expectedLeftWin)
    ratings[left] += delta
    ratings[right] -= delta
    return expectedLeftWin
  }

  function topK(values, k) {
    const order = Array.from({ length: values.length }, (_, index) => index)
    order.sort((left, right) => values[right] - values[left] || left - right)
    return order.slice(0, k)
  }

  function resizeCanvas(canvas, height) {
    const dpr = window.devicePixelRatio || 1
    const width = Math.max(canvas.clientWidth || 1, 1)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const context = canvas.getContext('2d')
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { context, width, height }
  }

  window.EDP = {
    argmax,
    eloUpdate,
    kendallTau,
    mulberry32,
    normal,
    ranks,
    resizeCanvas,
    sigmoid,
    topK,
  }
})()
