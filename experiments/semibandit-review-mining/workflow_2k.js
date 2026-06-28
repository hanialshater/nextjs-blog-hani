export const meta = {
  name: 'semibandit-review-mining-2k',
  description: 'Haiku low-quality filter over 2000 real reviews, then BT + semi-bandit top-K allocation via a fan-out of judge agents',
  phases: [
    { title: 'Filter', detail: 'Haiku agents triage 2000 reviews, drop low-quality', model: 'haiku' },
    { title: 'Extract', detail: 'Haiku agents mine survivors for noteworthy snippets', model: 'haiku' },
    { title: 'SemiBandit', detail: 'dynamic rounds: UCB slate -> 2-lens judge panel -> BT refit' },
    { title: 'Synthesize', detail: 'editorial writeup of the winning slate' },
  ],
}

const BATCH_PATHS = ["/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_00.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_01.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_02.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_03.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_04.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_05.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_06.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_07.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_08.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_09.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_10.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_11.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_12.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_13.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_14.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_15.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_16.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_17.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_18.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_19.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_20.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_21.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_22.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_23.json", "/tmp/claude-0/-home-user-nextjs-blog-hani/ee646518-bb12-5818-9931-b24a0e250230/scratchpad/batches2k/batch_24.json"];

// ---- Hyperparameters ----
const EXTRACT_CAP = 280;   // max survivors sent to extraction
const POOL_CAP = 160;      // max candidates entering the bandit
const K = 18;
const MAX_PER_TYPE = 5;
const EXPLORE = 1.0;
const EPOCHS = 250;
const LR = 0.06;
const L2 = 0.01;
const MAX_ROUNDS = 14;
const MIN_ROUNDS = 7;
const STABLE_TOP_N = 12;

const CANDIDATE_TYPES = ['joke','story','warning','durability','regret','use_case','praise','service','value','complaint'];

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

function rankingToPairwise(rankedIds, validSet){
  const ids = rankedIds.filter(id => validSet.has(id));
  const pairs = [];
  for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++) pairs.push({winner_id:ids[i],loser_id:ids[j]});
  const w = 1.0/Math.max(1,Math.sqrt(pairs.length));
  pairs.forEach(p=>p.weight=w);
  return pairs;
}
function fitBradleyTerry(ids, pairs){
  const s={}; ids.forEach(i=>s[i]=0);
  const rand=mulberry32(2654435761); const idx=pairs.map((_,i)=>i);
  for(let e=0;e<EPOCHS;e++){
    for(let i=idx.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));const t=idx[i];idx[i]=idx[j];idx[j]=t;}
    for(const k of idx){const p=pairs[k];const w=p.weight||1;const d=s[p.winner_id]-s[p.loser_id];
      const wp=1/(1+Math.exp(-d));const err=1-wp;
      s[p.winner_id]+=LR*w*(err-L2*s[p.winner_id]); s[p.loser_id]-=LR*w*(err+L2*s[p.loser_id]);}
  }
  const mean=ids.reduce((a,i)=>a+s[i],0)/Math.max(1,ids.length);
  const out={}; ids.forEach(i=>out[i]=s[i]-mean); return out;
}
function selectSlate(cands, states, roundId, anchors){
  const scored=cands.map(c=>{const st=states[c.candidate_id];
    const bonus=EXPLORE*Math.sqrt(Math.log(roundId+1)/(st.pulls+1));
    return {c,ucb:st.bt_score+bonus};});
  scored.sort((a,b)=>b.ucb-a.ucb);
  const selected=[],typeCount={},have=new Set();
  for(const s of scored){const t=s.c.candidate_type; if((typeCount[t]||0)>=MAX_PER_TYPE)continue;
    selected.push(s.c);have.add(s.c.candidate_id);typeCount[t]=(typeCount[t]||0)+1; if(selected.length>=K)break;}
  if(selected.length<K) for(const s of scored){if(have.has(s.c.candidate_id))continue;selected.push(s.c);have.add(s.c.candidate_id);if(selected.length>=K)break;}
  for(const aid of anchors){if(!have.has(aid)){const a=cands.find(c=>c.candidate_id===aid);if(a){selected.push(a);have.add(aid);}}}
  return selected;
}
function pickAnchors(cands, states){
  const sorted=cands.slice().sort((a,b)=>states[b.candidate_id].bt_score-states[a.candidate_id].bt_score);
  if(sorted.length<3)return sorted.map(c=>c.candidate_id);
  return [sorted[0].candidate_id, sorted[Math.floor(sorted.length/2)].candidate_id, sorted[sorted.length-1].candidate_id];
}
function slateListing(slate){return slate.map(c=>`${c.candidate_id} [${c.candidate_type}] (${c.rating}star): "${c.text}"`).join('\n');}

// =================== Phase 0: Haiku low-quality filter ===================
phase('Filter');
log(`Filtering ${BATCH_PATHS.length} batches (~80 reviews each) with Haiku to drop low-quality reviews`);

const FILTER_SCHEMA = {
  type:'object',
  properties:{ survivors:{ type:'array', items:{ type:'object',
    properties:{
      id:{type:'string'},
      rating:{type:'integer'},
      country:{type:'string'},
      potential:{type:'string', enum:['high','med']}
    }, required:['id','rating','potential'], additionalProperties:false } } },
  required:['survivors'], additionalProperties:false
};

const filterThunks = BATCH_PATHS.map((p, b) => () => agent(
`Use the Read tool to read the JSON file at this absolute path:
${p}

It is an array of customer reviews, each shaped {id, r (rating 1-5), c (country), t (title), x (review text)}.

You are a LIGHTWEIGHT QUALITY FILTER. Keep ONLY reviews that contain a genuinely noteworthy moment a reader might want to click: a joke, a vivid story, a concrete warning, a specific durability/use-case detail, clear buyer regret, a striking complaint, or specific memorable praise.

DROP (do not return) reviews that are generic, vague, empty, duplicative boilerplate, or just a flat rating with no specific content ("works great", "as described", "good product", "terrible service" with no detail).

Be strict — this is the cheap pass whose job is to throw away the bottom. For each KEPT review return its id, its rating, its country, and potential = "high" (clearly clickable) or "med" (decent). Return nothing for dropped reviews.`,
  { label:`filter:batch${b}`, phase:'Filter', schema: FILTER_SCHEMA, agentType:'general-purpose', model:'haiku' }
));

const filterResults = await parallel(filterThunks);

const survivorMap = {};   // id -> {rating, country, potential, batch}
BATCH_PATHS.forEach((_, b) => {
  const res = filterResults[b];
  if(!res || !res.survivors) return;
  for(const s of res.survivors){
    if(!s || !s.id) continue;
    survivorMap[s.id] = { rating: s.rating||0, country: s.country||'', potential: s.potential==='high'?'high':'med', batch: b };
  }
});
let survivorIds = Object.keys(survivorMap);
const nHigh = survivorIds.filter(id=>survivorMap[id].potential==='high').length;
log(`Survivors: ${survivorIds.length} of 2000 kept (${nHigh} high, ${survivorIds.length-nHigh} med)`);

// cap survivors: high first, then med; deterministic by id
survivorIds.sort((a,b)=>{
  const pa=survivorMap[a].potential==='high'?0:1, pb=survivorMap[b].potential==='high'?0:1;
  if(pa!==pb) return pa-pb;
  return a<b?-1:1;
});
const capped = survivorIds.slice(0, EXTRACT_CAP);
log(`Sending ${capped.length} survivors to extraction (cap ${EXTRACT_CAP})`);

// =================== Phase 1: Haiku extraction ===================
phase('Extract');
const EXTRACT_SCHEMA = {
  type:'object',
  properties:{ candidates:{ type:'array', items:{ type:'object',
    properties:{
      review_id:{type:'string'},
      candidate_type:{type:'string', enum:CANDIDATE_TYPES},
      text:{type:'string'}
    }, required:['review_id','candidate_type','text'], additionalProperties:false } } },
  required:['candidates'], additionalProperties:false
};

// group capped survivors by their batch
const byBatch = {};
for(const id of capped){ const b=survivorMap[id].batch; (byBatch[b]=byBatch[b]||[]).push(id); }

const extractThunks = Object.keys(byBatch).map(bStr => {
  const b = +bStr; const ids = byBatch[b]; const p = BATCH_PATHS[b];
  return () => agent(
`Use the Read tool to read the JSON file at this absolute path:
${p}

It is an array of reviews shaped {id, r, c, t, x}. ONLY process the reviews whose id is in this list:
${ids.join(', ')}

For EACH of those reviews, extract the single MOST noteworthy self-contained snippet (a lightly-trimmed quote, 1-3 sentences, taken from that review's "x" text) and tag it with the best candidate_type from: ${CANDIDATE_TYPES.join(', ')}. If one of the listed reviews genuinely has nothing noteworthy, skip it. Return review_id exactly as given.`,
    { label:`extract:batch${b}`, phase:'Extract', schema: EXTRACT_SCHEMA, agentType:'general-purpose', model:'haiku' }
  );
});

const extractResults = (await parallel(extractThunks)).filter(Boolean);

let candidates=[]; let cnum=0;
for(const res of extractResults){
  for(const cand of (res.candidates||[])){
    const meta = survivorMap[cand.review_id];
    if(!meta) continue;
    const txt=(cand.text||'').trim();
    if(txt.length<12) continue;
    cnum+=1;
    candidates.push({
      candidate_id:`cand_${String(cnum).padStart(3,'0')}`,
      review_id:cand.review_id,
      candidate_type:CANDIDATE_TYPES.includes(cand.candidate_type)?cand.candidate_type:'complaint',
      rating:meta.rating, country:meta.country, potential:meta.potential,
      text:txt.slice(0,320),
    });
  }
}
log(`Extracted ${candidates.length} candidates from survivors`);

// cap pool: high potential first, deterministic
candidates.sort((a,b)=>{const pa=a.potential==='high'?0:1,pb=b.potential==='high'?0:1; if(pa!==pb)return pa-pb; return a.candidate_id<b.candidate_id?-1:1;});
candidates = candidates.slice(0, POOL_CAP);
// re-id sequentially so ids are clean
candidates.forEach((c,i)=>{ c.candidate_id=`cand_${String(i+1).padStart(3,'0')}`; });
log(`Bandit pool: ${candidates.length} candidates (cap ${POOL_CAP})`);

if(candidates.length<K) return { error:'too few candidates', candidates };

// =================== Phase 2: Semi-bandit ===================
phase('SemiBandit');
const candidateIds=candidates.map(c=>c.candidate_id);
const states={}; candidateIds.forEach(id=>states[id]={bt_score:0,pulls:0});
let pairwise=[]; const convergence=[]; let stableCount=0; let roundsRun=0;

const JUDGE_SCHEMA={type:'object',properties:{ranked_ids:{type:'array',items:{type:'string'}}},required:['ranked_ids'],additionalProperties:false};
const LENSES=[
  {key:'noteworthy',instruction:'how NOTEWORTHY each snippet is: likely to be clicked, specific rather than generic, funny / surprising / emotionally engaging, and memorable.'},
  {key:'shopper',instruction:'how genuinely USEFUL each snippet is to a prospective shopper: informative, specific, trustworthy and safe to surface on a product page.'},
];

for(let roundId=1; roundId<=MAX_ROUNDS; roundId++){
  const anchors = roundId===1?[]:pickAnchors(candidates,states);
  const slate = selectSlate(candidates,states,roundId,anchors);
  const validSet = new Set(slate.map(c=>c.candidate_id));
  const listing = slateListing(slate);
  const judgeThunks = LENSES.map(lens => () => agent(
`You are ranking ${slate.length} candidate review snippets by ${lens.instruction}

Rank ALL of them from strongest to weakest. Return ranked_ids containing EVERY candidate_id below exactly once, best first.

Candidates:
${listing}`,
    { label:`judge:r${roundId}:${lens.key}`, phase:'SemiBandit', schema: JUDGE_SCHEMA }
  ));
  const rankings = (await parallel(judgeThunks)).filter(Boolean);
  for(const rk of rankings) pairwise.push(...rankingToPairwise(rk.ranked_ids||[], validSet));
  const bt = fitBradleyTerry(candidateIds, pairwise);
  candidateIds.forEach(id=>states[id].bt_score=bt[id]||0);
  slate.forEach(c=>states[c.candidate_id].pulls+=1);
  const topNow=candidateIds.slice().sort((a,b)=>states[b].bt_score-states[a].bt_score).slice(0,STABLE_TOP_N);
  convergence.push({round:roundId,slate_size:slate.length,pairs:pairwise.length,top:topNow});
  const prev=convergence.length>=2?convergence[convergence.length-2].top:null;
  const same=prev&&prev.length===topNow.length&&prev.every((x,i)=>x===topNow[i]);
  stableCount=same?stableCount+1:0; roundsRun=roundId;
  log(`Round ${roundId}: slate=${slate.length}, pairs=${pairwise.length}, stable=${stableCount}`);
  if(roundId>=MIN_ROUNDS && stableCount>=2){ log(`Converged after ${roundId} rounds`); break; }
}

const t=roundsRun;
const enriched=candidates.map(c=>{const st=states[c.candidate_id];
  const uncertainty=1/Math.sqrt(st.pulls+1);
  const ucb=st.bt_score+EXPLORE*Math.sqrt(Math.log(t+1)/(st.pulls+1));
  return {...c, bt_score:+st.bt_score.toFixed(4), pulls:st.pulls, uncertainty:+uncertainty.toFixed(4), ucb:+ucb.toFixed(4)};});
const byBt=enriched.slice().sort((a,b)=>b.bt_score-a.bt_score);
const byUcb=enriched.slice().sort((a,b)=>b.ucb-a.ucb);
const medianBt=byBt[Math.floor(byBt.length/2)].bt_score;
const uncertainPromising=enriched.filter(c=>c.bt_score>=medianBt&&c.pulls<=2).sort((a,b)=>b.uncertainty-a.uncertainty).slice(0,12);
const finalSlate=[]; const ftc={};
for(const c of byBt){ if((ftc[c.candidate_type]||0)>=3)continue; finalSlate.push(c); ftc[c.candidate_type]=(ftc[c.candidate_type]||0)+1; if(finalSlate.length>=12)break; }

// =================== Phase 3: Synthesize ===================
phase('Synthesize');
const synthListing=finalSlate.map((c,i)=>`${i+1}. [${c.candidate_type}, ${c.rating}star, bt=${c.bt_score}] "${c.text}"`).join('\n');
const editorial=await agent(
`These are the top review snippets a Haiku filter + Bradley-Terry + semi-bandit pipeline surfaced as most noteworthy from 2000 real customer reviews. Write a short (130-190 word) editorial "Most Noteworthy Reviews" module: a 1-sentence intro, then for the 5-6 strongest, a tight one-line editorial caption (do not just repeat the quote). Punchy and honest.

Winners:
${synthListing}`,
  { label:'synthesize:editorial', phase:'Synthesize' }
);

return {
  num_reviews:2000,
  survivors_kept:survivorIds.length,
  survivors_high:nHigh,
  sent_to_extraction:capped.length,
  num_candidates:candidates.length,
  rounds_run:roundsRun,
  pairwise_count:pairwise.length,
  candidates:enriched,
  tables:{best_by_bt:byBt.slice(0,20), most_worth_testing:byUcb.slice(0,20), uncertain_promising:uncertainPromising, final_slate:finalSlate},
  convergence, editorial,
};
