---
name: skill-tree
description: "Multi-pass document processing pipeline. Use when the user wants to analyze, summarize, extract, classify, or search through documents or text. Triggers on: 'use skill-tree', 'process this document', 'extract from', 'summarize this', 'find all X in', 'classify this text', or any request to process long or chunked text through a structured pipeline. Also use when the user provides a file and asks for structured extraction, fact-checking, or multi-step analysis."
---

# Skill-Tree

SPLIT → MAP → REDUCE pipeline for processing documents with dynamic per-chunk
routing and constraint enforcement. Works with any CLI-based LLM (claude, ollama,
openai, pi).

## When to use

- User provides a document and wants structured extraction, summarization, or analysis
- User says "run skill-tree on this" or "process this document"
- Long text needs multi-pass processing where different chunks may need different operations
- User wants to find references, numbers, entities, or classify content

## Workflow

1. **Save the input** — if user pasted text, save to a temp file first
2. **Determine the task** — convert user request into a concise task string
3. **Choose chunk size** — default 500; use 100-300 for precision tasks (extract specific figures), 500-1000 for summarization
4. **Run the pipeline**:

```bash
./tools/run.sh --task "<task description>" --input <input_file> --chunk-size <N>
```

5. **Present results** — read the output and format for the user:
   - Show the final answer clearly
   - List key points as bullet items
   - Report stats (chunks, passes, estimated cost)

6. **Offer follow-up** — if `forced_stops` > 0 or completeness is low, suggest re-running with adjusted parameters

## Choosing the LLM provider

Edit `/Users/maksim/repos/skills-reduce/llm.json` to switch providers:

```json
{ "provider": "claude", "model": "claude-sonnet-4-20250514", "flags": [] }
{ "provider": "pi", "model": "anthropic/claude-sonnet-4", "flags": [] }
{ "provider": "ollama", "model": "llama3.1", "flags": [] }
```

## Tuning constraints

Edit `/Users/maksim/repos/skills-reduce/constraints.json` to adjust budget, max passes, or completeness floor.

## Example

User: "Find all payment terms and liability caps in this contract"
Agent:

```bash
./tools/run.sh --task "find all payment terms and liability caps" --input /tmp/contract.txt --chunk-size 200
```

Then format the JSON output into a clear human-readable response.

## Important

- Always save pasted text to a file first — the pipeline requires `--input` to be a file path
- The pipeline calls the LLM multiple times per chunk (classify → route → leaf skill), so budget accordingly
- If output JSON is incomplete or has parse errors, try re-running with a smaller chunk size
