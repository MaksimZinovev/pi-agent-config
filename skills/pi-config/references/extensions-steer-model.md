
Deep wiki link: https://deepwiki.com/search/when-i-want-to-create-custom-e_0af3757f-a55e-4c03-993d-f602b6bf5226?mode=codemap

The most effective way to ensure the model does not ignore the message is to use the `steer` delivery mode, which injects the message immediately after the current turn's tool execution, or use `before_agent_start` to modify the system prompt for the entire turn. 

For example, to create a custom extension that blocks the `grep` command and sends a message to the model without it being ignored, you should use the `tool_call` event and the `pi.sendMessage` method with specific delivery options. 

---

## Blocking the Grep Command

You can intercept the `grep` tool call using the `tool_call` event.  Returning an object with `block: true` prevents the execution and allows you to provide a reason that is sent back to the model as the tool result. 
```typescript
pi.on("tool_call", async (event, ctx) => {
  if (event.toolName === "grep") {
    return {
      block: true,
      reason:
        "The grep tool is temporarily disabled. Please use 'read' or 'find' instead.",
    };
  }
});
```

## Methods to Send Unignorable Messages

When you block a tool, you often want to "steer" the model toward a different behavior. Pi provides several ways to inject messages that the model is forced to process:

### 1. Steering Messages (`deliverAs: "steer"`)

This is the most direct way to influence the model while it is in the middle of a task. [6](#0-5) A "steer" message is delivered after the current tool execution finishes but _before_ the next LLM reasoning step. 

- Usage: `pi.sendMessage({ ... }, { deliverAs: "steer", triggerTurn: true })` 
- Effect: It acts as an immediate correction, making it very hard for the model to ignore as it appears as the most recent context before its next "thought".

### 2. System Prompt Injection (`before_agent_start`)

If you want to hide the fact that a message was sent (making it a "system message" in effect), you can modify the `systemPrompt` during the `before_agent_start` event. 

- Mechanism: This event allows you to append instructions to the system prompt for that specific turn.
- Advantage: Instructions in the system prompt carry higher "weight" for most models than standard chat messages.

### 3. Custom Messages with `display: false`

You can use `pi.sendMessage` with `display: false` to send data to the model that the user does not see in the TUI, but the model receives in its context. 

| Delivery Mode | Timing                         | Use Case                                           |
| :------------ | :----------------------------- | :------------------------------------------------- | ----------- |
| `steer`       | Mid-stream, after current tool | Immediate redirection after blocking `grep`.       |
| `followUp`    | After all tools finish         | Summarizing why `grep` was blocked after the turn. |
| `nextTurn`    | Next user interaction          | Persistent reminder for future turns.              |  |

## Notes

- The `tool_call` event is the primary place to block execution. 
- `pi.sendMessage` creates a `CustomMessage` entry in the session.
- For complete blocking of a tool's existence, you can also use `pi.setActiveTools()` to remove `grep` from the available toolset entirely. 

Wiki pages you might want to explore:

- [Glossary (earendil-works/pi)](/wiki/earendil-works/pi#11)

### Citations

File: packages/coding-agent/docs/extensions.md (L69-74)

```markdown
pi.on("tool_call", async (event, ctx) => {
if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
const ok = await ctx.ui.confirm("Dangerous!", "Allow rm -rf?");
if (!ok) return { block: true, reason: "Blocked by user" };
}
});
```

File: packages/coding-agent/docs/extensions.md (L468-468)

```markdown
Fired after user submits prompt, before agent loop. Can inject a message and/or modify the system prompt.
```

File: packages/coding-agent/docs/extensions.md (L493-495)

```markdown
    // Replace the system prompt for this turn (chained across extensions)
    systemPrompt: event.systemPrompt + "\n\nExtra instructions for this turn...",

};
```

File: packages/coding-agent/docs/extensions.md (L1273-1281)

```markdown
pi.sendMessage({
customType: "my-extension",
content: "Message text",
display: true,
details: { ... },
}, {
triggerTurn: true,
deliverAs: "steer",
});
```

File: packages/coding-agent/docs/extensions.md (L1285-1289)

```markdown
- `deliverAs` - Delivery mode:
  - `"steer"` (default) - Queues the message while streaming. Delivered after the current assistant turn finishes executing its tool calls, before the next LLM call.
  - `"followUp"` - Waits for agent to finish. Delivered only when agent has no more tool calls.
  - `"nextTurn"` - Queued for next user prompt. Does not interrupt or trigger anything.
- `triggerTurn: true` - If agent is idle, trigger an LLM response immediately. Only applies to `"steer"` and `"followUp"` modes (ignored for `"nextTurn"`).
```

File: packages/coding-agent/src/core/agent-session.ts (L1093-1094)

```typescript
			if (result?.systemPrompt) {
				this.agent.state.systemPrompt = result.systemPrompt;
```

File: packages/coding-agent/src/core/agent-session.ts (L1264-1264)

```typescript
	 * Send a custom message to the session. Creates a CustomMessageEntry.
```

File: packages/coding-agent/src/core/agent-session.ts (L1293-1293)

```typescript
this.agent.steer(appMessage);
```

File: packages/coding-agent/CHANGELOG.md (L2815-2815)

```markdown
- Hook API: `pi.getActiveTools()` and `pi.setActiveTools(toolNames)` for dynamically enabling/disabling tools from hooks
```
