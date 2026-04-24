# Delivery Workflow

## Local Dev Flow

1. `npm install`
2. `npm run dev`
3. 在浏览器打开 Vite 输出地址（`http://localhost:5173`），访问 `/`（由 `src/config/routes/index.ts` 注册）

## Build & Deploy

- 构建：`npm run build`（`tsc -b && vite build`）
- 产物目录：`dist/`
- 预览构建产物：`npm run preview`

## Skill Usage Boundaries

- 本工程用于演练 `opt-pro-ux-code-init` 与 `opt-prd-ux-code` 的契约读取（尤其是 `Project Paths` 与路由注册文件）
- 当前工程未接入登录/权限路由守卫；后续需补充
- 设计系统规范来自 `das-ued-skills/`，需遵循 b-admin-pencil-design 规范
- Pencil Token 刷新规则：`das-ued-skills/rules/pencil-token-refresh.mdc`

## API Integration Flow

1. 前端预留真实 API 调用逻辑（`postJson` 函数）
2. 接口失败时回退到 Mock 数据（保证 UI 可演示）
3. 联调步骤：
   - 确认后端接口可用
   - 移除 Mock 回退逻辑
   - 测试真实数据渲染

