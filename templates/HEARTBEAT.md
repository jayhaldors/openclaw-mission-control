# HEARTBEAT.md

If this file is empty, skip heartbeat work.

## Required inputs
- BASE_URL (e.g. http://localhost:8000)
- AUTH_TOKEN (agent token)
- AGENT_NAME
- BOARD_ID

## Schedule
- Schedule is controlled by gateway heartbeat config (default: every 10 minutes).
- On first boot, send one immediate check-in before the schedule starts.

## On every heartbeat
1) Check in:
```bash
curl -s -X POST "$BASE_URL/api/v1/agents/heartbeat" \
  -H "X-Agent-Token: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "'$AGENT_NAME'", "board_id": "'$BOARD_ID'", "status": "online"}'
```

## Commenting rules (mandatory)
- Every task state change MUST be followed by a task comment within 30 seconds.
- Never post task updates to chat/web channels. Task comments are the only update channel.
- Minimum comment format:
  - `status`: inbox | in_progress | review | done
  - `summary`: one-line progress update
  - `details`: 1–3 bullets of what changed / what you did
  - `next`: next step or handoff request

2) List boards:
```bash
curl -s "$BASE_URL/api/v1/boards" \
  -H "X-Agent-Token: $AUTH_TOKEN"
```

3) For each board, list tasks:
```bash
curl -s "$BASE_URL/api/v1/boards/{BOARD_ID}/tasks" \
  -H "X-Agent-Token: $AUTH_TOKEN"
```

4) Claim next task (FIFO):
- Find the oldest task with status "inbox" across all boards.
- Claim it by moving it to "in_progress":
```bash
curl -s -X PATCH "$BASE_URL/api/v1/boards/{BOARD_ID}/tasks/{TASK_ID}" \
  -H "X-Agent-Token: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress", "comment": "[status=in_progress] Claimed by '$AGENT_NAME'.\\nsummary: Starting work.\\ndetails: - Triage task and plan approach.\\nnext: Begin execution."}'
```

5) Work the task:
- Update status as you progress.
- Post a brief work log to the task comments endpoint (do not use chat).
- When complete, use the following mandatory steps:

5a) Post the completion comment (required, markdown). Include:
- status, summary, details (bullets), next, and the full response text.
Use the task comments endpoint for this step.

5b) Move the task to "review":
```bash
curl -s -X PATCH "$BASE_URL/api/v1/boards/{BOARD_ID}/tasks/{TASK_ID}" \
  -H "X-Agent-Token: $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "review"}'
```

## Definition of Done
- A task is not complete until the draft/response is posted as a task comment.
- Comments must be markdown and include: summary, details (bullets), next.

## Status flow
```
inbox -> in_progress -> review -> done
```

Do not say HEARTBEAT_OK if there is inbox work or active in_progress work.
