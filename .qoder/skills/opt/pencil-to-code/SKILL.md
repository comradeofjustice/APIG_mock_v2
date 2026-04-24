---
name: opt-pencil-to-code
description: 将 Pencil 设计稿转换为带完整交互逻辑的 Vue 3 代码。当用户说"根据 Pencil 画板生成代码"、"把这个设计还原成代码"、"跑一下这个设计稿"、"Figma 导入 Pencil 后生成页面"、"帮我把设计变成可运行的代码"、"根据这几个画板做带交互的页面"时，必须使用此 skill。即使用户没有明确说"Pencil"，只要涉及设计稿→代码的转换流程，也应优先调用此 skill。
layer: 1
---

# Pencil → Code

将 Pencil 画板设计稿转换为可运行的、带完整交互逻辑的 Vue 3 代码。

---

## 流程前置：会话开始前确认

**在涉及「设计 + 规范 + 代码」的复杂任务时**，先与用户确认 Skills 和模式，避免返工：

### 适用场景

- 用户说「设计一个 XXX 页面」「画个 XXX 模块」
- 任务同时涉及 Pencil 设计 + 设计系统规范 + 代码生成
- 用户未明确指定使用哪个 skill 或模式

### 标准确认语

> **本次任务打算怎么配合？**  
> 1. **设计阶段（独立判断）**：是否使用 `opt-b-admin-pencil-design`（Pencil Variables）？  
>    - 是 → 设计时就用 `$variable`（颜色/间距/字体），避免硬编码，后续主题/代码映射更稳定  
>    - 否 → 允许硬编码（更快），但后续对齐设计系统可能需要补变量替换  
> 2. **代码阶段（独立判断）**：用 **design-system 模式**（das-component-vue + Token）还是 **faithful 模式**（像素级还原）？  
> 3. 若用户说「直接来」「按规范来」→ **分别按默认推断**：设计阶段默认用 Variables；代码阶段默认用 design-system（若项目存在设计系统组件库）

### 可跳过确认的场景

- 用户已在消息中明确说了模式或 skill
- 简单单步任务（如「加个按钮」「改个颜色」）
- 用户说「快」「直接做」→ 按默认推断执行，不再追问

---

## 模式选择

在开始前，先判断使用哪种模式：

| 问题 | 结果 |
|------|------|
| 是否同时激活了 `b-admin-design-system` skill？ | 是 → **design-system 模式** |
| 是否用户明确说"忠实还原"/"不要改组件"/"按设计稿来"？ | 是 → **faithful 模式** |
| 其他情况（默认） | **faithful 模式** |

- **faithful 模式** → 读取 [`references/faithful-mode.md`](references/faithful-mode.md)
- **design-system 模式** → 读取 [`references/design-system-mode.md`](references/design-system-mode.md)

---

## 工作流总览

```
第零步：识别项目组件库（必做，见「## 组件库识别」章节）
  └── 读取 project_description.md 获取声明的技术栈
  └── 抽样扫描 src/views/ 下 1-2 个现有 .vue 文件确认实际使用的组件前缀
  └── 输出识别结论，告知用户将采用哪套组件库生成代码

第一步：读取设计
  └── 用 get_editor_state 确认当前文件和 Selected Elements
  └── ⛔️ 阻断·画板范围确认（必须执行，不可跳过）：
      解析 get_editor_state 返回的 Selected Elements 字段：
        - 有选中的顶层 frame（type=frame/artboard）
            → 以这些帧为唯一代码生成范围
            → batch_get 只读这些帧，不扩展到其他画板
            → 在第三步「与用户确认」中注明"本次范围由 Pencil 选中帧决定：{帧名列表}"
        - 无选中节点（"No nodes are selected"）
            → 调用 AskQuestion，从 .pen 顶层 frame 列表中让用户选择目标画板
            → 等待用户回复后再执行 batch_get
  └── 用 batch_get 读取【仅目标帧】的节点树
  └── 用 get_screenshot 获取视觉截图（可选，帮助理解布局）

第二步：理解设计意图
  └── 识别页面类型（列表/详情/表单/Dashboard）
  └── 识别组件和状态
  └── 跨画板识别交互关系（多个画板 = 多个状态）
  └── 读取 references/interaction-patterns.md 匹配标准交互

第三步：与用户确认
  └── 列出识别到的组件和交互意图
  └── 询问缺失信息（API 接口/路由/特殊逻辑）

第四步：生成代码
  └── 按模式和识别到的组件库生成 Vue 3 代码
  └── 确保交互逻辑完整（不只是静态 UI）
```

---

## 读取 Pencil 画板的方法

### 1. 获取当前状态
```
get_editor_state()  → 确认活跃文件和选中节点
```

### 2. 读取画板内容
```
batch_get(
  patterns: ["artboard-name/*"],    // 读取画板下所有节点
  nodeIds: ["artboard-id"]          // 或直接用 ID
)
```

### 3. 识别多状态画板

如果用户提供了多个画板，按以下规则推断对应关系：

| 画板命名规律 | 推断含义 |
|------------|---------|
| `页面名-默认` / `页面名` | 主状态 |
| `页面名-弹窗` / `页面名-modal` | 弹窗打开态 |
| `页面名-空状态` / `页面名-empty` | 无数据态 |
| `页面名-加载` / `页面名-loading` | 加载态 |
| `页面名-详情` / `页面名-drawer` | 侧滑/详情态 |
| 多个相似画板 | 逐一截图对比差异，推断交互触发条件 |

---

## 代码输出规范

### 文件结构
```
{outputDir}/<模块名>/<页面名>/
├── index.vue          ← 主页面组件
├── components/        ← 拆分的子组件（复杂页面）
│   ├── XxxCard.vue
│   └── XxxModal.vue
└── composables/       ← 可复用逻辑（可选）
    └── useXxx.ts
```

`{outputDir}` 由下方「输出目录确认」步骤提供，默认值为 `src/views`。

### Vue 3 代码规范
- 使用 `<script setup>` + Composition API
- 响应式数据用 `ref` / `reactive`
- 异步操作用 `async/await` + `loading` 状态
- 使用 Mock 数据代替真实 API（除非用户提供接口）
- 保留 `TODO: 替换为真实 API` 注释
- **组件选用以「组件库识别」步骤的结论为准**，不硬编码特定库；混用不同前缀的组件会导致样式冲突，严格禁止

### 页面根元素样式（必须包含）

该项目的 layout 容器不提供内边距，每个页面必须在根元素自行设置：

```css
.xxx-page {
  display: flex;
  flex-direction: column;
  gap: 16px;       /* 或 20px，视内容区块间距而定 */
  padding: 24px;   /* 必须：layout 不提供，页面自己加 */
  min-height: 100%;
  background: #f5f6fa;  /* 页面背景色 */
}
```

漏掉 `padding: 24px` 会导致内容贴边，是高频遗漏点。

### 交互必须包含的内容
- 加载状态（skeleton 或 spin）
- 空状态（无数据时的提示）
- 错误处理（请求失败提示）
- 操作反馈（成功/失败 message）

详细的交互模式 → 读取 [`references/interaction-patterns.md`](references/interaction-patterns.md)

---

## 组件库识别（生成代码前必做）

在生成任何代码之前，先识别项目实际使用的 UI 组件库，确保生成的组件调用与项目保持一致。

### Step 1 — 读取 `project_description.md`

若文件存在，提取 `## 技术栈` 或 `Tech Stack` 节中声明的 UI 库（如 `Ant Design Vue`、`Element Plus`、`iView` 等）作为初始参考。

### Step 2 — 抽样验证实际代码

用 Glob 工具查找 `src/views/**/*.vue`，随机读取 1-2 个**近期修改的**页面文件，检查：
- `<template>` 中出现的组件前缀（`a-`、`el-`、`das-`、`i-` 等）
- `<script>` 中的 import 语句（如 `from 'ant-design-vue'`、`from 'element-plus'`）

> 注意：`project_description.md` 记录的可能是旧技术栈，以实际代码文件为准。

### Step 3 — 映射代码生成策略

| 识别到的前缀 / import | 组件库 | 代码生成策略 |
|---|---|---|
| `das-table` / `das-drawer` 等 | DAS Components | 优先使用 `das-*` 组件 |
| `a-table` / `ant-design-vue` | Ant Design Vue | 使用 `a-*` 组件，`v-model:value` 写法 |
| `el-table` / `element-plus` | Element Plus | 使用 `el-*` 组件 |
| `i-table` / `view-design` | iView / ViewUI | 使用 iView 组件，`v-model` 写法 |
| 混用 | 多库共存 | 按项目声明优先级（DAS > Antd > 其他） |

若检测到项目 rules 目录下的 `component-library-standards.mdc`（`./.cursor/rules/component-library-standards.mdc`），则读取以获取项目的组件优先级声明；否则读取全局 rules 目录下的 `component-library-standards.mdc`（Cursor：`~/.cursor/rules/component-library-standards.mdc`，Claude：`~/.claude/rules/component-library-standards.mdc`）。

### Step 4 — 向用户汇报

在对话中输出一行识别摘要，格式如下：

> 「识别到组件库：**Ant Design Vue**（`a-*`），代码将使用 Ant Design Vue 风格生成。」

后续所有生成的代码必须遵守此结论，不得混用其他库的组件。

**识别失败时的兜底**：若无 `project_description.md` 且 `src/views/` 目录为空或不存在，默认使用 Ant Design Vue，并在汇报中注明「未找到现有代码，默认使用 Ant Design Vue」。

---

## 输出目录确认（生成代码前必做）

在生成任何代码之前，先确定 `{outputDir}`：

1. **读取 `project_description.md`**（若存在）
   - 查找 `## Project Config` 节下是否有 `Frontend Output Dir: <路径>` 字段
   - **找到** → 直接使用该路径作为 `{outputDir}`，在对话中提示：
     > 「使用已保存的代码输出目录：`<路径>`」
   - **未找到** → 进入步骤 2

2. **询问用户**（调用 AskUserQuestion 工具）：
   > 「请输入前端代码存放的根目录（直接回车使用默认值 `src/views`）：」
   - 用户输入或确认后，再问：
   > 「是否将 `<路径>` 设为此项目的默认输出目录？（选"是"后以后不再询问）」

3. **用户选"是（设为默认）"** → 将以下内容追加/更新到 `project_description.md`：
   ```markdown
   ## Project Config

   Frontend Output Dir: <用户输入的路径>
   ```
   若文件中已有 `## Project Config` 节，仅更新 `Frontend Output Dir` 行；若无则新增该节。

4. **用户选"否（仅本次）"** → 本次使用该路径，不写入文件，下次代码生成时仍会询问。

---

## 与用户确认的标准问题

在生成代码前，若以下信息不明确，停止并调用 AskUserQuestion 工具进行澄清，主动询问：

1. **页面路由**：这个页面的路由路径是什么？（如 `/security/playbook`）
2. **接口信息**：有真实 API 接口吗，还是先用 Mock 数据？
3. **交互范围**：哪些交互必须实现？哪些可以先留空？
4. **特殊业务逻辑**：画板中有没有特殊的权限控制或业务规则？

若用户说"先做 Mock 就好"或"直接生"，则跳过询问，用合理的 Mock 数据直接生成。

---

## 路由注册后必须验证可访问性

代码和路由完成后，提醒用户直接浏览器访问该路径：

- **`meta.public = true` 的真实含义**：跳过已登录用户的权限 ID 校验，**不是**免登录
- 未登录用户仍会被重定向到 `/login`，与 `meta.public` 无关
- 若被拦截：检查路由守卫文件（通常是 `router/guard.ts`），看是否有白名单数组（如 `WHITE_LIST`），开发调试阶段将路径加入即可
- **dev server 端口**以终端输出的 `Local:` 地址为准，端口冲突时 Vite 会自动递增（3000 → 3001 → …）

---

## 还原度校验（代码生成完成后、harden 之前执行）

代码生成并路由可达后，获取浏览器截图与设计稿截图进行对比，逐项评估：

**布局结构**：主要区块的相对位置和比例是否与设计稿一致

**视觉样式**：
- 颜色：主色/背景色/文字色是否对应 Token 值
- 间距：关键区块的 padding/gap 目测误差是否在可接受范围内
- 字体：字号/字重层级是否与设计稿一致

**组件状态**：默认态、空态、加载态的渲染是否正确

**输出格式**（在对话中简要呈现）：

| 检查项 | 设计稿描述 | 实际渲染 | 结论 |
|---|---|---|---|
| 整体布局 | ... | ... | 通过 / 偏差 |
| 颜色 | ... | ... | 通过 / 偏差 |
| 间距 | ... | ... | 通过 / 偏差 |
| 字体层级 | ... | ... | 通过 / 偏差 |
| 组件状态 | ... | ... | 通过 / 偏差 |

发现偏差直接在当前文件修复，修复项纳入完成摘要，不单独输出报告。
