# 按钮组件

> 语法规范 -> syntax-rules.md

---

## Button 按钮

### Primary Button

```
btn=I("parent", {
  type: "frame",
  width: "fit_content", height: "$density/btn-height-md",
  fill: "$color/brand/normal",
  cornerRadius: "$radius/btn-md",
  layout: "horizontal", alignItems: "center",
  padding: [6, 16], gap: 6
})
I(btn, {
  type: "text", content: "按钮文字",
  fontSize: "$font/size/base", fontWeight: "500",
  fill: "$color/text/anti"
})
```

### Default Button（描边样式）

```
btn=I("parent", {
  type: "frame",
  width: "fit_content", height: "$density/btn-height-md",
  fill: "$color/bg/component",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/btn-md",
  layout: "horizontal", alignItems: "center",
  padding: [0, 16], gap: 6
})
I(btn, {
  type: "text", content: "按钮文字",
  fontSize: "$font/size/base",
  fill: "$color/text/primary"
})
```

### Danger Button

```
btn=I("parent", {
  type: "frame",
  width: "fit_content", height: "$density/btn-height-md",
  fill: "$color/status/error",
  cornerRadius: "$radius/btn-md",
  layout: "horizontal", alignItems: "center",
  padding: [0, 16]
})
I(btn, {
  type: "text", content: "按钮文字",
  fontSize: "$font/size/base", fontWeight: "500",
  fill: "$color/text/anti"
})
```

---
