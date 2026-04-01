---
name: learning-capture
description: Capture durable repo learnings after implementation work. Use when a task uncovers a repeatable pattern, architecture constraint, setup gotcha, rollback note, or future-safe follow-up that should be written into tasks.md, docs, or .github/instructions.
---

# Learning Capture

Use this skill to turn fresh implementation knowledge into small, durable repo updates.

## Workflow

1. Identify the learning.
   Keep only facts that are likely to matter again: integration constraints, setup steps, rollback notes, or recurring mistakes.
2. Choose the right home.
   Use `tasks.md` for follow-up work, `README.md` or docs for operator setup, and `.github/instructions/` for repo-working rules.
3. Keep entries specific.
   Record the exact constraint or action, not a vague summary.
4. Update the smallest useful file set.
   Avoid spraying the same note into multiple files unless each serves a different audience.
5. Re-read the touched files.
   Make sure the new learning matches the current code and does not contradict existing guidance.

## Common placements

- `tasks.md`: known next iteration work, especially security or architecture follow-ups
- `README.md`: setup steps needed to run or deploy the current implementation
- `docs/architecture/`: current-state architecture constraints
- `.github/instructions/`: stable repo conventions for future coding sessions

## Notes

- Prefer short, actionable additions over long retrospectives.
- When payments or auth are involved, record what is demo-only versus production-safe.
