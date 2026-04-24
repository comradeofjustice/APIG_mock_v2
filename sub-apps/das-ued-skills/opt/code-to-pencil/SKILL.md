---
name: code-to-pencil
description: 代码→Pencil 设计稿 Skill。三种模式：①全流程管线内增量回写（自动读取 Code↔Frame 映射和 Token Bridge）；②独立使用增量更新已有 .pen 文件；③从零生成——扫描代码库逆向生成等质量 Pencil 设计稿（无需已有 .pen 文件）。触发词：「代码改了，同步到设计稿」「更新 Pencil 画板」「把代码变更写回设计稿」「code to pencil」「回写设计稿」「从代码生成设计稿」「逆向生成 Pencil」「代码没有设计稿」。
layer: 2
---

# Code → Pencil 设计稿回写

将代码与 Pencil 设计稿双向同步。支持三种模式：增量回写已有 .pen 文件，或从零从代码逆向生成全新设计稿。

---

## 使用时机

- Stage 4 代码完成后，UI 实现与 Pencil 设计稿存在偏差（增量回写）
- 代码阶段修复了设计 P1 问题（增量回写）
- 有代码但完全没有 Pencil 设计稿，需要从零建立设计文档（从零生成）
- 用户说"代码改了，同步到设计稿"、"从代码生成设计稿"、"逆向生成 Pencil"等

---

## 【模式检测（执行前必须判断，优先执行）】

```
全流程模式判定（以下条件全部满足）：
  □ docs/ux/{模块名}/session-state.md 存在
  □ session-state.md 含 ## Code↔Frame 映射 节
  □ session-state.md 含 ## Token Bridge 节
  □ 目标 .pen 文件路径可从 session-state.md 读取

→ 全流程模式：
    读取 ## Code↔Frame 映射 → 自动建立 Vue 文件 ↔ 画板 ID 对应关系
    读取 ## Token Bridge → 自动建立 CSS Token → Pencil $variable 映射
    跳过 Step 0 和所有"请用户确认映射"的 AskQuestion

→ 独立使用模式（session-state 缺失，但 .pen 文件存在）：
    进入 Step 0，逐项收集必要信息
    所有映射关系需用户手动确认

→ 从零生成模式（.pen 文件不存在，或用户明确说"从零"/"没有设计稿"）：
    进入 Step 0，用户选择「从零生成」后跳转至 Step G0
```

> **从零生成模式判定信号**（以下任一条件触发）：
> - 用户说"没有设计稿"、"从零生成 Pencil"、"逆向生成"、"代码没有 .pen 文件"
> - Step 0 执行后，用户指定的 .pen 文件路径不存在
> - 全流程模式检测时 .pen 文件路径缺失（降级为从零生成而非报错）

---

## Step 0：路径自定义（独立使用模式 / 从零生成模式执行）

```
AskQuestion(
  prompt: "请指定本次操作的来源和目标：",
  options: [
    { id: "auto",       label: "自动推断——提供模块名，使用全流程标准路径（.pen 文件须已存在，增量更新）" },
    { id: "manual",     label: "手动指定——我来提供代码文件路径和 .pen 文件路径（.pen 须已存在，增量更新）" },
    { id: "create_new", label: "从零生成——目标 .pen 文件不存在，从代码逆向生成完整设计稿" }
  ]
)
```

- 选"自动" → 收集模块名，按 `{模块名}.pen` 和 `src/views/{模块名}/` 推断路径；若 .pen 文件不存在自动转为「从零生成」
- 选"手动" → 依次收集：
  1. 代码文件路径（可多个）
  2. .pen 文件路径；若文件不存在自动转为「从零生成」
- 选"**从零生成**" → **跳转至 Step G0**，不进入执行前提检查

---

## 【从零生成流程 Step G0-G4】（仅从零生成模式执行，完成后直接到输出摘要，不进入下方执行前提检查）

```
Step G0：确认页面范围 + 生成路径 + 生成方式

  扫描范围确认：
    Glob src/views/**/*.vue → 列出所有页面级组件（排除 components/ 子目录内的非页面组件）
    Glob src/router/**/*.{ts,js} → 提取路由结构和页面名称
    展示检测到的页面列表
    AskQuestion(
      prompt: "以下页面将被扫描并生成 Pencil 画板，请勾选本次需要还原的范围：",
      allow_multiple: true,
      options: [每个检测到的页面文件一个 option，含路由路径和文件名]
    )

  输出路径确认：
    若用户已在 Step 0 提供路径 → 使用该路径
    否 → 询问：新 .pen 文件保存路径（默认：{模块名}.pen，与项目根目录同级）

  生成方式选择：
  AskQuestion(
    prompt: "选择设计稿生成方式：",
    options: [
      { id: "screenshot", label: "截图模式——启动 dev server，以运行截图为参考在 Pencil 还原页面结构（视觉还原度高，需要运行环境）" },
      { id: "code_parse", label: "代码解析模式——从 Vue 模板结构直接推断 Pencil 节点树（不需要运行环境，依赖代码结构规范性）" }
    ]
  )

Step G1：创建 .pen 文件 + 注入 Token

  查找组件库模板文件：
    Glob **/*das-component*.pen 或 **/*component*.pen → 找到后执行：
    Shell: cp "{组件库模板路径}" "{目标.pen路径}"
    若未找到 → open_document("new") 创建空文件，
               提示用户：「未找到组件库模板，将从空文件开始，建议检查是否有 .pen 模板可复用」

  open_document("{目标.pen路径}")
  get_editor_state() 确认文件已打开

  按 pencil-token-refresh.mdc 规则注入 Token：
    读取 project-tokens.md（优先）或 project_description.md 获取品牌色等 Token 值
    调用 set_variables() 写入正确的 Token 值
    确认 $color/brand/normal 等核心变量值正确

  将 Token Bridge 映射写入 session-state.md（若存在）：
    追加 ## Token Bridge 节，记录 CSS 变量 ↔ Pencil $variable 对应关系

Step G2A：截图模式路径（用户在 G0 选择 "screenshot"）

  启动 dev server（检查是否已运行，若未运行）：
    Shell: npm run dev 或 vite（后台执行）
    等待 "Local: http://localhost:" 字样出现（超时 30s 提示用户手动启动）

  对每个选定页面依次执行：
    在对话中请求截图：「请在浏览器访问 {路由路径} 并截图，或提供页面截图」
    以截图为参考，调用 opt-b-admin-pencil-design/SKILL.md 的「标准整页分批顺序」生成节点：
      在 .pen 文件中新建对应画板（命名：{页面中文名} 或 {路由名称}）
      按层级顺序生成：Shell 结构 → Header → Toolbar/筛选区 → 表格/内容区 → 操作列/弹窗
      颜色全部使用 $variable 引用（强制规则，不使用裸 hex）

Step G2B：代码解析模式路径（用户在 G0 选择 "code_parse"）

  对每个选定页面依次执行：
    Read Vue 文件，提取模板结构：

      顶层布局检测：
        el-container / a-layout 等 → 识别为整体容器
        el-header / a-layout-header → 识别为顶部栏
        el-main / a-layout-content → 识别为主内容区
        el-drawer / el-dialog / a-modal → 识别为抽屉/弹窗

      主要区块提取：
        含 el-form / a-form → 识别为搜索筛选区
        含 el-table / a-table → 识别为表格区（提取列定义作为字段）
        含 el-button 的 toolbar div → 识别为操作区（提取按钮文字）
        el-pagination / a-pagination → 识别为分页区

      组件类型映射到 Pencil（参考 opt-b-admin-pencil-design/SKILL.md 规范）：
        el-button / a-button → Pencil 按钮组件
        el-input / a-input  → Pencil 输入框组件
        el-select / a-select → Pencil 下拉组件
        el-table-column 的 label → Pencil 表头文本
        el-tag / a-tag → Pencil 状态标签组件

      颜色/样式提取：
        CSS Token 变量（var(--color-brand) 等）→ 通过 Token Bridge 转为对应 Pencil $variable
        若 Token Bridge 未建立 → 按情形 B/C（同独立使用模式中的变量体系检测）确认映射

    按提取的模板结构，在 .pen 文件中新建对应画板，执行 batch_design 生成节点树：
      遵循 opt-b-admin-pencil-design/SKILL.md 的节点命名规范和布局规范
      颜色全部使用 $variable 引用（强制规则，不使用裸 hex）

Step G3：批量截图校验

  get_screenshot 对每个生成的画板截图
  对照代码结构（或用户提供的截图）检查还原度：
    - 关键区块是否存在（Header / 搜索区 / 表格 / 操作列）
    - 颜色是否正确（品牌色 $variable 是否已应用）
    - 字段名称是否与代码一致
  发现差异 → 直接用 batch_design 修复后重新截图确认

Step G4：生成设计产物文档

  创建 / 更新 design-checklist.md：
    Write docs/ux/{模块名}/design-checklist.md
    所有生成画板标记为：「从代码逆向生成（{生成方式: 截图/代码解析}，{日期}）」

  若 session-state.md 存在，追加记录：
    - code-to-pencil 从零生成：{N} 个画板（模式：{screenshot/code_parse}，{日期}）

  追加 Code↔Frame 映射到 session-state.md（若存在）：
    记录每个 Vue 文件路径 ↔ 生成的 Pencil 画板 ID/名称
```

---

## 执行前提检查

```
1. 目标 .pen 文件是否可访问？
   全流程模式：从 session-state.md 读取路径
   独立使用模式：用户在 Step 0 指定的路径
   否 → 停止，提示用户确认 .pen 文件路径或先在 Pencil 中新建

2. 变更来源是否明确？（至少满足一项）
   - 用户描述了 UI 改动内容
   - 用户指定了改动文件路径（可 Read）
   - session-state.md「已知问题」中有"修复路径: code"的 P1 问题
   全部缺失 → 调用 AskQuestion（见「变更来源空白处理」）

3. 全流程模式：读取 design-checklist.md 了解画板清单
   独立使用模式：跳过（design-checklist.md 可能不存在）
```

**变更来源空白处理**（三项来源均不满足时）：
```
AskQuestion(
  prompt: "请提供本次回写的变更来源（至少一项）：",
  options: [
    { id: "describe", label: "我来描述 UI 改动内容" },
    { id: "file",     label: "提供代码文件路径" },
    { id: "git",      label: "使用 git diff 查看最近变更（需在 git 仓库中）" }
  ]
)
- 选"描述" → 等待用户输入后继续
- 选"文件" → 等待用户提供路径后 Read
- 选"git"  → Shell: git diff HEAD~1 --name-only，列出变更文件后 Read
```

---

## 执行流程

```
Step 1：打开设计文件 + 变量体系检测

  open_document("{.pen 文件路径}")
  get_editor_state 确认当前活跃文件
  batch_get 获取所有顶层 frame 名称和节点 ID

  变量体系检测（独立使用模式必须执行；全流程模式已有 Token Bridge，跳过检测）：
    调用 get_variables() 获取 .pen 文件的变量列表

    情形 A：变量列表为空（未配置设计变量）→ 询问：
    AskQuestion(
      prompt: "目标 .pen 文件没有设计变量。颜色回写如何处理？",
      options: [
        { id: "hex",          label: "使用代码中的颜色值（裸 hex 写入，不绑定变量）" },
        { id: "inject",       label: "先注入全流程标准 Token（运行 pencil-token-refresh），再回写变量引用" },
        { id: "skip_color",   label: "跳过颜色类变更，只回写布局和文本" }
      ]
    )

    情形 B：变量列表存在但命名不符合 $color/brand/* 规范
    （判断依据：无 color/brand/normal 等标准变量名）→ 询问：
    AskQuestion(
      prompt: "目标文件的变量命名与全流程规范不符（检测到：{现有变量名示例}）。颜色回写时：",
      options: [
        { id: "keep_source",  label: "保持源文件变量名（回写时映射到现有变量）" },
        { id: "use_standard", label: "按全流程规范命名（需先重命名现有变量，存在风险）" },
        { id: "use_hex",      label: "忽略变量，直接写裸 hex（设计稿与 Token 脱钩）" }
      ]
    )

    情形 C：变量列表符合全流程规范 → 直接构建 CSS → Pencil $variable 映射表，继续执行

Step 2：分析代码变更 + 建立映射关系

  代码变更分析：
    若用户提供了文件路径 → Read 对应文件，提取 UI 变更
    若用户描述了改动 → 根据描述推断需更新的设计元素
    若来自 session-state.md P1 问题 → 读取问题描述，推断对应 Pencil 节点

  将变更分类：
    A. 文本/标签变更 → 更新对应节点的 text 属性
    B. 布局/间距变更 → 更新 padding / gap / width / height
    C. 颜色/样式变更 → 更新 fillColor / textColor（按 Step 1 确定的颜色策略处理）
    D. 组件新增 → 在对应 frame 中插入新节点
    E. 组件删除 → 删除对应节点

  CSS Token 映射（颜色类变更时）：
    全流程模式：读取 session-state.md 的 ## Token Bridge 节，直接映射
    独立使用模式（情形 B keep_source）：展示检测到的 CSS Token，逐项询问对应 Pencil 变量：
      "检测到 CSS Token {var(--xxx)}，请选择对应的 Pencil 变量："
      options: [现有 .pen 变量列表 + 「跳过此项」]
    独立使用模式（情形 A hex / 情形 B use_hex）：提取代码中的颜色 hex，直接写入

  画板映射确认（独立使用模式）：
    全流程模式：读取 session-state.md 的 ## Code↔Frame 映射 节，自动对应
    独立使用模式（代码文件名与 Pencil 画板名不能自动对应时）：
    AskQuestion(
      prompt: "请确认「{Vue文件名}」对应的 Pencil 画板：",
      options: [batch_get 返回的顶层 frame 列表，每个 frame 一个 option]
    )
    对每个无法自动对应的代码文件执行此确认

Step 3：变更确认（调用 AskQuestion）

  列出推断出的 Pencil 变更点，请用户确认：
  AskQuestion(
    prompt: "根据代码变更，以下设计稿内容需要更新，请确认：",
    allow_multiple: true,
    options: [每个变更点一个 option，含描述和影响的画板名称]
  )
  - 用户勾选的变更点 → 执行回写
  - 用户未勾选的变更点 → 跳过

Step 4：执行 Pencil 回写

  使用 batch_design 对用户确认的变更点执行更新操作：
  - 文本变更 → U("nodeId", { text: "新文本" })
  - 颜色变更 → 按 Step 1 确定的策略：
      变量引用模式 → U("nodeId", { fillColor: "$color/brand/normal" })
      裸 hex 模式  → U("nodeId", { fillColor: "#hex值" })
  - 布局变更 → U("nodeId", { padding: "N N N N" })
  - 新增节点 → I("parentId", { ... })
  - 删除节点 → D("nodeId")

  全流程模式额外遵守颜色绑定强制规则：
    - 品牌色、状态色、风险色必须用 $variable 引用，禁止裸 hex
    - 阴影 effect.color 字段例外，可用 hex

Step 5：视觉验证

  get_screenshot 截取更新后的画板，确认变更已正确应用
  若视觉异常 → 用 batch_design 修复后重新截图

Step 6：更新 design-checklist.md（若存在）

  全流程模式：在对应画板条目末尾追加：
    "（代码回写更新：{变更描述}，{日期}）"
  独立使用模式：若 design-checklist.md 不存在，跳过此步骤，在输出摘要中说明

Step 7：版本记录

  全流程模式：在 session-state.md「已完成」节追加：
    - Stage 4 → Pencil 回写：{N} 处变更（画板：{画板名称列表}）
  独立使用模式：跳过（无 session-state.md）
    可选：在 .pen 文件同目录写入 code-to-pencil-log-{YYYYMMDD}.md 作为独立记录
```

---

## 颜色变更策略汇总

| 场景 | 颜色写法 |
|------|---------|
| 全流程模式 / 独立使用情形 C（变量符合规范） | `"$color/brand/normal"` 等变量引用 |
| 独立使用情形 B keep_source（保持源文件变量） | `"$现有变量名"` |
| 独立使用情形 A hex / 情形 B use_hex | `"#hex值"` 直接写入 |
| 独立使用情形 A inject（先注入标准 Token） | 注入完成后等同于情形 C |
| 阴影 effect.color（所有模式） | `"#hex值"`（Pencil 限制，无法绑定变量） |

若代码中使用了 CSS Token 变量（如 `var(--color-brand)`），优先通过 Token Bridge 或用户确认映射到对应的 Pencil `$variable`。

---

## 输出摘要（对话中呈现）

**增量回写模式**：
```
## Pencil 设计稿回写完成

模式：{全流程 / 独立使用}
颜色策略：{变量引用 / 裸 hex / 跳过颜色}
画板映射：{自动（从 session-state.md）/ 用户确认}

已更新画板：{画板名称列表}
变更点 {N} 处：
- {变更描述 1}（画板：{画板名}，节点：{节点类型}）
- {变更描述 2}：...

截图已验证 ✅

跳过 {M} 处（用户未确认）
```

**从零生成模式**：
```
## Pencil 设计稿从零生成完成

模式：从零生成（代码逆向）
生成方式：{截图模式 / 代码解析模式}
扫描页面：{N} 个（{页面名列表}）

生成画板：{N} 个
- {画板名 1}：{主要区块描述}
- {画板名 2}：...

Token 注入：✅ 已注入（来源：{project-tokens.md / project_description.md}）
颜色绑定：✅ 全部使用 $variable 引用

截图验证：✅ {N} 个画板已验证

⚠️ 由代码逆向生成，视觉还原为近似效果，建议对照实现截图核对细节

新建文件：{.pen 文件路径}
设计清单：docs/ux/{模块名}/design-checklist.md（已创建）
```

---

## 质量门控（自检）

**通用（所有模式）**：
- [ ] 模式检测已执行（全流程 / 独立使用 / 从零生成）
- [ ] 输出摘要已呈现（含模式标注）

**增量回写模式额外检查**：
- [ ] 全流程模式：已从 session-state.md 读取 Code↔Frame 映射和 Token Bridge
- [ ] 独立使用模式：变量体系检测已执行，用户已选择颜色策略
- [ ] 所有用户确认的变更点都已通过 batch_design 更新
- [ ] 颜色变更符合选定策略（全流程模式强制变量引用，阴影例外）
- [ ] get_screenshot 截图确认视觉正确
- [ ] 全流程模式：design-checklist.md 已追加变更记录
- [ ] 全流程模式：session-state.md 已更新
- [ ] 未修改用户未确认的节点

**从零生成模式额外检查**：
- [ ] Step G0 页面范围已由用户勾选确认
- [ ] .pen 文件从组件库模板复制（或新建并说明原因）
- [ ] Token 已通过 pencil-token-refresh.mdc 流程注入，品牌色变量值正确
- [ ] 所有颜色使用 $variable 引用，未使用裸 hex（阴影 effect.color 例外）
- [ ] Step G3 截图校验已完成，关键区块与代码一致
- [ ] design-checklist.md 已创建，画板标注「从代码逆向生成」
- [ ] Token Bridge 和 Code↔Frame 映射已写入 session-state.md（若存在）
- [ ] 生成内容基于代码事实，未虚构代码中不存在的 UI 元素
