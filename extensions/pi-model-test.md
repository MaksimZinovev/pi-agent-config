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