# 数据导出 / 异步操作按钮

---

## DasDataExport 数据导出按钮

> 带下载图标的 Default 风格按钮，语义明确、不占主视觉重量。

```
de=I("parent", {
  type: "frame",
  reusable: true,
  layout: "horizontal", alignItems: "center", gap: 6,
  padding: [0, 14], width: "fit_content", height: "$density/btn-height-md",
  fill: "$color/bg/container",
  cornerRadius: "$radius/btn-md",
  stroke: {fill: "$color/border/default", thickness: 1}
})
I(de, {
  type: "icon_font", name: "icon",
  iconFontFamily: "lucide", iconFontName: "download",
  width: 16, height: 16, fill: "$color/text/primary"
})
I(de, {type: "text", name: "label", content: "导出数据",
  fontSize: "$font/size/base", fill: "$color/text/primary"})
```

---

---

## DasAsyncButton 异步操作按钮

> 支持普通态和 loading 态两种状态，loading 时背景变浅、禁止交互。

```
// ── 普通态
ab=I("parent", {
  type: "frame", name: "DasAsyncButton",
  reusable: true,
  layout: "horizontal", alignItems: "center", gap: 6,
  padding: [0, 16], width: "fit_content", height: "$density/btn-height-md",
  fill: "$color/brand/normal", cornerRadius: "$radius/btn-md"
})
I(ab, {type: "text", name: "label", content: "异步操作",
  fontSize: "$font/size/base", fill: "$color/text/anti"})

// ── Loading 态
abLoading=I("parent", {
  type: "frame", name: "DasAsyncButtonLoading",
  reusable: true,
  layout: "horizontal", alignItems: "center", gap: 6,
  padding: [0, 16], width: "fit_content", height: "$density/btn-height-md",
  fill: "$color/brand/disabled", cornerRadius: "$radius/btn-md"
})
I(abLoading, {
  type: "icon_font", name: "spinner",
  iconFontFamily: "lucide", iconFontName: "loader",
  width: 16, height: 16, fill: "$color/text/anti"
})
I(abLoading, {type: "text", name: "label", content: "处理中...",
  fontSize: "$font/size/base", fill: "$color/text/anti"})
```

---
