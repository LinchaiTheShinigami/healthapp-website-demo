# .github/hooks/scripts/qa-review.ps1
# Stop hook — Windows companion to qa-review.sh
# Blocks the agent from finishing and injects a QA checklist on the first stop.
# On the second stop (stop_hook_active = true), allows clean exit.
#
# Correct Stop hook output format (per VS Code docs):
#   hookSpecificOutput.decision = "block" re-engages the agent with a reason.
#   systemMessage only shows a UI notification — it does NOT re-engage the agent.

$input_data = [Console]::In.ReadToEnd()

# ── Parse the hook input ──────────────────────────────────────────────────────
$payload = $null
try {
    $payload = $input_data | ConvertFrom-Json -ErrorAction Stop
} catch {
    # If we can't parse, allow stop safely
    Write-Output '{"continue":true}'
    exit 0
}

# ── Idempotency guard: VS Code sets stop_hook_active=true on the second Stop ──
# This fires when the agent stopped BECAUSE of a previous hook block — meaning
# the QA pass has already run. Allow clean exit.
if ($payload.stop_hook_active -eq $true) {
    Write-Output '{"continue":true}'
    exit 0
}

# ── Read the transcript summary from file (transcript_path in hook input) ─────
$LAST_MSG = "(transcript not available)"
try {
    $transcript_path = $payload.transcript_path
    if ($transcript_path -and (Test-Path $transcript_path)) {
        $transcript_data = Get-Content $transcript_path -Raw | ConvertFrom-Json -ErrorAction Stop
        $messages = if ($transcript_data.messages) { $transcript_data.messages }
                    elseif ($transcript_data -is [array]) { $transcript_data }
                    else { @() }
        $assistant_msgs = @($messages | Where-Object { $_.role -eq 'assistant' })
        if ($assistant_msgs.Count -gt 0) {
            $content = $assistant_msgs[-1].content
            if ($content -is [array]) {
                $content = ($content | Where-Object { $_.text } | ForEach-Object { $_.text }) -join ' '
            }
            $LAST_MSG = $content.ToString().Substring(0, [Math]::Min(1500, $content.ToString().Length))
        }
    }
} catch {
    # fall through with default message
}

# ── Build the QA reason string (injected into the agent as the 'why continue') ─
$QA_REASON = @"
Automated QA review required before finishing. Run through this checklist and fix any issues found:
1. FILES VALID - No unclosed HTML tags, missing CSS braces, or broken JSON in modified files?
2. CROSS-REFERENCES - Did changes to one page require updates elsewhere (e.g. nav, links, shared snippets)?
3. MOBILE BREAKPOINTS - Any new layout elements? Are responsive rules in place?
4. COPY COMPLIANCE - No NHS-ready, no named doctor, no overclaiming clinical language in new copy?
5. ACCESSIBILITY - New interactive elements have aria labels? Decorative icons have aria-hidden?
6. TODO MARKERS - Any TODO comments added that the user should act on?
7. PLAYWRIGHT - If any user-facing page or form flow was modified, run the relevant Playwright diagnostic in output/playwright/ and confirm it passes (zero console errors, zero network failures, expected UI state reached). If no diagnostic exists for the changed flow, write one.

Previous work summary: $LAST_MSG

When all checks pass, respond with: 'QA PASS - all checks clear.' followed by your handoff summary.
"@

# ── Return hookSpecificOutput to block stop and re-engage the agent ───────────
$output = @{
    hookSpecificOutput = @{
        hookEventName = "Stop"
        decision      = "block"
        reason        = $QA_REASON
    }
} | ConvertTo-Json -Compress -Depth 5

Write-Output $output
exit 0
