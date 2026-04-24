# Architecture Baseline

## Core Modules

- `src/main.tsx`
  - 入口：挂载 `ConfigProvider (antd4)` 与 `RouterProvider (react-router-dom v6)`
  - 复用 `src/config/routes/index.ts` 作为路由注册来源
- `src/config/routes/index.ts`
  - 路由注册文件（供下游技能读取和插入新路由）
  - 使用 React Router v6 的 `element` 写法
- `src/layouts/EnterpriseLayout.tsx`
  - 布局壳层（Header + Content 最小骨架）
  - 通过 `<Outlet />` 承载页面
  - Header 背景色 `#0F1E4A`，Content 背景色 `#F7FAFD`
- `src/layouts/theme.config.ts`
  - antd4 无 v5 token；用于沉淀 `enterpriseTheme` 常量
  - 当前仅定义 `primaryColor: '#3B71EE'`
- `src/views/Home/index.tsx`
  - 示例页面：演示 `Loading / Empty / Error / Feedback`
- `src/views/MultimodalValidation/index.tsx`
  - 多模态验证页面：支持输入/输出检测
  - 文件上传：PNG/JPG/GIF 图片（转 Base64）+ DOCX/DOC/PDF（OCR 提取文本）
  - 接口调用：`/api/v1/multimodal/image/input/analyze` 和 `/api/v1/multimodal/image/output/analyze`
  - 当前失败回退到 Mock 数据
- `src/views/VerificationHistory/index.tsx`
  - 验证历史页面：Tab 切换（多模态验证 / 文本检测）
  - 表格展示：验证时间、完成时间、检测内容、方向、合规状态、MD5、违规类型、任务状态
  - 详情弹窗：查看完整检测结果与原始 JSON 下载
  - 搜索功能：按文件名/MD5 搜索

## Dependencies

- `react@17`
- `react-dom@17`
- `antd@4.17.4`
- `react-router-dom@6`
- `vite@5`
- `mammoth`（DOCX 文本提取）
- `pdfjs-dist`（PDF 文本提取）

## Data Flow

- 当前使用 Mock 异步（`setTimeout`）+ 本地 state 模拟加载/空/错误与反馈交互
- 已预留真实 API 调用逻辑（`postJson` 函数），接口失败时回退到 Mock
- 输出检测必须先调用输入检测获取 `requestId`，再作为 `reqId` 传入输出检测接口

