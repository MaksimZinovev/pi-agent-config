# Why CX/CK Over grep/find — Lessons Learned

## User asked: "explain why grep/find more efficient?"

Assistant gave 5 reasons why grep/find are more practical than cx/ck. User corrected each one:

### 1. CX does not require indexing
- `cx overview`, `cx symbols` are AST-based — work instantly on any codebase, no index needed
- I incorrectly confused cx with ck's indexing requirement

### 2. CK has flags and flexibility for various matching types, including exact
- `ck` supports exact match too, not just semantic
- When you don't need exact, semantic search finds things grep can't ("how does auth work" without knowing the string `authenticateUser`)
- More capability, not less

### 3. Preflight instructions aren't wasted turns
- The "15 wasted turns" were me resisting instructions, not the tools being slow
- If I had followed intentional user instructions from the start, no turns would be wasted

### 4. CX is stateless; CK index warms up at session start
- CX has no state at all
- CK index is warmed up at session start, can quickly reindex, and falling back to grep/find is trivial if needed
- Not a real problem in practice

### 5. Both cx and ck provide exact match
- They give you exact AND semantic — strictly more capability than grep alone
- The "exact over fuzzy" argument doesn't hold when tools support both modes

## Bottom line
CX/CK are the better default for code exploration. grep/find are still fine for quick one-off pattern matching, but cx/ck should be preferred.
