# Skills工作流程

<cite>
**本文档引用的文件**
- [README.md](file://das-ued-skills/README.md)
- [SKILL.md](file://das-ued-skills/opt/prd-ux-code/SKILL.md)
- [install.sh](file://das-ued-skills/cli/install.sh)
- [install.ps1](file://das-ued-skills/cli/install.ps1)
- [sync-project-assets.sh](file://das-ued-skills/cli/sync-project-assets.sh)
- [SKILL.md](file://das-ued-skills/opt/opt-pro-ux-code-init/SKILL.md)
- [SKILL.md](file://das-ued-skills/opt/discovery/SKILL.md)
- [SKILL.md](file://das-ued-skills/opt/design-validation/SKILL.md)
- [SKILL.md](file://das-ued-skills/opt/b-admin-pencil-design/SKILL.md)
- [SKILL.md](file://das-ued-skills/opt/pencil-to-code/SKILL.md)
- [SKILL.md](file://das-ued-skills/opt/frontend-design/SKILL.md)
- [SKILL.md](file://das-ued-skills/opt/harden/SKILL.md)
- [component-library-standards.mdc](file://das-ued-skills/project/component-library-standards.mdc)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概览](#架构概览)
5. [详细组件分析](#详细组件分析)
6. [依赖关系分析](#依赖关系分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介

das-ued-skills是一套面向B端后台的端到端设计开发工作流程系统，专为AI助手（Cursor、Claude等）设计。该系统将"用户研究 → 需求文档 → Pencil设计稿 → 设计验证 → Vue 3前端代码"串联成可控、可追溯的工作流。

### 适用场景

| 场景 | 推荐入口 |
|------|----------|
| 首次使用，建立项目设计规范 | `opt-pro-ux-code-init` 或 `/opt-pro-ux-code-init` |
| 新产品从0到1做功能 | `opt-prd-ux-code`（全流程） |
| 已有PRD，需要设计稿 | `opt-prd-ux-code`（从Stage 3起） |
| 已有Pencil设计，要转代码 | `opt-pencil-to-code` |
| 没有设计稿，直接产出前端 | `opt-frontend-design` |
| 设计稿完成后做可用性/合规检查 | `opt-design-validation` |
| 代码需要错误处理、i18n、边界加固 | `opt-harden` |

### 设计原则

- **文件优先**：每阶段写入`docs/ux/{模块名}/`下对应文件，可版本管理、可追溯
- **门控确认**：每Stage结束后输出Handoff，用户明确回复"确认/继续"才进入下一Stage
- **不凭空推断**：设计类Skill依赖`project_description.md`或`opt-pro-ux-code-init`建立上下文

## 项目结构

```mermaid
graph TB
subgraph "das-ued-skills根目录"
A[das-ued-skills/] --> B[cli/ 安装与CLI脚本]
A --> C[opt/ 流程相关技能]
A --> D[rules/ 全局Rules]
A --> E[project/ 项目级规则/资产]
A --> F[README.md]
A --> G[VERSIONING.md]
end
subgraph "CLI目录"
B --> B1[das-ued-skills.ps1]
B --> B2[install-cli.ps1]
B --> B3[install-skills.sh]
B --> B4[install.ps1]
B --> B5[sync-project-assets.sh]
end
subgraph "opt目录"
C --> C1[prd-ux-code/ 全流程编排]
C --> C2[opt-pro-ux-code-init/ 项目初始化]
C --> C3[discovery/ 前置研究]
C --> C4[design-validation/ 设计验证]
C --> C5[b-admin-pencil-design/ Pencil设计]
C --> C6[pencil-to-code/ Pencil转代码]
C --> C7[frontend-design/ 前端设计]
C --> C8[harden/ 代码加固]
end
subgraph "项目资产"
E --> E1[组件库标准]
E --> E2[设计系统资产]
end
```

**图表来源**
- [README.md:253-286](file://das-ued-skills/README.md#L253-L286)
- [install.sh:1-189](file://das-ued-skills/cli/install.sh#L1-L189)

**章节来源**
- [README.md:253-286](file://das-ued-skills/README.md#L253-L286)

## 核心组件

### 全流程编排系统

`opt-prd-ux-code`是整个工作流程的核心编排系统，将六个阶段串联起来：

```mermaid
sequenceDiagram
participant User as 用户
participant Orchestrator as opt-prd-ux-code
participant Init as opt-pro-ux-code-init
participant Discovery as opt-discovery
participant Story as opt-story-ia-flow-notes
participant PRD as opt-prd
participant Design as opt-b-admin-pencil-design
participant Validate as opt-design-validation
participant Code as opt-pencil-to-code
User->>Orchestrator : 触发全流程
Orchestrator->>Init : 检查项目上下文
Init-->>Orchestrator : 项目上下文就绪
Orchestrator->>Discovery : Stage 0 前置研究
Discovery-->>Orchestrator : 研究结果
Orchestrator->>Story : Stage 1 用研叙事
Story-->>Orchestrator : 故事脚本
Orchestrator->>PRD : Stage 2 需求文档
PRD-->>Orchestrator : PRD文档
Orchestrator->>Design : Stage 3 设计稿
Design-->>Orchestrator : 设计稿
Orchestrator->>Validate : Stage 3.5 设计验证
Validate-->>Orchestrator : 验证报告
Orchestrator->>Code : Stage 4 前端代码
Code-->>User : Vue 3代码
```

**图表来源**
- [SKILL.md:50-71](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L50-L71)

### 项目初始化系统

`opt-pro-ux-code-init`是项目上下文初始化的唯一入口，负责建立可审计的项目记忆：

```mermaid
flowchart TD
A[开始初始化] --> B[Phase 0: 项目级Skill/Rules优先检查]
B --> C[扫描项目设计系统]
C --> D[读取项目覆盖规则]
D --> E[Phase 1: 全面扫描]
E --> F[扫描产品/技术/开发流程]
F --> G[Phase 2: 结构化澄清]
G --> H[业务目标与优先级]
H --> I[质量门槛与验收标准]
I --> J[可改/不可改边界]
J --> K[Phase 3: 记忆沉淀]
K --> L[更新project_description.md]
L --> M[生成docs/context/*]
M --> N[完成初始化]
```

**图表来源**
- [SKILL.md:23-250](file://das-ued-skills/opt/opt-pro-ux-code-init/SKILL.md#L23-L250)

**章节来源**
- [SKILL.md:1-250](file://das-ued-skills/opt/opt-pro-ux-code-init/SKILL.md#L1-L250)

## 架构概览

### 系统架构

```mermaid
graph TB
subgraph "AI助手层"
A[Cursor]
B[Claude]
C[其他AI助手]
end
subgraph "Skills层"
D[opt-prd-ux-code]
E[opt-pro-ux-code-init]
F[opt-discovery]
G[opt-design-validation]
H[opt-b-admin-pencil-design]
I[opt-pencil-to-code]
J[opt-frontend-design]
K[opt-harden]
end
subgraph "项目层"
L[project_description.md]
M[设计系统]
N[组件库]
O[规则文件]
end
subgraph "输出层"
P[docs/ux/{模块名}/]
Q[src/views/{模块名}/]
R[设计稿(.pen)]
end
A --> D
B --> D
C --> D
D --> E
D --> F
D --> G
D --> H
D --> I
D --> J
D --> K
E --> L
H --> M
I --> N
I --> O
G --> O
D --> P
D --> Q
D --> R
```

**图表来源**
- [README.md:160-200](file://das-ued-skills/README.md#L160-L200)

### 数据流架构

```mermaid
flowchart LR
subgraph "输入阶段"
A[用户需求] --> B[项目上下文]
B --> C[现有产物]
end
subgraph "处理阶段"
D[语境检测] --> E[阶段规划]
E --> F[Gate门控]
F --> G[Handoff输出]
end
subgraph "输出阶段"
H[文件产物] --> I[docs/ux/]
J[代码产物] --> K[src/views/]
L[设计稿] --> M[.pen文件]
end
A --> D
B --> D
C --> D
D --> E
E --> F
F --> G
G --> H
G --> J
G --> L
```

**图表来源**
- [SKILL.md:192-208](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L192-L208)

## 详细组件分析

### Stage 0 - 前置研究

前置研究（Stage 0）是可选阶段，适用于全新产品或需要补充背景认知的情况。

#### 执行流程

```mermaid
sequenceDiagram
participant User as 用户
participant Discovery as opt-discovery
participant Research as 研究工具
User->>Discovery : 触发前置研究
Discovery->>Discovery : 语境预判
alt 已明确研究类型
Discovery->>Research : 直接执行对应工具
else 未明确研究类型
Discovery->>User : AskQuestion选择研究类型
User-->>Discovery : 选择结果
Discovery->>Research : 执行所选工具
end
Research-->>Discovery : 研究结果
Discovery->>User : 输出Handoff摘要
```

**图表来源**
- [SKILL.md:67-94](file://das-ued-skills/opt/discovery/SKILL.md#L67-L94)

#### 研究类型分类

| 研究类型 | 子工具 | 触发前提 | 输出文件 |
|----------|--------|----------|----------|
| A类竞品分析 | 竞品分析/趋势分析 | 用户提供竞品名称 | competitive-analysis.md |
| B类文档解析 | 投标参数分析/合规要求分析 | 用户提供文档 | tender-analysis.md, compliance-gap-analysis.md |
| C类洞察研究 | 亲和图/用户画像/旅程图 | 用户提供数据或明确场景 | affinity-diagram.md, personas.md, customer-journey-map.md |

**章节来源**
- [SKILL.md:21-64](file://das-ued-skills/opt/discovery/SKILL.md#L21-L64)

### Stage 1 - 用研叙事

用研叙事（Stage 1）默认跳过，仅在用户明确需要叙事材料时执行。

#### 质量保证机制

```mermaid
flowchart TD
A[开始Stage 1] --> B[文件读取验证]
B --> C[自动校验]
C --> D[交叉验证]
D --> E{检查通过?}
E --> |是| F[输出Handoff]
E --> |否| G[问题修复确认]
G --> H[用户选择修复路径]
H --> I[修复后重新检查]
I --> D
```

**图表来源**
- [SKILL.md:353-383](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L353-L383)

**章节来源**
- [SKILL.md:342-386](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L342-L386)

### Stage 2 - 需求文档

需求文档（Stage 2）生成完整的PRD文档。

#### Gate检查机制

```mermaid
flowchart LR
A[开始Gate 2] --> B[文件存在性检查]
B --> C[数据模型一致性检查]
C --> D[状态机完整性检查]
D --> E[风险操作约束检查]
E --> F[需求匹配度自检]
F --> G{所有检查通过?}
G --> |是| H[输出Handoff]
G --> |否| I[问题修复确认]
I --> J[用户选择修复项]
J --> K[修复后重新检查]
K --> C
```

**图表来源**
- [SKILL.md:400-431](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L400-L431)

**章节来源**
- [SKILL.md:389-434](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L389-L434)

### Stage 3 - 设计稿

设计稿（Stage 3）是工作流中最复杂的阶段，涉及Pencil设计系统的使用。

#### 设计系统集成

```mermaid
classDiagram
class DesignSystem {
+project-tokens.md
+project-layout.md
+project-patterns.md
+project-typography.md
+getVariables()
+setVariables()
}
class PencilDesign {
+openDocument()
+batchDesign()
+getScreenshot()
+getEditorState()
}
class ProjectContext {
+project_description.md
+componentLibrary
+designStandards
}
DesignSystem --> PencilDesign : "提供Token约束"
ProjectContext --> DesignSystem : "提供项目覆盖"
PencilDesign --> ProjectContext : "读取项目上下文"
```

**图表来源**
- [SKILL.md:101-125](file://das-ued-skills/opt/b-admin-pencil-design/SKILL.md#L101-L125)

#### 设计流程

```mermaid
sequenceDiagram
participant User as 用户
participant Designer as 设计师
participant Pencil as Pencil编辑器
participant DS as 设计系统
User->>Designer : 提供PRD和设计要求
Designer->>DS : 读取设计系统约束
Designer->>Pencil : 创建设计副本
Designer->>Pencil : 设置Variables
Designer->>Pencil : 批量设计页面
Pencil-->>Designer : 截图验证
Designer->>User : AskQuestion确认
User-->>Designer : 确认设计
Designer->>Pencil : 更新设计
```

**图表来源**
- [SKILL.md:486-537](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L486-L537)

**章节来源**
- [SKILL.md:437-611](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L437-L611)

### Stage 3.5 - 设计验证

设计验证（Stage 3.5）在设计稿完成后执行，确保设计质量。

#### 验证流程

```mermaid
flowchart TD
A[开始设计验证] --> B[设计-文档差异检查]
B --> C{有差异?}
C --> |是| D[用户选择回写内容]
C --> |否| E[执行验证工具]
D --> E
E --> F[启发式评估]
F --> G[设计合规检查]
G --> H[预测性热图分析]
H --> I[UX有效性评估]
I --> J[P0问题处理]
J --> K{P0修复完成?}
K --> |是| L[输出验证报告]
K --> |否| M[用户选择跳过]
M --> L
```

**图表来源**
- [SKILL.md:623-762](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L623-L762)

**章节来源**
- [SKILL.md:614-766](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L614-L766)

### Stage 4 - 前端代码

前端代码（Stage 4）将设计稿转换为Vue 3代码。

#### 代码生成模式

```mermaid
flowchart LR
A[开始代码生成] --> B{组件库识别}
B --> C[设计系统模式]
B --> D[Faithful模式]
C --> E[使用das-component-vue]
D --> F[像素级还原]
E --> G[生成Vue 3代码]
F --> G
G --> H[代码审查]
H --> I[错误处理加固]
I --> J[国际化支持]
```

**图表来源**
- [SKILL.md:40-90](file://das-ued-skills/opt/pencil-to-code/SKILL.md#L40-L90)

**章节来源**
- [SKILL.md:768-800](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L768-L800)

## 依赖关系分析

### 技能依赖图

```mermaid
graph TB
subgraph "核心技能"
A[opt-prd-ux-code] --> B[opt-pro-ux-code-init]
A --> C[opt-discovery]
A --> D[opt-design-validation]
A --> E[opt-b-admin-pencil-design]
A --> F[opt-pencil-to-code]
A --> G[opt-frontend-design]
A --> H[opt-harden]
end
subgraph "支撑技能"
B --> I[项目上下文]
E --> J[设计系统]
F --> K[组件库识别]
D --> L[设计规范]
end
subgraph "外部依赖"
J --> M[Pencil编辑器]
K --> N[Vue 3生态]
L --> O[设计规范]
end
A --> P[文件系统]
P --> Q[docs/ux/]
P --> R[src/views/]
```

**图表来源**
- [README.md:203-251](file://das-ued-skills/README.md#L203-L251)

### 数据依赖关系

```mermaid
erDiagram
PROJECT_DESCRIPTION {
string brand_color
string design_philosophy
string project_constraints
datetime last_updated
}
SESSION_STATE {
string module_name
int start_stage
array skipped_stages
array completed_stages
array pending_stages
string design_system_status
}
DESIGN_CHECKLIST {
string page_name
string status
string completion_date
string notes
}
HEURISTIC_REPORT {
string module_name
int p0_count
int p1_count
int p2_count
string overall_rating
datetime generated_date
}
PROJECT_DESCRIPTION ||--o{ SESSION_STATE : "提供上下文"
SESSION_STATE ||--o{ DESIGN_CHECKLIST : "生成检查清单"
SESSION_STATE ||--o{ HEURISTIC_REPORT : "生成验证报告"
```

**图表来源**
- [SKILL.md:234-261](file://das-ued-skills/opt/prd-ux-code/SKILL.md#L234-L261)

**章节来源**
- [README.md:203-251](file://das-ued-skills/README.md#L203-L251)

## 性能考虑

### 执行效率优化

1. **并行处理**：Stage 0的研究工具可以并行执行，提高整体效率
2. **增量更新**：Gate检查失败时只修复特定问题，避免重新执行整个阶段
3. **缓存机制**：项目上下文和设计系统规则会缓存，减少重复读取
4. **智能跳过**：根据项目状态智能跳过不必要的阶段

### 资源管理

- **内存优化**：大型.pencil文件只读取必要的画板，避免内存溢出
- **网络优化**：竞品分析工具在网络受限时自动降级为AI知识路径
- **存储优化**：定期清理临时文件和中间产物

## 故障排除指南

### 常见问题及解决方案

#### 安装问题

| 问题 | 症状 | 解决方案 |
|------|------|----------|
| 技能找不到 | 在AI助手中搜索不到技能 | 检查安装目录与助手配置一致 |
| 权限错误 | 安装脚本执行失败 | 确保有足够权限访问目标目录 |
| 网络问题 | 下载依赖失败 | 检查网络连接，使用代理或离线安装 |

#### 执行问题

| 问题 | 症状 | 解决方案 |
|------|------|----------|
| Gate检查失败 | Gate显示未通过 | 修复相关问题后重新执行检查 |
| 设计系统不匹配 | 生成的代码不符合规范 | 检查project_description.md中的设计系统配置 |
| Pencil集成问题 | 无法读取.pencil文件 | 确保Pencil编辑器正常运行，检查文件权限 |

#### 数据问题

| 问题 | 症状 | 解决方案 |
|------|------|----------|
| 项目上下文缺失 | 设计类技能报错 | 运行`opt-pro-ux-code-init`建立项目上下文 |
| 文件路径错误 | 读取文件失败 | 检查文件路径是否正确，确认文件存在 |
| 版本冲突 | 生成代码与现有代码冲突 | 使用版本快照功能对比差异，选择合适版本 |

**章节来源**
- [README.md:322-344](file://das-ued-skills/README.md#L322-L344)

## 结论

das-ued-skills提供了一套完整、可追溯的设计开发工作流程，通过严格的Gate门控和文件优先原则，确保每个阶段的质量和可追溯性。该系统特别适合团队协作，能够：

1. **标准化流程**：通过明确的阶段划分和Gate检查，确保流程的一致性
2. **提高效率**：通过智能跳过和并行处理，减少不必要的工作
3. **保证质量**：通过多层次的验证和检查，确保输出质量
4. **便于协作**：通过文件系统和版本管理，便于团队协作和知识传承

建议团队在实施时：
- 先运行`opt-pro-ux-code-init`建立项目上下文
- 根据项目特点选择合适的阶段组合
- 严格执行Gate门控，确保质量
- 定期回顾和优化工作流程

## 附录

### 安装配置指南

#### 一键安装

```bash
# macOS/Linux
./cli/install-skills.sh --ai cursor

# Windows（Git Bash）
bash cli/install-skills.sh --ai cursor

# 自定义安装目录
./cli/install-skills.sh --ai cursor --target-dir "/custom/path/to/skills"
```

#### 全局Rules同步

```bash
# 同步全局Rules到各助手目录
./cli/install-skills.sh --ai cursor
```

#### 项目资产同步

```bash
# 复制项目资产到目标项目根目录
./cli/sync-project-assets.sh --project-root "/path/to/your-project" --force
```

### 使用示例

#### 新产品从0到1

1. 运行`opt-pro-ux-code-init`建立设计上下文
2. 运行`opt-prd-ux-code`，按提示确认从Stage 0或1开始
3. 每个Gate后回复"确认"

#### 已有PRD，需要设计稿

1. 将PRD放在`docs/ux/{模块名}/prd.md`
2. 运行`opt-prd-ux-code`，说明"已有PRD"，从Stage 3开始
3. 确认目标.pencil文件路径

#### 设计改了，要同步回文档

在对话中说"同步设计到文档"，会触发设计-文档差异检查流程，无需走完整Stage。

### 最佳实践

1. **建立项目上下文**：首次使用必须运行`opt-pro-ux-code-init`
2. **严格执行Gate**：每个阶段完成后必须获得用户确认
3. **文件优先**：所有产出都写入docs/ux/{模块名}/目录
4. **版本管理**：定期创建版本快照，便于追溯
5. **团队协作**：确保所有成员使用相同的技能和规范