# .github/hooks/scripts/push-and-comment.ps1
#
# Usage: .github/hooks/scripts/push-and-comment.ps1 [git push args...]
#
# Runs `git push` with any supplied arguments, then — if the push succeeds and
# an open PR exists for the current branch — posts a comment listing the newly
# pushed commits so reviewers see context without having to check the diff.
#
# Requires: gh CLI authenticated (gh auth status)

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$PushArgs
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── 1. Detect current branch ──────────────────────────────────────────────────
$branch = git rev-parse --abbrev-ref HEAD 2>&1
if ($LASTEXITCODE -ne 0 -or $branch -eq 'HEAD') {
    Write-Host "push-and-comment: could not determine current branch — running plain git push."
    git push @PushArgs
    exit $LASTEXITCODE
}

# ── 2. Capture remote HEAD before push so we know the range of new commits ───
$remoteName = 'origin'
$remoteRef  = "refs/remotes/$remoteName/$branch"
$remoteSha  = git rev-parse --verify $remoteRef 2>$null
# $remoteSha is empty when the branch doesn't exist on the remote yet

# ── 3. Run the actual push ────────────────────────────────────────────────────
Write-Host "push-and-comment: pushing branch '$branch'…"
if ($PushArgs.Count -gt 0) {
    git push @PushArgs
} else {
    git push origin $branch
}
$pushExit = $LASTEXITCODE

if ($pushExit -ne 0) {
    Write-Host "push-and-comment: push failed (exit $pushExit) — skipping PR comment."
    exit $pushExit
}

# ── 4. Find the open PR for this branch ──────────────────────────────────────
$ghAvailable = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)
if (-not $ghAvailable) {
    Write-Host "push-and-comment: gh CLI not found — skipping PR comment."
    exit 0
}

$prJson = gh pr list --head $branch --state open --json number,title --limit 1 2>$null
if ($LASTEXITCODE -ne 0 -or -not $prJson -or $prJson -eq '[]') {
    Write-Host "push-and-comment: no open PR found for branch '$branch' — skipping comment."
    exit 0
}

$pr = $prJson | ConvertFrom-Json
if ($pr.Count -eq 0) {
    Write-Host "push-and-comment: no open PR found for branch '$branch' — skipping comment."
    exit 0
}

$prNumber = $pr[0].number
$prTitle  = $pr[0].title

# ── 5. Build the commit list ──────────────────────────────────────────────────
$localSha = git rev-parse HEAD
if ($remoteSha) {
    $logRange  = "$remoteSha..$localSha"
    $rangeDesc = "${remoteSha.Substring(0,7)}..${localSha.Substring(0,7)}"
} else {
    # New branch — show last 10 commits at most
    $logRange  = "-10"
    $rangeDesc = "all commits (new branch)"
}

$commitLines = git log $logRange --oneline --no-merges 2>$null
if (-not $commitLines) {
    Write-Host "push-and-comment: push succeeded but no new commits found in range — skipping comment."
    exit 0
}

$commitList = ($commitLines | ForEach-Object { "- ``$_``" }) -join "`n"
$pushedCount = ($commitLines | Measure-Object).Count
$body = "**$pushedCount commit$(if ($pushedCount -ne 1) {'s'}) pushed** to \`$branch\` ($rangeDesc)`n`n$commitList`n`n*Posted automatically by push-and-comment.ps1*"

# ── 7. Reply to open review threads, or post standalone if none ──────────────
$repoView  = gh repo view --json nameWithOwner,owner,name 2>$null | ConvertFrom-Json
$repoFull  = $repoView.nameWithOwner
$prUrl     = "https://github.com/$repoFull/pull/$prNumber"

$threadsRaw = gh api graphql `
    -F owner=$repoView.owner.login -F repo=$repoView.name -F number=$prNumber `
    -f query='query($owner:String!,$repo:String!,$number:Int!){repository(owner:$owner,name:$repo){pullRequest(number:$number){reviewThreads(first:50){nodes{id isResolved comments(first:1){nodes{databaseId}}}}}}}' `
    2>$null

$unresolved = @()
if ($threadsRaw) {
    $allThreads = ($threadsRaw | ConvertFrom-Json).data.repository.pullRequest.reviewThreads.nodes
    $unresolved = @($allThreads | Where-Object { -not $_.isResolved -and $_.comments.nodes.Count -gt 0 })
}

Write-Host "push-and-comment: PR #$prNumber — $($unresolved.Count) unresolved review thread(s)…"

if ($unresolved.Count -gt 0) {
    # JSON body for REST API replies endpoint
    $replyJsonFile = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.json'
    @{ body = $body } | ConvertTo-Json -Compress | Set-Content -Path $replyJsonFile -Encoding UTF8

    $resolved = 0
    foreach ($thread in $unresolved) {
        $commentId = $thread.comments.nodes[0].databaseId
        # Reply to the thread's root comment
        gh api "/repos/$repoFull/pulls/$prNumber/comments/$commentId/replies" `
            --method POST --input $replyJsonFile 2>$null | Out-Null
        # Resolve the thread via GraphQL
        gh api graphql -F threadId=$thread.id `
            -f query='mutation($threadId:ID!){resolveReviewThread(input:{threadId:$threadId}){thread{isResolved}}}' `
            2>$null | Out-Null
        $resolved++
    }
    Remove-Item $replyJsonFile -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "  ✔ $resolved review thread(s) replied to and resolved"
    Write-Host "  → $prUrl"
    Write-Host ""
} else {
    # No open review threads — post as a standalone push summary comment
    $bodyFile = [System.IO.Path]::GetTempFileName() -replace '\.tmp$', '.md'
    Set-Content -Path $bodyFile -Value $body -Encoding UTF8 -NoNewline
    gh pr comment $prNumber --body-file $bodyFile 2>$null | Out-Null
    $commentExit = $LASTEXITCODE
    Remove-Item $bodyFile -ErrorAction SilentlyContinue

    if ($commentExit -eq 0) {
        Write-Host ""
        Write-Host "  ✔ PR comment posted (no open review threads)"
        Write-Host "  → $prUrl"
        Write-Host ""
    } else {
        Write-Host "push-and-comment: comment post failed (exit $commentExit) — push was still successful."
    }
}

exit 0
