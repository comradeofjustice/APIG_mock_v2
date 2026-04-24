# 树形控件 / 穿梭框

---

## DasTree 树形控件

> 层级导航树，激活节点高亮，子节点通过 padding-left 缩进。

```
tree=I("parent", {
  type: "frame",
  reusable: true,
  layout: "vertical", gap: 2, padding: [8, 4],
  width: 240, height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/xs",
  stroke: {fill: "$color/stroke/default", thickness: 1}
})

// 根节点（激活展开态）
tn1=I(tree, {
  type: "frame", name: "tree-node-root",
  layout: "horizontal", alignItems: "center", gap: 6,
  padding: [0, 8], width: "fill_container", height: 32,
  fill: "$color/brand/light", cornerRadius: "$radius/xs"
})
I(tn1, {type: "icon_font", iconFontFamily: "lucide", iconFontName: "chevron-down",
  width: 14, height: 14, fill: "$color/text/brand"})
I(tn1, {type: "text", name: "label", content: "层级一",
  fontSize: "$font/size/base", fontWeight: "500", fill: "$color/text/brand"})

// 子节点（缩进 24px，复制追加）
tn2=I(tree, {
  type: "frame", name: "tree-node-child",
  layout: "horizontal", alignItems: "center", gap: 6,
  padding: [0, 24], width: "fill_container", height: 32,
  cornerRadius: "$radius/xs"
})
I(tn2, {type: "text", name: "label", content: "层级二—子节点",
  fontSize: "$font/size/base", fill: "$color/text/primary"})
// 更多子节点：C(tn2, tree, {descendants: {"label": {content: "子节点 N"}}})
```

---

---

## DasTransfer 穿梭框

> 左（备选）+ 中（操作按钮）+ 右（已选）三栏结构。

```
transfer=I("parent", {
  type: "frame",
  reusable: true,
  layout: "horizontal", alignItems: "center", gap: 8,
  width: "fill_container", height: "fit_content"
})

// ── 备选项面板（左）
sourcePanel=I(transfer, {
  type: "frame", name: "source-panel",
  layout: "vertical", gap: 0,
  width: "fill_container", height: 280,
  fill: "$color/bg/container",
  cornerRadius: "$radius/xs",
  stroke: {fill: "$color/stroke/default", thickness: 1}
})
srcHeader=I(sourcePanel, {
  type: "frame", name: "panel-header",
  layout: "horizontal", alignItems: "center", justifyContent: "space-between",
  padding: [0, 12], width: "fill_container", height: 40,
  fill: "$color/bg/secondary",
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
I(srcHeader, {type: "text", content: "备选项",
  fontSize: "$font/size/sm", fontWeight: "600", fill: "$color/text/primary"})
I(srcHeader, {type: "text", content: "0/5",
  fontSize: "$font/size/sm", fill: "$color/text/secondary"})

// ── 中间操作按钮（→ / ←）
actions=I(transfer, {
  type: "frame", name: "transfer-actions",
  layout: "vertical", alignItems: "center", justifyContent: "center", gap: 8,
  width: "fit_content", height: "fit_content"
})
btnRight=I(actions, {
  type: "frame", name: "btn-right",
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  width: 28, height: 28,
  fill: "$color/brand/normal", cornerRadius: "$radius/sm"
})
I(btnRight, {type: "icon_font", iconFontFamily: "lucide", iconFontName: "chevron-right",
  width: 16, height: 16, fill: "$color/text/anti"})
btnLeft=I(actions, {
  type: "frame", name: "btn-left",
  layout: "horizontal", alignItems: "center", justifyContent: "center",
  width: 28, height: 28,
  fill: "$color/bg/container",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/sm"
})
I(btnLeft, {type: "icon_font", iconFontFamily: "lucide", iconFontName: "chevron-left",
  width: 16, height: 16, fill: "$color/text/primary"})

// ── 已选项面板（右，同结构，header 无灰底）
targetPanel=I(transfer, {
  type: "frame", name: "target-panel",
  layout: "vertical", gap: 0,
  width: "fill_container", height: 280,
  fill: "$color/bg/container",
  cornerRadius: "$radius/xs",
  stroke: {fill: "$color/stroke/default", thickness: 1}
})
tgtHeader=I(targetPanel, {
  type: "frame", name: "panel-header",
  layout: "horizontal", alignItems: "center", justifyContent: "space-between",
  padding: [0, 12], width: "fill_container", height: 40,
  fill: "$color/bg/container",
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
I(tgtHeader, {type: "text", content: "已选项",
  fontSize: "$font/size/sm", fontWeight: "600", fill: "$color/text/primary"})
I(tgtHeader, {type: "text", content: "0项",
  fontSize: "$font/size/sm", fill: "$color/text/secondary"})
```

---
