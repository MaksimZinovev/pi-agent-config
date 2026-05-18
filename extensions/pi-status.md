# @vtstech/pi-status

**System monitor extension for the Pi Coding Agent** — adds composable named status items to the footer bar. Auto-loaded, no commands needed.

## Install

```bash
pi install "npm:@vtstech/pi-status"
```

## How It Works

Each metric gets a named slot that coexists alongside framework items. CPU/RAM/Swap are shown only when using a local Ollama provider (omitted for cloud).

**Local Ollama example:**
```
CtxMax:41k RespMax:16.4k Resp 2m3s CPU 12% RAM 2.2G/15.1G SEC:MAX Prompt: 2840 chr 393 tok pi:0.66.1
```

**Cloud example:**
```
CtxMax:128k RespMax:16.4k Resp 1m22s SEC:BASIC Prompt: 2840 chr 393 tok pi:0.66.1
```

## Status Slots

| Slot              | What it shows                        | When                       |
| ----------------- | ------------------------------------ | -------------------------- |
| **CtxMax+RespMax** | Context window + max response tokens | Ollama or after 1st request |
| **Resp**          | Agent loop duration (`2m3s`)         | After first agent cycle     |
| **CPU%**          | Per-core CPU usage                   | Local Ollama only          |
| **RAM**           | Used/total system memory             | Local Ollama only          |
| **Swap**          | Used/total swap                      | Local only, when active    |
| **Generation**    | Temperature, top_p, top_k, etc.      | After first provider req   |
| **SEC**           | Security mode + blocked count + flash | Always                    |
| **Active tool**   | Live elapsed timer (`>`)             | While a tool is running    |
| **Prompt**        | System prompt size (chars, tokens)   | After first agent start    |
| **Pi version**    | `pi:0.66.1`                          | Always                     |

All slots cleared on session shutdown. Duplicates of framework items (model name, session tokens, context %, thinking) are intentionally omitted.

## Source

- npm: [`@vtstech/pi-status`](https://www.npmjs.com/package/@vtstech/pi-status)
- Repo: [VTSTech/pi-coding-agent](https://github.com/VTSTech/pi-coding-agent)
- License: MIT