# SQL转API Pencil设计稿规范

> 本文档描述SQL转API模块的3个页面的完整设计规范,用于在Pencil中创建设计稿或指导前端开发。

---

## 设计Token

基于项目规范([project_description.md](../../project_description.md)):

| Pencil Variable | 值 | 用途 |
|---|---|---|
| color/brand/normal | #3B71EE | 品牌主色(按钮/链接/高亮) |
| color/brand/hover | #5488F0 | 品牌色悬停 |
| color/brand/active | #2D5FD4 | 品牌色激活 |
| color/brand/light | #E8F0FE | 品牌色浅色背景 |
| color/status/success | #52c41a | 成功状态(已发布) |
| color/status/warning | #faad14 | 警告状态(草稿/审批中) |
| color/status/error | #f5222d | 错误状态(已停用/高风险) |
| color/bg/page | #F7FAFD | 页面背景 |
| color/bg/component | #FFFFFF | 卡片背景 |
| radius/lg | 12 | 卡片圆角 |
| radius/xs | 4 | 输入框/标签圆角 |
| font/size/base | 14 | 基准字号 |

---

## 页面1: API列表页

### 画板规格
- **名称**: SQL转API - 列表页
- **尺寸**: 1440 × 900
- **路由**: `/sql-to-api`

### 布局结构

```
┌─────────────────────────────────────────────┐
│  Page Header                                 │
│  标题: SQL转API                              │
│  副标题: 将SQL语句快速转换为RESTful API      │
├─────────────────────────────────────────────┤
│  卡片1: 搜索与操作区                         │
│  ┌───────────────────────────────────────┐  │
│  │ [创建API] [批量删除(2)]               │  │
│  │                                       │  │
│  │ [🔍 搜索API名称/路径/创建人] [状态▼] │  │
│  │ [重置]                                │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  卡片2: 表格区                               │
│  ┌───────────────────────────────────────┐  │
│  │ ☑ │ API名称 │ 路径 │ 方法 │ 风险 │...│  │
│  │───┼─────────┼──────┼──────┼──────┼───│  │
│  │ □ │ 查询用户│/api/v│ GET  │ 低   │...│  │
│  │   │ 列表    │1/us...│      │      │   │  │
│  │───┼─────────┼──────┼──────┼──────┼───│  │
│  │ □ │ 创建订单│/api/v│ POST │ 高   │...│  │
│  │   │         │1/or...│      │      │   │  │
│  └───────────────────────────────────────┘  │
│  共 5 条 [< 1 2 >] 每页10条                 │
└─────────────────────────────────────────────┘
```

### 详细组件规范

#### 1. 页面标题区
- **标题**: "SQL转API", font/size/display (20px), font-weight: 600
- **副标题**: "将SQL语句快速转换为RESTful API", font/size/sm (12px), color: $color/text/secondary

#### 2. 搜索与操作区卡片
- **容器**: Card, padding: 16px, background: $color/bg/component, border-radius: $radius/lg
- **主操作按钮**: 
  - "创建API", type: primary, icon: PlusOutlined, color: $color/brand/normal
  - "批量删除", type: default, danger, icon: DeleteOutlined (仅选中时显示)
- **搜索框**: 
  - Input, width: 300px, placeholder: "搜索API名称/路径/创建人"
  - prefix icon: SearchOutlined
- **状态筛选**: 
  - Select, width: 120px, placeholder: "状态筛选"
  - Options: 草稿/已发布/已停用/审批中
  - allowClear: true
- **重置按钮**: type: default, icon: ReloadOutlined

#### 3. 表格区卡片
- **容器**: Card, padding: 0, background: $color/bg/component, border-radius: $radius/lg
- **Table组件**:
  - 行选择: checkbox, 固定左列
  - 列定义:
    1. API名称: width 200px, ellipsis, 可点击(蓝色链接)
    2. API路径: width 250px, ellipsis, 等宽字体
    3. 请求方法: width 100px, Tag组件(GET=blue, POST=purple)
    4. 安全等级: width 100px, Tag组件(低=green, 中=orange, 高=red)
    5. 状态: width 100px, Tag组件(草稿=gold, 已发布=green, 已停用=default, 审批中=blue)
    6. 创建人: width 100px
    7. 更新时间: width 180px
    8. 操作: width 200px, fixed: right, 操作项: 编辑 | 调试 | 删除
  - 分页:
    - showSizeChanger: true
    - showQuickJumper: true
    - showTotal: "共 X 条"
    - pageSizeOptions: ['10', '20', '50', '100']

#### 4. 状态标签映射
| 状态 | Tag颜色 | 文案 |
|---|---|---|
| draft | gold | 草稿 |
| active | green | 已发布 |
| deprecated | default | 已停用 |
| pending_approval | blue | 审批中 |

#### 5. 安全等级标签映射
| 等级 | Tag颜色 | 文案 |
|---|---|---|
| low | green | 低风险 |
| medium | orange | 中风险 |
| high | red | 高风险 |

---

## 页面2: 创建/编辑API抽屉

### 画板规格
- **名称**: SQL转API - 创建/编辑抽屉
- **尺寸**: Drawer, width: 720px
- **位置**: 右侧滑入

### 布局结构

```
┌────────────────────────────────────┐
│  创建API                      [×] │
├────────────────────────────────────┤
│  SQL语句 *                         │
│  ┌──────────────────────────────┐ │
│  │ SELECT * FROM users          │ │
│  │ WHERE status = ${status}     │ │
│  │ ORDER BY create_time DESC    │ │
│  └──────────────────────────────┘ │
│  [⚠️ 高风险操作警告条]             │
│                                    │
│  ──── API配置 ────                 │
│                                    │
│  API名称 *                         │
│  [查询用户列表            ]        │
│                                    │
│  API路径 *                         │
│  [/api/v1/users/query     ]        │
│                                    │
│  请求方法 *                        │
│  [GET (查询)              ▼]       │
│                                    │
│  API描述                           │
│  [根据条件查询用户信息    ]        │
│                                    │
│  ──── 参数列表 (1) ────            │
│                                    │
│  ┌──────────────────────────────┐ │
│  │参数名│类型│必填│默认值│说明  │ │
│  │──────┼────┼────┼──────┼─────│ │
│  │${st…│Str │ ☑  │acti…│用户… │ │
│  │      │[▼] │    │      │      │ │
│  └──────────────────────────────┘ │
│                                    │
│  [取消]          [保存]            │
└────────────────────────────────────┘
```

### 详细组件规范

#### 1. Drawer头部
- **标题**: "创建API" 或 "编辑API" (根据上下文)
- **关闭按钮**: 右上角 × 图标
- **宽度**: 720px

#### 2. SQL编辑器区
- **标签**: "SQL语句" + 红色星号(*)
- **输入控件**: TextArea
  - rows: 8
  - fontFamily: monospace
  - fontSize: 14px
  - placeholder: "请输入SQL语句,例如: SELECT * FROM users WHERE status = ${status}"
- **错误提示**: Alert (type: error), 显示在TextArea下方
  - 示例: "第3行第15列: 缺少FROM关键字"

#### 3. 安全等级警告条
- **条件**: 当SQL包含DELETE/UPDATE/DROP/TRUNCATE时显示
- **组件**: Alert (type: warning)
- **图标**: ExclamationCircleOutlined
- **文案**: "高风险操作 - 该SQL包含DELETE/UPDATE等危险操作,保存后需要管理员审批才能发布。"

#### 4. API基础信息表单
- **分隔线**: Divider, 文案: "API配置"
- **表单布局**: vertical
- **字段**:
  1. **API名称**: Input, required, maxLength: 50
  2. **API路径**: Input, required, placeholder: "/api/v1/users/query"
  3. **请求方法**: Select, required, options: [GET (查询), POST (新增)]
  4. **API描述**: TextArea, optional, rows: 2, maxLength: 200

#### 5. 参数配置表格
- **分隔线**: Divider, 文案: "参数列表 (X)"
- **空状态**: Alert (type: info), 文案: "暂无参数 - 在SQL语句中使用 ${参数名} 格式可自动提取参数"
- **表格列**:
  1. 参数名: Tag (color: blue), 显示格式: ${paramName}
  2. 类型: Select (string/number/boolean/array), width: 100px
  3. 必填: Checkbox, width: 80px
  4. 默认值: Input, placeholder: "可选", width: 120px
  5. 说明: Input, placeholder: "参数说明"
- **表格属性**: size: small, pagination: false, scroll.y: 300

#### 6. Drawer底部操作区
- **布局**: flex, justifyContent: flex-end, gap: 8px
- **按钮**:
  - "取消": type: default
  - "保存": type: primary, icon: SaveOutlined, loading状态

---

## 页面3: API调试页

### 画板规格
- **名称**: SQL转API - API调试页
- **尺寸**: 1440 × 900
- **路由**: `/sql-to-api/debug/:id`

### 布局结构

```
┌─────────────────────────────────────────────────┐
│  API信息卡片                                     │
│  ┌───────────────────────────────────────────┐ │
│  │ API名称: 查询用户列表    [GET]            │ │
│  │ API路径: /api/v1/users/query              │ │
│  │ 安全等级: [低风险]                        │ │
│  └───────────────────────────────────────────┘ │
├──────────────────────┬────────────────────────┤
│  请求参数卡片        │  响应结果卡片          │
│  ┌────────────────┐ │  ┌──────────────────┐ │
│  │ [重置] [发送]  │ │  │ 请求中...        │ │
│  │                │ │  │ ⏳               │ │
│  │ status *       │ │  └──────────────────┘ │
│  │ [active    ]   │ │  或                   │
│  │ 用户状态:      │ │  ┌──────────────────┐ │
│  │ active/inact…  │ │  │ ✅ 成功 156ms 2条│ │
│  │                │ │  │                  │ │
│  │                │ │  │ {                │ │
│  │                │ │  │   "success":true,│ │
│  │                │ │  │   "data": [...]  │ │
│  │                │ │  │ }                │ │
│  │                │ │  └──────────────────┘ │
│  └────────────────┘ │                        │
└──────────────────────┴────────────────────────┘
```

### 详细组件规范

#### 1. API信息卡片
- **标题**: "API信息"
- **extra**: Tag显示HTTP方法 (GET=blue, POST=purple)
- **内容**: Descriptions组件, column: 3
  - API名称
  - API路径
  - 安全等级: Tag组件 (低=green, 中=orange, 高=red)

#### 2. 请求参数卡片 (左侧)
- **标题**: "请求参数"
- **extra操作区**:
  - "重置"按钮: icon: ReloadOutlined
  - "发送请求"按钮: type: primary, icon: PlayCircleOutlined, loading状态
- **表单**:
  - 布局: vertical
  - 动态生成: 根据API的parameters数组渲染表单项
  - 每个参数:
    - Label: 参数名 + Tag(类型) + Tag(必填,红色)
    - Input控件
    - extra: 参数描述
    - rules: 必填校验
- **无参数时**: Alert (type: info), 文案: "无需参数 - 该API不需要输入参数,直接点击发送请求即可"

#### 3. 响应结果卡片 (右侧)
- **标题**: "响应结果"
- **三种状态**:
  
  **状态1: 加载中**
  - Spin组件, size: large, tip: "请求中..."
  - 居中显示, padding: 60px 0
  
  **状态2: 请求失败**
  - Alert (type: error)
  - icon: CloseCircleOutlined
  - message: "请求失败"
  - description: 错误信息
  
  **状态3: 请求成功**
  - **性能指标区**: Space组件
    - Tag (green, icon: CheckCircleOutlined): "状态: 成功"
    - Tag (icon: ClockCircleOutlined): "耗时: 156ms"
    - Tag: "数据量: 2 条"
  - **JSON响应区**: 
    - Card (size: small, background: #fafafa)
    - pre标签, fontSize: 12px, maxHeight: 400px, overflow: auto
    - 内容: JSON.stringify(response, null, 2)
  
  **状态4: 初始状态**
  - Empty组件, description: '点击"发送请求"查看结果'

---

## 交互说明

### 列表页交互
1. **创建API**: 点击"创建API" → 打开空抽屉
2. **编辑API**: 点击表格中API名称或"编辑"按钮 → 打开填充数据的抽屉
3. **调试API**: 点击"调试"按钮 → 跳转到调试页
4. **删除API**: 点击"删除" → Modal确认 → 删除成功刷新列表
5. **批量删除**: 勾选多条 → 显示"批量删除"按钮 → Modal确认
6. **搜索**: 输入关键词按Enter或点击搜索按钮
7. **筛选**: 选择状态自动触发搜索
8. **重置**: 清空搜索和筛选条件

### 抽屉交互
1. **SQL变更**: 输入SQL时自动提取${paramName}参数
2. **参数编辑**: 可修改参数类型/必填/默认值/说明
3. **安全评估**: SQL变更时自动评估风险等级
4. **保存校验**: 校验SQL语法和必填字段
5. **关闭确认**: 有未保存内容时提示

### 调试页交互
1. **参数输入**: 动态表单,支持各种参数类型
2. **发送请求**: 显示loading,30秒超时
3. **重置**: 清空参数和响应结果
4. **响应展示**: JSON格式化,支持展开/折叠

---

## 响应式规则

- **列表页表格**: 
  - 视口 < 1200px: 显示横向滚动条
  - 操作列固定右侧
  
- **抽屉**:
  - 桌面: width 720px
  - 平板: width 100%
  
- **调试页**:
  - 桌面: 左右分栏 (1:1)
  - 平板: 上下堆叠

---

## 颜色使用规范

### 允许使用裸hex的场景
- 导航渐变背景
- 阴影effect的color字段
- 透明色用"transparent"

### 必须使用变量的场景
- 品牌色: $color/brand/normal
- 状态色: $color/status/success
- 背景色: $color/bg/page
- 文本色: $color/text/primary

---

## 版本历史

| 版本 | 日期 | 说明 |
|---|---|---|
| v1.0 | 2026-05-22 | 初始设计稿,包含3个页面 |
