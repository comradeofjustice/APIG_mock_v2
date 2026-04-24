# 空状态 / 提示条

---

## DasEmpty 空状态

> 无数据时的占位组件，居中展示图标 + 描述文字。

```
empty=I("parent", {
  type: "frame",
  reusable: true,
  layout: "vertical", alignItems: "center", justifyContent: "center",
  gap: 8, padding: [40, 0],
  width: "fill_container", height: "fit_content"
})
iconWrap=I(empty, {
  type: "frame", name: "empty-icon",
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  width: 64, height: 64,
  fill: "$color/bg/secondary", cornerRadius: "$radius/full"
})
I(iconWrap, {
  type: "icon_font", name: "icon",
  iconFontFamily: "lucide", iconFontName: "inbox",
  width: 32, height: 32, fill: "$color/text/placeholder"
})
I(empty, {type: "text", name: "desc", content: "暂无数据",
  fontSize: "$font/size/base", fill: "$color/text/placeholder"})
```

> 替换图标：修改 `iconFontName`（如 `"search"` / `"file-x"` / `"database"`）以匹配业务语境。

---

---

## DasAlert 提示条

> 内嵌告警条，左侧 3px 色带区分类型，4 种语义变体。

```
// ── Info（品牌蓝）
alertInfo=I("parent", {
  type: "frame", name: "DasAlertInfo",
  reusable: true,
  layout: "horizontal", alignItems: "center", gap: 8,
  padding: [10, 16], width: "fill_container", height: "fit_content",
  cornerRadius: "$radius/xs",
  fill: "$color/brand/light",
  stroke: {fill: "$color/brand/normal", thickness: {left: 3}}
})
I(alertInfo, {type: "icon_font", name: "icon",
  iconFontFamily: "lucide", iconFontName: "info",
  width: 16, height: 16, fill: "$color/text/brand"})
I(alertInfo, {type: "text", name: "message", content: "这是一条提示信息",
  fontSize: "$font/size/base", fill: "$color/text/brand"})

// ── Warning（黄色）— 同结构，替换 token
alertWarn=I("parent", {
  type: "frame", name: "DasAlertWarning", reusable: true,
  layout: "horizontal", alignItems: "center", gap: 8,
  padding: [10, 16], width: "fill_container", height: "fit_content",
  cornerRadius: "$radius/xs",
  fill: "$color/status/warning-light",
  stroke: {fill: "$color/status/warning", thickness: {left: 3}}
})
I(alertWarn, {type: "icon_font", iconFontFamily: "lucide", iconFontName: "triangle-alert",
  width: 16, height: 16, fill: "$color/status/warning"})
I(alertWarn, {type: "text", name: "message", content: "这是一条警告信息",
  fontSize: "$font/size/base", fill: "$color/status/warning"})

// ── Error（红色）
alertErr=I("parent", {
  type: "frame", name: "DasAlertError", reusable: true,
  layout: "horizontal", alignItems: "center", gap: 8,
  padding: [10, 16], width: "fill_container", height: "fit_content",
  cornerRadius: "$radius/xs",
  fill: "$color/status/error-light",
  stroke: {fill: "$color/status/error", thickness: {left: 3}}
})
I(alertErr, {type: "icon_font", iconFontFamily: "lucide", iconFontName: "circle-x",
  width: 16, height: 16, fill: "$color/status/error"})
I(alertErr, {type: "text", name: "message", content: "这是一条错误信息",
  fontSize: "$font/size/base", fill: "$color/status/error"})

// ── Success（绿色）
alertSucc=I("parent", {
  type: "frame", name: "DasAlertSuccess", reusable: true,
  layout: "horizontal", alignItems: "center", gap: 8,
  padding: [10, 16], width: "fill_container", height: "fit_content",
  cornerRadius: "$radius/xs",
  fill: "$color/status/success-light",
  stroke: {fill: "$color/status/success", thickness: {left: 3}}
})
I(alertSucc, {type: "icon_font", iconFontFamily: "lucide", iconFontName: "circle-check",
  width: 16, height: 16, fill: "$color/status/success"})
I(alertSucc, {type: "text", name: "message", content: "这是一条成功信息",
  fontSize: "$font/size/base", fill: "$color/status/success"})
```

---
