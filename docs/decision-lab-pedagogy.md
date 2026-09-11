# Part 2: preserve the semi-bandit story

The original article prose is preserved, with visible CVXPY code blocks added beside the routing, matching and calendar examples. The original Berlin52 map, 18×18 matching, weekly calendar, policy races, charts and contextual learners remain the main demos.

The controls now start paused and make one complete learning loop inspectable:

1. Choose a feasible tour, matching or schedule using current estimates.
2. Reveal one noisy outcome for each selected component; do not update yet.
3. Store those observations and update estimates before choosing again.

Play advances the same stages; Pause, Reset and manual Next are explicit. The feedback ledger shows every selected outcome and stored sample count for the selected policy. Shared models generalize from selected observations without receiving unselected outcomes.

The solver panel shows JavaScript entry points and CVXPY equivalents. Matching and scheduling use exact Hungarian assignment; Berlin uses a heuristic tour solver. The Python tour formulation includes subtour elimination and a 30-second time limit. Hidden-truth charts are evaluator diagnostics, not learner feedback or a certificate of optimality.

Thompson sampling now draws one symmetric cost matrix per decision, rather than resampling every time local search queries an edge.

Build the portable review gallery with `node scripts/export-decision-labs.mjs /tmp/decision-laboratory.html`. The simulations work offline; the decorative OpenStreetMap Berlin backdrop requires network access and retains its heatmap fallback.

Verification: `node --test tests/semibandit-feedback.test.mjs` checks feasible selections, delayed selected-only updates, replay reset and a fixed symmetric Thompson sample. A separate DOM harness checked Play/Pause/Next/Reset and the feedback ledger in all three demos. CVXPY/HiGHS models were executed against brute-force assignment and TSP optima, including a disconnected-subtour trap. Full browser visual QA remains blocked by the protected preview.

Playback uses a constant Next step label, fixed control widths and fixed status/feedback space. The diagram no longer transfers a highlight between stages. Policy buttons persist through renders so playback does not reset keyboard focus. A DOM harness checked these invariants over twelve automatic stages in each demo.
