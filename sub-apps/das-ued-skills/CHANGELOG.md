# 变更日志

本文件记录项目所有重要变更。

格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，
版本规则遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [Unreleased]

### 变更
- **项目初始化技能**：规范入口统一为 `opt-pro-ux-code-init`（完整流程见 `opt/opt-pro-ux-code-init/SKILL.md`）；已移除 `opt/teach-project_description/`（历史别名仍可在该技能 description 中触发）。

## [0.1.0] - 2026-03-24

### 新增
- 基于实际技能结构与工作流重写项目 `README.md`。
- 新增 `opt-pro-ux-code-init` 技能：项目初始化入口，采集上下文并生成 `project_description.md`。
- 新增本地一键安装脚本：`cli/install-skills.sh`。
- 新增 Shell 引导安装脚本：`cli/install.sh`。
- 新增 macOS/Linux CLI 入口：`cli/das-ued-skills`。
- 新增 Windows PowerShell CLI 入口：`cli/das-ued-skills.ps1`。
- 新增 Windows 一行安装脚本：`cli/install.ps1`。
- 新增 CLI 安装辅助脚本：
  - `cli/install-cli.sh`
  - `cli/install-cli.ps1`
- 将所有安装/CLI 脚本统一收敛至 `cli/` 目录。
- CLI `--ai` 参数扩展为多助手支持：`claude`、`cursor`、`windsurf`、`antigravity`、`copilot`、`kiro`、`codex`、`qoder`、`roocode`、`gemini`、`trae`、`opencode`、`continue`、`codebuddy`、`droid`、`all`。
- 在 `README.md` 中新增说明：
  - CLI 安装与使用
  - 零克隆安装
  - Windows PowerShell 原生安装
  - 前置要求、快速上手、工作流详解、技能清单、常见场景、FAQ 等

### 变更
- 与 `opt-prd-ux-code` 关联的流程技能统一迁移到 `opt/` 目录，并统一使用 `opt-` 前缀技能名。
- 全流程编排技能目录由 `opt：prd-ux-code/` 改为 `opt/prd-ux-code/`，技能名改为 `opt-prd-ux-code`（纯 ASCII，便于触发）。
- 根目录脚本迁移至 `cli/`：`das-ued-skills`、`das-ued-skills.ps1`、`install.sh`、`install.ps1`、`install-skills.sh`、`install-cli.sh`、`install-cli.ps1`。
- README 中所有安装命令路径更新为 `cli/` 或 `cli/xxx`。

