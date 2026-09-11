// Package the exact blog demos into one offline, shareable review file.
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve('data/posts/learning-the-map/demos')
const read = (name) => readFileSync(path.join(root, name), 'utf8')
const demos = Object.fromEntries(
  ['route', 'matching', 'schedule'].map((kind) => [
    kind,
    read(`${kind}-lab.html`)
      .replace(
        /<link rel="stylesheet" href="decision-lab.css"\s*\/?\s*>/,
        () => `<style>${read('decision-lab.css')}</style>`
      )
      .replace(/<script src="decision-engine.js" defer><\/script>/, '')
      .replace(/<script src="decision-lab.js" defer><\/script>/, '')
      .replace(
        '</body>',
        () =>
          `<script>${read('decision-engine.js')}</script><script>${read('decision-lab.js')}</script></body>`
      ),
  ])
)

const output = process.argv[2] || '/tmp/decision-laboratory.html'
writeFileSync(
  output,
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Decision laboratory · Part 2</title>
<style>
:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;background:light-dark(#eef3f5,#0b151b);color:light-dark(#172b36,#e0edf1);font:16px/1.5 system-ui,sans-serif}.bar{max-width:1080px;margin:18px auto;padding:0 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center}.bar strong{margin-right:auto}.bar button,.bar select{font:inherit;min-height:44px;padding:8px 12px;border:1px solid light-dark(#bccbd1,#3d525b);border-radius:6px;background:light-dark(white,#17262e);color:inherit;cursor:pointer}.bar button[aria-pressed=true]{background:light-dark(#006c60,#55cbb0);color:light-dark(white,#092820)}label{font-size:14px}iframe{display:block;width:100%;max-width:1080px;margin:0 auto 24px;border:0;background:light-dark(white,#111c23)}iframe.narrow{max-width:390px}button:focus-visible,select:focus-visible{outline:3px solid #418de6;outline-offset:2px}@media(max-width:560px){.bar strong{width:100%}.bar button{flex:1}}
</style></head><body><nav class="bar" aria-label="Choose an experiment"><strong>Decision laboratory</strong><button data-kind="route" aria-pressed="true">Routing</button><button data-kind="matching" aria-pressed="false">Matching</button><button data-kind="schedule" aria-pressed="false">Scheduling</button><label>Reading width <select id="width"><option value="wide">Full</option><option value="narrow">Phone</option></select></label></nav><iframe id="demo" title="Routing experiment" sandbox="allow-scripts" height="900"></iframe><script>
const demos=${JSON.stringify(demos).replace(/</g, '\\u003c')};
const frame=document.getElementById('demo');
document.querySelectorAll('[data-kind]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));frame.title=button.textContent+' experiment';frame.srcdoc=demos[button.dataset.kind]}));
document.getElementById('width').addEventListener('change',event=>{frame.className=event.target.value==='narrow'?'narrow':''});
window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.data?.type==='demo-height'&&Number.isFinite(event.data.height)&&event.data.height>0&&event.data.height<20000)frame.height=String(Math.ceil(event.data.height))});
frame.srcdoc=demos.route;
</script></body></html>`
)
console.log(output)
