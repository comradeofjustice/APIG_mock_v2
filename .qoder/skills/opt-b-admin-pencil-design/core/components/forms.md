# 表单 / 表单框架 / 表单分组

---

## DasForm 表单

```
form=I("parent", {
  type: "frame",
  reusable: true,
  width: "fill_container", height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  layout: "vertical", gap: 20, padding: 24
})
formRow=I(form, {
  type: "frame",
  layout: "horizontal", gap: 24,
  width: "fill_container", height: "fit_content"
})

// DasFormItem — 单个字段
item=I(formRow, {
  type: "frame", name: "DasFormItem",
  reusable: true,
  layout: "horizontal", alignItems: "center", gap: 8,
  width: "fill_container", height: "fit_content"
})
I(item, {type: "text", name: "label", content: "字段名称",
  fontSize: "$font/size/base", fill: "$color/text/primary",
  textGrowth: "fixed-width", width: 88})
inputBox=I(item, {
  type: "frame", name: "input",
  layout: "horizontal", alignItems: "center",
  width: "fill_container", height: "$density/input-height",
  fill: "$color/bg/component",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/sm",
  padding: [0, 12]
})
I(inputBox, {type: "text", name: "placeholder", content: "请输入",
  fontSize: "$font/size/base", fill: "$color/text/placeholder"})

// 表单底部按钮行
footer=I(form, {
  type: "frame", name: "form-footer",
  layout: "horizontal", gap: 8,
  width: "fill_container", height: "fit_content",
  justifyContent: "end"
})
// 插入 Default Button（取消）和 Primary Button（保存）
```

---

---

## Form 表单框架

```
form=I("parent", {
  type: "frame",
  width: 600,
  fill: "$color/bg/container",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/lg",
  layout: "vertical", gap: "$spacing/2xl",
  padding: ["$spacing/2xl"]
})
formGroup=I(form, {
  type: "frame",
  width: "fill_container",
  layout: "vertical", gap: "$spacing/lg"
})
formGroupTitle=I(formGroup, {
  type: "text", content: "基本信息",
  fontSize: "$font/size/base", fontWeight: "600",
  fill: "$color/text/primary"
})
formItem=I(formGroup, {
  type: "frame",
  width: "fill_container",
  layout: "vertical", gap: "$spacing/3xs"
})
formLabel=I(formItem, {
  type: "text", content: "字段名称",
  fontSize: "$font/size/small", fontWeight: "400",
  fill: "$color/text/secondary"
})
formInput=I(formItem, {
  type: "frame",
  width: "fill_container", height: "$density/input-height",
  fill: "$color/bg/component",
  stroke: {fill: "$color/border/default", thickness: 1},
  cornerRadius: "$radius/sm",
  layout: "horizontal", alignItems: "center",
  padding: [0, "$spacing/sm"]
})
formFooter=I(form, {
  type: "frame",
  width: "fill_container", height: 52,
  layout: "horizontal", justifyContent: "end", alignItems: "center",
  gap: "$spacing/sm",
  stroke: {fill: "$color/stroke/default", thickness: {top: 1}}
})
```

---

## DasFormGroup 表单分组

> 带品牌色竖线的表单区块，用于区分多个字段分组（基本信息 / 详细配置等）。

```
fg=I("parent", {
  type: "frame",
  reusable: true,
  layout: "vertical", gap: 0,
  width: "fill_container", height: "fit_content",
  fill: "$color/bg/container",
  cornerRadius: "$radius/lg",
  stroke: {fill: "$color/stroke/default", thickness: 1}
})

// 分组标题行（左侧品牌色竖线 + 标题文字）
fgHeader=I(fg, {
  type: "frame", name: "group-header",
  layout: "horizontal", alignItems: "center", gap: 8,
  padding: [0, 20], width: "fill_container", height: 44,
  stroke: {fill: "$color/stroke/default", thickness: {bottom: 1}}
})
I(fgHeader, {
  type: "rectangle", name: "accent",
  width: 3, height: 16,
  fill: "$color/brand/normal", cornerRadius: "$radius/full"
})
I(fgHeader, {type: "text", name: "title", content: "分组标题",
  fontSize: "$font/size/base", fontWeight: "600", fill: "$color/text/primary"})

// 表单项区域（内放 DasFormItem）
fgBody=I(fg, {
  type: "frame", name: "group-body",
  layout: "vertical", gap: "$density/form-gap",
  padding: 20, width: "fill_container", height: "fit_content"
})
// 在 fgBody 内插入 DasFormItem 实例
```

---
