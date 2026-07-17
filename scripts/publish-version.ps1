[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $repoRoot

try {
    $insideWorkTree = (& git rev-parse --is-inside-work-tree 2>$null)
    if ($LASTEXITCODE -ne 0 -or $insideWorkTree -ne 'true') {
        throw 'This folder is not a Git working tree.'
    }

    $branch = (& git branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
        throw 'A named Git branch is required before publishing.'
    }
    if ($branch -ne 'main') {
        throw "Version publishing is restricted to main; current branch is '$branch'."
    }

    Invoke-Git @('fetch', 'origin', 'main', '--no-tags')

    $aheadBehind = ((& git rev-list --left-right --count 'HEAD...origin/main').Trim() -split '\s+')
    if ($LASTEXITCODE -ne 0 -or $aheadBehind.Count -ne 2) {
        throw 'Unable to compare the local branch with origin/main.'
    }

    $ahead = [int]$aheadBehind[0]
    $behind = [int]$aheadBehind[1]
    if ($behind -gt 0) {
        throw "origin/main is ahead by $behind commit(s). Pull or reconcile those changes before publishing."
    }

    & npm run check
    if ($LASTEXITCODE -ne 0) {
        throw 'Project checks failed; the update was not published.'
    }

    $publishPaths = @(
        '.gitignore',
        'AGENTS.md',
        'README.md',
        'docs',
        'index.html',
        'package.json',
        'package-lock.json',
        'scripts',
        'src'
    )
    Invoke-Git (@('add', '-A', '--') + $publishPaths)

    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host 'No completed project changes to publish.'
        exit 0
    }
    if ($LASTEXITCODE -ne 1) {
        throw 'Unable to inspect the staged project changes.'
    }

    $datePrefix = Get-Date -Format 'MMdd'
    $pattern = '^' + [regex]::Escape($datePrefix) + ' Ver\.(\d+)$'
    $highestVersion = 0

    $subjects = @(& git log --format=%s)
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to inspect existing version commits.'
    }

    foreach ($subject in $subjects) {
        if ($subject -match $pattern) {
            $candidate = [int]$Matches[1]
            if ($candidate -gt $highestVersion) {
                $highestVersion = $candidate
            }
        }
    }

    $nextVersion = $highestVersion + 1
    $versionName = "$datePrefix Ver.$nextVersion"
    $tagName = "$datePrefix-Ver.$nextVersion"

    # This repository was reconnected as a partial clone. Unchanged blobs may
    # exist only on origin, so build the commit tree without requiring local
    # copies of every historical asset.
    $parentCommit = (& git rev-parse HEAD).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to resolve the current commit.'
    }

    $tree = (& git write-tree --missing-ok).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($tree)) {
        throw 'Unable to build the version tree.'
    }

    $newCommit = (& git commit-tree $tree -p $parentCommit -m $versionName).Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($newCommit)) {
        throw 'Unable to create the version commit.'
    }

    Invoke-Git @('update-ref', "refs/heads/$branch", $newCommit, $parentCommit)
    Invoke-Git @('tag', '-a', $tagName, '-m', $versionName)

    try {
        Invoke-Git @('push', '--atomic', 'origin', "HEAD:refs/heads/$branch", "refs/tags/$tagName")
    }
    catch {
        & git tag -d $tagName | Out-Null
        & git update-ref "refs/heads/$branch" $parentCommit $newCommit
        throw
    }

    $commitShort = (& git rev-parse --short HEAD).Trim()
    Write-Host "Published $versionName ($commitShort) to origin/$branch with tag $tagName."
}
finally {
    Pop-Location
}
