import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const REMINDER = `\n\n⚠️ [CX-FIRST REMINDER] You used grep/find instead of the escalation hierarchy from AGENTS.md (read it for more details). Prefer: directory overview → file overview → symbols → definition/references → read. Use cx, ck, ast_grep_search, or lsp_navigation before falling back to grep/find.`;

function appendReminder(result: any) {
  if (!result?.content) return result;
  if (typeof result.content === "string") {
    result.content += REMINDER;
  } else if (Array.isArray(result.content)) {
    const last = result.content[result.content.length - 1];
    if (last?.type === "text" && typeof last.text === "string") {
      last.text += REMINDER;
    } else {
      result.content.push({ type: "text", text: REMINDER });
    }
  }
  return result;
}

// Matches common grep/find patterns in bash commands, but skips cx/ck calls
const BASH_GREP_FIND_RE = /(^|\s|\||\;|\&\&)(grep|rg|ack|ag|find|fd)\s/;
const BASH_CX_CK_RE     = /\b(cx|ck)\s/;

export default function (pi: ExtensionAPI) {
  // Catch direct grep/find tool calls
  pi.on("tool_result", (event) => {
    if (event.toolName === "grep" || event.toolName === "find") {
      return appendReminder(event.result || event);
    }

    // Catch bash commands that use grep/find (but not cx/ck)
    if (event.toolName === "bash") {
      const input = (event as any).input;
      const cmd = input?.command ?? "";
      if (BASH_GREP_FIND_RE.test(cmd) && !BASH_CX_CK_RE.test(cmd)) {
        return appendReminder(event.result || event);
      }
    }
  });
}