---
name: opt-pro-ux-code-init
description: 项目初始化与深度项目记忆的唯一入口：扫描工程与设计上下文，结构化澄清后写入 project_description.md（及可选 docs/context）。当用户说 /opt-pro-ux-code-init、/init、@opt-pro-ux-code-init、初始化项目、项目 init、project init、bootstrap context、深度初始化、深度项目记忆、project context、deep init、或历史别名 /opt-teach-project_description、@opt-teach-project_description 时均调用本技能。执行时严格遵循下文 Phase 0～3；读取本文件优先顺序为仓库内 opt/opt-pro-ux-code-init/SKILL.md，其次 ~/.cursor/skills/opt-pro-ux-code-init/SKILL.md（或 ~/.claude / ~/.codex 等对应 skills 目录）。
user-invokable: true
layer: 1
---

# opt-pro-ux-code-init（项目初始化）

本技能是**项目上下文初始化的唯一规范入口**（含深度扫描、澄清与多文件沉淀）。

## 目标

建立可审计的项目记忆：设计规范、工程事实、协作约定与待确认项，供 `opt-prd-ux-code`、`opt-b-admin-pencil-design`、`opt-pencil-to-code` 等下游技能使用。

## 能力范围（随项目可深可浅）

- 扫描：从 README 到核心源码、配置、CI；并遵守 Phase 0 中项目级 Design Skill/Rules 优先
- 澄清：结构化提问，每轮问题数量受控
- 产出：至少更新 `project_description.md`；复杂项目可补充 `docs/context/*`
- 质量：结论带证据索引，区分事实 / 推断 / 待确认

## 执行流程

### Phase 0: 项目级 Skill/Rules 优先检查（必须先于代码扫描）

在任何代码扫描前，先检查并读取以下路径（存在即读）：

1. **项目 Skill 层**（优先）
   - 若项目存在 `.cursor/skills/design-system/skills/project-design-system.md`（索引）：
     - 读取索引，按「是否有项目覆盖」列静默读取对应子文件（`project-tokens.md`、`project-typography.md` 等）
     - 不存在时**静默跳过**，不提示、不触发任何操作
   - 若上述索引不存在，但存在 `.cursor/skills/design-system/`：读取 `SKILL.md` 与 `skills/` 子目录内其他设计规范文件。
   - 否则读取**全局** `~/.cursor/skills/design-system/`（若为 Claude：`~/.claude/skills/design-system/`）。
2. **模块级设计 Skill**（优先）
   - 若项目存在 `.cursor/skills/design-system/skills/*/SKILL.md`：读取之。
   - 否则读取**全局** `~/.cursor/skills/design-system/skills/*/SKILL.md`（若为 Claude：`~/.claude/skills/design-system/skills/*/SKILL.md`）。
3. **项目 Rule 层**（优先）
   - 若项目存在 `.cursor/rules/design-system/`：重点读取其中的 `overrides/tokens.md` 与 `additions/` 目录。
   - 否则读取**全局** `~/.cursor/rules/design-system/`（若为 Claude：`~/.claude/rules/design-system/`）。
4. **项目 pencil-token-refresh**（优先）
   - 若项目存在 `.cursor/rules/pencil-token-refresh.mdc`：存在时表示后续需要输出可被 Pencil Token 刷新规则读取的表格格式。
   - 否则读取**全局** `~/.cursor/rules/pencil-token-refresh.mdc`（若为 Claude：`~/.claude/rules/pencil-token-refresh.mdc`）。

从上述文件提取并记录（优先级高于代码推断）：
- 品牌主色与品牌派生色
- 圆角规范与布局覆盖值
- CSS 变量命名差异（项目特有命名）
- Pencil Token 注入格式约束

规则：
- 若项目级 Skill/Rules 有定义，代码扫描只做“补充事实”，不能覆盖这些值。
- 仅当上述路径都不存在时，才完全依赖代码推断。

### Phase 1: 全面扫描（必须）

在提问前，先进行广度 + 深度扫描，至少覆盖：

- 产品与目标：`README`、`docs`、路线图、需求文档
- 技术与架构：依赖、目录结构、关键入口、核心模块
- 开发流程：脚本、CI、测试、lint、构建与发布路径
- 协作约定：提交规范、分支策略、PR 规则、决策记录方式
- 历史记忆：已有上下文文档（如 `project_description.md`、`docs/context/*`）

对每条结论记录来源：
- 文件路径
- 简要依据（1 句话）

> 输出要求：区分“事实 / 推断 / 待确认”，不得把推断写成事实。
> 覆盖要求：若 Phase 0 已给出 Token/规范，Phase 1 禁止用代码中的近似值覆盖（例如 Ant Design Token 不能覆盖设计系统品牌色）。

### Phase 2: 结构化澄清（必须）

停止并通过 AskQuestion 与用户澄清（按运行环境使用可用提问工具），仅问扫描后仍不明确且影响决策的问题。

按主题提问：
1. 业务目标与优先级
2. 质量门槛与验收标准
3. 可改 / 不可改边界
4. 近期迭代节奏与风险点

提问策略：
- 先关键后次要
- 每轮不超过 5 个问题
- 优先多选项（减少用户负担）
- 能从代码推断出的内容不重复提问

### Phase 3: 记忆沉淀（必须）

产出长期记忆资产，至少更新 `project_description.md`；必要时新增或更新：
- `docs/context/architecture.md`
- `docs/context/workflow.md`
- `docs/context/constraints.md`

`project_description.md` 推荐结构：

```markdown
# Project Memory

## Executive Snapshot
- 项目一句话定位：
- 当前阶段：
- 近期里程碑：

## Architecture Baseline
- 核心模块：
- 关键依赖：
- 主要数据流：

## Delivery Workflow
- 开发流程：
- 测试/发布门槛：
- 常用命令：

## Collaboration Contract
- 代码约定：
- PR 约定：
- 决策记录方式：

## Risk & Constraints
- 技术风险：
- 业务风险：
- 明确限制：

## Open Questions
- ...

## Evidence Index
- 结论A -> 路径
- 结论B -> 路径

## Last Updated
- 日期：
- 来源：opt-pro-ux-code-init
```

当项目存在 `.pen` 文件，或检测到项目 rules 目录下的 `pencil-token-refresh.mdc`（Cursor/Claude 均为：`./.cursor/rules/pencil-token-refresh.mdc`），或全局 rules 目录下的 `pencil-token-refresh.mdc`（Cursor：`~/.cursor/rules/pencil-token-refresh.mdc`，Claude：`~/.claude/rules/pencil-token-refresh.mdc`）时，在上述结构基础上追加以下节：

```markdown
## 布局规范（Pencil 设计稿）
- 画布尺寸：
- 侧边栏宽度：
- 内容区规格：
- 来源：design-system skill / rules / 待确认

## Pencil Token Values
> 该节供 Pencil Token 刷新规则读取。列头必须为：| Pencil Variable | 值 | 来源 |
>
> ⚠️ **范围说明**：本节只记录**项目需要覆盖的变量子集**（品牌色、状态色、风险色、圆角、字体基准），不是 Pencil 组件库的完整变量清单。Pencil 文件中存在大量组件库基线变量，这是正常的，无需补录到本节。

### 品牌色
| Pencil Variable | 值 | 来源 |
|---|---|---|
| `color/brand/normal` | `#xxxxxx` | 项目覆盖 / 全局默认 |
| `color/brand/hover` | `#xxxxxx` | 项目覆盖 / 全局默认 |
| `color/brand/active` | `#xxxxxx` | 项目覆盖 / 全局默认 |
| `color/brand/light` | `#xxxxxx` | 项目覆盖 / 全局默认 |

### 状态色
| Pencil Variable | 值 | 来源 |
|---|---|---|
| `color/status/success` | `#xxxxxx` | 全局默认 / 项目覆盖 |
| `color/status/success-light` | `#xxxxxx` | 全局默认 / 项目覆盖 |
| `color/status/warning` | `#xxxxxx` | 全局默认 / 项目覆盖 |
| `color/status/warning-light` | `#xxxxxx` | 全局默认 / 项目覆盖 |
| `color/status/error` | `#xxxxxx` | 全局默认 / 项目覆盖 |
| `color/status/error-light` | `#xxxxxx` | 全局默认 / 项目覆盖 |

### 风险色（如项目使用）
> ⚠️ 风险色**不得**从状态色推断，必须从 `src/theme/theme.css` 调色板直接读取：
> - `color/risk/fall/*` → `--fall-60`（normal）、`--fall-10`（light）
> - `color/risk/high/*` → `--error-60`（normal）、`--error-10`（light）
> - `color/risk/medium/*` → `--warningm-60`（normal）、`--warningm-10`（light）
> - `color/risk/low/*` → `--warning-60`（normal）、`--warning-10`（light）
> - `color/risk/no/*` → `--gray-60`（normal）、`--gray-10`（light）

| Pencil Variable | 值 | 来源 |
|---|---|---|
| `color/risk/fall/normal` | `#xxxxxx` | theme.css --fall-60 |
| `color/risk/fall/light` | `#xxxxxx` | theme.css --fall-10 |
| `color/risk/high/normal` | `#xxxxxx` | theme.css --error-60 |
| `color/risk/high/light` | `#xxxxxx` | theme.css --error-10 |
| `color/risk/medium/normal` | `#xxxxxx` | theme.css --warningm-60 |
| `color/risk/medium/light` | `#xxxxxx` | theme.css --warningm-10 |
| `color/risk/low/normal` | `#xxxxxx` | theme.css --warning-60 |
| `color/risk/low/light` | `#xxxxxx` | theme.css --warning-10 |
| `color/risk/no/normal` | `#xxxxxx` | theme.css --gray-60 |
| `color/risk/no/light` | `#xxxxxx` | theme.css --gray-10 |

### 圆角
| Pencil Variable | 值 | 来源 |
|---|---|---|
| `radius/3xs` | `x` | 项目覆盖 / 全局默认 |
| `radius/xs` | `x` | 项目覆盖 / 全局默认 |
| `radius/lg` | `x` | 项目覆盖 / 全局默认 |

### 字体
> 从 `src/store/uedModule/theme/defaultConfig.ts`（或同目录配置）读取 `fontSize` 字段值（去掉 `px` 单位）填入 `font/size/base`。

| Pencil Variable | 值 | 来源 |
|---|---|---|
| `font/size/base` | `x` | defaultConfig.ts fontSize（数字，不含 px） |
```

格式约束：
- 列头必须保持 `| Pencil Variable | 值 | 来源 |`（不要替换为其他列名）。
- 所有颜色统一 hex（`#RRGGBB`）。
- 无法确认的值填“待确认”，并在 `Open Questions` 中列出。

### `project_description.md` 最小必填字段清单（Schema 提示）

为保证下游 skills（如 `opt-prd-ux-code`、`opt-pencil-to-code`、`opt-frontend-design`）稳定读取，`project_description.md` 至少包含以下字段：
下游读取契约：`## Project Paths`、`## Design Context`、`## Delivery Defaults` 这 3 个标题视为固定锚点，不应改名。

```markdown
# Project Memory

## Project Paths
- 项目根目录：<绝对路径或相对工作区路径>
- 路由注册文件：<如 src/router/index.ts 或 src/router/routes.ts>
- 页面输出目录：<如 src/views 或 src/pages>

## Design Context
- 品牌主色：<hex，如 #134bea>
- 功能色：
  - success: <hex>
  - warning: <hex>
  - danger: <hex>
  - info: <hex>

## Delivery Defaults
- 包管理器：<npm|pnpm|yarn>
- 启动命令：<如 pnpm dev>
- 构建命令：<如 pnpm build>
```

字段约束：
- 路径字段必须可定位到真实文件/目录；无法确认时标记“待确认”，不要编造。
- 颜色字段统一使用 hex（`#RRGGBB`），避免混用命名色与 RGB。
- 若当前项目不存在路由层，`路由注册文件` 写“无（不适用）”，并在 `Open Questions` 说明原因。
- 若任何必填字段缺失：先写入“待确认”，再通过 AskQuestion 向用户补齐；未确认前不得输出确定性结论。

## 完成标准

- 有“事实 / 推断 / 待确认”边界
- 核心结论可追溯到具体来源
- 产物可支持后续多轮会话复用
- 输出中包含“下一步建议”（可执行，最多 3 条）
- 若项目使用 Pencil：`project_description.md` 包含可被规则读取的 `Pencil Token Values` 节，且列头格式正确
