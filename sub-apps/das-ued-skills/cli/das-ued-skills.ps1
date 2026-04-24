Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Version = "0.1.0"
$RepoUrlDefault = "http://gitlab.info.dbappsecurity.com.cn/ued6/das-ued-skills.git"
$RefDefault = "main"

function Show-Usage {
@"
das-ued-skills - Skills installer CLI (PowerShell)

Usage:
  das-ued-skills <command> [options]

Commands:
  init        Install skills to local assistant directories
  help        Show help
  version     Show version

Examples:
  das-ued-skills init --ai cursor
  das-ued-skills init --ai all
  das-ued-skills init --ai cursor --target-dir C:\skills
"@ | Write-Output
}

function Show-InitUsage {
@"
Usage:
  das-ued-skills init [--ai claude|cursor|windsurf|antigravity|copilot|kiro|codex|qoder|roocode|gemini|trae|opencode|continue|codebuddy|droid|all] [--target-dir PATH] [--repo-url URL] [--ref BRANCH]
"@ | Write-Output
}

function Resolve-TargetDir([string]$Ai, [string]$Override) {
  if ($Override) { return $Override }
  switch ($Ai) {
    "claude"      { return (Join-Path $HOME ".claude\skills") }
    "cursor"      { return (Join-Path $HOME ".cursor\skills") }
    "windsurf"    { return (Join-Path $HOME ".windsurf\skills") }
    "antigravity" { return (Join-Path $HOME ".antigravity\skills") }
    "copilot"     { return (Join-Path $HOME ".copilot\skills") }
    "kiro"        { return (Join-Path $HOME ".kiro\skills") }
    "codex"       { return (Join-Path $HOME ".codex\skills") }
    "qoder"       { return (Join-Path $HOME ".qoder\skills") }
    "roocode"     { return (Join-Path $HOME ".roocode\skills") }
    "gemini"      { return (Join-Path $HOME ".gemini\skills") }
    "trae"        { return (Join-Path $HOME ".trae\skills") }
    "opencode"    { return (Join-Path $HOME ".opencode\skills") }
    "continue"    { return (Join-Path $HOME ".continue\skills") }
    "codebuddy"   { return (Join-Path $HOME ".codebuddy\skills") }
    "droid"       { return (Join-Path $HOME ".factory\skills") }
    default { throw "Unsupported --ai: $Ai" }
  }
}

function Get-SkillDirs([string]$BaseDir) {
  Get-ChildItem -Path $BaseDir -Recurse -File -Filter "SKILL.md" | ForEach-Object {
    Split-Path -Parent $_.FullName
  }
}

function Get-InstallName([string]$RepoRoot, [string]$SkillDir) {
  $relative = $SkillDir.Substring($RepoRoot.Length).TrimStart('\', '/')
  return $relative.Replace('\', '-').Replace('/', '-')
}

function Install-ToOne([string]$Ai, [string]$RepoRoot, [string]$OverrideTargetDir) {
  $targetDir = Resolve-TargetDir -Ai $Ai -Override $OverrideTargetDir
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  Write-Output "Installing skills to: $targetDir"

  foreach ($skillDir in (Get-SkillDirs -BaseDir $RepoRoot)) {
    $name = Get-InstallName -RepoRoot $RepoRoot -SkillDir $skillDir
    $dst = Join-Path $targetDir $name
    if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
    Copy-Item -Recurse -Force $skillDir $dst
    Write-Output "  - installed: $name"
  }
}

function Parse-InitArgs([string[]]$Args) {
  $result = @{
    Ai = "cursor"
    TargetDir = ""
    RepoUrl = $RepoUrlDefault
    Ref = $RefDefault
  }

  $i = 0
  while ($i -lt $Args.Count) {
    $arg = $Args[$i]
    switch ($arg) {
      "--ai" {
        if ($i + 1 -ge $Args.Count) { throw "Missing value for --ai" }
        $result.Ai = $Args[$i + 1]
        $i += 2
      }
      "--target-dir" {
        if ($i + 1 -ge $Args.Count) { throw "Missing value for --target-dir" }
        $result.TargetDir = $Args[$i + 1]
        $i += 2
      }
      "--repo-url" {
        if ($i + 1 -ge $Args.Count) { throw "Missing value for --repo-url" }
        $result.RepoUrl = $Args[$i + 1]
        $i += 2
      }
      "--ref" {
        if ($i + 1 -ge $Args.Count) { throw "Missing value for --ref" }
        $result.Ref = $Args[$i + 1]
        $i += 2
      }
      "--help" {
        Show-InitUsage
        exit 0
      }
      default {
        throw "Unknown argument for init: $arg"
      }
    }
  }

  return $result
}

function Invoke-Init([string[]]$Args) {
  $opts = Parse-InitArgs -Args $Args
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "git is required but not found."
  }

  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("das-ued-skills-" + [Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Path $tmp -Force | Out-Null
  try {
    $repoDir = Join-Path $tmp "repo"
    Write-Output "Cloning $($opts.RepoUrl) (ref: $($opts.Ref)) ..."
    & git clone --depth 1 --branch $opts.Ref $opts.RepoUrl $repoDir | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "git clone failed." }

    switch ($opts.Ai) {
      "claude" { Install-ToOne -Ai "claude" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "cursor" { Install-ToOne -Ai "cursor" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "windsurf" { Install-ToOne -Ai "windsurf" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "antigravity" { Install-ToOne -Ai "antigravity" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "copilot" { Install-ToOne -Ai "copilot" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "kiro" { Install-ToOne -Ai "kiro" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "codex"  { Install-ToOne -Ai "codex"  -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "qoder" { Install-ToOne -Ai "qoder" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "roocode" { Install-ToOne -Ai "roocode" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "gemini" { Install-ToOne -Ai "gemini" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "trae" { Install-ToOne -Ai "trae" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "opencode" { Install-ToOne -Ai "opencode" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "continue" { Install-ToOne -Ai "continue" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "codebuddy" { Install-ToOne -Ai "codebuddy" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "droid" { Install-ToOne -Ai "droid" -RepoRoot $repoDir -OverrideTargetDir $opts.TargetDir }
      "all" {
        Install-ToOne -Ai "claude" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "cursor" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "windsurf" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "antigravity" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "copilot" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "kiro" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "codex"  -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "qoder" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "roocode" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "gemini" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "trae" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "opencode" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "continue" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "codebuddy" -RepoRoot $repoDir -OverrideTargetDir ""
        Install-ToOne -Ai "droid" -RepoRoot $repoDir -OverrideTargetDir ""
      }
      default { throw "Invalid --ai value: $($opts.Ai)" }
    }

    Write-Output "Done."
  } finally {
    if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
  }
}

if ($args.Count -eq 0) {
  Show-Usage
  exit 0
}

$command = $args[0]
$rest = @()
if ($args.Count -gt 1) { $rest = $args[1..($args.Count - 1)] }

switch ($command) {
  "init"    { Invoke-Init -Args $rest }
  "help"    { Show-Usage }
  "--help"  { Show-Usage }
  "-h"      { Show-Usage }
  "version" { Write-Output $Version }
  "--version" { Write-Output $Version }
  "-v"      { Write-Output $Version }
  default {
    throw "Unknown command: $command"
  }
}
