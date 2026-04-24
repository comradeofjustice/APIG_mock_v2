# 定制主题工作流（Pencil 版）

与通用版 derivation-guide.md 方法论相同，本文是 Pencil 操作的具体实现版本。

---

## 颜色来源优先级（执行前必读）

```
1. 用户/客户明确提供的品牌色 hex  → 直接使用，最高优先级
2. 主线产品未指定               → 使用 #134BEA
3. 定制项目且未提供品牌色        → 询问用户；若用户同意探索，可用
                                  get_style_guide() 推导候选色，
                                  但必须经用户确认后才能写入 Variables
```

Style Guide 的颜色建议**只作为参考候选**，最终写入 `color/brand/*` 的值必须来自用户确认。

---

## 操作流程

### Step 1：收集客户输入

同通用版 Step 1（见 b-admin-design-system/theming/derivation-guide.md）。
至少需要：主品牌色 hex、是否需要暗色模式、行业类别。

若客户未提供品牌色，**先询问**，不要直接用 Style Guide 的颜色推进。

---

### Step 2：确定 8 个维度

填写以下配置表：

```
color-mode:    light / dark / both
brand-color:   #______
bg-tone:       cool / warm / tinted
spacing-scale: compact / standard / relaxed
info-density:  high / medium / low
font-base:     12 / 13 / 14（px）
radius-style:  sharp / standard / rounded
layout-type:   sidebar-fixed / sidebar-collapsible / top-nav
```

---

### Step 3：推导品牌色系列

已知主色，计算其他状态色：

| Variable | 推导方式 | 示例（主色 #0052CC）|
|----------|---------|------------------|
| `color/brand/normal` | 直接使用 | #0052CC |
| `color/brand/hover` | 亮化 10% | #1A6BDC |
| `color/brand/active` | 暗化 10% | #003DAA |
| `color/brand/disabled` | 降饱和 + 提亮 | #CCE0FF |
| `color/brand/light` | 极浅色背景 | #EBF3FF |
| `color/text/brand` | 同 normal | #0052CC |

---

### Step 4：生成 Variables 配置并写入

调用 `set_variables`，传入完整的自定义颜色变量：

```json
{
  "color/brand/normal":   "______",
  "color/brand/hover":    "______",
  "color/brand/active":   "______",
  "color/brand/disabled": "______",
  "color/brand/light":    "______",
  "color/text/brand":     "______"
}
```

**bg-tone 调整（按选择）：**
- warm：`"color/bg/page": "#F7F5F2", "color/bg/secondary": "#F0EDE9"`
- tinted：`"color/bg/page": "#EEF5FF"`（品牌色极浅版）

**radius-style 调整（按选择）：**
- sharp：`"radius/lg": 4, "radius/md": 4, "radius/sm": 2, "radius/btn-md": 4, "radius/btn-lg": 4`
- rounded：`"radius/lg": 20, "radius/md": 16, "radius/btn-md": 16, "radius/btn-lg": 20`

**font-base 调整：**
- 13px：`"font/size/small": 11, "font/size/base": 13, "font/size/large": 15, "font/size/xl": 17`
- 12px：`"font/size/small": 10, "font/size/base": 12, "font/size/large": 14, "font/size/xl": 16`

**density 调整：** 参见 density-variables.md

---

### Step 5：若需要暗色模式

在 Step 4 的基础上，额外创建 dark 主题：
1. 参照 light-dark-variables.md 的暗色对照表
2. 将品牌色相关的暗色值（brand/light、brand/disabled）替换为客户品牌色对应的暗色版本
3. 调用 `set_variables` 写入 dark 主题

---

### Step 6：验证

```
调用: get_screenshot()
检查:
- [ ] 品牌色按钮文字（白色）对比度足够
- [ ] 背景色整体调性符合预期
- [ ] 圆角风格在卡片/按钮/输入框上一致
- [ ] 若有暗色模式：切换主题后文字清晰可读
```
