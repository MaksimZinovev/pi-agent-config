// WHY: cx fails when not in a git project dir because it can't find its index.
//   e.g. `cx overview apps/cli/src/auto.ts` from /tmp → "file not in index"
//   But `cx --root /path/to/project overview apps/cli/src/auto.ts` works from anywhere.
// WHAT: Two fixes: (1) warm the cx cache on session start so first call is fast,
//   (2) auto-inject --root so the agent never has to think about paths.
// HOW: On session_start, detect git root and run `cx overview . --quiet` to warm cache.
//   On tool_call for bash, if the command contains `cx` but no `--root`, inject it.
//   Before: `cx definition --name myFunc`        → fails from wrong dir
//   After:  `cx --root /repo definition --name myFunc` → works from anywhere
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

let projectRoot: string | null = null;

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    const gitResult = await pi.exec("git", ["rev-parse", "--show-toplevel"], { timeout: 5000 });
    const root = gitResult.stdout?.trim();
    if (!root || gitResult.code !== 0) return;
    projectRoot = root;
    pi.exec("cx", ["overview", ".", "--quiet"], { cwd: root, timeout: 30000 }).catch(() => {});
    ctx.ui.notify(`cx cache warming: ${root}`, "info");
  });

  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;
    const input = event.input as { command?: string };
    if (!input.command || !projectRoot) return;
    if (!/\bcx\b/.test(input.command)) return;
    if (input.command.includes("--root")) return;
    input.command = input.command.replace(/\bcx\b/, `cx --root ${projectRoot}`);
  });
}