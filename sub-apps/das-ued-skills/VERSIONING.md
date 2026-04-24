# 版本策略

本文档定义 `das-ued-skills` 的发版与版本管理规则。

## 版本号规范

使用语义化版本（Semantic Versioning）：`MAJOR.MINOR.PATCH`

- **MAJOR（主版本）**：存在不兼容的 CLI/脚本行为变更。
- **MINOR（次版本）**：向后兼容的新功能。
- **PATCH（修订号）**：向后兼容的问题修复或文档修正。

示例：`1.4.2`

## 何时算 Breaking Change

以下情况按 **MAJOR** 处理：

- 删除或重命名 CLI 命令/子命令（如 `init`）。
- 删除或重命名稳定参数（如 `--ai`）。
- 修改默认安装目标行为，导致现有自动化脚本失效。
- 修改被下游脚本依赖解析的输出契约。

## 预发布版本（可选）

需要预发布时，使用 SemVer 后缀：

- `1.2.0-alpha.1`
- `1.2.0-beta.1`
- `1.2.0-rc.1`

## Changelog 维护规则

- `CHANGELOG.md` 是发布说明的唯一事实来源。
- 开发期间，所有对用户可见的变更先写入 `## [Unreleased]`。
- 发布时：
  1. 将 `Unreleased` 内容归档到具体版本小节；
  2. 写入发布日期（`YYYY-MM-DD`）；
  3. 重新创建空的 `Unreleased` 小节。

建议使用的小节：

- `新增`
- `变更`
- `修复`
- `移除`
- `弃用`
- `安全`

## 发版检查清单（轻量）

1. 确认 CLI 可用：
   - `./cli/das-ued-skills --help`
   - `./cli/das-ued-skills init --ai cursor --target-dir <tmp>`
2. 确认 Shell 安装脚本可用：
   - `./cli/install.sh --help`
3. 确认 PowerShell 脚本已同步更新：
   - `cli/das-ued-skills.ps1`
   - `cli/install.ps1`
4. 如命令或 URL 变更，更新 `README.md`。
5. 更新 `CHANGELOG.md`。
6. 打标签：`vX.Y.Z`。

## 版本号单一来源

当前版本号来源于 CLI 脚本中的版本字段：

- `cli/das-ued-skills`（`VERSION=...`）
- `cli/das-ued-skills.ps1`（`$Version=...`）

每次升级版本号时，必须在同一个提交中同时更新以上两处。

