param(
  [Parameter(Mandatory=$true)][string]$ProjectRoot,
  [switch]$Force,
  [switch]$Move,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $repoRoot "project"

function Usage {
  Write-Output "Usage:"
  Write-Output "  powershell -File ./cli/sync-project-assets.ps1 -ProjectRoot <path> [-Force] [-Move] [-DryRun]"
}

if (-not (Test-Path -Path $ProjectRoot -PathType Container)) {
  Write-Error "Error: project root not found: $ProjectRoot"
  Usage
  exit 1
}

if (-not (Test-Path -Path $srcDir -PathType Container)) {
  Write-Error "Error: missing repo project assets dir: $srcDir"
  exit 1
}

$files = Get-ChildItem -Path $srcDir -File
if ($files.Count -eq 0) {
  Write-Output "No files found in $srcDir (nothing to sync)."
  exit 0
}

$copied = 0
$skipped = 0

foreach ($f in $files) {
  $dest = Join-Path $ProjectRoot $f.Name

  if ((Test-Path -Path $dest) -and (-not $Force)) {
    Write-Output "SKIP (exists): $($f.Name)"
    $skipped++
    continue
  }

  if ($DryRun) {
    $op = $Move.IsPresent ? "mv" : "cp"
    Write-Output "DRYRUN: $op `"$($f.FullName)`" `"$dest`""
    $copied++
    continue
  }

  if ($Move.IsPresent) {
    Move-Item -Force:$Force -Path $f.FullName -Destination $dest
  } else {
    Copy-Item -Force:$Force -Path $f.FullName -Destination $dest
  }

  Write-Output "OK: $($f.Name)"
  $copied++
}

Write-Output "Done. synced=$copied skipped=$skipped force=$Force move=$Move"

