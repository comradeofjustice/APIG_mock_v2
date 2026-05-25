# SQL转API Pencil设计稿 - 手动重建指南

> **问题说明**: 之前自动生成的设计稿位置混乱、元素重叠。本文档提供精确坐标和尺寸,用于在Pencil中手动重建或调试。

---

## 画板1: SQL转API - 列表页

### 画板基础设置
- **ID**: `listPage`
- **X**: 0
- **Y**: 0
- **Width**: 1440
- **Height**: 900
- **Fill**: `#F7FAFD`

### 元素清单(按层级)

#### 1. 页面标题区
```
Frame: header
  X: 0, Y: 0, Width: 1440, Height: 80
  Padding: 24
  
  Text: title
    X: 24, Y: 24, Width: auto, Height: auto
    Content: "SQL转API"
    FontSize: 20, FontWeight: 600, Color: #262626
  
  Text: subtitle
    X: 24, Y: 56, Width: auto, Height: auto
    Content: "将SQL语句快速转换为RESTful API"
    FontSize: 12, Color: #8c8c8c
```

#### 2. 搜索操作区卡片
```
Frame: searchCard
  X: 24, Y: 104, Width: 1392, Height: 160
  Fill: #FFFFFF
  CornerRadius: 12
  Padding: 24
  
  Frame: actionBar
    X: 24, Y: 24, Width: 1344, Height: 40
    Gap: 12
    
    Button: createBtn
      Width: 120, Height: 32
      Fill: #3B71EE
      CornerRadius: 4
      Text: "+ 创建API" (白色, 14px, 居中)
    
    Button: batchDeleteBtn
      Width: 120, Height: 32
      Fill: #FFFFFF
      Border: 1px solid #d9d9d9
      CornerRadius: 4
      Text: "批量删除" (红色 #f5222d, 14px, 居中)
      Note: 此按钮仅在有选中项时显示
  
  Frame: filterBar
    X: 24, Y: 80, Width: 1344, Height: 56
    Gap: 12
    
    Input: searchInput
      X: 0, Y: 0, Width: 300, Height: 32
      Fill: #F5F5F5
      CornerRadius: 4
      Text: "🔍 搜索API名称/路径/创建人" (灰色 #bfbfbf)
    
    Select: statusFilter
      X: 312, Y: 0, Width: 120, Height: 32
      Fill: #FFFFFF
      Border: 1px solid #d9d9d9
      CornerRadius: 4
      Text: "状态筛选 ▼"
    
    Button: resetBtn
      X: 444, Y: 0, Width: 80, Height: 32
      Fill: #FFFFFF
      Border: 1px solid #d9d9d9
      CornerRadius: 4
      Text: "🔄 重置"
```

#### 3. 表格区卡片
```
Frame: tableCard
  X: 24, Y: 288, Width: 1392, Height: 580
  Fill: #FFFFFF
  CornerRadius: 12
  
  Table Header Row:
    Y: 0, Height: 48
    Background: #FAFAFA
    
    Columns (从左到右):
    1. Checkbox: X: 16, Width: 24
    2. API名称: X: 48, Width: 200, Font: 14px 黑色
    3. API路径: X: 264, Width: 250, Font: 13px 等宽字体 #595959
    4. 请求方法: X: 530, Width: 100
    5. 安全等级: X: 646, Width: 100
    6. 状态: X: 762, Width: 100
    7. 创建人: X: 878, Width: 100
    8. 更新时间: X: 994, Width: 150
    9. 操作: X: 1160, Width: 200, fixed: right
  
  Row 1 (示例数据):
    Y: 48, Height: 64
    Background: #FFFFFF (hover: #F5F5F5)
    
    - Checkbox: X: 16, Y: 20
    - API名称: "查询用户列表" (蓝色链接 #3B71EE)
    - API路径: "/api/v1/users/list" (等宽字体)
    - 请求方法: Tag "GET" (蓝色背景 #e6f7ff, 蓝色文字 #1890ff)
    - 安全等级: Tag "低风险" (绿色背景 #f6ffed, 绿色文字 #52c41a)
    - 状态: Tag "已发布" (绿色背景 #f6ffed, 绿色文字 #52c41a)
    - 创建人: "张三"
    - 更新时间: "2026-05-22 10:30:00"
    - 操作: "编辑 | 调试 | 删除" (蓝色链接,间距8px)
  
  Row 2 (示例数据):
    Y: 112, Height: 64
    Background: #FFFFFF
    
    - Checkbox: X: 16, Y: 20
    - API名称: "创建订单" (蓝色链接)
    - API路径: "/api/v1/orders/create"
    - 请求方法: Tag "POST" (紫色背景 #f9f0ff, 紫色文字 #722ed1)
    - 安全等级: Tag "高风险" (红色背景 #fff1f0, 红色文字 #f5222d)
    - 状态: Tag "草稿" (金色背景 #fffbe6, 金色文字 #faad14)
    - 创建人: "李四"
    - 更新时间: "2026-05-22 09:15:00"
    - 操作: "编辑 | 调试 | 删除"
  
  Pagination:
    Y: 540, Height: 40
    Text: "共 5 条"
    Buttons: "<  1  2  >"
    Select: "每页10条 ▼"
```

---

## 画板2: SQL转API - API调试页

### 画板基础设置
- **ID**: `debugPage`
- **X**: 1500 (画板1右侧,留60px间距)
- **Y**: 0
- **Width**: 1440
- **Height**: 900
- **Fill**: `#F7FAFD`

### 元素清单

#### 1. 页面标题区
```
Frame: debugHeader
  X: 0, Y: 0, Width: 1440, Height: 80
  Padding: 24
  
  Text: title
    Content: "调试: 查询用户列表"
    FontSize: 20, FontWeight: 600
  
  Tag: methodTag
    Text: "GET"
    Fill: #e6f7ff, Color: #1890ff
  
  Tag: statusTag
    Text: "已发布"
    Fill: #f6ffed, Color: #52c41a
  
  Breadcrumb: backLink
    Text: "← 返回列表"
    Color: #3B71EE (可点击)
```

#### 2. 调试内容区(左右分栏)
```
Frame: debugContent
  X: 24, Y: 104, Width: 1392, Height: 772
  Gap: 24
  Layout: horizontal
  
  ──── 左侧: 请求参数区 (Width: 684) ────
  Frame: requestPanel
    Width: 684, Height: 772
    Fill: #FFFFFF
    CornerRadius: 12
    Padding: 24
    
    Text: panelTitle
      Content: "请求参数"
      FontSize: 16, FontWeight: 600
      Y: 24
    
    Form: parameterForm
      Y: 64
      Label Width: 120px
      
      Field 1:
        Label: "status"
        Input: Select下拉框, Width: 400
        Options: ["全部", "启用", "停用"]
        Value: "全部"
        Required: 红色星号
      
      Field 2:
        Label: "page"
        Input: 数字输入框, Width: 400
        Value: 1
        Placeholder: "页码"
      
      Field 3:
        Label: "pageSize"
        Input: 数字输入框, Width: 400
        Value: 10
        Placeholder: "每页条数"
      
      Field 4:
        Label: "keyword"
        Input: 文本输入框, Width: 400
        Placeholder: "搜索关键词(可选)"
    
    Button: sendBtn
      Y: 340, Width: 120, Height: 32
      Fill: #3B71EE
      Text: "▶ 发送请求"
      Color: #FFFFFF
  
  ──── 右侧: 响应结果区 (Width: 684) ────
  Frame: responsePanel
    Width: 684, Height: 772
    Fill: #FFFFFF
    CornerRadius: 12
    Padding: 24
    
    Text: panelTitle
      Content: "响应结果"
      FontSize: 16, FontWeight: 600
      Y: 24
    
    Frame: responseMeta
      Y: 64, Width: 636, Height: 40
      Gap: 24
      
      Tag: statusBadge
        Text: "✓ 200 OK"
        Fill: #f6ffed, Color: #52c41a
      
      Text: timeInfo
        Text: "耗时: 156ms"
        Color: #8c8c8c
      
      Text: sizeInfo
        Text: "大小: 2.3KB"
        Color: #8c8c8c
    
    Frame: codeBlock
      Y: 120, Width: 636, Height: 628
      Fill: #F5F5F5
      CornerRadius: 8
      Padding: 16
      
      Text: codeContent (等宽字体)
        Content: |
          {
            "success": true,
            "data": [
              {
                "id": 1,
                "name": "张三",
                "status": "启用",
                "email": "zhangsan@example.com"
              },
              {
                "id": 2,
                "name": "李四",
                "status": "启用",
                "email": "lisi@example.com"
              }
            ],
            "total": 2,
            "executionTime": 156
          }
        FontFamily: "Consolas" 或 "Monaco"
        FontSize: 12
        Color: #262626
```

---

## 画板3: SQL转API - 创建/编辑抽屉

### 画板基础设置
- **ID**: `drawerPage`
- **X**: 3000 (画板2右侧,留60px间距)
- **Y**: 0
- **Width**: 1440
- **Height**: 900
- **Fill**: `#F7FAFD`

### 元素清单

#### 1. 模拟遮罩背景
```
Frame: drawerOverlay
  X: 0, Y: 0, Width: 1440, Height: 900
  Fill: rgba(0,0,0,0.45)  // 半透明黑色
```

#### 2. 抽屉本体(从右侧滑入,宽度720px)
```
Frame: drawer
  X: 720, Y: 0, Width: 720, Height: 900
  Fill: #FFFFFF
  
  ──── 抽屉头部 ────
  Frame: drawerHeader
    X: 0, Y: 0, Width: 720, Height: 64
    BorderBottom: 1px solid #F0F0F0
    Padding: 24
    
    Text: drawerTitle
      Content: "创建API"
      FontSize: 16, FontWeight: 600
    
    Button: closeBtn
      X: 672, Y: 20, Width: 24, Height: 24
      Text: "✕"
      FontSize: 14, Color: #8c8c8c
  
  ──── 抽屉内容区(可滚动) ────
  Frame: drawerBody
    X: 0, Y: 64, Width: 720, Height: 756
    Padding: 24
    
    Section 1: SQL语句
      Form Item:
        Label: "SQL语句" + 红色星号(必填)
        Y: 24
        
        TextArea: sqlEditor
          Width: 672, Height: 180
          Fill: #FFFFFF
          Border: 1px solid #d9d9d9
          CornerRadius: 4
          Padding: 12
          FontFamily: "Consolas" (等宽字体)
          FontSize: 13
          Content: |
            SELECT * FROM users
            WHERE status = ${status}
            ORDER BY create_time DESC
          Placeholder: "请输入SQL语句,支持参数化查询 ${paramName}"
        
        Alert: securityWarning
          Y: 212, Width: 672, Height: 40
          Fill: #fff2e8 (橙色背景)
          BorderLeft: 4px solid #fa8c16
          Padding: 8
          Icon: "⚠️"
          Text: "高风险操作:包含全表查询,建议添加WHERE条件限制数据范围"
          Color: #ad6700
    
    Section 2: API配置
      Divider: Y: 268, Text: "API配置"
      
      Form Item 1:
        Label: "API名称" + 红色星号
        Y: 300
        
        Input: apiNameInput
          Width: 672, Height: 32
          Value: "查询用户列表"
          Placeholder: "请输入API名称"
      
      Form Item 2:
        Label: "API路径" + 红色星号
        Y: 356
        
        Input: apiPathInput
          Width: 672, Height: 32
          Value: "/api/v1/users/query"
          Placeholder: "/api/v1/{resource}/{action}"
          HelpText: "建议格式: /api/v1/资源/操作"
          Color: #8c8c8c, FontSize: 12
      
      Form Item 3:
        Label: "请求方法" + 红色星号
        Y: 420
        
        RadioGroup: methodRadio
          Width: 672, Height: 32
          Options: 
            - "GET" (选中,蓝色 #3B71EE)
            - "POST"
      
      Form Item 4:
        Label: "安全等级"
        Y: 476
        
        Select: securitySelect
          Width: 672, Height: 32
          Value: "低风险"
          Options: ["低风险", "中风险", "高风险"]
    
    Section 3: 参数配置
      Divider: Y: 532, Text: "参数配置 (自动提取)"
      
      Frame: paramTable
        Y: 564, Width: 672, Height: 140
        Border: 1px solid #F0F0F0
        
        Table Header:
          Height: 40, Background: #FAFAFA
          Columns:
            - 参数名称 (Width: 150)
            - 类型 (Width: 100)
            - 位置 (Width: 100)
            - 必填 (Width: 60)
            - 示例值 (Width: 150)
            - 操作 (Width: 112)
        
        Row 1:
          Height: 50
          - "status" (等宽字体)
          - Tag "String" (灰色背景)
          - "query"
          - Checkbox ✓
          - "启用"
          - "编辑 | 删除" (蓝色链接)
        
        Row 2:
          Height: 50
          - "create_time"
          - Tag "Date"
          - "query"
          - Checkbox ☐
          - "2026-01-01"
          - "编辑 | 删除"
  
  ──── 抽屉底部(固定) ────
  Frame: drawerFooter
    X: 0, Y: 820, Width: 720, Height: 80
    BorderTop: 1px solid #F0F0F0
    Padding: 16 24
    Gap: 12
    
    Button: cancelBtn
      Width: 80, Height: 32
      Fill: #FFFFFF
      Border: 1px solid #d9d9d9
      Text: "取消"
    
    Button: submitBtn
      Width: 120, Height: 32
      Fill: #3B71EE
      Text: "保存并预览"
      Color: #FFFFFF
```

---

## 关键设计规范

### 间距系统
- **大间距**: 24px (区块之间)
- **中间距**: 16px (卡片内边距)
- **小间距**: 12px (表单项之间)
- **极小间距**: 8px (按钮组、链接之间)

### 字体规范
- **页面标题**: 20px, 600字重
- **区块标题**: 16px, 600字重
- **正文/表格**: 14px, 400字重
- **辅助文字**: 12px, 400字重, #8c8c8c
- **代码/路径**: 13px, Consolas等宽字体

### 颜色规范
- **品牌色**: #3B71EE (主按钮、链接)
- **成功**: #52c41a (已发布状态)
- **警告**: #faad14 (草稿状态)
- **错误**: #f5222d (高风险、删除)
- **背景**: #F7FAFD (页面)、#FFFFFF (卡片)
- **边框**: #d9d9d9 (默认)、#F0F0F0 (分割线)

### Tag标签配色
| 类型 | 背景色 | 文字色 |
|---|---|---|
| GET | #e6f7ff | #1890ff |
| POST | #f9f0ff | #722ed1 |
| 低风险 | #f6ffed | #52c41a |
| 高风险 | #fff1f0 | #f5222d |
| 已发布 | #f6ffed | #52c41a |
| 草稿 | #fffbe6 | #faad14 |

---

## 使用指南

### 在Pencil中手动创建步骤

1. **打开Pencil桌面应用**
2. **新建文档**: `design/SQL转API.pen`
3. **按画板顺序创建**:
   - 画板1 (X:0-1440): 列表页
   - 画板2 (X:1500-2940): 调试页
   - 画板3 (X:3000-4440): 抽屉页

4. **每个画板内的创建顺序**:
   - 先创建最大的容器Frame
   - 再添加内部元素
   - 最后添加文字和图标

5. **关键检查点**:
   - 所有Frame的X/Y坐标都是**相对于父容器**的
   - 画板级别的X/Y是**绝对坐标**
   - 确保Padding和Gap正确设置
   - 颜色值使用**十六进制格式**

### 调试建议

如果元素仍然重叠或位置不对:

1. **检查坐标系**: Pencil使用左上角为原点(0,0)
2. **关闭自动布局**: 对于复杂嵌套,先用absolute定位,再改为layout
3. **使用对齐工具**: Pencil的Align面板可以快速对齐元素
4. **查看层级关系**: Layers面板确认父子关系正确
5. **导出测试**: 每完成一个画板就导出PNG,确认效果

---

## 下一步建议

由于Pencil MCP工具连接不稳定,建议:

1. **方案A**: 使用本文档在Pencil中手动重建
2. **方案B**: 直接使用已生成的React代码(位置精确,可直接运行)
3. **方案C**: 等待Pencil MCP修复后重新自动生成

**推荐使用方案B**: 代码已完整实现所有交互逻辑,且位置精确。
