export default function (pi) {
  // Official ExtensionAPI — prunes any tool result > ~20k tokens BEFORE it enters context
  pi.on('tool_result', (event) => {
    const result = event.result || event;
    if (result?.content && typeof result.content === 'string' && result.content.length > 80000) {
      const originalSize = result.content.length;
      result.content = result.content.slice(0, 80000) +
        `\n\n[OUTPUT TRUNCATED BY PI EXTENSION — original was ${originalSize} chars / ~${Math.ceil(originalSize/4)} tokens]`;
    }
    return result;
  });
}
