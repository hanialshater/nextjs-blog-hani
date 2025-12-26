---
name: edu-demo-evaluator-free
description: |
  Watch educational demo like a learner (BLIND evaluation). No test cases. No
  benchmark. No rubric. Honest assessment of: impression, what works, what doesn't,
  learner impact, recommendation. Output: agent_X_free_eval.json
---

# Educational Demo Evaluator - Free Evaluation

Watch the demo like a learner would. Be honest. No scoring rubric. No benchmark bias.

## Core Principles

1. **BLIND to test cases** - Don't read test_cases.json
2. **BLIND to benchmark** - Don't look at benchmark_ux/
3. **Watch like a learner** - First time seeing it, no prior knowledge
4. **Honest assessment** - What's awesome? What's confusing?
5. **Qualitative only** - No numeric scores

## Workflow

### Step 1: Setup Chrome

```
# Get or create tab
mcp__claude-in-chrome__tabs_context_mcp(createIfEmpty=true)

# Create new tab for evaluation
mcp__claude-in-chrome__tabs_create_mcp()
# Returns: tabId (use this for the agent)
```

### Step 2: Start HTTP Server

```bash
# Start HTTP server (from code-evo-agent-simple root directory)
cd /Users/hani/code-evo-agent-simple
python3 -m http.server 9999 &
```

### Step 3: Navigate to Demo

```
# Navigate to demo via HTTP (NOT file://)
mcp__claude-in-chrome__navigate(
  url="http://localhost:9999/problems/<name>/generations/gen{N}/agent_X.html",
  tabId=X
)

# Wait for load
mcp__claude-in-chrome__computer(action="wait", duration=2, tabId=X)
```

### Step 4: Watch and Interact as a Learner

Spend 5-10 minutes with the demo like a real student:
- Read initial content - what's explained?
- Click buttons, interact with controls
- Watch animations play - are they clear?
- Try different scenarios - what do you learn?
- **Capture screenshots at key moments**

**Focus on educational value, not technical polish**

```
# Screenshot initial state (demo will do this automatically)
mcp__claude-in-chrome__computer(action="screenshot", tabId=X)

# Read what's on the page
mcp__claude-in-chrome__read_page(tabId=X)

# Find buttons to interact with
mcp__claude-in-chrome__find(query="play button or start button", tabId=X)

# Click and interact
mcp__claude-in-chrome__computer(action="left_click", ref=found_ref, tabId=X)

# Wait for animation
mcp__claude-in-chrome__computer(action="wait", duration=2, tabId=X)

# CAPTURE at key moments using the built-in system
# In browser console:
mcp__claude-in-chrome__javascript_tool(
  action="javascript_exec",
  text="window.screenshotManager.captureState('key_moment')",
  tabId=X
)
```

**Screenshots are captured in the demo** via the built-in html2canvas system:
- Click "📸 Capture State" button at key moments to capture
- Click "⬇️ Download Screenshots" when done to download all PNGs
- Each screenshot is labeled (initial_state, capture_1, capture_2, etc.)

**ORGANIZE them for next generation builders:**
```bash
# Move from ~/Downloads to /problems/<name>/screenshots/ with agent labels
mv ~/Downloads/capture_1.png /problems/<name>/screenshots/agent_X_initial.png
mv ~/Downloads/capture_2.png /problems/<name>/screenshots/agent_X_moment_1.png
```

The demo maintains a capture history during your evaluation session.

### Step 5: Record Honest Assessment

As you watch, ask yourself:

**First Impression**
- What do you see immediately?
- Is it inviting or intimidating?
- Does it look complete or broken?

**Does It Make Sense?**
- Can you understand what's happening?
- Is the core concept clear from the visualization?
- Are there confusing or misleading parts?

**Is It Engaging?**
- Do you want to keep exploring?
- Are interactions satisfying and rewarding?
- Do animations feel smooth or janky?

**What Works?**
- What design choices are brilliant for learning?
- What explanations are clear and memorable?
- What makes the concept "click"?

**What Doesn't Work?**
- What's confusing to a learner?
- What feels incomplete or wrong?
- What metaphors or explanations could mislead?

**Educational Value**
- Would a student understand the concept after this?
- Could they explain it to someone else?
- What's the key learning takeaway?
- What would a learner REMEMBER in a week?

**Recommendation**
- Should this be used?
- What's the one thing to fix?
- Is it a winner, or needs major work?

## Output Format

```json
{
  "agent": "gen2/agent_1",
  "approach": "Comparison/Dual-View",

  "first_impression": "Clean, minimal UI with two side-by-side algorithms",

  "what_works": [
    "Immediately shows WHY quicksort matters (bubble sort is slow)",
    "Color coding makes comparisons easy to follow",
    "Step-by-step controls let learner control pace",
    "Comparison metrics visible (comparisons, swaps, time)"
  ],

  "what_doesn't_work": [
    "Recursion depth not clearly shown - jumps between levels",
    "Pivot selection explanation could be clearer",
    "Animation speed is a bit fast for beginners"
  ],

  "learner_impact": "A student would understand that quicksort is faster because of intelligent partitioning. Might not fully grasp recursion or pivot selection strategy.",

  "recommendation": "STRONG CANDIDATE - Fix recursion visualization, maybe add narrative explanations for pivot selection. Otherwise excellent foundation.",

  "screenshots_captured": "agent_1_initial.png, agent_1_comparison.png, agent_1_recursion.png (moved to /problems/<name>/screenshots/)"
}
```

## Key Phrases to Avoid

❌ "Correctness score: 85"
❌ "Compared to benchmark..."
❌ "Test case coverage: 14/15"
❌ "Points deducted for..."

✅ "Immediately shows WHY"
✅ "A learner would understand..."
✅ "The animation feels smooth"
✅ "Confusing part: recursion depth"

## Important Notes

- **Don't read test cases** - You don't know what you're supposed to verify
- **Don't think about benchmark** - You don't know what "good" looks like
- **Don't use rubric** - No scoring categories, no point calculations
- **Be honest** - If it's confusing, say it's confusing
- **Watch 5-10 minutes per agent** - Enough time to form honest impression

## Example Evaluation

```
Visit http://localhost:9999/problems/quicksort-demo/generations/gen2/agent_1.html

First impression:
- Clean white background with two columns side by side
- Left: Quicksort animation, Right: Bubble sort animation
- Professional looking, not too colorful

Interact:
- Click "Start" button
- Both arrays start animating
- Quicksort finishes first
- Bubble sort continues much longer
- Counter shows comparisons: QS=45, BS=120

Impression: "OH! This is why quicksort is better! The visualization immediately makes it clear."

Assessment:
- WORKS: Side-by-side comparison is brilliant
- WORKS: Metrics visible (comparison count)
- WORKS: Speed difference obvious
- DOESN'T WORK: Recursion not explained (which levels are being called?)
- DOESN'T WORK: Pivot selection seems arbitrary
- RECOMMENDATION: This is a strong foundation. Add narrative about pivot strategy, show recursion depth. Could be winner.
```

## Cleanup

```bash
# Kill HTTP server
pkill -f "python3 -m http.server 9999"
```