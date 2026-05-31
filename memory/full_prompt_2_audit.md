
 - Disable MCP tools you don't use (chrome-devtools alone adds dozens)
 - Trim tool descriptions — most are verbose; cut examples, edge cases, retry logic from
 descriptions
 - Use skill-based tool loading — skills can register tools on-demand instead of all at
 startup
 - Collapse similar tools — hex_edit/show/validate/diff → one multi-mode tool;
 session_search/list/read → one session tool
 - Remove interview tool (rarely used, big schema); use skill instead
 - Move diagnostic/self_diagnostic to a skill — only load when /diag is called
 - Move monitor to a skill — only needed for long-running tasks
 - ## Audit 
 -  There it is. The skills block shrank by 24KB (93→42 skills, removed 51 unused). That's the
 improvement. But the tool definitions section exploded:

 ┌──────────────────┬─────────┬─────────┬────────────┐
 │ Region           │ V1      │ V2      │ Diff       │
 ├──────────────────┼─────────┼─────────┼────────────┤
 │ Skills block     │ 44,653  │ 20,834  │ -23,819 ✅ │
 ├──────────────────┼─────────┼─────────┼────────────┤
 │ Tool definitions │ ~16,688 │ ~94,873 │ +78,185 🔺 │
 ├──────────────────┼─────────┼─────────┼────────────┤
 │ Total            │ 80,316  │ 125,284 │ +45,530 🔺 │
 └──────────────────┴─────────┴─────────┴────────────┘

 The skill cleanup saved ~24KB, but tool definitions grew by ~78KB. V1 had 7 tools (using
 tool_search for the rest), V2 has 26 tools all expanded inline. The tool_search → full tool
 definition switch is what caused the bloat. That's not a skill issue — it's the opposite of
 the tool_search pattern, dumping all tool schemas inline instead of hiding them behind the
 gateway.

 ---

 ## Breakdown 

 subagent is 63KB — 67% of all tool definitions. That's the killer.
 
  ┌────────────────────┬────────┬────────────┐
  │ Tool               │ Size   │ % of total │
  ├────────────────────┼────────┼────────────┤
  │ subagent           │ 63,050 │ 67%        │
  ├────────────────────┼────────┼────────────┤
  │ lsp_navigation     │ 6,313  │ 7%         │
  ├────────────────────┼────────┼────────────┤
  │ interview          │ 3,471  │ 4%         │
  ├────────────────────┼────────┼────────────┤
  │ ast_grep_search    │ 2,494  │ 3%         │
  ├────────────────────┼────────┼────────────┤
  │ mcp                │ 2,246  │ 2%         │
  ├────────────────────┼────────┼────────────┤
  │ Remaining 21 tools │ 16,937 │ 18%        │
  └────────────────────┴────────┴────────────┘
 
  Slash subagent schema size and you'd drop from 126KB → ~63KB, actually smaller than V1's
  80KB.