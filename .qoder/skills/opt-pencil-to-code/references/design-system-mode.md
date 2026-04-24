# Design-System 模式 — 设计系统对齐

> 适用场景：同时激活了 `b-admin-design-system` skill，项目使用 `das-component-vue` 组件库。
> 核心原则：**用 Pencil 设计稿理解页面结构和交互意图，但代码中使用标准组件库实现。**

---

## 与 faithful 模式的关键区别

| 对比项 | faithful 模式 | design-system 模式 |
|--------|-------------|-------------------|
| 颜色 | Pencil 中的 hex 值 | `var(--token-name)` CSS Token |
| 组件 | HTML 原生元素 | `das-component-vue` 专属组件 |
| 样式来源 | 从设计稿抄数值 | 从设计系统规范取值 |
| 优先级 | 设计稿 > 规范 | 规范 > 设计稿 |

---

## 从 Pencil 节点映射到 das-component-vue 组件

读取画板节点时，根据节点名称和结构映射到对应组件：

| Pencil 节点特征 | 使用的组件 |
|----------------|-----------|
| 节点名含 `DasSearchBar` 或搜索工具栏结构 | `<DasSearchBar>` |
| 节点名含 `DasTable` 或表格结构 | `<DasTable>` |
| 节点名含 `DasMetricCard` 或指标卡片 | `<DasMetricCard>` |
| 节点名含 `DasDetail` 或详情键值对 | `<DasDetail>` |
| 节点名含 `DasFormGroup` | `<DasFormGroup>` |
| 节点名含 `DasTabs` 或 Tab 标签 | `<DasTabs>` |
| 节点名含 `DasEmpty` 或空状态 | `<DasEmpty>` |
| 节点名含 `DasAlert` | `<DasAlert>` |
| 普通按钮（primary/default/danger） | `<a-button>` + `type` prop |
| 侧边导航 | `<DasMenu>` |
| Modal 弹窗 | `<a-modal>` |
| Drawer 侧滑 | `<a-drawer>` |

---

## 读取设计系统 skill 的方法

在读取 Pencil 画板的同时，从 `b-admin-design-system` skill 中获取对应组件的代码规范：

```
需要哪个组件 → 读取对应的组件规范文件：
- DasSearchBar → b-admin-design-system/core/components/forms-advanced.md
- DasTable     → b-admin-design-system/core/components/tables-pagination.md  
- 按钮         → b-admin-design-system/core/components/buttons.md
- 卡片         → b-admin-design-system/core/components/cards.md
```

---

## 代码生成策略

### 组件导入
```vue
<script setup lang="ts">
import {
  DasSearchBar,
  DasTable,
  DasMetricCard,
  DasDetail,
  DasTabs
} from 'das-component-vue'
</script>
```

### 样式使用 Token
```vue
<style scoped>
.page-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--color-bg-container);
  border-bottom: 1px solid var(--color-border-secondary);
}

.status-tag {
  color: var(--color-success-text);
  background: var(--color-success-bg);
}
</style>
```

### 从 Pencil 变量名推断 Token

如果 Pencil 画板中的节点使用了 Pencil Variables（`$color/brand/normal` 等），可以直接映射到 CSS Token：

| Pencil Variable | CSS Token |
|----------------|-----------|
| `$color/brand/normal` | `var(--color-primary)` |
| `$color/text/primary` | `var(--color-text-primary)` |
| `$color/bg/container` | `var(--color-bg-container)` |
| `$color/border/secondary` | `var(--color-border-secondary)` |
| `$spacing/md` | `var(--spacing-md)` |
| `$radius/md` | `var(--border-radius-md)` |

---

## 项目层覆盖检查

如果项目目录下存在 `.cursor/rules/design-system/` 文件夹，优先读取其中的覆盖规则：

- `overrides/tokens.md` → 检查项目特定 Token（如 `--color-text-primarys` 多了个 s）
- `overrides/shell.md` → 检查项目特定的 Shell 结构
- `additions/das-component-vue.md` → 检查项目特定组件用法
- `additions/risk-tags.md` → 网络安全风险等级标签

若项目不存在该文件夹，则读取全局 rules：`~/.cursor/rules/design-system/`（Claude：`~/.claude/rules/design-system/`）中的对应覆盖文件。

---

## 输出示例结构

```vue
<template>
  <div class="list-page">
    <!-- 页头：来自设计稿 page-header frame -->
    <div class="page-header">
      <h2 class="page-title">剧本管理</h2>
      <a-button type="primary" @click="handleCreate">
        <template #icon><PlusOutlined /></template>
        新建剧本
      </a-button>
    </div>

    <!-- 搜索栏：来自设计稿 DasSearchBar 节点 -->
    <DasSearchBar
      v-model:keyword="searchForm.keyword"
      :filters="filterConfig"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 列表：来自设计稿卡片网格 -->
    <div class="card-grid">
      <div v-for="item in list" :key="item.id" class="playbook-card">
        <!-- das-component-vue 内部组件或自定义卡片 -->
      </div>
    </div>

    <!-- 新建弹窗：来自设计稿 modal 画板 -->
    <a-modal
      v-model:open="showCreateModal"
      title="新建剧本"
      @ok="handleSubmit"
    >
      <DasFormGroup :fields="formFields" v-model="formData" />
    </a-modal>
  </div>
</template>
```
