# Complex Workflows and Patterns

Advanced multi-step workflows using ck for real-world scenarios.

## Table of Contents

1. [Debugging Workflows](#debugging-workflows)
2. [Codebase Exploration](#codebase-exploration)
3. [Refactoring Assistance](#refactoring-assistance)
4. [Test Coverage Analysis](#test-coverage-analysis)
5. [Security Auditing](#security-auditing)
6. [Migration Planning](#migration-planning)
7. [Documentation Generation](#documentation-generation)

---

## Debugging Workflows

### Workflow 1: Trace Error Propagation

Find where errors originate and how they're handled.

```bash
# Step 1: Find error throwing sites
ck --jsonl --sem "throw error" --full-section src/ > thrown.jsonl

# Step 2: Find error handling sites
ck --jsonl --sem "catch error" --full-section src/ > caught.jsonl

# Step 3: Find error logging
ck --jsonl --sem "log error" src/ > logged.jsonl

# Step 4: Correlate to find uncaught errors
# (Use script to compare thrown.jsonl vs caught.jsonl)
```

**Insight:** Identify thrown errors that lack corresponding catch blocks.

### Workflow 2: Debug Race Conditions

Find async operations and potential race conditions.

```bash
# Step 1: Find async operations
ck --jsonl --sem "async operation" --full-section src/ > async.jsonl

# Step 2: Find shared state access
ck --jsonl --sem "shared state" src/ > state.jsonl

# Step 3: Find locking mechanisms
ck --jsonl --sem "mutex lock semaphore" src/ > locks.jsonl

# Step 4: Analyze overlap between async and state
```

### Workflow 3: Memory Leak Investigation

Find potential memory leaks.

```bash
# Step 1: Find event listeners
ck --jsonl --sem "event listener addEventListener" src/ > listeners.jsonl

# Step 2: Find cleanup/removal
ck --jsonl --sem "remove listener cleanup" src/ > cleanup.jsonl

# Step 3: Find timers/intervals
ck --jsonl --sem "setInterval setTimeout" src/ > timers.jsonl

# Step 4: Check for missing cleanup
```

---

## Codebase Exploration

### Workflow 4: Understand Authentication Flow

Map authentication and authorization logic.

```bash
# Step 1: Find authentication entry points
ck --jsonl --sem "authentication login" --full-section src/ > auth_entry.jsonl

# Step 2: Find session/token management
ck --jsonl --sem "session token jwt" --full-section src/ > session.jsonl

# Step 3: Find authorization checks
ck --jsonl --sem "authorization permission check" --full-section src/ > authz.jsonl

# Step 4: Find middleware/guards
ck --jsonl --sem "auth middleware guard" --full-section src/ > middleware.jsonl

# Step 5: Visualize flow
# (Use script to build call graph from results)
```

**Result:** Complete map of authentication flow from login to authorization.

### Workflow 5: Map Data Flow

Track how data flows through the system.

```bash
# Step 1: Find data input points
ck --jsonl --sem "data input request body" --full-section src/ > input.jsonl

# Step 2: Find data transformations
ck --jsonl --sem "transform map filter data" --full-section src/ > transform.jsonl

# Step 3: Find data validation
ck --jsonl --sem "validate schema" --full-section src/ > validate.jsonl

# Step 4: Find data persistence
ck --jsonl --sem "save persist database write" --full-section src/ > persist.jsonl

# Step 5: Find data output
ck --jsonl --sem "response return output" --full-section src/ > output.jsonl
```

### Workflow 6: Dependency Analysis

Find module dependencies and coupling.

```bash
# Step 1: Find import statements
ck --jsonl --regex "import.*from|require\(" src/ > imports.jsonl

# Step 2: Find internal dependencies
ck --jsonl --sem "internal module dependency" src/ > internal.jsonl

# Step 3: Find external dependencies
ck --jsonl --sem "external library npm package" src/ > external.jsonl

# Step 4: Build dependency graph
```

---

## Refactoring Assistance

### Workflow 7: Find Duplicated Code

Identify code that could be extracted.

```bash
# Step 1: Find similar patterns
ck --jsonl --sem "function call database" --full-section src/ > db_calls.jsonl

# Step 2: Find similar error handling
ck --jsonl --sem "try catch error" --full-section src/ > error_handling.jsonl

# Step 3: Find similar validation
ck --jsonl --sem "validate check input" --full-section src/ > validation.jsonl

# Step 4: Manual review for duplication patterns
```

### Workflow 8: Identify Dead Code

Find unused functions and variables.

```bash
# Step 1: Find all function definitions
ck --jsonl --regex "(function|const|class)\s+\w+" src/ > definitions.jsonl

# Step 2: Find all function calls
ck --jsonl --regex "\w+\(" src/ > calls.jsonl

# Step 3: Compare to find uncalled functions
# (Use script to diff definitions vs calls)
```

### Workflow 9: Find Technical Debt

Identify patterns suggesting code quality issues.

```bash
# Step 1: Find TODO/FIXME comments
ck --jsonl --regex "TODO|FIXME|HACK|XXX" src/ > todos.jsonl

# Step 2: Find complex functions (long, nested)
ck --jsonl --sem "complex nested function" src/ > complex.jsonl

# Step 3: Find code smells
ck --jsonl --sem "code smell anti-pattern" src/ > smells.jsonl

# Step 4: Prioritize by impact
```

---

## Test Coverage Analysis

### Workflow 10: Find Untested Code

Identify code lacking test coverage.

```bash
# Step 1: Find all business logic
ck --jsonl --sem "business logic function" src/ > logic.jsonl

# Step 2: Find all tests
ck --jsonl --sem "test" tests/ > all_tests.jsonl

# Step 3: Find test references to src files
ck --jsonl --regex "from.*src/|require.*src/" tests/ > test_refs.jsonl

# Step 4: Identify untested modules
# (Compare logic.jsonl vs test_refs.jsonl)
```

### Workflow 11: Test Organization Review

Analyze test structure and coverage.

```bash
# Step 1: Find test files by feature
ck --jsonl --sem "authentication test" tests/ > auth_tests.jsonl
ck --jsonl --sem "database test" tests/ > db_tests.jsonl
ck --jsonl --sem "api test" tests/ > api_tests.jsonl

# Step 2: Find test utilities and helpers
ck --jsonl --sem "test helper fixture mock" tests/ > helpers.jsonl

# Step 3: Find setup/teardown
ck --jsonl --sem "beforeEach afterAll setup teardown" tests/ > lifecycle.jsonl

# Step 4: Analyze coverage balance
```

### Workflow 12: Find Missing Edge Case Tests

Identify potential edge cases not tested.

```bash
# Step 1: Find error handling in code
ck --jsonl --sem "error handling exception" src/ > errors.jsonl

# Step 2: Find error tests
ck --jsonl --sem "error test exception test" tests/ > error_tests.jsonl

# Step 3: Find boundary checks in code
ck --jsonl --sem "boundary limit check validation" src/ > boundaries.jsonl

# Step 4: Find boundary tests
ck --jsonl --sem "boundary test edge case" tests/ > boundary_tests.jsonl

# Step 5: Identify gaps
```

---

## Security Auditing

### Workflow 13: Find Security Vulnerabilities

Identify potential security issues.

```bash
# Step 1: Find SQL injection risks
ck --jsonl --sem "sql query concatenate" --full-section src/ > sql_risks.jsonl

# Step 2: Find XSS risks
ck --jsonl --sem "innerHTML dangerouslySetInnerHTML" --full-section src/ > xss_risks.jsonl

# Step 3: Find hardcoded secrets
ck --jsonl --regex "(password|secret|key)\s*=\s*['\"][^'\"]+['\"]" src/ > secrets.jsonl

# Step 4: Find unsafe deserialization
ck --jsonl --sem "deserialize parse eval" --full-section src/ > deserialize.jsonl

# Step 5: Find authentication bypasses
ck --jsonl --sem "auth bypass authentication check" --full-section src/ > auth_bypass.jsonl
```

### Workflow 14: Find Input Validation Issues

Check for insufficient input validation.

```bash
# Step 1: Find user input points
ck --jsonl --sem "user input request body" --full-section src/ > input.jsonl

# Step 2: Find validation logic
ck --jsonl --sem "validate sanitize check" --full-section src/ > validation.jsonl

# Step 3: Find direct use of input
ck --jsonl --sem "direct use input" --full-section src/ > direct_use.jsonl

# Step 4: Identify missing validation
```

### Workflow 15: Find Dependency Vulnerabilities

Check for vulnerable dependencies.

```bash
# Step 1: Find external dependencies
ck --jsonl --sem "npm package library import" src/ > deps.jsonl

# Step 2: Extract package names
# (Parse deps.jsonl for package names)

# Step 3: Check against vulnerability database
npm audit

# Step 4: Cross-reference
```

---

## Migration Planning

### Workflow 16: Plan Framework Migration

Assess complexity of framework migration.

```bash
# Step 1: Find framework-specific code
ck --jsonl --sem "react component hook" src/ > react_code.jsonl

# Step 2: Find state management
ck --jsonl --sem "state management redux context" --full-section src/ > state.jsonl

# Step 3: Find routing
ck --jsonl --sem "routing navigate router" --full-section src/ > routing.jsonl

# Step 4: Find lifecycle methods
ck --jsonl --sem "componentDidMount useEffect" --full-section src/ > lifecycle.jsonl

# Step 5: Estimate migration effort
```

### Workflow 17: Plan API Migration

Assess API usage for version migration.

```bash
# Step 1: Find API calls
ck --jsonl --sem "api call http request fetch" --full-section src/ > api_calls.jsonl

# Step 2: Find response handling
ck --jsonl --sem "response parse data" --full-section src/ > response.jsonl

# Step 3: Find error handling for API
ck --jsonl --sem "api error handling network error" --full-section src/ > api_errors.jsonl

# Step 4: Identify deprecated endpoints
```

### Workflow 18: Plan Database Migration

Assess database queries for migration.

```bash
# Step 1: Find database queries
ck --jsonl --sem "database query sql select" --full-section src/ > queries.jsonl

# Step 2: Find schema references
ck --jsonl --sem "table column schema" src/ > schema_refs.jsonl

# Step 3: Find migrations
ck --jsonl --sem "migration alter table" src/ > migrations.jsonl

# Step 4: Assess breaking changes
```

---

## Documentation Generation

### Workflow 19: Generate API Documentation

Auto-generate documentation from code.

```bash
# Step 1: Find all API endpoints
ck --jsonl --sem "api endpoint route handler" --full-section src/ > endpoints.jsonl

# Step 2: Find request validation
ck --jsonl --sem "request validation schema body" --full-section src/ > validation.jsonl

# Step 3: Find response documentation
ck --jsonl --regex "@returns|@response" src/ > docs.jsonl

# Step 4: Generate OpenAPI spec
# (Parse JSONL files to build spec)
```

### Workflow 20: Generate Architecture Diagram

Visualize system architecture from code.

```bash
# Step 1: Find modules/components
ck --jsonl --sem "module component class" src/ > modules.jsonl

# Step 2: Find dependencies between modules
ck --jsonl --sem "import dependency" src/ > dependencies.jsonl

# Step 3: Find communication patterns
ck --jsonl --sem "message event call invoke" src/ > communication.jsonl

# Step 4: Generate diagram
# (Use tool like Mermaid from JSONL data)
```

### Workflow 21: Generate Onboarding Guide

Create guide from code patterns.

```bash
# Step 1: Find common patterns
ck --jsonl --sem "common pattern idiom" --full-section src/ > patterns.jsonl

# Step 2: Find entry points
ck --jsonl --sem "main entry start index" --full-section src/ > entry.jsonl

# Step 3: Find configuration
ck --jsonl --sem "config settings environment" --full-section src/ > config.jsonl

# Step 4: Find examples
ck --jsonl --sem "example usage" --full-section src/ > examples.jsonl

# Step 5: Compile onboarding guide
```

---

## Multi-Script Workflows

### Example: Codebase Health Report

Generate comprehensive health report.

```bash
#!/bin/bash
# health-check.sh

REPORT_DIR="health-report"
mkdir -p "$REPORT_DIR"

echo "Running codebase health check..."

# Test coverage
echo "Checking test coverage..."
ck --jsonl --sem "business logic" src/ > "$REPORT_DIR/logic.jsonl"
ck --jsonl --sem "test" tests/ > "$REPORT_DIR/tests.jsonl"

# Code quality
echo "Checking code quality..."
ck --jsonl --regex "TODO|FIXME" src/ > "$REPORT_DIR/todos.jsonl"
ck --jsonl --sem "complex function" src/ > "$REPORT_DIR/complex.jsonl"

# Security
echo "Checking security..."
ck --jsonl --sem "sql query concatenate" src/ > "$REPORT_DIR/sql-risks.jsonl"
ck --jsonl --regex "password.*=.*['\"]" src/ > "$REPORT_DIR/secrets.jsonl"

# Documentation
echo "Checking documentation..."
ck --jsonl --regex "@param|@returns|@throws" src/ > "$REPORT_DIR/docs.jsonl"

# Summary
echo "Generating summary..."
echo "Codebase Health Report" > "$REPORT_DIR/summary.md"
echo "=======================" >> "$REPORT_DIR/summary.md"
echo "" >> "$REPORT_DIR/summary.md"
echo "## Test Coverage" >> "$REPORT_DIR/summary.md"
echo "- Logic files: $(wc -l < "$REPORT_DIR/logic.jsonl")" >> "$REPORT_DIR/summary.md"
echo "- Test files: $(wc -l < "$REPORT_DIR/tests.jsonl")" >> "$REPORT_DIR/summary.md"
echo "" >> "$REPORT_DIR/summary.md"
echo "## Code Quality" >> "$REPORT_DIR/summary.md"
echo "- TODOs: $(wc -l < "$REPORT_DIR/todos.jsonl")" >> "$REPORT_DIR/summary.md"
echo "- Complex functions: $(wc -l < "$REPORT_DIR/complex.jsonl")" >> "$REPORT_DIR/summary.md"
echo "" >> "$REPORT_DIR/summary.md"
echo "## Security" >> "$REPORT_DIR/summary.md"
echo "- SQL risks: $(wc -l < "$REPORT_DIR/sql-risks.jsonl")" >> "$REPORT_DIR/summary.md"
echo "- Potential secrets: $(wc -l < "$REPORT_DIR/secrets.jsonl")" >> "$REPORT_DIR/summary.md"

echo "Report saved to $REPORT_DIR/"
```

### Example: Refactoring Assistant

Interactive refactoring tool.

```bash
#!/bin/bash
# refactor-assistant.sh

echo "Refactoring Assistant"
echo "====================="
echo ""
echo "Select refactoring type:"
echo "1) Find duplicated code"
echo "2) Find long functions"
echo "3) Find complex conditionals"
echo "4) Find magic numbers"
echo "5) Find commented code"
read -p "Choice: " choice

case $choice in
  1)
    echo "Searching for duplicated patterns..."
    ck --sem "database query" --full-section src/ | jq -r '.snippet' | sort | uniq -c | sort -rn | head -20
    ;;
  2)
    echo "Searching for long functions (>50 lines)..."
    ck --sem "long function" --full-section src/ | jq 'select(.snippet | split("\n") | length > 50)'
    ;;
  3)
    echo "Searching for complex conditionals..."
    ck --sem "complex conditional if else" --full-section src/
    ;;
  4)
    echo "Searching for magic numbers..."
    ck --regex "= [0-9]{3,}" src/
    ;;
  5)
    echo "Searching for commented code..."
    ck --regex "^[\s]*//.*function|^[\s]*//.*class|^[\s]*//.*if" src/
    ;;
esac
```

---

## Integration with Other Tools

### Combined with ripgrep

```bash
# Use rg for fast initial search, then ck for semantic expansion
rg "password" src/ | cut -d: -f1 | sort -u | while read file; do
  echo "Semantic matches for $file:"
  ck --sem "password secret credential" "$file"
done
```

### Combined with git

```bash
# Find changed files and related code
git diff --name-only main | while read file; do
  echo "Conceptually similar to $file:"
  concept=$(ck --jsonl --sem "$(basename "$file" | sed 's/\.[^.]*$//')" src/ | jq -r '.file' | head -5)
  echo "$concept"
done
```

### Combined with find

```bash
# Find test files and their implementation
find tests -name "*.spec.ts" | while read test; do
  feature=$(basename "$test" .spec.ts)
  echo "Test for $feature:"
  ck --jsonl --sem "$feature" src/ | jq -r '.file'
done
```
