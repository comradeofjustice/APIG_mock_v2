Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$src = Join-Path $repoRoot "cli\das-ued-skills.ps1"
$binDir = Join-Path $HOME ".local\bin"
$dstPs1 = Join-Path $binDir "das-ued-skills.ps1"
$dstCmd = Join-Path $binDir "das-ued-skills.cmd"

New-Item -ItemType Directory -Path $binDir -Force | Out-Null
Copy-Item -Force $src $dstPs1

$cmdContent = '@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0das-ued-skills.ps1" %*'
Set-Content -Path $dstCmd -Value $cmdContent -Encoding ascii

Write-Output "Installed:"
Write-Output "  $dstPs1"
Write-Output "  $dstCmd"
Write-Output ""
Write-Output "If command is not found, add this path to your user PATH:"
Write-Output "  $binDir"
