# das-ued-skills

面向 B 端后台的「用研 → PRD → 设计稿 → 设计验证 → Vue 3 代码」端到端 Skills 文档集合，适配 Cursor、Claude 等 AI 助手。

---

## 目录

- [简介](#简介)
- [前置要求](#前置要求)
- [一键安装](#一键安装)
- [快速上手](#快速上手)
- [工作流详解](#工作流详解)
- [技能清单](#技能清单)
- [目录结构](#目录结构)
- [常见场景](#常见场景)
- [常见问题](#常见问题)
- [版本与发布](#版本与发布)

---

## 简介

`das-ued-skills` 是一套结构化的 Skill 文档，用于在 AI 辅助设计/开发流程中，将「用户研究 → 需求文档 → Pencil 设计稿 → 设计验证 → Vue 3 前端代码」串联成可控、可追溯的工作流。每个阶段产出文件、遵循 Gate 门控，用户确认后才进入下一阶段。

### 适用场景

| 场景 | 推荐入口 |
|------|----------|
| 首次使用，建立项目设计规范 | `opt-pro-ux-code-init` 或 `/opt-pro-ux-code-init`（兼容 `/init`、历史别名 `opt-teach-project_description` 等） |
| 新产品从 0 到 1 做功能 | `opt-prd-ux-code`（全流程） |
| 已有 PRD，需要设计稿 | `opt-prd-ux-code`（从 Stage 3 起） |
| 已有 Pencil 设计，要转代码 | `opt-pencil-to-code` |
| 没有设计稿，直接产出前端 | `opt-frontend-design` |
| 设计稿完成后做可用性/合规检查 | `opt-design-validation` |
| 代码需要错误处理、i18n、边界加固 | `opt-harden` |

### 设计原则

- **文件优先**：每阶段写入 `docs/ux/{模块名}/` 下对应文件，可版本管理、可追溯
- **门控确认**：每 Stage 结束后输出 Handoff，用户明确回复「确认/继续」才进入下一 Stage
- **不凭空推断**：设计类 Skill 依赖 `project_description.md` 或 `opt-pro-ux-code-init` 建立上下文

### 版本与发布

- 变更记录：`CHANGELOG.md`
- 版本策略：`VERSIONING.md`

---

## 前置要求

| 依赖 | 说明 |
|------|------|
| Cursor / Claude 等 AI 助手 | 支持 Skill / Rules 机制 |
| [Pencil](https://pencil.evolus.vn/)（可选） | Stage 3 设计稿、Stage 4 有稿转代码时需要 |
| Vue 3 项目 | Stage 4 代码生成目标 |
| Git | 克隆本仓库需要 |
| PowerShell（Windows） / Bash（macOS/Linux） | 系统自带，无需额外依赖 |

---

## 一键安装

克隆本仓库后，在**仓库根目录**执行下面命令即可。

### macOS / Linux

```bash
./cli/install-skills.sh --ai cursor
```

### Windows

```powershell
powershell -File cli\install-skills.ps1 -ai cursor
```

或在 PowerShell 中直接运行：

```powershell
.\cli\install-skills.ps1 -ai cursor
```

将 `cursor` 换成下表中的任意助手标识；`all` 会一次性安装到多个常见助手目录。

### 自定义安装目录（可选）

**macOS / Linux**：

```bash
./cli/install-skills.sh --ai cursor --target-dir "/custom/path/to/skills"
```

**Windows**：

```powershell
powershell -File cli\install-skills.ps1 -ai cursor -targetDir "C:\custom\path\to\skills"
```

### `--ai` 与默认安装目录

| `--ai` | 安装目录 |
|--------|----------|
| `cursor` | `~/.cursor/skills` |
| `claude` | `~/.claude/skills` |
| `codex` | `~/.codex/skills` |
| `windsurf` | `~/.windsurf/skills` |
| `antigravity` | `~/.antigravity/skills` |
| `copilot` | `~/.copilot/skills` |
| `kiro` | `~/.kiro/skills` |
| `qoder` | `~/.qoder/skills` |
| `roocode` | `~/.roocode/skills` |
| `gemini` | `~/.gemini/skills` |
| `trae` | `~/.trae/skills` |
| `opencode` | `~/.opencode/skills` |
| `continue` | `~/.continue/skills` |
| `codebuddy` | `~/.codebuddy/skills` |
| `droid` | `~/.factory/skills` |
| `all` | 批量安装到 `cli/install-skills.sh` 中已列出的全部助手目录 |

示例：

```bash
# macOS/Linux
./cli/install-skills.sh --ai claude
./cli/install-skills.sh --ai codex
./cli/install-skills.sh --ai all

# Windows
powershell -File cli\install-skills.ps1 -ai claude
powershell -File cli\install-skills.ps1 -ai all
```

### 全局 Rules 同步

安装 skills 时会同步把仓库根目录 `rules/*.mdc` 复制到对应助手的**全局** rules 目录（Rules 会被各 `opt/**/SKILL.md` 用于校验/注入）。

常见路径：
- Cursor：`~/.cursor/rules`
- Claude：`~/.claude/rules`
- qoder：`~/.qoder/rules`
- trae：`~/.trae/rules`
- droid：`~/.factory/rules`

### 零克隆安装（无需 git clone）

如果不想克隆仓库，可以直接从网络安装：

**macOS / Linux**：

```bash
curl -fsSL http://gitlab.info.dbappsecurity.com.cn/ued6/das-ued-skills/-/raw/main/cli/install.sh | bash -s -- --ai cursor
```

**Windows**：

```powershell
powershell -Command "Invoke-WebRequest -Uri 'http://gitlab.info.dbappsecurity.com.cn/ued6/das-ued-skills/-/raw/main/cli/install.ps1' -OutFile '$env:TEMP\install.ps1'; powershell -File '$env:TEMP\install.ps1' -ai cursor"
```

### 复制 project 资产到目标项目根目录

将仓库根目录 `project/` 下的资产复制到你的目标项目根目录（也就是你后续放 `project_description.md`、`[组件库] das-component-vue.pen` 等文件的地方）：

**macOS / Linux**：

```bash
./cli/sync-project-assets.sh --project-root "/path/to/your-project"
```

**Windows**：

```powershell
powershell -File cli\sync-project-assets.ps1 -ProjectRoot "C:\path\to\your-project"
```

需要覆盖已存在文件就加 `-Force`。

---

## 快速上手

### 1. 安装 skills（见上文）

### 2. 触发技能

在 Cursor 中，可通过以下方式触发：

- 输入 `/opt-pro-ux-code-init`、`/init` 或 `@opt-pro-ux-code-init` 初始化项目、建立设计规范
- 输入 `@opt-prd-ux-code` 或 `/opt-prd-ux-code` 调用全流程编排
- 输入 `@opt-pencil-to-code` 或 `/opt-pencil-to-code` 调用 Pencil 转代码
- 在对话中提及「全流程」「从需求到代码」「端到端设计」等关键词，AI 会自动选用对应技能

### 3. 开始使用

直接调用全流程编排技能即可：

```opt-prd-ux-code```

AI 会根据你的需求自动选择合适的阶段和技能：
- 如果是全新产品，从 Stage 0 或 1 开始
- 如果已有 PRD，从 Stage 3（设计）开始
- 如果只需改 UI，从 Stage 3.5 或 4 开始

**灵活跳过**：在 AI 提问时，你可以主动说明跳过某些步骤（如"跳过用研，直接设计"），流程会自动调整。

---

## 工作流详解

### 全流程编排：`opt-prd-ux-code`

将六个阶段串联，每阶段结束后输出 **Handoff**，等待用户确认（**Gate**）后才推进。

```
Stage 0   前置研究（按需）    →  opt-discovery
Stage 1   用研叙事            →  opt-story-ia-flow-notes  → docs/ux/{模块名}/story-ia-flow.md
Stage 2   需求文档            →  opt-prd                  → docs/ux/{模块名}/prd.md
Stage 3   设计稿              →  opt-b-admin-pencil-design
          └ 后置可选           →  opt-extract（组件归档）
Stage 3.5 设计验证（推荐）    →  opt-design-validation    → docs/ux/{模块名}/heuristic-report.md
          ├ 默认：启发式评估 + 合规检查
          ├ 默认：预测性热图 + opt-critique（UX 有效性）
          └ 按需：opt-clarify、A/B 变体、可用性测试脚本
Stage 4   前端代码            →  opt-pencil-to-code（有设计稿）/ opt-frontend-design（无设计稿）
          ├ 内置后置           →  opt-harden（代码鲁棒性）
          └ 自动收尾           →  路由写入 + 启动 dev server + 输出访问 URL
```

### 语境自动推断

| 信号词 / 特征 | 判定语境 | 建议起始 Stage |
|---------------|----------|----------------|
| 「从 0 开始」/「新产品」/「没有 PRD」 | 全新产品 | Stage 0 或 1 |
| 「已有 PRD」/「已有设计」/「迭代」 | 功能迭代 | Stage 3 |
| 「只改 UI」/「视觉升级」 | 纯 UI 改版 | Stage 3 |
| 「已有 .pen 文件」 | 设计已完成 | Stage 3.5 或 4 |

### Handoff 与 Gate

每个 Stage 结束时输出：

- **文件产出**：写入 `docs/ux/{模块名}/` 下对应文件
- **Handoff 摘要**：关键结论、传递给下一阶段的上下文、待决事项

用户需回复「确认」「继续」「go」「下一步」等，AI 才会进入下一 Stage；若提出修改意见，则退回当前 Stage 修改。

---

## 技能清单

大部分技能以 `opt-` 前缀命名；**项目初始化唯一入口**为 `opt-pro-ux-code-init`（`/init`、`深度初始化` 及历史别名见该技能 description）。

### 流程编排

| 技能 | 说明 | 产出 |
|------|------|------|
| `opt-prd-ux-code` | 全流程编排，串联 Stage 0～4 | 按阶段产出 story-ia-flow、prd、design-checklist、heuristic-report、Vue 代码等 |

### 初始化

| 技能 | 说明 | 产出 |
|------|------|------|
| `opt-pro-ux-code-init` | **唯一**项目初始化与深度记忆：扫描、澄清、写入 `project_description.md`（及可选 `docs/context/*`）。触发：`/opt-pro-ux-code-init`、`/init`、`初始化项目`、`deep init` 及历史别名（见技能 description） | `project_description.md` 等 |

### 用研与需求

| 技能 | 说明 | 产出 |
|------|------|------|
| `opt-discovery` | 竞品分析、趋势、亲和图、用户画像、旅程图；投标/合规解析 | `competitive-analysis.md`、`personas.md`、`customer-journey-map.md` 等 |
| `opt-cybersecurity-competitive-research` | 网络安全领域竞品研究（可被 opt-discovery 调用） | `competitive-analysis.md` |
| `opt-story-ia-flow-notes` | 故事脚本、IA 图、用户流程图、设计说明 | `story-ia-flow.md` |
| `opt-prd` | PRD 完整稿（数据模型、状态机、权限、验收用例） | `prd.md` |

### 设计

| 技能 | 说明 | 产出 |
|------|------|------|
| `opt-b-admin-pencil-design` | B 端后台在 Pencil `.pen` 内的规范化设计 | `.pen` 画板、`design-checklist.md` |
| `opt-extract` | 将可复用组件/Token 沉淀到设计系统 | 组件库 `.pen` |

### 设计验证

| 技能 | 说明 | 产出 |
|------|------|------|
| `opt-design-validation` | 启发式评估、合规检查、预测性热图、A/B 变体 | `heuristic-report.md` |
| `opt-critique` | UX 有效性评估（AI slop 检测、可用性问题） | 报告节选 |
| `opt-clarify` | 界面文案、错误提示、微文案质量检查 | 报告节选 |

### 代码

| 技能 | 说明 | 产出 |
|------|------|------|
| `opt-pencil-to-code` | 将 Pencil 画板转为 Vue 3 代码 | `.vue` 组件、路由 |
| `opt-frontend-design` | 无设计稿时按设计原则生成前端 | `.vue` 组件 |
| `opt-harden` | 错误处理、i18n、溢出、边界、防抖等鲁棒性加固 | 修改后的代码 |

---

## 目录结构

```
das-ued-skills/
├── cli/                      # 安装与 CLI 脚本
│   ├── das-ued-skills        # macOS/Linux CLI 入口
│   ├── das-ued-skills.ps1    # Windows PowerShell CLI
│   ├── install-skills.sh     # macOS/Linux 安装 skills
│   ├── install-skills.ps1    # Windows 安装 skills (PowerShell)
│   ├── sync-project-assets.sh # macOS/Linux 同步项目资产
│   ├── sync-project-assets.ps1 # Windows 同步项目资产 (PowerShell)
│   ├── install.sh            # 零克隆安装脚本（可选）
│   └── install.ps1           # Windows 零克隆安装脚本
├── opt/                      # 流程相关技能（opt- 前缀）
│   ├── prd-ux-code/          # 全流程编排
│   ├── opt-pro-ux-code-init/     # 唯一项目初始化
│   ├── discovery/
│   ├── cybersecurity-competitive-research/
│   ├── story-ia-flow-notes/
│   ├── prd/
│   ├── b-admin-pencil-design/
│   ├── design-validation/
│   ├── critique/
│   ├── clarify/
│   ├── extract/
│   ├── pencil-to-code/
│   ├── frontend-design/
│   ├── harden/
│   └── env-assistant-terminal-setup/
├── rules/                    # 全局 Rules（.mdc）：安装时同步到各助手 rules 目录
├── project/                  # 项目级规则/资产（如组件库标准、Pencil 组件库稿）
├── CHANGELOG.md
├── VERSIONING.md
└── README.md
```

安装后，`~/.cursor/skills`（或对应助手目录）下会生成 `opt-prd-ux-code`、`opt-discovery` 等扁平目录，路径中的 `/` 会转换为 `-`。

---

## 常见场景

### 场景 1：新产品从 0 到 1

1. 运行 `opt-pro-ux-code-init`（或 `/init` 等别名）建立设计上下文
2. 运行 `opt-prd-ux-code`，按提示确认从 Stage 0 或 1 开始
3. 按阶段完成，每个 Gate 后回复「确认」

### 场景 2：已有 PRD，需要设计稿

1. 将 PRD 放在 `docs/ux/{模块名}/prd.md`
2. 运行 `opt-prd-ux-code`，说明「已有 PRD」，从 Stage 3 开始
3. 确认目标 `.pen` 文件路径

### 场景 3：已有 Pencil 设计，要出代码

1. 直接运行 `opt-pencil-to-code`
2. 或运行 `opt-prd-ux-code`，说明「已有 .pen」，从 Stage 3.5 或 4 开始

### 场景 4：没有设计稿，直接出前端

1. 运行 `opt-frontend-design`，描述需求与页面结构
2. 或在 `opt-prd-ux-code` 中说明「无设计稿」，会走 `opt-frontend-design` 路径

### 场景 5：设计改了，要同步回文档

在对话中说「同步设计到文档」「设计改了更新 PRD」「设计和文档对一下」，会触发 `opt-prd-ux-code` 内的「设计-文档差异检查」流程，无需走完整 Stage。

---

## 常见问题

### 安装后找不到技能？

确认安装目录与助手配置一致：Cursor 使用 `~/.cursor/skills`，Claude 使用 `~/.claude/skills`。部分助手需要在设置中开启「自定义 Skills」或指定 skills 目录。

### 设计类技能让我先建 project_description？

设计类 Skill 不允许凭空推断品牌色和审美，需先建立项目设计上下文。可运行 `opt-pro-ux-code-init`（或 `/init` 等）自动采集并生成 `project_description.md`，也可手动创建该文件。选择跳过时，将使用 `opt-b-admin-pencil-design` 默认 Token。

### 全流程会自动推进到下一 Stage 吗？

不会。每个 Stage 结束后必须输出 Handoff 并停止，用户回复「确认」「继续」等才会进入下一 Stage，避免未经确认的自动推进。

### 可以只运行某一个 Stage 吗？

可以。直接调用对应技能（如 `opt-prd`、`opt-design-validation`），或运行 `opt-prd-ux-code` 时说明起始 Stage 和已有产物路径，流程会跳过前面的 Stage。

### pencil-heatmap 是什么？

预测性热图分析，由 `opt-design-validation` 编排，用于在 `.pen` 中生成注意力分布热图画板。若未单独安装 `pencil-heatmap` 技能，该子步骤可能不可用，但不影响设计验证其他部分。

---

## 版本与发布

- **变更记录**：`CHANGELOG.md`
- **版本策略**：`VERSIONING.md`（语义化版本、Breaking Change 定义、发版检查清单）

