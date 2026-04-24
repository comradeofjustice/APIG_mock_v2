---
name: opt-b-admin-pencil-design
description: B端后台设计系统 Pencil 版设计指导。在 .pen 文件中设计符合规范的 B端后台界面，通过 Pencil Variables 管理 Design Token，支持亮/暗双模式、信息密度切换和定制主题推导。当用户提到在 Pencil 中设计 B端界面、画后台原型、设计管理系统、配置 Pencil 主题变量、审查设计稿是否符合规范时使用此技能。
layer: 1
---

# B端后台设计系统 · Pencil 版

## 开始前必读

使用 Pencil MCP 工具前，先调用 `get_editor_state()` 确认当前活跃文件。
所有 `.pen` 文件的读写必须通过 Pencil MCP 工具，**不能用普通文件读取工具**。

---

## 目标文件确认（设计开始前必做）

在调用 `get_editor_state()` 之前，先用 Shell 检测项目目录中的 `.pen` 文件，按以下规则处理：

> **设计副本机制**：组件库文件（`[组件库] das-component-vue.pen`）是只读的组件来源，**不在其中直接设计**。设计工作在该文件的副本中进行——副本自动包含全部 DAS 复杂组件，无需跨文件操作。

**命名规则（自动，无需用户输入）**：
- 在 `opt：prd-ux-code` 流程中：`{模块名}.pen`（来自 Step C 已收集的模块名）
- 独立调用时：`design-{YYYYMMDD}.pen`（取当天日期）

---

**规则 A：有组件库文件，且无其他 `.pen` 设计文件（全新项目）**

```
→ 按命名规则自动确定新文件名（如 "剧本管理.pen"）
→ Shell: cp "[组件库] das-component-vue.pen" "{新文件名}.pen"
→ open_document("{新文件名}.pen")
→ 告知用户：已基于组件库创建设计副本 "{新文件名}.pen"，将在此文件中设计
```

**规则 B：有组件库文件，且已有其他 `.pen` 设计文件**

```
→ 调用 AskQuestion 询问用户：
  prompt: "检测到项目中已有以下设计文件，如何继续？"
  options:
    - { id: "new",      label: "基于组件库新建设计文件（自动复制，文件名：{自动命名}）" }
    - { id: "existing", label: "在已有文件中继续设计（{列出已有文件名}）" }
→ 选"新建" → Shell cp + open_document（同规则 A）
→ 选"已有" → 若只有一个文件直接 open_document；若多个则再列出供选择
```

**规则 C：无组件库文件，但有其他 `.pen` 文件**

```
→ 询问用户：「项目中存在以下 .pen 文件，请问在哪个文件中创建设计稿？」
→ 列出文件名，等待用户选择后 open_document(选择的路径)
```

**规则 D：目录中没有任何 `.pen` 文件**

```
→ open_document("new") 新建空白 .pen 文件
```

---

## 视觉哲学（Atmosphere）

> 以下描述 Token 无法表达的设计决策逻辑。**所有颜色、间距、圆角、字号均以 Design Token / Pencil Variables 为准，本节不覆盖任何 Token 数值。**

- **视觉优先级**：数据内容 > 操作按钮 > 导航结构。用位置和层级区分重要程度，不依赖颜色堆叠
- **层级表达**：背景色差（page → container → component）+ `elevation/*` 阴影共同建立纵深感
- **信息密度**：高密度但有节奏——每个内容区有明确的视觉喘息点，避免信息过载
- **状态反馈**：交互状态即时响应，通过 Variables 的状态变量实现，无需动画
- **克制装饰**：无纯装饰性渐变和插图，视觉元素服务于信息传达
- **阴影使用原则**：卡片用 Level 1；下拉/浮层用 Level 2；Modal 用 Level 3

---

## 路径判断

**Q-1：设计阶段是否使用 Pencil Variables？**（会话开始时优先确认；与代码生成模式无关）
- 是 → 必须使用 Pencil Variables（`$variable`），不要硬编码颜色/间距/字体；支持主题与密度调整，也更利于后续对齐设计系统
- 否 / 仅快速原型 → 可硬编码（更快），但后续若要对齐设计系统需补变量替换
- 若用户未说明 → 默认使用 Variables（更稳）

> 若后续要生成代码，是否走 design-system 或 faithful，应由 `opt-pencil-to-code` 在代码阶段单独判断。

**Q0：是否有项目层覆盖？**（每次开始前先检查）

存在**两个独立的项目覆盖层**，均需检查：

| 覆盖层 | 路径 | 内容 | 优先级 |
|--------|------|------|--------|
| **工作区 Skill 层** | `.cursor/skills/design-system/skills/project-design-system.md`（索引）→ 按需读子文件 | Token 设计语义（品牌色、圆角等）；**其值已预汇总到 `project_description.md` 注入表** | 高 |
| **代码模板 Rule 层** | `.cursor/rules/design-system/overrides/`（若无则使用全局：`~/.cursor/rules/design-system/overrides/`；Claude：`~/.claude/rules/design-system/overrides/`） | Pencil→CSS 变量映射、Shell 结构特殊配置 | 高 |

- 存在 `.cursor/skills/design-system/` → 读取 `project-design-system.md`（索引），按「是否有项目覆盖」列决定读哪些子文件，记录其中的项目级颜色/圆角，与注入表核对是否一致
- 存在项目规则 `.cursor/rules/design-system/` → 读取 `overrides/` 目录相关文件
  - 若项目不存在 → 读取全局规则 `design-system/`（Cursor：`~/.cursor/rules/design-system/`，Claude：`~/.claude/rules/design-system/`）中对应文件
- 两层均不存在 → 直接使用全局设计系统定义
- 检查 `additions/` 目录中是否有项目专属组件模板

**Q0.5：⛔️ 阻断门控 — project-tokens.md 完整注入 + project-layout.md 硬编码约束读取（读完约束文件后、任何 batch_design 前必须执行）**

> 此步骤解决两类问题：
> 1. 「读了约束但未应用到 .pen 文件」：AI 知道正确值，但 Pencil 组件仍使用全局默认 $variable
> 2. 「多值圆角无法注入」：`number` 类型变量不支持多角独立值，必须在 batch_design 中硬编码

```
条件：.cursor/skills/design-system/skills/project-tokens.md 存在

步骤 1 — set_variables 注入（Pencil Variable 可注入的单值变量）：
  解析 project-tokens.md，提取所有「值为单一数值」的 Pencil Variable
  （跳过标注「⚠️ 多值圆角」的行，这些行无法作为 number 变量注入）
  调用 set_variables，一次性将上述变量注入 .pen 文件
  注入后调用 get_variables 验证关键 Token（font/size/base、radius/btn-md、
  layout/sidebar-width）与 project-tokens.md 一致；不一致则补注入后再继续

步骤 2 — 读取 project-layout.md 硬编码约束节（⚠️ 不可注入，设计时必须应用）：
  检查 project-layout.md 中是否存在「导航节点硬编码约束」节（或等价标题）
  若存在 → 提取表格中的每条约束（节点类型 + 属性 + 值）
            在对话上下文中记录：「设计时创建 {节点类型} 节点必须设置 {属性} = {值}」
            不使用 $variable 引用，直接在 batch_design 的节点属性中写入该值
  若不存在 → 跳过，继续

条件不满足（project-tokens.md 不存在）→ 跳过两步，使用全局默认值继续
```

> ⚠️ **此步骤是进入 batch_design 设计环节的前置阻断条件。**
> - 未完成步骤 1：DasButton 等组件将使用全局默认 $variable（如 radius/btn-md=12），按钮圆角不符规范
> - 未完成步骤 2：sidebar/nav-item 等节点将遗漏多值圆角约束，导致视觉与参考文件不一致

**Q1：是新文件还是已有文件？**
- 新文件 → 先用 `get_variables` 检查是否已有 Token 变量，没有则按 [core/tokens-variables.md](core/tokens-variables.md) 初始化
- 已有文件 → 直接查询当前变量状态，按需调整

**Q1b：是否需要创建项目专属组件库？**

```
若满足以下全部条件：
  ① .cursor/skills/design-system/skills/project-design-system.md 存在
  ② 当前项目工作区不存在「{项目名}-component.pen」或「[项目组件库] *.pen」
  → 提示用户是否创建项目专属组件库：
      "检测到项目设计系统（project-design-system.md），建议创建项目组件库副本以隔离项目定制值。是否现在创建？"
  → 用户确认：
      Shell: cp "[组件库] das-component-vue.pen" "{项目名}-component.pen"
      open_document + 执行 pencil-token-refresh.mdc 三层合并 Token 注入
      后续设计文件建议从项目组件库复制，而非原始全局组件库
  → 用户拒绝：使用全局组件库，继续设计
```

**Q1c：目标画板冲突检测（触发条件满足任一时必须执行）**

触发条件（满足任一即进入此步）：
- 用户指令含改写信号词：「重新设计」「重画」「重建」「覆盖」「在原帧上改」「重做」「重新画」「改一下」「修一下」
- `get_editor_state` 返回 Selected Elements 非空（用户已选中现有帧），且指令含设计动词（「设计」「画」「改」「更新」「重新」）

执行流程：
1. 确定目标画板名
   - 来源 A：`get_editor_state` 返回的选中帧名（优先）
   - 来源 B：用户指令中明确提到的页面名（如「P3 表单页」「列表页」）
2. 调用 `batch_get` 检查 .pen 文件中是否已存在同名顶层 frame
3. 若不存在 → 正常新建，跳过此步，继续 Q2
4. 若存在 → ⛔️ 阻断，调用 AskQuestion：
   ```
   AskQuestion(
     prompt: "「{帧名}」画板已存在，请选择操作方式：",
     options: [
       { id: "new",       label: "新建画板（保留原有画板，新画板命名为「{帧名}-v2」）" },
       { id: "overwrite", label: "原地覆盖（删除原画板，在同位置重建）" }
     ]
   )
   ```
   - 用户选「新建」→ `batch_design` 创建新帧，命名为「{帧名}-v2」，放在原帧旁边
   - 用户选「原地覆盖」→ 先记录原帧的 `x/y` 坐标，再 `D("{原帧 ID}")` 删除，然后在原坐标位置重建新帧

> ⚠️ 不得静默处理：既不能在没询问的情况下直接新建（留下冗余帧），也不能在没询问的情况下直接删除（丢失原稿）。

**Q2：全局变量来源？**（优先级最高，必须先确认）

| 情况 | 处理方式 |
|------|---------|
| 存在 `project_description.md` | **读取文件**，提取品牌色 + 全部功能色，注入 Pencil Variables（见下方注入规则） |
| 用户/客户明确提供了颜色 hex | 直接使用，**不允许被 Style Guide 覆盖** |
| 主线产品，未指定颜色 | 使用设计系统默认值 |
| 定制项目，未指定颜色 | 询问用户，若无则可由 Style Guide 推导候选色供确认 |

> Style Guide 只负责视觉风格方向（圆角/排版/密度/暗色调性），**永远不覆盖已确定的项目颜色**。

**Q2 注入规则（三层合并架构）**：

> ⚠️ 以下规则已由项目规则扩展，执行时优先以项目 `.cursor/rules/pencil-token-refresh.mdc` 为准（包含 Step 1.5 三层合并逻辑）；若项目不存在则使用全局 rules 目录下的 `pencil-token-refresh.mdc`。Skill 被整体替换后该 Rule 仍有效。

**三层合并读取顺序（由 `pencil-token-refresh.mdc` Step 1.5 处理）：**

```
存在 project-design-system.md 时：
  → 读取索引，按「是否有项目覆盖」列决定读哪些子文件
  → Token 注入：读 project-tokens.md（Priority ①，交由 pencil-token-refresh.mdc 处理）
  → 设计约束：读所有标注「✅ 有」的子文件，作为设计决策输入
```

读取 `project_description.md` 的 `## Pencil Token Values` 节（若存在），作为 Priority ②，与 Priority ① 合并后用 `set_variables` 一次性写入表格中**全部变量**：

```
品牌色（4 个）：color/brand/normal · hover · active · light
状态色（6 个）：color/status/success · success-light · warning · warning-light · error · error-light
风险色（10 个）：color/risk/fall/normal · fall/light · high/normal · high/light · medium/normal · medium/light · low/normal · low/light · no/normal · no/light（DAS 项目特有）
圆角（3 个）：radius/3xs · radius/xs · radius/lg
字体（1 个）：font/size/base
合计：24 个变量全量注入
```

> 注：上述 24 个是**项目覆盖层变量**，注入后 Pencil 文件中仍会存在大量组件库基线变量。这是正常现象，无需将组件库变量全部补录到 `project_description.md`。

> 注入表中 `来源` 列标注 **"项目覆盖"** 的行（如 `color/brand/normal`、`radius/*`）以 `project-design-system.md` 索引关联的 `project-tokens.md` 项目值为准，与全局 b-admin-pencil-design 默认值不同；标注 **"全局默认"** 的行沿用全局值。**直接信任注入表，不要用全局默认值覆盖"项目覆盖"行**。

若 `project_description.md` **不存在 `## Pencil Token Values` 节**（如旧项目或未配置），执行以下顺序：

```
① 先检查 .cursor/skills/design-system/skills/project-design-system.md 是否存在
   → 存在：读取索引，找到标注「✅ 有」的子文件（尤其是 project-tokens.md），读取其中的品牌色、圆角值，用这些项目值作为注入基础
   → 不存在：回退到全局默认值（#134BEA / 3xs=4 / xs=8 / lg=16）

② 仅注入 5 个基本变量并提示用户补充完整注入表：
   color/brand/normal  → 来自 project-tokens.md 或全局默认
   color/brand/hover   → 同上
   color/status/success / warning / error → 全局默认

③ 提示：project_description.md 缺少 Pencil Token Values 节，风险色等项目特有
   Token 未注入，建议参考 .cursor/skills/design-system/skills/project-tokens.md 的值补充完整注入表。
```

> ⚠️ 有 Pencil Token Values 节时，必须全量注入，不得只注入前 5 个。

**Q3：项目类型？**
- 主线产品 → 使用标准 Variables，直接进入设计工作流
- 定制项目 → 推导完整主题配置 → 读 [theming/custom-theme-workflow.md](theming/custom-theme-workflow.md)

**Q4：是否需要暗色模式？**（与项目类型无关，独立判断）
- 是 → 读 [theming/light-dark-variables.md](theming/light-dark-variables.md)

**Q4b：新项目 `project-tokens.md` 双模式格式（含亮/暗切换时使用）**

新建项目且需要亮/暗双主题时，`project-tokens.md` 的颜色覆盖表应使用 **Light/Dark 双列格式**：

```markdown
## 品牌色（亮/暗双模式）
| Pencil Variable      | Light      | Dark       | 来源 |
|----------------------|------------|------------|------|
| color/brand/normal   | #134BEA    | #5B8FF9    | 项目品牌色 |
| color/brand/hover    | #3B71EE    | #7AABFF    | 项目品牌色 |
| color/brand/active   | #0639C3    | #4070D8    | 项目品牌色 |
| color/brand/light    | #E8F2FF    | #1A2540    | 项目品牌色 |

## 背景色覆盖（按需）
| Pencil Variable      | Light      | Dark       | 来源 |
|----------------------|------------|------------|------|
| color/bg/page        | #F0F4FF    | #0A0E18    | 定制页面背景 |
```

> 未在 `project-tokens.md` 中声明 Dark 列的变量，`pencil-token-refresh.mdc` 会自动从全局基线 `core/tokens-variables.md` 取对应 Dark 值兜底。
>
> **旧格式（单模式，JiNan 等已有项目）** 继续使用单「值」列，无需修改：
> ```markdown
> | Pencil Variable     | 值         | 来源 |
> |---------------------|------------|------|
> | color/brand/normal  | #3b71ee    | 项目覆盖 |
> ```
> `pencil-token-refresh.mdc` 通过检测表头列名自动识别新旧格式，不影响已有项目。

**Q5：是否需要密度调整？**
- 是 → 读 [theming/density-variables.md](theming/density-variables.md)

---

## 组件库使用规则

> **副本机制说明**：`[组件库] das-component-vue.pen` 是所有复杂 DAS 组件的来源。通过「目标文件确认」中的 Shell `cp` 复制，设计副本文件与组件库在同一目录，副本内已包含全部组件节点，可直接通过 `ref` 引用，无需跨文件操作。

> **Pencil 不支持跨文件引用组件**（`batch_design` 的 `C("nodeId", parent)` 仅能引用当前文件内节点）。副本机制正是为了解决这一约束——设计在副本中进行，所有组件都在同一文件内。

### 组件使用决策树

设计新页面时，先判断组件使用方式：

```
所需 UI 元素
  ├─ 简单组件（按钮/标签/输入框/状态徽章）
  │     → 直接在当前设计副本里照规范重建
  │       理由：结构简单，重建成本低
  │
  └─ 复杂组件（Table / Form / Drawer / SearchBar / Tree）
        → 副本中已包含这些组件，直接 ref 引用
        → 步骤见下方「在设计副本中使用 DAS 组件」
```

### 在设计副本中使用 DAS 组件（标准流程）

```
Step 1  get_editor_state()             确认当前文件为设计副本，查看已有 Reusable Components 列表

Step 2  在同文件内直接 ref 使用 DAS 组件
        I("新页面父节点", {type:"ref", ref:"组件ID"})
        → 组件 ID 来自副本内的 Reusable Components，无需跨文件操作

Step 3  用 ref + descendants 定制内容
        I("父节点", {type:"ref", ref:"组件ID",
          descendants: {
            "labelId": { content: "新文字" },
            "iconId":  { enabled: false }
          }
        })
```

### Variables 覆盖说明

复制组件只带结构，不带变量定义。要让 `$color/brand/normal` 等 Token 在目标文件中生效，需在文档头部加 `imports`：

```json
{ "imports": { "das": "./[组件库] das-component-vue.pen" } }
```

目标文件自定义的同名变量优先级更高，可用于主题覆盖。

### descendants 定制能力

| 需求 | 写法 |
|------|------|
| 改文字 / 颜色 / 尺寸 | `"childId": { content/fill/width: ... }` |
| 隐藏子元素 | `"childId": { enabled: false }` |
| 替换整个子树 | `"childId": { type:"frame", ... }` （完整新节点） |
| 插槽填充 | 找到 `slot` 节点 ID，用 `R()` 替换 |

### 当前组件库清单（`[组件库] das-component-vue.pen`）

| ID | 组件名 | 常用场景 |
|----|--------|---------|
| `Edwv2` | DasButton/Primary | 主操作按钮 |
| `MwoWA` | DasButton/Default | 次级按钮 |
| `Z1ra8` | DasButton/Danger | 危险操作 |
| `4CY33` | DasButton/Text | 文字链按钮 |
| `iZgOJ` | DasInput | 输入框 |
| `uXRjf` | DasSelect | 下拉选择 |
| `SqbV3` | DasSearchBar | 搜索工具栏 |
| `VQAxO` | DasTable | 表格 |
| `tedi4` | DasMetricCard | 指标卡 |
| `SlMA9` | DasTabs | 标签页 |
| `efEYC`~`ZR9n0` | DasTag × 5色 | 状态标签 |
| `ZPAoD`~`QYAgK` | DasAlert × 4种 | 提示条 |
| `YQaGj` | DasDrawer | 侧滑抽屉 |
| `In3TE` | DasDetail | 详情键值对 |
| `rWYmF` / `2WDel` | DasForm / DasFormGroup | 表单 |
| `6Ckht` | DasEmpty | 空状态 |
| `ivDcS` | DasTree | 树形控件 |
| `bnqE8` | DasTransfer | 穿梭框 |
| `uVOw3` | DasBadge/Success | 已发布状态徽章（绿色） |
| `joLXB` | DasBadge/Warning | 草稿状态徽章（黄色） |
| `Nt7eg` | DasBadge/Danger | 异常状态徽章（红色） |
| `VeAuW` | DasPlaybookCard | 剧本卡片（含头像/名称/类型/描述/标签/状态/操作） |

**DasPlaybookCard 内部可覆盖节点 ID：**

| 节点 ID | 说明 | 常见覆盖 |
|---------|------|---------|
| `oZznt` | 头像容器（40×40） | 改 `fill` 颜色、替换内部图标 |
| `dhuyl` | 剧本名称 text | 改 `content` |
| `qF2BE` | 类型标签 text | 改 `content`、`fill` |
| `ooqTP` | 描述文本 | 改 `content` |
| `LqEqU` | 状态徽章（ref） | 换 `ref` 指向不同 DasBadge 变体 |

> 每次设计页面时，**先对照上表确认哪些组件已有现成的**，优先复用，不要重复造轮子。

### 新增项目自定义组件归档规范

当项目中出现全局库中没有的新组件时，必须同步完成以下三步，确保设计资产和规格文档一致：

| 步骤 | 操作 | 工具 |
|------|------|------|
| 1 | 在 Pencil 中构建/还原组件，并归档到 `[组件库] das-component-vue.pen` | `extract` skill |
| 2 | 将组件 ID、名称、使用场景追加到上方「当前组件库清单」表格 | 编辑本文件 |
| 3 | 创建对应的模块设计规范文件 `.cursor/skills/{模块名}-design/SKILL.md`，记录组件内部规格（padding、高度、圆角、子节点 ID 等） | 参考 `unit-archive-design/SKILL.md` 模式 |

> **为什么需要步骤 3？** Pencil 变量无法覆盖组件内部规格（如卡片标题栏高度 48px、padding `[12, 20]`），这些必须通过 skill 文件文档化，AI 读取后才能在 `batch_design` 中精确还原。`unit-archive-design` 是该模式的参考实现。

---

## 设计工作流（标准步骤）

```
1.  执行「目标文件确认」→ 完成后调用 get_editor_state() 确认活跃文件及已有 Reusable Components
1.5 【必须】确认本次需要设计的页面清单：
      - 若由 opt-prd-ux-code 调用 →
          ① 用 Read 工具检查 `docs/ux/{模块名}/design-checklist.md` 是否存在
             - **存在且含用户确认记录**（至少一条 `✅ 用户已确认` 或 `⏭️ 本次跳过` 状态）
               → 读取文件，以文件为准，跳过 AskQuestion，直接使用已确认的清单
             - **文件不存在，或全部条目仍为 `⬜ 待设计`**（说明 opt-prd-ux-code Step 4.5 未执行）
               → ⚠️ 上游门控未完成，回退到独立调用路径：执行 AskQuestion 收集用户确认，
                  并将结果写入 design-checklist.md（或补全其中的状态标注）后再继续
      - 若独立调用 → 询问用户"本次需要设计哪些页面/弹窗？"，列出清单后确认
      在对话中输出待设计 Checklist，后续每完成一个画板立即更新对应项为 [x]
1.8 【阻断门控】Token 注入核查（open_document 之后、第一个 batch_design 之前必须完成）：
      执行 `pencil-token-refresh.mdc` 规则 A 的完整流程：优先使用项目 `.cursor/rules/pencil-token-refresh.mdc`；若项目不存在则使用全局 rules 目录下的版本（Cursor：`~/.cursor/rules/pencil-token-refresh.mdc`，Claude：`~/.claude/rules/pencil-token-refresh.mdc`）：
      a. Read project_description.md，定位 §Pencil Token Values 节
      b. 验证节内存在 | Pencil Variable | 值 | 列头的注入表
         - 格式正确 → 解析全部变量，调用 set_variables() 一次性写入
         - 格式不符（如 | 用途 | Hex |）→ 停止，提示用户修正后再继续
      c. 注入后调用 get_variables() 确认 radius/3xs · radius/xs · radius/lg 三个圆角变量已存在
      ⚠️ 不完成本步，禁止进入步骤 2。原因：未注入的 .pen 文件中的圆角、颜色将回落到组件库默认值，不反映项目规范。
2.  对照组件库清单，确认哪些组件需要从组件库复制进来
3.  按「组件库跨文件调用规则」完成组件复制（若需要）
4.  get_variables()                       确认 Token 已注入（圆角、品牌色、状态色均应可见）
5.  get_guidelines("web-app")            获取 Pencil 设计规范
6.  get_style_guide_tags()               获取风格标签（新文件时）
7.  snapshot_layout()                    了解现有布局结构
8.  batch_design — 仅创建 Shell 框架     按 patterns/shell-standard.md Shell 模板
9.  snapshot_layout(pageId, maxDepth:2)  ⚠️ 验证 Shell 容器宽度（必须通过再继续）
10. batch_design — 逐区填充内容          每区完成后 get_screenshot 验证
11. 执行「执行后必检清单」               逐项校验，不通过则立即修复
12. 【必须·阻断】对照步骤 1.5 的 Checklist 逐项确认：
      - 每个条目都有对应顶层 frame？→ 全部 [x] 才可宣布完成
      - 存在未打勾的条目 → 继续补全对应画板，完成后重新执行本步
```

> ⚠️ **第 9 步是新增的强制门控**：Shell 宽度不正确时，任何内容填充都会导致排版崩溃。务必先通过再进入第 10 步。
> ⚠️ **第 12 步是页面完整性门控**：未完成全部 Checklist 条目，不得向 ux-to-code Stage 3 Gate 汇报完成。

---

## 整页分批设计规范

> 本节沉淀自实战经验，是复杂页面（卡片列表、表格、详情页等）不出错的核心保障。

### 黄金法则

| 规则 | 说明 |
|------|------|
| **每批 ≤ 25 ops** | `batch_design` 单次上限 25 条操作，超出会报错 |
| **binding 不跨批** | 上一批创建的绑定（如 `sidebar`、`content`）在下一批**完全失效**，必须用实际 ID |
| **ID 从响应提取** | 每批结束后，从 response 中记录关键节点 ID（`content`、`row1`、`row2` 等）供后续批次使用 |
| **先外后内** | 按层级从外到内构建，Shell → 区域 → 组件内容 |

### 高效路径补充（卡片网格/资产列表类页面）

> 适用于“剧本管理/资产库/策略库”等：**页头动作 + 筛选工具栏 + 卡片网格** 的后台页面。目标是用最少的批次、最低的返工，稳定产出可扫读页面。

#### 最短路径（推荐顺序）

```
0) get_editor_state(include_schema:true)   确保 schema 已加载
1) get_variables(filePath)                若为空 → set_variables 初始化最小 token 集
2) batch_design                            仅创建 Shell（page 1440 / sidebar 240 / main 1200 / topbar 64 / content padding 24）
3) snapshot_layout(pageId, maxDepth:2)     ⚠️ 门控：Sidebar=240 且 Main=1200，不通过就先修 Shell
4) batch_design                            PageHeader + Tabs
5) batch_design                            Toolbar（搜索/筛选/排序）
6) batch_design                            CardGrid 骨架（2 行 x 3 列）
7) batch_design (N 次)                     逐卡填充内容（1 批 1~2 张）
8) get_screenshot                          关键批次后复查（至少 Shell 后、首屏完成后）
```

#### 卡片高度策略（默认推荐）

- **默认**：`height: "fit_content(280)"`（最小高度一致 + 内容可向下增长）
- **描述文本**：`textGrowth:"fixed-width"`, `width:"fill_container"`（让内容自然撑高卡片）
- **不推荐**：为“强行齐平”锁死固定高度（会违背“内容自适应”且后续维护成本高）

#### 操作区规范（高频在右 + 溢出收纳）

> Pencil 不支持真实运行时的“容器变窄自动折叠”。用**结构表达交互规则**：默认只露出高频操作，其余进入 `…` 菜单。

- **可见高频操作**：`编辑` + `复制`
- **溢出入口**：`…`
- **溢出菜单**（占位即可，`enabled:false`）：
  - 未发布：`发布` + `删除`
  - 已发布：`取消发布` + `删除`
- **布局顺序必须统一**（避免“左右漂移”）：`more` → `InlineOps` → `OverflowMenu`

#### 颜色绑定强制规则（batch_design 必须遵守）

凡 Q-1 选择"使用 Variables"（默认选项），`batch_design` 中的颜色必须遵守：

| 颜色类型 | 正确写法 | 禁止写法 |
|---------|---------|---------|
| 品牌色 `color/brand/*` | `"$color/brand/normal"` | `"#3b71ee"`、`"#134bea"` 等裸 hex |
| 状态色 `color/status/*` | `"$color/status/success"` | `"#1DB969"` 等裸 hex |
| 风险色 `color/risk/*` | `"$color/risk/high/normal"` | `"#F53C3C"` 等裸 hex |
| 页面/卡片背景 | `"$color/bg/page"`、`"$color/bg/component"` | 优先用变量，无对应变量时可写裸 hex 并注释原因 |

**允许写裸 hex 的情况（例外，不视为违规）**：
- 导航渐变：`linear-gradient` 不支持变量引用，用项目规范色值（如 `#086ff4`/`#0046b6`）
- 阴影 `effect` 的 `color` 字段：Pencil 不支持变量引用，用 hex（如 `#0000000F`）
- 透明色：用 `"transparent"`，禁止 `"#00000000"`

> ⚠️ 违反上述规则的后果：Token 值更新时设计不同步（节点显示旧色），design-validation 合规检查报 P1。即使 `set_variables` 注入成功，若节点用了裸 hex，等于 Token 化失败。

#### 通用坑位（本次实战补充）

- **透明填充**：禁止 `#00000000`，只用 `transparent`；必要时用 `replace_all_matching_properties` 全局替换
- **字体告警**：部分中文字体名会被 Pencil 判定 invalid；不确定时先用 `Inter` 兜底，待项目字体策略明确后再统一替换
- **lucide 图标名**：部分名字可能不存在（如 `more-horizontal`）；常用替代：`ellipsis`

### 标准整页分批顺序

```
Batch 1（≤25 ops）：Shell 结构 + Sidebar 内容 + TopBar 面包屑
  - U("frameId", {placeholder:true, layout:"horizontal", fill:"$color/bg/page"})
  - sidebar(240) + main(1200) + topbar(64) + content(fill)
  - logoArea + navArea + 4~5 个 navItem（每个 3 ops：frame+icon+text）
  - bcGroup（面包屑 home图标 + chevron + 当前页名）
  ✓ 记录 ID：content=xxx, topbar=xxx

Batch 2（≤25 ops）：TopBar 右侧 + 页面 Header + Tab 页签（大部分）
  - userArea（bell图标 + 头像圆圈 + 用户名）
  - pageHeader（标题+副标题 竖排 + 右侧操作按钮）
  - tabBar + 3~4 个 tab（active 用 stroke-bottom 高亮）
  ✓ 记录 ID：tabBar=xxx

Batch 3（≤25 ops）：搜索工具栏 + 卡片/列表网格骨架
  - searchTool（搜索框 + 筛选下拉）
  - cardGrid(vertical) + row1(horizontal) + row2(horizontal)
  - 在 row1 中创建 3 个卡片框架 c1/c2/c3（仅容器，不填内容）
  ✓ 记录 ID：c1=xxx, c2=xxx, c3=xxx, row2=xxx

Batch 4（≤25 ops）：卡片 1 完整内容
  - cardTop(padding:16, vertical, gap:12) + cardHead + avatar + titleArea + desc
  - tagRow + 3 个 chip
  - footer（space_between：status ref + actions group）

Batch 5~N：剩余卡片（每张约 20~22 ops，1 批 1 张）
  - 沿用 Batch 4 结构，修改头像色/图标/标题/标签内容
  - 最后一批 U("frameId", {placeholder:false}) 去除占位符
```

### 批次间 ID 管理技巧

```javascript
// ✓ 同批次内可链式引用
sidebar=I("McinJ", {...})
nav=I(sidebar, {...})     // sidebar 绑定在同批有效

// ✗ 跨批次绑定失效，必须用实际 ID
// 错误：I(sidebar, ...)  // 下一批中已失效
// 正确：I("fJXDx", ...)  // 使用上一批 response 中的实际 ID
```

### 关键注意事项

| 陷阱 | 解决方案 |
|------|---------|
| `ref` 组件 descendant ID 不对 | **使用前必须** `batch_get(["nodeId"])` 确认当前子节点 ID（改动后 ID 会变）|
| `padding: [0, 16, 12]` 报错 | padding 只支持 **1 值、2 值（水平/垂直）、4 值（上右下左）**，不接受 3 值 |
| `effect` 不支持变量引用 | 阴影必须展开：`{type:"shadow", shadowType:"outer", offset:{x:0,y:2}, blur:8, color:"#0000000A"}` |
| icon 名不存在被忽略 | 常见替换：`home` → `house`；使用前建议先在 lucide.dev 确认名称 |
| `width`/`height` 不支持变量 | 用 `padding` 控制高度（见高度约束强制规则），用具体数值控制宽度 |

---

## 【Gate 前置】变量绑定审计（所有画板完成后、截图校验前必须执行）

> 此步骤是"安全网"：即使 batch_design 阶段有遗漏的裸 hex，也能在 Gate 前全部补绑定。
> 跳过此步骤视为 Gate 前置检查未通过，不得进入截图校验。

**执行流程**：

1. 调用 `get_variables()` 获取当前品牌色、状态色、风险色的变量值，生成 hex → 变量名映射表：
   ```
   { "#3b71ee": "$color/brand/normal", "#1f66ff": "$color/brand/hover", ... }
   ```

2. 对所有顶层 frame ID 调用 `replace_all_matching_properties`，一次性替换三种属性：
   ```
   replace_all_matching_properties({
     parents: [所有顶层 frame ID],
     properties: {
       fillColor:   [{ from: "#hex值", to: "$color/brand/normal" }, ...],
       textColor:   [{ from: "#hex值", to: "$color/brand/normal" }, ...],
       strokeColor: [{ from: "#hex值", to: "$color/brand/normal" }, ...]
     }
   })
   ```

3. 保留以下裸 hex（不替换）：
   - 导航渐变色（来自 project-layout.md 规定的专属色）
   - 阴影 effect 的 color 字段

4. 审计完成后，再执行 `get_screenshot` 截图校验，确认视觉无变化（Token 值与原 hex 相同，视觉应完全一致）

---

## 执行后必检清单

> **每次 `batch_design` 完成后必须逐项检查。** 有不通过项直接用 `batch_design` 修复，不留待下次。
>
> 规则维护于 **[core/compliance-checklist.md](core/compliance-checklist.md)**（单一数据源）。
> 执行前先读取该文件获取最新规则，**不在本文件维护规则副本**。

---

## Token → Pencil Variables 速查

| Design Token | Pencil Variable 名 |
|-------------|-------------------|
| `--color-bg-page` | `color/bg/page` |
| `--color-bg-container` | `color/bg/container` |
| `--color-bg-secondarycontainer` | `color/bg/secondary` |
| `--color-bg-component` | `color/bg/component` |
| `--color-text-primarys` | `color/text/primary` |
| `--color-text-secondary` | `color/text/secondary` |
| `--color-text-placeholder` | `color/text/placeholder` |
| `--color-text-disabled` | `color/text/disabled` |
| `--color-brand-normal` | `color/brand/normal` |
| `--color-brand-hover` | `color/brand/hover` |
| `--color-brand-light` | `color/brand/light` |
| `--color-error-normal` | `color/status/error` |
| `--color-warning-normal` | `color/status/warning` |
| `--color-success-normal` | `color/status/success` |
| `--color-component-border` | `color/border/default` |
| `--color-component-stroke` | `color/stroke/default` |

### Elevation Variables

| 层级 | Pencil Variable | 适用场景 |
|------|----------------|---------|
| 0 | `elevation/none` | 表格行、内联标签 |
| 1 | `elevation/1` | 卡片、面板 |
| 2 | `elevation/2` | 下拉菜单、Tooltip |
| 3 | `elevation/3` | Modal、抽屉 |
| focus | `elevation/focus` | 输入框/按钮焦点环 |

完整映射表 → [core/tokens-variables.md](core/tokens-variables.md)

---

## 组件节点模板

> 已重构为模块化文件，原 `components-nodes.md` 现为索引：

| 查什么 | 读哪个文件 |
|--------|-----------|
| 语法规则 / 高度约束 | [core/syntax-rules.md](core/syntax-rules.md) ← **设计前必读** |
| 组件快速索引 | [core/component-index.md](core/component-index.md) |
| 按钮 / 输入框 | [core/components/buttons.md](core/components/buttons.md) · [inputs-selects.md](core/components/inputs-selects.md) |
| 卡片 / 表格 / 表单 | [cards-metrics.md](core/components/cards-metrics.md) · [tables.md](core/components/tables.md) · [forms.md](core/components/forms.md) |
| 导航 / 弹窗 / 反馈 | [navigation.md](core/components/navigation.md) · [modals.md](core/components/modals.md) · [feedback.md](core/components/feedback.md) |
| 搜索 / 选项卡 / 杂项 | [search-bars.md](core/components/search-bars.md) · [tabs-detail.md](core/components/tabs-detail.md) · [controls.md](core/components/controls.md) |
| 树 / 穿梭框 / 异步操作 | [trees-transfer.md](core/components/trees-transfer.md) · [async-actions.md](core/components/async-actions.md) |
| Shell 骨架 | [core/patterns/shell-standard.md](core/patterns/shell-standard.md) ← **新页面从这里开始** |
| 卡片网格整页模式 | [core/patterns/page-card-grid.md](core/patterns/page-card-grid.md) |

---

## 更多参考

- Token 完整映射 → [core/tokens-variables.md](core/tokens-variables.md)
- 亮/暗模式 Variables → [theming/light-dark-variables.md](theming/light-dark-variables.md)
- 信息密度 Variables → [theming/density-variables.md](theming/density-variables.md)
- 定制主题工作流 → [theming/custom-theme-workflow.md](theming/custom-theme-workflow.md)
