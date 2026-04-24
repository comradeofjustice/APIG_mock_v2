# Faithful 模式 — 忠实还原

> 适用场景：Figma 设计稿复制到 Pencil 后生成代码，或用户明确要求"按设计稿还原"。
> 核心原则：**设计稿说什么就生什么，不替换组件，不引入设计系统约束。**

---

## 读取设计的顺序

### Step 1：截图优先理解布局
```
get_screenshot(nodeId: "artboard-id")
```
先看整体布局，再深入节点树。截图帮助理解层次和视觉意图，节点树帮助提取精确数值。

### Step 2：读取节点树提取组件信息
```
batch_get(patterns: ["artboard-id/*"])
```

从节点树中提取：
- **容器结构**：flex 方向、gap、padding
- **文字内容**：字号、颜色、字重
- **颜色信息**：背景色、边框色（转为 CSS 变量或直接使用 hex）
- **尺寸信息**：width、height、border-radius
- **图标**：icon_font 类型 + content

### Step 3：识别组件类型

根据节点结构推断 HTML/原生 UI 组件对应关系：

| Pencil 节点特征 | 推断为 |
|----------------|--------|
| `type: "text"` + `content: "搜索..."` | `<input placeholder>` |
| frame 内有 icon + text，有 `fill` 背景 | `<button>` |
| 重复的列表项 frame | `v-for` 列表 |
| 有 overlay/modal 字样的 frame | `<Modal>` 或 `v-show` 弹层 |
| 带 border-bottom 的横排 text | `<Tabs>` |
| 固定宽度侧边 frame | `<aside>` 侧边栏 |

---

## 代码生成策略

### 样式处理
- **颜色**：Pencil 中的 hex 颜色直接写入 CSS，不转换为 token
- **间距**：从节点的 padding/gap 数值直接转为 px 值
- **字体**：从节点 fontSize/fontWeight 直接转为 CSS
- **圆角**：直接使用 cornerRadius 数值

```vue
<!-- faithful 模式的样式风格：直接用数值 -->
<style scoped>
.card {
  padding: 16px 20px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}
</style>
```

### 组件选择
- 优先使用 **HTML 原生元素** + CSS 还原视觉
- 若设计中明显是某个 UI 库组件（如表格、分页），可用 Ant Design Vue 基础组件
- **不强制使用 das-component-vue** 的专属组件

### Figma→Pencil 还原的特殊注意

Figma 设计稿通常包含以下内容，还原时特别处理：

1. **Auto Layout → flexbox**：Figma Auto Layout 对应 CSS flexbox，注意 direction、gap、padding
2. **Component Instance → 重复模板**：Figma 组件实例用 `v-for` + 子组件处理
3. **Variant → 条件渲染**：不同 Variant 对应 `v-if` 或 `:class` 动态样式
4. **Prototype Link → router.push 或 emit**：画板间的跳转关系转为路由跳转

---

## Mock 数据规范

忠实还原模式下，Mock 数据要**贴合设计稿中展示的真实内容**，不要用 `item1 / item2` 这种无意义占位：

```typescript
// 从设计稿中的文字内容推断 Mock 数据
const mockList = ref([
  {
    id: 1,
    name: '勒索软件检测剧本',        // 来自设计稿中的卡片标题
    status: 'active',
    tags: ['高危', '自动化'],
    createTime: '2024-01-15'
  },
  // ...
])
```

---

## 输出示例结构

```vue
<template>
  <div class="page-container">
    <!-- 顶部工具栏：来自设计稿第一层 frame -->
    <div class="toolbar">
      <input class="search-input" placeholder="搜索剧本名称..." />
      <button class="btn-primary" @click="handleCreate">+ 新建剧本</button>
    </div>

    <!-- 卡片列表：来自设计稿重复 card frame -->
    <div class="card-grid">
      <div
        v-for="item in list"
        :key="item.id"
        class="playbook-card"
        @click="handleCardClick(item)"
      >
        <!-- 还原设计稿中卡片内部结构 -->
      </div>
    </div>

    <!-- 弹窗：来自设计稿的 modal frame（若有） -->
    <div v-if="showModal" class="modal-overlay">
      <!-- ... -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const list = ref([])
const showModal = ref(false)
const loading = ref(false)

// TODO: 替换为真实 API
const fetchList = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 300))
  list.value = [ /* mock data */ ]
  loading.value = false
}

onMounted(fetchList)
</script>
```
