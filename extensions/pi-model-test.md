# @vtstech/pi-model-test

**Model benchmark extension for the Pi Coding Agent** — test any model for reasoning, tool usage, and instruction following.

## Install

```bash
pi install "npm:@vtstech/pi-model-test"
```

## Usage

```
/model-test                    Test current model (auto-detects provider)
/model-test qwen3:0.6b         Test a specific Ollama model
/model-test --all              Test every Ollama model
```

## What It Tests

**Ollama models (6 tests):**

- Reasoning (snail puzzle)
- Thinking token support
- Tool usage (native + text)
- ReAct parsing
- Instruction following (JSON output)
- Tool support detection (NATIVE / REACT / NONE)

**Cloud providers (4 tests):**

- Connectivity
- Reasoning
- Instruction following
- Tool usage (function calling)

Each test scores: **STRONG / MODERATE / WEAK / FAIL**.

## Key Features

- Auto-detects Ollama vs cloud provider (OpenRouter, Anthropic, Google, etc.)
- Streaming Ollama chat for faster timeout detection
- Configurable via `~/.pi/agent/model-test-config.json`
- Test history + regression tracking at `~/.pi/agent/cache/model-test-history.json`
- Retry with backoff on connection failures
- Thinking model fallback (`think: true`)
- Tab-completion for model names

## Source

- npm: [`@vtstech/pi-model-test`](https://www.npmjs.com/package/@vtstech/pi-model-test)
- Repo: [VTSTech/pi-coding-agent](https://github.com/VTSTech/pi-coding-agent)
- License: MIT

## Example report

```shell
[model-test-report]

   ⚡ Pi Model Benchmark v1.3.3
   Written by VTSTech
   GitHub: https://github.com/VTSTech
   Website: www.vts-tech.org

 ── MODEL: glm-5.1:cloud ────────────────────────────────────
   ℹ️  Provider: ollama (ollama)

 ── REASONING TEST (EXTENDED) ───────────────────────────────
   ℹ️  Testing 20 reasoning puzzles...
   ⚠️  ❌ snail_wall (logic): WEAK - expected "8", got "4" [ (expected: 8, got: 4)]
   ✅ ✅ math_sequence (math): STRONG - expected "162", got "162" [ (expected: 162, got: 162)]
   ⚠️  ❌ spatial_directions (spatial): WEAK - expected "south", got "?" [ (expected: south, got:
 ?)]
   ✅ ✅ commonsense (commonsense): STRONG - expected "the other side", got "the other side" [
 (expected: the other side, got: the other side)]
   ⚠️  ✅ code_simplify (code): MODERATE - expected "15", got "15" [ (expected: 15, got: 15)]
   ✅ ✅ bat_and_ball (counterint): STRONG - expected "5", got "5" [ (expected: 5, got: 5)]
   ⚠️  ✅ scale_weight (counterint): MODERATE - expected "400", got "400" [ (expected: 400, got:
 400)]
   ✅ ✅ syllogism (logic): STRONG - expected "warm-blooded", got "warm-blooded" [ (expected:
 warm-blooded, got: warm-blooded)]
   ✅ ✅ if_then_chain (logic): STRONG - expected "grass grows", got "grass grows" [ (expected:
 grass grows, got: grass grows)]
   ✅ ✅ cause_effect (causal): STRONG - expected "grows", got "grows" [ (expected: grows, got:
 grows)]
   ⚠️  ✅ relative_quantities (comparative): MODERATE - expected "15", got "15" [ (expected: 15,
 got: 15)]
   ❌ ❌ analogy_1 (analogy): FAIL - expected "room", got "?" [ (expected: room, got: ?)]
   ❌ ❌ analogy_2 (analogy): FAIL - expected "boot", got "?" [ (expected: boot, got: ?)]
   ✅ ✅ physics_1 (commonsense): STRONG - expected "bowling ball", got "bowling ball" [
 (expected: bowling ball, got: bowling ball)]
   ❌ ❌ physics_2 (commonsense): FAIL - expected "hot", got "?" [ (expected: hot, got: ?)]
   ⚠️  ✅ objects_1 (commonsense): MODERATE - expected "scissors", got "scissors" [ (expected:
 scissors, got: scissors)]
   ✅ ✅ social_1 (commonsense): STRONG - expected "polite", got "polite" [ (expected: polite,
 got: polite)]
   ❌ ❌ animals_1 (commonsense): FAIL - expected "water", got "?" [ (expected: water, got: ?)]
   ⚠️  ✅ gk_1 (commonsense): MODERATE - expected "mars", got "mars" [ (expected: mars, got:
 mars)]
   ⚠️  ✅ gk_2 (commonsense): MODERATE - expected "366", got "366" [ (expected: 366, got: 366)]
   ✅ Average score: MODERATE

 ── INSTRUCTION FOLLOWING TEST (EXTENDED) ───────────────────
   ℹ️  Testing multi-step JSON schema compliance...
   ℹ️  Time: 6.9s
   ✅ JSON output valid with correct values (STRONG)
   ℹ️  Output:
 {"name":"Gemini","can_count":true,"sum":42,"language":"English","colors":["red","blue","green"],
 "timestamp":"2024-05-20T12:00:00Z"}

 ── TOOL USAGE TEST (EXTENDED) ──────────────────────────────
   ℹ️  Testing chained tool calls...
   ℹ️  Time: 2.2s
   ✅ Tool calls: get_weather, calculate (STRONG)
   ℹ️  Response: I'll fetch the weather in Tokyo and calculate 15×24 for you at the same time!

 ── SUMMARY ─────────────────────────────────────────────────
   ✅ Reasoning: MODERATE
   ✅ Instructions: STRONG
   ✅ Tool Usage: STRONG
   ℹ️  Total time: 3.4m
   ℹ️  Score: 3/3 tests passed

   ℹ️  Detailed: Reasoning 14/20 tests passed, Instructions 1/1, Tool Usage 1/1

 ── RECOMMENDATION ──────────────────────────────────────────
   ❌ glm-5.1:cloud is WEAK — limited capabilities for agent use



```
