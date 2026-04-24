# Layout Token 映射参考

## Ant Design v5 Token 分层说明

Ant Design v5 将 Token 分为三层：

| 层级 | 说明 | 位置 |
|------|------|------|
| Seed Token | 基础种子值，派生其他所有 Token | `ConfigProvider.theme.token` |
| Map Token | 系统自动从 Seed 派生 | 自动生成，可局部覆盖 |
| Alias Token | 具体组件使用的最终值 | `ConfigProvider.theme.components.XXX` |

---

## Layout 组件专属 Token

```ts
components: {
  Layout: {
    // 背景色
    siderBg:   '#FFFFFF',  // Sider 背景（覆盖全局 colorBgContainer）
    headerBg:  '#FFFFFF',  // Header 背景
    bodyBg:    '#F3F5F9',  // Content 背景（colorBgLayout）
    footerBg:  '#FFFFFF',  // Footer 背景（默认跟随 bodyBg）

    // 尺寸
    headerHeight:  56,           // px
    headerPadding: '0 24px',     // 字符串形式
    footerPadding: '12px 24px',
  },
}
```

## Menu 组件专属 Token

```ts
components: {
  Menu: {
    // 尺寸
    itemHeight:         40,    // 菜单项高度
    collapsedWidth:     64,    // 折叠宽度（须与 Sider collapsedWidth 一致）
    iconSize:           16,    // 图标尺寸
    collapsedIconSize:  18,
    inlineIndent:       16,    // 子菜单缩进

    // 颜色
    itemColor:          '#5B6679',   // 默认项文字
    itemSelectedColor:  '#3B71EE',   // 选中项文字
    itemHoverColor:     '#3B71EE',   // 悬停项文字
    itemBg:             '#FFFFFF',   // 菜单整体背景
    itemSelectedBg:     '#E8F2FF',   // 选中项背景
    itemHoverBg:        '#F3F5F9',   // 悬停项背景
    subMenuItemBg:      '#FAFBFD',   // 子菜单背景

    // 分组标签
    groupTitleColor:    '#7E8494',
    groupTitleFontSize: 11,

    // 圆角
    itemBorderRadius:   6,
    itemMarginInline:   8,   // 左右边距（产生内缩感）
  },
}
```

---

## 常用组件 Token 速查

### Card

```ts
components: {
  Card: {
    headerBg:       'transparent',
    headerFontSize: 14,
    headerHeight:   48,
    borderRadiusLG: 9,
    paddingLG:      20,
    boxShadow:      '0 1px 4px 0 rgba(0,21,41,0.06)',
  },
}
```

### Table

```ts
components: {
  Table: {
    // 表头
    headerBg:        '#F7F9FC',
    headerColor:     '#5B6679',
    headerFontSize:  12,
    headerBorderRadius: 0,   // 表头不要单独圆角

    // 行
    rowHoverBg:      '#F3F5F9',
    rowSelectedBg:   '#E8F2FF',
    rowSelectedHoverBg: '#DCE9FF',

    // 边框
    borderColor:     '#E4E8F0',

    // 间距（密度控制）
    cellPaddingBlock:   10,   // 行高约 40px
    cellPaddingInline:  16,

    // 固定列阴影
    fixedHeaderSortActiveBg: '#F0F5FF',
  },
}
```

### Button

```ts
components: {
  Button: {
    // Primary Button
    primaryColor:   '#FFFFFF',
    primaryShadow:  '0 2px 6px 0 rgba(59,113,238,0.28)',

    // Default Button
    defaultBg:          '#FFFFFF',
    defaultBorderColor: '#D3DEED',
    defaultColor:       '#1A2233',

    // 尺寸
    controlHeight:   36,
    controlHeightSM: 28,
    controlHeightLG: 44,
    fontWeight:      500,
    borderRadius:    6,
  },
}
```

### Form / Input

```ts
components: {
  Input: {
    controlHeight:      36,
    controlHeightSM:    28,
    controlHeightLG:    44,
    hoverBorderColor:   '#5B8CF4',
    activeBorderColor:  '#3B71EE',
    activeShadow:       '0 0 0 2px rgba(59,113,238,0.12)',
    borderRadius:        6,
    colorBgContainer:    '#FFFFFF',
  },
  Form: {
    labelColor:      '#5B6679',
    labelFontSize:   13,
    itemMarginBottom: 20,
  },
}
```

---

## useToken Hook 用法

在组件内部通过 hook 读取当前 Token，实现动态样式：

```tsx
import { theme } from 'antd';
const { useToken } = theme;

function MyComponent() {
  const { token } = useToken();

  return (
    <div style={{
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      padding: token.paddingLG,
      boxShadow: token.boxShadow,
    }}>
      内容
    </div>
  );
}
```

---

## 风险状态色扩展（DAS 平台专有）

不在 AntD Token 体系内，通过 CSS 变量或常量文件管理：

```ts
// src/constants/risk-colors.ts
export const RiskColors = {
  fall:       { bg: '#F6E3E0', text: '#A74748' },  // 失陷（紫红）
  high:       { bg: '#FFE8E8', text: '#F53C3C' },  // 高危（红）
  medium:     { bg: '#FFE7C8', text: '#F5731C' },  // 中危（橙红）
  low:        { bg: '#FFF2BA', text: '#F3A700' },  // 低危（黄）
  none:       { bg: '#F6F7FB', text: '#7E8494' },  // 无风险（灰）
} as const;

// 使用示例
<Tag style={{ background: RiskColors.high.bg, color: RiskColors.high.text, border: 'none' }}>
  高危
</Tag>
```

---

## 布局层级 Z-Index 规范

| 元素 | z-index | 说明 |
|------|---------|------|
| Sider | 100 | 固定左侧 |
| Header | 99 | 固定顶部（低于 Sider，不遮挡折叠按钮） |
| Dropdown | 1050 | AntD 默认 |
| Modal | 1000 | AntD 默认 |
| Drawer | 1000 | AntD 默认 |
| Message/Toast | 1010 | AntD 默认 |
