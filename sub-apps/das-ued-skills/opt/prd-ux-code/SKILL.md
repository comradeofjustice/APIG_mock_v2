---
name: opt-prd-ux-code
description: 全流程编排 Skill，将前置研究→用研叙事→需求文档→Pencil 设计稿→设计验证→Vue 3 前端代码六个阶段串联，带阶段门控（每阶段用户确认后才推进）。每阶段调用对应 Sub-skill。当用户说"全流程"、"从需求到代码"、"端到端设计"、"用研到开发"、"从 0 到 1 做一个功能"、"串联全链路"、"/opt-prd-ux-code"、"@opt-prd-ux-code"时使用。当用户说"同步设计到文档"、"设计改了更新文档"、"把设计稿的变更写回 PRD"、"设计和文档对一下"时，直接执行「设计-文档差异检查」流程（Stage 3.5 中的差异检查节），不需要走完整的 Stage 流程。当用户说"自动检测变更"、"检查代码和设计稿是否一致"、"一键同步"、"代码改了自动同步"、"检查有没有遗漏回写"时，直接执行 Stage 4「Gate 4 后置·变更检测」节，扫描 git diff 并对比 Code↔Frame 映射后提示用户选择同步目标，不需要走完整的 Stage 流程。
layer: 1
---

# opt-prd-ux-code 全流程编排

---

## 【全流程改动设计协议】（修改本 Skill 或新增与全流程相关的 Sub-skill 前必读）

每次对本 Skill 或其关联 Sub-skill 做改动之前，必须完成以下四项分析，**不得跳过**：

**Q1：信息依赖分析（新功能需要什么输入）**
```
列出新功能/改动所需的全部输入信息
→ 逐项确认：该信息由哪个 Stage 产生？是否已持久化到 session-state.md 或专用文件？
→ 未持久化 → 必须在产生该信息的 Stage 加"记录步骤"，不得在下游靠对话历史推断
```

**Q2：信息产出分析（新功能产生什么输出，谁会消费）**
```
列出新功能产生的所有输出信息
→ 逐项确认：哪些下游 Stage 或 Sub-skill 会用到？
→ 有下游消费者 → 在本 Stage 完成时写入 session-state.md 或专用文件
→ 只写到对话上下文 = 没有记录（对话历史不可靠）
```

**Q3：模式边界确认（功能是否需要支持独立使用）**
```
新功能/新 skill 是否会在全流程管线之外被单独调用？
→ 是 → 必须加"模式检测"节：
     管线模式（session-state.md 存在且含对应数据）→ 读文件，不询问用户
     独立使用模式（数据缺失）→ AskQuestion 收集必要信息
→ 否 → 在 Skill 头部明确标注"仅在全流程内调用，不支持独立使用"
```

**Q4：改动范围完整性确认**
```
列出本次改动涉及的全部文件
→ 若改动仅在一个文件但功能跨越多个 Stage → 说明分析可能不完整，重新执行 Q1/Q2
→ 常见遗漏：上游 Stage 忘记加"记录步骤"；下游 skill 忘记加"模式检测"
```

> **历史教训**：code-to-pencil 最初只在 skill 内部加询问逻辑，后来发现 Stage 3 的 Token Bridge 和 Stage 4 的 Code↔Frame 映射本该在产生时就记录，导致管线内调用也需要询问用户。遵循此协议可从源头避免此类问题。

---

## 阶段总览

```
[初始化]  opt-pro-ux-code-init（必须执行，不可跳过）

Stage 0   前置研究（按需）    →  discovery
Stage 1   用研叙事            →  story-ia-flow-notes      → docs/ux/{模块名}/story-ia-flow.md
Stage 2   需求文档            →  prd                      → docs/ux/{模块名}/prd.md
Stage 3   设计稿              →  b-admin-pencil-design
          └ 后置可选           →  extract（组件归档）
Stage 3.5 设计验证（推荐）    →  design-validation        → docs/ux/{模块名}/heuristic-report.md
          ├ 默认：启发式评估 + 合规检查（compliance-checklist.md）
          ├ 默认：预测性热图分析 → pencil-heatmap（.pen 热图画板）
          ├ 默认：critique（UX 有效性）
          ├ 按需：clarify（文案质量）
          └ 按需：A/B 变体 / 可用性测试脚本
Stage 4   前端代码            →  先读 b-admin-design-system（Token/组件规范）
                              →  pencil-to-code（有设计稿）
                              →  frontend-design（无设计稿备用路径）
          ├ 内置后置           →  harden（代码鲁棒性）
          └ 自动收尾           →  路由写入（StrReplace） + 启动 dev server + 输出访问 URL
```

每个 Stage 结束后输出结构化 **Handoff**（文件 + 对话摘要），等待用户确认（Gate）后才进入下一 Stage。

---

## 启动流程

收到指令后，顺序完成以下三步：

### Step A：项目上下文初始化检测（必须执行，不可跳过）

检查 `project_description.md` 是否存在于当前工作目录：

- **存在** → 读取其中的品牌色、设计哲学、项目约束，作为 Stage 3 的设计输入，继续执行 Step B
- **不存在** → **强制停止**，读取 `~/.cursor/skills/opt-pro-ux-code-init/SKILL.md`（或仓库内 `opt/opt-pro-ux-code-init/SKILL.md`）并按其规范执行，收集品牌色和设计规范后生成 `project_description.md`，**完成后才能继续 Step B**
  > 此步骤不接受跳过。无论用户是否已知语境、无论功能迭代还是全新产品，均须完成初始化后方可推进。
- **需求规范上下文**：额外检查项目 rules 目录下的 `requirements/`（即当前项目根目录 `./.cursor/rules/requirements/`；若无则 Cursor/Claude 会退回全局）是否存在。
  - 若项目存在 → Stage 1 / Stage 2 自动读取
  - 若项目不存在 → 再检查全局 rules 目录下的 `requirements/`（Cursor：`~/.cursor/rules/requirements/`，Claude：`~/.claude/rules/requirements/`）。存在 → Stage 1 / Stage 2 自动读取；不存在 → 使用全局模板，无需额外操作。

**【Pencil 项目后置检查】** `project_description.md` 生成或读取后，若项目目录下存在 `.pen` 文件，或检测到项目 rules 目录下的 `pencil-token-refresh.mdc`（`./.cursor/rules/pencil-token-refresh.mdc`），或检测到全局 rules 目录下的 `pencil-token-refresh.mdc`（Cursor：`~/.cursor/rules/pencil-token-refresh.mdc`，Claude：`~/.claude/rules/pencil-token-refresh.mdc`），额外执行：

1. 检查 `project_description.md` 是否包含 `## Pencil Token Values` 节
2. 检查该节内是否存在 `| Pencil Variable | 值 |` 列头的注入表
3. **若缺失或格式不符** → 停止，提示用户：
   > "`project_description.md` 缺少 Pencil Token Values 节（或格式不符：需要 `| Pencil Variable | 值 |` 列头，非 `| 用途 | Hex |` 描述表）。请重新运行 `opt-pro-ux-code-init` 补充该节，或手动参照模板添加后再继续。"
4. **若存在且格式正确** → 继续 Step B（该节将在 Stage 3 设计时被 `pencil-token-refresh.mdc` 规则 A 自动读取注入）

### Step B：语境检测（自动推断 + Stage 0 按需询问）

**【Step B 前置 — 参考图检测（有图时优先执行，无图跳过直接看信号词表）】**

若用户输入中包含图片附件（截图、线框图、竞品参考图等）：

```
1. 读取 ~/.cursor/skills/parse-reference-image/SKILL.md，调用 parse-reference-image 解析图片
2. 将解析结果（页面结构 + 组件列表 + 字段 + 操作入口）保存到对话上下文
3. 调用 AskQuestion 询问处理路径：
   AskQuestion(
     title: "参考图处理方式",
     prompt: "检测到参考图附件，请选择处理路径：",
     options: [
       { id: "prd",    label: "图转 PRD 再设计（推荐）— 以解析结果为输入生成需求文档，完整走 Stage 2 → Stage 3" },
       { id: "design", label: "直接生成 Pencil 设计稿 — 跳过 PRD，以解析结果直接进入 Stage 3，设计系统覆盖" },
       { id: "1:1",    label: "1:1 还原为 Pencil 稿 — 跳过 PRD，视觉结构最大程度复原（不受设计系统 Token 约束）" }
     ]
   )
4. 将选择和解析结果记录到待生成的 session-state.md（Step C 写入时带入）：
   §参考图处理方式: prd / design / 1:1
   §参考图解析结果: {解析输出内容}
5. 按选择调整语境（覆盖下方信号词表推断）：
   选 "prd"    → 语境 = 参考图驱动·全流程，Stage 2 必需（以解析结果为功能需求输入）
   选 "design" → 语境 = 参考图驱动·跳 PRD，Stage 0-2 跳过，Stage 3 以解析结果为设计输入
   选 "1:1"    → 语境 = 1:1 参考图还原，Stage 0-2 跳过，Stage 3 Token 注入跳过
```

| 信号词 / 特征 | 判定语境 | Stage 0 | Stage 1 | Stage 2 | Stage 3 | Stage 3.5 | Stage 4 |
|---|---|---|---|---|---|---|---|
| "从 0 开始" / "新产品" / "没有 PRD" | 全新产品 | **询问** | **可选** | 必需 | 必需 | 必需 | 必需 |
| "重构" / "整体重做" / "架构调整" | 重构 | **询问** | **可选** | 必需 | 必需 | 必需 | 必需 |
| "已有 PRD" / "已有设计" / "迭代" | 功能迭代 | 跳过 | 跳过 | 跳过¹ | 必需 | 必需 | 必需 |
| "只改 UI" / "视觉升级" | 纯 UI 改版 | 跳过 | 跳过 | 跳过 | 必需 | 必需 | 必需 |
| "已有 .pen 文件" | 设计已完成 | 跳过 | 跳过 | 跳过 | 跳过 | 必需 | 必需 |

> ¹ 迭代场景：已有 PRD 文件则跳过，只有口头描述则仍需生成。

**Stage 0 询问规则**（仅在语境为「全新产品」或「重构」时执行，其余语境自动跳过）：

```
AskQuestion(
  title: "前置研究（Stage 0）",
  prompt: "是否需要执行前置研究？包含竞品分析、用户画像、旅程图、投标/合规分析等子工具，适合全新领域或架构重做时补充背景认知。",
  options: [
    { id: "yes", label: "是，执行 Stage 0 前置研究" },
    { id: "no",  label: "否，跳过" }
  ]
)
```

- 用户选 **"是"** → Stage 0 纳入执行计划
- 用户选 **"否"** → Stage 0 跳过，继续 Step C

**Stage 0 额外触发条件**（任意语境下，用户主动提及以下关键词时也会触发）：
- 用户提到"竞品分析"、"用户画像"、"旅程图"
- 用户表示"不确定用户是谁"或"不了解这个领域"
- 用户提到"投标"、"招标"、"参数分析"、"需求对比"、"评分项" → 触发子工具七（投标参数分析）
- 用户提到"合规"、"等保"、"GDPR"、"ISO"、"SOC 2"、"合规要求" → 触发子工具八（合规要求分析）
- 用户要求"真实竞品资料"、"竞品视频"、"设计参考链接" → 触发子工具六（深度竞品采集）

**【非标准文档检测】（Step B 结束、Step C 之前，指令中有文件引用时执行）**

若用户指令中引用了文档（`@路径.md`、文件路径、粘贴内容等），且该文档将被用作 PRD 的来源或跳阶依据，执行以下检测：

```
1. Read 用户提供的文档
2. 扫描以下关键节：
   - §4.2 页面清单（含「页面名称 / 路由 / 类型」列头）
   - 状态机表（含「状态」「流转条件」等关键词）
   - 验收用例（含「验收」「测试场景」「AC」等关键词）
3. 判定结果：
   A. 三项均有 → 判定为"标准 PRD"，Stage 2 跳过，直接使用该文档
   B. 有 §4.2 但缺状态机/验收用例 → 判定为"部分 PRD"，进入询问（见下）
   C. 缺 §4.2 页面清单 → 判定为"非结构化文档"，强制执行 Stage 2（阻断告知）：
      "您提供的文档缺少 §4.2 页面清单，Stage 3 设计阶段无法自动生成设计清单。
       将以此文档为输入执行 Stage 2，补全标准 PRD 结构后再继续。"

4. "部分 PRD"时调用 AskQuestion：
   AskQuestion(
     prompt: "您提供的文档已包含页面清单，但缺少 [状态机/验收用例] 等内容。是否执行 Stage 2 将其补全为标准格式？",
     options: [
       { id: "run_stage2",  label: "是，基于此文档补全 PRD（推荐，确保设计和代码阶段有完整规范）" },
       { id: "skip_stage2", label: "否，直接进入下一阶段（缺少部分规范，风险自担）" }
     ]
   )
   - 用户选"补全" → 将该文档路径传给 Stage 2 作为输入，Stage 2 Read 此文档后补全缺失节
   - 用户选"跳过" → 记录至 session-state.md「已知问题」：⚠️ 使用部分 PRD，缺少状态机/验收用例

5. 非标准文档检测结果写入 Step C 的「已有产物」说明，供 session-state.md 使用
```

### Step C：确认三件事（一次询问）

1. **目标模块名**（如"剧本管理"）→ 用于文件路径 `docs/ux/{模块名}/`
2. **起始 Stage**（由语境检测推断，用户可调整）
3. **已有产物路径**（PRD 文件、.pen 文件等）→ 决定跳阶

若语境为全新产品，Step C 中以此规则处理 Stage 1：
> **Stage 1 默认跳过**：IA 图和用户流程图将直接写入 PRD §4.0-§4.1，无需单独叙事稿。
> 仅在以下情况才询问是否执行 Stage 1：
> - 用户提到"需要汇报材料"、"评审稿"、"故事脚本"、"对外传达"
> - 用户明确说"先出叙事"
>
> 若触发上述条件，使用 AskQuestion 询问：
> - "执行 Stage 1（故事脚本 + IA + 流程图 → 独立文件），再进 Stage 2"
> - "跳过 Stage 1（默认），IA 图和流程图直接写入 PRD"

告知用户将执行的 Stage 列表和跳过的 Stage，征得确认后开始执行。

**【Step C 完成后 — 模块级文件检测（权威覆盖 Step B 信号词判断）】**

模块名确认后、session-state.md 写入前，执行文件探测，以模块级文件存在性为权威：

```
1. 从 project_description.md 推断 src 根目录（通常为 src/views/）
2. 执行三项 Shell 探测：
   Shell: ls src/views/{模块名}/ 2>/dev/null
   Shell: ls docs/ux/{模块名}/ 2>/dev/null
   Shell: ls *.pen 2>/dev/null | grep {模块名}
3. 判定逻辑（无论 Step B 结果，以此为准）：
   三者均不存在 → 「模块从 0 到 1」
     - 即使项目整体属于"功能迭代"，该模块仍视为全新
     - 强制重新评估 Stage 起点：至少从 Stage 2 开始（PRD）
     - 在 AskQuestion 中更新"起始 Stage"推荐值，说明原因：
       "检测到 {模块名} 无任何相关文件，建议从 Stage 2 开始"
   任意存在 → 「模块迭代」，维持 Step B 推断结果
4. 将判定结果写入 session-state.md 执行计划节：
   - 情景类型: 模块从 0 到 1（文件检测）/ 模块迭代（文件检测）
   - 模块文件检测: {检测到的路径列表，或"均不存在"}
```

**【Step C 完成后 — 必须写入 session-state.md】**

用户确认执行计划后，立即写入 `docs/ux/{模块名}/session-state.md`（若目录不存在则先 `mkdir -p`）：

```markdown
# {模块名} 流程状态
最后更新: {YYYY-MM-DD HH:mm}

## 执行计划（入口路由生成）
- 起始 Stage: {N}
- 跳过: {Stage 列表，若无则填"无"}
- 原因: {检测到已有 PRD / 全新产品 / 等}
- 已有产物:
  - {文件路径列表}
- 设计系统: {.cursor/skills/design-system/skills/project-design-system.md 存在✅ / 不存在⚠️}

## 已完成
（Stage 完成后追加）

## 进行中
- [ ] Stage {N} — 待开始

## 待完成
- [ ] Stage {N+1}
- [ ] Stage {N+2}
...（按执行计划填写）

## 已知问题
（各 Stage 检查发现问题时追加）
```

> **每个 Gate 通过后，必须用 StrReplace 更新 session-state.md**：
> - 将「进行中」对应条目移至「已完成」，填写完成时间和产物文件名
> - 将下一 Stage 写入「进行中」
> - 若 audit/质检发现 Critical 或 High 问题，追加到「已知问题」节
>
> **每个 Stage 开始前，先 Read session-state.md**，从文件获取当前状态，不依赖对话历史推断。

> **版本快照（每个 Gate 通过后必须执行）**：
> 1. 确认 `docs/ux/{模块名}/versions/` 目录存在，不存在则 Shell `mkdir -p` 创建
> 2. 对本 Stage 核心产出文件执行快照（Shell cp 命令）：
>    - Gate 2 通过 → `cp docs/ux/{模块名}/prd.md docs/ux/{模块名}/versions/s2-prd-{YYYYMMDD}.md`
>    - Gate 3 通过 → `cp docs/ux/{模块名}/design-checklist.md docs/ux/{模块名}/versions/s3-checklist-{YYYYMMDD}.md`
>    - Gate 3.5 通过 → `cp docs/ux/{模块名}/heuristic-report.md docs/ux/{模块名}/versions/s3.5-report-{YYYYMMDD}.md`
>    - Gate 4 通过 → 将 `src/views/{模块名}/` 文件列表写入 `docs/ux/{模块名}/versions/s4-files-{YYYYMMDD}.md`
> 3. 在 session-state.md 的「已完成」条目末尾追加快照路径，格式：`（版本快照：versions/s{N}-{文件}-{YYYYMMDD}.md）`
> 4. 若模块目录或产出文件不存在，跳过快照但在 session-state.md 中注明原因

> **全局执行规则（必须遵守）**
> - 每个 Stage 是独立的工作单元，**完成即停，不得自动推进到下一 Stage**
> - 即使所有 Gate 检查项全部通过，也必须输出 Handoff 后停止等待
> - 用户回复"确认" / "继续" / "go" / "proceed" / "下一步" / "下一阶段" → 进入下一 Stage
> - 用户给出修改意见 → 退回当前 Stage 修改，修改完成后重新输出 Gate Handoff，再次等待
> - **违反此规则视为严重执行错误**

---

## Stage 0 — 前置研究（按需）

**触发条件**：Step B 询问中用户选择"是"（仅在全新产品 / 重构语境下询问），或用户在任意语境下主动提及竞品分析、旅程图、投标、合规等关键词。

**读取**: `~/.cursor/skills/opt-discovery/SKILL.md`，按其规范执行。

**子工具（A/B/C 三类，按数据前提独立触发，可部分执行）**:

*A 类 — 竞品分析类（按数据前提触发）*
- 一、竞品分析（需要竞品名称；**默认委托 `opt-cybersecurity-competitive-research` 进行真实爬取**（官网 + 视频 + 设计平台），网络受限或用户要求快速时降级为 AI 知识路径）
- 二、趋势分析（新兴领域 / 技术转型，追加写入 competitive-analysis.md）

*B 类 — 文档解析类（需用户提供文档）*
- 三、投标参数分析（用户提供投标文档时；解析需求条目 → 比对 project_description.md + 已有 PRD → 输出差距清单与优先级建议）
- 四、合规要求分析（用户提供或说明合规标准时；逐条对标 → 输出合规缺口与 Stage 2 PRD 输入建议）

*C 类 — 洞察研究类（需用户数据或明确场景）*
- 五、亲和图（需要原始访谈/反馈数据）
- 六、用户画像（角色不明确时）
- 七、用户旅程图（路径跨越系统边界时）

**产出（写入文件）**:
- `docs/ux/{模块名}/competitive-analysis.md`（A 类，含趋势分析节，若执行）
- `docs/ux/{模块名}/tender-analysis.md`（B 类，若执行）
- `docs/ux/{模块名}/compliance-gap-analysis.md`（B 类，若执行）
- `docs/ux/{模块名}/affinity-diagram.md`（C 类，若执行）
- `docs/ux/{模块名}/personas.md`（C 类，若执行）
- `docs/ux/{模块名}/customer-journey-map.md`（C 类，若执行）

**Gate 0 检查**:
- [ ] 已执行的子工具都有文件产出
- [ ] 跳过的子工具有明确的"跳过原因"说明
- [ ] Handoff 关键结论能直接作为 Stage 1 输入

**【问题修复时机确认 — Gate 0】**（Gate 检查中发现 P1/P2 问题时触发）

若发现研究结论存在 P1/P2 级疑点（如竞品数据不完整、用户画像假设不充分等），调用 AskQuestion：
```
AskQuestion(
  prompt: "以下研究结论存在不完整项，请选择在当前阶段补充（否则推迟至后续阶段参考）：",
  allow_multiple: true,
  options: [每个 P1/P2 疑点一个 option，含描述和推荐处理阶段]
)
```
- 用户勾选 → 当前补充后重新输出 Gate 0 Handoff
- 用户未勾选 → 写入 session-state.md「已知问题」：`⚠️ [Stage 0] {问题描述}（已推迟至后续阶段参考）`

> **[GATE 0 — 停止]** 输出 Handoff 后等待用户确认，不得自动进入 Stage 1。

**Handoff → Stage 1**: 角色 + 核心痛点 + 竞品空白 + 优先场景 + 投标缺失项（若执行）+ 合规差距（若执行）

---

## Stage 1 — 用研叙事

**默认跳过**。仅在用户明确需要叙事材料（汇报、评审、对外传达）时执行。跳过时，Stage 2 将在 PRD 的 §4.0-§4.1 内嵌 IA 图和用户流程图，覆盖相同内容。

**读取**: `~/.cursor/skills/story-ia-flow-notes/SKILL.md`，按其规范执行。

**输入**: 模块名 + 用户目标描述（+ Stage 0 Handoff，若有）

**产出（写入文件）**:
- 故事脚本、IA 图、用户流程图、设计说明 → `docs/ux/{模块名}/story-ia-flow.md`

**Gate 1 检查**:
- [ ] 主角色和核心场景清晰
- [ ] IA 层级 ≤ 3 层
- [ ] 流程图覆盖主路径 + ≥ 1 个异常路径
- [ ] 文件已成功写入

**【质检三关 — Gate 1】**

**第1关（自动校验，必须通过）**：
- Read `docs/ux/{模块名}/story-ia-flow.md` 验证文件存在且非空
- 扫描文件中 `TODO` / `待确认` 数量，数量 > 0 则在 Handoff 中列出，不阻断但提示

**第2关（交叉验证）**：
- 验证 IA 层级：从文件中提取 Mermaid 图，确认节点深度 ≤ 3
- 验证流程图：确认包含至少 1 个 `异常` / `失败` / `错误` 分支
- 结果写入 Handoff 摘要

**【问题修复时机确认 — Gate 1】**（Gate 检查中发现 P1/P2 问题时触发）

若发现叙事/IA 存在 P1/P2 问题（如 IA 层级稍深、某分支流程不完整等），调用 AskQuestion：
```
AskQuestion(
  prompt: "以下 P1/P2 问题，请选择在当前阶段修复（否则推迟至 Stage 2 PRD 阶段处理）：",
  allow_multiple: true,
  options: [每个 P1/P2 问题一个 option，含描述和推荐修复阶段]
)
```
- 用户勾选 → 修复后重新执行 Gate 1 检查
- 用户未勾选 → 写入 session-state.md「已知问题」：`⚠️ [Stage 1] {问题描述}（已推迟至 Stage 2 处理）`

> **[GATE 1 — 停止]** 输出 Handoff 后等待用户确认，不得自动进入 Stage 2。

**Handoff → Stage 2**: 核心场景摘要 + 功能点清单（对话摘要，完整内容见文件）

---

## Stage 2 — 需求文档

**读取**: `~/.cursor/skills/opt-prd/SKILL.md`，按其规范执行。

**输入**: Stage 1 Handoff（核心场景 + 功能点）
> **[文件优先]** 进入本 Stage 前，必须用 Read 工具重新读取 `docs/ux/{模块名}/story-ia-flow.md`，以文件内容为准，忽略对话历史中的缓存内容。若文件不存在，停止并提示用户检查路径。

**产出（写入文件）**:
- PRD 完整稿 → `docs/ux/{模块名}/prd.md`
  - 包含：背景/目标、数据模型、状态机、权限、异常边界、验收用例、决策点

**Gate 2 检查**:
- [ ] 数据模型字段与 Stage 1 IA 对齐
- [ ] 状态机覆盖所有状态转换
- [ ] 高风险操作有前置条件约束
- [ ] 需求匹配度自检已执行，无未覆盖需求点
- [ ] 文件已成功写入

**【质检三关 — Gate 2】**

**第1关（自动校验，必须通过）**：
- Read `docs/ux/{模块名}/prd.md` 验证文件存在且非空
- 验证 §4.2「页面清单」章节存在（PRD 缺此章节则阻断，提示补全）
- 扫描文件中 `TODO` / `待确认` 数量，数量 > 3 则在 Handoff 中列出（数量 ≤ 3 不阻断，仅提示）

**第2关（交叉验证）**：
- PRD 内部一致性扫描：对比 §4.2 页面清单与 §4.3/§6.x/§9.x/§11/§12，检查是否存在「孤立引用」（某章节描述的页面不在 §4.2 中）
- 若发现孤立引用，列出所有不一致项写入 Handoff，进入 Stage 3 前须由用户确认处理方式

**【问题修复时机确认 — Gate 2】**（Gate 检查中发现 P1/P2 问题时触发）

若 PRD 存在 P1/P2 问题（如某状态转换描述模糊、验收用例覆盖不足等），调用 AskQuestion：
```
AskQuestion(
  prompt: "以下 P1/P2 问题，请选择在当前阶段修复（否则推迟至 Stage 3 设计阶段处理）：",
  allow_multiple: true,
  options: [每个 P1/P2 问题一个 option，含描述和推荐处理阶段]
)
```
- 用户勾选 → 修复后重新执行 Gate 2 检查
- 用户未勾选 → 写入 session-state.md「已知问题」：`⚠️ [Stage 2] {问题描述}（已推迟至 Stage 3 设计时澄清）`

> **[GATE 2 — 停止]** 输出 Handoff 后等待用户确认，不得自动进入 Stage 3。

**Handoff → Stage 3**: 数据模型（字段名/类型/枚举值）+ 状态机关键状态（对话摘要）

---

## Stage 3 — 设计稿

**读取**: `~/.cursor/skills/opt-b-admin-pencil-design/SKILL.md`，按其规范执行。

**输入**: Stage 2 Handoff（数据模型 + 状态机）+ `project_description.md`（若存在）
         + `.cursor/skills/design-system/skills/project-design-system.md`（若存在）
           → 读取索引，读所有「✅ 有」子文件作为设计约束：
             - `project-layout.md` → 画布尺寸 / 侧边栏宽 / 顶栏高
             - `project-patterns.md` → 导航结构 / 领域专属模式
             - `project-typography.md` → 字号基准
           （Token 注入由 `pencil-token-refresh.mdc` 自动处理，此处只读设计约束）

**执行顺序**:
-1. **【架构约束·设计系统检查】** 检查 `.cursor/skills/design-system/skills/project-design-system.md` 是否存在：

   - **存在** → 读取索引，按「读取协议」加载所有「✅ 有」子文件，继续执行 Step 0
   - **不存在** → **必须执行 AskQuestion**，不得静默降级：

     ```
     AskQuestion(
       prompt: "检测到项目尚未创建设计系统文件（.cursor/skills/design-system/skills/project-design-system.md 不存在）。缺少 Token 约束层将导致设计稿与代码 Token 不一致风险。",
       options: [
         { id: "create-ds", label: "先运行 create-project-design-system 建立 Token 约束层（推荐）" },
         { id: "skip-ds",   label: "跳过，使用 project_description.md 降级路径（Token 一致性风险自担）" }
       ]
     )
     ```

     - 用户选 **create-ds** → 读取 `~/.cursor/skills/create-project-design-system/SKILL.md` 并执行，完成后再继续 Step 0
     - 用户选 **skip-ds** → 在 `docs/ux/{模块名}/session-state.md` 的「已知问题」节追加一条 `⚠️ Stage 3 跳过设计系统，使用降级路径`，继续 Step 0

0. **【阻断·文件优先】** 用 Read 工具读取 `docs/ux/{模块名}/prd.md`，以磁盘文件为唯一信源，忽略对话历史缓存内容。文件不存在则停止并提示用户检查路径。
   > ⚠️ `design-checklist.md` 必须在本步完成后才能写入，**禁止在重读 PRD 之前创建 checklist**。

   **读取后执行 PRD 内部一致性扫描**：对比 §4.2 页面清单与 §4.3/§6.x/§9.x/§11/§12，检查是否存在"孤立引用"（即某章节仍描述 §4.2 中已不存在的页面）。

   - **若无不一致** → 直接继续 Step 1，无需任何提示。
   - **若检测到不一致** → 对每个孤立页面调用 `AskQuestion` 确认用户意图，**不得自动级联**：
     ```
     AskQuestion(
       prompt: "检测到「{页面名}」已从 §4.2 页面清单中移除，但 §4.3/§6.x 等章节仍有相关描述。请确认处理方式：",
       options: [
         { id: "cascade", label: "是，已确认删除，同步清理所有相关章节" },
         { id: "restore", label: "误删，恢复 §4.2 中的该页面条目，保持其他章节不变" }
       ]
     )
     ```
     - 用户选 **cascade** → 用 StrReplace 从 §4.3/§6.x/§9.x/§11/§12 中移除该页面的相关描述，再继续 Step 1
     - 用户选 **restore** → 用 StrReplace 将该页面条目补回 §4.2，保持其余章节不变，再继续 Step 1
1. 执行「目标文件确认」（见 b-admin-pencil-design/SKILL.md）：
   - Step C 已收集的模块名作为副本文件名（`{模块名}.pen`）
   - Shell `cp "[组件库] das-component-vue.pen" "{模块名}.pen"` 创建设计副本（或询问用户使用已有文件）
   - `open_document("{模块名}.pen")` 打开副本
   - `get_editor_state` 确认当前活跃文件为副本
2. `get_variables` → 检查 Design Token（若有 `project_description.md`，用其品牌色覆盖默认值）
3. 若 Token 未初始化 → `set_variables` 先建
4. **【⛔️ 阻断门控·调用子 Skill 进行实际设计前必须完成】解析 PRD 页面清单，生成设计任务 Checklist 并持久化**：
   - 从步骤 0 读取的 `prd.md` §4.2「页面清单」章节提取所有页面/弹窗条目（以磁盘文件为准，不得使用对话记忆）
   - 将清单写入 `docs/ux/{模块名}/design-checklist.md`，初始状态全部为 `⬜ 待设计`
   - **不得在对话中用 Markdown `- [ ]` 展示清单**（用户无法点击，仅为装饰性文本）

4.5. **【⛔️ 阻断门控·AskQuestion 未完成前不得进入 Step 5 设计环节】页面清单用户确认**（写入 design-checklist.md 后、开始设计前必须执行）：
   - 从 design-checklist.md 读取所有页面/画板条目（即步骤 4 刚写入的清单）
   - 调用 `AskQuestion`（`allow_multiple: true`）：
     ```
     AskQuestion(
       prompt: "以下页面将进行设计，请勾选本次需要设计的范围（默认建议全选；取消勾选的页面将在 design-checklist.md 中标记为「本次跳过」）",
       allow_multiple: true,
       options: [每个页面/抽屉/弹窗一个 option，含页面名称和类型（列表页/详情页/抽屉等）]
     )
     ```
   - 用户取消勾选的页面 → 在 design-checklist.md 中标记为 `⏭️ 本次跳过`，后续设计步骤跳过这些页面
   - 用户全部勾选（或无响应超时）→ 全部设计
   - 步骤 5 及后续设计**只处理用户勾选的页面**

> ⚠️ **步骤 4 和 4.5 是进入设计的双重门控，必须在调用 `opt-b-admin-pencil-design` 开始实际设计（Step 5）之前完成。**
> 子 Skill step 1.5 中的「若由 opt-prd-ux-code 调用 → 读取 Checklist」，其前提是本步已执行并写入了用户确认状态，**不是授权跳过本步的指令**。
> 如果跳过这两步直接开始 batch_design，视为严重执行错误，必须回退到步骤 4 补做。

5. 按 Checklist 顺序设计各页面（Shell 结构 → Page Header → Toolbar → 内容区），**仅处理用户在步骤 4.5 中勾选的页面**

6. `get_screenshot` → 每个画板完成后视觉验证

7. **【每完成一批画板后必须执行】调用 `AskQuestion` 工具请用户确认**：
   - 将本批次完成的画板作为多选选项呈现（`allow_multiple: true`）
   - 用户勾选 = 用户亲自确认画板完成，AI 自行标记无效
   - 根据用户选择结果，更新 `docs/ux/{模块名}/design-checklist.md` 中对应条目状态为 `✅ 用户已确认（{日期}）`
   - 未被用户勾选的画板保持 `⬜ 待设计`，继续补全后再次发起 `AskQuestion`
   - **示例调用**：
     ```
     AskQuestion(
       prompt: "请勾选已在 Pencil 中完成并满意的画板",
       allow_multiple: true,
       options: [
         { id: "list", label: "列表页（全页面）" },
         { id: "drawer", label: "新增/编辑抽屉（Drawer）" },
         ...
       ]
     )
     ```

**Gate 3 检查**:
- [ ] 截图无溢出 / 无空白卡片
- [ ] 操作区统一（高频操作右置，超出收纳到 `...`）
- [ ] 状态字段在卡片层可见
- [ ] **【必须·阻断】用户通过 AskQuestion 确认所有画板完成**：
  1. 读取 `docs/ux/{模块名}/design-checklist.md`，统计总条目数 N
  2. 调用 `AskQuestion`（`allow_multiple: true`），列出全部 N 个画板选项，prompt 为"请勾选已在 Pencil 中完成并满意的画板（需全部勾选才能通过 Gate 3）"
  3. **用户勾选数 < N** → Gate 3 阻断：
     - 列出未勾选的画板名称
     - 继续在 Pencil 中补全设计
     - 补全后重新调用 `AskQuestion` 循环检查，直到全部勾选
  4. **用户全部勾选** → Gate 3 通过：
     - 将 `design-checklist.md` 所有条目更新为 `✅ 用户已确认`
     - 输出 Gate 3 Handoff

**【质检三关 — Gate 3】**

**第1关（自动校验，必须通过）**：
- Read `docs/ux/{模块名}/design-checklist.md` 验证文件存在
- 统计 `⬜ 待设计` 条目数量，数量 > 0 则阻断（须全部勾选才能通过）
- Read `docs/ux/{模块名}/prd.md` §4.2，统计页面清单条目数 M，与 checklist 条目数 N 对比：N < M 则提示缺漏

**第2关（交叉验证 — 设计 vs PRD）**：
- `batch_get` 获取 .pen 文件所有顶层 frame 名称，与 PRD §4.2 页面清单对比
- 识别三类差异：A. 设计有 PRD 无（新增）B. PRD 有设计无（遗漏）C. 截图推断的重大流程改动
- **若有差异** → 在 Gate Handoff 中列出全部差异项，用户确认后决定是否回写（回写动作在 Stage 3.5 正式执行）

**【问题修复时机确认 — Gate 3】**（Gate 检查中发现 P1/P2 问题时触发）

若设计稿存在 P1/P2 问题（如某操作区层级过深、某页面信息密度偏高等），调用 AskQuestion：
```
AskQuestion(
  prompt: "以下 P1/P2 设计问题，请选择在当前阶段修复（否则推迟至 Stage 3.5 验证时确认）：",
  allow_multiple: true,
  options: [每个 P1/P2 问题一个 option，含描述和推荐处理阶段]
)
```
- 用户勾选 → 在 Pencil 中修复后重新执行 Gate 3 截图校验
- 用户未勾选 → 写入 session-state.md「已知问题」：`⚠️ [Stage 3] {问题描述}（已推迟至 Stage 3.5 验证时确认）`

> **[GATE 3 — 停止]** 输出 Handoff 后等待用户确认，不得自动进入 Stage 3.5。

**Gate 3 通过后 → 停止并调用 AskUserQuestion 工具进行澄清，询问是否归档新组件**：

> "本次新增了哪些可复用组件（如卡片样式、状态徽章）？是否归档到组件库 .pen 文件？"
> - 是 → 读取 `~/.cursor/skills/opt-extract/SKILL.md`，将新组件提取到组件库
> - 否 → 跳过

**【Token Bridge 记录（Stage 3 必须执行，供 code-to-pencil 管线模式使用）】**

在所有画板设计完成、变量绑定审计通过后，将 CSS 变量 → Pencil $variable 的映射写入 session-state.md：

```
## Token Bridge（CSS Token → Pencil $variable 映射）

| CSS 变量 | Pencil $variable |
|---------|-----------------|
| --color-brand-normal | $color/brand/normal |
| --color-brand-hover | $color/brand/hover |
| --color-brand-active | $color/brand/active |
| --color-brand-light | $color/brand/light |
| --color-status-success | $color/status/success |
| --color-status-warning | $color/status/warning |
| --color-status-error | $color/status/error |
| --color-risk-high | $color/risk/high/normal |
| --color-bg-page | $color/bg/page |
| --color-bg-component | $color/bg/component |
| （从 project-tokens.md 和 set_variables 写入结果生成完整列表）|
```

> 此节由 code-to-pencil 在管线模式下直接读取，无需询问用户。若 session-state.md 不含此节，code-to-pencil 将降级为独立使用模式，需用户手动确认映射。

**Handoff → Stage 3.5**: .pen 文件路径 + 画板名称列表 + 用户确认覆盖率（N/N，来自 `design-checklist.md`）

---

## Stage 3.5 — 设计验证（默认执行）

**跳过条件**: 用户明确说"跳过验证直接出代码"。

**读取**: `~/.cursor/skills/opt-design-validation/SKILL.md`，按其规范执行。

**输入**: Stage 3 Handoff（.pen 文件路径 + 画板名称）+ `docs/ux/{模块名}/prd.md`（基线）
> **[文件优先]** 进入本 Stage 前，必须用 Read 工具重新读取 `docs/ux/{模块名}/prd.md`，并通过 `batch_get` / `get_screenshot` 重新获取 .pen 文件当前状态，以文件内容为准，忽略对话历史中的缓存内容。

**【设计-文档差异检查（自动，每次进入 Stage 3.5 时执行）】**

> **目的**：捕获用户在 Stage 3 期间手动修改 .pen 文件所产生的、与 PRD 不一致的变更，经确认后回写到上游文档。

执行顺序：

1. **读取 .pen 顶层画板列表**：`batch_get` 获取 .pen 文件所有顶层 frame 名称
2. **读取 PRD 页面清单**：Read `docs/ux/{模块名}/prd.md` 的「页面清单」章节，提取所有页面/弹窗条目名称
3. **对比差异**，识别三类变更：
   - **A. 设计中有、PRD 中没有**：.pen 中存在但 PRD 页面清单无对应条目的画板（新增页面/弹窗）
   - **B. PRD 中有、设计中没有**：PRD 列出但 .pen 中已被删除的页面（已移除画板）
   - **C. 重大流程改动**：对变更画板调用 `get_screenshot`，通过截图推断出操作按钮、状态徽章的重大变化
4. **若无差异** → 跳过本节，直接进入验证流程
5. **若有差异** → 调用 `AskQuestion` 列出所有差异项：
   ```
   AskQuestion(
     prompt: "检测到设计稿与文档存在以下差异，请选择需要回写到文档的内容",
     allow_multiple: true,
     options: [每条差异一个 option，含类型标注（新增/移除/流程改动）]
   )
   ```
6. **根据用户选择执行回写**（StrReplace）：
   - **新增页面** → 追加到 `prd.md` 页面清单表格，补充类型/入口/说明列
   - **移除页面** → 在 `prd.md` 对应行标注 `（已移除）`
   - **流程改动** → 更新 `prd.md` 对应状态机表格或功能说明段落
   - 同步更新 `docs/ux/{模块名}/design-checklist.md` 以反映最新画板列表
7. **回写完成后继续**执行本 Stage 正式验证流程

> **能力边界**（仅供参考，不阻断执行）：
> - 新增/删除画板：可自动识别，准确率高
> - 字段/状态展示变化：部分可识别，依赖截图推断，需用户确认
> - 操作按钮/流程变化：部分可识别，依赖截图推断，需用户确认
> - 纯样式/颜色调整：不回写，不影响需求语义

**【子工具确认（进入验证前必须执行）】**

在开始任何验证前，调用 `AskQuestion` 让用户确认本次执行哪些子工具：

```
AskQuestion(
  title: "Stage 3.5 验证子工具确认",
  prompt: "以下子工具默认全部执行，请取消勾选你想跳过的项（建议保持全选）",
  allow_multiple: true,
  options: [
    { id: "heuristic", label: "启发式评估 + 设计合规检查（推荐，存在 P0 时会阻断 Gate）" },
    { id: "heatmap",   label: "预测性热图分析（在 .pen 中生成热图画板）" },
    { id: "critique",  label: "UX 有效性评估（视觉层级、信息架构质量）" },
    { id: "clarify",   label: "文案/Microcopy 检查（有输入框/错误提示时推荐）" }
  ]
)
```

> 用户勾选的选项 = 本次执行；未勾选 = 跳过。若跳过 `heuristic`，Gate 3.5 的 P0 检查同步失效，用户需自行承担设计质量风险。

**各子工具执行规范**:

| 子工具 | 来源 Skill | 评估维度 |
|---|---|---|
| 启发式评估 | design-validation | Nielsen 10 原则，识别可用性问题 |
| 设计合规检查 | design-validation → compliance-checklist.md | Token/间距/阴影/Shell 规范 |
| 预测性热图分析 | **pencil-heatmap**（由 design-validation 编排） | 注意力分布推断，在 .pen 生成热图画板 + 关键路径评估 |
| UX 有效性评估 | **critique** | 视觉层级、信息架构质量、整体设计有效性 |

执行预测性热图时：`opt-design-validation` 子工具二会读取 `~/.cursor/skills/pencil-heatmap/SKILL.md` 并按其规范操作 Pencil。

执行 critique 时：读取 `~/.cursor/skills/critique/SKILL.md`，对当前截图进行 UX 质量评估；**不单独独立输出**，结果直接追加到 `heuristic-report.md` 的"UX 有效性评估"节。

执行 clarify 时：读取 `~/.cursor/skills/clarify/SKILL.md`，检查设计中所有可见文案；结果追加到 `heuristic-report.md` 的"文案质量"节。

**按需执行（不在 AskQuestion 中展示，用户主动提及时才触发）**:

| 子工具 | 触发条件 |
|---|---|
| A/B 变体生成（design-validation） | 用户存在设计决策分叉 |
| 可用性测试脚本（design-validation） | 用户明确将执行真实测试 |

**产出（写入文件）**:
- `docs/ux/{模块名}/heuristic-report.md`（启发式 + 合规 + 热图结论 + critique + clarify 汇总）
- 目标 `.pen` 内新增热图分析画板（见 `pencil-heatmap`）
- `docs/ux/{模块名}/ab-hypothesis.md`（若执行 A/B 变体）
- `docs/ux/{模块名}/usability-test-script.md`（若执行测试脚本）

**Gate 3.5 检查**:
- [ ] P0 问题数 = 0（存在 P0 则 Gate 阻断，见下方 P0 处理流程）
- [ ] 合规检查项逐条标注
- [ ] critique 评估结论已写入报告
- [ ] 文件已成功写入

**【质检三关 — Gate 3.5】**

**第1关（自动校验，必须通过）**：
- Read `docs/ux/{模块名}/heuristic-report.md` 验证文件存在且非空
- 扫描文件中 P0 数量：数量 > 0 则阻断（进入下方 P0 处理流程）
- 验证所有用户已勾选的子工具均有对应输出节（`## 启发式评估` / `## 设计合规` / `## UX 有效性评估` 等）

**第2关（交叉验证）**：
- 对比 Gate 3 Handoff 中记录的设计-PRD 差异项：检查 Stage 3.5 是否已将用户确认的差异回写到 `prd.md`
- 若回写未完成，在 Handoff 中列出遗漏项（不阻断，但提示 Stage 4 需注意）

**P0 问题处理流程（存在 P0 时必须执行）**：

1. 在 Handoff 中列出所有 P0 问题及修复方向
2. 调用 `AskQuestion` 阻断，要求用户确认：
   ```
   AskQuestion(
     prompt: "检测到以下 P0 问题，请在 Pencil 中修复后再继续：\n{P0 问题列表}\n\n修复完成后请选择：",
     options: [
       { id: "fixed",  label: "已全部修复，重新执行 Stage 3.5 验证" },
       { id: "skip",   label: "跳过修复，直接进入 Stage 4（P0 风险自担）" }
     ]
   )
   ```
3. 用户选"已全部修复" → 重新执行 Stage 3.5（差异检查可跳过，直接进验证流程）
4. 用户选"跳过修复" → 在 Handoff 中标注"⚠️ 含未修复 P0，进入 Stage 4"，并将 P0 列表纳入 Stage 4 Handoff 注意事项

**【问题修复时机确认 — Gate 3.5】**（P0 处理完成后，P1/P2 存在时触发）

若验证报告中存在 P1/P2 问题（如间距不符规范、文案不清晰等），调用 AskQuestion：
```
AskQuestion(
  prompt: "以下 P1/P2 问题，请选择在当前阶段修复（否则推迟至 Stage 4 代码阶段处理）：",
  allow_multiple: true,
  options: [每个 P1/P2 问题一个 option，含描述和推荐修复阶段]
)
```
- 用户勾选 → 修复后重新截图校验，更新报告
- 用户未勾选的 P1 问题 → 追加询问修复路径（设计稿修复 vs 代码修复）：
  ```
  AskQuestion(
    prompt: "「{问题描述}」推迟修复，请选择修复路径：",
    options: [
      { id: "pencil", label: "在 Stage 4 前回到 Pencil 文件修复（保持设计稿与代码一致）" },
      { id: "code",   label: "直接在 Stage 4 代码中修复（设计稿不更新，存在偏差）" }
    ]
  )
  ```
- 所有未修复问题写入 session-state.md「已知问题」：`⚠️ [Stage 3.5] {问题描述}（修复路径：{pencil/code}，已推迟至 Stage 4）`
- Gate 3.5 Handoff 中列出推迟问题和各自路径，Stage 4 开始时读取作为注意事项

> **[GATE 3.5 — 停止]** 输出 Handoff 后等待用户确认（或等待上方 AskQuestion 回复），不得自动进入 Stage 4。

**Handoff → Stage 4**: .pen 文件路径 + 画板名称（若有 P1 问题，列入 Handoff 作为代码阶段注意事项）

---

## Stage 4 — 前端代码

**⛔️ 前置·Pencil 选中帧检查（进入代码生成前必须执行，不可跳过）**：

调用 `get_editor_state`，检查 Selected Elements 字段：
- **有选中的顶层 frame** → 以选中帧为本次代码生成范围
    → 覆盖 `design-checklist.md` 中的全量画板列表，只生成选中帧对应的文件
    → 在 Handoff 摘要中标注：「本次代码范围：{帧名}（由 Pencil 选中帧指定，非全量）」
- **无选中节点**（"No nodes are selected"）→ 以 `design-checklist.md` 中所有 `✅ 用户已确认` 的画板为范围（默认行为）

> 不得静默降级：检测到"No nodes are selected"时，如果用户指令中含有"选中"、"这个画板"、"当前帧"等信号词，必须停止并追问用户确认范围，而不是自动展开为全量生成。

**路径选择**:

| 条件 | 执行路径 |
|---|---|
| 有 .pen 设计稿 | 读取 `~/.cursor/skills/opt-pencil-to-code/SKILL.md` |
| 无 .pen 设计稿（跳过 Stage 3） | 读取 `~/.cursor/skills/opt-frontend-design/SKILL.md` |

**代码规范（生成前必读）**：在调用 `opt-pencil-to-code` 或 `opt-frontend-design` 编写/审查 Vue 代码前，依次用 Read 工具读取以下两份规范，并执行第 3 步前置对齐检测：

1. `~/.cursor/skills/b-admin-design-system/SKILL.md`
   → 组件 Token / CSS 变量规范（禁止裸 `#hex`、须用语义 Token 等）
2. `.cursor/skills/antd-v5-enterprise-layout/SKILL.md`（若存在于项目 `.cursor/skills/` 下）或 `~/.cursor/skills/antd-v5-enterprise-layout/SKILL.md`
   → Shell 结构 + Sentinel 视觉规范（No-Line Rule、深色 Sider、KPI 卡片、Glassmorphism Drawer、Glow 图表），生成的页面代码须遵循这套视觉语言
3. **ant-token-align**（Ant Design token 设计系统对齐，满足条件时自动执行）

   检测条件（任一满足即触发）：
   - `package.json` 中含 `das-component-vue`（无论 `file:` 还是 npm 版本）
   - `.cursor/skills/design-system/project-tokens.md` 存在

   **满足 → 以管线模式执行**：
   ```
   读取 ~/.cursor/skills/ant-token-align/SKILL.md 并执行：
     Step 0：检查 session-state.md 中是否已有 "## Token Alignment 状态: done"
       → 已完成 → 静默跳过（不重复执行）
       → 未完成 → 继续 Step 1~6（全量对齐，无提问）
     完成后写入 session-state.md ## Token Alignment 节
   ```

   **未满足 → 静默跳过**，无任何提示，直接进入 Shell 骨架检查

**Shell 骨架检查**（代码规范读取完成后、生成页面代码前）：

检查项目根目录下 `src/layouts/EnterpriseLayout.vue` 是否存在（根目录从 `project_description.md` 的页面输出目录推断）：

- **存在** → 跳过，直接进入页面代码生成
- **不存在** → 先检查 `.cursor/skills/design-system/skills/project-patterns.md`（若存在），提取「导航结构」节中的 `layout` 模式：
  - `layout: 'top'`（顶导 + 侧边菜单混合模式）→ 顶栏高度取 `project-layout.md` 的 `layout/header-height`，侧边栏宽取 `layout/sidebar-width`，生成混合导航 Shell（顶栏 + 侧边 light 菜单），而非纯深色 Sider
  - `layout: 'side'`（纯侧边导航，默认）→ 继续读 `antd-v5-enterprise-layout/SKILL.md § 2. 布局结构代码（Vue 3 版本）`，生成深色 Sider Shell
  - `project-patterns.md` 不存在 → 沿用原有深色 Sider 默认路径
  - 生成以下三个 Shell 文件后继续：
    - `src/layouts/theme.config.ts`（主题 Token 配置）
    - `src/layouts/EnterpriseLayout.vue`（按上方判断的导航结构生成骨架）
    - `src/layouts/SiderNavItem.vue`（3px indicator 导航项）
  - 同时检查 `src/App.vue` 是否已用 `<a-config-provider :theme="enterpriseTheme">` 包裹，若未包裹则补入

**输入**: Stage 3.5 Handoff（.pen 文件路径 + 画板名称）；或 Stage 2 PRD（frontend-design 路径）
> **[文件优先]** 进入本 Stage 前，必须用 Read 工具重新读取 `docs/ux/{模块名}/heuristic-report.md`，并通过 `batch_get` / `get_screenshot` 重新获取 .pen 文件当前状态（若走 frontend-design 路径，则重新读取 `docs/ux/{模块名}/prd.md`），以文件内容为准，忽略对话历史中的缓存内容。

**产出**: 可运行的 Vue 3 页面 + 组件拆分说明

> **[输出目录确认]** 生成代码前，按 pencil-to-code/SKILL.md「输出目录确认」节执行：检查 `project_description.md` 是否已有默认目录；有则直接使用，无则询问用户并确认是否保存为默认。

**路由写入（自动）**（代码完成后必做）：

1. **定位路由文件**：从 `project_description.md` 读取`路由注册文件`路径（如 `vue-project-template/src/router/`），找到 `routes.ts` 或 `index.ts`
2. **写入路由条目**：用 StrReplace / Shell 直接在路由数组中插入新路由对象，不是人工提醒
   ```ts
   { path: '/{模块路径}', component: () => import('@/views/{模块名}/index.vue') }
   ```
3. **验证写入**：Read 路由文件，确认新条目已存在，否则重新写入
4. **路由守卫注意事项**（若被拦截至登录页）：
   - `meta.public = true` 的真实语义：**跳过已登录用户的权限 ID 校验**，不是免登录
   - 未登录用户仍会被重定向 `/login`，不受 `meta.public` 影响
   - 开发调试阶段如需免登录访问，需将路径加入项目的**白名单数组**（如 `WHITE_LIST`）

**【Code↔Frame 映射记录（pencil-to-code 路径必须执行，供 code-to-pencil 管线模式使用）】**

路由写入完成后，将 Vue 文件 ↔ Pencil Frame 的对应关系写入 session-state.md（仅走 pencil-to-code 路径时执行，frontend-design 路径跳过）：

```
## Code↔Frame 映射（Vue 文件 ↔ Pencil 画板）

| Vue 文件路径 | Pencil 画板名 | Frame ID |
|------------|-------------|---------|
| src/views/{模块名}/index.vue | {列表页画板名} | {frame_id} |
| src/views/{模块名}/drawer.vue | {抽屉画板名} | {frame_id} |
| （对每个 design-checklist.md 中的已完成条目补充一行）|

.pen 文件路径：{模块名}.pen
生成日期：{YYYYMMDD}
```

> Frame ID 来源：pencil-to-code 执行时通过 batch_get 获取的顶层 frame 列表。  
> 此节由 code-to-pencil 在管线模式下直接读取，无需询问用户哪个文件对应哪个画板。  
> 若 session-state.md 不含此节，code-to-pencil 将降级为独立使用模式。

**还原度校验后置检查**（harden 之前执行）：

1. 浏览器访问页面，截图与设计稿对比（见 pencil-to-code/SKILL.md「还原度校验」节）
2. 发现偏差直接修复，修复项纳入完成摘要

**还原度校验完成 → 【PRD Gap Supplement — 自动，pencil-to-code 路径专用，frontend-design 路径静默跳过】**

> **目的**：设计稿只覆盖主路径画板，PRD 还描述了大量从未进入设计阶段的隐藏交互和边界场景。本步骤以 PRD 为权威，补全设计稿未覆盖的内容，确保代码与 PRD 需求而非仅与设计稿对齐。

**Step 1：扫描缺口**

```
Read docs/ux/{模块名}/prd.md  →  提取：
  §4.2 页面清单（所有页面/弹窗条目）
  §6.x 交互流程（状态跳转、条件分支）
  §9.x 状态机表（所有状态 + 流转条件）
  §11   边界场景 / 异常处理
  §12   验收用例（AC 清单）

Read docs/ux/{模块名}/design-checklist.md  →  提取：
  ✅ 用户已确认 的条目（有 Pencil 设计稿）
  ⏭️ 本次跳过  的条目（用户主动跳过）
```

对比后识别三类缺口：

| 类型 | 来源 | 含义 |
|------|------|------|
| A — 跳过的页面 | `design-checklist.md` 中 `⏭️` 条目 | 用户在 Stage 3 明确跳过，无设计稿 |
| B — 隐藏交互 | PRD §9.x 状态机 + §6.x 流程中有描述，但 design-checklist 无对应条目 | 从未进入设计阶段（loading 态、空态、权限拒绝页、确认弹窗、表单校验提示等） |
| C — 验收用例缺口 | PRD §12 AC 描述了可测试行为，但代码文件中无对应实现 | 仅在 PRD 中声明，尚未有设计或代码支撑 |

> **若三类缺口均为空**（design-checklist 全部 ✅ + PRD §12 AC 均已覆盖）→ 静默跳过本步骤，直接进入 Checkpoint 1。

**Step 2：呈现缺口 + 用户决策**

```
AskQuestion(
  title: "PRD Gap Supplement — 以下内容有 PRD 描述但无设计稿支撑",
  prompt: "请选择需要在本次代码阶段自动补全的项（以 PRD 需求描述为实现依据，不依赖 Pencil 设计稿）",
  allow_multiple: true,
  options: [
    // A 类：每个 ⏭️ 跳过页面一个 option
    { id: "pageA_{n}", label: "[页面] {名称} — 来自 §4.2，Stage 3 已跳过" },
    // B 类：每条隐藏交互一个 option，标注来源节
    { id: "interB_{n}", label: "[交互] {描述} — 来自 §9.x 状态机：{状态名}" },
    { id: "interB_{n}", label: "[交互] {描述} — 来自 §6.x 流程：{分支描述}" },
    // C 类：每条未覆盖 AC 一个 option
    { id: "acC_{n}", label: "[验收] {AC 描述} — 来自 §12，目前无代码实现" },
    { id: "skip_all", label: "全部跳过，仅保留 Pencil 已设计部分" }
  ]
)
```

**Step 3：生成补全代码**

对用户勾选的每个缺口项，按类型处理：

- **A 类（跳过的页面）**：读取 `prd.md` 对应功能描述 → 以 PRD 文字描述为唯一输入，调用 `frontend-design` 子路径生成该页面 Vue 文件，存放在 `src/views/{模块名}/` 同级目录
- **B 类（隐藏交互）**：在对应页面组件文件中补全缺失状态逻辑（empty state、error state、loading skeleton、确认弹窗、表单校验提示等），以 PRD §9.x/§6.x 描述为实现依据，直接修改已生成的 Vue 文件
- **C 类（验收用例）**：逐条 AC 检查代码中是否有对应实现；无实现则在合适位置补入，并添加注释 `// PRD §12 AC: {用例描述}` 便于追溯

**Step 4：记录补全结果**

将决策和补全产出追加写入 `session-state.md`：

```markdown
## PRD Gap Supplement
执行日期：{YYYYMMDD}

### 已补全（用户勾选并生成）
- [A-页面] {名称} → {生成文件路径}（来源：PRD §4.2）
- [B-交互] {描述} → {修改文件路径}（来源：PRD §9.x）
- [C-验收] {AC 描述} → {修改文件路径}（来源：PRD §12）

### 未补全（用户跳过）
- [类型] {描述}（跳过原因：用户选择跳过）
```

**代码生成完成 → 还原度校验后 → 【Checkpoint 1 — 自动，必须执行】**

按以下顺序依次执行，不跳过：

**Step C1-1：normalize（Token drift 修复）**
> 读取 `~/.cursor/skills/normalize/SKILL.md`，扫描所有生成代码文件：
> - 查找裸 `#hex` 颜色值 → 替换为 `project-tokens.md` 对应的语义 Token CSS 变量
> - 查找硬编码间距（如 `margin: 16px`）→ 替换为设计系统间距变量
> - 直接修复，不单独输出报告

**Step C1-2：chart-tokens（ECharts Token 桥接，检测到图表时自动执行）**

检测条件（任一满足即触发）：
- 生成代码中含 `import * as echarts` 或 `import echarts`
- 生成代码中含 ECharts 相关组件（`v-chart`、`<VChart />`、`echarts.init`）
- PRD 数据模型或页面清单中含图表类型描述（折线/柱状/饼图/雷达图/热力图）

**检测到 ECharts → 自动执行**：
> 读取 `~/.cursor/skills/chart-tokens/SKILL.md`，执行：
> 1. 在 `src/libs/hooks/useEChartsTheme.ts` 创建/更新 composable（从 CSS 变量运行时读取 Token）
> 2. 将 `project-tokens.md` 的品牌色、状态色、风险色映射为 ECharts 主题对象
> 3. 若 `project-tokens.md` 存在 `color/risk/*` 章节 → 额外生成 `buildSecurityPalette()` 函数
> 4. 替换生成代码中所有裸 ECharts `color: ['#hex', ...]` 配置为 `getCssVar()` 引用

**未检测到 ECharts → 跳过，无提示**

**Step C1-3：audit（质量综合扫描）**
> 读取 `~/.cursor/skills/audit/SKILL.md`，聚焦两个维度执行扫描（不执行完整全量扫描）：
> - **Theming**：验证 normalize 后是否仍存在裸 hex / 错误 Token 使用
> - **Accessibility**：对比 WCAG AA 标准，检查对比度 / ARIA / 键盘导航 / 语义 HTML
>
> 扫描完成后：
> - 输出 audit 报告（不修复，只报告）
> - Critical/High 问题 → 追加到 `docs/ux/{模块名}/session-state.md` 的「已知问题」节
> - Critical 问题数 > 0 → 在 Checkpoint 2 确认前提示用户（不自动阻断，由用户决定）

**【Checkpoint 2 — 可选，AskQuestion 决定】**

```
AskQuestion(
  prompt: "Checkpoint 1 完成（normalize + audit）。audit 报告已生成。是否执行 polish 做最终品质过关？",
  options: [
    { id: "polish", label: "是，执行 polish（对齐/间距/交互状态/copy 一致性）" },
    { id: "skip",   label: "否，直接进入 harden" }
  ]
)
```

- 用户选 **polish** → 读取 `~/.cursor/skills/polish/SKILL.md`，执行完整 polish checklist，直接修复发现的问题，然后进入 harden
- 用户选 **skip** → 直接进入 harden

**代码生成完成后 → 内置后置：harden**

> 自动读取 `~/.cursor/skills/opt-harden/SKILL.md`，对生成的代码执行鲁棒性检查：
> - 错误处理覆盖（网络/5xx/空数据/超时）
> - 文本溢出与边界输入处理
> - 操作防抖/loading 状态完整性
> - 硬编码文案检测（为 i18n 做准备）
>
> 发现问题直接在同一文件修复，不单独输出报告。

**harden 完成后 → 【收尾可选增强，AskQuestion — allow_multiple】**

```
AskQuestion(
  title: "Stage 4 可选收尾增强",
  prompt: "harden 完成。是否执行以下可选增强项？（可多选，不选则直接启动 dev server）",
  allow_multiple: true,
  options: [
    { id: "optimize", label: "性能优化（optimize）— 修复 audit 报告中 Critical/High 性能问题：lazy loading / 动画属性优化 / 无用导入清理" },
    { id: "animate",  label: "微交互增强（animate）— 为列表加载、抽屉展开、状态切换添加 purposeful 过渡动效（150-300ms ease-out，遵守 prefers-reduced-motion）" }
  ]
)
```

- 用户选 **optimize** → 读取 `~/.cursor/skills/optimize/SKILL.md`，以 audit 报告 Critical/High 性能问题为输入，定向修复
- 用户选 **animate** → 读取 `~/.cursor/skills/animate/SKILL.md`，只为关键交互路径添加动效，不过度动效化
- 执行顺序：optimize 先，animate 后；均完成后进入路由写入
- 均不选 → 直接进入路由写入

**harden（+ 可选增强）完成后 → 启动开发服务器（自动）**

按以下顺序执行，不等待用户指令：

```
Step 1：检查是否已有运行中的 dev server
  → Shell: head -n 15 ~/.cursor/projects/*/terminals/*.txt 2>/dev/null | grep -l "Local:"
  → 找到含 "Local: http://localhost:" 的 terminal 文件
      是 → 从文件中提取端口号（如 5173），记为 {DEV_PORT}，直接跳到 Step 3
      否 → 进入 Step 2

Step 2：启动 dev server
  → 从 project_description.md 读取项目根目录（页面输出目录的上级，如 vue-project-template/）
  → 若 project_description.md 未记录根目录，Shell: 在工作区根目录查找 package.json
  → 读取 package.json，确认 scripts.dev 或 scripts.serve 的实际命令名
  → Shell 执行（后台运行，block_until_ms: 0）：
      npm run {启动脚本} 或 pnpm run {启动脚本}
  → 每隔 3s 读取 terminal 文件，等待出现 "Local: http://localhost:" 字样
  → 成功 → 提取端口号，记为 {DEV_PORT}
  → 超时 30s 未出现 → 输出最新 20 行日志，提示用户手动排查，跳过 Step 3

Step 3：输出访问地址
  → 拼接完整 URL：http://localhost:{DEV_PORT}/{路由路径}
  → 在完成摘要中输出此 URL
```

> **端口规则**：以 terminal 实际输出为准，不假设固定端口。Vite 端口冲突时会自动递增。
> **不重复启动**：已检测到运行中的 dev server 时，直接复用，不执行 `npm run dev`。

**【质检三关 — Gate 4】**

**第1关（自动校验，必须通过）**：
- 验证所有页面组件文件已写入（Glob 确认 `src/views/{模块名}/` 下文件存在）
- Read 路由文件，验证新路由条目已存在（不存在则重新写入）
- 扫描生成代码中是否仍存在裸 `#hex`（normalize 后的残留检查）：仍存在则列出，不阻断但记入「已知问题」

**第2关（交叉验证）**：
- 对比 `docs/ux/{模块名}/design-checklist.md` 页面列表与 `src/views/{模块名}/` 目录，确认每个画板都有对应的 Vue 文件
- 若有未生成的页面，列出并询问是否补全后再通过 Gate 4

**第3关（PRD 验收用例覆盖率）**：
- 读取 `docs/ux/{模块名}/prd.md` §12 所有 AC 条目，统计总数 N
- 逐条在 `src/views/{模块名}/` 下检索是否有对应实现（含注释 `// PRD §12 AC:` 标记，或关键功能关键字匹配）
- 计算覆盖率 = 已覆盖条数 / N
- **覆盖率 < 80%**：在 Handoff 中列出所有未覆盖 AC 条目，调用 AskQuestion 询问用户是否补全（不阻断，用户可跳过）；若用户选择补全，立即执行补全后重新计算
- **覆盖率 ≥ 80%**：Gate 4 通过，未覆盖项记入「已知问题」节，不阻断后续流程
- **PRD 无 §12 节或 session-state.md 记录 `skip_all`**：本关静默通过

**【问题修复时机确认 — Gate 4】**（Gate 检查中发现 P1/P2 问题时触发）

若代码存在 P1/P2 问题（如裸 hex 残留、某边界场景未处理等），调用 AskQuestion：
```
AskQuestion(
  prompt: "以下 P1/P2 问题，请选择在当前阶段修复（否则记录为已知问题存档）：",
  allow_multiple: true,
  options: [每个 P1/P2 问题一个 option，含描述]
)
```
- 用户勾选 → 修复后重新执行 Gate 4 检查
- 用户未勾选 → 写入 session-state.md「已知问题」：`⚠️ [Stage 4] {问题描述}（已存档，待后续迭代处理）`

**【⛔️ Gate 4 后置·变更检测（自动执行，不可跳过）】**

Gate 4 通过、完成摘要输出后，立即执行以下检测流程：

**Step 1：代码变更扫描**

```
Shell: git diff HEAD --name-only           （检测未提交工作区变更）
Shell: git diff HEAD~1 --name-only         （检测最近一次提交的变更）
过滤出 src/views/{模块名}/ 下的变更文件列表（忽略其他目录）
```

**Step 2：影响范围判断**

```
读取 session-state.md ## Code↔Frame 映射

A. 将变更文件逐一与映射表对比：
   - 命中 → 记录：{文件名} 对应 .pen 画板 {画板名}（共 N 个画板）
   - 未命中 → 忽略

B. 读取 prd.md，将变更文件涉及的功能点与 PRD §4.3 / §6.x / §7.x 对比：
   - 代码新增了 PRD 未描述的状态/字段/交互 → 记录 M 处 PRD 差异
   - 未发现差异 → M = 0
```

**Step 3：呈现检测结果 + AskQuestion**

> 以下两种情况静默跳过，不弹 AskQuestion，不提示用户：
> - session-state.md 不含 `## Code↔Frame 映射`（走的是 frontend-design 路径）
> - git diff 输出为空且 M = 0（无任何变更）

若 N > 0 或 M > 0，调用 AskQuestion：

```
AskQuestion(
  title: "Gate 4 后置：变更同步",
  prompt: "Gate 4 完成。检测到 {N} 个画板 / {M} 处功能点涉及代码变更，请选择同步目标（可多选；也可稍后通过 code-to-prd / code-to-pencil 手动触发）：",
  allow_multiple: true,
  options: [
    { id: "prd",    label: "同步到 PRD（{M} 处变更 → 读取 code-to-prd/SKILL.md，全流程模式执行）" },
    { id: "pencil", label: "同步到 Pencil 设计稿（{N} 个画板 → 读取 code-to-pencil/SKILL.md，全流程模式执行）" },
    { id: "skip",   label: "跳过，稍后手动触发" }
  ]
)
```

**Step 4：调用对应 Sub-skill**

- 用户选 **prd** → 读取 `~/.cursor/skills/code-to-prd/SKILL.md`，以全流程模式执行（session-state.md 已有 Stage 4 记录，sub-skill 会自动读取，无需再询问路径）
- 用户选 **pencil** → 读取 `~/.cursor/skills/code-to-pencil/SKILL.md`，以全流程模式执行（session-state.md 已有 `## Code↔Frame 映射` 和 `## Token Bridge`，sub-skill 会自动读取）
- 用户选 **skip** 或静默跳过 → Gate 4 完成摘要中追加一行：`回写操作：跳过（可随时说"代码改了，同步到文档/设计稿"手动触发）`

> **[GATE 4 — 停止]** 启动步骤完成并输出完成摘要（含文件路径、路由地址、完整访问 URL、Dev Server 状态、已修复的鲁棒性问题列表、audit 已知问题列表）后停止。不得自动执行任何额外操作。

---

## Handoff 格式（对话摘要）

每个 Gate 通过后，在对话中用此格式输出（完整内容在文件里）：

```
## Gate [N] 通过 — Handoff to Stage [N+1]

文件产出：{文件路径列表}

### 关键摘要
- {2-3 条最重要的结论}

### 传递给下一阶段的上下文
- {字段/场景/路径等关键信息}

### 待决事项（若有）
- {需要用户拍板的问题}

【仅 Gate 3 适用】画板覆盖率：用户已确认 N/N 个画板 ✅，记录于 docs/ux/{模块名}/design-checklist.md

---
回复"确认"继续 Stage [N+1]，或告知修改意见退回当前阶段修改。
```

> **[GATE — 必须停止]** 输出上方 Handoff 后立即停止，等待用户明确回复后再执行任何操作。

---

## 跳阶规则

| 已有产物 | 跳过 |
|---------|------|
| Stage 0 报告文件（`docs/ux/{模块}/`） | Stage 0 |
| 故事脚本 / IA / 流程图文件 | Stage 0–1 |
| 完整 PRD 文件 | Stage 0–2 |
| **PDF / Word 规格说明书**（如接口文档、产品规格） | Stage 0–1（以文档为输入直接进 Stage 2 生成 PRD） |
| .pen 设计稿 + 无需验证 | Stage 0–3.5 |
| .pen 设计稿 + 需要验证 | Stage 0–3（保留 3.5） |
| 无设计稿，直接出代码 | Stage 3（改走 frontend-design 路径） |

跳阶时，从已有产物文件中提取对应 Handoff 信息，直接进入目标 Stage。

---

## 完整 Skill 引用清单

| Stage | 主 Skill | 补充 Skill |
|---|---|---|
| 初始化 | — | opt-pro-ux-code-init（必须执行，不可跳过） |
| Stage 0 | discovery | cybersecurity-competitive-research（竞品分析默认路径） |
| Stage 1 | story-ia-flow-notes | — |
| Stage 2 | prd | — |
| Stage 3 | b-admin-pencil-design | extract（Gate 后可选） |
| Stage 3.5 | design-validation | critique（默认）、clarify（按需）、pencil-heatmap（默认） |
| Stage 4 前置 | ant-token-align | 检测到 das-component-vue 或 project-tokens.md 时自动执行（管线模式，已完成则静默跳过） |
| Stage 4 | pencil-to-code / frontend-design | b-admin-design-system（规范必读）、harden（内置后置）、路由写入 + dev server（自动收尾） |

---

## 必需 vs 可选对照表

| Stage | 全新产品 | 重构 | 功能迭代 | 纯 UI 改版 | 已有设计稿 |
|---|---|---|---|---|---|
| 初始化 opt-pro-ux-code-init | **必需（不可跳过）** | **必需（不可跳过）** | **必需（不可跳过）** | **必需（不可跳过）** | **必需（不可跳过）** |
| 0 前置研究 | 按需（Step B 询问） | 按需（Step B 询问） | 跳过 | 跳过 | 跳过 |
| 1 用研叙事 | **可选** | **可选** | 跳过¹ | 跳过 | 跳过 |
| 2 需求文档 | **必需** | **必需** | 跳过¹ | 跳过 | 跳过 |
| 3 设计稿 | **必需** | **必需** | **必需** | **必需** | 跳过 |
| 3 → extract | 可选 | 可选 | 可选 | 可选 | — |
| 3.5 设计验证 | **必需** | **必需** | **必需** | **必需** | **必需** |
| 3.5 → critique | **默认** | **默认** | **默认** | **默认** | **默认** |
| 3.5 → clarify | 按需 | 按需 | 按需 | 按需 | 按需 |
| 3.5 → pencil-heatmap | **默认** | **默认** | **默认** | **默认** | **默认** |
| 4 前端代码 | **必需** | **必需** | **必需** | **必需** | **必需** |
| 4 → harden | **内置** | **内置** | **内置** | **内置** | **内置** |
| 4 → 路由写入 + dev server | **自动** | **自动** | **自动** | **自动** | **自动** |

> ¹ 若已有完整文件则跳过；若只有口头描述则仍需执行（或用户主动选择执行）。