param(
    [ValidateSet("claude","cursor","windsurf","antigravity","copilot","kiro","codex","qoder","roocode","gemini","trae","opencode","continue","codebuddy","droid","all")]
    [string]$Ai = "cursor",
    [string]$TargetDir = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Get-TargetDir {
    param(
        [Parameter(Mandatory = $true)][string]$Assistant,
        [string]$OverrideDir = ""
    )

    if (-not [string]::IsNullOrWhiteSpace($OverrideDir)) {
        return $OverrideDir
    }

    $homeDir = $HOME
    switch ($Assistant) {
        "claude"      { return (Join-Path $homeDir ".claude/skills") }
        "cursor"      { return (Join-Path $homeDir ".cursor/skills") }
        "windsurf"    { return (Join-Path $homeDir ".windsurf/skills") }
        "antigravity" { return (Join-Path $homeDir ".antigravity/skills") }
        "copilot"     { return (Join-Path $homeDir ".copilot/skills") }
        "kiro"        { return (Join-Path $homeDir ".kiro/skills") }
        "codex"       { return (Join-Path $homeDir ".codex/skills") }
        "qoder"       { return (Join-Path $homeDir ".qoder/skills") }
        "roocode"     { return (Join-Path $homeDir ".roocode/skills") }
        "gemini"      { return (Join-Path $homeDir ".gemini/skills") }
        "trae"        { return (Join-Path $homeDir ".trae/skills") }
        "opencode"    { return (Join-Path $homeDir ".opencode/skills") }
        "continue"    { return (Join-Path $homeDir ".continue/skills") }
        "codebuddy"   { return (Join-Path $homeDir ".codebuddy/skills") }
        "droid"       { return (Join-Path $homeDir ".factory/skills") }
        default       { throw "Unsupported -Ai value: $Assistant" }
    }
}

function Get-RulesTargetDir {
    param([Parameter(Mandatory = $true)][string]$Assistant)

    $homeDir = $HOME
    switch ($Assistant) {
        "cursor"      { return (Join-Path $homeDir ".cursor/rules") }
        "claude"      { return (Join-Path $homeDir ".claude/rules") }
        "windsurf"    { return (Join-Path $homeDir ".windsurf/rules") }
        "antigravity" { return (Join-Path $homeDir ".antigravity/rules") }
        "copilot"     { return (Join-Path $homeDir ".copilot/rules") }
        "kiro"        { return (Join-Path $homeDir ".kiro/rules") }
        "codex"       { return (Join-Path $homeDir ".codex/rules") }
        "qoder"       { return (Join-Path $homeDir ".qoder/rules") }
        "roocode"     { return (Join-Path $homeDir ".roocode/rules") }
        "gemini"      { return (Join-Path $homeDir ".gemini/rules") }
        "trae"        { return (Join-Path $homeDir ".trae/rules") }
        "opencode"    { return (Join-Path $homeDir ".opencode/rules") }
        "continue"    { return (Join-Path $homeDir ".continue/rules") }
        "codebuddy"   { return (Join-Path $homeDir ".codebuddy/rules") }
        "droid"       { return (Join-Path $homeDir ".factory/rules") }
        default       { return $null }
    }
}

function Get-SkillDirectories {
    param([Parameter(Mandatory = $true)][string]$BaseDir)

    return Get-ChildItem -Path $BaseDir -Recurse -Filter "SKILL.md" -File |
        ForEach-Object { $_.DirectoryName } |
        Sort-Object -Unique
}

function Get-SkillInstallName {
    param(
        [Parameter(Mandatory = $true)][string]$RootDir,
        [Parameter(Mandatory = $true)][string]$SkillDir
    )

    $relative = $SkillDir.Substring($RootDir.Length).TrimStart('\','/')
    return ($relative -replace '[\\/]', '-')
}

function Sync-GlobalRules {
    param([Parameter(Mandatory = $true)][string]$Assistant)

    $rulesTarget = Get-RulesTargetDir -Assistant $Assistant
    if ([string]::IsNullOrWhiteSpace($rulesTarget)) {
        return
    }

    New-Item -ItemType Directory -Path $rulesTarget -Force | Out-Null
    $sourceRules = Join-Path $RepoRoot "rules"
    if (Test-Path $sourceRules) {
        Get-ChildItem -Path $sourceRules -Filter "*.mdc" -File -ErrorAction SilentlyContinue |
            ForEach-Object {
                Copy-Item -Path $_.FullName -Destination (Join-Path $rulesTarget $_.Name) -Force
            }
    }

    $count = @(Get-ChildItem -Path $rulesTarget -File -ErrorAction SilentlyContinue).Count
    Write-Host "  - synced rules: $count files"
}

function Install-ToOne {
    param([Parameter(Mandatory = $true)][string]$Assistant)

    $target = Get-TargetDir -Assistant $Assistant -OverrideDir $TargetDir
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    Write-Host "Installing skills to: $target"

    foreach ($skillDir in Get-SkillDirectories -BaseDir $RepoRoot) {
        $name = Get-SkillInstallName -RootDir $RepoRoot -SkillDir $skillDir
        $dest = Join-Path $target $name
        if (Test-Path $dest) {
            Remove-Item -Path $dest -Recurse -Force
        }
        Copy-Item -Path $skillDir -Destination $dest -Recurse -Force
        Write-Host "  - installed: $name"
    }
}

$allTargets = @(
    "claude","cursor","windsurf","antigravity","copilot","kiro","codex","qoder","roocode","gemini","trae","opencode","continue","codebuddy","droid"
)

if ($Ai -eq "all") {
    foreach ($targetAi in $allTargets) {
        Install-ToOne -Assistant $targetAi
        Sync-GlobalRules -Assistant $targetAi
    }
} else {
    Install-ToOne -Assistant $Ai
    Sync-GlobalRules -Assistant $Ai
}

Write-Host "Done."
