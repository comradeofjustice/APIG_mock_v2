# 交互模式库

> 生成代码时，根据页面类型匹配对应的标准交互模式，确保代码不只是静态 UI。

---

## 一、列表页（最常见）

**典型特征**：搜索栏 + 表格/卡片列表 + 分页

```typescript
// 标准列表页 composable 结构
const searchForm = reactive({ keyword: '', status: '' })
const list = ref([])
const loading = ref(false)
const pagination = reactive({ current: 1, pageSize: 20, total: 0 })

const fetchList = async () => {
  loading.value = true
  try {
    // TODO: 替换为真实 API
    // const res = await api.getList({ ...searchForm, ...pagination })
    await new Promise(r => setTimeout(r, 300))
    list.value = mockData
    pagination.total = mockData.length
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchList()
}

const handleReset = () => {
  Object.assign(searchForm, { keyword: '', status: '' })
  handleSearch()
}

onMounted(fetchList)
```

**必须包含的交互：**
- [ ] 搜索/重置触发列表刷新
- [ ] 分页切换
- [ ] 列表加载状态（skeleton 或 spin）
- [ ] 空状态展示

---

## 二、卡片列表页（设计稿常见）

**典型特征**：Grid 布局的卡片，每张卡片有操作菜单

```vue
<!-- 卡片操作菜单模式 -->
<a-dropdown :trigger="['click']">
  <a-button type="text" class="card-action-btn">
    <EllipsisOutlined />
  </a-button>
  <template #overlay>
    <a-menu @click="({ key }) => handleAction(key, item)">
      <a-menu-item key="edit">编辑</a-menu-item>
      <a-menu-item key="export">导出</a-menu-item>
      <a-menu-divider />
      <a-menu-item key="delete" class="danger-item">删除</a-menu-item>
    </a-menu>
  </template>
</a-dropdown>
```

```typescript
const handleAction = (action: string, item: any) => {
  switch (action) {
    case 'edit':
      openEditModal(item)
      break
    case 'export':
      handleExport(item)
      break
    case 'delete':
      confirmDelete(item)
      break
  }
}
```

---

## 三、弹窗（Modal）

**触发场景**：点击"新建"、"编辑"按钮

```typescript
// 新建/编辑弹窗的标准模式
const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const currentItem = ref(null)
const formData = reactive({ name: '', description: '', status: 'active' })
const submitting = ref(false)

const openCreateModal = () => {
  modalMode.value = 'create'
  Object.assign(formData, { name: '', description: '', status: 'active' })
  modalVisible.value = true
}

const openEditModal = (item: any) => {
  modalMode.value = 'edit'
  currentItem.value = item
  Object.assign(formData, item)
  modalVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    // TODO: 替换为真实 API
    await new Promise(r => setTimeout(r, 500))
    message.success(modalMode.value === 'create' ? '创建成功' : '保存成功')
    modalVisible.value = false
    fetchList()  // 刷新列表
  } catch {
    message.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}
```

---

## 四、删除确认

**触发场景**：点击"删除"操作

```typescript
// 方式1：使用 a-modal.confirm（推荐）
const confirmDelete = (item: any) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除「${item.name}」吗？此操作不可恢复。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      // TODO: 替换为真实 API
      await new Promise(r => setTimeout(r, 300))
      message.success('删除成功')
      fetchList()
    }
  })
}
```

---

## 五、详情侧滑（Drawer）

**触发场景**：点击列表行或卡片查看详情

```typescript
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const detailData = ref(null)

const openDetail = async (item: any) => {
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    // TODO: 替换为真实 API
    await new Promise(r => setTimeout(r, 200))
    detailData.value = item
  } finally {
    drawerLoading.value = false
  }
}
```

```vue
<a-drawer
  v-model:open="drawerVisible"
  title="详情"
  width="600"
  :body-style="{ padding: '24px' }"
>
  <a-spin :spinning="drawerLoading">
    <!-- 详情内容 -->
  </a-spin>
</a-drawer>
```

---

## 六、Tab 切换

**触发场景**：页面内容分类切换

```typescript
const activeTab = ref('all')
const tabList = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '启用中' },
  { key: 'inactive', label: '已停用' }
]

// Tab 切换时重置搜索和分页
const handleTabChange = (key: string) => {
  activeTab.value = key
  pagination.current = 1
  Object.assign(searchForm, { keyword: '' })
  fetchList()
}

// 根据 Tab 过滤数据（前端过滤 Mock 模式）
const filteredList = computed(() => {
  if (activeTab.value === 'all') return list.value
  return list.value.filter(item => item.status === activeTab.value)
})
```

---

## 七、搜索防抖

**适用**：搜索框实时输入触发搜索

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(() => {
  pagination.current = 1
  fetchList()
}, 300)

// 在 input 的 @input 事件绑定 debouncedSearch
```

---

## 八、页面状态汇总（必须处理）

| 状态 | 实现方式 |
|------|---------|
| 加载中 | `v-loading` 或 `<a-spin>` 或 `<a-skeleton>` |
| 空数据 | `v-if="list.length === 0"` 显示空状态组件 |
| 加载失败 | `catch` 块展示错误提示 + 重试按钮 |
| 操作成功 | `message.success(...)` |
| 操作失败 | `message.error(...)` |
| 二次确认 | `Modal.confirm(...)` |

---

---

## 九、常见踩坑（生成代码前必查）

### 图标名验证

`@ant-design/icons-vue` 部分图标名不符合直觉，**不能猜，必须查**：

| 想用的含义 | 错误名（不存在） | 正确名 |
|-----------|----------------|--------|
| 盾牌/安全 | `ShieldOutlined` | `SafetyOutlined` |
| 星星收藏 | `StarFilled` → 存在，但注意大小写 | `StarFilled` ✓ |

生成代码时，图标组件只允许用以下已知可用的，其他图标先去 [https://ant.design/components/icon](https://ant.design/components/icon) 确认：

```
常用安全类：SafetyOutlined, SecurityScanOutlined, AuditOutlined, AlertOutlined
常用操作类：EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined, SearchOutlined
常用状态类：CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined
常用文件类：FileOutlined, FolderOutlined, BookOutlined, ContainerOutlined
常用导航类：MoreOutlined, SettingOutlined, UploadOutlined, DownloadOutlined
```

---

### 路由可见性：`meta.public` ≠ 免登录

这个项目的路由守卫（`guard.ts`）分两层拦截：

| 拦截层 | 判断条件 | 作用 |
|--------|---------|------|
| 第一层 | `WHITE_LIST.includes(to.path)` | 完全跳过守卫 |
| 第二层 | `to.meta.public` | 仅跳过**权限 ID 检查**，仍需登录态 |

**结论**：开发调试阶段要让页面免登录可访问，必须把路径加入 `WHITE_LIST`（`src/router/guard.ts`），而不是只设 `meta: { public: true }`。

```typescript
// guard.ts
export const WHITE_LIST: string[] = ['/404', '/login', '/page-test', '/your-new-page'];
```

---

## 交互模式快速选择

根据设计稿中的元素快速匹配：

| 设计稿中有 | 需要实现的交互模式 |
|-----------|-----------------|
| 搜索框 + 列表 | 一、列表页 |
| 卡片 + 右上角「···」 | 二、卡片列表页 |
| 「新建」按钮 | 三、弹窗（create 模式） |
| 「编辑」操作 | 三、弹窗（edit 模式） |
| 「删除」操作 | 四、删除确认 |
| 「查看详情」/ 点击行 | 五、详情侧滑 |
| 多个 Tab | 六、Tab 切换 |
| 多个画板（状态差异） | 逐一对应上述交互模式 |
