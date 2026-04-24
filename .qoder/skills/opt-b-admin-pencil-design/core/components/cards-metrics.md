# 卡片 / 指标卡片 / 信息卡片

---

## DasMetricCard 指标卡片

```
card=I("parent", {
  type: "frame",
  reusable: true,
  width: 240, height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  layout: "vertical", gap: 8,
  padding: "$density/card-padding"
})
I(card, {type: "text", name: "label", content: "指标名称",
  fontSize: "$font/size/sm", fill: "$color/text/secondary"})
I(card, {type: "text", name: "value", content: "128",
  fontSize: 32, fontWeight: "700", fill: "$color/brand/normal"})
I(card, {type: "text", name: "trend", content: "↑ 较上月 +12",
  fontSize: "$font/size/sm", fill: "$color/status/success"})
```

---

---

## Card 卡片

```
card=I("parent", {
  type: "frame",
  width: 360, height: "fit_content",
  fill: "$color/bg/container",
  stroke: {fill: "$color/stroke/default", thickness: 1},
  cornerRadius: "$radius/lg",
  layout: "vertical", gap: "$spacing/md",
  padding: "$density/card-padding"
})
I(card, {
  type: "text", content: "卡片标题",
  fontSize: "$font/size/lg", fontWeight: "600",
  fill: "$color/text/primary"
})
```

---

---

## DasInfoCard 信息卡片

> 带标题栏和"查看全部"链接的内容卡片，body 区域自由插入内容。

```
infoCard=I("parent", {
  type: "frame",
  reusable: true,
  layout: "vertical", gap: 0,
  width: "fill_container", height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  stroke: {fill: "$color/stroke/default", thickness: 1}
})

// 卡片标题行
cardHeader=I(infoCard, {
  type: "frame", name: "card-header",
  layout: "horizontal", alignItems: "center", justifyContent: "space-between",
  padding: [0, 20], width: "fill_container", height: "fit_content"
})
I(cardHeader, {type: "text", name: "title", content: "卡片标题",
  fontSize: "$font/size/base", fontWeight: "600", fill: "$color/text/primary"})
I(cardHeader, {type: "text", name: "extra", content: "查看全部",
  fontSize: "$font/size/sm", fill: "$color/text/brand"})

// 分隔线
I(infoCard, {type: "rectangle", name: "divider",
  width: "fill_container", height: 1, fill: "$color/stroke/default"})

// 内容区（自由插入）
cardBody=I(infoCard, {
  type: "frame", name: "card-body",
  layout: "vertical", gap: 8,
  padding: [16, 20], width: "fill_container", height: "fit_content"
})
I(cardBody, {type: "text", content: "内容插槽（自定义）",
  fontSize: "$font/size/base", fill: "$color/text/secondary"})
```

---
