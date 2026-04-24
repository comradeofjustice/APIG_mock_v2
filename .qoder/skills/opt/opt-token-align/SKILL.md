---
name: opt-token-align
description: >-
  将项目设计系统 project-tokens.md（Priority ①）自动对齐到各技术栈的主题配置文件，
  确保组件库 Token、LESS 变量与 CSS 自定义属性均与设计系统一致。
  支持多技术栈：Ant Design Vue（ConfigProvider Token 四层架构）、
  View Design / iView / Soul UI（LESS 变量 + CSS 覆盖三层架构）、
  通用 CSS 变量（兜底适配器）。
  支持独立调用和 **das-prd-ux-code-universal** 全流程管线两种模式。
  当用户说"对齐 Ant Design token"、"das-component-vue 没有注入设计系统"、
  "DAS 组件设计系统对齐"、"ant token 对齐"、"@opt-token-align"、
  "@token-align"、"主题 token 不一致"、"组件库设计系统注入"、
  "CSS 变量和设计稿不一致"、"主题色不对"、"页面背景色不对"、
  "View Design Token 对齐"、"Soul UI 主题对齐"、"iView 样式对齐"、
  "LESS 变量对齐"、"设计系统颜色不对"时使用此技能。
---

# token-align — 设计系统 Token 对齐（多技术栈通用）

## 适用场景

- 项目引入 `ant-design-vue` 或 `das-component-vue`，发现组件颜色/圆角/字号与设计稿不一致
- 项目使用 `view-design` / `iview` / `@ailpha/soul-ui`，需将 LESS 变量和 CSS 覆盖对齐设计系统
- 任意前端项目初始化时，确保所有颜色通道均与 `project-tokens.md` 一致
- **`das-prd-ux-code-universal`** Stage 4 代码生成前的前置对齐检查（管线模式）

## 背景知识

不同技术栈有不同的颜色通道，但**根本问题相同**：多条颜色通道并行存在，必须全部对齐到 `project-tokens.md` 才能保证视图层颜色一致。

| 技术栈 | 主要颜色通道 | 辅助通道 |
|--------|------------|---------|
| Ant Design Vue v4/v5 | `light.ts` / `dark.ts`（Seed Token）+ `theme/index.ts`（组件 override）| `themeAntdReset.css`（CSS 覆盖）+ `theme.css`（CSS 变量） |
| View Design / Soul UI | LESS 变量文件（`@primary-color` 等）+ 组件级 CSS 覆盖 | `theme.css`（CSS 变量，若存在）|
| 通用 | `:root` CSS 自定义属性 | — |

`project-tokens.md` 是唯一权威数据源（Priority ①），本技能的职责是把其中的 token 值"分发"到各技术栈对应的配置文件。

---

## 执行流程

### Step 0 — 模式检测（必须先执行）

```
优先读取 product/*/runtime/session-state.md（若存在）：
  → 含 "## Token Alignment" 且 "状态: done" → 静默跳过，输出："Token Alignment 已完成，跳过"
  → 不含或不存在 → 再读取 product/*/ux/session-state.md（兼容旧项目）
  → 仍不存在 → 再读取 front/docs/ux/*/session-state.md / docs/ux/*/session-state.md（兼容更旧项目）
  → 四类路径都不存在 → 进入 Step 1

模式判断：
  → 任一路径的 session-state.md 存在（处于全流程管线中） → 管线模式
  → session-state.md 不存在 → 独立使用模式
```

### Step 1 — 读取 UI Stack Profile + 依赖检测 → 选择适配器

```
先尝试读取项目 UI 画像（若存在）：
  1. `$SKILLS_HOME/opt-ui-design/design-system/project-ui-profile.md`
  2. `$PROJECT_AI_DIR/skills/design-system/project-ui-profile.md`
  3. `$SKILLS_HOME/design-system/project-ui-profile.md`
  4. project-style-manifest.md 中的 "## Layer 0 — UI Stack Profile"（若已存在）

若 UI 画像存在：
  → 提取：框架版本、默认组件库、白名单组件、非默认运行时组件库、样式入口顺序
  → package.json 检测结果只能用于校验，不得反向覆盖 UI 画像

Read package.json（项目根目录；若不存在则递归查找 front/*/package.json）
→ 按优先级顺序检查 dependencies + devDependencies：

  1. 检测到 ant-design-vue
       → adapter = "antd"
       → 同时检测 das-component-vue（file: 路径或 npm 版本）
         — 存在 → 记录：此项目使用 DasThemeProvider，对齐将同时覆盖两层 ConfigProvider

  2. 检测到 view-design 或 iview（二者均视为同一适配器）
       → adapter = "viewdesign"
       → 同时检测 @ailpha/soul-ui
         — 存在 → 记录：Soul UI 已集成，组件选择器前缀使用 .ivu- / .so-
       → 若 UI 画像声明 element-ui 为白名单补充
         — 记录：Element 仅作为白名单组件，不作为默认主题适配器

  3. 检测到 element-plus
       → adapter = "elementplus"
       → 输出提示：
           "检测到 element-plus（预留适配器）。
            当前版本仅支持 CSS 变量层（Layer 3）对齐，Layer 1/2 暂未实现。
            建议手动配置 el-config-provider 的 --el-color-* 变量。"
       → 继续执行，仅对齐 CSS 变量层

  4. 检测到 @arco-design/web-vue
       → adapter = "arco"
       → 输出提示（同 elementplus，预留适配器）
       → 继续执行，仅对齐 CSS 变量层

  5. 均未匹配
       → adapter = "css-vars"
       → 输出提示：
           "未检测到已知 UI 组件库，将使用通用 CSS 变量适配器，
            仅对齐 :root 块中的 CSS 自定义属性。"

→ 所有路径均不强制停止；css-vars 作为最终兜底
→ 记录 adapter 值 + UI 画像摘要，Step 3/5 按此路由
```

### Step 2 — 读取权威 Token（Priority ①）

```
依次尝试以下路径，取第一个存在的文件作为 Priority ① 数据源：
  1. `$PROJECT_AI_DIR/skills/design-system/skills/project-tokens.md`
  2. `$PROJECT_AI_DIR/skills/design-system/project-tokens.md`
  3. `$SKILLS_HOME/design-system/project-tokens.md`
  4. `$SKILLS_HOME/opt-ui-design/design-system/project-tokens.md`
  5. docs/design-system/project-tokens.md

若以上路径均不存在 → 降级检查：
  1. Read project_description.md（提取品牌色/状态色/圆角，Priority ②）
  2. 若 project_description.md 也不存在 → 停止，提示：
     "未找到 project-tokens.md 或 project_description.md。
      请先运行 create-project-design-system 或 opt-pro-ux-code-init 初始化设计系统后再执行。"

从文件中提取以下字段（通用，各适配器按需使用）：

**颜色 token：**
  - color/brand/normal         → 品牌主色
  - color/brand/hover          → 品牌 hover 色
  - color/brand/active         → 品牌 active 色
  - color/brand/light          → 品牌浅底色
  - color/status/success       → 成功色
  - color/status/success-light → 成功浅底
  - color/status/warning       → 警告色
  - color/status/warning-light → 警告浅底
  - color/status/error         → 错误色
  - color/status/error-light   → 错误浅底
  - color/text/primary         → 主文字色
  - color/text/secondary       → 次文字色
  - color/text/disabled        → 禁用文字色
  - color/bg/page              → 页面底色
  - color/bg/card（或 color/bg/container） → 卡片/容器色
  - color/bg/secondary         → 次级背景色
  - color/border/default       → 边框色
  - color/stroke/default       → 分割线色

**圆角 token（提取全部 radius/* 字段，构建字典）：**
  radius_tokens = {
    "radius/xs": 值,
    "radius/sm": 值（若存在）,
    "radius/md": 值（若存在）,
    "radius/lg": 值（若存在）,
    "radius/btn-sm": 值（若存在）,
    "radius/btn-md": 值（若存在）,
    ...（project-tokens.md 中所有 radius/* 字段）
  }

**字号 token：**
  - font/size/base → 基础字号（数字，如 14）

**阴影 token（若存在）：**
  - elevation/1 → 卡片阴影
  - elevation/2 → 下拉阴影
  - elevation/3 → 弹层阴影

**AntD 专用字段（仅 adapter=antd 时额外提取）：**
  - color/brand/disabled → colorPrimaryBgHover
  - color/bg/secondary   → colorFill
  → 动态主色检测：搜索 src/store/ 是否存在 getPrimaryColors() 调用
    — 存在 → useDynamicPrimary = true
    — 不存在 → useDynamicPrimary = false
```

### Step 3 — 扫描现有 token 文件（按适配器路由）

```
按 Step 1 确定的 adapter 路由：

【antd】→ 执行「适配器 A 扫描」（四层）
  Layer 1（Seed token 文件）：
    → src/theme/light.ts             — 提取 borderRadius、colorSuccess 等 seed 值
    → src/theme/dark.ts              — 同上（深色模式）
    → src/store/uedModule/theme/defaultConfig.ts
      — 提取 fontSize、primaryColor（品牌主色种子）
    → Grep src/store/ 是否存在 getPrimaryColors() — 确认 useDynamicPrimary

  Layer 2（组件级 override 文件）：
    → src/store/uedModule/theme/index.ts（或 src/theme/index.ts）
      — 提取 components 对象中所有 borderRadius* / fontSize 字段
      — 若文件不存在 → Layer 2 扫描跳过

  Layer 3（CSS override 文件）：
    → src/theme/themeAntdReset.css
      — 提取已有的 border-radius CSS 规则（如 .ant-btn、.ant-modal-content 等）
      — 若文件不存在 → Layer 3 扫描跳过

  Layer 4（CSS 自定义属性文件）：
    → src/theme/theme.css（或 src/styles/theme.css）
      — 读取 :root,.theme-light 块，提取语义变量当前值（含 var(--xxx) 形式）
      — 若文件不存在 → Layer 4 扫描跳过

【viewdesign】→ 执行「适配器 B 扫描」（三层）
  Layer 1（LESS 变量文件）：
    按优先级尝试以下路径，取第一个存在的文件：
    → src/styles/variables.less
    → src/styles/index.less
    → src/theme.less
    → src/style/variables.less
    提取字段：@primary-color、@success-color、@warning-color、@error-color、
              @border-radius-base、@font-size-base（若存在）
    — 若均不存在 → Layer 1 扫描跳过，记录"LESS 变量文件未找到，将仅写入新文件"

  Layer 2（组件级 CSS 覆盖文件）：
    → Glob src/styles/*.css（排除 reset.css / base.css / normalize.css 等基础样式）
    → App.vue 的 <style> 块中 .ivu-card、.ivu-input 等选择器
    提取字段：border-radius、background-color 等覆盖规则
    — 若均不存在 → Layer 2 扫描跳过

  Layer 3（CSS 自定义属性文件）：
    → src/styles/theme.css（或 src/styles/variables.css）
    — 读取 :root 块，提取 --color-* 等语义变量
    — 若不存在 → Layer 3 扫描跳过

【elementplus / arco（预留）】→ 仅执行 CSS 变量扫描：
  → src/styles/theme.css 或 src/styles/variables.css
  — 提取 :root 块中所有 CSS 自定义属性
  — 若不存在 → CSS 变量扫描跳过

【css-vars（兜底）】→ 执行「通用 CSS 变量扫描」：
  → Glob **/*.css（排除 node_modules）
  — 找到含 :root 块的文件，提取所有 --color-*、--radius-*、--font-* 变量
  — 记录扫描到的文件路径列表，Step 5 写入时使用
```

### Step 3b — 读取 project-patterns.md（override 文件路径 + Pattern CSS）

```
读 project-design-system.md → 找到 project-patterns.md 路径 → 读 project-patterns.md
（若 project-design-system.md 不存在 → Glob **/*design-system.md 兜底查找）

提取「## 组件覆盖文件」节：
  → 有「文件路径」字段且非占位符（非 <!-- TODO -->）→ override_file = 该路径
  → 字段为占位符或节不存在 → Glob **/*override*.{less,css}（排除 node_modules）
      → 唯一匹配 → override_file = 匹配路径
      → 多个匹配 → 独立模式：AskQuestion 用户选择；管线模式：取第一个，记录日志
      → 无匹配 → override_file = "src/styles/component-override.less"（不创建文件，仅记录）

提取「## 页面级布局 Patterns」节的 ```less 代码块 → pattern_css
节不存在或代码块为空 → pattern_css = ""（Step 6.5 将跳过 Pattern 写入）
提取「## 页面级布局 Patterns」节的 Markdown 表格 → pattern_table（用于 Layer 4 清单）
提取以下节的文本摘要（若存在）：
  - `## SearchBar 响应式合同` → searchbar_contract_summary
  - `## 图例 / Legend` → legend_contract_summary
  - `## 体验表达禁令` / `## 占位泄漏禁用项` → copy_contract_summary
```

### Step 4 — 差异比对（通用 diff，适配器填入变量名）

```
以各适配器映射表为依据，将 Step 2 提取的 Priority ① 值与 Step 3 的现有值逐项比对：

diff 列表格式示例（实际值由 project-tokens.md 决定）：
  | token 字段              | 目标层    | 目标文件               | 当前值              | 应有值（来自 project-tokens.md）|
  |------------------------|----------|-----------------------|--------------------|-------------------------------|
  | colorSuccess           | Layer 1  | light.ts              | （当前文件值）       | {color/status/success}        |（适配器 A）
  | @primary-color         | Layer 1  | variables.less        | （当前文件值）       | {color/brand/normal}          |（适配器 B）
  | --color-bg-page        | Layer 3  | theme.css             | （当前文件值）       | {color/bg/page}               |

比对规则（适配器通用）：
  - 已有字段 → 值不等则记为差异
  - 字段/选择器不存在 → 视为"当前值为空"，记为差异（需新增）
  - Layer N（CSS 变量）：当前值为 var(--xxx) 间接引用且其实际色不等于目标 hex → 视为差异

适配器 A 专属规则：
  - Layer 1b（primaryColor）：
      若 useDynamicPrimary = true → 对比 defaultConfig.primaryColor 与 color/brand/normal
      若 useDynamicPrimary = false → 对比 light.ts colorPrimary 与 color/brand/normal
  - Layer 2：对比 components 对象中 borderRadiusLG/borderRadiusSM 的当前值

独立模式 + 差异项 ≥ 3 → AskQuestion：
  AskQuestion(
    title: "Token 对齐确认",
    prompt: "检测到 {N} 处 token 值与 project-tokens.md 不一致（见上方 diff 列表）。请选择对齐范围：",
    options: [
      { id: "all",     label: "全量对齐（推荐）— 所有层全部对齐" },
      { id: "color",   label: "仅对齐状态色（success / warning / error）" },
      { id: "layout",  label: "仅对齐圆角 + 字号" },
      { id: "skip",    label: "跳过，我手动处理" }
    ]
  )

管线模式 → 直接全量执行，无提问
独立模式 + 差异项 < 3 → 直接全量执行，输出 diff 摘要
```

### Step 5 — 写入对齐值（按适配器路由）

```
按 Step 1 确定的 adapter 路由：

【antd】→ 执行「适配器 A 写入」（四层，详见「适配器 A 映射表」节）

  Layer 1：写入 src/theme/light.ts 和 src/theme/dark.ts
    — 对齐所有颜色 seed、borderRadius
    — dark.ts：状态色 Bg 系列用半透明 rgba，主色、圆角与 light 相同逻辑

  Layer 1 补充：写入 src/store/uedModule/theme/defaultConfig.ts
    — fontSize → font/size/base 的值 + "px"（如 "14px"）

  Layer 1b：primaryColor 种子
    — useDynamicPrimary = true → 写入 defaultConfig.ts 的 primaryColor
    — useDynamicPrimary = false → 写入 light.ts 的 colorPrimary
    — 写入后输出提示：
        ⚠️ 若 UI 无变化，需清除 localStorage 缓存：
           localStorage.removeItem('{项目主题缓存键}') 后刷新

  Layer 2：写入 src/store/uedModule/theme/index.ts（组件级 override）
    — 已有对应 components.X.borderRadiusLG → StrReplace 更新
    — 无对应组件条目 → 在 components 对象中新增

  Layer 3：写入 src/theme/themeAntdReset.css（CSS override）
    — 已有对应选择器 → StrReplace 更新值
    — 无对应选择器 → 在对应注释区块末尾追加规则

  Layer 4：写入 src/theme/theme.css 的 :root,.theme-light 块
    — 直接 hex 值覆盖（不通过 var(--gray-*) 间接引用）
    — 不修改 .theme-dark 块，不修改 --gray-* 全局 scale

【viewdesign】→ 执行「适配器 B 写入」（三层，详见「适配器 B 映射表」节）

  Layer 1：写入 LESS 变量文件（Step 3 中找到的文件）
    — 若文件存在：StrReplace 更新对应变量行，格式：@var-name: #hex;
    — 若文件不存在：在 src/styles/ 下新建 variables.less，写入全量变量
    — 写入格式（实际值从 project-tokens.md 动态读取）：
        @primary-color: {color/brand/normal};      /* color/brand/normal */
        @success-color: {color/status/success};    /* color/status/success */
        @border-radius-base: {radius/sm}px;        /* radius/sm */
        @font-size-base: {font/size/base}px;       /* font/size/base */

  Layer 2：写入 CSS 组件覆盖文件（Step 3 扫描到的已有 CSS 覆盖文件，或 App.vue）
    — 已有对应选择器的规则 → StrReplace 更新值
    — 无对应选择器 → 在注释区块末尾追加规则
    — 示例：
        .ivu-card  { border-radius: {radius/lg}px; }   /* radius/lg */
        .ivu-input { border-radius: {radius/md}px; }   /* radius/md */

  Layer 3：写入 theme.css 的 :root 块（与 antd 适配器 Layer 4 逻辑相同）
    — 若文件不存在 → 新建 src/styles/theme.css 并写入 :root 块

【elementplus / arco（预留）】→ 仅写入 CSS 变量层（同 viewdesign Layer 3）

【css-vars（兜底）】→ 写入所有 Step 3 中扫描到的含 :root 块的 CSS 文件
    — 按命名约定匹配变量名（--color-bg → color/bg/page 等）
    — 直接 hex 值覆盖

写入完成后 Read 验证各层关键字段，若写入失败则重试一次。
```

### Step 6 — 记录状态 & 输出摘要

**管线模式** — 追加到探测到的 `session-state.md`（默认 `product/{模块名}/runtime/session-state.md`）：

```markdown
## Token Alignment
状态: done
执行时间: {YYYYMMDD HH:MM}
适配器: {antd / viewdesign / css-vars}
对齐项: {N} 处
修改文件:
  {仅列出本次实际有 diff 写入的文件，动态生成}
注意: 若 UI 无变化，清除项目主题缓存（localStorage.removeItem('{项目主题缓存键}')）后刷新，或重启 dev server
```

### Step 6.5 — Pattern CSS 写入 + 生成 project-style-manifest.md

```
若 pattern_css 非空：
  检查 override_file 内容是否已含 pattern_css 中第一个 class 名
  → 已含 → 跳过（幂等保护，不重复写入）
  → 未含 → 在 override_file 末尾追加：
      // === 页面级布局 Patterns（由 token-align 自动生成，来自 project-patterns.md）===
      {pattern_css 原文，@var 变量保持不变，由 LESS 编译器解析}

生成 project-style-manifest.md（存于 project-design-system.md 同级目录）：
  内容格式：
    # 项目样式清单 — project-style-manifest
    > 由 token-align 自动生成，勿手动编辑。代码生成工具（pencil-to-code / opt-req-confirm）读取此文件作为样式约束。
    生成时间: {YYYYMMDD HH:MM}
    适配器: {adapter}

    ## Layer 0 — UI Stack Profile
    - 框架：{从 project-ui-profile.md 或 package.json 检测得到}
    - 默认组件库：{默认组件库}
    - 白名单组件：{白名单列表，无则写 "无"}
    - 非默认运行时组件库：{排除列表，无则写 "无"}
    - 样式入口顺序：{从 project-ui-profile.md 提取；若无则按适配器默认推断}

    ## Layer 1 — Token 键值（来自 project-tokens.md）
    | token 字段 | 值 |
    |---|---|
    | {所有 Step 2 提取的 token 字段和值} |

    ## Layer 2 — LESS 变量清单（来自 override_file 变量区）
    | LESS 变量 | 值 | 对应 Token 字段 |
    |---|---|---|
    | {override_file 中所有 @var-name: value 行，附对应 token 字段注释} |

    ## Layer 3 — CSS 自定义属性（来自 theme.css / css-var.css）
    | CSS 变量 | 值 | 对应 Token 字段 |
    |---|---|---|
    | {扫描到的 :root 块中所有 --color-*、--shadow-* 变量} |

    ## Layer 4 — 组件 Class 模式（来自 project-patterns.md）
    {pattern_table 原内容（Markdown 表格）}

    ## Layer 4.5 — Pattern Rules Summary（来自 project-patterns.md）
    - SearchBar：{searchbar_contract_summary，若无则写 "未声明"}
    - Legend：{legend_contract_summary，若无则写 "未声明"}
    - 体验表达：{copy_contract_summary，若无则写 "未声明"}

    ## [代码生成约束]
    > 以下组件用法为硬约束，代码生成时优先使用，不可由 AI 推断覆盖。
    {从 pattern_table「UI 组件」列提取的唯一值列表，格式：- 场景名：组件用法}
    - SearchBar：若 Layer 4.5 已声明响应式合同，代码生成时必须保证 `:columns` 与 `.filter-card --searchbar-cols` 同源，并优先复用统一 helper / wrapper
    - Legend：若 Layer 4.5 已声明语义节点合同，默认输出真实色块 / 线段 / Dot 节点，不得生成文本伪图例
    - 体验表达：若 Layer 4.5 已声明文案禁令，页面标题 / 空态 / 成功失败反馈不得泄漏 `Mock`、`演示`、`主流程` 等说明型文字

    ## [验收约束]
    - 先校验 `project-ui-profile.md` 与本文件 Layer 0 是否一致
    - 生成代码后，至少执行一次设计稿截图 vs 浏览器截图对比
    - 对新生成页面执行硬编码样式扫描，避免裸 `#hex`、硬编码圆角和 magic number 内联样式
    - 若 Layer 4.5 已声明 SearchBar / Legend / 体验表达合同，生成后必须追加对应回归检查
    - 浏览器自测优先调用 `frontend-browser-self-test`

manifest 文件写入后，在探测到的 `session-state.md`（默认 `product/{模块名}/runtime/session-state.md`）中追加：

## Style Manifest
状态: done
路径: {project-style-manifest.md 的绝对路径}
override 文件: {override_file}
Patterns 数量: {pattern_css 中 class 数量，若 pattern_css 为空则为 0}
UI 画像: {默认组件库 + 白名单摘要}
```

**独立模式** — 在对话输出：

```
## Token Alignment 完成（适配器：{antd / viewdesign / css-vars}）

对齐了 {N} 处差异：
| token 字段 | 目标层 | 旧值 | 新值 | 目标文件 |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

修改文件（仅实际有变更的文件）：
- {动态列出}

验收建议：
1. 若 UI 无变化：
   - AntD 项目：清除主题缓存（`localStorage.removeItem('{项目主题缓存键}')`）后刷新，或重启 dev server；缓存 key 名在项目 Pinia persist 配置中确认
   - View Design 项目：重启 dev server，确认 LESS 变量文件已被正确 import
2. View Design 项目额外检查：确认入口文件（main.js / main.ts）中已 import 修改的 LESS / CSS 文件
3. 清除 Vite/Webpack 预构建缓存：rm -rf node_modules/.vite 或 rm -rf .cache
4. 检查：成功/警告/错误状态色、按钮圆角、卡片圆角、正文字号是否与设计稿一致
```

---

## 适配器规范（Adapter Specs）

每个适配器定义三要素：**扫描目标文件**、**Token 映射表**、**写入格式**。Step 3/5 以此为数据驱动依据。

---

### 适配器 A — Ant Design Vue（`antd`）

**触发条件**：`package.json` 中存在 `ant-design-vue`。

**目标文件（四层）：**

| 层级 | 文件路径 | 说明 |
|------|---------|------|
| Layer 1 | `src/theme/light.ts` / `src/theme/dark.ts` | Seed Token 主文件 |
| Layer 1b | `src/store/uedModule/theme/defaultConfig.ts` | fontSize + primaryColor 种子 |
| Layer 2 | `src/store/uedModule/theme/index.ts` | 组件级 borderRadius override |
| Layer 3 | `src/theme/themeAntdReset.css` | 无组件 token 时的 CSS 覆盖 |
| Layer 4 | `src/theme/theme.css` | CSS 自定义属性语义层 |

**Token 映射表** → 详见「适配器 A 完整映射表」章节。

---

### 适配器 B — View Design / iView / Soul UI（`viewdesign`）

**触发条件**：`package.json` 中存在 `view-design` 或 `iview`。

**目标文件（三层）：**

| 层级 | 文件路径（优先级顺序） | 说明 |
|------|---------------------|------|
| Layer 1 | `src/styles/variables.less` → `src/styles/index.less` → `src/theme.less` | LESS 变量覆盖 |
| Layer 2 | `src/styles/component-override.css`（或扫描到的已有 CSS 覆盖文件）/ `App.vue <style>` | 组件选择器 CSS 覆盖 |
| Layer 3 | `src/styles/theme.css` / `src/styles/variables.css` | CSS 自定义属性（与 antd Layer 4 相同）|

**Token 映射表** → 详见「适配器 B 三层映射表」章节。

---

### 适配器 D — 通用 CSS 变量（`css-vars`）兜底

**触发条件**：未检测到任何已知 UI 组件库。

**目标文件：**
- 扫描所有含 `:root` 块的 `*.css` 文件（排除 `node_modules`）
- 已有 `--color-*`、`--radius-*`、`--font-*` 变量 → StrReplace 更新
- 无对应变量 → 追加到已有 `:root` 块末尾

**Token 映射表（按命名约定自动对应）：**

| project-tokens.md 字段 | CSS 变量名（约定）|
|---|---|
| `color/bg/page` | `--color-bg-page` |
| `color/bg/card` | `--color-bg-card` |
| `color/text/primary` | `--color-text-primary` 或 `--color-text-primarys` |
| `color/text/secondary` | `--color-text-secondary` |
| `color/border/default` | `--color-border` 或 `--color-component-border` |
| `color/status/success` | `--color-success` |
| `color/status/warning` | `--color-warning` |
| `color/status/error` | `--color-error` |
| `radius/md` | `--border-radius` 或 `--radius-md` |
| `font/size/base` | `--font-size-base` |

---

## 适配器 A 完整映射表（Ant Design Vue）

Token 对齐分四层，每个设计 token 只落在其中一层或多层。**Step 4/5 以此表为数据驱动依据。**

### Layer 1 — Seed Token（写入 `light.ts` / `dark.ts`）

| project-tokens.md 字段 | AntD seed token 字段 | light 示例值 | dark 示例值 |
|---|---|---|---|
| `color/status/success` | `colorSuccess` | `#16A34A` | `#22C55E` |
| `color/status/success-light` | `colorSuccessBg` | `#DCFCE7` | `rgba(34,197,94,0.16)` |
| `color/status/warning` | `colorWarning` | `#F3A700` | `#F3A700` |
| `color/status/warning-light` | `colorWarningBg` | `#FFF2BA` | `rgba(243,167,0,0.16)` |
| `color/status/error` | `colorError` | `#F53C3C` | `#F53C3C` |
| `color/status/error-light` | `colorErrorBg` | `#FFE8E8` | `rgba(245,60,60,0.16)` |
| `color/text/primary` | `colorText` | `#2D3348` | `#FFFFFF` |
| `color/text/secondary` | `colorTextSecondary` + `colorTextTertiary` | `#7E8494` | `#B0B8C8` |
| `color/text/disabled` | `colorTextQuaternary` | `#ADB1BC` | `#60687B` |
| `color/border/default` | `colorBorder` | `#CBD0DB` | `#444C5D` |
| `color/stroke/default` | `colorBorderSecondary` | `#E9EAF0` | `#394052` |
| `color/bg/page` | `colorBgLayout` | `#F6F7FB` | `#141821` |
| `color/bg/container` | `colorBgContainer` + `colorBgElevated` | `#FFFFFF` | `#141821` / `#1C222E` |
| `color/bg/secondary` | `colorFill` | `#F1F2F5` | `#2E3545` |
| `radius/xs`（基础圆角） | `borderRadius` | `8` | `8` |
| `font/size/base` | `defaultConfig.fontSize`（字符串） | `'14px'` | `'14px'` |

### Layer 1b — primaryColor 种子（写入 `defaultConfig.ts` 或 `light.ts`）

| project-tokens.md 字段 | 条件 | 目标字段 |
|---|---|---|
| `color/brand/normal` | `useDynamicPrimary = true` | `defaultConfig.ts` 的 `primaryColor` |
| `color/brand/normal` | `useDynamicPrimary = false` | `light.ts` 的 `colorPrimary` |
| `color/brand/hover` | `useDynamicPrimary = false` | `light.ts` 的 `colorPrimaryHover` |
| `color/brand/active` | `useDynamicPrimary = false` | `light.ts` 的 `colorPrimaryActive` |
| `color/brand/light` | `useDynamicPrimary = false` | `light.ts` 的 `colorPrimaryBg` |

> **动态覆盖说明**：`useDynamicPrimary=true` 时，`getPrimaryColors()` 在运行时用 `generate(seed)` 动态生成衍生色，直接改 `light.ts colorPrimary` 无效，需改 `defaultConfig.ts primaryColor` 种子。

### Layer 2 — Component Token Override（写入 `theme/index.ts` 的 `components` 对象）

| project-tokens.md 字段 | 目标组件 + 字段 | 说明 |
|---|---|---|
| `radius/md`（大容器圆角） | `Modal.borderRadiusLG` | 对话框主体圆角 |
| `radius/md` | `Drawer.borderRadiusLG` | 抽屉面板圆角 |
| `radius/md` | `Card.borderRadiusLG` | 卡片容器圆角 |
| `radius/sm`（控件圆角） | `Input.borderRadius` | 输入框圆角（若与 seed 不同时写入）|
| `radius/sm` | `Select.borderRadius` | 选择器圆角 |
| `radius/sm` | `DatePicker.borderRadius` | 日期选择器圆角 |

> **识别规则**：`radius/md` 存在且与 `radius/xs`（seed）不同 → 写入 Modal/Drawer/Card 的 `borderRadiusLG`；`radius/sm` 存在且与 `radius/xs` 不同 → 写入 Input/Select/DatePicker 的 `borderRadius`。

### Layer 3 — CSS Override（写入 `themeAntdReset.css`）

| project-tokens.md 字段 | CSS 选择器 | 说明 |
|---|---|---|
| `radius/btn-md`（默认按钮圆角） | `.ant-btn:not(.ant-btn-sm)` | Button v4 无 borderRadius 组件 token |
| `radius/btn-sm`（小按钮圆角） | `.ant-btn-sm` | 同上 |

> **识别规则**：凡 `btn-` 前缀的 radius token，或其他已知在 AntD v4 中无组件 token 的变体，均落在 Layer 3。

### Layer 4 — CSS Custom Properties（写入 `theme.css` `:root,.theme-light` 块）

| project-tokens.md 字段 | CSS 变量名 | 说明 |
|---|---|---|
| `color/bg/page` | `--color-bg-page` | 页面底层背景 |
| `color/bg/card`（或 `color/bg/container`） | `--color-bg-container` | 卡片/容器背景 |
| `color/text/primary` | `--color-text-primarys` | 主文字色（注意末尾有"s"） |
| `color/text/secondary` | `--color-text-secondary` | 次要文字色 |
| `color/text/secondary` | `--color-text-placeholder` | 占位符（与次要文字同值） |
| `color/border/default` | `--color-component-border` | 组件边框 |
| `color/border/default` | `--color-component-stroke` | 分割线（与边框同值） |

> **写入规则**：直接 hex 值覆盖（含 `var(--gray-*)` 引用），不改 `.theme-dark` 块，不改 `--gray-*` 全局 scale。
>
> **命名一致性检查**：若 Grep 发现 `src/views/` 中存在 `var(--color-text-primary)`（无"s"），且 theme.css 中未定义，则额外追加 alias：`--color-text-primary: var(--color-text-primarys);`
>
> **Layer 4b — Shadow 变量**：若 project-tokens.md 包含 `elevation/*` 或 `shadow/*` 字段，且 theme.css 中不存在 `--shadow-*` 变量，则在 `:root,.theme-light` 块末尾追加 shadow 变量定义。

---

## 适配器 B 三层映射表（View Design / Soul UI）

**Step 4/5 的数据驱动依据。**

### Layer 1 — LESS 变量（写入 LESS 变量文件）

| project-tokens.md 字段 | View Design LESS 变量 | 说明 |
|---|---|---|
| `color/brand/normal` | `@primary-color` | 品牌主色 / 主按钮 |
| `color/status/success` | `@success-color` | 成功状态 |
| `color/status/warning` | `@warning-color` | 警告状态 |
| `color/status/error` | `@error-color` | 错误状态 |
| `color/text/primary` | `@text-color` | 主文字色 |
| `color/text/disabled` | `@disabled-color` | 禁用文字色 |
| `color/border/default` | `@border-color-base` | 边框基础色 |
| `color/bg/page` | `@body-background` | 页面背景 |
| `color/bg/card` | `@component-background` | 组件/卡片背景 |
| `radius/sm`（操作按钮） | `@border-radius-base` | 基础圆角（控件）|
| `font/size/base` | `@font-size-base` | 基础字号 |

> 所有值均从 `project-tokens.md` 动态读取，不写死于此映射表。

**写入格式**：`@var-name: #hex;`（StrReplace 或追加到文件末尾）

```less
/* 写入模板（实际值从 project-tokens.md 动态读取） */
@primary-color: {color/brand/normal};      /* color/brand/normal */
@success-color: {color/status/success};    /* color/status/success */
@warning-color: {color/status/warning};    /* color/status/warning */
@error-color:   {color/status/error};      /* color/status/error */
@border-radius-base: {radius/sm}px;        /* radius/sm */
@font-size-base: {font/size/base}px;       /* font/size/base */
```

### Layer 2 — 组件级 CSS 覆盖（写入 CSS 组件覆盖文件或 App.vue）

> 适用于：LESS 变量无法精确控制特定组件的某个属性时，用 CSS 选择器直接覆盖。

| project-tokens.md 字段 | 选择器 | CSS 属性 | 说明 |
|---|---|---|---|
| `radius/lg`（卡片圆角） | `.ivu-card` | `border-radius: 9px` | 卡片容器 |
| `radius/md`（输入框） | `.ivu-input` | `border-radius: 6px` | 输入控件 |
| `radius/md`（弹窗） | `.ivu-modal-content` | `border-radius: 6px` | 对话框 |
| `color/bg/page` | 内容区容器（选择器因项目而异，如 `.layout-main` / `.content-wrapper`）| `background: {color/bg/page}` | 内容区背景，需按项目实际 DOM 结构添加 |
| `color/border/default` | `.ivu-input` | `border-color: {color/border/default}` | 输入框边框 |
| `radius/sm`（按钮） | `.ivu-btn:not(.ivu-btn-small)` | `border-radius: 4px` | 默认按钮 |
| `radius/xs`（小按钮） | `.ivu-btn-small` | `border-radius: 3px` | 小号按钮 |

**识别规则**：
- `radius/lg` 存在且 → 写入 `.ivu-card`
- `radius/md` 存在且与 `radius/sm` 不同 → 写入 `.ivu-input`、`.ivu-modal-content`
- 仅当目标选择器的当前值与 project-tokens.md 不一致时写入

**写入格式**：

```css
/* 写入模板（实际值从 project-tokens.md 动态读取；文件路径使用项目现有 CSS 覆盖文件，
   若无则新建 src/styles/component-override.css） */

/* 卡片圆角 — radius/lg */
.ivu-card { border-radius: {radius/lg}px; }

/* 输入框圆角 — radius/md */
.ivu-input { border-radius: {radius/md}px; }
.ivu-input-number { border-radius: {radius/md}px; }
.ivu-select-selection { border-radius: {radius/md}px; }

/* 按钮圆角 — radius/sm / radius/xs */
.ivu-btn:not(.ivu-btn-small) { border-radius: {radius/sm}px; }
.ivu-btn-small { border-radius: {radius/xs}px; }
```

### Layer 3 — CSS 自定义属性（写入 theme.css `:root` 块）

与适配器 A Layer 4 映射表完全一致（CSS 变量层与技术栈无关）：

| project-tokens.md 字段 | CSS 变量名 | 说明 |
|---|---|---|
| `color/bg/page` | `--color-bg-page` | 页面底层背景 |
| `color/bg/card`（或 `color/bg/container`） | `--color-bg-container` | 卡片/容器背景 |
| `color/text/primary` | `--color-text-primarys` | 主文字色（注意末尾有"s"） |
| `color/text/secondary` | `--color-text-secondary` | 次要文字色 |
| `color/text/secondary` | `--color-text-placeholder` | 占位符（与次要文字同值） |
| `color/border/default` | `--color-component-border` | 组件边框 |
| `color/border/default` | `--color-component-stroke` | 分割线（与边框同值） |
| `elevation/1` | `--shadow-card` | 卡片阴影 |
| `elevation/2` | `--shadow-dropdown` | 下拉阴影 |
| `elevation/3` | `--shadow-modal` | 弹层阴影 |

**写入规则**：直接 hex 值，不通过间接变量引用。

```css
/* 写入模板（实际值从 project-tokens.md 动态读取） */
:root {
  --color-bg-page:          {color/bg/page};           /* color/bg/page */
  --color-bg-container:     {color/bg/card};           /* color/bg/card */
  --color-text-primarys:    {color/text/primary};      /* color/text/primary */
  --color-text-secondary:   {color/text/secondary};    /* color/text/secondary */
  --color-text-placeholder: {color/text/secondary};    /* 与次要文字同值 */
  --color-component-border: {color/border/default};    /* color/border/default */
  --color-component-stroke: {color/border/default};    /* 与边框同值 */
  --shadow-card:     {elevation/1};                    /* elevation/1 */
  --shadow-dropdown: {elevation/2};                    /* elevation/2 */
  --shadow-modal:    {elevation/3};                    /* elevation/3 */
}
```

---

## 注意事项

1. **主色对齐优先级（适配器 A 专属）**：

   - **路径 A — 动态主色（项目含 `getPrimaryColors()`）**：直接改 `light.ts colorPrimary` 无效。需改 `defaultConfig.ts` 的 `primaryColor` 种子，该值作为 `generate(primaryColor)` 的输入推导出主色 palette 和 `--um-primary-color-*` CSS 变量。
     > ⚠️ 改完 `primaryColor` 种子后，若项目使用 Pinia persist 持久化了主题配置到 localStorage，旧值会覆盖新种子，必须清除对应缓存 key 后刷新才能生效。缓存 key 名因项目而异（如 `ZQTHEMECONFIG`、`THEME_CONFIG` 等），请在项目的 Pinia persist 配置中确认。

   - **路径 B — 静态主色（项目无 `getPrimaryColors()`）**：直接改 `light.ts colorPrimary`，不需要改 `defaultConfig.ts`。

2. **缓存残留**：

   - **适配器 A**：任何 token 文件修改在 HMR 下均可能因 Pinia store 持久化到 localStorage 而不立即反映到 UI。排查顺序：① 清除主题缓存（`localStorage.removeItem('{项目主题缓存键}')`）后刷新，key 名在项目 Pinia persist 配置中确认 → ② 重启 dev server → ③ `rm -rf node_modules/.vite`。
   - **适配器 B**：LESS 变量修改需重启 dev server 才能生效（Webpack/Vite 不能热替换 LESS 变量层）；CSS 文件修改一般可 HMR 生效，若无效则重启。
   - **确认入口文件**：View Design 项目需确认 `main.js` 已正确 import 修改后的 LESS / CSS 文件；若新建了 LESS 覆盖文件，需手动添加 import。

3. **适配器 B — LESS 变量注入方式**：View Design 推荐通过 `less-loader` 的 `modifyVars` 或 `additionalData` 选项在构建时注入变量，效果等同于在 LESS 文件中 `@variable: value`。若项目已有此配置，需同时更新 `vue.config.js` 或 `webpack.config.js` 中的 `modifyVars` 字典。

4. **peerDependencies 问题（适配器 A）**：若 `das-component-vue` 构建产物中存在固定版本的 antd 内部路径，本技能只能修复宿主项目 token 层面的对齐，无法修复组件库内部版本隔离问题。完整修复需在 `ds-component` 仓库重新构建。

5. **dark 模式衍生色（适配器 A）**：深色背景下的状态色 Bg 系列用半透明 rgba 而非固定 hex，避免不同深色背景层叠时出现色阶跳变。View Design 项目通常无独立的 dark 模式 token 文件，暗色模式覆盖通过 CSS 变量层（Layer 3）在 `[data-theme="dark"]` 或 `.theme-dark` 选择器中独立管理。
