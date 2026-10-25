---
copiedFrom: system3-city skills/claims-ledger @ 7079c7d
name: claims-ledger
description: Treat every factual sentence a user will see as a claim with an address, a kind of support and a source, verified by someone other than its author. Use when building content that states facts.
---

# Claims ledger

Every factual sentence a reader sees is a claim. Each claim has these fields:
- `id`: its address, e.g. `<domain>.<item>.c<n>`, so a correction can find it later;
- `text`: the sentence exactly as shown;
- `support`: one of
  - `derivation` (can be re-derived),
  - `simulation` (can be re-run),
  - `source` (can be read),
  - `convention` (only needs consistency);
- `source`: what supports it;
- `status`: `unverified` → `verified` | `disputed` | `withdrawn`;
- `checkedBy`, `checkedOn`.

Rules:
- Builders never mark their own claims verified. A checker does, after reading the support.
- A disputed claim blocks publishing. A withdrawn claim also leaves the text.
- If a claim turns out wrong after publishing, correct it at its address. Then find what rested on it, by
  searching for its id, and send those decisions back to review.
- Two sources that cite the same study are one source.

Origin: System 3 Company (lessons with a "Why trust this?" view on every card).
