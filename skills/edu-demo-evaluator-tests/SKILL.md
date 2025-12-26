---
name: edu-demo-evaluator-tests
description: |
  Execute test_cases.json against educational demos. Systematic testing via Chrome
  E2E. Single tab, sequential agents. Output: agent_X_tests.json with PASS/FAIL/PARTIAL
  results. Captures screenshots and identifies bugs/blockers.
---

# Educational Demo Evaluator - Test Case Runner

Execute test_cases.json systematically. Report PASS/FAIL. Find bugs.

## Core Principles

1. **Execute test_cases.json** - don't invent tests, use what's defined
2. **Use Chrome E2E tools** - real browser interaction
3. **One tab, all agents** - sequential navigation through HTTP server
4. **Identify blockers** - what prevents learning?
5. **Screenshot each test** - visual evidence of pass/fail

## Prerequisites

Before evaluation:
1. Test cases must exist: `problems/<name>/test_cases.json`
2. Demo HTML files exist in: `generations/gen{N}/agent_X.html`
3. HTTP server running on localhost:9999
4. All agents accessible via: `http://localhost:9999/problems/<name>/generations/gen{N}/agent_X.html`

## Workflow

### Step 1: Setup

```bash
# Start HTTP server (from problem root directory)
cd /Users/hani/code-evo-agent-simple
python3 -m http.server 9999 &
# Server running on http://localhost:9999

# Verify it works
curl http://localhost:9999/problems/quicksort-demo/generations/gen2/agent_1.html
# Should return HTML content
```

### Step 2: Chrome Setup

```
# Get tab context
mcp__claude-in-chrome__tabs_context_mcp(createIfEmpty=true)
# Returns: existing tabs

# Create ONE tab for all agents (reuse for sequential testing)
mcp__claude-in-chrome__tabs_create_mcp()
# Returns: tabId - use this for ALL agents
```

### Step 3: Load Test Cases

```
# Read the test cases file
Read(problems/<name>/test_cases.json)

# Example structure:
{
  "test_cases": [
    {
      "id": "pivot_visibility",
      "name": "Pivot element is highlighted",
      "steps": [
        {"action": "find", "query": "start or play button"},
        {"action": "click", "ref": "ref_X"},
        {"action": "screenshot"},
      ],
      "verify": "Can see pivot element clearly marked"
    },
    ...
  ]
}
```

### Step 4: Test Each Agent

For each agent (agent_1 through agent_5):

**Navigate to agent**:
```
mcp__claude-in-chrome__navigate(
  url="http://localhost:9999/problems/quicksort-demo/generations/gen2/agent_X.html",
  tabId=tabId
)

# Wait for load
mcp__claude-in-chrome__computer(action="wait", duration=3, tabId=tabId)

# Screenshot initial state
mcp__claude-in-chrome__computer(action="screenshot", tabId=tabId)
```

**For each test case**:
```
# Read page structure
mcp__claude-in-chrome__read_page(tabId=tabId, filter="interactive")

# Execute steps from test_case.steps
for step in test_case["steps"]:
  if step["action"] == "find":
    result = mcp__claude-in-chrome__find(
      query=step["query"],
      tabId=tabId
    )
    # result contains ref_X

  elif step["action"] == "click":
    mcp__claude-in-chrome__computer(
      action="left_click",
      ref=step["ref"],
      tabId=tabId
    )

  elif step["action"] == "input":
    mcp__claude-in-chrome__form_input(
      ref=step["ref"],
      value=step["value"],
      tabId=tabId
    )

  elif step["action"] == "wait":
    mcp__claude-in-chrome__computer(
      action="wait",
      duration=step.get("duration", 2),
      tabId=tabId
    )

  elif step["action"] == "screenshot":
    # Use the built-in screenshot button
    find_result = mcp__claude-in-chrome__find(
      query="Capture State button",
      tabId=tabId
    )
    mcp__claude-in-chrome__computer(
      action="left_click",
      ref=find_result['ref'],
      tabId=tabId
    )

# Verify result
# Read test_case["verify"] and check if condition is met
# Screenshots captured in demo, download them after all agents tested
```

### Step 5: Record Results

For each test case:
```json
{
  "id": "pivot_visibility",
  "result": "PASS",
  "notes": "Pivot clearly marked with highlight and label"
}
```

Or:
```json
{
  "id": "comparison_counter_accuracy",
  "result": "FAIL",
  "notes": "Counter shows 'Attempts: 5' but test expects comparison count. Different metric.",
  "blocker": false
}
```

Or:
```json
{
  "id": "step_explanation",
  "result": "PARTIAL",
  "notes": "Explanations exist but sometimes cut off by viewport on smaller screens",
  "blocker": false
}
```

### Step 6: Identify Blockers

A blocker is something that **prevents learning**:
- Test completely fails (no visualization)
- Key feature missing (can't see pivot)
- Algorithm is wrong (shows incorrect result)
- Critical bug (crashes, freezes)

**Not blockers** (solvable issues):
- Minor UI polish
- Animation speed adjustable
- Counter format different but accurate
- Viewport requires slight scroll

## Output Format

```json
{
  "agent": "gen2/agent_4",
  "test_results": [
    {
      "id": "pivot_visibility",
      "result": "PASS",
      "notes": "Pivot highlighted with blue color and PIVOT label"
    },
    {
      "id": "comparison_counter_accuracy",
      "result": "PASS",
      "notes": "Counter matches expected value"
    },
    {
      "id": "swap_counter_accuracy",
      "result": "PASS",
      "notes": "Swap count accurate"
    },
    {
      "id": "partition_visualization",
      "result": "PASS",
      "notes": "Left/right zones clearly visible"
    },
    {
      "id": "sorted_elements_indication",
      "result": "PASS",
      "notes": "Sorted elements grayed out"
    },
    {
      "id": "play_pause_control",
      "result": "PASS",
      "notes": "Play/pause buttons work correctly"
    },
    {
      "id": "step_control",
      "result": "PARTIAL",
      "notes": "Step-by-step works but speed is fixed"
    },
    {
      "id": "reset_functionality",
      "result": "PASS",
      "notes": "Reset button generates new array"
    },
    {
      "id": "small_array_handling",
      "result": "PASS",
      "notes": "Works with 5 elements"
    },
    {
      "id": "large_array_handling",
      "result": "PASS",
      "notes": "Works with 50+ elements, scrolls if needed"
    },
    {
      "id": "no_scrolling_required",
      "result": "PARTIAL",
      "notes": "Large arrays require vertical scroll"
    },
    {
      "id": "step_explanation",
      "result": "PASS",
      "notes": "Each step has clear explanation"
    },
    {
      "id": "animation_speed",
      "result": "PASS",
      "notes": "400ms transition speed looks good"
    },
    {
      "id": "already_sorted_edge_case",
      "result": "PASS",
      "notes": "Handles already-sorted array correctly"
    }
  ],
  "pass_count": 12,
  "partial_count": 2,
  "fail_count": 0,
  "bugs_found": [
    "Large array viewport scroll necessary"
  ],
  "blockers": "None - all tests pass or partial"
}
```

## Test Case Examples

From `problems/quicksort-demo/test_cases.json`:

### Test: pivot_visibility
```json
{
  "id": "pivot_visibility",
  "name": "Pivot element is highlighted",
  "learning_outcome": "Learner sees which element is the pivot",
  "steps": [
    {"action": "wait", "duration": 1},
    {"action": "screenshot"}
  ],
  "verify": "Initial state shows a pivot element distinctly highlighted (color, label, or border)"
}
```

### Test: partition_visualization
```json
{
  "id": "partition_visualization",
  "name": "Left and right partitions visible",
  "learning_outcome": "Learner understands partitioning concept",
  "steps": [
    {"action": "find", "query": "play button"},
    {"action": "click", "ref": "ref_X"},
    {"action": "wait", "duration": 2},
    {"action": "screenshot"}
  ],
  "verify": "After starting, can see elements split into left (smaller) and right (larger) zones"
}
```

### Test: step_explanation
```json
{
  "id": "step_explanation",
  "name": "Current step has explanation text",
  "learning_outcome": "Learner understands what's happening at each step",
  "steps": [
    {"action": "screenshot"}
  ],
  "verify": "Screen shows explanatory text describing current step (e.g., 'Comparing X with pivot')"
}
```

## Tips for Success

**For PASS**: Element visible, test condition clearly met, no ambiguity
**For PARTIAL**: Mostly works but with minor issues (viewport, formatting)
**For FAIL**: Test condition not met, feature missing, or wrong behavior

**For blockers**: Only mark if it **prevents learning**. Polish issues don't block.

## Download & Organize Screenshots (REQUIRED)

After testing all agents in a generation, organize screenshots for next generation builders:

```bash
# For each agent, download screenshots
mcp__claude-in-chrome__find(
  query="Download Screenshots button",
  tabId=tabId
)

mcp__claude-in-chrome__computer(
  action="left_click",
  ref=found_ref,
  tabId=tabId
)

# Screenshots download to: ~/Downloads/capture_1.png, capture_2.png, etc.
# ORGANIZE them in /problems/<name>/screenshots/ with agent labels

# For agent_1:
mv ~/Downloads/capture_1.png /problems/<name>/screenshots/agent_1_initial.png
mv ~/Downloads/capture_2.png /problems/<name>/screenshots/agent_1_step_1.png
mv ~/Downloads/capture_3.png /problems/<name>/screenshots/agent_1_step_2.png

# For agent_2:
mv ~/Downloads/capture_1.png /problems/<name>/screenshots/agent_2_initial.png
... (repeat for each agent)
```

**Required for evolution:** Gen 2 builders study these screenshots alongside LESSONS_LEARNED.md to understand which vibes worked visually.

## Cleanup

```bash
# Kill HTTP server
pkill -f "python3 -m http.server 9999"

# Or if you want to keep testing multiple generations:
# Leave server running, just reload the page for next agent
```

## Expected Results

- Most demos: 10-14 PASS, 1-3 PARTIAL, 0-1 FAIL
- High quality: 14+ PASS, minimal PARTIAL, 0 FAIL
- Needs work: 8-10 PASS, multiple PARTIAL, 1+ FAIL
- Blocker: 5-10 PASS, multiple FAIL, critical blocker noted
