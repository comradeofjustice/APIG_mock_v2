# 表格

---

## DasTable 表格

> ⚠️ 表头行和数据行**必须使用固定高度 `"$density/table-row-height"`（=48）**，禁止 fit_content。

```
table=I("parent", {
  type: "frame",
  reusable: true,
  width: "fill_container", height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  stroke: {fill: "$color/stroke/default", thickness: 1},
  layout: "vertical"
})

// 表头行 — 高度必须固定
thead=I(table, {
  type: "frame", name: "thead",
  layout: "horizontal",
  width: "fill_container", height: "$density/table-row-height",
  fill: "$color/bg/secondary",
  cornerRadius: ["$radius/lg", "$radius/lg", 0, 0]
})
// 每个表头单元格：width 按需指定，height: "fill_container"
th=I(thead, {
  type: "frame",
  layout: "horizontal", alignItems: "center",
  width: 200, height: "fill_container",
  padding: [0, 16],
  stroke: {fill: "$color/stroke/default", thickness: {right: 1}}
})
I(th, {type: "text", content: "列标题",
  fontSize: "$font/size/sm", fontWeight: "600", fill: "$color/text/primary"})

// 数据行 — 高度必须固定
trow=I(table, {
  type: "frame", name: "tbody-row",
  layout: "horizontal",
  width: "fill_container", height: "$density/table-row-height",
  fill: "transparent",
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
// 每个数据单元格：width 按需指定，height: "fill_container"
td=I(trow, {
  type: "frame",
  layout: "horizontal", alignItems: "center",
  width: 200, height: "fill_container",
  padding: [0, 16],
  stroke: {fill: "$color/stroke/default", thickness: {right: 1}}
})
I(td, {type: "text", content: "数据内容",
  fontSize: "$font/size/base", fill: "$color/text/primary"})
```

### Tag 状态标签（用于表格状态列）

```
tag=I("parent", {
  type: "frame",
  width: "fit_content", height: "fit_content",
  fill: "$color/status/success-light",
  cornerRadius: "$radius/full",
  layout: "horizontal",
  padding: [2, 8]
})
I(tag, {type: "text", content: "正常",
  fontSize: "$font/size/sm", fill: "$color/status/success"})
```

---
