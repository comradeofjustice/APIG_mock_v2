# 选项卡 / 详情展示

---

## DasTabs 选项卡

> Tab 条 + 内容区的完整结构。激活态底部加 2px 品牌色线。

```
tabs=I("parent", {
  type: "frame",
  reusable: true,
  layout: "vertical", gap: 0,
  width: "fill_container", height: "fit_content"
})

// Tab 条（固定高度 40px，底部边框）
tabBar=I(tabs, {
  type: "frame", name: "tab-bar",
  layout: "horizontal", gap: 0,
  width: "fill_container", height: 40,
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})

// 激活态 Tab（底部 2px 品牌色线）
tabActive=I(tabBar, {
  type: "frame", name: "DasTabPaneActive",
  reusable: true,
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  padding: [0, 16], height: "fill_container", width: "fit_content",
  stroke: {fill: "$color/brand/normal", thickness: {bottom: 2}}
})
I(tabActive, {type: "text", name: "label", content: "选项卡一",
  fontSize: "$font/size/base", fontWeight: "500", fill: "$color/text/brand"})

// 默认态 Tab（可复用）
tabDefault=I(tabBar, {
  type: "frame", name: "DasTabPane",
  reusable: true,
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  padding: [0, 16], height: "fill_container", width: "fit_content"
})
I(tabDefault, {type: "text", name: "label", content: "选项卡二",
  fontSize: "$font/size/base", fill: "$color/text/secondary"})

// 更多 Tab：复制 tabDefault，修改 label 文字
// tab3=C(tabDefault, tabBar, {descendants: {"label": {content: "选项卡三"}}})

// 内容区
tabContent=I(tabs, {
  type: "frame", name: "tab-content",
  layout: "vertical", padding: [16, 0, 0, 0],
  width: "fill_container", height: "fit_content"
})
// 在 tabContent 内插入 DasTable / DasForm 等内容
```

---

---

## DasDetail 详情展示

> 表格式详情，左侧标签列（灰底，固定宽 160px）+ 右侧内容列。

```
detail=I("parent", {
  type: "frame",
  reusable: true,
  layout: "vertical", gap: 0,
  width: "fill_container", height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  stroke: {fill: "$color/stroke/default", thickness: 1}
})

// 标题行
detailHeader=I(detail, {
  type: "frame", name: "detail-header",
  layout: "horizontal", alignItems: "center", justifyContent: "space-between",
  padding: [0, 20], width: "fill_container", height: 48,
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
I(detailHeader, {type: "text", name: "title", content: "详情标题",
  fontSize: "$font/size/base", fontWeight: "600", fill: "$color/text/primary"})

// 数据行（复制追加更多行）
detailRow=I(detail, {
  type: "frame", name: "detail-row",
  layout: "horizontal", gap: 0,
  width: "fill_container", height: "fit_content",
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
labelCell=I(detailRow, {
  type: "frame", name: "detail-label",
  layout: "horizontal", alignItems: "center",
  padding: [10, 16], width: 160, height: "fit_content",
  fill: "$color/bg/secondary",
  stroke: {fill: "$color/stroke/default", thickness: {right: 1}}
})
I(labelCell, {type: "text", name: "label", content: "字段名称",
  fontSize: "$font/size/base", fill: "$color/text/secondary"})
valueCell=I(detailRow, {
  type: "frame", name: "detail-value",
  layout: "horizontal", alignItems: "center",
  padding: [10, 16], width: "fill_container", height: "fit_content"
})
I(valueCell, {type: "text", name: "value", content: "字段内容",
  fontSize: "$font/size/base", fill: "$color/text/primary"})

// 更多行：C(detailRow, detail, {descendants: {"detail-label/label": {content: "字段二"}, "detail-value/value": {content: "内容二"}}})
```

---
