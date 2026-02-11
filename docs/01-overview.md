# Overview

Mission Control is the **web UI + HTTP API** for operating OpenClaw. It’s where you manage boards, tasks, agents, approvals, and (optionally) gateway connections.

## Problem statement
- Provide a single place to coordinate work (boards/tasks) and execute automation (agents) safely.

## Non-goals (first pass)
- Not a general-purpose project management suite.
- Not a full observability platform.

## Key concepts (glossary-lite)
- **Board**: a workspace containing tasks, memory, and agents.
- **Task**: unit of work on a board; has status and comments.
- **Agent**: an automated worker that can execute tasks and post evidence.
- **Gateway**: OpenClaw runtime host that executes tools/skills and runs heartbeats/cron.
- **Heartbeat**: periodic agent check-in loop for doing incremental work.
- **Cron job**: scheduled execution (recurring or one-shot) isolated from conversational context.

## Where to go next
- Want it running? → [Quickstart](02-quickstart.md)
- Want to contribute? → [Development](03-development.md)
- Want to understand internals? → [Architecture](05-architecture.md)
