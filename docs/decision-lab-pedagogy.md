# Part 2: guided decision laboratories

The article embeds `route-lab.html`, `matching-lab.html`, and `schedule-lab.html`.
They share a dependency-free engine and interface. Earlier, larger demo files
remain in the bundle but are not embedded in the revised article.

## Learning design

| Experiment | Reader action | Failure made visible | Transfer question |
| --- | --- | --- | --- |
| Routing | Select six stops in order; try the six cheapest edges | Two cheap triangles are not a connected tour | Which constraints must hold for the whole decision? |
| Matching | Assign one expert per client; try independent favourites | Multiple clients claim one expert | What does this choice leave for the other clients? |
| Scheduling | Book four clients into feasible appointments | Unavailable bookings cannot be rescued by high scores | When can evidence about one booking inform another? |

Each learning loop pauses at commitment, observation, and update. Before update,
the estimates retain their old values. After update, direct evidence and shared
inference have distinct marks; the evidence table shows before/after estimates
and direct observation counts. No simulation auto-plays on load.

## Experimental contract

- Enumerate all 60 undirected six-stop tours, 24 four-by-four matchings, or 84
  constrained schedules. Removing scheduling restrictions gives 360 assignments.
- Use the same solver and public starting estimates across policies.
- Observe only selected components. Seed outcomes by world, round, and component,
  independently of policy execution order.
- Sample one fixed plausible world per round for the Thompson-style policy.
- Treat exploration scales and the Gaussian sampling approximation as heuristics.
- Share residual information through public groups, excluding an arm's own
  observations from its peer estimate. Shrink toward the resulting prior, with
  direct evidence taking increasing weight.
- Compute final recommendation quality from a plan selected by learned means,
  never by the true value of the best plan visited.
- Report cumulative pseudo-regret separately. Twelve-world comparisons show means
  and the min–max final gap; the range is not a confidence interval.
- Calendar constraint ablation preserves the hidden potential outcomes. The
  structure control changes the data-generating signal, with seeds fixed.
- Do not promise a universal winner. Greedy can benefit from a good initial prior;
  shared estimates can be harmful when the grouping has no predictive signal.

## Validation

Run `node --test tests/decision-lab-engine.test.mjs` for seven engine tests covering
feasibility, the invalid shortcuts, the calendar ablation, feedback locality,
shared inference, hidden-truth isolation, stable sampling, common noise, and metric
accounting. This command is included in CI.

An isolated JSDOM interaction pass exercised all three interfaces: the invalid
shortcut, exact solver, commit/reveal/update sequence, observation counts, shared
inference, next-round selection, twelve-world comparison, changing structure,
calendar ablation, reset, keyboard routing, and conflicting assignments. All
three passed without DOM runtime errors.

The first Vercel preview built successfully. Browser visual QA remains unverified:
the cloud browser cannot reach the local server, and the Vercel preview requires
sign-in to a team unavailable to the connected Vercel account. DOM checks do not
establish visual quality, touch target quality, or screen-reader usability.

## Offline review

Run `node scripts/export-decision-labs.mjs /absolute/path/decision-laboratory.html`.
This packages the exact three demos, without external dependencies, into one file.
The reader can select a demo and switch between full and 390-pixel reading widths.
The export uses a sandboxed iframe and validates resize messages from that frame.

Next visual review should cover desktop and narrow layouts, dark mode, all three
learning phases, the expanded evidence table, and comparison results. Have a new
reader explain the selected-only feedback rule and the difference between direct
evidence and shared inference before calling the pedagogy validated with learners.

## Guided playback and diagram revision

The main walkthrough has one prominent next-step button in a stable position. It
first exposes the invalid shortcut, then finds a feasible plan, then commits it.
Play/Pause advances the same state machine, with six seconds for the initial
conflict and four seconds per subsequent step. It pauses after three rounds;
manual interaction, changing stages, leaving the page and hiding the tab cancel
the pending timer. No playback begins automatically on load.

Routing now shows two districts and highlights the missing connection. Matching
uses a bipartite SVG with capacity counts and collision highlights. Scheduling
uses a three-day SVG calendar with unavailable bookings marked directly. Numeric
matrices remain available under an expandable inspection control. SVG scenes were
rendered and inspected separately; this does not substitute for full browser QA.

An additional isolated DOM pass checked the entire next-button sequence, one
primary action, all SVG states, play/pause/resume, the three-round stop, cancelling
playback on navigation, and pausing on tab visibility changes in all three labs.
