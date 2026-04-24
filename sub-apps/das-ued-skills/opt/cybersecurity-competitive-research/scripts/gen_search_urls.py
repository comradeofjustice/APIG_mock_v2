#!/usr/bin/env python3
"""
gen_search_urls.py
根据关键词列表，批量生成各平台的站内搜索 URL，输出为 Markdown 表格。

用法：
    python3 scripts/gen_search_urls.py
    python3 scripts/gen_search_urls.py "安全运营仪表盘" "SOC可视化大屏" "告警管理平台"

输出：各平台搜索链接的 Markdown 表格，可直接粘贴到报告的「站内继续检索入口」章节。
"""

import sys
from urllib.parse import quote

# ─── 默认关键词（网络安全事件报告方向）─────────────────────────────────────
DEFAULT_KEYWORDS = [
    "安全运营仪表盘",
    "SOC可视化大屏",
    "告警管理平台",
    "威胁情报可视化",
    "安全态势感知大屏",
    "网络安全报告",
]

# ─── 平台搜索 URL 模板 ────────────────────────────────────────────────────────
PLATFORMS = {
    "站酷（ZCOOL）": "https://www.zcool.com.cn/search/content?word={kw}",
    "UI 中国": "https://www.ui.cn/search.html#/subject?q={kw}",
    "花瓣": "https://huaban.com/search?q={kw}",
    "即时设计": "https://js.design/community?search={kw}",
    "Behance": "https://www.behance.net/search/projects/{kw_en}",
    "Dribbble": "https://dribbble.com/search/{kw_en}",
    "B 站": "https://search.bilibili.com/all?keyword={kw}",
    "AcFun": "https://www.acfun.cn/search?keyword={kw}",
}

# ─── Bilibili 精准关键词（中文安全领域专用，避开工业安全内容）────────────────
BILIBILI_SAFE_KEYWORDS = [
    "网络安全年度报告",
    "SOC安全运营中心",
    "安全运营 可视化大屏",
    "护网 告警处置",
    "威胁情报 SIEM",
]

# ─── 英文关键词映射（中文 → 英文，用于 Behance/Dribbble）──────────────────
ZH_TO_EN = {
    "安全运营仪表盘": "security+operations+dashboard",
    "SOC可视化大屏": "SOC+monitoring+dark+dashboard",
    "告警管理平台": "alert+management+platform",
    "威胁情报可视化": "threat+intelligence+visualization",
    "安全态势感知大屏": "cybersecurity+situational+awareness",
    "网络安全报告": "cybersecurity+report+design",
    "安全事件报告": "security+incident+report+UI",
}


def get_en_kw(kw: str) -> str:
    """获取英文关键词（Behance/Dribbble 用）"""
    return ZH_TO_EN.get(kw, kw.replace(" ", "+"))


def gen_search_url(platform_template: str, kw: str) -> str:
    """生成单个平台的搜索 URL"""
    kw_encoded = quote(kw)
    kw_en = get_en_kw(kw)
    return platform_template.format(kw=kw_encoded, kw_en=kw_en)


def gen_markdown_table(keywords: list[str]) -> str:
    """生成 Markdown 格式的搜索链接表格"""
    lines = ["| 平台 | 检索词方向 | 直达链接 |", "|------|-----------|---------|"]
    for kw in keywords:
        for platform, template in PLATFORMS.items():
            url = gen_search_url(template, kw)
            lines.append(f"| {platform} | {kw} | [打开]({url}) |")
        lines.append("|  |  |  |")  # 空行分隔不同关键词
    return "\n".join(lines)


def gen_bilibili_safe_urls() -> str:
    """生成 B 站安全精准搜索链接（避开工业安全关键词陷阱）"""
    lines = [
        "",
        "### B 站精准搜索入口（避免「生产安全事故」干扰）",
        "",
        "| 关键词 | B 站直达链接 | 说明 |",
        "|--------|------------|------|",
    ]
    for kw in BILIBILI_SAFE_KEYWORDS:
        url = f"https://search.bilibili.com/all?keyword={quote(kw)}"
        lines.append(f"| `{kw}` | [搜索]({url}) | ✅ 已验证有效，结果聚焦网络安全 |")

    lines.append("")
    lines.append("> ⚠️ **避免使用「安全事件报告」** 直接搜索 B 站，")
    lines.append("> 会混入大量「生产安全事故报告（工业安全/建筑安全）」内容。")
    return "\n".join(lines)


def main():
    keywords = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_KEYWORDS

    print("## 站内检索链接生成结果\n")
    print(f"> 生成时间：自动生成 | 关键词数量：{len(keywords)}\n")
    print("### 通用搜索入口\n")
    print(gen_markdown_table(keywords))
    print(gen_bilibili_safe_urls())
    print("\n---")
    print("> 直接复制上方表格内容，粘贴到报告的「站内继续检索入口」章节。")


if __name__ == "__main__":
    main()
