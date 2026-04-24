# Shell - 顶部导航型（无侧边栏）

> 其他变体 → [shell-standard.md](shell-standard.md) | [shell-collapsible.md](shell-collapsible.md) | [shell-map-nav.md](shell-map-nav.md)
>
> **适用**：功能模块 ≤ 8 个、业务线单一、需要最大化内容区宽度的场景。

---

## 变体说明

| 子变体 | 说明 | 适用 |
|--------|------|------|
| **单层顶导** | 顶栏只有一层导航项，点击即跳转 | 功能层级简单（≤ 8 项） |
| **双层顶导** | 顶栏一级菜单 + 点击弹出二级下拉 | 功能较多但不需要侧边栏 |
| **顶导 + 内容区 Tab** | 顶栏导航 + 页面内 DasTabs 分类 | 单模块内多视图切换 |
| **混合导航** | 顶导承载一级模块切换 + 侧边栏承载当前模块子功能 | 中大型产品，需跨模块导航 |

---

## 单层顶导 Shell 模板（1440×900）

### Batch 1：Shell 骨架

```javascript
// ① 画板（无侧边栏，全宽）
page=I("document", {
  type: "frame", name: "页面名称-顶导",
  width: 1440, height: 900,
  layout: "vertical", fill: "$color/bg/page", placeholder: true
})

// ② TopBar（全宽 1440px，包含 Logo + 导航项 + 用户区）
topbar=I(page, {
  type: "frame", name: "topbar",
  width: "fill_container", height: 64,
  layout: "horizontal", alignItems: "center", gap: 0, padding: [0, 24],
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})

// Logo 区（左）
logoArea=I(topbar, {
  type: "frame", name: "logo",
  layout: "horizontal", alignItems: "center", gap: 8,
  width: "fit_content(180)"
})
I(logoArea, { type: "frame", width: 28, height: 28, cornerRadius: 6, fill: "$color/brand/normal" })
I(logoArea, { type: "text", content: "产品名", fontFamily: "Inter", fontSize: 14, fontWeight: "700", fill: "$color/text/primary" })

// 导航项区（中，水平排列）
navBar=I(topbar, {
  type: "frame", name: "nav-bar",
  layout: "horizontal", alignItems: "center", gap: 0,
  width: "fill_container", height: "fill_container",
  padding: [0, 16]
})

// 用户区（右）
userArea=I(topbar, {
  type: "frame", name: "userProfile",
  layout: "horizontal", alignItems: "center", gap: 12,
  width: "fit_content(200)"
})

// ③ 内容区（全宽）
content=I(page, {
  type: "frame", name: "content",
  width: "fill_container", height: "fill_container",
  layout: "vertical", gap: 24, padding: [24, 32],
  fill: "$color/bg/page"
})
```

> 验证要点（`snapshot_layout(page, maxDepth:2)`）：
> - `topbar` 宽度 = 1440（fill_container）✅
> - `content` 宽度 = 1440（fill_container）✅
> - 无 sidebar 节点 ✅

### Batch 2：顶导导航项

```javascript
// 激活态导航项（底部 2px 品牌色线）
navActive=I("NAVBAR_ID", {
  type: "frame", name: "nav-item-active",
  layout: "horizontal", alignItems: "center", padding: [0, 16],
  height: "fill_container",
  stroke: { fill: "$color/brand/normal", thickness: { bottom: 2 } }
})
I(navActive, { type: "text", content: "当前模块", fontFamily: "Inter", fontSize: 14, fontWeight: "600", fill: "$color/brand/normal" })

// 普通导航项（Hover 态加底部线）
navItem=I("NAVBAR_ID", {
  type: "frame", name: "nav-item",
  layout: "horizontal", alignItems: "center", padding: [0, 16],
  height: "fill_container"
})
I(navItem, { type: "text", content: "其他模块", fontFamily: "Inter", fontSize: 14, fontWeight: "400", fill: "$color/text/secondary" })

// 用户区内容（使用 USERAREA_ID）
I("USERAREA_ID", {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "bell",
  width: 18, height: 18, fill: "$color/text/secondary"
})
avatarCircle=I("USERAREA_ID", {
  type: "frame", width: 28, height: 28, cornerRadius: 14,
  fill: "$color/brand/normal",
  layout: "horizontal", justifyContent: "center", alignItems: "center"
})
I(avatarCircle, { type: "text", content: "管", fill: "$color/text/anti", fontSize: 12, fontWeight: "700" })
I("USERAREA_ID", { type: "text", content: "管理员", fill: "$color/text/secondary", fontSize: 14 })
```

---

## 双层顶导 Shell 模板

> 一级菜单在 TopBar，点击后在 TopBar 下方渲染二级导航条（SubNav）。

### Batch 1：Shell + SubNav 骨架

```javascript
page=I("document", {
  type: "frame", name: "页面名称-双层顶导",
  width: 1440, height: 900,
  layout: "vertical", fill: "$color/bg/page", placeholder: true
})

// 一级 TopBar（64px，同单层顶导）
topbar=I(page, {
  type: "frame", name: "topbar",
  width: "fill_container", height: 64,
  layout: "horizontal", alignItems: "center", padding: [0, 24],
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})
logoArea=I(topbar, { type: "frame", name: "logo", layout: "horizontal", alignItems: "center", gap: 8, width: "fit_content(180)" })
I(logoArea, { type: "frame", width: 28, height: 28, cornerRadius: 6, fill: "$color/brand/normal" })
I(logoArea, { type: "text", content: "产品名", fontFamily: "Inter", fontSize: 14, fontWeight: "700", fill: "$color/text/primary" })
navBar=I(topbar, { type: "frame", name: "nav-bar", layout: "horizontal", alignItems: "center", gap: 0, width: "fill_container", height: "fill_container", padding: [0, 16] })
spacer=I(topbar, { type: "frame", width: "fill_container", height: 1 })
userArea=I(topbar, { type: "frame", name: "userProfile", layout: "horizontal", alignItems: "center", gap: 12, width: "fit_content(200)" })

// 二级导航条 SubNav（48px，灰底）
subNav=I(page, {
  type: "frame", name: "subnav",
  width: "fill_container", height: 48,
  layout: "horizontal", alignItems: "center", padding: [0, 24], gap: 0,
  fill: "$color/bg/secondary",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})

// 内容区
content=I(page, {
  type: "frame", name: "content",
  width: "fill_container", height: "fill_container",
  layout: "vertical", gap: 24, padding: [24, 32],
  fill: "$color/bg/page"
})
```

### Batch 2：一级 + 二级导航项

```javascript
// 一级激活项（TopBar 内）
navActive1=I("NAVBAR_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 16],
  height: "fill_container",
  stroke: { fill: "$color/brand/normal", thickness: { bottom: 2 } }
})
I(navActive1, { type: "text", content: "当前一级", fontFamily: "Inter", fontSize: 14, fontWeight: "600", fill: "$color/brand/normal" })

// 普通一级项
navItem1=I("NAVBAR_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 16],
  height: "fill_container"
})
I(navItem1, { type: "text", content: "其他一级", fontFamily: "Inter", fontSize: 14, fill: "$color/text/secondary" })

// 二级激活项（SubNav 内）
navActive2=I("SUBNAV_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 16],
  height: "fill_container",
  stroke: { fill: "$color/brand/normal", thickness: { bottom: 2 } }
})
I(navActive2, { type: "text", content: "当前二级", fontFamily: "Inter", fontSize: 13, fontWeight: "600", fill: "$color/brand/normal" })

// 普通二级项
navItem2=I("SUBNAV_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 16],
  height: "fill_container"
})
I(navItem2, { type: "text", content: "其他二级", fontFamily: "Inter", fontSize: 13, fill: "$color/text/secondary" })
```


---

## 混合导航 Shell 模板（顶导 + 侧边栏）

> **混合导航 = TopBar 承载一级（跨模块切换）+ Sidebar 承载二/三级（模块内功能）**
>
> 与标准侧边栏的区别：标准型侧边栏同时承载一级和二级，混合型将一级提升到 TopBar。

### Batch 1：Shell 骨架（layout:none 绝对定位）

```javascript
// ① 画板（绝对定位，精确控制各区域宽度）
page=I("document", {
  type: "frame", name: "页面名称-混合导航",
  width: 1440, height: 900,
  layout: "none", fill: "$color/bg/page", placeholder: true
})

// ② TopBar（全宽，承载一级导航 + Logo + 用户区）
topbar=I(page, {
  type: "frame", name: "topbar",
  x: 0, y: 0, width: 1440, height: 64,
  layout: "horizontal", alignItems: "center", padding: [0, 24], gap: 0,
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})
logoArea=I(topbar, {
  type: "frame", name: "logo",
  layout: "horizontal", alignItems: "center", gap: 8, width: "fit_content(200)"
})
I(logoArea, {
  type: "frame", width: 28, height: 28, cornerRadius: 6, fill: "$color/brand/normal"
  // DAS UIKit 规范：Logo 高度 24~28px，最大 32px
})
I(logoArea, {
  type: "text", content: "产品名",
  fontFamily: "Inter", fontSize: 14, fontWeight: "700", fill: "$color/text/primary"
})
navBar=I(topbar, {
  type: "frame", name: "nav-bar",
  layout: "horizontal", alignItems: "center", gap: 0,
  width: "fill_container", height: "fill_container", padding: [0, 16]
})
spacer=I(topbar, { type: "frame", width: "fill_container", height: 1 })
userArea=I(topbar, {
  type: "frame", name: "userProfile",
  layout: "horizontal", alignItems: "center", gap: 12, width: "fit_content(200)"
})

// ③ Sidebar（从 y=64 开始，高度 836px，承载二/三级导航）
sidebar=I(page, {
  type: "frame", name: "sidebar",
  x: 0, y: 64, width: 200, height: 836,
  layout: "vertical",
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { right: 1 } }
})
navArea=I(sidebar, {
  type: "frame", name: "nav",
  width: "fill_container", height: "fill_container",
  layout: "vertical", gap: 2, padding: [8, 8]
})

// ④ 主内容区（从 x=200, y=64 开始，宽度 1240）
main=I(page, {
  type: "frame", name: "main",
  x: 200, y: 64, width: 1240, height: 836,
  layout: "vertical", gap: 24, padding: [24, 24],
  fill: "$color/bg/page"
})
```

> 验证要点（`snapshot_layout(page, maxDepth:2)`）：
> - `topbar` 宽度 = 1440，高度 = 64 ✅
> - `sidebar` x = 0，y = 64，宽度 = 200 ✅
> - `main` x = 200，y = 64，宽度 = 1240 ✅

### Batch 2：TopBar 一级导航项（模块切换）

```javascript
// TopBar 中的一级模块激活项（底部高亮线）
moduleActive=I("NAVBAR_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 20],
  height: "fill_container",
  stroke: { fill: "$color/brand/normal", thickness: { bottom: 2 } }
})
I(moduleActive, {
  type: "text", content: "当前模块",
  fontFamily: "Inter", fontSize: 14, fontWeight: "600", fill: "$color/brand/normal"
})

// 普通模块项
moduleItem=I("NAVBAR_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 20],
  height: "fill_container"
})
I(moduleItem, {
  type: "text", content: "其他模块",
  fontFamily: "Inter", fontSize: 14, fill: "$color/text/secondary"
})
// 复制 moduleItem 追加 4~6 个模块
```

### Batch 3：Sidebar 二级/三级导航项

```javascript
// 二级功能组标题
groupLabel=I("NAVAREA_ID", {
  type: "text", content: "功能分组",
  fontFamily: "Inter", fontSize: 11, fontWeight: "600",
  fill: "$color/text/placeholder",
  textGrowth: "fixed-width", width: "fill_container"
})

// 二级功能项（激活态）
funcActive=I("NAVAREA_ID", {
  type: "frame", width: "fill_container", height: 36,
  layout: "horizontal", alignItems: "center", gap: 8, padding: [0, 12],
  cornerRadius: "$radius/sm", fill: "$color/brand/light"
})
I(funcActive, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "ICON_NAME",
  width: 14, height: 14, fill: "$color/brand/normal"
})
I(funcActive, {
  type: "text", content: "功能页面", fontFamily: "Inter",
  fontSize: 13, fontWeight: "600", fill: "$color/brand/normal"
})

// 二级功能项（普通态）
funcItem=I("NAVAREA_ID", {
  type: "frame", width: "fill_container", height: 36,
  layout: "horizontal", alignItems: "center", gap: 8, padding: [0, 12],
  cornerRadius: "$radius/sm"
})
I(funcItem, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "ICON_NAME",
  width: 14, height: 14, fill: "$color/text/placeholder"
})
I(funcItem, {
  type: "text", content: "功能页面", fontFamily: "Inter",
  fontSize: 13, fill: "$color/text/secondary"
})
// 复制 funcItem 追加更多二级功能项
```

---

## 混合导航 vs 标准侧边栏 对比

| 维度 | 标准侧边栏（shell-standard.md） | 混合导航（本文件） |
|------|-------------------------------|----------------|
| 一级导航 | 侧边栏顶部（Logo + 一级 item） | **TopBar 导航项** |
| 二级导航 | 侧边栏（缩进） | **Sidebar 二级功能** |
| 侧边栏宽度 | 240px | 200px（更窄，一级已在 TopBar） |
| 内容区宽度 | 1200px | 1240px |
| 顶栏高度 | 64px（只含面包屑+用户区） | 64px（含一级导航 + 用户区） |
| 适用规模 | 中型单产品 | 中大型多模块产品 |

---

## 四种 Shell 变体对比（顶导系列）

| 维度 | 标准型 | 可折叠型 | 顶导单层 | 顶导双层 |
|------|--------|---------|---------|---------|
| 侧边栏 | 240px 固定 | 240 ↔ 48px | 无 | 无 |
| TopBar | 64px | 64px | 64px | 64px |
| 二级导航 | 侧边栏二级 | 侧边栏二级 | 无 | SubNav 48px |
| 内容区宽度 | 1200px | 1200/1392px | 1440px | 1440px |
| 适用场景 | 通用后台 | 内容优先后台 | 简单工具/门户 | 中等规模产品 |
| Shell 文件 | shell-standard.md | shell-collapsible.md | shell-topnav.md | shell-topnav.md |
