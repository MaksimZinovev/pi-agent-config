#!/bin/bash

# Session-Start Hook for CLI Tool Discovery
# Automatically initializes tool registry when Claude Code session starts

set -euo pipefail

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$TOOL_DIR")")"

# Log file for session-start hook
LOG_FILE="$TOOL_DIR/.session-start.log"

# Function to log messages
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Function to display status messages
display_status() {
    local message="$1"
    echo -e "${CYAN}🔧 CLI Tool Discovery: $message${NC}"
}

# Function to check if tools are working
verify_tools() {
    local tools_working=0
    local total_tools=3

    if [ -x "$TOOL_DIR/discover-tools" ]; then
        ((tools_working++))
    fi

    if [ -x "$TOOL_DIR/list-available-tools" ]; then
        ((tools_working++))
    fi

    if [ -x "$TOOL_DIR/tool-info" ]; then
        ((tools_working++))
    fi

    return $((total_tools - tools_working))
}

# Function to build tool registry in background
build_tool_registry() {
    local registry_file="$TOOL_DIR/.tool-registry.json"

    log_message "INFO" "Building tool registry in background"

    # Build registry using discover-tools
    if [ -x "$TOOL_DIR/discover-tools" ]; then
        timeout 30s "$TOOL_DIR/discover-tools" --build-registry > "$registry_file" 2>&1 || {
            log_message "WARN" "Tool registry build timed out or failed"
            # Create minimal registry as fallback
            cat > "$registry_file" << 'EOF'
{
  "timestamp": "'$(date -Iseconds)'",
  "fallback": true,
  "tools": {
    "system": ["git", "npm", "jq", "curl", "docker"],
    "available": []
  }
}
EOF
        }
    fi

    log_message "INFO" "Tool registry build completed"
}

# Function to initialize MCP bridge (if available)
initialize_mcp_bridge() {
    local mcp_bridge="$TOOL_DIR/mcp-bridge.ts"

    if [ -f "$mcp_bridge" ] && command -v npx >/dev/null 2>&1; then
        log_message "INFO" "Initializing MCP bridge"

        # Run MCP bridge initialization in background
        (
            cd "$TOOL_DIR"
            timeout 60s npx tsx mcp-bridge.ts init >> "$LOG_FILE" 2>&1 || {
                log_message "WARN" "MCP bridge initialization failed"
            }
        ) &

        log_message "INFO" "MCP bridge initialization started"
    else
        log_message "INFO" "MCP bridge not available"
    fi
}

# Function to create project context
create_project_context() {
    local context_file="$TOOL_DIR/.project-context.json"

    # Detect project type based on current directory
    local project_type="unknown"
    local available_tools=()

    if [ -f "$PROJECT_ROOT/package.json" ]; then
        project_type="node.js"
        available_tools=("npm" "yarn" "pnpx" "node")
    elif [ -f "$PROJECT_ROOT/go.mod" ]; then
        project_type="go"
        available_tools=("go" "gofmt")
    elif [ -f "$PROJECT_ROOT/Cargo.toml" ]; then
        project_type="rust"
        available_tools=("cargo" "rustc")
    elif [ -f "$PROJECT_ROOT/requirements.txt" ] || [ -f "$PROJECT_ROOT/pyproject.toml" ]; then
        project_type="python"
        available_tools=("python" "pip" "python3")
    elif [ -f "$PROJECT_ROOT/Dockerfile" ]; then
        project_type="docker"
        available_tools=("docker" "docker-compose")
    fi

    # Check which tools are actually available
    local confirmed_tools=()
    for tool in "${available_tools[@]}"; do
        if command -v "$tool" >/dev/null 2>&1; then
            confirmed_tools+=("$tool")
        fi
    done

    # Create context file
    cat > "$context_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "project_type": "$project_type",
  "project_root": "$PROJECT_ROOT",
  "session_id": "${SESSION_ID:-unknown}",
  "recommended_tools": [$(printf '"%s",' "${confirmed_tools[@]}" | sed 's/,$//')]
}
EOF

    log_message "INFO" "Project context created for $project_type project"
}

# Function to update Claude Code settings
update_claude_settings() {
    local settings_file="$PROJECT_ROOT/.claude/settings.local.json"
    local hook_config="$TOOL_DIR/.hook-config.json"

    # Create hook configuration
    cat > "$hook_config" << EOF
{
  "hooks": {
    "SessionStart": {
      "command": "$TOOL_DIR/hooks/session-start.sh",
      "description": "Initialize CLI tool discovery registry"
    }
  }
}
EOF

    log_message "INFO" "Hook configuration created"
}

# Main initialization
main() {
    # Initialize log
    log_message "INFO" "Session-start hook triggered (Session: ${SESSION_ID:-unknown})"

    # Verify tools are available
    local broken_tools=0
    verify_tools || broken_tools=$?

    if [ $broken_tools -gt 0 ]; then
        log_message "WARN" "$broken_tools tools are not working properly"
        display_status "Some tools may not be available"
    else
        display_status "All CLI tool discovery scripts verified"
    fi

    # Create project context
    create_project_context

    # Build tool registry in background (non-blocking)
    build_tool_registry &

    # Initialize MCP bridge in background (if available)
    initialize_mcp_bridge &

    # Update Claude Code settings
    update_claude_settings

    # Display success message
    local project_type=$(cat "$TOOL_DIR/.project-context.json" 2>/dev/null | jq -r '.project_type // unknown' 2>/dev/null || echo "unknown")

    display_status "Initialized for $project_type project"
    display_status "Tool registry building in background"

    log_message "INFO" "Session-start hook completed successfully"

    # Cleanup old logs (keep last 10)
    if [ -f "$LOG_FILE" ]; then
        tail -10 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE" 2>/dev/null || true
    fi
}

# Execute main function
main "$@"