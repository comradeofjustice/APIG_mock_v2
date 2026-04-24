# 输入框 / 下拉选择

---

## Input 输入框

### DasInput（带 label）

```
field=I("parent", {
  type: "frame",
  layout: "vertical", gap: 4,
  width: 240, height: "fit_content"
})
I(field, {
  type: "text", content: "字段标签",
  fontSize: "$font/size/sm", fill: "$color/text/secondary"
})
inputBox=I(field, {
  type: "frame",
  width: "fill_container", height: "$density/input-height",
  fill: "$color/bg/component",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/sm",
  layout: "horizontal", alignItems: "center",
  padding: [0, 12]
})
I(inputBox, {
  type: "text", content: "请输入内容",
  fontSize: "$font/size/base", fill: "$color/text/placeholder"
})
```

### DasSelect（带下拉箭头）

```
field=I("parent", {
  type: "frame",
  layout: "vertical", gap: 4,
  width: 240, height: "fit_content"
})
I(field, {
  type: "text", content: "下拉标签",
  fontSize: "$font/size/sm", fill: "$color/text/secondary"
})
selectBox=I(field, {
  type: "frame",
  width: "fill_container", height: "$density/input-height",
  fill: "$color/bg/component",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/sm",
  layout: "horizontal", alignItems: "center", justifyContent: "space_between",
  padding: [0, 12]
})
I(selectBox, {
  type: "text", content: "请选择",
  fontSize: "$font/size/base", fill: "$color/text/placeholder"
})
I(selectBox, {
  type: "icon_font",
  iconFontFamily: "lucide", iconFontName: "chevron-down",
  width: "$icon/md", height: "$icon/md",
  fill: "$color/text/placeholder"
})
```

---
