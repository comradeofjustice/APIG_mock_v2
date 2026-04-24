---
name: chart-tokens
description: 将设计系统 Design Token 桥接到 ECharts 图表主题，实现图表颜色、文字、轴线、Tooltip 与设计系统统一，并自动响应亮/暗色模式切换。当用户说"图表主题"、"ECharts 样式"、"图表 Token"、"图表暗色模式"、"用设计系统配置图表颜色"、"统一图表风格"、"ECharts 主题配置"、"图表色板"时使用此技能。
layer: 2
---

# ECharts 图表 Token 桥接

## 核心机制

ECharts 不能直接读 CSS 变量，但支持 `echarts.registerTheme(name, themeObj)` 注册命名主题。桥接路径：

```
CSS Variables (theme.css / --color-* --brand-* 等)
      ↓  getComputedStyle(document.documentElement).getPropertyValue()  运行时解析
ECharts Theme Object (JSON)
      ↓  echarts.registerTheme('design-system', themeObj)
echarts.init(el, 'design-system')   ← 每个图表实例使用命名主题
```

当亮/暗色切换时，CSS 变量值随 `.theme-dark` class 变化，只需重新调用 `registerTheme` 并 `chart.dispose()` + `init` 重建即可热更新。

---

## Step 1：创建 useEChartsTheme Composable

在项目的 `src/libs/hooks/useEChartsTheme.ts` 中创建（若文件已存在则直接使用）：

```typescript
import * as echarts from 'echarts'

/** 从 CSS 变量读取颜色值（运行时解析，支持亮/暗双模式） */
function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

/**
 * 构建 ECharts 主题对象
 * 所有颜色均来自设计系统 CSS 变量，自动响应主题切换
 */
export function buildEChartsTheme() {
  return {
    // ─── 系列色板（通用） ───────────────────────────────────────
    // 顺序：品牌蓝 → 成功绿 → 警示橙 → 危险红 → 品牌蓝浅 → 中危橙 → 失陷酒红
    // → 天蓝 → 青 → 靛紫 → 灰
    color: [
      getCssVar('--brand-60'),      // #134BEA 品牌蓝
      getCssVar('--success-60'),    // #16A34A 成功绿
      getCssVar('--warningm-60'),   // #F5731C 中危橙
      getCssVar('--error-60'),      // #F53C3C 危险红
      getCssVar('--brand-40'),      // #6E9EFD 品牌蓝浅
      getCssVar('--warning-60'),    // #F3A700 低危黄
      getCssVar('--fall-60'),       // #A74748 失陷酒红
      getCssVar('--skyblue-50'),    // #32A5F2 天蓝
      getCssVar('--cyan-60'),       // #0A979C 青
      getCssVar('--indigo-60'),     // #4F46E5 靛紫
      getCssVar('--gray-50'),       // #ADB1BC 灰
    ],

    // ─── 画布背景 ────────────────────────────────────────────────
    backgroundColor: 'transparent',

    // ─── 全局文字（标题、说明等） ───────────────────────────────
    textStyle: {
      color: getCssVar('--color-text-secondary'),
      fontFamily: 'inherit',
    },

    // ─── 标题 ───────────────────────────────────────────────────
    title: {
      textStyle: {
        color: getCssVar('--color-text-primarys'),
        fontSize: 14,
        fontWeight: 600,
      },
      subtextStyle: {
        color: getCssVar('--color-text-placeholder'),
      },
    },

    // ─── 图例 ───────────────────────────────────────────────────
    legend: {
      textStyle: {
        color: getCssVar('--color-text-secondary'),
      },
      pageTextStyle: {
        color: getCssVar('--color-text-placeholder'),
      },
    },

    // ─── Tooltip ────────────────────────────────────────────────
    tooltip: {
      backgroundColor: getCssVar('--color-bg-component2'),
      borderColor: getCssVar('--color-component-border'),
      borderWidth: 1,
      textStyle: {
        color: getCssVar('--color-text-primarys'),
        fontSize: 12,
      },
      extraCssText: `box-shadow: 0 4px 12px rgba(0,0,0,0.12);`,
    },

    // ─── 直角坐标系网格 ─────────────────────────────────────────
    grid: {
      borderColor: getCssVar('--color-component-stroke'),
    },

    // ─── 类目轴 / 数值轴（xAxis / yAxis 共用） ──────────────────
    categoryAxis: {
      axisLine: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
        },
      },
      axisTick: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
        },
      },
      axisLabel: {
        color: getCssVar('--color-text-placeholder'),
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
          type: 'dashed',
        },
      },
      splitArea: {
        areaStyle: {
          color: [
            'transparent',
            getCssVar('--color-bg-secondarycontainer'),
          ],
        },
      },
    },

    valueAxis: {
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: getCssVar('--color-text-placeholder'),
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
          type: 'dashed',
        },
      },
      splitArea: {
        areaStyle: {
          color: [
            'transparent',
            getCssVar('--color-bg-secondarycontainer'),
          ],
        },
      },
    },

    logAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: getCssVar('--color-text-placeholder'),
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
          type: 'dashed',
        },
      },
    },

    timeAxis: {
      axisLine: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
        },
      },
      axisTick: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
        },
      },
      axisLabel: {
        color: getCssVar('--color-text-placeholder'),
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
          type: 'dashed',
        },
      },
    },

    // ─── 工具栏 ─────────────────────────────────────────────────
    toolbox: {
      iconStyle: {
        borderColor: getCssVar('--color-text-placeholder'),
      },
      emphasis: {
        iconStyle: {
          borderColor: getCssVar('--color-brand-normal'),
        },
      },
    },

    // ─── 时间轴（timeline） ──────────────────────────────────────
    timeline: {
      lineStyle: {
        color: getCssVar('--color-component-stroke'),
      },
      itemStyle: {
        color: getCssVar('--color-brand-normal'),
      },
      label: {
        color: getCssVar('--color-text-placeholder'),
      },
      controlStyle: {
        color: getCssVar('--color-text-placeholder'),
        borderColor: getCssVar('--color-component-border'),
      },
    },

    // ─── 视觉映射（visualMap） ───────────────────────────────────
    visualMap: {
      textStyle: {
        color: getCssVar('--color-text-placeholder'),
      },
    },

    // ─── 数据区域缩放（dataZoom） ────────────────────────────────
    dataZoom: {
      backgroundColor: getCssVar('--color-bg-secondarycontainer'),
      dataBackground: {
        lineStyle: {
          color: getCssVar('--color-component-stroke'),
        },
        areaStyle: {
          color: getCssVar('--color-bg-secondarycontainer'),
        },
      },
      borderColor: getCssVar('--color-component-border'),
      handleStyle: {
        color: getCssVar('--color-brand-normal'),
        borderColor: getCssVar('--color-brand-normal'),
      },
      textStyle: {
        color: getCssVar('--color-text-placeholder'),
      },
      fillerColor: getCssVar('--color-brand-light'),
    },

    // ─── 标记线/点 ───────────────────────────────────────────────
    markPoint: {
      label: {
        color: getCssVar('--color-text-anti'),
      },
      emphasis: {
        label: {
          color: getCssVar('--color-text-anti'),
        },
      },
    },
  }
}

/** 注册设计系统 ECharts 主题（每次主题模式切换后重新调用） */
export function registerDesignSystemTheme() {
  echarts.registerTheme('design-system', buildEChartsTheme())
}

/**
 * useEChartsTheme composable
 *
 * 用法：
 * ```ts
 * const { registerTheme, initChart } = useEChartsTheme(chartEl)
 * onMounted(() => { registerTheme(); chart = initChart() })
 * watch(themeMode, () => { registerTheme(); chart?.dispose(); chart = initChart() })
 * ```
 */
export function useEChartsTheme(containerRef?: Ref<HTMLElement | undefined>) {
  const registerTheme = () => registerDesignSystemTheme()

  const initChart = (el?: HTMLElement) => {
    const target = el ?? containerRef?.value
    if (!target) return null
    return echarts.init(target, 'design-system')
  }

  return { registerTheme, initChart }
}
```

> **注意**：`Ref` 需从 `vue` 导入，上方代码片段省略了 import，实际文件中需补充：
> ```ts
> import type { Ref } from 'vue'
> ```

---

## Step 2：在 Vue 组件中使用

### 最小示例（单图表）

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/store'
import { useEChartsTheme } from '@/libs/hooks/useEChartsTheme'

const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
const { themeConfig } = storeToRefs(useThemeStore())
const { registerTheme, initChart } = useEChartsTheme(chartEl)

const getOption = (): echarts.EChartsOption => ({
  // 不需要在 option 里写 color / textStyle 等——主题已全局覆盖
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 200, 150, 80, 70] }],
})

const rebuild = () => {
  registerTheme()          // 用当前 CSS 变量重建主题对象
  chart?.dispose()
  chart = initChart()
  chart?.setOption(getOption())
}

const handleResize = () => chart?.resize()

onMounted(() => {
  rebuild()
  window.addEventListener('resize', handleResize)
})

watch(() => themeConfig.value.mode, rebuild)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>
```

### 多图表场景（共享主题注册，各自 init）

```typescript
// 只需注册一次，多个图表共享
registerTheme()

const charts = [chartEl1, chartEl2, chartEl3].map(el =>
  el.value ? echarts.init(el.value, 'design-system') : null
)

// 主题切换时
const rebuildAll = () => {
  registerTheme()
  charts.forEach(c => {
    const container = c?.getDom()
    c?.dispose()
    if (container) echarts.init(container, 'design-system').setOption(getOption())
  })
}
```

---

## Token 映射速查表

### 通用场景映射

| ECharts 字段 | 设计系统 Token | 实际值（亮色） | 说明 |
|---|---|---|---|
| `color[0]` | `--brand-60` | `#134BEA` | 主品牌蓝（第一系列） |
| `color[1]` | `--success-60` | `#16A34A` | 成功绿（第二系列） |
| `color[2]` | `--warningm-60` | `#F5731C` | 中危橙（第三系列） |
| `color[3]` | `--error-60` | `#F53C3C` | 危险红（第四系列） |
| `color[4]` | `--brand-40` | `#6E9EFD` | 品牌蓝浅（第五系列） |
| `color[5]` | `--warning-60` | `#F3A700` | 低危黄（第六系列） |
| `color[6]` | `--fall-60` | `#A74748` | 失陷酒红（第七系列） |
| `backgroundColor` | 透明 | `transparent` | 图表区不设底色，继承容器 |
| `textStyle.color` | `--color-text-secondary` | `#353C51` | 全局文字 |
| `legend.textStyle.color` | `--color-text-secondary` | `#353C51` | 图例文字 |
| `axisLabel.color` | `--color-text-placeholder` | `#7E8494` | 坐标轴标签 |
| `axisLine.lineStyle.color` | `--color-component-stroke` | `#E9EAF0` | 坐标轴线 |
| `splitLine.lineStyle.color` | `--color-component-stroke` | `#E9EAF0` | 网格分割线（虚线） |
| `tooltip.backgroundColor` | `--color-bg-component2` | `#FFFFFF` | Tooltip 背景 |
| `tooltip.borderColor` | `--color-component-border` | `#CBD0DB` | Tooltip 边框 |
| `tooltip.textStyle.color` | `--color-text-primarys` | `#2D3348` | Tooltip 文字 |

### 网安风险场景专用色板

当图表需要按风险等级着色时，直接在 `option.color` 或 `visualMap` 中引用以下 CSS 变量值：

```typescript
import { buildSecurityPalette } from '@/libs/hooks/useEChartsTheme'

// 返回按风险等级排序的颜色数组
// [失陷, 高危, 中危, 低危, 无风险]
const secPalette = buildSecurityPalette()
```

对应关系：

| 等级 | Token | 颜色（亮色） |
|---|---|---|
| 失陷 | `--color-risk-fall-normal` → `--fall-60` | `#A74748` |
| 高危 | `--color-risk-high-normal` → `--error-60` | `#F53C3C` |
| 中危 | `--color-risk-medium-normal` → `--warningm-60` | `#F5731C` |
| 低危 | `--color-risk-low-normal` → `--warning-60` | `#F3A700` |
| 无风险 | `--color-risk-no-normal` → `--gray-60` | `#7E8494` |

---

## 各图表类型 Token 覆盖检查清单

在 `option` 中，若以下字段需要自定义（覆盖主题默认值），优先用 `getCssVar()` 取值，**禁止硬编码 `#hex`**。

### 折线图 / 面积图

- [ ] `series[].areaStyle.color`：渐变起始色用 `getCssVar('--brand-60') + '1A'`（10% 透明度），终止色用 `'transparent'`
- [ ] `series[].lineStyle.color`：默认走主题色板，无需单独设置
- [ ] `series[].emphasis.areaStyle.color`：高亮时同上，透明度可提高到 `'33'`（20%）

### 柱状图

- [ ] `series[].itemStyle.color`：默认走主题色板
- [ ] `series[].itemStyle.borderRadius`：用 `[getCssVar('--radius-xs'), getCssVar('--radius-xs'), 0, 0]`（顶部圆角）
- [ ] `series[].emphasis.itemStyle.color`：`getCssVar('--brand-40')`

### 饼图 / 环形图

- [ ] `series[].color`：若需按语义（风险等级）排序，覆盖主题色板为 `buildSecurityPalette()`
- [ ] 内外环的透明填充色：`getCssVar('--brand-60') + '1A'`（10% 透明度），勿硬编码 `rgba`

### 雷达图

- [ ] `radar.axisLine.lineStyle.color`：`getCssVar('--color-component-stroke')`
- [ ] `radar.splitLine.lineStyle.color`：`getCssVar('--color-component-stroke')`
- [ ] `radar.name.color`：`getCssVar('--color-text-placeholder')`

### 热力图（heatmap）

- [ ] `visualMap.inRange.color`：从低到高用 `[getCssVar('--color-bg-secondarycontainer'), getCssVar('--brand-60')]`
- [ ] `visualMap.textStyle.color`：`getCssVar('--color-text-placeholder')`

### 关系图 / 力导向图

- [ ] `series[].lineStyle.color`：`getCssVar('--color-component-stroke')`
- [ ] `series[].label.color`：`getCssVar('--color-text-secondary')`
- [ ] 节点颜色按类型映射到风险色板

---

## 常见问题

**Q：主题切换后颜色没有更新？**

原因：ECharts `registerTheme` 只影响新 `init` 的图表，已存在的实例不受影响。

解决：切换时 `chart.dispose()` → `registerTheme()` → `echarts.init(el, 'design-system')` 重建。

**Q：某个图表需要单独覆盖颜色（不走主题色板）？**

在该图表的 `option` 中直接写 `color: [getCssVar('--error-60'), getCssVar('--warning-60'), ...]`，`option` 中的设置优先级高于主题。

**Q：面积图的 `areaStyle` 用 `rgba` 还是 hex + 透明度后缀？**

ECharts 支持 8 位 hex（`#RRGGBBAA`），但各浏览器兼容性不同。推荐直接用 `rgba` 配合 `getCssVar` 的值，或写成 `color + '33'`（hex 透明度后缀，`33` ≈ 20%）。

**Q：暗色模式下 `transparent` 背景会导致图表看起来没有背景？**

意图正确。图表应透明，背景色由容器（卡片）的 `--color-bg-container` 提供，不由图表自身设定。
