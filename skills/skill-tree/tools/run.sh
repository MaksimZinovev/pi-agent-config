#!/bin/bash
# Wrapper for skill-tree pipeline.
# Usage: run.sh --task "task description" --input file.txt [--chunk-size N] [--output out.json]
set -euo pipefail

PIPELINE_DIR="/Users/maksim/repos/skills-reduce"
cd "$PIPELINE_DIR"
exec python3.10 run.py "$@"
