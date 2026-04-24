# 导航 / 面包屑 / 用户信息 / 状态栏

---

## SideNav Item 侧边导航项

```
navItem=I("parent", {
  type: "frame",
  width: 220, height: 40,
  fill: "transparent",
  cornerRadius: "$radius/sm",
  layout: "horizontal", alignItems: "center",
  padding: [0, 12], gap: 8
})
I(navItem, {
  type: "icon_font",
  iconFontFamily: "lucide", iconFontName: "circle",
  width: "$icon/md", height: "$icon/md",
  fill: "$color/text/secondary"
})
I(navItem, {
  type: "text", content: "菜单项",
  fontSize: "$font/size/base", fill: "$color/text/secondary"
})
```

---

---

## Breadcrumb 面包屑导航

> 放在 TopBar 下方或页头区域，表达当前页面在全局导航中的位置。

```
breadcrumb=I("parent", {
  type: "frame",
  layout: "horizontal", alignItems: "center", gap: 6
})

// 父级链接
I(breadcrumb, {
  type: "text", content: "Home",
  fontFamily: "Inter", fontSize: 13, fontWeight: "400",
  fill: "$color/text/secondary"
})

// 分隔符
I(breadcrumb, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "chevron-right",
  width: 14, height: 14,
  fill: "$color/text/placeholder"
})

// 当前页（高亮）
I(breadcrumb, {
  type: "text", content: "Playbooks",
  fontFamily: "Inter", fontSize: 13, fontWeight: "600",
  fill: "$color/brand/normal"
})
```

> 多层级时：复制「父级链接 + 分隔符」组合，依次追加，最后一项为当前页。

---

## UserProfile TopBar 右侧用户信息区

> 放在全局 TopBar 最右侧，包含通知铃、消息图标、用户头像 + 姓名 + 职位。

```
userArea=I("parent", {
  type: "frame",
  layout: "horizontal", alignItems: "center", gap: 16
})

// 通知图标
I(userArea, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "bell",
  width: 18, height: 18,
  fill: "$color/text/secondary"
})

// 消息图标
I(userArea, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "message-square",
  width: 18, height: 18,
  fill: "$color/text/secondary"
})

// 分隔线
I(userArea, {
  type: "line", height: 20,
  stroke: { fill: "$color/stroke/default", thickness: 1 }
})

// 用户信息 + 头像
profileGroup=I(userArea, {
  type: "frame",
  layout: "horizontal", alignItems: "center", gap: 10
})
nameGroup=I(profileGroup, {
  type: "frame",
  layout: "vertical", gap: 2,
  alignItems: "end"
})
I(nameGroup, {
  type: "text", content: "Alex Rivera",
  fontFamily: "Inter", fontSize: 13, fontWeight: "600",
  fill: "$color/text/primary"
})
I(nameGroup, {
  type: "text", content: "Security Architect",
  fontFamily: "Inter", fontSize: 11, fontWeight: "400",
  fill: "$color/text/secondary"
})

// 头像圆形
avatar=I(profileGroup, {
  type: "frame",
  width: 32, height: 32,
  cornerRadius: 16,
  fill: "$color/brand/normal",
  layout: "horizontal", justifyContent: "center", alignItems: "center"
})
I(avatar, {
  type: "text", content: "AR",
  fontFamily: "Inter", fontSize: 11, fontWeight: "700",
  fill: "$color/text/anti"
})
```

---

---

## PageStatusBar 底部页面状态栏

> 固定在页面/内容区底部，展示汇总数据和系统状态。适用于列表管理页。

```
statusBar=I("parent", {
  type: "frame",
  width: "fill_container", height: 40,
  layout: "horizontal", justifyContent: "space_between", alignItems: "center",
  padding: [0, 32],
  fill: "$color/bg/container",
  stroke: { fill: "$color/stroke/default", thickness: { top: 1 } }
})

// 左侧：汇总数字
summaryGroup=I(statusBar, {
  type: "frame",
  layout: "horizontal", alignItems: "center", gap: 20
})
I(summaryGroup, {
  type: "text", content: "TOTAL: 48 PLAYBOOKS",
  fontFamily: "Inter", fontSize: 11, fontWeight: "600",
  fill: "$color/text/secondary"
})
I(summaryGroup, {
  type: "text", content: "ACTIVE: 32",
  fontFamily: "Inter", fontSize: 11, fontWeight: "600",
  fill: "$color/status/success"
})
I(summaryGroup, {
  type: "text", content: "DRAFTS: 16",
  fontFamily: "Inter", fontSize: 11, fontWeight: "600",
  fill: "$color/text/placeholder"
})

// 右侧：系统同步状态
syncGroup=I(statusBar, {
  type: "frame",
  layout: "horizontal", alignItems: "center", gap: 6
})
I(syncGroup, {
  type: "ellipse", width: 6, height: 6,
  fill: "$color/status/success"
})
I(syncGroup, {
  type: "text", content: "SYNCING WITH CORE ENGINE...",
  fontFamily: "Inter", fontSize: 11, fontWeight: "600",
  fill: "$color/brand/normal"
})
```

---
