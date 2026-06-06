# P2: Skill Missing Format Reference and Validation Loop

Problem: Skill never tells the planner to reference format.md or validate output against it — plans are produced without checking compliance.
Direction: Add "read references/format.md before writing" + "run docfence validate and fix errors" to SKILL.md workflow. Alternative: just tell it to follow format (we know models skip secondary file reads).