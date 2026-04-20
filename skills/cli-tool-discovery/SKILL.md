---
name: cli-tool-discovery
description: Discovers and uses relevant CLI tools for any task or error. Use when encountering errors (permission denied, network issues, JSON parsing), needing API testing, process monitoring, or unsure which tool to use.
---

# CLI Tool Discovery

**Overview**: Systematically discover and use the right CLI tools for any task by combining intelligent pattern matching, error analysis, and hybrid MCP/system tool discovery.

## When to Use

### Use this skill when you encounter:

**Error Scenarios:**
- Permission denied errors → `sudo`, `chmod`, `lsof`
- Network connectivity issues → `ping`, `curl`, `netstat`, `traceroute`
- JSON parsing errors → `jq`, `python -m json.tool`
- Git operation failures → `git`, `gh`, `git-lfs`
- Module not found errors → `npm`, `yarn`, `pip`, `pnpx`
- Port conflicts → `lsof`, `netstat`, `fuser`
- Authentication failures → `ssh`, `gh`, `aws configure`

**Task Scenarios:**
- API testing → `curl`, `httpie`, `postman-cli`
- Documentation lookup → `man`, `tldr`, `context7-cli`
- File management → `find`, `grep`, `sed`, `awk`
- Process monitoring → `ps`, `top`, `htop`, `lsof`
- Container operations → `docker`, `podman`, `kubectl`
- Infrastructure management → `terraform`, `ansible`

**Discovery Needs:**
- New project setup → Discover project-specific tools
- Debugging unknown issues → Find diagnostic tools
- System administration → Locate system management tools
- Development workflow → Optimize toolchain

## Implementation

### Core Discovery Engine

The skill uses a hybrid discovery approach combining system tool scanning with MCPorter's MCP server discovery:

```bash
# Basic tool discovery by error/task pattern
./tool/discover-tools --error "permission denied"
./tool/discover-tools --task "debug network issues"

# List all available tools by category
./tool/list-available-tools --category network

# Get detailed information about specific tools
./tool/tool-info jq
```

### Tool Registry System

The registry combines system tools with MCP-discovered tools:

**System Tools:** Traditional CLI tools in PATH
- Development: `git`, `npm`, `node`, `python`
- Data Processing: `jq`, `awk`, `sed`, `grep`
- Network: `curl`, `ping`, `netstat`, `ssh`
- System: `ps`, `lsof`, `find`, `tar`

**MCP Tools:** Servers discovered via MCPorter
- Cursor/Claude/Codex configuration auto-discovery
- Typed interfaces and authentication handling
- Zero-configuration MCP server access

### Intelligent Matching Patterns

**Error-to-Tool Mapping:**
```bash
# Error message pattern matching
error="permission denied" → tools=["sudo", "chmod", "lsof"]
error="network unreachable" → tools=["ping", "traceroute", "netstat"]
error="json parse error" → tools=["jq", "python -m json.tool"]
```

**Task-to-Tool Mapping:**
```bash
# Task-based tool discovery
task="debug network" → tools=["ping", "netstat", "traceroute", "nc"]
task="process monitoring" → tools=["ps", "top", "htop", "lsof"]
task="api testing" → tools=["curl", "httpie", "postman-cli"]
```

## Quick Reference

### Essential Commands

```bash
# Discover tools for specific scenarios
./tool/discover-tools --error "<error_message>"
./tool/discover-tools --task "<task_description>"
./tool/discover-tools "<general_search>"

# List available tools
./tool/list-available-tools                    # All tools
./tool/list-available-tools --category network # By category
./tool/list-available-tools --format json     # JSON output

# Get tool details
./tool/tool-info <tool_name>
```

### Common Discovery Patterns

| Scenario | Command | Result |
|----------|---------|--------|
| Permission error | `./tool/discover-tools --error "permission denied"` | sudo, chmod, lsof |
| Network issues | `./tool/discover-tools --task "debug network"` | ping, traceroute, netstat |
| JSON problems | `./tool/discover-tools --error "json parse"` | jq, python json.tool |
| API testing | `./tool/discover-tools --task "test api"` | curl, httpie |
| Process issues | `./tool/discover-tools --task "monitor processes"` | ps, top, htop |

### Tool Categories

| Category | Common Tools | Use Cases |
|----------|--------------|-----------|
| **Development** | git, npm, node, python | Code management, packages |
| **Data Processing** | jq, awk, sed, grep | Text/JSON manipulation |
| **Network** | curl, ping, netstat, ssh | Connectivity, testing |
| **System** | ps, lsof, find, tar | Process/file management |
| **Container** | docker, podman, kubectl | Container orchestration |
| **Cloud** | aws, gcloud, az | Cloud services |
| **Documentation** | man, tldr, context7-cli | Help and docs |

## Common Mistakes

### 1. **Not Using Specific Error Messages**
**❌ Wrong:** `./tool/discover-tools "error"`
**✅ Right:** `./tool/discover-tools --error "permission denied"`

### 2. **Forgetting Tool Availability**
**❌ Wrong:** Assume all tools are available
**✅ Right:** Use `./tool/list-available-tools` to check what's installed

### 3. **Ignoring Context Clues**
**❌ Wrong:** Generic tool searches
**✅ Right:** Include error messages, file types, project context

### 4. **Not Verifying Tool Installation**
**❌ Wrong:** Run tool without checking if it exists
**✅ Right:** Use `./tool/tool-info <tool>` to verify availability

### 5. **Overlooking MCP Tools**
**❌ Wrong:** Only consider system CLI tools
**✅ Right:** Leverage MCPorter for MCP server discovery

## Integration with Claude Code

### Session-Start Hook
The skill automatically initializes at session start via `tool/hooks/session-start.sh`:
- Scans available CLI tools
- Discovers MCP servers via MCPorter
- Builds unified tool registry
- Caches tool metadata for fast access

### Progressive Loading
- **Session Start**: Tool names and brief descriptions loaded
- **On-Demand**: Detailed tool information loaded when needed
- **Caching**: Frequently accessed tools cached for performance

### Token Efficiency
The skill uses progressive disclosure to minimize token usage:
1. Load tool names and categories first
2. Load detailed descriptions only when relevant
3. Cache tool information across session
4. Use context-aware filtering

## Advanced Usage

### MCP Integration
```bash
# Discover MCP tools via MCPorter
./tool/discover-tools --mcp-only

# List MCP servers from editor configs
./tool/discover-tools --list-mcp-servers

# Generate typed interfaces for MCP tools
./tool/discover-tools --generate-types
```

### Custom Tool Categories
```bash
# Create custom tool category
./tool/discover-tools --add-category "security" --tools "nmap, nikto, sslscan"

# Search by custom category
./tool/discover-tools --category security
```

### Tool Composition
```bash
# Find tools that work together
./tool/discover-tools --workflow "deploy docker app"
# Returns: docker, docker-compose, kubectl, gh

# Tool dependency analysis
./tool/discover-tools --dependencies jq
# Returns: python (for json.tool), npm (for node packages)
```

## Troubleshooting

### Tool Not Found
```bash
# Check if tool is available
./tool/tool-info <tool_name>

# Find alternatives
./tool/discover-tools --task "<task>" --show-alternatives
```

### MCPorter Issues
```bash
# Check MCP server status
./tool/discover-tools --mcp-status

# Re-scan MCP configurations
./tool/discover-tools --refresh-mcp
```

### Hook Problems
```bash
# Reinstall hooks
./tool/install-hook --force

# Check hook configuration
./tool/discover-tools --check-hooks
```

## Examples

### Example 1: Debugging Network Issues
```bash
# User reports "connection refused" error
./tool/discover-tools --error "connection refused"
# Returns: netstat, lsof, nc, ping, traceroute

# Get detailed info about recommended tools
./tool/tool-info netstat
./tool/tool-info lsof
```

### Example 2: API Testing Workflow
```bash
# Need to test REST API
./tool/discover-tools --task "test rest api"
# Returns: curl, httpie, postman-cli

# Check tool capabilities
./tool/tool-info curl
```

### Example 3: Project Setup
```bash
# New Node.js project
./tool/discover-tools --context "node.js project"
# Returns: npm, yarn, pnpm, npx, node

# Include MCP tools if available
./tool/discover-tools --context "node.js" --include-mcp
```

## Testing

### Basic Functionality
```bash
# Test discovery engine
./tool/discover-tools --test

# Test hook integration
./tool/discover-tools --test-hooks

# Test MCPorter integration
./tool/discover-tools --test-mcp
```

### Integration Testing
```bash
# Test with real scenarios
./tool/discover-tools --test-scenario "permission error"
./tool/discover-tools --test-scenario "network debugging"
./tool/discover-tools --test-scenario "json parsing"
```

This skill provides a comprehensive foundation for intelligent CLI tool discovery, combining pattern matching, error analysis, and hybrid MCP/system tool discovery to help Claude (and users) find the right tool for any task efficiently.
