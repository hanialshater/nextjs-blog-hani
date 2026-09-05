import rss from './rss.mjs'
import checkDraftOutput from './check-draft-output.mjs'

async function postbuild() {
  await rss()
  checkDraftOutput()
}

postbuild()
