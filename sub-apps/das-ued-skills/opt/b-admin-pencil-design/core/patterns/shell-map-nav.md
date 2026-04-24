# Shell - 地图式导航型

> 其他变体 → [shell-standard.md](shell-standard.md) | [shell-topnav.md](shell-topnav.md) | [shell-collapsible.md](shell-collapsible.md)
>
> **来源**：DAS UED UIKit Menu 组件规范（地图式导航章节）

---

## 适用场景

- 超大体量产品套件（一级功能模块 ≥ 10 个）
- 需要跨系统导航的门户型入口
- 用户角色多样，不同角色关注不同模块

> ⚠️ 本模式**不适合**单系统应用，请优先考虑侧边导航或混合导航。

---

## 结构说明

地图式导航由 TopBar + 可展开的"菜单地图面板"构成，面板分三列：

| 区域 | 说明 |
|------|------|
| 左列 · 一级分类 | 产品/系统分类列表，Hover 展开右侧面板 |
| 中列 · 二级菜单 | 当前一级分类下的功能模块，按分组排列 |
| 右列 · 三级菜单 | Hover 二级菜单时展开的三级功能页面 |
| 顶部 · 收藏 + 最近 | 个人收藏 + 最近常用快捷入口 |
| 顶部 · 全局搜索 | 跨系统功能页面全局搜索 |

---

## 画板一：Portal 首页（菜单收起态）

### Batch 1：TopBar + 收起态 Shell

```javascript
// ① 画板（全宽，layout:vertical，菜单收起时正常显示内容区）
page=I("document", {
  type: "frame", name: "门户首页-地图导航",
  width: 1440, height: 900,
  layout: "vertical", fill: "$color/bg/page", placeholder: true
})

// ② TopBar（全宽 1440px）
topbar=I(page, {
  type: "frame", name: "topbar",
  width: "fill_container", height: 64,
  layout: "horizontal", alignItems: "center", padding: [0, 24], gap: 0,
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})

// Logo 区（左）
logoArea=I(topbar, {
  type: "frame", name: "logo",
  layout: "horizontal", alignItems: "center", gap: 8,
  width: "fit_content(200)"
})
I(logoArea, {
  type: "frame", width: 28, height: 28, cornerRadius: 6, fill: "$color/brand/normal"
  // DAS UIKit 规范：Logo 高度 24~28px，最大允许破框至 32px
})
I(logoArea, {
  type: "text", content: "XXXX安全管理系统",
  fontFamily: "Inter", fontSize: 14, fontWeight: "700", fill: "$color/text/primary"
})

// 一级导航项区（中）
navBar=I(topbar, {
  type: "frame", name: "nav-bar",
  layout: "horizontal", alignItems: "center", gap: 0,
  width: "fill_container", height: "fill_container", padding: [0, 16]
})

// 用户区（右）
userArea=I(topbar, {
  type: "frame", name: "userProfile",
  layout: "horizontal", alignItems: "center", gap: 12,
  width: "fit_content(200)"
})

// ③ 内容区（Portal 内容，如快捷入口、统计面板等）
content=I(page, {
  type: "frame", name: "content",
  width: "fill_container", height: "fill_container",
  layout: "vertical", gap: 24, padding: [32, 40],
  fill: "$color/bg/page"
})
```

### Batch 2：TopBar 导航项 + 用户区

```javascript
// 一级激活导航项（底部 2px 品牌色线）
navActive=I("NAVBAR_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 20],
  height: "fill_container",
  stroke: { fill: "$color/brand/normal", thickness: { bottom: 2 } }
})
I(navActive, {
  type: "text", content: "一级导航",
  fontFamily: "Inter", fontSize: 14, fontWeight: "600", fill: "$color/brand/normal"
})

// 普通一级导航项
navItem=I("NAVBAR_ID", {
  type: "frame", layout: "horizontal", alignItems: "center", padding: [0, 20],
  height: "fill_container"
})
I(navItem, {
  type: "text", content: "一级导航",
  fontFamily: "Inter", fontSize: 14, fontWeight: "400", fill: "$color/text/secondary"
})
// 复制 navItem 追加更多一级项，共 6~8 个

// 用户区
I("USERAREA_ID", {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "bell",
  width: 18, height: 18, fill: "$color/text/secondary"
})
avatarCircle=I("USERAREA_ID", {
  type: "frame", width: 28, height: 28, cornerRadius: 14,
  fill: "$color/brand/normal",
  layout: "horizontal", justifyContent: "center", alignItems: "center"
})
I(avatarCircle, {
  type: "text", content: "管", fill: "$color/text/anti",
  fontSize: 12, fontWeight: "700"
})
I("USERAREA_ID", {
  type: "text", content: "Admin",
  fill: "$color/text/secondary", fontSize: 14
})
```

---

## 画板二：菜单展开态（地图面板展开）

> 独立画板，画板名建议：`门户首页-地图导航展开`。  
> 菜单面板覆盖在 TopBar 下方，以绝对定位浮层呈现。

### Batch 1：画板骨架 + TopBar（同画板一）

> 复用画板一的 Batch 1 和 Batch 2，只将 `layout: "vertical"` 改为 `layout: "none"` 以支持面板绝对定位。

```javascript
page=I("document", {
  type: "frame", name: "门户首页-地图导航展开",
  width: 1440, height: 900,
  layout: "none",   // ← 绝对定位模式
  fill: "$color/bg/page", placeholder: true
})
// TopBar（同上，y:0）
topbar=I(page, { ..., x: 0, y: 0, width: 1440, height: 64 })
```

### Batch 2：菜单面板主体（三列结构）

```javascript
// 菜单地图面板（TopBar 下方，全宽，浮在内容区上方）
mapPanel=I(page, {
  type: "frame", name: "map-panel",
  x: 0, y: 64, width: 1440,
  layout: "vertical", gap: 0,
  fill: "$color/bg/container",
  effect: { type: "shadow", shadowType: "outer", offset: { x: 0, y: 4 }, blur: 16, color: "#00000014" }
})

// 顶部工具行（搜索 + 收藏 + 最近常用）
toolRow=I(mapPanel, {
  type: "frame", name: "panel-toolbar",
  width: "fill_container", height: 52,
  layout: "horizontal", alignItems: "center", gap: 16, padding: [0, 24],
  fill: "$color/bg/secondary",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})

// 全局搜索框
searchBox=I(toolRow, {
  type: "frame", width: 280,
  layout: "horizontal", alignItems: "center", gap: 8,
  padding: [0, 12], cornerRadius: "$radius/xs",
  fill: "$color/bg/component",
  stroke: { fill: "$color/border/default", thickness: 1 }
})
I(searchBox, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "search",
  width: 16, height: 16, fill: "$color/text/placeholder"
})
I(searchBox, {
  type: "text", content: "请输入产品名称，快速查找产品",
  fontSize: 12, fill: "$color/text/placeholder"
})

// 最近常用标签行
recentLabel=I(toolRow, {
  type: "text", content: "最近常用：",
  fontFamily: "Inter", fontSize: 12, fill: "$color/text/secondary"
})
// 最近使用快捷标签（chip 形式，复制 3~6 个）
chip=I(toolRow, {
  type: "frame", layout: "horizontal", alignItems: "center",
  padding: [3, 10], cornerRadius: "$radius/xs",
  fill: "$color/bg/page",
  stroke: { fill: "$color/border/default", thickness: 1 }
})
I(chip, { type: "text", content: "三级菜单", fontSize: 12, fill: "$color/text/primary" })

// 三列导航区
navCols=I(mapPanel, {
  type: "frame", name: "nav-columns",
  width: "fill_container",
  layout: "horizontal", gap: 0
})
```

### Batch 3：左列（一级分类）

```javascript
// 左列：一级分类（160px 固定宽）
leftCol=I("NAVCOLS_ID", {
  type: "frame", name: "left-col",
  width: 160, height: 600,
  layout: "vertical", gap: 0, padding: [8, 0],
  fill: "$color/bg/secondary",
  stroke: { fill: "$color/stroke/default", thickness: { right: 1 } }
})

// 一级分类项（激活态）
catActive=I(leftCol, {
  type: "frame", name: "cat-active",
  width: "fill_container", height: 44,
  layout: "horizontal", alignItems: "center", padding: [0, 16], gap: 8,
  fill: "$color/bg/container",
  stroke: { fill: "$color/brand/normal", thickness: { left: 3 } }
})
I(catActive, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "shield",
  width: 16, height: 16, fill: "$color/brand/normal"
})
I(catActive, {
  type: "text", content: "一级导航",
  fontFamily: "Inter", fontSize: 13, fontWeight: "600", fill: "$color/brand/normal"
})

// 普通一级分类项（复制追加 7~8 个）
catItem=I(leftCol, {
  type: "frame", name: "cat-item",
  width: "fill_container", height: 44,
  layout: "horizontal", alignItems: "center", padding: [0, 16], gap: 8
})
I(catItem, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "layers",
  width: 16, height: 16, fill: "$color/text/secondary"
})
I(catItem, {
  type: "text", content: "一级导航",
  fontFamily: "Inter", fontSize: 13, fill: "$color/text/secondary"
})

// 分隔线（我的收藏区）
I(leftCol, {
  type: "frame", name: "divider",
  width: "fill_container", height: 1, fill: "$color/stroke/default"
})
favItem=I(leftCol, {
  type: "frame", width: "fill_container", height: 44,
  layout: "horizontal", alignItems: "center", padding: [0, 16], gap: 8
})
I(favItem, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "star",
  width: 16, height: 16, fill: "$color/text/secondary"
})
I(favItem, {
  type: "text", content: "我的收藏",
  fontFamily: "Inter", fontSize: 13, fill: "$color/text/secondary"
})
```

### Batch 4：中列（二级菜单）+ 右列（三级菜单）

```javascript
// 中列：二级菜单（分组排列）
midCol=I("NAVCOLS_ID", {
  type: "frame", name: "mid-col",
  width: 240, height: 600,
  layout: "vertical", gap: 0, padding: [16, 16],
  stroke: { fill: "$color/stroke/default", thickness: { right: 1 } }
})

// 二级分组标题
groupTitle=I(midCol, {
  type: "text", content: "二级菜单",
  fontFamily: "Inter", fontSize: 11, fontWeight: "600",
  fill: "$color/text/placeholder"
})

// 二级菜单项（激活态）
menuActive=I(midCol, {
  type: "frame", width: "fill_container", height: 36,
  layout: "horizontal", alignItems: "center", padding: [0, 12], gap: 8,
  cornerRadius: "$radius/sm", fill: "$color/brand/light"
})
I(menuActive, {
  type: "text", content: "二级菜单",
  fontFamily: "Inter", fontSize: 13, fontWeight: "500", fill: "$color/brand/normal"
})
I(menuActive, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "chevron-right",
  width: 14, height: 14, fill: "$color/brand/normal"
})

// 普通二级菜单项（复制追加 5~8 个）
menuItem=I(midCol, {
  type: "frame", width: "fill_container", height: 36,
  layout: "horizontal", alignItems: "center", padding: [0, 12], gap: 8,
  cornerRadius: "$radius/sm"
})
I(menuItem, {
  type: "text", content: "二级菜单",
  fontFamily: "Inter", fontSize: 13, fill: "$color/text/secondary"
})
I(menuItem, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "chevron-right",
  width: 14, height: 14, fill: "$color/text/placeholder"
})

// 右列：三级菜单（fill 剩余宽度）
rightCol=I("NAVCOLS_ID", {
  type: "frame", name: "right-col",
  width: "fill_container", height: 600,
  layout: "vertical", gap: 2, padding: [16, 20]
})
// 三级菜单项（文字列表，简单样式）
menuItem3=I(rightCol, {
  type: "frame", width: "fill_container", height: 32,
  layout: "horizontal", alignItems: "center", padding: [0, 8],
  cornerRadius: "$radius/sm"
})
I(menuItem3, {
  type: "text", content: "三级菜单",
  fontFamily: "Inter", fontSize: 13, fill: "$color/text/primary"
})
// 复制追加 7~10 个三级菜单项
```

---

## 深色模式变体

> 同结构，将以下 token 替换即可（通过 Pencil Variables 切换，无需重建）：
>
> - `$color/bg/container` → 深色容器背景
> - `$color/bg/secondary` → 深色次级背景
> - `$color/stroke/default` → 深色分割线
>
> 在 Pencil 中切换 `color-mode` 变量即可预览深色版本。

---

## 四种 Shell 变体最终对比

| 维度 | 标准侧边栏 | 可折叠侧边栏 | 顶导型 | 地图式导航 |
|------|----------|------------|------|---------|
| 一级导航位置 | 侧边栏 | 侧边栏（可折叠） | TopBar | TopBar |
| 二级导航位置 | 侧边栏（缩进） | 侧边栏（缩进） | SubNav 条 / 无 | 展开面板左列 |
| 三级导航位置 | 侧边栏（深缩进） | 无（折叠时隐藏） | 内容区 Tab | 展开面板右列 |
| 最大层级 | 3 级 | 2 级（折叠后） | 2 级 | 3 级 |
| 产品规模 | 中等 | 中等（内容优先） | 小型 | 超大型套件 |
| 文件 | shell-standard.md | shell-collapsible.md | shell-topnav.md | shell-map-nav.md |
