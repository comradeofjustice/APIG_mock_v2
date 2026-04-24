---
name: opt-cybersecurity-competitive-research
description: 网络安全领域竞品资料自动化收集技能：从竞品官网抓取产品信息，在 Bilibili/AcFun/YouTube/官网收集视频链接，在站酷/UI中国/Behance/Dribbble 收集具体设计作品链接，最终将真实确认的资料更新到指定 Markdown 竞品分析报告中，替代所有「暂未捕获」占位符。当用户提到「补充竞品资料」「收集安全产品信息」「搜索竞品视频」「设计平台找参考」「更新竞品分析报告」时使用此技能。
layer: 2
---

# 网络安全竞品资料收集

针对网络安全领域（SOC/SIEM/MDR/威胁情报/安全事件报告）的竞品分析，按固定流程从三类渠道收集真实资料并写入报告。

**适用报告文件**：`docs/*-竞品分析.md`（本项目内所有竞品分析文档）

详细平台规则、关键词库见 [references.md](references.md)；报告完整模板见 [assets/report-template.md](assets/report-template.md)。

---

## 何时使用

- 用户说「帮我补充竞品资料」「收集安全产品的设计参考」
- 用户说「去 B 站搜一下」「Behance 找找安全仪表盘」
- 用户说「更新竞品分析报告」「把暂未捕获的那些填上」
- 报告中存在「暂未捕获具体作品，建议人工检索」占位符需要替换

---

## 执行步骤

### 第一步：读取报告，确认待补充范围

```
1. Read 目标报告文件（docs/*-竞品分析.md）
2. 找出所有含「暂未捕获」「建议人工检索」「需登录后检索」的行
3. 确认竞品清单（一览表中的产品名称和 URL）
4. 明确本次收集的三类任务：竞品产品页 / 视频平台 / 设计平台
```

---

### 第二步：竞品官网产品信息收集

对报告竞品清单中每个条目，用 **WebFetch** 访问官网，记录：

| 字段 | 说明 |
|------|------|
| 关键统计数字 | 报告首屏展示的量化数据（如「27秒突破时间」） |
| 核心章节/功能模块 | 产品分区结构、界面模块名称 |
| 设计风格关键词 | 颜色（深色/浅色）、布局形式、视觉语言 |
| Webinar/视频链接 | 官网 Resources/Videos 页面的演示视频 |

**工具选择策略**：
- `WebFetch` → CrowdStrike、Sophos 文档页（可正常返回内容）
- `WebSearch site:domain.com` → Verizon 等超时页面的补救方案
- 对抓取超时的页面：记录已知信息 + 附官方链接，不留空白

---

### 第三步：视频平台收集

按 **YouTube/国际 → B 站 → AcFun → 国内官网** 顺序执行。

#### 3.1 B 站（哔哩哔哩）— 关键词注意事项

> ⚠️ 搜索「安全事件报告」会混入大量「生产安全事故报告（工业安全）」内容，必须使用以下精准词组：

| 推荐搜索词 | 说明 |
|-----------|------|
| `网络安全年度报告` | 找年度威胁报告类视频 |
| `SOC安全运营中心` | 找 SOC 运营/告警管理类内容 |
| `安全运营 可视化大屏` | 找大屏技术/实现视频 |
| `护网 告警处置` | 找实战演练/报告编写技巧 |
| `威胁情报 SIEM` | 找平台演示类内容 |

**工具**：`WebFetch` 访问 `https://search.bilibili.com/all?keyword=关键词`，返回视频标题 + BV 号 + 发布者，可直接提取链接。

#### 3.2 AcFun

用 `WebFetch` 或 `WebSearch site:acfun.cn` 搜索，若无相关专题视频，保留站内搜索链接并注明「暂未找到专题视频」。

#### 3.3 YouTube

用 `WebSearch` 搜索 `[产品名] demo site:youtube.com` 或 `cybersecurity [功能词] tutorial 2024`。

#### 3.4 输出格式（强制）

报告中必须同时包含：
1. **视频搜集流程说明**（检索顺序、降级策略）
2. **分渠道视频链接表**（YouTube → B 站 → AcFun → 官网，每段一个表格）

无专题视频的渠道：保留搜索链接 + 注明「暂未找到专题视频」。

---

### 第四步：设计平台作品收集

| 平台 | 工具 | 原因 |
|------|------|------|
| Behance | `WebFetch` 访问搜索页 | 返回具体作品标题 + URL |
| Dribbble | `WebSearch site:dribbble.com` | WebFetch 超时 |
| 站酷（ZCOOL） | `WebSearch site:zcool.com.cn` | JS 渲染，WebFetch 无法获取作品列表 |
| UI 中国 | `WebSearch site:ui.cn` | JS 渲染 |
| 花瓣 | 提供搜索链接（需登录）| 需用户手动操作 |

**Behance 搜索 URL 格式**：
```
https://www.behance.net/search/projects/[关键词]
```
返回内容包含：作品标题、创作者名称、赞/浏览数、发布时间。

**每条设计作品记录格式**：
```
| 作品标题（创作者，发布日期）| 平台 | [查看](URL) | 检索词 | 可借鉴点描述 |
```

---

### 第五步：更新报告

1. **替换占位符**：将所有「暂未捕获具体作品，建议人工检索」行替换为真实作品行
2. **新增内容**：在现有确认内容行**之后**追加新找到的作品/视频
3. **竞品深度分析更新**：补充核心统计数字和新增链接（Webinar、Adversary Hub 等）
4. **更新报告尾注**：注明检索日期和本次补充内容摘要

**Python 替换脚本**（处理中文字符 encoding 问题）：
```python
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(old_block, new_block, 1)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
```

> ⚠️ 不要用 StrReplace 工具处理含中文的大段落替换，用 Python Shell 脚本更可靠。

---

## 输出质量检查清单

收集完成后，对照以下清单验证报告：

- [ ] 无「暂未捕获」占位符剩余（或已注明合理理由）
- [ ] 每个设计作品条目含：标题 + 作者 + URL + 可借鉴点
- [ ] 视频章节含「搜集流程说明」小节
- [ ] 四个视频渠道均有条目（无视频时保留搜索链接）
- [ ] 竞品深度分析中的关键数字已更新为最新值
- [ ] 所有 URL 均为真实链接（不含编造的链接）
- [ ] 尾注更新了检索日期

---

## 快速工作流

```
1. Read 报告 → 找出所有「暂未捕获」行 → 确认待收集范围
2. 竞品官网：WebFetch/WebSearch → 提取关键数据和视频链接
3. B站：WebFetch bilibili.com/search → 用精准关键词 → 记录 BV 号
4. AcFun：WebFetch/WebSearch → 无视频则保留搜索链接
5. Behance：WebFetch search 页 → 提取作品列表
6. Dribbble + ZCOOL：WebSearch site: → 提取作品链接
7. Python 脚本批量替换报告内容 → 验证清单 → Done
```
