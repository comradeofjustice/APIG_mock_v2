---
name: opt-antd-v5-enterprise-layout
description: 基于 Ant Design v5 Design Token 的企业级后台布局方案生成器。输出完整主题配置、Layout/Sider/Header/Content 布局结构代码、色彩/排版/密度规范，适配网络安全/数据中台/B端管控平台。当用户说"后台布局"、"AntD 布局"、"企业级 Layout"、"侧边栏布局"、"后台框架代码"、"antd ConfigProvider"、"主题 Token"、"Layout 模板"时使用此技能。
---

# Ant Design v5 企业级后台布局

## 设计定位

**视觉基调**：Sentinel Aesthetic——数字指挥中心风格。深色侧边导航 + 浅色内容区，用背景色差（Tonal Layering）替代边框分区，Ambient Shadow 浮层，克制、高密度、安全感强。  
**品牌色**：`#3B71EE`（来自项目 Design Token，锁定不变）。  
**核心原则**：No-Line Rule（分区靠背景差，不用 1px 线）+ Glassmorphism 浮层 + KPI Signal 卡片。  
**适用场景**：网络安全平台 / 数据中台 / B 端管控系统。

---

## 1. 主题 Token 配置

完整放入项目根 `main.tsx` / `App.tsx` 的 `ConfigProvider`：

```tsx
// theme.config.ts
import type { ThemeConfig } from 'antd';

export const enterpriseTheme: ThemeConfig = {
  token: {
    // ── 品牌色（来自 project_description.md，锁定不变）──────
    colorPrimary:       '#3B71EE',
    colorPrimaryHover:  '#5B8CF4',
    colorPrimaryActive: '#2A5FD8',
    colorPrimaryBg:     '#E8F2FF',   // 选中浅底 / brand light

    // ── 背景层级（Sentinel Tonal Layering）─────────────────
    // Level 0: #F7FAFD  页面底色（比旧版 #F3F5F9 更蓝调）
    // Level 1: #FFFFFF  卡片 / 面板（surface_container_lowest）
    // Level 2: #FFFFFF  弹层 / Dropdown
    colorBgLayout:      '#F7FAFD',
    colorBgContainer:   '#FFFFFF',
    colorBgElevated:    '#FFFFFF',

    // ── 文字层级（Sentinel on_surface 体系）────────────────
    colorText:          '#181C1E',   // on_surface，比旧版更纯黑
    colorTextSecondary: '#454652',   // on_surface_variant
    colorTextTertiary:  '#7E8494',   // 辅助 / 占位
    colorTextDisabled:  '#BCC2CC',

    // ── 边框（Ghost Border 体系：优先用背景差，边框为回退）──
    // No-Line Rule：分区用背景色差，不用 1px 线
    // Ghost Border 回退：colorBorderSecondary 在代码中以 15% opacity 使用
    colorBorder:          '#C3C6D1',   // outline_variant（仅无障碍回退）
    colorBorderSecondary: '#D5D8E3',
    colorSplit:           '#EDEEF5',

    // ── 状态色（来自 project_description.md）──────────────
    colorSuccess:     '#16A34A',
    colorSuccessBg:   '#DCFCE7',
    colorWarning:     '#F3A700',
    colorWarningBg:   '#FFF2BA',
    colorError:       '#F53C3C',
    colorErrorBg:     '#FFE8E8',
    colorInfo:        '#3B71EE',

    // ── 圆角（项目规范：3 / 6 / 9px）──────────────────────
    borderRadius:    6,   // 输入框 / 按钮
    borderRadiusSM:  3,   // Tag / Badge
    borderRadiusLG:  9,   // 卡片 / 面板
    borderRadiusXS:  2,

    // ── 阴影（Sentinel Ambient Shadow 体系）────────────────
    // 卡片：不用投影，靠背景色差（Tonal Layering）
    // 浮层用 Ambient Shadow：模拟自然光，不用纯黑硬阴影
    boxShadow:          '0px 4px 12px 0px rgba(24,28,30,0.04)',   // 卡片悬浮
    boxShadowSecondary: '0px 8px 24px 0px rgba(24,28,30,0.06)',   // Dropdown / Tooltip
    boxShadowTertiary:  '0px 12px 32px 0px rgba(24,28,30,0.08)',  // Modal / Drawer

    // ── 字体（中文场景保持 PingFang SC）───────────────────
    fontFamily: "'PingFang SC', 'Helvetica Neue', Arial, sans-serif",
    fontSize:   14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    lineHeight: 1.5714,

    // ── 间距（8pt 网格）────────────────────────────────────
    sizeStep:   4,
    sizeUnit:   4,
    padding:    16,
    paddingMD:  20,
    paddingLG:  24,
    margin:     16,
    marginMD:   20,
    marginLG:   24,

    // ── 运动 ────────────────────────────────────────────────
    motionDurationFast: '0.15s',
    motionDurationMid:  '0.22s',
    motionDurationSlow: '0.30s',
    motionEaseOut:      'cubic-bezier(0.12, 0, 0.36, 1)',
  },

  components: {
    Layout: {
      // 深色 Sider：品牌深色派生（#3B71EE 压暗至深海军蓝）
      siderBg:       '#0F1E4A',
      headerBg:      '#FFFFFF',
      bodyBg:        '#F7FAFD',
      headerHeight:  56,
      headerPadding: '0 24px',
      footerPadding: '12px 24px',
    },
    Menu: {
      // 深色导航栏适配
      itemHeight:        40,
      // 选中态：品牌色半透明 glass highlight
      itemSelectedBg:    'rgba(59,113,238,0.18)',
      itemSelectedColor: '#FFFFFF',
      itemHoverBg:       'rgba(255,255,255,0.08)',
      itemHoverColor:    '#FFFFFF',
      itemActiveBg:      'rgba(59,113,238,0.18)',
      // 子菜单：深色底稍深一档
      subMenuItemBg:     'rgba(0,0,0,0.15)',
      // 分组标题：低对比度白色
      groupTitleColor:   'rgba(255,255,255,0.45)',
      groupTitleFontSize: 11,
      iconSize:          16,
      collapsedIconSize: 18,
      itemMarginInline:  8,
      itemBorderRadius:  6,
      // 深色底文字色
      itemColor:         'rgba(255,255,255,0.75)',
      darkItemBg:        '#0F1E4A',
      darkItemSelectedBg:'rgba(59,113,238,0.18)',
      darkItemHoverBg:   'rgba(255,255,255,0.08)',
    },
    Card: {
      borderRadiusLG: 9,
      // 卡片不用投影，靠 Tonal Layering（白卡在 #F7FAFD 底上自然浮起）
      boxShadow:      'none',
      paddingLG:      20,
    },
    Table: {
      headerBg:          '#F3F6FB',
      headerColor:       '#454652',
      headerFontSize:    12,
      rowHoverBg:        '#F7FAFD',
      // No-Line Rule：表格行间不用分割线，靠行距区分
      borderColor:       'transparent',
      cellPaddingBlock:  10,
      cellPaddingInline: 16,
    },
    Button: {
      borderRadius:       6,
      borderRadiusSM:     3,
      controlHeight:      36,
      controlHeightSM:    28,
      controlHeightLG:    44,
      fontWeight:         500,
      primaryShadow:      '0 2px 8px 0 rgba(59,113,238,0.32)',
    },
    Input: {
      controlHeight:      36,
      controlHeightSM:    28,
      controlHeightLG:    44,
      borderRadius:       6,
      // Glow Focus：2px 品牌色光晕，无硬边框感
      controlOutlineWidth: 2,
    },
    Select: {
      controlHeight:   36,
      controlHeightSM: 28,
      controlHeightLG: 44,
      borderRadius:     6,
    },
    Breadcrumb: {
      fontSize:          12,
      itemColor:         '#7E8494',
      lastItemColor:     '#181C1E',
      separatorColor:    '#BCC2CC',
      separatorMargin:   6,
    },
    Divider: {
      colorSplit: '#EDEEF5',
    },
  },
};

// ── 风险色（DAS 项目特有，注入 CSS Variables）────────────────
// 在 main.tsx 或全局 CSS 中添加：
//
// :root {
//   --risk-fall:        #A74748;   /* 失陷（紫红）*/
//   --risk-fall-light:  #F6E3E0;
//   --risk-high:        #F53C3C;   /* 高危（红）*/
//   --risk-high-light:  #FFE8E8;
//   --risk-medium:      #F5731C;   /* 中危（橙红）*/
//   --risk-medium-light:#FFE7C8;
//   --risk-low:         #F3A700;   /* 低危（黄）*/
//   --risk-low-light:   #FFF2BA;
//   --risk-none:        #7E8494;   /* 无风险（灰）*/
//   --risk-none-light:  #F6F7FB;
// }
```

---

## 2. 布局结构代码

完整可运行布局，放入 `src/layouts/EnterpriseLayout.tsx`：

```tsx
import React, { useState } from 'react';
import {
  Layout, Menu, Avatar, Button, Breadcrumb,
  Space, Typography, Tooltip, ConfigProvider,
  theme as antdTheme,
} from 'antd';
import {
  MenuFoldOutlined, MenuUnfoldOutlined,
  DashboardOutlined, SafetyOutlined, DatabaseOutlined,
  AuditOutlined, SettingOutlined, BellOutlined, UserOutlined,
} from '@ant-design/icons';
import { enterpriseTheme } from './theme.config';

const { Sider, Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useToken } = antdTheme;

// ── 深色 Sider 常量 ──────────────────────────────────────
const SIDER_BG       = '#0F1E4A';   // 品牌深色派生
const SIDER_TEXT     = 'rgba(255,255,255,0.75)';
const SIDER_ACTIVE   = '#3B71EE';   // indicator 条颜色 = brand normal
const SIDER_SELECTED = 'rgba(59,113,238,0.18)';

// ── 侧边导航菜单项 ──────────────────────────────────────
const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '控制台' },
  {
    key: 'security',
    icon: <SafetyOutlined />,
    label: '安全管理',
    children: [
      { key: 'security-policy',  label: '安全策略' },
      { key: 'security-events',  label: '安全事件' },
      { key: 'security-alerts',  label: '告警管理' },
    ],
  },
  {
    key: 'data',
    icon: <DatabaseOutlined />,
    label: '数据资产',
    children: [
      { key: 'data-catalog',  label: '数据目录' },
      { key: 'data-classify', label: '数据分类' },
      { key: 'data-quality',  label: '质量管理' },
    ],
  },
  { key: 'audit',    icon: <AuditOutlined />,   label: '审计日志' },
  { key: 'settings', icon: <SettingOutlined />,  label: '系统配置' },
];

// ── 主布局组件 ────────────────────────────────────────
export default function EnterpriseLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const { token } = useToken();

  return (
    <ConfigProvider theme={enterpriseTheme}>
      <Layout style={{ minHeight: '100vh' }}>

        {/* ── Sider：深色左侧导航（No-Line Rule：无 borderRight）── */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={200}
          collapsedWidth={64}
          style={{
            position:         'fixed',
            insetInlineStart: 0,
            top:              0,
            bottom:           0,
            overflowY:        'auto',
            overflowX:        'hidden',
            background:       SIDER_BG,
            // No-Line Rule：Sider 与内容区边界靠背景色差区分，无 borderRight
            zIndex:           100,
          }}
        >
          {/* Logo 区域：无下边框，靠背景差区分 */}
          <div style={{
            height:     56,
            display:    'flex',
            alignItems: 'center',
            padding:    '0 20px',
            gap:        8,
            flexShrink: 0,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: SIDER_ACTIVE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <SafetyOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            {!collapsed && (
              <Text strong style={{ fontSize: 14, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                数据安全平台
              </Text>
            )}
          </div>

          {/* 导航菜单（深色底，每项含 3px 左侧 indicator）*/}
          <div style={{ paddingTop: 8, position: 'relative' }}>
            {menuItems.map((item) => (
              <SiderNavItem
                key={item.key}
                item={item}
                collapsed={collapsed}
                selectedKey={selectedKey}
                onSelect={setSelectedKey}
              />
            ))}
          </div>
        </Sider>

        {/* ── 右侧主区域 ─────────────────────────────── */}
        <Layout style={{ marginInlineStart: collapsed ? 64 : 200, transition: 'margin 0.22s' }}>

          {/* ── Header：顶部白色栏，底部用背景差而非边框 ─── */}
          <Header style={{
            position:       'sticky',
            top:            0,
            zIndex:         99,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            background:     '#FFFFFF',
            // Ambient Shadow（取代 1px 边框）
            boxShadow: '0px 4px 12px 0px rgba(24,28,30,0.04)',
          }}>
            {/* 左侧：折叠按钮 + 面包屑 */}
            <Space size={16}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: 16, color: token.colorTextSecondary }}
              />
              <Breadcrumb
                items={[
                  { title: '首页' },
                  { title: '安全管理' },
                  { title: '安全事件' },
                ]}
              />
            </Space>

            {/* 右侧：通知 + 用户 */}
            <Space size={8}>
              <Tooltip title="消息通知">
                <Button type="text" icon={<BellOutlined />}
                  style={{ color: token.colorTextSecondary }} />
              </Tooltip>
              <Space size={8} style={{ cursor: 'pointer' }}>
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ background: token.colorPrimaryBg, color: token.colorPrimary }}
                />
                <Text style={{ fontSize: 13, color: token.colorText }}>管理员</Text>
              </Space>
            </Space>
          </Header>

          {/* ── Content：内容区 ─────────────────────── */}
          <Content style={{ padding: 20, minHeight: 'calc(100vh - 56px - 48px)' }}>
            {children ?? <PageDemo token={token} />}
          </Content>

          {/* ── Footer（可选）────────────────────────── */}
          <Footer style={{
            textAlign: 'center',
            fontSize:  12,
            color:     token.colorTextTertiary,
            // 用背景差代替 borderTop
            background: '#F0F3FA',
          }}>
            济南数据安全管理平台 ©2025  版本 v2.1.0
          </Footer>

        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

// ── 深色 Sider 导航项（含 3px 左侧 indicator）──────────────
interface NavItem { key: string; icon: React.ReactNode; label: string; children?: NavItem[] }
function SiderNavItem({
  item, collapsed, selectedKey, onSelect, depth = 0,
}: {
  item: NavItem; collapsed: boolean; selectedKey: string;
  onSelect: (k: string) => void; depth?: number;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedKey === item.key;
  const hasChildren = !!item.children?.length;

  return (
    <>
      <div
        onClick={() => { hasChildren ? setOpen(!open) : onSelect(item.key); }}
        style={{
          position:    'relative',
          display:     'flex',
          alignItems:  'center',
          gap:         8,
          height:      40,
          padding:     collapsed ? '0 20px' : `0 ${16 + depth * 16}px`,
          cursor:      'pointer',
          borderRadius: 6,
          margin:      '2px 8px',
          background:  isSelected ? SIDER_SELECTED : 'transparent',
          color:       isSelected ? '#FFFFFF' : SIDER_TEXT,
          transition:  'background 0.15s',
        }}
      >
        {/* 3px 左侧品牌色 indicator（仅选中态）*/}
        {isSelected && (
          <span style={{
            position:     'absolute',
            left:         0,
            top:          '50%',
            transform:    'translateY(-50%)',
            width:        3,
            height:       20,
            borderRadius: 2,
            background:   SIDER_ACTIVE,
          }} />
        )}
        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
        {!collapsed && <span style={{ fontSize: 13 }}>{item.label}</span>}
      </div>
      {hasChildren && open && !collapsed && item.children!.map((child) => (
        <SiderNavItem
          key={child.key} item={child} collapsed={collapsed}
          selectedKey={selectedKey} onSelect={onSelect} depth={depth + 1}
        />
      ))}
    </>
  );
}

// ── 内容区示例：KPI 统计卡片 + 主卡片结构 ──────────────────
function PageDemo({ token }: { token: ReturnType<typeof useToken>['token'] }) {
  // 风险色直接引用 CSS Variables（见 ## 6 中的 :root 配置）
  const statCards = [
    { label: '今日告警', value: '47',  cssVar: 'var(--risk-high)',   lightVar: 'var(--risk-high-light)'   },
    { label: '高危事件', value: '12',  cssVar: 'var(--risk-medium)', lightVar: 'var(--risk-medium-light)' },
    { label: '处理中',   value: '28',  cssVar: token.colorPrimary,   lightVar: token.colorPrimaryBg       },
    { label: '已处置',   value: '185', cssVar: token.colorSuccess,   lightVar: token.colorSuccessBg       },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: token.colorText }}>安全事件</div>
          <div style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 2 }}>共 1,284 条记录</div>
        </div>
        <Button type="primary">新建事件</Button>
      </div>

      {/* KPI Sentinel 卡片：Tonal Layering（白底在 #F7FAFD 上自然浮起，无阴影）*/}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background:   '#FFFFFF',
            borderRadius: 9,
            padding:      '16px 20px',
            position:     'relative',
            overflow:     'hidden',
          }}>
            {/* 背景水印 Signal Icon（5% opacity）*/}
            <div style={{
              position: 'absolute', right: 12, bottom: 8,
              fontSize: 48, opacity: 0.05, color: s.cssVar,
              lineHeight: 1, pointerEvents: 'none',
            }}>●</div>
            <div style={{ fontSize: 12, color: token.colorTextTertiary }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.cssVar, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 主内容卡片：无阴影，靠背景色差 */}
      <div style={{ background: '#FFFFFF', borderRadius: 9, overflow: 'hidden' }}>
        <div style={{
          height:     48,
          padding:    '0 20px',
          display:    'flex',
          alignItems: 'center',
          // 卡片标题与内容区用背景差区分，而非 1px border
          background: '#F7FAFD',
          fontWeight: 600,
          fontSize:   14,
          color:      token.colorText,
        }}>
          事件列表
        </div>
        <div style={{ padding: 20, color: token.colorTextTertiary, fontSize: 13 }}>
          此处放入 &lt;Table&gt; 组件
        </div>
      </div>
    </div>
  );
}
```

---

## 3. App 入口接入

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { enterpriseTheme } from './layouts/theme.config';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import { RouterProvider } from 'react-router-dom';
import router from './router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={enterpriseTheme} locale={zhCN}>
    <EnterpriseLayout>
      <RouterProvider router={router} />
    </EnterpriseLayout>
  </ConfigProvider>
);
```

---

## 4. 色彩体系说明

### 品牌色（锁定，来自 project_description.md）

| 分类 | Token | 值 | 用途 |
|------|-------|-----|------|
| 品牌主色 | `colorPrimary` | `#3B71EE` | 主按钮、选中态、链接、indicator |
| 品牌悬停 | `colorPrimaryHover` | `#5B8CF4` | 交互悬停 |
| 品牌激活 | `colorPrimaryActive` | `#2A5FD8` | 点击按压 |
| 品牌浅底 | `colorPrimaryBg` | `#E8F2FF` | 选中行背景 |

### 背景层级（Sentinel Tonal Layering）

| 层级 | Token | 值 | 说明 |
|------|-------|-----|------|
| Level 0 — 页面底 | `colorBgLayout` | `#F7FAFD` | 整体画布，比旧版更蓝调 |
| Level 1 — 深色导航 | `Layout.siderBg` | `#0F1E4A` | 品牌深色派生 |
| Level 2 — 内容卡片 | `colorBgContainer` | `#FFFFFF` | 白卡在 Level 0 底上自然浮起 |
| Level 3 — 弹层 | `colorBgElevated` | `#FFFFFF` | Modal / Dropdown |

### 文字色（Sentinel on_surface 体系）

| 分类 | Token | 值 | 用途 |
|------|-------|-----|------|
| 主文字 | `colorText` | `#181C1E` | 标题、正文 |
| 次要文字 | `colorTextSecondary` | `#454652` | 表格表头、描述 |
| 辅助文字 | `colorTextTertiary` | `#7E8494` | 占位、说明 |
| 禁用 | `colorTextDisabled` | `#BCC2CC` | 禁用态 |

### 状态色

| 分类 | Token | 值 | 用途 |
|------|-------|-----|------|
| 成功 | `colorSuccess` | `#16A34A` | 通过、正常 |
| 告警 | `colorWarning` | `#F3A700` | 低危、待处理 |
| 错误 | `colorError` | `#F53C3C` | 高危、失败 |

### 风险色（DAS 项目特有，CSS Variables）

| 风险级别 | CSS Variable | 值 | Light 背景 |
|---------|-------------|-----|-----------|
| 失陷 | `--risk-fall` | `#A74748` | `#F6E3E0` |
| 高危 | `--risk-high` | `#F53C3C` | `#FFE8E8` |
| 中危 | `--risk-medium` | `#F5731C` | `#FFE7C8` |
| 低危 | `--risk-low` | `#F3A700` | `#FFF2BA` |
| 无风险 | `--risk-none` | `#7E8494` | `#F6F7FB` |

### Ghost Border（No-Line Rule 无障碍回退）

| 分类 | Token / 用法 | 值 | 说明 |
|------|-------------|-----|------|
| 回退边框 | `colorBorder` at 15% opacity | `rgba(195,198,209,0.15)` | 仅在高密度数据表需要无障碍对比时使用 |
| 分割线 | `colorSplit` | `#EDEEF5` | 内部分隔，优先用背景差替代 |

---

## 5. 排版与密度规范

### 字体栈

中文场景保持 PingFang SC，Sentinel 的 Manrope/Inter 为英文系统专用，不引入：

```css
font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
```

### 字号层级

| 场景 | 字号 | 字重 | 颜色 Token | Sentinel 对应 |
|------|------|------|-----------|--------------|
| KPI 大指标 | 28px | 700 | 风险色 / `colorPrimary` | Display-SM |
| 页面标题 | 18px | 600 | `colorText` | Headline-LG |
| 卡片标题 | 14px | 600 | `colorText` | — |
| 正文 / 表格 | 14px | 400 | `colorText` | Body-MD |
| 次要说明 | 12px | 400 | `colorTextSecondary` | — |
| 表格表头 | 12px | 400 | `colorTextSecondary` | Label-SM（全大写 + 0.05em 字距）|
| 辅助 / 时间 | 12px | 400 | `colorTextTertiary` | Label-SM |

### 间距（8pt 网格）

| 语义 | 值 | 场景 |
|------|----|------|
| 卡片 padding | `20px` | 内容区卡片内边距 |
| 卡片标题高 | `48px` | 卡片 header bar |
| 内容区 padding | `20px` | Content 四边 |
| 卡片间 gap | `20px` | 卡片纵向间距 |
| 统计卡片 gap | `16px` | 横向统计卡片 |
| Header 高 | `56px` | 固定顶部 |
| Sider 宽 | `200px` | 展开态 |
| Sider 折叠宽 | `64px` | 折叠态 |

### 圆角规则

| Token | 值 | 适用组件 |
|-------|----|---------|
| `borderRadiusSM` | 3px | Tag、Badge |
| `borderRadius` | 6px | Button、Input、Select |
| `borderRadiusLG` | 9px | Card、Modal、Panel |

### 阴影层级

| 层级 | 值 | 场景 |
|------|----|------|
| 卡片 | `0 1px 4px rgba(0,21,41,.06)` | 普通卡片 |
| 悬浮 | `0 2px 8px rgba(0,21,41,.08)` | Dropdown、Tooltip |
| 弹层 | `0 4px 16px rgba(0,21,41,.10)` | Modal、Drawer |

---

---

## 6. Sentinel 扩展规范

> 以下四个子节是 Sentinel Aesthetic 的核心视觉语言实现，与 AntD Token 配合使用。

---

### 6.1 No-Line Rule 实践

**原则**：禁止用 1px 实线分隔内容区域。用背景色差（Tonal Layering）建立层级感。

```
页面底色   #F7FAFD  ← colorBgLayout
  └─ 卡片  #FFFFFF  ← colorBgContainer（自然浮起，无需阴影）
       └─ 表格行悬停  #F7FAFD（同页面底，形成内陷感）
```

**实现规则**：

| 场景 | 做法 | 禁止 |
|------|------|------|
| Sider 与内容区边界 | 深色 `#0F1E4A` vs 浅色 `#F7FAFD` 背景差 | ~~borderRight~~ |
| 卡片标题与内容区 | 标题区 `background: #F7FAFD`，内容区 `background: #FFFFFF` | ~~borderBottom~~ |
| Header 与内容区 | Ambient Shadow `0px 4px 12px rgba(24,28,30,0.04)` | ~~borderBottom~~ |
| 表格行间 | 行间距 `cellPaddingBlock: 10px`，`borderColor: transparent` | ~~1px divider~~ |

**Ghost Border 无障碍回退**（仅在高密度表格、对比度不够时启用）：

```css
/* 使用 15% opacity，永远不用 100% 不透明边框 */
border: 1px solid rgba(195, 198, 209, 0.15);
```

---

### 6.2 Glassmorphism Drawer

浮层（Side Drawer / 模态背景）使用磨砂玻璃效果，不用纯色遮罩。

```tsx
// Drawer 容器样式
const drawerStyle: React.CSSProperties = {
  background:       'rgba(247, 250, 253, 0.85)',   // surface 80%+ opacity
  backdropFilter:   'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  // Ambient Shadow（模拟自然光，非纯黑硬阴影）
  boxShadow:        '0px 12px 32px 0px rgba(24, 28, 30, 0.08)',
  // Ghost Border 前导边（10% opacity）
  borderLeft:       '1px solid rgba(195, 198, 209, 0.10)',
};

// 遮罩层：on_surface 30% opacity + blur
const maskStyle: React.CSSProperties = {
  background:       'rgba(24, 28, 30, 0.30)',
  backdropFilter:   'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
};

// 配合 AntD Drawer 使用
<Drawer
  styles={{
    wrapper: drawerStyle,
    mask:    maskStyle,
  }}
  style={{ padding: 0 }}
  // 300ms cubic-bezier 过渡（Sentinel 规范）
  motion={{ motionName: 'ant-drawer-right', motionAppear: true }}
/>
```

---

### 6.3 KPI Sentinel 卡片

大字号指标 + 背景水印 Signal Icon，风险色引用 CSS Variables。

```tsx
interface SentinelCardProps {
  label:    string;
  value:    string | number;
  color:    string;   // 传入风险色 CSS var 或 Token 值
  icon?:    React.ReactNode;
  trend?:   { value: string; up: boolean };
}

function SentinelCard({ label, value, color, icon, trend }: SentinelCardProps) {
  return (
    <div style={{
      background:   '#FFFFFF',
      borderRadius: 9,
      padding:      '16px 20px',
      position:     'relative',
      overflow:     'hidden',
      // 卡片本身不用阴影，靠 Tonal Layering 浮起
    }}>
      {/* 背景水印 Signal Icon（5% opacity，"高科技"纵深感）*/}
      {icon && (
        <div style={{
          position:      'absolute',
          right:         16,
          bottom:        8,
          fontSize:      56,
          opacity:       0.05,
          color:         color,
          lineHeight:    1,
          pointerEvents: 'none',
          userSelect:    'none',
        }}>
          {icon}
        </div>
      )}

      {/* 标签 */}
      <div style={{ fontSize: 12, color: '#7E8494', marginBottom: 6 }}>{label}</div>

      {/* 大指标（Display-SM 对应，28px 700）*/}
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.2 }}>
        {value}
      </div>

      {/* 趋势（可选）*/}
      {trend && (
        <div style={{
          marginTop: 6,
          fontSize:  12,
          color:     trend.up ? 'var(--risk-high)' : '#16A34A',
        }}>
          {trend.up ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  );
}

// 使用示例
<SentinelCard
  label="今日告警"
  value="47"
  color="var(--risk-high)"
  icon={<WarningOutlined />}
  trend={{ value: '+12%', up: true }}
/>
```

---

### 6.4 图表 Glow Strokes 规范（ECharts）

面积图使用品牌色系 Glow 线 + 渐变填充，不用纯色平面图表。

```ts
// echarts-sentinel-theme.ts
import { ComposeOption } from 'echarts/core';
import { LineSeriesOption } from 'echarts/charts';

const BRAND_COLOR = '#3B71EE';

// Glow Area Chart 系列配置
export const glowAreaSeries = (data: number[]): LineSeriesOption => ({
  type: 'line',
  data,
  smooth: true,
  symbol: 'none',

  // Glow Stroke：品牌色线 + 外发光
  lineStyle: {
    color:  BRAND_COLOR,
    width:  2,
    // ECharts shadowBlur 模拟 glow
    shadowColor: 'rgba(59, 113, 238, 0.50)',
    shadowBlur:  8,
    shadowOffsetY: 0,
  },

  // 渐变填充：品牌色 20% → 透明
  areaStyle: {
    color: {
      type: 'linear',
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0,   color: 'rgba(59, 113, 238, 0.20)' },
        { offset: 0.8, color: 'rgba(59, 113, 238, 0.04)' },
        { offset: 1,   color: 'rgba(59, 113, 238, 0.00)' },
      ],
    },
  },
});

// Donut Chart 配置（厚描边 + 圆角端点）
export const donutSeriesOption = {
  type: 'pie',
  radius:     ['55%', '75%'],
  // 厚描边圆角
  itemStyle: {
    borderRadius: 8,
    borderColor:  '#F7FAFD',
    borderWidth:  3,
  },
  label: { show: false },
};

// 通用 Grid / Axis 配置（无轴线，靠背景差）
export const sentinelAxisBase = {
  axisLine:  { show: false },
  axisTick:  { show: false },
  splitLine: { show: false },          // No-Line Rule：不显示网格线
  axisLabel: {
    color:    '#7E8494',
    fontSize: 11,
  },
};
```

---

## 参考文档

- 详细 Token 映射与覆盖规则：[layout-tokens.md](layout-tokens.md)
- Sentinel Aesthetic 原始规范：`stitch_prd/DESIGN.md`
- 项目品牌色来源：`project_description.md → Pencil Token Values`
