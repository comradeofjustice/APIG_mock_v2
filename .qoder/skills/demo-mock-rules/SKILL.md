---
name: demo-mock-rules
description: 项目 Demo 规则与 Mock 数据规范。约束列表页标题规则和 Mock 数据生成方式。当用户开发列表页、表格页、新增页面，或提到"Demo项目"、"Demo数据"、"Mock数据"、"假数据"、"模拟数据"时自动应用。
---

# Demo 项目规则

## 规则 1: 列表页标题规则

- **普通列表页**不需要手动添加页面标题（如 PageHeader、Card title、h1/h2 标签等）
- **例外情况**才需要标题：
  - 详情页/编辑页
  - 用户特别要求添加标题
  - 布局无法自动承载标题的场景
- 页面标题应由布局系统或路由配置自动承载

## 规则 2: Mock 数据规范

本项目为 Demo 项目，**所有数据必须使用 Mock 数据**，包括所有交互后的数据流转。

### 基本原则

| 场景 | 要求 |
|------|------|
| 初始数据 | 全部使用 Mock 数据 |
| 新增操作 | 模拟新增后的数据追加，返回值从 mock 数据池生成 |
| 编辑操作 | 模拟编辑后的数据更新，mock 数据池同步变更 |
| 删除操作 | 模拟删除后的数据移除，mock 数据池同步变更 |
| 查询/筛选 | 模拟查询逻辑，从 mock 数据池中过滤返回 |
| 分页 | 模拟分页逻辑，mock 数据池支持分页切片 |

### 数据状态覆盖

Mock 数据需覆盖以下状态：

- **空态**（empty）：列表无数据时展示空状态占位
- **加载态**（loading）：模拟异步请求的加载延迟
- **正常态**（normal）：正常数据展示
- **边界态**（boundary）：长文本、特殊字符、最大值等

### Mock 数据生成

```bash
# 使用脚本生成标准 Mock 数据
node .qoder/skills/demo-mock-rules/scripts/mock-data-generator.js
```

### Mock 实现方式

**推荐方式**: 在 `src/` 目录下创建 `mock/` 文件夹，按模块组织 mock 数据：

```
src/
└── mock/
    ├── index.ts              # Mock 数据入口，统一导出
    ├── approval/
    │   ├── tasks.ts          # 审批任务 Mock 数据
    │   ├── rules.ts          # 审批规则 Mock 数据
    │   └── applications.ts   # 我的申请 Mock 数据
    └── home/
        └── dashboard.ts      # 首页仪表盘 Mock 数据
```

**实现模式示例**:

```typescript
// src/mock/approval/tasks.ts
import { MockUtil } from '../utils';

// 初始 Mock 数据池
let tasks = [
  { id: '1', title: '示例任务', status: 'pending', createTime: '2026-01-01' },
  // ... 更多数据
];

// 模拟新增
export function addTask(data) {
  const newTask = { id: MockUtil.uuid(), ...data, createTime: new Date() };
  tasks.push(newTask);
  return { success: true, data: newTask };
}

// 模拟编辑
export function updateTask(id, data) {
  const index = tasks.findIndex(t => t.id === id);
  if (index > -1) {
    tasks[index] = { ...tasks[index], ...data };
    return { success: true, data: tasks[index] };
  }
  return { success: false, message: '未找到' };
}

// 模拟删除
export function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  return { success: true };
}

// 模拟查询/分页
export function queryTasks(params) {
  let filtered = [...tasks];
  // 模拟筛选逻辑
  if (params.status) filtered = filtered.filter(t => t.status === params.status);
  // 模拟分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}
```

## 检查清单

在完成页面开发后，对照检查：

- [ ] 列表页没有手动添加多余的标题
- [ ] 所有数据使用 Mock，没有真实 API 调用
- [ ] 新增/编辑/删除操作后，Mock 数据池同步更新
- [ ] 覆盖了空态、加载态、正常态
- [ ] 使用了 `scripts/mock-data-generator.js` 生成标准数据
