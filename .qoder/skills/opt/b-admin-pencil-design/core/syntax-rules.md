# Pencil batch_design 语法规则

> AI 必读：进入任何组件或页面设计前必须先阅读本文件。

---

## ⚠️ 高度约束强制规则（必读，违反会导致布局崩溃）

### 固定高度组件（必须写明确数值，禁止 fit_content）

| 组件 | 正确写法 | 禁止写法 |
|------|---------|---------|
| 按钮 | `padding: ["$spacing/3xs", "$spacing/lg"]`（上下6px撑高=32px） | ~~`height: "fit_content"`~~ ~~`height: "$density/btn-height"`~~ |
| 输入框 | `padding: ["$spacing/3xs", "$spacing/md"]`（上下6px撑高=32px） | ~~`height: "fit_content"`~~ ~~`height: "$density/input-height"`~~ |
| 表格表头行 | `height: "$density/table-row-height"` (=40) | ~~`height: "fit_content"`~~ |
| 表格数据行 | `height: "$density/table-row-height"` (=40) | ~~`height: "fit_content"`~~ |
| 表格单元格 | `height: "fill_container"` | ~~`height: "fit_content"`~~ |

> ⚠️ **Pencil 限制**：`width`/`height` 属性**不支持变量引用**，变量字符串会被静默忽略。
> 替代方案：用上下 `padding` 的 spacing 变量来控制视觉高度，颜色/圆角/字号/间距类变量均正常支持。

**根本原因**：`fit_content` 父容器 + `fill_container` 子节点 = 循环依赖，渲染结果为 0px。

### 可以使用 fit_content 的组件

- 卡片（DasMetricCard、DasForm）：高度由内容撑开
- 搜索栏（DasSearchBar）：高度由内容撑开
- 表单项（DasFormItem）：高度由内容撑开
- Tag 标签：高度由内容撑开（`padding` 控制视觉高度）

### 语法说明

本文件使用 `batch_design` 实际语法（非旧版 Figma 语法）：

| 概念 | 正确写法 | 旧版（已废弃）或常见错误 |
|------|---------|-------------|
| 变量引用 | `"$color/brand/normal"` | ~~`{variable: "color/brand/normal"}`~~ |
| 水平布局 | `layout: "horizontal"` | ~~`layoutMode: "HORIZONTAL"`~~ |
| 交叉轴对齐 | `alignItems: "center"` | ~~`counterAxisAlignItems: "center"`~~ |
| 主轴对齐 | `justifyContent: "end"` | ~~`primaryAxisAlignItems: "end"`~~ |
| 间距 | `gap: 8` | ~~`itemSpacing: 8`~~ |
| 内边距（等值） | `padding: 16` | ~~`padding: [16]`~~ |
| 内边距（水平/垂直） | `padding: [8, 16]` → [vertical, horizontal] | — |
| 内边距（四方向） | `padding: [8, 16, 8, 16]` → [top, right, bottom, left] | ~~`padding: [8, 16, 8]`~~ ❌ 不接受 3 值 |
| 阴影 | 展开写法（见下方说明） | ~~`effect: "$elevation/1"`~~ ❌ effect 不支持变量 |

**阴影展开写法（`effect` 不支持变量引用，必须展开为具体值）：**

| 层级 | 展开值 |
|------|--------|
| Level 1（卡片） | `effect:{type:"shadow",shadowType:"outer",offset:{x:0,y:2},blur:8,color:"#0000000A"}` |
| Level 2（浮层） | `effect:{type:"shadow",shadowType:"outer",offset:{x:0,y:4},blur:16,color:"#00000014"}` |
| Level 3（Modal） | `effect:{type:"shadow",shadowType:"outer",offset:{x:0,y:8},blur:24,color:"#0000001F"}` |

---

## ⚠️ 文字换行溢出强制规则（必读，违反导致文字溢出容器）

### 根本原因

`textGrowth:"fixed-width"` 的文字节点在**水平布局**父容器中，以其 `width` 值独立占据水平空间。文字换行后行数增加、高度向下撑开，但不会因兄弟节点约束而收缩宽度，导致文字内容**视觉溢出**容器边界。

> 💡 这是 Pencil 水平布局最容易忽略的陷阱之一，出现频率极高。

### 禁止写法（会溢出）

```javascript
// ❌ 描述文字作为水平布局的直接子节点
row=I("parent", {type:"frame", layout:"horizontal", gap:8, alignItems:"center"})
I(row, {type:"icon_font", iconFontName:"zap", width:14, height:14})
I(row, {type:"text", content:"函数名称", fontSize:12})
I(row, {type:"text", content:"较长的描述文字溢出容器",
  textGrowth:"fixed-width", width:150})   // ❌ 硬编码像素宽度 + 换行 = 溢出
I(row, {type:"icon_font", iconFontName:"x", width:12, height:12})
```

### 正确写法（垂直容器包裹）

```javascript
// ✅ 用 fill_container 的垂直容器包裹所有可能换行的文字
row=I("parent", {type:"frame", layout:"horizontal", gap:8, alignItems:"center"})
I(row, {type:"icon_font", iconFontName:"zap", width:14, height:14})
meta=I(row, {                             // ✅ 垂直包裹层，宽度 fill_container
  type:"frame", width:"fill_container", height:"fit_content",
  layout:"vertical", gap:2
})
I(meta, {type:"text", content:"函数名称", fontSize:12})
I(meta, {type:"text", content:"较长的描述文字自动换行且不溢出",
  textGrowth:"fixed-width", width:"fill_container"})  // ✅ 用 fill_container
I(row, {type:"icon_font", iconFontName:"x", width:12, height:12})
```

### 触发场景速查（遇到以下结构时主动检查）

| 场景 | 溢出信号 | 处置 |
|---|---|---|
| 列表项：图标 + 名称 + 描述 + 操作 | 水平行，描述 > 1 行 | 名称+描述套垂直容器 |
| 处理函数行：图标 + 函数名 + 说明 | 说明字数不定 | 说明套垂直容器 |
| 弹窗 / 提示条：图标 + 正文 | 正文段落可能换行 | 正文套垂直容器 |
| 通知 / 告警行：图标 + 标题 + 正文 | 正文超过一行 | 标题+正文套垂直容器 |
| 表格 cell：图标 + 说明 | cell 水平 + 文字可能截断 | 说明 `width:"fill_container"` + `textGrowth:"fixed-width"` |

### 核心记忆规则

> **水平布局中，凡是"可能换行"的文字节点，必须先套一个 `width:"fill_container"` 的垂直容器；文字的 `width` 统一用 `"fill_container"`，禁止硬编码像素值。**

---
