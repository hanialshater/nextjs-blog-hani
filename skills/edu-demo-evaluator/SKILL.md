---
name: edu-demo-evaluator
description: |
  Evaluate educational demos using Chrome tools for E2E testing. Executes test
  cases from test_cases.json, captures screenshots, verifies learning outcomes.
  Scores QUALITY relative to benchmark. Uses real browser interaction via
  mcp__claude-in-chrome__* tools.
---

# Educational Demo Evaluator

Execute test cases. Verify learning outcomes. Score quality vs benchmark.

## Core Principles

1. **Execute test_cases.json** - don't invent tests
2. **Use Chrome tools** - real browser interaction
3. **Verify LEARNING** - not just button clicks
4. **Score vs benchmark** - quality comparison

## Screenshot System (REQUIRED)

**Critical:** Next generation builders study these screenshots. You MUST organize them:

1. During test execution, click "📸 Capture State" button at key moments
2. After testing, click "⬇️ Download Screenshots" button
3. Screenshots download to **~/Downloads/** with labels (capture_1.png, etc.)
4. **MOVE them to `/problems/<name>/screenshots/agent_X_*.png`**
5. Reference filenames in your evaluation JSON output

**Why required:**
- Gen 2 builders read `screenshots/` to understand which vibes worked visually
- LESSONS_LEARNED tells them what worked; screenshots show them how
- Builders need both to discover their approach for the next generation

Example structure:
```
/problems/quicksort-demo/screenshots/
├── agent_1_initial.png (gen1, narrative vibe)
├── agent_1_step_1.png
├── agent_4_initial.png (gen1, comparison vibe)
├── agent_4_step_1.png
...
```

## Prerequisites

Before evaluation:
1. `test_cases.json` must exist in problem folder
2. Demo HTML file must exist
3. Benchmark screenshots for quality reference

## Workflow

### Step 1: Setup Chrome

```
# Get or create tab
mcp__claude-in-chrome__tabs_context_mcp(createIfEmpty=true)
# Returns: tabId

# Create new tab for testing
mcp__claude-in-chrome__tabs_create_mcp()
# Returns: new tabId - use this one
```

### Step 2: Load Test Cases

```
Read(problems/<name>/test_cases.json)
```

### Step 3: Load Benchmark (quality reference)

```
Read(problems/<name>/benchmark_ux/*.png)
# Note the QUALITY level to compare against
```

### Step 4: Navigate to Demo

```
mcp__claude-in-chrome__navigate(
  url="file:///absolute/path/to/agent.html",
  tabId=X
)

# Wait for load
mcp__claude-in-chrome__computer(
  action="wait",
  duration=2,
  tabId=X
)

# Screenshot initial state
mcp__claude-in-chrome__computer(
  action="screenshot",
  tabId=X
)
```

### Step 5: Execute Each Test Case

For each test case in test_cases.json:

```
# Read page structure
mcp__claude-in-chrome__read_page(tabId=X, filter="interactive")

# Execute steps from test case
for step in test_case.steps:
  if step.action == "find":
    result = mcp__claude-in-chrome__find(query=step.query, tabId=X)

  elif step.action == "input":
    mcp__claude-in-chrome__form_input(ref=found_ref, value=step.value, tabId=X)

  elif step.action == "click":
    mcp__claude-in-chrome__computer(action="left_click", ref=found_ref, tabId=X)

  elif step.action == "wait":
    mcp__claude-in-chrome__computer(action="wait", duration=step.ms/1000, tabId=X)

  elif step.action == "screenshot":
    # Use the built-in Capture State button
    find_result = mcp__claude-in-chrome__find(
      query="Capture State button",
      tabId=X
    )
    mcp__claude-in-chrome__computer(
      action="left_click",
      ref=find_result['ref'],
      tabId=X
    )
```

### Step 5b: Download Screenshots

After executing all test cases:

```
# Click Download Screenshots button
find_result = mcp__claude-in-chrome__find(
  query="Download Screenshots button",
  tabId=X
)
mcp__claude-in-chrome__computer(
  action="left_click",
  ref=find_result['ref'],
  tabId=X
)

# Screenshots automatically download with labels
# (initial_state.png, step_1.png, etc.)
```

### Step 6: Organize Screenshots

After downloading, organize for next generation builders:

```bash
# Screenshots are in ~/Downloads/
# Move them to /problems/<name>/screenshots/ with agent labels

mv ~/Downloads/capture_1.png /problems/<name>/screenshots/agent_1_initial.png
mv ~/Downloads/capture_2.png /problems/<name>/screenshots/agent_1_step_1.png
...
```

**Required naming:** `agent_{id}_{label}.png` so builders can find them by agent.

### Step 7: Verify Learning Outcomes

After organizing screenshots:

1. Compare against test_case.verify expectations
2. Check: Did the demo teach correctly?
3. Review both visual (screenshots) and learning outcomes

```
Questions to answer:
- Does visual match expected? (e.g., "5 bubbled up to root")
- Is the learning outcome achieved?
- Would a learner understand the concept?
```

## Chrome Tools Reference

| Tool | Use For |
|------|---------|
| `tabs_context_mcp` | Get available tabs |
| `tabs_create_mcp` | Create new tab for testing |
| `navigate` | Go to demo URL |
| `read_page` | Get element structure |
| `find` | Locate elements by purpose |
| `form_input` | Enter values in inputs |
| `computer` | Click, wait, screenshot |
| `get_page_text` | Extract visible text |

## Example Evaluation Session

```
# Setup
tabs_context_mcp(createIfEmpty=true) -> existing tabs
tabs_create_mcp() -> tabId: 456

# Navigate
navigate(url="http://localhost:9999/problems/heap-demo/generations/gen1/agent_1.html", tabId=456)

# Wait and let demo initialize
computer(action="wait", duration=2, tabId=456)

# Read structure
read_page(tabId=456, filter="interactive")
-> ref_1: textbox "value input"
-> ref_2: button "Insert"
-> ref_3: button "Extract Min"
-> ref_4: button "📸 Capture State"

# Execute test case: insert_bubble_up
form_input(ref="ref_1", value="5", tabId=456)
computer(action="left_click", ref="ref_2", tabId=456)
computer(action="wait", duration=2, tabId=456)

# Capture at this key moment
computer(action="left_click", ref="ref_4", tabId=456)  # Click Capture State button
computer(action="wait", duration=1, tabId=456)

# Verify
# Check: Did 5 bubble up correctly? Is animation visible?

# ... test more cases ...

# When done, download screenshots
find_result = find(query="Download Screenshots button", tabId=456)
computer(action="left_click", ref=find_result['ref'], tabId=456)

# Then move from ~/Downloads to /problems/heap-demo/screenshots/agent_1_*.png
```

## Viewport Verification

Check viewport issues during testing:

```
# Read full page
read_page(tabId=X, filter="all")

# Check for scroll indicators
# Check if elements are cut off
# Check if buttons are accessible

# Screenshot full page area
computer(action="screenshot", tabId=X)
# Verify: Is everything visible without scrolling?
```

## Score Categories (out of 100)

| Category | Max | Verified By |
|----------|-----|-------------|
| Correctness | 30 | Test cases pass, algorithm accurate |
| Clarity | 20 | Visual quality vs benchmark |
| Educational value | 20 | Learning outcomes achieved |
| Viewport | 15 | All content visible, no scroll |
| Interaction | 15 | Buttons work, no bugs |

## Automatic Deductions

| Issue | Deduction | Detection |
|-------|-----------|-----------|
| Test case fails | -10 each | verify step fails |
| Must scroll | -10 | elements outside viewport |
| Elements cut off | -10 | read_page shows clipped |
| Buttons blocked | -15 | click fails or wrong target |
| Content jumps | -5 | visual comparison |

## Output Format

```json
{
  "agent": "gen2/agent_3.html",
  "benchmarks_read": ["08_heaps.png"],
  "test_cases_executed": [
    {
      "id": "insert_bubble_up",
      "result": "PASS",
      "screenshots": ["capture_1.png", "capture_2.png"],
      "screenshot_notes": "Initial state and after insert step captured in ~/Downloads/",
      "learning_verified": true
    },
    {
      "id": "extract_root",
      "result": "FAIL",
      "reason": "Animation skips comparison step",
      "screenshots": ["capture_3.png", "capture_4.png"],
      "screenshot_notes": "Before extract and after extract in ~/Downloads/",
      "learning_verified": false
    }
  ],
  "viewport_check": {
    "fits_viewport": true,
    "issues": []
  },
  "scores": {
    "correctness": 20,
    "clarity": 18,
    "educational_value": 12,
    "viewport": 15,
    "interaction": 13
  },
  "total": 78,
  "bugs": [],
  "correctness_issues": ["extract animation incomplete"]
}
```

## Reality Check

- If ANY test case fails correctness: max score 50
- Most demos score 30-50
- 70+ requires ALL test cases passing
- Compare screenshots to benchmark for quality judgment

## Cleanup

After evaluation:
```
# Close the test tab (optional)
# Or leave open for debugging
```
