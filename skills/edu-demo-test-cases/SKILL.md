---
name: edu-demo-test-cases
description: |
  Develop educational test cases for demos. Creates test_cases.json with specific
  scenarios that verify LEARNING outcomes, not just UI interactions. Test cases
  define what a learner should experience and verify. Uses Chrome tools to prototype
  interactions.
---

# Educational Demo Test Case Developer

Develop test cases that verify LEARNING, not just clicking buttons.

## Core Philosophy

A test case should answer: "Did the demo teach this concept correctly?"

NOT: "Did this button work?"

## Workflow

### Step 1: Understand the Concept

```
Read(problems/<name>/problem.md)
```

Identify:
- What concept is being taught?
- What are the KEY OPERATIONS a learner must understand?
- What misconceptions should be avoided?

### Step 2: Define Learning Outcomes

For each operation, define what a learner should UNDERSTAND:

```
OPERATION: Insert into heap
LEARNER SHOULD SEE:
  - New element appears at bottom
  - Element "bubbles up" through comparisons
  - Element stops when heap property satisfied
LEARNER SHOULD UNDERSTAND:
  - Why we compare with parent
  - When to stop bubbling
  - Time complexity (visually: height of tree)
```

### Step 3: Design Test Scenarios

Each scenario tests a specific learning outcome:

```json
{
  "scenario": "insert_small_value",
  "purpose": "Verify bubble-up is shown correctly",
  "setup": "Start with heap [10, 20, 30]",
  "action": {
    "type": "insert",
    "value": 1
  },
  "verify": {
    "visual": "Value 1 moves from bottom to root",
    "state": "Final heap: [1, 10, 30, 20]",
    "learning": "User sees WHY 1 bubbles all the way up"
  }
}
```

### Step 4: Prototype with Chrome Tools

Use Chrome tools to verify interactions work:

```
# Get tab context
mcp__claude-in-chrome__tabs_context_mcp(createIfEmpty=true)

# Navigate to demo
mcp__claude-in-chrome__navigate(url="file:///path/to/demo.html", tabId=X)

# Read page structure
mcp__claude-in-chrome__read_page(tabId=X, filter="interactive")

# Find elements
mcp__claude-in-chrome__find(query="insert button", tabId=X)

# Take screenshot of initial state
mcp__claude-in-chrome__computer(action="screenshot", tabId=X)

# Interact
mcp__claude-in-chrome__form_input(ref="ref_X", value="1", tabId=X)
mcp__claude-in-chrome__computer(action="left_click", ref="ref_Y", tabId=X)

# Screenshot after action
mcp__claude-in-chrome__computer(action="screenshot", tabId=X)
```

## Test Case Categories

### 1. Happy Path (Basic Operations)
- Normal insert
- Normal extract/delete
- Standard traversal

### 2. Edge Cases
- Empty structure
- Single element
- Full/overflow conditions

### 3. Learning Moments
- When does the algorithm make an "interesting" decision?
- What if we insert a value that doesn't need to move?
- What if we extract when there's only one element?

### 4. Misconception Prevention
- Common wrong assumptions
- Cases where intuition fails

## Output Format

Write to: `problems/<name>/test_cases.json`

```json
{
  "problem": "heap-demo",
  "concept": "Min-Heap Operations",
  "test_cases": [
    {
      "id": "insert_bubble_up",
      "category": "happy_path",
      "name": "Insert causes bubble-up",
      "purpose": "Verify learner sees bubble-up animation",
      "preconditions": {
        "initial_state": "heap with [10, 20, 30, 40]"
      },
      "steps": [
        {"action": "find", "query": "value input field"},
        {"action": "input", "value": "5"},
        {"action": "find", "query": "insert button"},
        {"action": "click"},
        {"action": "wait", "ms": 2000},
        {"action": "screenshot", "name": "after_insert"}
      ],
      "verify": {
        "visual": "5 should bubble up past 20 and 10",
        "expected_state": "heap is [5, 10, 30, 40, 20]",
        "learning_check": "Animation shows comparison at each level"
      }
    },
    {
      "id": "extract_root",
      "category": "happy_path",
      "name": "Extract root shows bubble-down",
      "purpose": "Verify learner sees bubble-down process",
      "steps": [
        {"action": "find", "query": "extract button"},
        {"action": "click"},
        {"action": "wait", "ms": 2000},
        {"action": "screenshot", "name": "after_extract"}
      ],
      "verify": {
        "visual": "Last element moves to root, then bubbles down",
        "learning_check": "Shows comparison with BOTH children"
      }
    }
  ]
}
```

## Integration with Evaluator

The evaluator will:
1. Read `test_cases.json`
2. Execute each test case using Chrome tools
3. Verify visual/state expectations
4. Score based on learning outcomes achieved

## Built-in Screenshot Capture

The base.html demo includes automatic screenshot capture. When prototyping test cases:

**You don't need to manage screenshots manually.** The demo provides:
- `window.screenshotManager.captureState(label)` - programmatic capture
- "📸 Capture State" button - manual capture during interaction
- "⬇️ Download Screenshots" button - download all as PNGs

Use the button for manual captures while prototyping. Builders can integrate `captureState()` calls into their algorithm for automatic captures.

## Prototyping Tips

When using Chrome tools to prototype:

1. **Read the page first** - understand what elements exist
2. **Use find** - locate elements by purpose, not implementation
3. **Screenshot liberally** - capture before/after states
4. **Check viewport** - ensure all elements visible without scroll
5. **Test edge cases** - try breaking the UI

## Example Chrome Session

```
# Initial setup
tabs_context_mcp(createIfEmpty=true) -> tabId: 123

# Navigate
navigate(url="file:///Users/.../agent_1.html", tabId=123)

# Read structure
read_page(tabId=123, filter="interactive")
-> Shows: [ref_1: input, ref_2: button "Insert", ref_3: button "Extract"]

# Prototype insert test
form_input(ref="ref_1", value="5", tabId=123)
computer(action="screenshot", tabId=123) -> "before_insert.png"
computer(action="left_click", ref="ref_2", tabId=123)
computer(action="wait", duration=2, tabId=123)
computer(action="screenshot", tabId=123) -> "after_insert.png"

# Read screenshots to verify
Read(before_insert.png)
Read(after_insert.png)
# Does it show the bubble-up correctly?
```
