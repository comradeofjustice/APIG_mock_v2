# Shell - 可折叠侧边栏型

> 其他变体 → [shell-standard.md](shell-standard.md) | [shell-topnav.md](shell-topnav.md)
>
> **设计依据**：导航规范 `--nav-height-lg: 240px`（展开）/ `--nav-height-md: 48px`（折叠仅显示图标）

---

## 适用场景

功能模块较多、需要在操作过程中最大化内容区时使用。典型场景：
- 数据分析看板（内容区要求 1200px+）
- 配置中心（大量导航项需要折叠收纳）

---

## 展开态 Shell（240px，与标准型相同）

> 参见 [shell-standard.md](shell-standard.md)，结构完全一致，在此不重复。

---

## 折叠态 Shell（48px，图标模式）

> ⚠️ 关键规则：
> - 折叠后 sidebar 宽度 = **48px**，内容区 = **1392px**（1440-48）
> - 折叠状态只显示图标，文字隐藏（不是缩小，是通过不渲染文字节点实现）
> - Hover 时通过 Tooltip 显示完整功能名（设计稿中用弹出层表示）

### Batch 1：折叠态 Shell 骨架

```javascript
// ① 画板初始化（折叠状态）
page=I("document", {
  type: "frame", name: "页面名称（折叠态）",
  width: 1440, height: 900,
  layout: "none", fill: "$color/bg/page", placeholder: true
})

// ② 折叠 Sidebar（48px）
sidebar=I(page, {
  type: "frame", name: "sidebar-collapsed",
  x: 0, y: 0, width: 48, height: 900,
  layout: "vertical",
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { right: 1 } }
})

// ② Logo 区（仅图标，无文字）
logoArea=I(sidebar, {
  type: "frame", name: "logo",
  width: "fill_container", height: 64,
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})
I(logoArea, { type: "frame", width: 28, height: 28, cornerRadius: 6, fill: "$color/brand/normal" })

// ② 导航图标区（每项只有图标，无文字标签）
navArea=I(sidebar, {
  type: "frame", name: "nav",
  width: "fill_container", height: "fill_container",
  layout: "vertical", gap: 2, padding: [8, 4]
})

// ② 底部折叠控制按钮
collapseBtn=I(sidebar, {
  type: "frame", name: "collapse-btn",
  width: "fill_container", height: 48,
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  stroke: { fill: "$color/stroke/default", thickness: { top: 1 } }
})
I(collapseBtn, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "panel-left-open",
  width: 16, height: 16, fill: "$color/text/secondary"
  // ⚠️ 展开态对应图标: "panel-left-close"
})

// ③ 主内容区（从 x=48 开始，宽度 = 1392）
main=I(page, {
  type: "frame", name: "main",
  x: 48, y: 0, width: 1392, height: 900,
  layout: "vertical", fill: "$color/bg/page"
})
topbar=I(main, {
  type: "frame", name: "topbar",
  width: "fill_container", height: 64,
  layout: "horizontal", alignItems: "center", padding: [0, 24],
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { bottom: 1 } }
})
spacer=I(topbar, { type: "frame", width: "fill_container", height: 1 })
userArea=I(topbar, { type: "frame", name: "userProfile", layout: "horizontal", alignItems: "center", gap: 12 })
content=I(main, {
  type: "frame", name: "content",
  width: "fill_container", height: "fill_container",
  layout: "vertical", gap: 24, padding: [24, 24],
  fill: "$color/bg/page"
})
```

> 验证要点（`snapshot_layout(page, maxDepth:2)`）：
> - `sidebar-collapsed` 宽度 = 48 ✅
> - `main` 宽度 = 1392 ✅
> - 无 1px 节点 ✅

### Batch 2：折叠态导航图标项

```javascript
// 使用 navArea 的实际 ID（从 Batch 1 响应中提取）
// 激活态图标项（无文字）
navActive=I("NAVAREA_ID", {
  type: "frame", name: "nav-icon-active",
  width: "fill_container", height: 40,
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  cornerRadius: "$radius/sm", fill: "$color/brand/light"
})
I(navActive, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "ICON_NAME",
  width: 16, height: 16, fill: "$color/brand/normal"
})

// 普通图标项（无文字）
navItem=I("NAVAREA_ID", {
  type: "frame", name: "nav-icon-default",
  width: "fill_container", height: 40,
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  cornerRadius: "$radius/sm"
})
I(navItem, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "ICON_NAME",
  width: 16, height: 16, fill: "$color/text/secondary"
})

// Tooltip 弹出层（Hover 时显示，放在 navItem 右侧）
// 设计稿中用小矩形标注，不需要完整实现交互
tooltip=I("NAVAREA_ID", {
  type: "frame", name: "nav-tooltip",
  x: 52, width: "fit_content",
  layout: "horizontal", alignItems: "center",
  padding: [4, 8], cornerRadius: "$radius/sm",
  fill: "$color/text/primary"
  // ⚠️ Tooltip 在设计稿中仅作示意，x 坐标相对 navItem 右边缘
})
I(tooltip, { type: "text", content: "功能名称", fontSize: 12, fill: "$color/text/anti" })
```

---

## 双态对比画板（推荐做法）

> 在同一文件中用两个画板展示展开/折叠两种状态，方便开发参照：

| 画板 | 侧边栏宽度 | 内容区宽度 | 画板名称建议 |
|------|----------|----------|-----------|
| 展开态 | 240px | 1200px | `页面名称-展开` |
| 折叠态 | 48px | 1392px | `页面名称-折叠` |
