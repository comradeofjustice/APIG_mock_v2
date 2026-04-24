# 亮/暗双模式 Variables 配置

## 在 Pencil 中实现双模式的方式

Pencil 通过**主题（Themes）**切换 Variables 的值集合。
需要创建两套主题：`light`（默认）和 `dark`，切换时所有引用 Variable 的节点自动更新。

---

## 操作步骤

### 1. 确认当前 Variables

```
调用: get_variables()
确认颜色变量是否已存在，若无则先按 core/tokens-variables.md 初始化
```

### 2. 创建 dark 主题覆写

调用 `set_variables`，传入 dark 主题下的颜色覆写值：

```json
{
  "theme": "dark",
  "variables": {
    "color/bg/page":             "#0F152A",
    "color/bg/container":        "#1E243B",
    "color/bg/secondary":        "#2D3348",
    "color/bg/component":        "#50586E",
    "color/bg/component2":       "#2D3348",
    "color/bg/hover":            "#2D3348",
    "color/bg/active":           "#1E243B",
    "color/bg/disabled":         "#1E243B",
    "color/text/primary":        "#F6F7FB",
    "color/text/secondary":      "#F1F2F5",
    "color/text/placeholder":    "#ADB1BC",
    "color/text/disabled":       "#50586E",
    "color/text/anti":           "#0F152A",
    "color/brand/light":         "#2E4681",
    "color/brand/disabled":      "#2038B0",
    "color/status/error-light":  "#7A2D2D",
    "color/status/warning-light":"#694D1C",
    "color/status/success-light":"#134D2A",
    "color/border/default":      "#50586E",
    "color/stroke/default":      "#2D3348"
  }
}
```

> 品牌色（color/brand/normal、hover、active）在暗色模式下保持原值不变。

---

## 双模式对照速查

| Variable | light | dark |
|----------|-------|------|
| `color/bg/page` | #F6F7FB | #0F152A |
| `color/bg/container` | #FFFFFF | #1E243B |
| `color/bg/secondary` | #F6F7FB | #2D3348 |
| `color/bg/component` | #FFFFFF | #50586E |
| `color/text/primary` | #2D3348 | #F6F7FB |
| `color/text/secondary` | #1E243B | #F1F2F5 |
| `color/text/placeholder` | #7E8494 | #ADB1BC |
| `color/text/disabled` | #ADB1BC | #50586E |
| `color/brand/light` | #E8F2FF | #2E4681 |
| `color/border/default` | #CBD0DB | #50586E |
| `color/stroke/default` | #E9EAF0 | #2D3348 |
| `color/status/error-light` | #FFE8E8 | #7A2D2D |
| `color/status/warning-light` | #FFF2BA | #694D1C |
| `color/status/success-light` | #DCFCE7 | #134D2A |

---

## 验证

切换主题后调用 `get_screenshot()` 检查：
- 文字是否在背景上清晰可读
- 品牌色元素是否依然突出
- 分割线和边框是否可见但不刺眼
