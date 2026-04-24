# B端后台设计系统 · 合规检查清单

> **单一数据源**：本文件是合规规则的唯一权威来源。
> `opt-b-admin-pencil-design` 执行后必检清单和 `opt-design-validation` Stage 3.5 均直接引用本文件，请勿在其他位置维护副本。

---

## ① 颜色引用

- [ ] **所有填充色**：使用 `$color/...` 变量，禁止出现 `#RRGGBB` 硬编码（特殊效果如热力图背景除外，须在注释中说明）
- [ ] **状态 Tag 背景**：使用 `$color/status/error-light`、`$color/status/warning-light`、`$color/status/success-light`，**禁止使用 `#000000` 或纯黑**
- [ ] **透明填充**：使用 `transparent`，禁止用 `#00000000`

---

## ② 字号与排版

- [ ] **页面主标题（Display Typography）**：`fontSize: 28`，`fontWeight: "700"`，不得偏差
- [ ] **正文 / 辅助文字**：对照 `core/tokens-variables.md` 字号表，不得随意估值
- [ ] **字体族**：中文内容用 `"PingFangSC-Regular"`（正文）/ `"PingFangSC-Semibold"`（加粗），英文 / 数字用 `"Inter"`；可通过变量引用 `$font/family/zh` / `$font/family/en`

---

## ③ 圆角

> ⚠️ **前提：圆角 Token 必须已注入**。检查前先确认 `get_variables()` 返回中有 `radius/3xs`、`radius/xs`、`radius/lg` 三个条目，否则先执行 Token 注入流程（见 SKILL.md 步骤 1.8）。

- [ ] **卡片/面板圆角**：引用 `$radius/lg`（Pencil 值 `12px`）
- [ ] **小组件圆角**（按钮、Tag、输入框、导航项）：
  - 4px 圆角 → 引用 `$radius/3xs`
  - 8px 圆角 → 引用 `$radius/xs`
- [ ] **新建 frame 的 cornerRadius**：必须使用 `$radius/...` 变量字符串，**禁止写裸数字**（如 `cornerRadius: 6`、`cornerRadius: 8`）。字面量无法响应主题切换，且不可在合规检查中被发现。
- [ ] **禁止**使用 `$radius/sm`（10px）或 `$radius/md`（12px）对应小组件圆角——这两个值在本项目 CSS 中无直接映射

---

## ④ 间距 / 尺寸

- [ ] **Drawer 宽度**：`320`（对应 `$layout/drawer-width`），不得超出
- [ ] **页面内容内边距**：`$layout/page-padding = 24`，不得使用非 4 的倍数值
- [ ] **列表区行内边距**：对齐 spacing token（`sm=8, md=12, lg=16, xl=24`）

---

## ⑤ 阴影 / 层级

- [ ] **卡片/面板**：effect 使用 `$elevation/1`
- [ ] **浮层/下拉**：effect 使用 `$elevation/2`
- [ ] **Modal/抽屉**：effect 使用 `$elevation/3`

---

## ⑥ Shell 完整性

- [ ] **Sidebar**：包含 Logo、至少 3 组导航项（含图标 + 文字）、底部状态条
- [ ] **TopBar**：包含面包屑 / 页面标题、右侧用户信息区（`UserProfile` 组件）
- [ ] **激活导航项**：`fill: $color/brand/light`，文字/图标色 `$color/brand/normal`

---

## ⑦ 表格

- [ ] **表头行**：`fill: $color/bg/secondary`，文字 `fontWeight: "600"`
- [ ] **数据行**：hover 态 `fill: $color/bg/secondary`，默认 `fill: transparent`

---

## ⑧ Shell 容器宽度（每个新页面必须在开始前验证）

> **这是最容易导致整页排版崩溃的问题。** 每次创建新页面 Shell 后，调用 `snapshot_layout(pageId, maxDepth:2)`，逐项确认：

- [ ] **Sidebar 宽度**：精确 `240`，不得为 `fill_container` 或 `1`
- [ ] **内容区宽度**：精确 `1200`（= 1440 - 240），**不使用 `fill_container`**，必须显式写死
- [ ] **TopBar / 内容滚动区**：在 `main`（1200px）内，可用 `fill_container`，渲染后应为 1200
- [ ] **无 1px 节点**：snapshot 中不应出现任何 `width: 1` 或 `height: 1` 的容器节点（分隔线除外）
- [ ] **Drawer 覆盖层**：放在 `page` 根节点，**不嵌入 `main` 内容区**；默认 `x: 1440`（画板外隐藏）

> 若以上任一不通过 → **停止填充内容，先修复 Shell 结构**。

---

## 状态字段可见性（卡片/列表场景）

- [ ] 状态字段在卡片层可见（颜色 + 文字双重编码，不只靠颜色区分）

---

## 操作区一致性

- [ ] 高频操作右置；超出操作项收纳到 `…` 溢出菜单
- [ ] 危险操作（删除）不直接暴露，必须二次确认

---

## 文字溢出检查

> 适用于任何含"水平行 + 可能换行文字"的场景（列表项、处理函数行、弹窗提示条等）

- [ ] **水平布局中的换行文字**：`textGrowth:"fixed-width"` 的文字节点不直接作为水平布局子节点；必须套 `width:"fill_container"` 的垂直容器，文字 `width` 用 `"fill_container"`，禁止硬编码像素值
- [ ] **图标 + 名称 + 描述** 三列模式：名称与描述在同一垂直容器内，该容器 `width:"fill_container"`

---

## 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|---|---|---|---|
| v1.0 | 2026-03-18 | 初始提取，合并 Shell 宽度 + 状态字段 + 操作区规则 | AI |
| v1.1 | 2026-03-19 | 新增「文字溢出检查」节；对应 syntax-rules.md 新增换行溢出强制规则 | AI |
| v1.2 | 2026-03-24 | ③ 圆角节强化：补「Token 必须已注入」前提说明；新增「禁止写裸数字 cornerRadius」规则；更新 $radius/lg 实际值为 12px | AI |
