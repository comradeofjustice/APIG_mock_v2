---
name: create-project-design-system
description: 为项目创建设计系统文件结构（project-design-system.md 索引 + N 个子文件），建立三层 Token 优先级架构，覆盖 Token 变量、布局、排版、组件模式多个设计维度。当用户说"创建项目设计系统"、"初始化项目设计系统"、"新建设计系统文件"、"create project design system"、"setup design system files"时使用。当用户说"检查设计系统健康度"、"design system health"、"design system drift"、"设计系统 health check"、"检查 Token 一致性"时，执行「健康检查模式」（见文件末尾）。
---

# 创建项目设计系统文件

## 执行步骤

### Step 0：存储路径确认

检查 `.cursor/skills/design-system/` 目录是否存在：
- **存在** → 继续
- **不存在** → AskQuestion：

```
prompt: "当前项目没有检测到设计系统存放路径，选择存储位置："
options:
  { id: "default", label: "在当前项目创建（.cursor/skills/design-system/）" }
  { id: "custom",  label: "指定其他路径（我来输入）" }
```

用户选 `default`：`Shell: mkdir -p .cursor/skills/design-system/`
用户选 `custom`：读取用户输入路径后 `Shell: mkdir -p {path}`，后续步骤使用该路径

### Step 0.5：覆盖检查

检查 `{存储路径}/project-design-system.md` 是否已存在：
- **存在** → AskQuestion 确认（覆盖现有文件 / 取消）；取消则停止
- **不存在** → 继续

### Step 1：收集项目信息 + 判断数据来源

**1a.** AskQuestion：项目名称（用于文件标题）

**1b.** 优先检测：用户调用时是否已随消息附带设计信息？

判断标准（满足任一即视为「已提供」）：
- 消息中含图片/截图附件
- 消息中含 hex 色值、品牌色描述、圆角/字号/布局的具体说明
- 消息中含设计规范文档内容或链接

**→ 若用户已提供设计信息** → 直接跳至「`provide` 执行」的 Step 1e（解析 → 写入文件 → 输出覆盖度摘要），不再 AskQuestion

**1c.** 若用户未随消息提供设计信息 → 自动扫描背景资料：
1. 读取 `project_description.md` → 检查 `## Pencil Token Values` 节 + `## Design Context` 节
2. 读取 `src/theme/` 目录（若存在）→ 扫描 CSS 变量 / AntD token 颜色值 / 字号配置

**1d.** 根据扫描结果 AskQuestion 让用户确认创建策略：

**→ 扫描到项目特有设计信息时：**

```
prompt: "检测到项目设计信息（{来源摘要，如：project_description.md 含品牌色/圆角/风险色等}），如何创建设计系统文件？"
options:
  { id: "from-project", label: "按当前项目设计风格创建（使用检测到的项目值填入）" }
  { id: "from-global",  label: "按公司通用设计规范创建（使用全局默认值，忽略项目检测值）" }
  { id: "provide",      label: "我来提供信息（品牌色/截图/文档/布局偏好），AI 解析后按规范填入" }
```

**→ 未扫描到任何项目特有设计信息时：**

```
prompt: "没有检测到项目设计系统相关信息，如何创建全套设计系统文件（Token + 布局 + 排版 + 组件模式）？"
options:
  { id: "from-global", label: "按公司通用设计规范创建（克隆全局默认，5 个文件均以全局内容为基础）" }
  { id: "provide",     label: "我来提供信息（品牌色/截图/文档/布局偏好），AI 解析后按规范填入" }
```

**→ 用户选 `from-project`（按项目设计风格）：**

写入文件前先执行**多值 Token 路由检测**（同 `provide` 路径）：

```
多值 Token 路由检测（写入前必须执行）：
  遍历所有待写入的 Token 条目，检测其值是否为多值格式：
    多值判定标准：值含空格 + 多个数字（如 "0 24px 24px 0"、"6px 6px 0 0"）
    → 命中：不写入 project-tokens.md（无法作为 Pencil Variable）
           写入 project-layout.md 的"硬编码约束"节，注明 batch_design 数组写法
           在 Gap Analysis 中标记为「✅ 已路由到 project-layout.md 硬编码约束节」
    → 未命中：按原逻辑写入 project-tokens.md
```

将 1b 中检测到的项目值按语义分组写入对应子文件：
- Token → `project-tokens.md`（品牌色 / 状态色 / 风险色 / 圆角 / 字体）
- 布局 → `project-layout.md`（侧边栏宽 / 顶栏高 / 画布尺寸 / 导航样式 / **硬编码约束**）
- 排版 → `project-typography.md`（字号基准 / 字体栈）
- 模式 → `project-patterns.md`（导航结构 / 领域专属色系）

来源列标注「来自 project_description.md 迁移」或「来自 src/theme/ 扫描」。

**→ 用户选 `from-global`（按全局设计规范 / 克隆）：**

| 子文件 | 全局来源 | 操作 |
|--------|---------|------|
| `project-tokens.md` | `~/.cursor/skills/opt-b-admin-pencil-design/core/tokens-variables.md` | 读取 JSON 变量列表，全量写入，每行标注 `⚠️ 克隆自全局` |
| `project-layout.md` | `tokens-variables.md` 的 `layout/*` 变量 + `core/patterns/shell-standard.md` | 提取画布/侧边栏/顶栏/内容区规范写入 |
| `project-typography.md` | `tokens-variables.md` 的 `font/*` 变量 | 提取字体变量 + 字号语义表写入 |
| `project-patterns.md` | `core/patterns/` 和 `core/components/` 文件清单 | 列出文件引用链接，标注"与全局一致，按需覆盖" |

**→ 用户选 `provide`（渐进式最小可行优先）：**

> 改进：不再一次性要求提供4个维度，改为从影响最大的维度开始，逐步推进。用户可以在任意维度停止，已填维度即可用。

**Step 1e — 第一维度（Token 层，必问）**

```
AskQuestion(
  prompt: "请提供品牌色信息（影响最广，其他维度可选）：",
  options: [
    { id: "provide", label: "提供品牌色（hex 值 / 截图描述 / 圆角风格）" },
    { id: "skip",    label: "跳过，使用全局默认品牌色" }
  ]
)
```

用户提供信息后，先执行**多值 Token 路由检测**再写入：

```
多值 Token 路由检测（写入前必须执行）：
  遍历所有待写入的 Token 条目，检测其值是否为多值格式：
    多值判定标准：值含空格 + 多个数字（如 "0 24px 24px 0"、"6px 6px 0 0"）
    → 命中：不写入 project-tokens.md（Pencil Variable number 类型不支持多值）
           写入 project-layout.md 的"导航节点硬编码约束"节，注明 batch_design 数组写法
           在 Gap Analysis 中标记为「✅ 已路由到 project-layout.md 硬编码约束节」
    → 未命中：正常写入 project-tokens.md
```

通过路由检测后，品牌色、圆角（单值）等写入 `project-tokens.md`，并自动推算 hover/active/light 变体（同行标注 `推算：{依据}`），无法确定的填 `<!-- TODO: 待确认 -->`。

输出 Token 层覆盖摘要后，进入第二维度询问：

**Step 1e — 第二维度（布局层，按需）**

```
AskQuestion(
  prompt: "Token 层已写入。是否继续提供布局信息？",
  options: [
    { id: "provide", label: "提供布局信息（画布尺寸 / 侧边栏宽 / 顶栏高 / Drawer 宽）" },
    { id: "skip",    label: "跳过，使用全局默认布局（1440×900 / 240px / 64px / 320px）" }
  ]
)
```

用户提供后写入 `project-layout.md`，覆盖的值直接填入，未提供的保持注释占位符。

**Step 1e — 第三维度（排版层，按需）**

```
AskQuestion(
  prompt: "布局层已处理。是否继续提供排版信息？",
  options: [
    { id: "provide", label: "提供排版信息（字号基准 / 中英文字体栈）" },
    { id: "skip",    label: "跳过，使用全局默认排版（14px / PingFang SC / Inter）" }
  ]
)
```

**Step 1e — 第四维度（组件模式层，按需）**

```
AskQuestion(
  prompt: "排版层已处理。是否继续提供组件模式信息？",
  options: [
    { id: "provide", label: "提供组件模式（导航结构 / 表格规范 / 领域专属色组）" },
    { id: "skip",    label: "跳过，使用全局默认组件模式（侧边导航 / 标准表格）" }
  ]
)
```

**所有维度处理完成后输出覆盖度摘要（⛔️ 必须输出，不得省略）**（Step 1e-2）：

```
## 设计信息解析报告

### 整体覆盖度
Token 层：X / Y 个关键变量已填值（含 N 个推算值）
布局层：  X / Y 项（或"使用全局默认"）
排版层：  X / Y 项（或"使用全局默认"）
模式层：  X / Y 项（或"使用全局默认"）

### 来源 vs 项目设计系统 对比（Gap Analysis）

> 此表覆盖「用户输入 / 源材料中出现」的全部设计属性，逐项说明录入情况。

| 源材料中的项 | 录入位置 | 是否完整录入 | 未录入 / 路由原因 |
|---|---|---|---|
| radius/nav-bar = [0,24,24,0] | project-layout.md 硬编码约束节 | ✅ 已路由 | 多值圆角，number 类型不可注入 |
| radius/tab = [6,6,0,0] | project-layout.md 硬编码约束节 | ✅ 已路由 | 同上 |
| color/brand/normal = #3b71ee | project-tokens.md | ✅ | — |
| （示例）某字段描述模糊 | 未录入 | ❌ TODO | 源材料描述不足，已标注 TODO |
（以上为示例行，实际执行时替换为真实解析项）

### 推算值（置信度中，建议核查）
- `color/brand/hover` = #40A9FF，由 brand/normal 推算 → 见 project-tokens.md
- ...

### ⚠️ 未覆盖项（已标注 TODO，建议补充）
- 圆角模式：未声明 → project-tokens.md
- 领域专属颜色组 → project-tokens.md
- ...
```

**Step 1e-3：询问是否补充**

```
AskQuestion(
  prompt: "文件已写入，是否需要补充信息以完善 TODO 项？",
  options: [
    { id: "done",       label: "不需要，继续后续步骤" },
    { id: "supplement", label: "补充部分信息（我来输入），AI 更新对应文件" }
  ]
)
```

- 用户选 `done` → 进入 Step 2 写入索引文件
- 用户选 `supplement` → 接收补充，更新对应文件中的 TODO 项，重新输出覆盖度摘要，再次询问

### Step 2：写入 5 个文件

使用下方模板，将 `{项目名}` 替换为 Step 1a 获取的名称。

根据每个子文件实际内容更新索引的「是否有项目覆盖」列：
- 有实际项目特有值 → `✅ 有`
- 克隆全局未做差异化修改 → `⚠️ 克隆自全局，待修改`
- 空模板（保持注释占位符）→ `与全局一致，无覆盖`

### Step 2.5：交叉验证（写入完成后必须执行）

文件写入完成后，执行以下两项扫描，确保 Token 引用一致性：

**验证 A：project-patterns.md 裸 hex 扫描**

读取 `project-patterns.md`，扫描所有 `#[0-9a-fA-F]{3,8}` 格式的裸 hex 值：

- **若发现裸 hex** → 与 `project-tokens.md` 中的变量做匹配：
  - 能匹配到 Token 变量的 → 列出建议替换（`hex → Token变量名`）
  - 无法匹配的 → 标注为「新 Token，建议补充到 project-tokens.md」
  - 在对话中输出扫描报告（不自动修改文件，等用户确认后修改）
- **若无裸 hex** → 跳过，无提示

**验证 B：阴影 section Pencil Variable 格式检查**

读取 `project-tokens.md`，检查阴影（shadow）相关章节：
- 若阴影 section 存在但缺少 `Pencil Variable` 列（只有 `用途` 和 `值` 两列）→ 提示格式不规范，建议补充变量名（如 `shadow/card/default`）

**扫描结果处理**：

```
AskQuestion(
  prompt: "交叉验证完成。发现以下问题（{问题列表}）。如何处理？",
  options: [
    { id: "fix-now",   label: "现在修复（AI 按建议替换）" },
    { id: "fix-later", label: "稍后手动修复（继续，问题已记录）" },
    { id: "no-issues", label: "（仅当无问题时显示）全部通过，继续" }
  ]
)
```

- 用户选 **fix-now** → 执行替换，更新对应文件，然后进入 Step 3
- 用户选 **fix-later** → 在 Step 3 摘要中列出待修复项，继续

### Step 3：输出摘要

```
已创建 5 个文件（路径：{存储路径}）：
  ✅ project-design-system.md（索引）
  ✅ project-tokens.md
  ✅ project-layout.md
  ✅ project-typography.md
  ✅ project-patterns.md
```

根据创建策略追加提示：
- `from-project`：已按项目检测值填入，建议核查标注「推断」的字段后，调用opt-prd-ux-code skill，开始产品设计
- `from-global`：所有值为全局默认（标注 ⚠️），请对照项目实际情况逐维度修改后，调用opt-prd-ux-code skill，开始产品设计
- `provide`：未能确定的字段已标注 `<!-- TODO: 待确认 -->`，解析覆盖率：Token X/Y，布局 X/Y，排版 X/Y，模式 X/Y，剩余 TODO 共 N 处；请补全后，调用opt-prd-ux-code skill，开始产品设计

---

## 文件模板

### project-design-system.md（索引，固定结构）

```markdown
# {项目名} 项目设计系统 — 索引

> 固定入口文件。所有 Skills/Rules 通过读取本文件发现子文件，不得直接硬编码子文件路径。

## 文件清单

| 文件 | 关注点 | 是否有项目覆盖 |
|------|--------|--------------|
| [project-tokens.md](./project-tokens.md)         | Pencil Token 变量覆盖 | {tokens_status} |
| [project-layout.md](./project-layout.md)         | 布局 & 页面结构       | {layout_status} |
| [project-typography.md](./project-typography.md) | 排版层级              | {typography_status} |
| [project-patterns.md](./project-patterns.md)     | 组件模式 & 导航       | {patterns_status} |

## 读取协议

- **Token 注入**：只读 `project-tokens.md`
- **设计工作**：读所有标注「✅ 有」的文件；「与全局一致，无覆盖」的文件可跳过
- **更新清单**：每次子文件内容变化时，同步更新本表的「是否有项目覆盖」列

## 三层优先级架构

\```
① project-tokens.md（本索引关联）← 项目设计系统（最高优先）
② project_description.md Pencil Token Values ← src/theme 代码扫描值（中层）
③ tokens-variables.md ← 公司全局 B-admin 默认（基线）
\```

冲突规则：
- ① 与 ②/③ 冲突 → ① 静默胜出，不询问
- ② 与 ③ 冲突，无 ① → 必须询问用户：以本地项目设计系统为准 还是 以公司通用设计规范为准
```

---

### project-tokens.md（Token 变量覆盖层）

空模板（无项目信息时使用，克隆模式下替换为全局变量全量）：

```markdown
# {项目名} 项目 Token 变量覆盖层

> Priority ①：注入优先级高于 project_description.md 扫描值（Priority ②）和 tokens-variables.md 全局基线（Priority ③）

## 品牌色

| Pencil Variable | 值 | 来源 |
|---|---|---|
| color/brand/normal  | <!-- TODO: 待确认 --> | |
| color/brand/hover   | <!-- TODO: 待确认 --> | |
| color/brand/active  | <!-- TODO: 待确认 --> | |
| color/brand/light   | <!-- TODO: 待确认 --> | |

## 圆角模式

<!-- 说明使用哪种圆角模式：常规模式 / 半圆模式 / 全圆模式 -->

| Pencil Variable | 值 | 说明 |
|---|---|---|
| radius/3xs | <!-- TODO --> | |
| radius/xs  | <!-- TODO --> | |
| radius/lg  | <!-- TODO --> | |
| radius/2xl | <!-- TODO --> | |

## 状态色（覆盖全局默认时填写）

| Pencil Variable | 值 | 来源 |
|---|---|---|
| color/status/success       | | |
| color/status/success-light | | |
| color/status/warning       | | |
| color/status/warning-light | | |
| color/status/error         | | |
| color/status/error-light   | | |

## 字体

| Pencil Variable | 值 | 来源 |
|---|---|---|
| font/size/base | <!-- TODO --> | |

<!-- 如有领域专属颜色组（如安全风险色），在此追加新章节 -->
```

---

### project-layout.md（布局规范，空模板）

```markdown
# {项目名} 项目布局规范

> 与全局默认一致时无需填写；发现差异时在此记录，并更新索引中的「是否有项目覆盖」列。
> 全局规范参考：opt-b-admin-pencil-design/core/patterns/shell-standard.md

<!--
## 画布尺寸
默认：1440 × 900

## 侧边栏
默认宽：240px（layout/sidebar-width）
是否可折叠：

## 顶栏
默认高：64px（layout/header-height）

## 内容区
默认 padding：24px（layout/page-padding）
最大内容宽：

## 弹出层 / Drawer
默认宽：320px（layout/drawer-width）
-->

---

## 导航节点硬编码约束（Pencil Variable 无法表达，batch_design 时必须显式写入）

> Pencil Variables `number` 类型仅支持单一数值；以下圆角含多个独立角值，
> **无法通过 `set_variables` 注入**，设计时必须在 `batch_design` 中直接传数组。
> Q0.5 完成 Token 变量注入后，还需读取本节，在创建对应节点时应用以下约束。

<!--
| 节点类型 | 属性 | 值 | 说明 |
|---------|------|----|------|
| sidebar | cornerRadius | [0, 24, 24, 0] | 示例：JiNan 左导航右侧弧形（覆盖时替换） |
| nav item（所有） | cornerRadius | 40 | 示例：导航项全圆角（覆盖时替换） |
| tab item | cornerRadius | [6, 6, 0, 0] | 示例：Tab 页签上圆下直角（覆盖时替换） |
-->
```

---

### project-typography.md（排版规范，空模板）

```markdown
# {项目名} 项目排版规范

> 与全局默认一致时无需填写；发现差异时在此记录，并更新索引中的「是否有项目覆盖」列。

<!--
## 字号基准

全局默认：font/size/base = 14px
本项目：<!-- TODO：若有覆盖请填写 -->

| 语义 | Pencil Variable | 本项目值 | 全局默认 |
|------|----------------|---------|---------|
| 辅助文字 | font/size/sm      | | 12 |
| 正文基准 | font/size/base    | | 14 |
| 小标题   | font/size/lg      | | 16 |
| 大标题   | font/size/display | | 20 |

## 字体栈

| 用途 | Variable | 全局默认 | 本项目覆盖 |
|------|----------|---------|----------|
| 中文正文 | font/family/zh      | PingFangSC-Regular  | |
| 中文加粗 | font/family/zh-bold | PingFangSC-Semibold | |
| 英文/数字 | font/family/en     | Inter               | |
-->
```

---

### project-patterns.md（组件模式 & 导航结构，空模板）

```markdown
# {项目名} 项目组件模式 & 导航结构

> 与全局默认一致时无需填写；发现差异时在此记录，并更新索引中的「是否有项目覆盖」列。
> 全局规范参考：opt-b-admin-pencil-design/core/patterns/ 和 core/components/

<!--
## 导航结构
全局默认：侧边导航（shell-standard.md）
本项目：

## 表格模式
是否含工具栏：
是否含状态 Tab 筛选：
行高：

## 弹出层规范
Drawer 宽度：
Modal 尺寸规范：

## 领域专属模式（如安全领域的风险等级徽标）
-->
```

---

## 克隆模式补充说明

克隆全局时，读取以下文件并提取对应内容写入子文件：

| 子文件 | 读取来源 | 提取重点 |
|--------|---------|---------|
| `project-tokens.md` | `tokens-variables.md` JSON 变量块 | 全量变量，每行追加 `⚠️ 克隆自全局` |
| `project-layout.md` | `tokens-variables.md` `layout/*` 变量 + `core/patterns/shell-standard.md` | 画布 1440 / 侧边栏 240 / 顶栏 64 / padding 24 |
| `project-typography.md` | `tokens-variables.md` `font/*` 变量 | 字号值 + 字体栈 |
| `project-patterns.md` | `core/patterns/` 和 `core/components/` 文件名列表 | 链接清单 + "与全局一致，按需覆盖"说明 |

> 克隆写入后所有状态列标注 `⚠️ 克隆自全局，待修改`，提醒用户逐维度对比项目实际情况修改。

---

## 健康检查模式（health-check）

**触发词**：「检查设计系统健康度」/ 「design system health」/ 「design system drift」/ 「检查 Token 一致性」

**目的**：持续检测设计系统文件的完整性和与代码的一致性，构成"文档园丁"机制，防止 Token drift 积累。

### 执行步骤

**Step H1：文件存在性检查**

检查 `.cursor/skills/design-system/skills/` 下的 5 个文件是否存在：
- `project-design-system.md`
- `project-tokens.md`
- `project-layout.md`
- `project-typography.md`
- `project-patterns.md`

若任一文件缺失 → 在报告中标注「文件缺失」，建议运行 `create-project-design-system` 补全。

**Step H2：TODO 覆盖率统计**

读取各子文件，统计：
- `<!-- TODO: 待确认 -->` 数量
- `<!-- TODO -->` 数量
- `⚠️ 克隆自全局，待修改` 数量

输出各文件的 TODO 计数，总计待处理项数。

**Step H3：裸 hex drift 扫描**

读取 `project-patterns.md`，扫描所有 `#[0-9a-fA-F]{3,8}` 格式的裸 hex 值：
- 统计裸 hex 数量
- 与 `project-tokens.md` 中的变量值做匹配，识别哪些能替换为 Token 变量
- 读取 `project-tokens.md`，检查阴影 section 是否缺少 Pencil Variable 列

**Step H4：Token vs 代码一致性检查**

检查 `src/theme/` 目录是否存在：
- **存在** → 读取目录下的 CSS/TS 文件，提取 CSS 自定义属性或 AntD Token 颜色值
  - 与 `project-tokens.md` 的品牌色、状态色对比
  - 识别不一致项（代码中有但 Token 文件没有记录，或数值不同）
- **不存在** → 跳过此步，在报告中注明「未检测到 src/theme/ 目录」

**Step H5：输出健康评分报告**

```markdown
## 设计系统健康报告
生成时间: {YYYY-MM-DD HH:mm}

### 健康评分
文件完整性：{X/5 个文件存在}
Token 覆盖率：{(总变量 - TODO数) / 总变量 × 100}%
drift 指数：{裸 hex 数量} 处裸 hex / {Token vs 代码不一致数} 处代码不一致

### 待处理项
| 类别 | 数量 | 位置 |
|------|------|------|
| TODO 待确认 | X | project-tokens.md × N, project-layout.md × M |
| 克隆自全局待修改 | X | ... |
| 裸 hex 值（可替换为 Token）| X | project-patterns.md |
| 裸 hex 值（无对应 Token）| X | project-patterns.md（建议补充 Token）|
| Token vs 代码不一致 | X | src/theme/ |

### 修复建议
- 裸 hex → Token 替换：运行 `normalize` skill 自动处理（{X} 处可自动替换）
- Token vs 代码不一致：建议人工核对后以 project-tokens.md 为准更新 src/theme/
- TODO 项：重新运行 create-project-design-system（provide 路径）补充缺失信息
```

**Step H6：AskQuestion 询问是否修复**

```
AskQuestion(
  prompt: "健康报告已生成。是否立即修复可自动处理的问题？",
  allow_multiple: true,
  options: [
    { id: "normalize", label: "运行 normalize 替换 {X} 处裸 hex 为 Token 变量（仅 project-patterns.md）" },
    { id: "fix-todos", label: "重新进入 provide 流程，补充 {N} 处 TODO 项" },
    { id: "skip",      label: "仅查看报告，稍后手动处理" }
  ]
)
```

- 用户选 **normalize** → 读取 `~/.cursor/skills/normalize/SKILL.md`，对 `project-patterns.md` 执行 Token 对齐修复
- 用户选 **fix-todos** → 进入渐进式 provide 流程（Step 1e），只填写有 TODO 的维度
- 用户选 **skip** → 输出报告后结束
