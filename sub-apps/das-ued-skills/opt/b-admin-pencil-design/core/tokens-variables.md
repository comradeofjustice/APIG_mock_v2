# Token → Pencil Variables 完整映射

## Variables 命名规则

使用斜杠路径分组：`category/subcategory/name`
- 例：`color/bg/page`、`spacing/md`、`radius/lg`

---

## 双模式格式说明

> **颜色变量（`color/*`）使用 `themes` 对象支持亮/暗双模式**。  
> `set_variables` 调用时自动注册 `Light` 和 `Dark` 两个主题轴，无需手动创建 Collection。
>
> - **新项目（含亮/暗切换）**：使用 `"themes": {"Light": "#hex", "Dark": "#hex"}` 格式
> - **旧项目（单模式，如 JiNan）**：继续使用 `"value": "#hex"` 格式，向下兼容，本文件不影响已有项目
>
> 非颜色 Token（spacing / radius / font / icon / density / elevation / layout）无需主题切换，保持 `"value"` 单值格式。

---

## 初始化 Variables（新文件时一次调用）

调用一次 `set_variables` 写入全部配置，`filePath` 替换为实际文件路径：

```json
{
  "filePath": "your-file.pen",
  "variables": {
    "color/bg/page":             { "type": "color", "themes": { "Light": "#F6F7FB", "Dark": "#0E1117" } },
    "color/bg/container":        { "type": "color", "themes": { "Light": "#FFFFFF",  "Dark": "#1A1D27" } },
    "color/bg/secondary":        { "type": "color", "themes": { "Light": "#F6F7FB", "Dark": "#1A1D27" } },
    "color/bg/component":        { "type": "color", "themes": { "Light": "#FFFFFF",  "Dark": "#242835" } },
    "color/bg/component2":       { "type": "color", "themes": { "Light": "#FFFFFF",  "Dark": "#2D3248" } },
    "color/bg/hover":            { "type": "color", "themes": { "Light": "#F6F7FB", "Dark": "#242835" } },
    "color/bg/active":           { "type": "color", "themes": { "Light": "#E9EAF0", "Dark": "#2D3248" } },
    "color/bg/disabled":         { "type": "color", "themes": { "Light": "#F1F2F5", "Dark": "#1E2130" } },
    "color/bg/overlay":          { "type": "color", "themes": { "Light": "rgba(0,0,0,0.45)", "Dark": "rgba(0,0,0,0.65)" } },
    "color/text/primary":        { "type": "color", "themes": { "Light": "#2D3348", "Dark": "#E8EAF0" } },
    "color/text/secondary":      { "type": "color", "themes": { "Light": "#1E243B", "Dark": "#8B93A8" } },
    "color/text/placeholder":    { "type": "color", "themes": { "Light": "#7E8494", "Dark": "#5A6278" } },
    "color/text/disabled":       { "type": "color", "themes": { "Light": "#ADB1BC", "Dark": "#404558" } },
    "color/text/anti":           { "type": "color", "themes": { "Light": "#FFFFFF",  "Dark": "#FFFFFF"  } },
    "color/text/brand":          { "type": "color", "themes": { "Light": "#134BEA", "Dark": "#5B8FF9" } },
    "color/text/link":           { "type": "color", "themes": { "Light": "#134BEA", "Dark": "#5B8FF9" } },
    "color/brand/normal":        { "type": "color", "themes": { "Light": "#134BEA", "Dark": "#5B8FF9" } },
    "color/brand/hover":         { "type": "color", "themes": { "Light": "#3B71EE", "Dark": "#7AABFF" } },
    "color/brand/active":        { "type": "color", "themes": { "Light": "#0639C3", "Dark": "#4070D8" } },
    "color/brand/disabled":      { "type": "color", "themes": { "Light": "#C0D9FF", "Dark": "#1E2F50" } },
    "color/brand/light":         { "type": "color", "themes": { "Light": "#E8F2FF", "Dark": "#1A2540" } },
    "color/status/error":        { "type": "color", "themes": { "Light": "#F53C3C", "Dark": "#F56060" } },
    "color/status/error-light":  { "type": "color", "themes": { "Light": "#FFE8E8", "Dark": "#2D1414" } },
    "color/status/warning":      { "type": "color", "themes": { "Light": "#FF7F29", "Dark": "#FF9A50" } },
    "color/status/warning-light":{ "type": "color", "themes": { "Light": "#FFF2BA", "Dark": "#2D2010" } },
    "color/status/success":      { "type": "color", "themes": { "Light": "#16A34A", "Dark": "#22C55E" } },
    "color/status/success-light":{ "type": "color", "themes": { "Light": "#DCFCE7", "Dark": "#0D2010" } },
    "color/border/default":      { "type": "color", "themes": { "Light": "#CBD0DB", "Dark": "#2D3348" } },
    "color/stroke/default":      { "type": "color", "themes": { "Light": "#E9EAF0", "Dark": "#242835" } },
    "spacing/5xs":  { "type": "number", "value": 2  },
    "spacing/4xs":  { "type": "number", "value": 4  },
    "spacing/3xs":  { "type": "number", "value": 6  },
    "spacing/2xs":  { "type": "number", "value": 8  },
    "spacing/xs":   { "type": "number", "value": 10 },
    "spacing/sm":   { "type": "number", "value": 12 },
    "spacing/md":   { "type": "number", "value": 16 },
    "spacing/lg":   { "type": "number", "value": 20 },
    "spacing/xl":   { "type": "number", "value": 24 },
    "spacing/2xl":  { "type": "number", "value": 32 },
    "spacing/3xl":  { "type": "number", "value": 40 },
    "spacing/4xl":  { "type": "number", "value": 48 },
    "spacing/5xl":  { "type": "number", "value": 64 },
    "spacing/6xl":  { "type": "number", "value": 80 },
    "radius/none":    { "type": "number", "value": 0    },
    "radius/3xs":     { "type": "number", "value": 4    },
    "radius/2xs":     { "type": "number", "value": 6    },
    "radius/xs":      { "type": "number", "value": 8    },
    "radius/sm":      { "type": "number", "value": 10   },
    "radius/md":      { "type": "number", "value": 12   },
    "radius/lg":      { "type": "number", "value": 16   },
    "radius/xl":      { "type": "number", "value": 20   },
    "radius/2xl":     { "type": "number", "value": 24   },
    "radius/full":    { "type": "number", "value": 9999 },
    "radius/btn-sm":  { "type": "number", "value": 10   },
    "radius/btn-md":  { "type": "number", "value": 12   },
    "radius/btn-lg":  { "type": "number", "value": 16   },
    "radius/btn-xl":  { "type": "number", "value": 20   },
    "font/family/zh":   { "type": "string", "value": "PingFangSC-Regular" },
    "font/family/zh-bold": { "type": "string", "value": "PingFangSC-Semibold" },
    "font/family/en":   { "type": "string", "value": "Inter" },
    "font/size/small": { "type": "number", "value": 12 },
    "font/size/base":  { "type": "number", "value": 14 },
    "font/size/large": { "type": "number", "value": 16 },
    "font/size/xl":    { "type": "number", "value": 18 },
    "icon/2xs": { "type": "number", "value": 12 },
    "icon/xs":  { "type": "number", "value": 16 },
    "icon/sm":  { "type": "number", "value": 20 },
    "icon/md":  { "type": "number", "value": 24 },
    "icon/lg":  { "type": "number", "value": 32 },
    "density/table-row-height":    { "type": "number", "value": 40 },
    "density/table-header-height": { "type": "number", "value": 36 },
    "density/btn-padding-v-sm":    { "type": "number", "value": 4  },
    "density/btn-padding-v-md":    { "type": "number", "value": 6  },
    "density/btn-padding-v-lg":    { "type": "number", "value": 8  },
    "density/btn-padding-h-sm":    { "type": "number", "value": 12 },
    "density/btn-padding-h-md":    { "type": "number", "value": 16 },
    "density/btn-padding-h-lg":    { "type": "number", "value": 20 },
    "density/input-padding-v":     { "type": "number", "value": 6  },
    "density/input-padding-h":     { "type": "number", "value": 12 },
    "density/card-padding":        { "type": "number", "value": 16 },
    "density/nav-item-height":     { "type": "number", "value": 40 },
    "density/form-gap":            { "type": "number", "value": 16 },
    "elevation/none":   { "type": "string", "value": "none" },
    "elevation/1":      { "type": "string", "value": "0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" },
    "elevation/2":      { "type": "string", "value": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)" },
    "elevation/3":      { "type": "string", "value": "0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)" },
    "elevation/focus":  { "type": "string", "value": "0 0 0 3px rgba(19,75,234,0.15)" },
    "elevation/focus-error": { "type": "string", "value": "0 0 0 3px rgba(208,48,80,0.15)" },
    "layout/header-height":    { "type": "number", "value": 64   },
    "layout/sidebar-width":    { "type": "number", "value": 240  },
    "layout/drawer-width":     { "type": "number", "value": 320  },
    "layout/page-padding":     { "type": "number", "value": 32   },
    "layout/section-gap":      { "type": "number", "value": 16   },
    "layout/component-gap":    { "type": "number", "value": 16   },
    "layout/content-padding":  { "type": "number", "value": 16   },
    "layout/grid-gutter-sm":   { "type": "number", "value": 8    },
    "layout/grid-gutter":      { "type": "number", "value": 16   },
    "layout/grid-gutter-lg":   { "type": "number", "value": 24   },
    "font/size/sm":            { "type": "number", "value": 12   },
    "font/size/lg":            { "type": "number", "value": 16   },
    "font/size/display":       { "type": "number", "value": 20   },
    "density/row-height":      { "type": "number", "value": 48   },
    "density/btn-height":      { "type": "number", "value": 32   },
    "density/btn-height-md":   { "type": "number", "value": 32   },
    "density/btn-height-lg":   { "type": "number", "value": 36   },
    "density/input-height":    { "type": "number", "value": 32   }
  }
}
```

---

## 单模式初始化（旧项目 / 向下兼容）

旧项目（无暗色模式需求，如 JiNan）仍可使用 `"value"` 单值格式：

```json
{
  "filePath": "your-file.pen",
  "variables": {
    "color/bg/page": { "type": "color", "value": "#F6F7FB" }
  }
}
```

---

## 字体使用规范

### Pencil 字体变量

| Variable | 值 | 适用场景 |
|----------|----|---------|
| `font/family/zh` | `PingFangSC-Regular` | 中文正文 |
| `font/family/zh-bold` | `PingFangSC-Semibold` | 中文加粗 / 标题 |
| `font/family/en` | `Inter` | 英文 / 数字（Pencil 中最接近系统字体的替代） |

> **Pencil 限制**：Pencil 不支持完整 CSS 字体回退栈，只能使用单一 `fontFamily` 字符串。设计稿中：
> - 中文内容 → `fontFamily: "$font/family/zh"` 或直接 `"PingFangSC-Regular"`
> - 英文 / 数字 → `fontFamily: "Inter"`（视觉上最接近系统默认）
> - 代码生成后，CSS 会自动替换为完整字体栈（见 `b-admin-design-system` 规范）

### 完整 CSS 字体栈（代码生成时使用）

```css
/* 生成代码时统一使用此变量，不要硬编码单个字体 */
font-family: var(--font-family-base);

/* --font-family-base 的完整定义 */
--font-family-base:
  PingFangSC-Regular, PingFangSC-Semibold,
  -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial,
  "Alibaba PuHuiTi 3.0", "Noto Sans",
  sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji",
  "Segoe UI Symbol", "Noto Color Emoji";
```

---

## Pencil Variable → CSS Variable 名称映射

> 同一设计概念在 Pencil 和 CSS 两层中使用不同命名规范，此表是唯一权威对照。
> **值可按层不同**（Pencil 存储设计绝对值，CSS 存储运行时计算值），但映射关系固定不变。
> 颜色列展示亮色模式值；暗色模式值由 CSS `prefers-color-scheme: dark` 或主题切换类控制。

| Pencil Variable | CSS Variable | Light 值 | Dark 值 | 说明 |
|---|---|---|---|---|
| `color/bg/page` | `--color-bg-page` | `#F6F7FB` | `#0E1117` | 页面背景 |
| `color/bg/container` | `--color-bg-container` | `#FFFFFF` | `#1A1D27` | 卡片/容器背景 |
| `color/bg/secondary` | `--color-bg-secondarycontainer` | `#F6F7FB` | `#1A1D27` | 次级背景 |
| `color/text/primary` | `--color-text-primarys` | `#2D3348` | `#E8EAF0` | ⚠️ CSS 变量名末尾有 's' |
| `color/text/secondary` | `--color-text-secondary` | `#1E243B` | `#8B93A8` | |
| `color/text/placeholder` | `--color-text-placeholder` | `#7E8494` | `#5A6278` | |
| `color/text/disabled` | `--color-text-disabled` | `#ADB1BC` | `#404558` | |
| `color/text/brand` | `--color-text-brand` | `#134BEA` | `#5B8FF9` | |
| `color/brand/normal` | `--color-brand-normal` | `#134BEA` | `#5B8FF9` | |
| `color/brand/hover` | `--color-brand-hover` | `#3B71EE` | `#7AABFF` | |
| `color/brand/light` | `--color-brand-light` | `#E8F2FF` | `#1A2540` | |
| `color/status/success` | `--color-success-normal` | `#16A34A` | `#22C55E` | |
| `color/status/warning` | `--color-warning-normal` | `#FF7F29` | `#FF9A50` | |
| `color/status/error` | `--color-error-normal` | `#F53C3C` | `#F56060` | |
| `color/text/link` | `--color-text-link` | `#134BEA` | `#5B8FF9` | 链接色 |
| `color/bg/overlay` | `--color-bg-overlay` | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.65)` | 遮罩层背景 |
| `color/border/default` | `--color-component-border` | `#CBD0DB` | `#2D3348` | |
| `color/stroke/default` | `--color-component-stroke` | `#E9EAF0` | `#242835` | |
| `radius/3xs` | `--radius-sm` | `4px` | `4px` | 小组件圆角（按钮/Tag/输入框） |
| `radius/xs` | `--radius-md` | `8px` | `8px` | 中等圆角（下拉/弹窗内容区） |
| `radius/lg` | `--radius-lg` | `16px` | `16px` | 卡片/面板圆角 |
| `radius/sm` | —（无对应） | `10px` | — | Pencil 专用，CSS 层无直接映射 |
| `radius/md` | —（无对应） | `12px` | — | Pencil 专用，CSS 层无直接映射 |
| `spacing/md` | `--spacing-md` | `16px` | 同 | 标准间距 |
| `font/size/base` | `--font-size-base` | `14px` | `12px`(默认基准) | ⚠️ 值不同：CSS 由 JS 动态设置 |
| `font/size/large` | `--font-size-large` | `16px` | `14px`(默认基准) | ⚠️ 值不同：CSS 由 JS 动态设置 |

> **圆角命名警告**：`radius/sm`（Pencil 10px）与 CSS `--radius-sm`（4px）虽然名字相近，但语义完全不同。
> 4px 圆角请使用 Pencil `radius/3xs`，不要用 `radius/sm`。

---

## 在 batch_design 中使用变量

在节点属性中用 `$` 前缀引用 Variable 名称：

```
fill: "$color/bg/container"
stroke: {fill: "$color/border/default", thickness: 1}
cornerRadius: "$radius/lg"
gap: "$spacing/md"
width: "$icon/sm"
fontFamily: "$font/family/zh"           // 中文文本
fontFamily: "$font/family/en"           // 英文 / 数字
// ⚠️ Pencil 不支持 width/height 变量引用，用 padding 变量控制组件尺寸：
padding: ["$density/btn-padding-v-md", "$density/btn-padding-h-md"]
```
