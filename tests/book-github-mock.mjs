// Test-process preload only. Application code never imports this module.
// No request is sent to GitHub and no real issue is created by these tests.
import fs from 'node:fs'
if (process.env.DREAM_TEST_MOCK_STORE) {
  const original = global.fetch
  global.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    if (url.startsWith('https://api.github.com/repos/hanialshater/the-dream/issues')) {
      const filename = process.env.DREAM_TEST_MOCK_STORE
      let issues = []
      try {
        issues = JSON.parse(fs.readFileSync(filename, 'utf8'))
      } catch {
        /* First request. */
      }
      if (init?.method === 'POST') {
        const issue = {
          ...JSON.parse(init.body),
          number: issues.length + 1,
          created_at: new Date().toISOString(),
        }
        issues.unshift(issue)
        fs.writeFileSync(filename, JSON.stringify(issues))
        return Response.json(issue, { status: 201 })
      }
      return Response.json(issues)
    }
    return original(input, init)
  }
}
