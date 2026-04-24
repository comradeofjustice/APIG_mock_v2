# 搜索栏 / 筛选药丸 / 联合搜索栏

---

## DasSearchBar 搜索栏

```
sb=I("parent", {
  type: "frame",
  reusable: true,
  width: "fill_container", height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  layout: "vertical", gap: 12, padding: 16
})
filterRow=I(sb, {
  type: "frame",
  layout: "horizontal", gap: 12,
  width: "fill_container", height: "fit_content"
})
// 在 filterRow 里插入 3 列 DasInput 或 DasSelect，宽度用 fill_container
btnRow=I(sb, {
  type: "frame",
  layout: "horizontal", gap: 8,
  width: "fill_container", height: "fit_content",
  justifyContent: "end"
})
// 在 btnRow 里插入 Default Button（重置）和 Primary Button（搜索）
```

---

---

## FilterPill 药丸筛选条

> 横排筛选标签，替代下拉框，适用于类型、状态等枚举值筛选。
> 激活项：品牌色填充；未激活项：透明背景 + 边框。

```
filterGroup=I("parent", {
  type: "frame",
  layout: "horizontal", alignItems: "center", gap: 8
})

// 激活态（选中）
activeChip=I(filterGroup, {
  type: "frame",
  layout: "horizontal", alignItems: "center",
  padding: [6, 16], cornerRadius: 20,
  fill: "$color/brand/normal"
})
I(activeChip, {
  type: "text", content: "All Types",
  fontFamily: "Inter", fontSize: 13, fontWeight: "600",
  fill: "$color/text/anti"
})

// 默认态（未选中）
defaultChip=I(filterGroup, {
  type: "frame",
  layout: "horizontal", alignItems: "center",
  padding: [6, 16], cornerRadius: 20,
  fill: "$color/bg/container",
  stroke: { fill: "$color/border/default", thickness: 1 }
})
I(defaultChip, {
  type: "text", content: "通用剧本",
  fontFamily: "Inter", fontSize: 13, fontWeight: "500",
  fill: "$color/text/secondary"
})
```

> 复制 `defaultChip` 追加更多筛选项，只修改 `content` 文字内容即可。

---

---

## DasSearchBarUnion 联合搜索栏

> 顶部 Tab 切换数据范围 + 下方 DasSearchBar 过滤，整体作为一个容器组件。

```
sbu=I("parent", {
  type: "frame",
  reusable: true,
  layout: "vertical", gap: 0,
  width: "fill_container", height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  stroke: {fill: "$color/stroke/default", thickness: 1}
})

// Tab 条（复用 DasTabs 样式）
tabRow=I(sbu, {
  type: "frame", name: "union-tabs",
  layout: "horizontal", gap: 0,
  width: "fill_container", height: 40,
  fill: "$color/bg/container",
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
// 激活 Tab
ubTabActive=I(tabRow, {
  type: "frame", layout: "horizontal", alignItems: "center", justifyContent: "center",
  padding: [0, 16], height: "fill_container", width: "fit_content",
  stroke: {fill: "$color/brand/normal", thickness: {bottom: 2}}
})
I(ubTabActive, {type: "text", content: "全部",
  fontSize: "$font/size/base", fontWeight: "500", fill: "$color/text/brand"})
// 默认 Tab
ubTab=I(tabRow, {
  type: "frame", layout: "horizontal", alignItems: "center", justifyContent: "center",
  padding: [0, 16], height: "fill_container", width: "fit_content"
})
I(ubTab, {type: "text", content: "已启用",
  fontSize: "$font/size/base", fill: "$color/text/secondary"})

// 搜索栏区域（ref 已有 DasSearchBar 组件）
I(sbu, {type: "ref", ref: "DasSearchBar的ID", width: "fill_container"})
```

> `ref` 值替换为当前文件中 `DasSearchBar` 可复用组件的实际 ID（用 `get_editor_state` 查看）。

---
