# 整页模式 - 卡片网格页

> 其他模式: page-list-table.md | page-form.md（待补充）

---

## 整页设计模式（整屏页面组合模板）

> 以下模板来自实战沉淀，适合卡片列表页、表格列表页等后台管理页面。按 **Batch 顺序** 使用，每批控制在 25 ops 内。

---

### 1. 页面 Shell（三列布局：Sidebar + Main）

> **Batch 1 核心操作**，建完后从 response 记录 `content` / `topbar` 的实际 ID。

```
// 1. 画板初始化
U("ARTBOARD_ID", {placeholder:true, layout:"horizontal", fill:"$color/bg/page"})

// 2. 双列主结构
sidebar=I("ARTBOARD_ID", {
  type:"frame", width:240, height:"fill_container",
  layout:"vertical", fill:"$color/bg/container",
  stroke:{fill:"$color/stroke/default", thickness:{right:1}}
})
main=I("ARTBOARD_ID", {
  type:"frame", width:1200, height:"fill_container", layout:"vertical"
})

// 3. Main 内：顶栏 + 内容区
topbar=I(main, {
  type:"frame", width:"fill_container", height:64,
  layout:"horizontal", justifyContent:"space_between", alignItems:"center",
  padding:[0,24],
  fill:"$color/bg/container",
  stroke:{fill:"$color/stroke/default", thickness:{bottom:1}}
})
content=I(main, {
  type:"frame", width:"fill_container", height:"fill_container",
  layout:"vertical", gap:16, padding:24,
  fill:"$color/bg/page", clip:true
})

// 4. Sidebar：Logo 区
logoArea=I(sidebar, {
  type:"frame", width:"fill_container", height:64,
  layout:"horizontal", alignItems:"center", gap:10, padding:[0,20],
  stroke:{fill:"$color/stroke/default", thickness:{bottom:1}}
})
I(logoArea, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"shield",
  width:20, height:20, fill:"$color/brand/normal"})
I(logoArea, {type:"text", content:"安全运营平台",
  fill:"$color/text/primary", fontSize:"$font/size/base", fontWeight:"600"})

// 5. Sidebar：导航区（每个 navItem = 3 ops，最多放 7 个留在 25 ops 内）
navArea=I(sidebar, {
  type:"frame", width:"fill_container", height:"fill_container",
  layout:"vertical", gap:2, padding:[12,8]
})

// 普通导航项（复用此片段，修改 icon/content）
nav=I(navArea, {
  type:"frame", width:"fill_container",
  layout:"horizontal", alignItems:"center", gap:10, padding:[10,12],
  cornerRadius:"$radius/sm"
})
I(nav, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"ICON_NAME",
  width:16, height:16, fill:"$color/text/secondary"})
I(nav, {type:"text", content:"导航项名称",
  fill:"$color/text/secondary", fontSize:"$font/size/base"})

// 激活导航项（active 态：品牌色背景）
navActive=I(navArea, {
  type:"frame", width:"fill_container",
  layout:"horizontal", alignItems:"center", gap:10, padding:[10,12],
  cornerRadius:"$radius/sm", fill:"$color/brand/light"   // ← 关键
})
I(navActive, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"ICON_NAME",
  width:16, height:16, fill:"$color/brand/normal"})       // ← 品牌色
I(navActive, {type:"text", content:"当前模块",
  fill:"$color/brand/normal", fontSize:"$font/size/base", fontWeight:"600"})

// 6. TopBar：面包屑（左侧）
bcGroup=I(topbar, {type:"frame", layout:"horizontal", alignItems:"center", gap:6})
I(bcGroup, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"house",  // ⚠️ 注意是 house 不是 home
  width:14, height:14, fill:"$color/text/secondary"})
I(bcGroup, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"chevron-right",
  width:14, height:14, fill:"$color/text/placeholder"})
I(bcGroup, {type:"text", content:"当前页面",
  fill:"$color/text/primary", fontSize:"$font/size/base", fontWeight:"600"})
```

---

### 2. TopBar 右侧（用户区）

> **Batch 2 开头**，使用 Batch 1 记录的 `topbar` 实际 ID。

```
userArea=I("TOPBAR_ID", {type:"frame", layout:"horizontal", alignItems:"center", gap:12})
I(userArea, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"bell",
  width:18, height:18, fill:"$color/text/secondary"})
avatarCircle=I(userArea, {
  type:"frame", width:28, height:28, cornerRadius:14,
  fill:"$color/brand/normal",
  layout:"horizontal", justifyContent:"center", alignItems:"center"
})
I(avatarCircle, {type:"text", content:"管",
  fill:"$color/text/anti", fontSize:"$font/size/sm", fontWeight:"700"})
I(userArea, {type:"text", content:"管理员",
  fill:"$color/text/secondary", fontSize:"$font/size/base"})
```

---

### 3. 页面 Header（标题 + 操作按钮）

> 使用 `CONTENT_ID`（Batch 1 记录）。

```
pageHeader=I("CONTENT_ID", {
  type:"frame", width:"fill_container",
  layout:"horizontal", justifyContent:"space_between", alignItems:"center"
})

// 左：标题 + 副标题
headerLeft=I(pageHeader, {type:"frame", layout:"vertical", gap:4})
I(headerLeft, {type:"text", content:"页面标题",
  fill:"$color/text/primary", fontSize:"$font/size/xl", fontWeight:"700"})
I(headerLeft, {type:"text", content:"页面描述文字",
  fill:"$color/text/secondary", fontSize:"$font/size/sm"})

// 右：操作按钮区
headerRight=I(pageHeader, {type:"frame", layout:"horizontal", gap:8, alignItems:"center"})
```

---

### 4. 分割主按钮（Split Primary Button）

> 在 `headerRight` 中追加。主区 + 1px 竖向分割线 + 下拉箭头区。

```
splitBtn=I(headerRight, {
  type:"frame", layout:"horizontal", alignItems:"center",
  cornerRadius:"$radius/btn", fill:"$color/brand/normal"
  // ⚠️ 不加 overflow:"hidden"，圆角通过父容器裁剪
})

// 主区
splitMain=I(splitBtn, {
  type:"frame", layout:"horizontal", alignItems:"center", gap:6,
  padding:["$density/btn-padding-v-md", "$density/btn-padding-h-md"]
})
I(splitMain, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"plus",
  width:16, height:16, fill:"$color/text/anti"})
I(splitMain, {type:"text", content:"新建", fill:"$color/text/anti",
  fontSize:"$font/size/base", fontWeight:"500"})

// 分割线（1px 竖向）
I(splitBtn, {type:"frame", width:1, height:"fill_container", fill:"$color/brand/hover"})

// 下拉箭头区
dropArea=I(splitBtn, {
  type:"frame", layout:"horizontal", alignItems:"center", justifyContent:"center",
  padding:["$density/btn-padding-v-md", 10]
})
I(dropArea, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"chevron-down",
  width:14, height:14, fill:"$color/text/anti"})
```

---

### 5. 标签页（Tab Bar）

> 支持 "全部 / 分类 A / 分类 B / 分类 C" 四档。活跃 tab 用 `stroke: bottom-2px` 高亮。

```
tabBar=I("CONTENT_ID", {
  type:"frame", width:"fill_container",
  layout:"horizontal",
  fill:"$color/bg/container", cornerRadius:"$radius/md",
  stroke:{fill:"$color/stroke/default", thickness:1}
})

// 激活 Tab
tabActive=I(tabBar, {
  type:"frame", layout:"horizontal", alignItems:"center", padding:[10,16],
  stroke:{fill:"$color/brand/normal", thickness:{bottom:2}}  // ← 底部 2px 高亮线
})
I(tabActive, {type:"text", content:"全部（12）",
  fill:"$color/brand/normal", fontSize:"$font/size/base", fontWeight:"600"})

// 普通 Tab（复制此片段，修改 content）
tab=I(tabBar, {type:"frame", layout:"horizontal", alignItems:"center", padding:[10,16]})
I(tab, {type:"text", content:"分类名（数量）",
  fill:"$color/text/secondary", fontSize:"$font/size/base"})
```

---

### 6. 搜索工具栏（inline 行内筛选）

```
searchTool=I("CONTENT_ID", {
  type:"frame", width:"fill_container",
  layout:"horizontal", gap:8, alignItems:"center"
})

// 搜索框
searchBox=I(searchTool, {
  type:"frame", width:280,
  layout:"horizontal", alignItems:"center", gap:8,
  padding:["$density/input-padding-v", "$density/input-padding-h"],
  fill:"$color/bg/component",
  stroke:{fill:"$color/border/default", thickness:1},
  cornerRadius:"$radius/xs"
})
I(searchBox, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"search",
  width:16, height:16, fill:"$color/text/placeholder"})
I(searchBox, {type:"text", content:"搜索...",
  fill:"$color/text/placeholder", fontSize:"$font/size/base"})

// 筛选下拉（复制此片段追加不同筛选项）
filterBox=I(searchTool, {
  type:"frame", width:120,
  layout:"horizontal", alignItems:"center", justifyContent:"space_between",
  padding:["$density/input-padding-v", "$density/input-padding-h"],
  fill:"$color/bg/component",
  stroke:{fill:"$color/border/default", thickness:1},
  cornerRadius:"$radius/xs"
})
I(filterBox, {type:"text", content:"全部状态",
  fill:"$color/text/secondary", fontSize:"$font/size/base"})
I(filterBox, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"chevron-down",
  width:14, height:14, fill:"$color/text/placeholder"})
```

---

### 7. 卡片网格（3 列）

```
// 先创建网格骨架（2 ops），记录 row1/row2 ID
cardGrid=I("CONTENT_ID", {
  type:"frame", width:"fill_container", height:"fill_container",
  layout:"vertical", gap:16, clip:true
})
row1=I(cardGrid, {type:"frame", width:"fill_container", layout:"horizontal", gap:16})
row2=I(cardGrid, {type:"frame", width:"fill_container", layout:"horizontal", gap:16})

// 在 row1 中创建 3 个卡片容器（只建框，不填内容）
c1=I(row1, {
  type:"frame", width:"fill_container", layout:"vertical",
  fill:"$color/bg/container", cornerRadius:"$radius/lg",
  stroke:{fill:"$color/stroke/default", thickness:1},
  effect:{type:"shadow", shadowType:"outer", offset:{x:0,y:2}, blur:8, color:"#0000000A"}
  // ⚠️ effect 不支持变量引用，需展开为具体值
})
c2=I(row1, { /* 同 c1 结构 */ })
c3=I(row1, { /* 同 c1 结构 */ })
// 记录 c1/c2/c3 实际 ID，下一批填充内容
```

---

### 8. 卡片内容（信息卡片标准结构）

> 每张卡片约 20~22 ops，建议 **1 批 1 张**。使用上一批记录的卡片容器 ID。

```
// ── 上部内容区（padding:16, vertical, gap:12）
cardTop=I("CARD_ID", {
  type:"frame", width:"fill_container", layout:"vertical", gap:12, padding:16
})

// 头部：头像 + 标题组 + 更多按钮
cardHead=I(cardTop, {
  type:"frame", width:"fill_container", layout:"horizontal", gap:12, alignItems:"center"
})

// 头像（40×40 圆角，背景用 status/brand light 区分类型）
avatar=I(cardHead, {
  type:"frame", width:40, height:40, cornerRadius:10,
  fill:"$color/brand/light",          // 通用: brand/light | 调查: status/warning-light | 处置: status/error-light
  layout:"horizontal", justifyContent:"center", alignItems:"center"
})
I(avatar, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"ICON_NAME",
  width:20, height:20, fill:"$color/brand/normal"})  // 对应 light 背景的 normal 色

// 标题组（占满剩余宽度）
titleArea=I(cardHead, {
  type:"frame", width:"fill_container", layout:"vertical", gap:6
})
I(titleArea, {type:"text", content:"卡片标题",
  fill:"$color/text/primary", fontSize:"$font/size/base", fontWeight:"600"})
// 类型标签（使用 ref 复用 DasTagInfo/DasTagWarning/DasTagDanger）
// ⚠️ 使用前必须 batch_get(["TAG_NODE_ID"]) 确认子节点 ID
I(titleArea, {type:"ref", ref:"TAG_NODE_ID", descendants:{"CHILD_ID":{content:"类型名"}}})

// 更多按钮（右上角）
I(cardHead, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"ellipsis",
  width:16, height:16, fill:"$color/text/placeholder"})

// 描述文本（自动换行，fill_container + fixed-width）
I(cardTop, {
  type:"text",
  content:"卡片描述文字，支持多行自动换行，字数不限。",
  fill:"$color/text/secondary", fontSize:"$font/size/sm",
  textGrowth:"fixed-width", width:"fill_container"  // ← 关键：必须同时设置这两个
})

// ── 标签行（padding 注意必须 4 值）
tagRow=I("CARD_ID", {
  type:"frame", width:"fill_container",
  layout:"horizontal", gap:6,
  padding:[0,16,12,16]   // ⚠️ 必须 4 值：[top, right, bottom, left]
})
// 标签 chip（复制追加）
chip=I(tagRow, {
  type:"frame", layout:"horizontal", alignItems:"center",
  padding:[2,8,2,8],  // 同上，4 值
  cornerRadius:"$radius/3xs", fill:"$color/bg/secondary"
})
I(chip, {type:"text", content:"标签文字",
  fill:"$color/text/secondary", fontSize:"$font/size/sm"})

// ── 底部操作区（stroke 分隔线 + space-between）
cardFooter=I("CARD_ID", {
  type:"frame", width:"fill_container",
  layout:"horizontal", justifyContent:"space_between", alignItems:"center",
  padding:[10,16,10,16],  // ⚠️ 4 值
  stroke:{fill:"$color/stroke/default", thickness:{top:1}}
})
// 左：状态标签（使用 ref 复用 DasTagSuccess/DasTagDefault 等）
I(cardFooter, {type:"ref", ref:"efEYC", descendants:{"n5aUc":{content:"已发布"}}})

// 右：操作图标组（edit/copy/delete/toggle）
actions=I(cardFooter, {type:"frame", layout:"horizontal", gap:12, alignItems:"center"})
I(actions, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"pencil",
  width:16, height:16, fill:"$color/text/secondary"})
I(actions, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"copy",
  width:16, height:16, fill:"$color/text/secondary"})
I(actions, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"trash-2",
  width:16, height:16, fill:"$color/status/error"})
I(actions, {type:"icon_font", iconFontFamily:"lucide", iconFontName:"power-off",
  width:16, height:16, fill:"$color/text/secondary"})

// 未发布状态：替换 power-off 为发布按钮 chip
pubChip=I(actions, {
  type:"frame", layout:"horizontal", alignItems:"center", gap:4,
  padding:[2,8,2,8], cornerRadius:"$radius/3xs", fill:"$color/brand/light"
})
I(pubChip, {type:"text", content:"发布",
  fill:"$color/brand/normal", fontSize:"$font/size/sm"})
```

---

### 9. 使用 Ref 组件前的必要确认

> Tag 组件（DasTagInfo / DasTagSuccess / DasTagWarning / DasTagDanger / DasTagDefault）的子节点 ID 会随文件修改而变化，使用前**必须确认**：

```
// 在使用 ref + descendants 之前，先查询当前子节点 ID
batch_get(["ZR9n0", "efEYC", "hzSMm", "9UR0r", "PZ2Fq"], readDepth:2)

// 当前已知 ID（[组件库] das-component-vue.pen 文件中，如有变动以 batch_get 结果为准）：
// DasTagInfo     (ZR9n0) → label: c7463  → fill: $color/brand/light,  text: $color/text/brand
// DasTagSuccess  (efEYC) → label: n5aUc  → fill: $color/status/success-light
// DasTagWarning  (hzSMm) → label: lpZBc  → fill: $color/status/warning-light
// DasTagDanger   (9UR0r) → label: PVobc  → fill: $color/status/error-light
// DasTagDefault  (PZ2Fq) → label: ERBAj  → fill: $color/bg/secondary
```

