# 竞品研究参考资料库

> 本文件记录已验证的平台访问规律、关键词库、竞品清单和内容格式标准。每次执行 Skill 时按需读取本文件。

---

## 一、已确认竞品清单

### 1.1 网络安全事件报告类（直接竞品）

| 竞品 | 形态 | 官网链接 | 访问可行性 |
|------|------|---------|-----------|
| CrowdStrike Global Threat Report 2026 | 交互网页 + PDF | https://www.crowdstrike.com/global-threat-report/ | ✅ WebFetch 可用 |
| Verizon DBIR 2025 | PDF + Infographic | https://www.verizon.com/business/resources/reports/dbir/ | ⚠️ 常超时，用 WebSearch 补救 |
| Sophos MDR Service Insights | SaaS 仪表盘 | https://docs.sophos.com/central/customer/help/en-us/ManageYourProducts/MDR/MDRDashboard/ | ✅ 文档页可抓取 |
| Microsoft Sentinel | SIEM 平台 | https://azure.microsoft.com/en-us/products/microsoft-sentinel | ✅ 产品页可抓取 |
| Splunk Enterprise Security | SIEM 仪表盘 | https://www.splunk.com/en_us/products/enterprise-security.html | ✅ 产品页可抓取 |
| AhnLab Plus（Behance 品牌视觉） | 品牌设计 | https://www.behance.net/gallery/204556999/Ahnlab-Plus-Securing-Against-Diverse-Threats | ✅ Behance 可抓取 |

### 1.2 国内安全厂商（参考竞品）

| 厂商 | 产品 | 官网 | 说明 |
|------|------|------|------|
| 奇安信 | 态势感知与安全运营平台（NGSOC） | https://www.qianxin.com/product/detail/pid/358 | 国内 SOC 平台代表 |
| 深信服 | 安全感知平台 | https://www.sangfor.com.cn | 国内主流安全厂商 |
| 瑞星 | 网络安全月度/年度报告 | https://www.rising.com.cn | 定期发布安全报告，B 站有视频 |

---

## 二、各平台访问规律（已验证）

### 2.1 Behance

- **工具**：`WebFetch`
- **搜索 URL 格式**：`https://www.behance.net/search/projects/[URL编码关键词]`
- **返回内容**：作品标题、创作者、赞/浏览数、发布日期（可直接提取）
- **注意**：需查看具体作品页获取详细描述；未登录无法看全部内容，但标题/链接可获取
- **已验证可用搜索词**：
  - `cyber+security+dashboard`（9000+ 结果）
  - `security+incident+dashboard`
  - `SOC+monitoring+dark`
  - `cybersecurity+report+design`

### 2.2 Dribbble

- **工具**：`WebSearch site:dribbble.com [关键词]`（WebFetch 超时）
- **URL 格式**：`https://dribbble.com/shots/[shot-id]-[slug]`
- **已验证有效 shots**：
  - `shots/5908532-Internet-Security-Dashboard-FortifyData`
  - `shots/25836547-Cyber-Security-Agency-UI-UX-Design`
  - `shots/8081478-Reporting-dashboard-for-UpGuard`
  - `shots/2620186-Rook-War-Room-Console`
  - `shots/25860544-Cyber-Security-App`

### 2.3 站酷（ZCOOL）

- **工具**：`WebSearch site:zcool.com.cn [关键词]`（WebFetch 获取不到作品列表）
- **作品 URL 格式**：`https://www.zcool.com.cn/work/Z[ID].html` 或 `https://m.zcool.com.cn/article/Z[ID].html`
- **已验证有效作品**：
  - 火车站安防 3D 可视化：`https://m.zcool.com.cn/article/ZMTYyNzQxNg==.html`
  - B端运营管控平台：`https://www.zcool.com.cn/work/ZNzI3OTA0ODQ=.html`
  - 数据可视化监控大屏：`https://www.zcool.com.cn/work/ZNDA3MzE0NDA=.html`
  - 公安指挥调度系统：`https://m.zcool.com.cn/article/ZMTM4OTM1Ng==.html`
- **搜索入口**：
  - `https://www.zcool.com.cn/search/content?word=[URL编码关键词]`

### 2.4 B 站（哔哩哔哩）

- **工具**：`WebFetch https://search.bilibili.com/all?keyword=[URL编码关键词]`
- **返回内容**：视频标题、BV 号、发布者、发布日期、播放量（可直接提取）
- **视频 URL 格式**：`https://www.bilibili.com/video/BV[BV号]/`

**⚠️ 关键词陷阱（已验证）**：

| 搜索词 | 问题 | 解决方案 |
|--------|------|---------|
| `安全事件报告` | 90% 返回「生产安全事故报告」（工业安全）| 改用「网络安全年度报告」 |
| `SOC` | 混入「SOC 芯片」「储能 SOC」「Bio SOC」| 改用「SOC安全运营中心」 |
| `安全大屏` | 可能混入消防/公安大屏 | 加「网络安全」前缀 |

**推荐关键词（已验证有效）**：
```
网络安全年度报告
SOC安全运营中心
安全运营 可视化大屏
护网 告警处置
SIEM 安全运营
威胁情报 可视化
网络安全运营概述
安全态势感知大屏（仍会混入，需人工过滤）
```

**已确认有效 B 站视频**：

| BV 号 | 标题关键词 | 类别 |
|-------|-----------|------|
| BV1Bdw4eTEDR | SOC 与 SOAR 概念介绍 | SOC 基础 |
| BV1614y147zt | 态势感知/安全SOC/日志审计区别 | SOC 定位 |
| BV1P5q2Y6Emv | 安全运营中心 SOC 2024-1 | SOC 入门 |
| BV1zG1GYpEWi | 网络安全运营概述-什么是安全运营 | 安全运营 |
| BV1w3PQzrEr4 | Security Operations & SOC 系列课程 | 系统课程 |
| BV1Ri421X7HJ | 护网流程、告警处置、报告编写技巧 | 直接相关 ⭐ |
| BV17WqHYtEZ3 | 2024网络安全行业总结与2025趋势 | 行业洞察 |
| BV1RLrABPEWs | 2025年十大网络攻击事件盘点（奇安信） | 年度报告 |
| BV1njwhenEJk | 2024年中国网络安全报告（瑞星） | 年度报告 |
| BV1xQm9Y9EL4 | Graylog/Wazuh/Security Onion SIEM | 技术背景 |
| BV1VW4y147vt | VUE+DataV+Echarts 创建科技大屏 | 前端技术 |

### 2.5 AcFun（A 站）

- **工具**：`WebFetch https://www.acfun.cn/search?keyword=[URL编码关键词]`
- **现状**：网络安全专题内容极少，通常保留搜索链接并注明「暂未找到专题视频」
- **搜索链接模板**：`https://www.acfun.cn/search?keyword=[关键词]`

### 2.6 YouTube

- **工具**：`WebSearch "[产品名] demo site:youtube.com"` 或直接 WebSearch
- **已确认有效视频**：

| 标题 | URL | 说明 |
|------|-----|------|
| SOC Dashboards Done Right（Ryan Thompson） | https://www.youtube.com/watch?v=tyfHJOt2jyE | SOC 仪表盘设计原则 |
| Sophos MDR Service Insights Demo | https://www.youtube.com/watch?v=W1sy5ok57DM | Sophos MDR 直接竞品演示 |
| Microsoft Sentinel AI & SIEM | https://www.youtube.com/watch?v=90VqWpkC19I | MS Sentinel 演示 |
| Splunk SOC Dashboard Tutorial | https://www.youtube.com/watch?v=2SoBxH4XBNM | Splunk 实操 |
| Unit 42 2024 Incident Response Report | https://www.youtube.com/watch?v=N0MELy38fDE | Palo Alto 报告解读 |
| Vigilens Cyberattack Execution Dashboard | https://www.youtube.com/watch?v=bSHF830AJGc | 攻击链可视化演示 |
| CrowdStrike AI Attack Demo | https://www.youtube.com/watch?v=ilVWaT9WheA | CrowdStrike 平台演示 |

---

## 三、关键词库（按收集目标分类）

### 3.1 设计平台关键词

| 中文 | 英文 | 优先级 |
|------|------|--------|
| 安全运营仪表盘 | security operations dashboard | ⭐⭐⭐ |
| SOC 可视化大屏 | SOC monitoring dark | ⭐⭐⭐ |
| 安全事件报告 UI | incident report UI | ⭐⭐⭐ |
| 威胁情报可视化 | threat intelligence visualization | ⭐⭐ |
| 告警管理平台 | alert management platform | ⭐⭐⭐ |
| 网络安全仪表盘 | cybersecurity dashboard | ⭐⭐⭐ |
| 安全态势感知大屏 | security situational awareness | ⭐⭐ |
| 攻击面管理 | attack surface management | ⭐⭐ |

### 3.2 视频平台关键词（按平台）

**B 站（中文精准词）**：
- `网络安全年度报告`、`SOC安全运营中心`、`安全运营 可视化大屏`
- `护网 告警处置`、`SIEM 安全运营`、`态势感知 安全SOC`
- `网络安全运营概述`、`奇安信 安全`、`深信服 安全运营`

**YouTube（英文词）**：
- `SOC dashboard design tutorial`、`cybersecurity incident report UI`
- `security dashboard demo 2024`、`[品牌名] demo tutorial`
- `SIEM dashboard walkthrough`、`threat intelligence report design`

---

## 四、已确认 Behance 作品库

> 以下为经实际访问验证的真实作品，可直接引用入报告：

| 作品名 | 创作者 | URL | 发布时间 | 亮点 |
|--------|--------|-----|---------|------|
| Enterprise Analytics UI for Alerts & Incidents | Anastasiia Kuzmenko | https://www.behance.net/gallery/245914977/Enterprise-Analytics-UI-for-Alerts-Incidents | 2026-03 | 完整告警管理 Case Study |
| Attack Surface Management - Dashboard Design（Vaultix） | M. Shafayet 等 | https://www.behance.net/gallery/244203219/Attack-Surface-Management-Dashboard-Design | 2026-02 | 攻击面管理仪表盘重设计 |
| SOCius - Cyber Security SaaS Dashboard Web App | Pixelean Agency | https://www.behance.net/gallery/236367227/SOCius-Cyber-Security-SaaS-Dashboard-Web-App | 2025-10 | 实时 SOC 仪表盘，664 赞 |
| Cybersecurity Dashboard | Yeasin Islam 等 | https://www.behance.net/gallery/212217641/Cybersecurity-Dashboard | 2024-11 | Admin 后台 UI，697 赞 |
| KPI Dashboard - Cyber Security | Multiple Owners | https://www.behance.net/gallery/243790529/KPI-Dashboard-Cyber-Security | 2025 | KPI 指标可视化 |
| Anarisk - Cybersecurity Dashboard | Multiple Owners | https://www.behance.net/gallery/235105693/Anarisk-Cybersecurity-Dashboard | 2025 | 完整案例，436 赞 |
| Risk Management Dashboard - Cyber Security | Multiple Owners | https://www.behance.net/gallery/246011903/Risk-Management-Dashboard-Cyber-Security | 2026-03 | 最新发布 |
| CyBer – Cybersecurity Monitoring Dashboard | Admiral Studios | https://www.behance.net/gallery/245670051/CyBer-Cybersecurity-Monitoring-Dashboard | 2026-03 | 专业工作室作品 |
| Cybersecurity Admin Dashboard | Multiple Owners | https://www.behance.net/gallery/211207381/Cybersecurity-Admin-Dashboard | 2024 | 高热度，641 赞 |
| Alert Management Platform | Ahmed Matar | https://www.behance.net/gallery/211993739/Alert-Management-Platform | 2024-11 | 告警管理完整 Case Study |
| Cybersecurity Dashboards for Power BI | Maham Farrukh Qureshi | https://www.behance.net/gallery/234176455/Cybersecurity-Dashboards-for-Power-BI | 2025 | Power BI 报告导出场景 |
| Bendrio - Cyber Security Website | Hamida Jannat | https://www.behance.net/gallery/245388135/Bendrio-Cyber-Security-website-design-landing-page | 2026-03 | AI 驱动安全官网 |
| Technology & Security Presentation Design | Alexandra Fokina | https://www.behance.net/gallery/240158803/Technology-Security-Presentation-Design-Vistas | 2025-12 | 安全报告 PPT 模板 |
| Ahnlab Plus - Platform Brand Visual | imagopictures | https://www.behance.net/gallery/204556999/Ahnlab-Plus-Securing-Against-Diverse-Threats | 2024-08 | 韩国安全厂商品牌视觉 |

---

## 五、表格格式标准

### 5.1 设计作品表格（Behance/Dribbble/站酷/UI中国）

```markdown
| 作品 / 专辑 | 平台 | 链接 | 检索词 | 可借鉴点 |
|------------|------|------|--------|---------|
| **作品名**（作者，YYYY-MM） | 平台名 | [查看](URL) | 检索词 | 可借鉴点说明；配色/布局/交互特点 |
```

**字段规范**：
- 作品名：加粗，后跟 `（作者，年月）`
- 链接文字统一用「查看」
- 可借鉴点：2-4 句，用中文分号分隔，聚焦布局/配色/组件/交互

### 5.2 视频表格

```markdown
| 标题 | 链接 | 说明 |
|------|------|------|
| 视频标题（发布者，YYYY-MM） | [观看](URL) | 2句话说明视频内容与参考价值 |
```

### 5.3 竞品深度分析表格

```markdown
| 字段 | 内容 |
|------|------|
| **名称** | 完整产品/报告名称 |
| **发布方** | 公司名 |
| **链接** | [查看官网](URL) · [附加链接说明](URL2) |
| **核心数据（年份）** | 用 • 分隔列出关键统计数字 |
| **设计风格** | 配色/布局/视觉语言关键词 |
| **可借鉴点** | ① 点1 ② 点2 ③ 点3 ④ 点4 |
```

---

## 六、报告尾注格式

```markdown
*本报告依据 `opt-cybersecurity-competitive-research` Skill 规范撰写，[初次检索日期] 首次发布（本次更新：[更新日期]，补充 [本次更新摘要]）。各平台内容可能随时间更新，建议 3 个月内复核检索结果。素材版权及商业授权须由项目组另行确认。*
```
