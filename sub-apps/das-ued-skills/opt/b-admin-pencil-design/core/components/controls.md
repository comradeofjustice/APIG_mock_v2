# 彩色头像 / 引导卡片 / 开关控件

---

## ColoredIconAvatar 彩色图标头像

> 用于卡片左上角，以颜色 + 图标区分内容类型，比纯文字字母更具视觉辨识度。
> `iconFontName` 传入 Lucide 图标名（如 `mail`、`shield`、`search`、`code-2`）。
> `bgFill` 传入语义色浅色 token，`iconFill` 传入对应深色 token。

### 通用版（变量颜色）

```
iconAvatar=I("parent", {
  type: "frame",
  width: 40, height: 40,
  fill: "$color/brand/light",
  cornerRadius: 10,
  layout: "horizontal", justifyContent: "center", alignItems: "center"
})
I(iconAvatar, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "shield",
  width: 20, height: 20,
  fill: "$color/brand/normal"
})
```

### 语义色变体速查

| 剧本类型 | 背景 Token | 图标 Token | 推荐 Lucide 图标 |
|---------|-----------|-----------|----------------|
| 通用剧本 | `$color/brand/light` | `$color/brand/normal` | `workflow` / `layers` |
| 调查剧本 | `$color/status/warning-light`（橙浅） | `$color/status/warning` | `search` / `scan-search` |
| 处置剧本 | `$color/status/error-light` | `$color/status/error` | `shield-alert` / `siren` |
| 网络安全 | `$color/brand/light` | `$color/brand/normal` | `lock` / `fingerprint` |
| 身份认证 | `$color/status/success-light` | `$color/status/success` | `user-check` |

---

---

## CreatePlaceholderCard 新建引导卡片

> 卡片列表末尾的"新建"占位卡片，虚线边框 + 居中引导文案，邀请用户创建。
> 宽度和高度与同行 PlaybookCard 保持一致（通常 width 相同，height: `fit_content`）。

```
placeholderCard=I("parent", {
  type: "frame",
  width: 320,
  layout: "vertical", justifyContent: "center", alignItems: "center",
  gap: 12, padding: [40, 24],
  cornerRadius: 8,
  fill: "$color/bg/page",
  stroke: { fill: "$color/border/default", thickness: 1.5, dashPattern: [6, 4] }
})

// 加号图标
I(placeholderCard, {
  type: "icon_font", iconFontFamily: "lucide", iconFontName: "plus-circle",
  width: 28, height: 28,
  fill: "$color/text/placeholder"
})

// 引导标题
I(placeholderCard, {
  type: "text", content: "新建剧本",
  fontFamily: "Inter", fontSize: 14, fontWeight: "600",
  fill: "$color/text/placeholder"
})

// 引导描述
I(placeholderCard, {
  type: "text", content: "从头开始搭建自动化安全工作流",
  fontFamily: "Inter", fontSize: 12, fontWeight: "400",
  fill: "$color/text/placeholder",
  textAlign: "center", width: "fill_container"
})
```

> `dashPattern: [6, 4]` 实现虚线边框效果（6px 实线 + 4px 间隔）。

---

---

## ToggleSwitch 开关控件

> 用于发布/取消发布等二值状态切换，比文字按钮更直观。

### 开启态（已发布）

```
toggleOn=I("parent", {
  type: "frame",
  width: 36, height: 20,
  cornerRadius: 10,
  fill: "$color/status/success",
  layout: "horizontal", alignItems: "center",
  padding: [2, 2]
})
// 右侧滑块（开启时靠右）
thumbOn=I(toggleOn, { type: "frame", width: 16, height: 16, cornerRadius: 8, fill: "#FFFFFF" })
// 用 justifyContent: "end" 把滑块推到右侧
U(toggleOn, { justifyContent: "end" })
```

### 关闭态（未发布）

```
toggleOff=I("parent", {
  type: "frame",
  width: 36, height: 20,
  cornerRadius: 10,
  fill: "$color/bg/secondary",
  stroke: { fill: "$color/border/default", thickness: 1 },
  layout: "horizontal", alignItems: "center",
  padding: [2, 2]
})
// 左侧滑块（关闭时靠左）
I(toggleOff, { type: "frame", width: 16, height: 16, cornerRadius: 8, fill: "$color/text/placeholder" })
```

> 若需在卡片操作行中使用：将 `toggleOn` / `toggleOff` 替换「取消发布」文字按钮，放入 `actionRow` 的左侧即可。

---
