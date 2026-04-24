# Shell - 标准型（侧边栏 + 顶栏）

> 其他变体 → [shell-topnav.md](shell-topnav.md)（顶导型）| [shell-collapsible.md](shell-collapsible.md)（可折叠型）

---

## Page Shell（页面框架）

> **每个新页面必须从这个模板开始**，先建 Shell 再填内容。
>
> ⚠️ 关键规则：
> - 画板宽度固定 **1440px**，Sidebar 固定 **240px**，内容区 = **1200px**（不使用 fill_container，显式写死防止继承 bug）
> - 每创建一个 Shell 节点后，**立即用 `snapshot_layout` 验证宽度**，确认无 1px 节点再继续
> - Drawer 覆盖层单独放置在 Shell 根节点，不嵌入内容区

### 标准 Shell 模板（1440×900，有侧边栏）

```javascript
// ① 创建画板根节点（layout: none 使用绝对定位，精确控制各区宽度）
page=I("document", {
  type: "frame",
  name: "页面名称",
  width: 1440, height: 900,
  layout: "none",
  fill: "$color/bg/page",
  placeholder: true
})

// ② Sidebar（240px，绝对定位在左侧）
sidebar=I(page, {
  type: "frame", name: "sidebar",
  x: 0, y: 0, width: 240, height: 900,
  layout: "vertical",
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { right: 1 } }
})

// ② Logo 区
logoArea=I(sidebar, {
  type: "frame", name: "logo",
  width: "fill_container", height: 64,
  layout: "horizontal", alignItems: "center", gap: 8, padding: [0, 20],
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})
I(logoArea, {
  type: "frame", width: 28, height: 28, cornerRadius: 6, fill: "$color/brand/normal"
  // DAS UIKit 规范：Logo 主题高度 24~28px，允许破框至最大 32px
})
I(logoArea, { type: "text", content: "产品名", fontFamily: "Inter", fontSize: 14, fontWeight: "700", fill: "$color/text/primary" })

// ② 导航区（在此插入 nav item，参考下方导航项模板）
navArea=I(sidebar, {
  type: "frame", name: "nav",
  width: "fill_container", height: "fit_content(500)",
  layout: "vertical", gap: 2, padding: [8, 8]
})

// ② 底部状态条
I(sidebar, {
  type: "frame", name: "sysStatus",
  width: "fill_container", height: 48,
  layout: "horizontal", alignItems: "center", gap: 8, padding: [0, 20],
  stroke: { fill: "$color/stroke/default", thickness: { top: 1 } }
})

// ③ 主内容区（宽度显式写 1200，从 x=240 开始）
main=I(page, {
  type: "frame", name: "main",
  x: 240, y: 0, width: 1200, height: 900,
  layout: "vertical",
  fill: "$color/bg/page"
})

// ③ TopBar（64px 高）
topbar=I(main, {
  type: "frame", name: "topbar",
  width: "fill_container", height: 64,
  layout: "horizontal", alignItems: "center",
  padding: [0, 24],
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } },
  fill: "$color/bg/container"
})
// 左：面包屑区
breadcrumbArea=I(topbar, { type: "frame", name: "breadcrumb", width: "fit_content(400)", height: "fill_container", layout: "horizontal", alignItems: "center", gap: 6 })
// 右：用户区（推到右侧）
spacer=I(topbar, { type: "frame", width: "fill_container", height: 1 })
userArea=I(topbar, { type: "frame", name: "userProfile", width: "fit_content(200)", height: "fill_container", layout: "horizontal", alignItems: "center", gap: 12 })

// ③ 内容滚动区
content=I(main, {
  type: "frame", name: "content",
  width: "fill_container", height: "fill_container",
  layout: "vertical", gap: 24, padding: [24, 24],
  fill: "$color/bg/page"
})

// ④ Drawer 覆盖层（默认隐藏在右侧画板外，展开时 x=880）
// 注意：Drawer 放在 page 根节点，不放进 main 内容区
drawerOverlay=I(page, {
  type: "frame", name: "drawerOverlay",
  x: 1440, y: 0, width: 1440, height: 900,
  layout: "none", fill: { type: "color", color: "#00000040" }
})
drawer=I(drawerOverlay, {
  type: "frame", name: "drawer",
  x: 1120, y: 0, width: 320, height: 900,
  layout: "vertical",
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { left: 1 } },
  effect: { type: "shadow", offset: { x: -4, y: 0 }, blur: 16, color: "#0000001A" }
})
```

> **创建完 Shell 后必须立即执行 `snapshot_layout(page, maxDepth:2)` 验证：**
> - `sidebar` 宽度 = 240 ✅
> - `main` 宽度 = 1200 ✅
> - `topbar` 宽度 = fill_container（渲染后 = 1200）✅
> - 无任何节点宽度为 1px ✅
> 若有不符合项，**立即修复，不进行下一步**。

### 导航项模板（插入 navArea）

```javascript
// 一级导航项（父菜单，展开状态）
navGroup=I(navArea, {
  type: "frame", name: "navGroup",
  width: "fill_container", height: 40,
  layout: "horizontal", alignItems: "center", gap: 10, padding: [0, 12],
  cornerRadius: 6, fill: "$color/brand/light"
})
I(navGroup, { type: "icon_font", iconFontFamily: "lucide", iconFontName: "shield-alert", width: 16, height: 16, fill: "$color/brand/normal" })
I(navGroup, { type: "text", content: "模块名称", fontFamily: "Inter", fontSize: 13, fontWeight: "600", fill: "$color/brand/normal" })

// 二级导航项（子菜单，当前激活）
navItemActive=I(navArea, {
  type: "frame", name: "navItemActive",
  width: "fill_container", height: 36,
  layout: "horizontal", alignItems: "center", gap: 10, padding: [0, 32],
  cornerRadius: 6, fill: "$color/bg/secondary"
})
I(navItemActive, { type: "icon_font", iconFontFamily: "lucide", iconFontName: "scan-search", width: 14, height: 14, fill: "$color/brand/normal" })
I(navItemActive, { type: "text", content: "页面名称", fontFamily: "Inter", fontSize: 12, fontWeight: "600", fill: "$color/brand/normal" })

// 二级导航项（普通未激活）
navItemDefault=I(navArea, {
  type: "frame", name: "navItemDefault",
  width: "fill_container", height: 36,
  layout: "horizontal", alignItems: "center", gap: 10, padding: [0, 32],
  cornerRadius: 6, fill: "transparent"
})
I(navItemDefault, { type: "icon_font", iconFontFamily: "lucide", iconFontName: "search", width: 14, height: 14, fill: "$color/text/placeholder" })
I(navItemDefault, { type: "text", content: "页面名称", fontFamily: "Inter", fontSize: 12, fontWeight: "500", fill: "$color/text/secondary" })
```

---
