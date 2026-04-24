# Project Memory

## Executive Snapshot

- 项目一句话定位：内网隔离环境下的 **React 17 + antd 4.17** 多模态内容安全审核平台，支持输入/输出检测、验证历史追溯，用于演练 `opt-pro-ux-code-init` / `opt-prd-ux-code` 等技能契约并逐步演化为真实业务系统。
- 当前阶段：脚手架已生成，具备基础路由与 3 个示例页面（Home、MultimodalValidation、VerificationHistory），待接入真实后端 API 与完善设计系统对齐。
- 近期里程碑：
  1. 基于 das-ued-skills 设计规范创建业务页面 .pen 设计稿
  2. 对齐设计系统 Token 到 antd4 主题配置
  3. 接入真实后端接口（/api/v1/multimodal/*）
  4. 补充权限路由守卫与用户认证

## Architecture Baseline

- 核心模块：
  - `src/main.tsx`（入口 + `ConfigProvider` + `RouterProvider`）
  - `src/config/routes/index.ts`（路由注册，React Router v6 `element` 写法）
  - `src/views/*`（页面：Home / MultimodalValidation / VerificationHistory）
  - `src/layouts/*`（布局壳层 + 主题配置）
- 关键依赖：`react@17`、`react-dom@17`、`antd@4.17.4`、`react-router-dom@6`、`vite@5`、`mammoth`（DOCX 解析）、`pdfjs-dist`（PDF 解析）（见 `package.json`）
- 主要数据流：
  - 当前使用 Mock 异步（`setTimeout`）+ 本地 state 演示 Loading/Empty/Feedback
  - 已预留真实 API 调用逻辑（`postJson` 函数），接口契约：
    - 输入检测：`POST /api/v1/multimodal/image/input/analyze`
    - 输出检测：`POST /api/v1/multimodal/image/output/analyze`
  - 文件上传支持：PNG/JPG/GIF 图片（转 Base64 dataURL）+ DOCX/DOC/PDF 文档（前端 OCR 提取文本）

## Delivery Workflow

- 开发流程：内网安装依赖 → `npm run dev` → 浏览器访问 Vite 输出地址（port 5173）
- 测试/发布门槛：待确认（当前为模拟工程，需补充真实测试用例）
- 常用命令：
  - 安装：`npm install`（或 `pnpm install` / `yarn`，以内网镜像策略为准）
  - 启动：`npm run dev`
  - 构建：`npm run build`（`tsc -b && vite build`）
  - 预览：`npm run preview`

## Collaboration Contract

- 代码约定：
  - TypeScript + 函数组件
  - 路由集中 `src/config/routes/index.ts`
  - 页面默认输出 `src/views/{Module}/index.tsx`
  - 布局壳层 `src/layouts/EnterpriseLayout.tsx`
  - 主题常量 `src/layouts/theme.config.ts`
- PR 约定：待确认
- 决策记录方式：待确认
- Git 分支策略：待确认

## Risk & Constraints

- 技术风险：
  - 内网无法访问公网 registry 时，需改用私有 npm 源或离线包
  - antd4 无 v5 Design Token 机制，主题定制需通过 LESS 变量或 CSS 覆盖
  - `pdfjs-dist` worker 配置在内网环境可能需要本地化
- 业务风险：
  - 当前接口调用失败会回退到 Mock，可能掩盖真实联调问题
  - 多模态检测涉及敏感内容（身份证、合同等），需注意数据隐私
- 明确限制：
  - 本仓库与 `das-ued-skills/` 并列于 `apig` 根目录，勿将 skills 文档当作业务源码依赖
  - 设计系统规范来自 `das-ued-skills/`，需遵循 b-admin-pencil-design 规范

## Open Questions

- [ ] PR 流程与代码审查约定（是否需要 Code Review？PR 模板？）
- [ ] Git 分支策略（main/dev/feature？是否使用 Git Flow？）
- [ ] 真实后端 API 的联调时间表与 Mock 数据替换计划
- [ ] 是否需要接入登录认证与权限路由守卫？
- [ ] 测试策略（单元测试 / E2E 测试 / 视觉回归测试？）
- [ ] 设计系统部署：是否需要将 das-ued-skills 安装到 `.cursor/skills/` 目录？

## Evidence Index

- 技术栈与脚本 → `package.json`
- 入口与全局配置 → `src/main.tsx`
- 路由注册 → `src/config/routes/index.ts`
- 布局壳层 → `src/layouts/EnterpriseLayout.tsx`
- 主题配置 → `src/layouts/theme.config.ts`
- 示例页面（Loading/Empty/Feedback）→ `src/views/Home/index.tsx`
- 多模态验证页面 → `src/views/MultimodalValidation/index.tsx`
- 验证历史页面 → `src/views/VerificationHistory/index.tsx`
- 构建配置 → `vite.config.ts`
- 约束与长期记忆 → `docs/context/architecture.md` / `docs/context/workflow.md` / `docs/context/constraints.md`
- 设计系统规范 → `das-ued-skills/opt/b-admin-pencil-design/SKILL.md`
- Pencil Token 刷新规则 → `das-ued-skills/rules/pencil-token-refresh.mdc`
- 组件库设计稿 → `[组件库] das-component-vue.pen`

## Last Updated

- 日期：2026-04-22
- 来源：opt-pro-ux-code-init（Phase 0-3 完整扫描 + 用户澄清）

---

## Project Paths

- 项目根目录：`d:\project\apig`
- 路由注册文件：`src/config/routes/index.ts`
- 页面输出目录：`src/views`
- 布局壳层：`src/layouts/EnterpriseLayout.tsx`
- 主题配置：`src/layouts/theme.config.ts`

## Design Context

- 品牌主色：`#3B71EE`（来源：`src/layouts/theme.config.ts`）
- 功能色：
  - success: `#52c41a`（antd4 默认）
  - warning: `#faad14`（antd4 默认）
  - danger: `#f5222d`（antd4 默认）
  - info: `#1890ff`（antd4 默认）
- 布局色：
  - Header 背景：`#0F1E4A`（深蓝）
  - Content 背景：`#F7FAFD`（浅灰蓝）
  - 卡片背景：`#FFFFFF`
- 圆角：
  - 卡片圆角：`9px` / `12px`（见页面代码内联样式）
  - 按钮圆角：antd4 默认 `2px`
- 字体基准：待确认（antd4 默认 `14px`）

## Delivery Defaults

- 包管理器：`npm`（可改为 `pnpm` / `yarn`，以内网规范为准）
- 启动命令：`npm run dev`
- 构建命令：`npm run build`
- 端口：`5173`（见 `vite.config.ts`）
- 路径别名：`@` → `src`（见 `vite.config.ts`）

---

## 布局规范（Pencil 设计稿）

> 以下为 Pencil Token 刷新规则读取的注入表，列头固定为 `| Pencil Variable | 值 | 来源 |`。
> ⚠️ **范围说明**：本节只记录**项目需要覆盖的变量子集**（品牌色、状态色、风险色、圆角、字体基准），不是 Pencil 组件库的完整变量清单。

### 品牌色

| Pencil Variable | 值 | 来源 |
|---|---|---|
| `color/brand/normal` | `#3B71EE` | 项目覆盖（theme.config.ts） |
| `color/brand/hover` | `#5488F0` | 待确认（需设计系统规范） |
| `color/brand/active` | `#2D5FD4` | 待确认（需设计系统规范） |
| `color/brand/light` | `#E8F0FE` | 待确认（需设计系统规范） |

### 状态色

| Pencil Variable | 值 | 来源 |
|---|---|---|
| `color/status/success` | `#52c41a` | 全局默认（antd4） |
| `color/status/success-light` | `#F6FFED` | 全局默认（antd4） |
| `color/status/warning` | `#faad14` | 全局默认（antd4） |
| `color/status/warning-light` | `#FFFBE6` | 全局默认（antd4） |
| `color/status/error` | `#f5222d` | 全局默认（antd4） |
| `color/status/error-light` | `#FFF1F0` | 全局默认（antd4） |

### 风险色（如项目使用）

> ⚠️ 风险色**不得**从状态色推断，必须从 `src/theme/theme.css` 调色板直接读取。当前项目不存在该文件，标记为待确认。

| Pencil Variable | 值 | 来源 |
|---|---|---|
| `color/risk/fall/normal` | `待确认` | 不存在 theme.css |
| `color/risk/fall/light` | `待确认` | 不存在 theme.css |
| `color/risk/high/normal` | `待确认` | 不存在 theme.css |
| `color/risk/high/light` | `待确认` | 不存在 theme.css |
| `color/risk/medium/normal` | `待确认` | 不存在 theme.css |
| `color/risk/medium/light` | `待确认` | 不存在 theme.css |
| `color/risk/low/normal` | `待确认` | 不存在 theme.css |
| `color/risk/low/light` | `待确认` | 不存在 theme.css |
| `color/risk/no/normal` | `待确认` | 不存在 theme.css |
| `color/risk/no/light` | `待确认` | 不存在 theme.css |

### 圆角

| Pencil Variable | 值 | 来源 |
|---|---|---|
| `radius/3xs` | `2` | 全局默认（antd4 按钮圆角） |
| `radius/xs` | `4` | 推断（输入框/标签圆角） |
| `radius/lg` | `12` | 项目覆盖（卡片圆角，见页面代码） |

### 字体

> 从 `src/store/uedModule/theme/defaultConfig.ts`（或同目录配置）读取 `fontSize` 字段值（去掉 `px` 单位）填入 `font/size/base`。当前项目不存在该文件，使用 antd4 默认值。

| Pencil Variable | 值 | 来源 |
|---|---|---|
| `font/size/base` | `14` | 全局默认（antd4） |
