# APIG 项目

> 基于 React 17 + Ant Design 4 的企业级前端应用

## 📋 目录

- [快速开始](#快速开始)
- [环境要求](#环境要求)
- [项目初始化](#项目初始化)
- [开发指南](#开发指南)
- [Skills 配置](#skills-配置)
- [提交流程](#提交流程)

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd apig

# 2. 安装依赖
npm install

# 3. 初始化 Skills 子模块并安装到编辑器
npm run skills

# 4. 启动开发服务器
npm run dev
```

---

## 💻 环境要求

- **Node.js**: >= 16.x
- **npm**: >= 8.x 或 **yarn**: >= 1.22.x
- **Git**: >= 2.x
- **操作系统**: Windows 10/11, macOS, Linux

---

## 📦 项目初始化

### 首次克隆项目后

克隆项目后,需要完成以下步骤才能正常运行:

#### 步骤 1: 初始化并安装 Skills(推荐)

```bash
# 一条命令完成: 拉取子模块 + 安装 Skills + 提示重新加载编辑器
npm run skills

# 该命令等价于:
# 1. git submodule update --init --remote sub-apps/das-ued-skills
# 2. powershell -ExecutionPolicy Bypass -File sub-apps/das-ued-skills/cli/install-skills.ps1 -ai qoder -targetDir .qoder/skills
# 3. echo Skills 安装完成,请重新加载编辑器
```

#### 步骤 2: 手动初始化(可选)

```bash
# 仅初始化子模块(不安装到编辑器)
git submodule update --init --remote sub-apps/das-ued-skills

# 手动安装 Skills 到编辑器
powershell -ExecutionPolicy Bypass -File sub-apps/das-ued-skills/cli/install-skills.ps1 -ai qoder -targetDir .qoder/skills
```

---

## 🛠 开发指南

### 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run tsc

# 预览生产构建
npm run preview
```

### 📡 更新 Skills 子模块

当需要更新 `sub-apps/das-ued-skills` 子模块到最新版本时:

#### 方式 1: 使用 npm 命令(推荐)

```bash
# 更新子模块并重新安装 Skills 到编辑器
npm run skills
```

#### 方式 2: 仅更新子模块(不安装)

```bash
git submodule update --remote sub-apps/das-ued-skills
```

### package.json 命令说明

#### `npm run skills`

**作用**: 初始化/更新 Skills 子模块并安装到编辑器(幂等操作,可重复执行)

**完整命令**:
```bash
git submodule update --init --remote sub-apps/das-ued-skills && powershell -ExecutionPolicy Bypass -File sub-apps/das-ued-skills/cli/install-skills.ps1 -ai qoder -targetDir .qoder/skills
```

**使用场景**:
- 首次克隆项目后初始化 Skills
- 更新子模块到最新版本并重新安装
- 定期保持 Skills 最新(可重复执行,不会报错)

**示例**:
```bash
# 克隆后立即执行
git clone <repo-url>
cd apig
npm run skills

# 重新加载编辑器使 Skills 生效(Ctrl+Shift+P → Reload Window)
```

**输出示例**:
```
Installing skills to: .qoder/skills
  - installed: opt
  - installed: opt-antd-v5-enterprise-layout
  - installed: opt-prd-ux-code
  ...
  - synced rules: 4 files
Done.
Skills 安装完成,请重新加载编辑器
```



---

## 🔧 Skills 配置

### 目录结构

```
.
├── sub-apps/
│   └── das-ued-skills/          ← Git 子模块(Skills 源代码)
│       ├── cli/                 ← 安装脚本等工具
│       │   └── install-skills.ps1   ← Skills 安装脚本
│       ├── opt/                 ← 各种 Skills 定义
│       ├── project/
│       └── rules/
├── .qoder/
│   ├── skills/                  ← 安装后的 Skills(供编辑器使用)
│   │   ├── opt/
│   │   ├── opt-antd-v5-enterprise-layout/
│   │   └── ...
│   └── rules/                   ← 全局规则文件(由安装脚本同步)
└── package.json                 ← 包含 npm run skills 命令
```

### 工作原理

1. **子模块管理**: `sub-apps/das-ued-skills` 是一个 Git 子模块
   - 📦 独立的 Git 仓库
   - 🔄 可以单独更新和维护
   - 🚫 不要在子模块中直接提交代码(只读)

2. **安装脚本**: `cli/install-skills.ps1`
   - 📥 将子模块中的 Skills 复制到 `.qoder/skills` 目录
   - 📋 支持多种 AI 编辑器(Qoder, Cursor, Claude 等)
   - 🔧 首次克隆项目后必须运行
   - ♻️ 支持重复执行,始终保持最新状态

### 安装 Skills

```bash
# 方式 1: 使用 npm 命令(推荐,幂等操作)
npm run skills

# 方式 2: 手动执行(跨平台)
powershell -ExecutionPolicy Bypass -File sub-apps/das-ued-skills/cli/install-skills.ps1 -ai qoder -targetDir .qoder/skills
```

### 更新 Skills

当子模块有更新时:

```bash
# 一条命令完成: 更新子模块 + 重新安装 Skills
npm run skills

# 或分步执行:
# 1. 仅更新子模块
git submodule update --remote sub-apps/das-ued-skills

# 2. 重新安装 Skills 到编辑器
npm run skills
```

### ⛔ 禁止操作

- ❌ **不要**在 `sub-apps/das-ued-skills/` 子模块中提交任何代码(除非你是维护者)
- ❌ **不要**手动删除或修改 `.qoder/skills/` 中的文件(应通过安装脚本管理)
- ❌ **不要**跳过 Skills 安装步骤(编辑器将无法使用 Skills)
- ✅ **可以**随时执行 `npm run skills` 来保持 Skills 最新(支持重复执行)

---

## 📝 提交流程

### 标准工作流

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 开发并测试
# ... 你的代码改动 ...

# 3. 提交代码
git add .
git commit -m "feat: your feature description"

# 4. 推送分支
git push origin feature/your-feature

# 5. 创建 Pull Request
```

### 更新子模块引用

如果子模块有更新,需要更新主项目中的引用:

```bash
# 1. 更新子模块并重新安装 Skills(推荐)
npm run skills

# 2. 查看子模块变更
git diff sub-apps/das-ued-skills

# 3. 提交子模块引用更新
git add sub-apps/das-ued-skills
git commit -m "chore: update skills submodule"
git push
```

### 合并后同步

```bash
# 拉取最新代码
git pull

# 更新子模块并重新安装 Skills
npm run skills

# 重新加载编辑器使新 Skills 生效(Ctrl+Shift+P → Reload Window)
```

---

## 🐛 常见问题

### Q: 克隆项目后无法启动?

**A**: 检查是否完成了初始化步骤:

```bash
# 1. 初始化子模块并安装 Skills
npm run skills

# 2. 确认 Skills 已安装
dir .qoder\skills /b
```

### Q: 编辑器无法识别 Skills?

**A**: 可能没有运行安装脚本或安装路径不正确:

```bash
# 重新安装 Skills(支持重复执行)
npm run skills

# 或手动指定路径安装(跨平台)
powershell -ExecutionPolicy Bypass -File sub-apps/das-ued-skills/cli/install-skills.ps1 -ai qoder -targetDir .qoder/skills

# 重新加载编辑器(Ctrl+Shift+P → Reload Window)
```

### Q: 如何更新 Skills 到最新版本?

**A**: 使用 `npm run skills` 命令(支持重复执行,始终保持最新):

```bash
# 一条命令完成更新和安装(推荐)
npm run skills

# 或分步执行:
# 1. 仅更新子模块(不安装)
git submodule update --remote sub-apps/das-ued-skills

# 2. 重新安装 Skills
npm run skills
```

### Q: 安装脚本支持哪些编辑器?

**A**: 支持多种 AI 编辑器:
- `qoder` - Qoder
- `cursor` - Cursor
- `claude` - Claude Code
- `copilot` - GitHub Copilot
- `windsurf` - Windsurf
- `kiro` - Kiro
- `codex` - Codex
- 等等...

使用 `-ai` 参数指定目标编辑器:
```powershell
powershell -ExecutionPolicy Bypass -File sub-apps/das-ued-skills/cli/install-skills.ps1 -ai cursor -targetDir .qoder/skills
```

---



---

## 📄 License

Copyright © 2026 DBAPP Security
