#!/bin/bash

# Test script for CLI tool discovery functionality
set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counter
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
test_passed() {
    echo -e "  ${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

test_failed() {
    echo -e "  ${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

run_test() {
    local test_name="$1"
    local command="$2"

    echo -e "\n${BLUE}Testing: $test_name${NC}"
    ((TESTS_TOTAL++))

    if eval "$command" >/dev/null 2>&1; then
        test_passed "$test_name"
    else
        test_failed "$test_name"
    fi
}

echo -e "${YELLOW}=== CLI Tool Discovery Test Suite ===${NC}"

# Test script executability
echo -e "\n${YELLOW}Script Executability Tests:${NC}"
run_test "discover-tools is executable" "test -x ./discover-tools"
run_test "list-available-tools is executable" "test -x ./list-available-tools"
run_test "tool-info is executable" "test -x ./tool-info"

# Test basic functionality
echo -e "\n${YELLOW}Basic Functionality Tests:${NC}"
run_test "discover-tools help works" "./discover-tools --help"
run_test "list-available-tools help works" "./list-available-tools --help"
run_test "tool-info help works" "./tool-info --help"

# Test discover-tools functionality
echo -e "\n${YELLOW}Discover-Tools Tests:${NC}"
run_test "discover-tools error pattern matching" "./discover-tools --error 'permission denied'"
run_test "discover-tools task pattern matching" "./discover-tools --task 'debug'"
run_test "discover-tools general search" "./discover-tools 'network'"
run_test "discover-tools list all tools" "./discover-tools --list"

# Test list-available-tools functionality
echo -e "\n${YELLOW}List-Available-Tools Tests:${NC}"
run_test "list-available-tools default format" "./list-available-tools"
run_test "list-available-tools category filter" "./list-available-tools --category dev"
run_test "list-available-tools list format" "./list-available-tools --format list"
run_test "list-available-tools JSON format" "./list-available-tools --format json"

# Test tool-info functionality
echo -e "\n${YELLOW}Tool-Info Tests:${NC}"
run_test "tool-info basic info" "./tool-info jq"
run_test "tool-info with examples" "./tool-info --examples curl"
run_test "tool-info with related tools" "./tool-info --related git"
run_test "tool-info all information" "./tool-info --all docker"
run_test "tool-info search functionality" "./tool-info --search 'json'"
run_test "tool-info list all tools" "./tool-info --list"

# Test actual tool discovery
echo -e "\n${YELLOW}System Tool Discovery Tests:${NC}"
if command -v jq >/dev/null 2>&1; then
    run_test "jq tool discovery" "./tool-info jq"
else
    echo -e "  ${YELLOW}⚠${NC} jq not installed - skipping jq test"
fi

if command -v git >/dev/null 2>&1; then
    run_test "git tool discovery" "./tool-info git"
else
    echo -e "  ${YELLOW}⚠${NC} git not installed - skipping git test"
fi

if command -v curl >/dev/null 2>&1; then
    run_test "curl tool discovery" "./tool-info curl"
else
    echo -e "  ${YELLOW}⚠${NC} curl not installed - skipping curl test"
fi

# Test edge cases
echo -e "\n${YELLOW}Edge Case Tests:${NC}"
run_test "discover-tools no arguments" "./discover-tools"
run_test "tool-info unknown tool" "./tool-info nonexistent-tool-12345"
run_test "list-available-tools invalid category" "./list-available-tools --category nonexistent"

# Test MCP bridge (if TypeScript is available)
echo -e "\n${YELLOW}MCP Bridge Tests:${NC}"
if command -v npx >/dev/null 2>&1 && [ -f "./mcp-bridge.ts" ]; then
    run_test "MCP bridge TypeScript compilation" "npx tsc --noEmit mcp-bridge.ts"
else
    echo -e "  ${YELLOW}⚠${NC} TypeScript or MCP bridge not available - skipping MCP tests"
fi

# Test file structure
echo -e "\n${YELLOW}File Structure Tests:${NC}"
run_test "SKILL.md exists" "test -f ../SKILL.md"
run_test "package.json exists" "test -f ./package.json"
run_test "README.md exists" "test -f ../README.md"

# Test JSON validity
echo -e "\n${YELLOW}Configuration Tests:${NC}"
run_test "package.json is valid JSON" "jq empty ./package.json >/dev/null 2>&1"

# Test script permissions
echo -e "\n${YELLOW}Permission Tests:${NC}"
run_test "Scripts have execute permissions" "test \$(find . -maxdepth 1 -name '*.sh' -executable | wc -l) -gt 0"

# Results
echo -e "\n${YELLOW}=== Test Results ===${NC}"
echo -e "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ $TESTS_FAILED test(s) failed${NC}"
    exit 1
fi