<#
.SYNOPSIS
    das-ued-skills Windows 零克隆安装脚本
.DESCRIPTION
    从 GitLab 克隆仓库并安装 skills 到 AI 助手目录
.PARAMETER ai
    AI 助手标识: cursor, claude, codex, windsurf, qoder, all
.PARAMETER targetDir
    自定义安装目录（可选）
.EXAMPLE
    powershell -File ./cli/install.ps1 -ai cursor
    powershell -File ./cli/install.ps1 -ai all
    powershell -File ./cli/install.ps1 -ai cursor -targetDir "C:\custom\skills"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ai = "cursor",
    
    [Parameter(Mandatory=$false)]
    [string]$targetDir = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoUrl = "http://gitlab.info.dbappsecurity.com.cn/ued6/das-ued-skills.git"
$ref = "main"
$tmpDir = Join-Path $env:TEMP "das-ued-skills-install-$(Get-Date -Format 'yyyyMMddHHmmss')"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Get-SkillsDir {
    param([string]$Assistant)
    
    if ($targetDir -ne "") {
        return $targetDir
    }
    
    $homeDir = $env:USERPROFILE
    
    switch ($Assistant.ToLower()) {
        "cursor" { return Join-Path $homeDir ".cursor\skills" }
        "claude" { return Join-Path $homeDir ".claude\skills" }
        "codex" { return Join-Path $homeDir ".codex\skills" }
        "windsurf" { return Join-Path $homeDir ".windsurf\skills" }
        "qoder" { return Join-Path $homeDir ".qoder\skills" }
        "trae" { return Join-Path $homeDir ".trae\skills" }
        "copilot" { return Join-Path $homeDir ".copilot\skills" }
        "kiro" { return Join-Path $homeDir ".kiro\skills" }
        "gemini" { return Join-Path $homeDir ".gemini\skills" }
        "opencode" { return Join-Path $homeDir ".opencode\skills" }
        "continue" { return Join-Path $homeDir ".continue\skills" }
        "codebuddy" { return Join-Path $homeDir ".codebuddy\skills" }
        "antigravity" { return Join-Path $homeDir ".antigravity\skills" }
        "roocode" { return Join-Path $homeDir ".roocode\skills" }
        "droid" { return Join-Path $homeDir ".factory\skills" }
        default {
            Write-Error-Custom "不支持的 AI 助手: $Assistant"
            Write-Host "支持的助手: cursor, claude, codex, windsurf, qoder, trae, copilot, kiro, gemini, all" -ForegroundColor Yellow
            exit 1
        }
    }
}

function Sync-Rules {
    param([string]$Assistant, [string]$RepoRoot)
    
    $homeDir = $env:USERPROFILE
    $rulesTarget = ""
    
    switch ($Assistant.ToLower()) {
        "cursor" { $rulesTarget = Join-Path $homeDir ".cursor\rules" }
        "claude" { $rulesTarget = Join-Path $homeDir ".claude\rules" }
        "windsurf" { $rulesTarget = Join-Path $homeDir ".windsurf\rules" }
        "copilot" { $rulesTarget = Join-Path $homeDir ".copilot\rules" }
        "kiro" { $rulesTarget = Join-Path $homeDir ".kiro\rules" }
        "codex" { $rulesTarget = Join-Path $homeDir ".codex\rules" }
        "qoder" { $rulesTarget = Join-Path $homeDir ".qoder\rules" }
        "roocode" { $rulesTarget = Join-Path $homeDir ".roocode\rules" }
        "gemini" { $rulesTarget = Join-Path $homeDir ".gemini\rules" }
        "trae" { $rulesTarget = Join-Path $homeDir ".trae\rules" }
        "opencode" { $rulesTarget = Join-Path $homeDir ".opencode\rules" }
        "continue" { $rulesTarget = Join-Path $homeDir ".continue\rules" }
        "codebuddy" { $rulesTarget = Join-Path $homeDir ".codebuddy\rules" }
        "antigravity" { $rulesTarget = Join-Path $homeDir ".antigravity\rules" }
        "droid" { $rulesTarget = Join-Path $homeDir ".factory\rules" }
        default { return }
    }
    
    if ($rulesTarget -ne "") {
        $rulesSource = Join-Path $RepoRoot "rules"
        if (Test-Path $rulesSource) {
            New-Item -ItemType Directory -Path $rulesTarget -Force | Out-Null
            Get-ChildItem -Path $rulesSource -Filter "*.mdc" | ForEach-Object {
                Copy-Item -Path $_.FullName -Destination $rulesTarget -Force
                Write-Info "同步 rules: $($_.Name)"
            }
        }
    }
}

function Install-Skills {
    param([string]$Assistant, [string]$RepoRoot)
    
    $skillsDir = Get-SkillsDir -Assistant $Assistant
    $optDir = Join-Path $RepoRoot "opt"
    
    Write-Info "安装 skills 到: $skillsDir"
    
    if (-not (Test-Path $skillsDir)) {
        New-Item -ItemType Directory -Path $skillsDir -Force | Out-Null
    }
    
    if (-not (Test-Path $optDir)) {
        Write-Error-Custom "opt 目录不存在: $optDir"
        return
    }
    
    $skillFiles = Get-ChildItem -Path $optDir -Filter "SKILL.md" -Recurse
    $installed = 0
    $skipped = 0
    
    foreach ($file in $skillFiles) {
        $skillDir = $file.Directory
        $relativePath = $skillDir.FullName.Substring($optDir.Length + 1)
        $skillName = "opt-" + ($relativePath -replace '[\\/]+', '-')
        
        $destDir = Join-Path $skillsDir $skillName
        
        if (Test-Path $destDir) {
            Remove-Item -Path $destDir -Recurse -Force
        }
        
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item -Path $file.FullName -Destination (Join-Path $destDir "SKILL.md")
        Write-Info "已安装: $skillName"
        $installed++
    }
    
    Write-Success "Skills 安装完成! (已安装: $installed)"
    
    # 同步全局 rules
    Sync-Rules -Assistant $Assistant -RepoRoot $RepoRoot
}

# 主逻辑
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  das-ued-skills 安装程序 (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 git
try {
    $null = Get-Command git -ErrorAction Stop
} catch {
    Write-Error-Custom "git 未找到，请先安装 Git for Windows"
    exit 1
}

# 创建临时目录
if (Test-Path $tmpDir) {
    Remove-Item -Path $tmpDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tmpDir | Out-Null

try {
    # 克隆仓库
    Write-Info "克隆仓库: $repoUrl (分支: $ref) ..."
    $repoTmp = Join-Path $tmpDir "repo"
    & git clone --depth 1 --branch $ref $repoUrl $repoTmp 2>&1 | Out-Null
    
    Write-Host ""
    
    if ($ai.ToLower() -eq "all") {
        # 批量安装
        Write-Info "批量安装到所有支持的 AI 助手..."
        $assistants = @("cursor", "claude", "codex", "windsurf", "qoder")
        
        foreach ($assistant in $assistants) {
            Write-Host ""
            Write-Host "----------------------------------------" -ForegroundColor DarkCyan
            Install-Skills -Assistant $assistant -RepoRoot $repoTmp
        }
        
        Write-Host ""
        Write-Success "批量安装完成!"
    } else {
        # 单个助手
        Install-Skills -Assistant $ai -RepoRoot $repoTmp
    }
    
    Write-Host ""
    Write-Success "安装完成!"
    
} finally {
    # 清理临时目录
    if (Test-Path $tmpDir) {
        Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
