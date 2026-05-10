#!/usr/bin/env bash
# .github/hooks/scripts/qa-review.sh
# Stop hook — blocks the agent from finishing and injects a QA checklist.
# On the second stop (stop_hook_active = true), allows clean exit.
#
# Correct Stop hook output format (per VS Code docs):
#   hookSpecificOutput.decision = "block" re-engages the agent with a reason.
#   systemMessage only shows a UI notification — it does NOT re-engage the agent.

set -euo pipefail

INPUT=$(cat)

# ── Idempotency guard: VS Code sets stop_hook_active=true on the second Stop ──
# This fires when the agent stopped BECAUSE of a previous hook block — meaning
# the QA pass has already run. Allow clean exit.
STOP_HOOK_ACTIVE=$(echo "$INPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('true' if data.get('stop_hook_active') else 'false')
" 2>/dev/null || echo 'false')

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
    echo '{"continue":true}'
    exit 0
fi

# ── Read the transcript summary from file (transcript_path in hook input) ─────
LAST_MSG="(transcript not available)"
TRANSCRIPT_PATH=$(echo "$INPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(data.get('transcript_path', ''))
" 2>/dev/null || echo '')

if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    LAST_MSG=$(python3 -c "
import json, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
messages = data.get('messages', data) if isinstance(data, dict) else data
assistant_msgs = [m for m in (messages if isinstance(messages, list) else []) if isinstance(m, dict) and m.get('role') == 'assistant']
if assistant_msgs:
    content = assistant_msgs[-1].get('content', '')
    if isinstance(content, list):
        content = ' '.join(c.get('text', '') for c in content if isinstance(c, dict))
    print(str(content)[:1500])
else:
    print('(no assistant message found)')
" "$TRANSCRIPT_PATH" 2>/dev/null || echo "(could not read transcript)")
fi

# ── Build the QA reason string (injected into the agent as the 'why continue') ─
QA_REASON="Automated QA review required before finishing. Run through this checklist and fix any issues found:
1. FILES VALID — No unclosed HTML tags, missing CSS braces, or broken JSON in modified files?
2. CROSS-REFERENCES — Did changes to one page require updates elsewhere (e.g. nav, links, shared snippets)?
3. MOBILE BREAKPOINTS — Any new layout elements? Are responsive rules in place?
4. COPY COMPLIANCE — No NHS-ready, no named doctor, no overclaiming clinical language in new copy?
5. ACCESSIBILITY — New interactive elements have aria labels? Decorative icons have aria-hidden?
6. TODO MARKERS — Any TODO comments added that the user should act on?
7. PLAYWRIGHT — If any user-facing page or form flow was modified, run the relevant Playwright diagnostic in output/playwright/ and confirm it passes (zero console errors, zero network failures, expected UI state reached). If no diagnostic exists for the changed flow, write one.

Previous work summary: $LAST_MSG

When all checks pass, respond with: 'QA PASS — all checks clear.' followed by your handoff summary."

# ── Return hookSpecificOutput to block stop and re-engage the agent ───────────
python3 -c "
import json, sys
print(json.dumps({
    'hookSpecificOutput': {
        'hookEventName': 'Stop',
        'decision': 'block',
        'reason': sys.argv[1]
    }
}))
" "$QA_REASON"

exit 0
