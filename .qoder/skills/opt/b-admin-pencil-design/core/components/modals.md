# 弹窗 / Drawer

---

## Modal 弹窗

```
overlay=I("parent", {
  type: "frame",
  width: 1440, height: 900,
  fill: "#00000073",
  layout: "horizontal", justifyContent: "center", alignItems: "center"
})
modal=I(overlay, {
  type: "frame",
  width: 520,
  fill: "$color/bg/container",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/lg",
  layout: "vertical"
})
modalHeader=I(modal, {
  type: "frame",
  width: "fill_container", height: 56,
  layout: "horizontal", justifyContent: "space_between", alignItems: "center",
  padding: [0, "$spacing/xl"],
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
modalTitle=I(modalHeader, {
  type: "text", content: "弹窗标题",
  fontSize: "$font/size/large", fontWeight: "600",
  fill: "$color/text/primary"
})
closeBtn=I(modalHeader, {
  type: "icon_font", iconFontName: "x", iconFontFamily: "lucide",
  width: 16, height: 16,
  fill: "$color/text/placeholder"
})
modalBody=I(modal, {
  type: "frame",
  width: "fill_container",
  layout: "vertical", gap: "$spacing/md",
  padding: ["$spacing/xl"]
})
modalFooter=I(modal, {
  type: "frame",
  width: "fill_container", height: 56,
  layout: "horizontal", justifyContent: "end", alignItems: "center",
  gap: "$spacing/sm",
  padding: [0, "$spacing/xl"],
  stroke: {fill: "$color/stroke/default", thickness: {top: 1}}
})
```

---
