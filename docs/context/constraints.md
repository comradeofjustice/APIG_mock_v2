# Constraints

## Environment Constraints

- 内网隔离：可能无法访问公网 npm registry，需要私服/镜像或离线包
- Vite 开发服务器端口：`5173`
- `pdfjs-dist` worker 配置在内网环境可能需要本地化（`pdfjs-dist/legacy/build/pdf.worker.min.mjs`）

## Design System Constraints

- 设计系统规范来自 `das-ued-skills/` 目录
- 核心设计 Skill：`das-ued-skills/opt/b-admin-pencil-design/SKILL.md`
- Pencil Token 刷新规则：`das-ued-skills/rules/pencil-token-refresh.mdc`
- 视觉/主题在代码中沉淀于 `src/layouts/theme.config.ts`（当前仅 `primaryColor`）
- antd4 无 v5 Design Token 机制，主题定制需通过：
  - LESS 变量覆盖
  - CSS 自定义属性
  - ConfigProvider `theme` 配置（antd4 有限支持）

## Routing Constraints

- 路由注册文件：`src/config/routes/index.ts`
- 当前示例路由使用 React Router v6 的 `element` 字段
- 下游技能会自动检测路由文件内使用的是 `element` 还是 `component`

## Pencil Design Constraints

- 项目存在 `[组件库] das-component-vue.pen`（组件库参考）
- 后续需基于设计系统创建业务页面 .pen 设计稿
- Pencil Token 注入表已写入 `project_description.md` 的 `## Pencil Token Values` 节
- 部分 Token 值标记为"待确认"（品牌色派生、风险色），需设计系统规范补充

## API Constraints

- 当前接口调用失败会回退到 Mock，可能掩盖真实联调问题
- 输出检测依赖输入检测的 `requestId`
- 文件上传限制：
  - 图片：PNG/JPG/GIF（转 Base64 dataURL）
  - 文档：DOCX/DOC/PDF（前端 OCR 提取文本）
  - DOC 文件支持不稳定（mammoth 对旧格式兼容性有限）

