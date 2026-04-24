#!/usr/bin/env python3
"""
fetch_competitor_info.py
批量检查竞品 URL 的可访问性，输出访问可行性报告。
Agent 执行前先运行此脚本，确认哪些 URL 需要用 WebFetch，哪些需要改用 WebSearch。

用法：
    python3 scripts/fetch_competitor_info.py
    python3 scripts/fetch_competitor_info.py --timeout 10

输出：各竞品 URL 的响应状态报告（Markdown 格式）
"""

import argparse
import sys
import time
import urllib.request
import urllib.error
from urllib.parse import urlparse

# ─── 待检查的竞品 URL（按类型分组）──────────────────────────────────────────
COMPETITOR_URLS = {
    "竞品官网": {
        "CrowdStrike GTR 2026": "https://www.crowdstrike.com/global-threat-report/",
        "Verizon DBIR 2025": "https://www.verizon.com/business/resources/reports/dbir/",
        "Sophos MDR Dashboard 文档": "https://docs.sophos.com/central/customer/help/en-us/ManageYourProducts/MDR/MDRDashboard/",
        "Microsoft Sentinel 产品页": "https://azure.microsoft.com/en-us/products/microsoft-sentinel",
        "Splunk Enterprise Security": "https://www.splunk.com/en_us/products/enterprise-security.html",
    },
    "设计平台搜索页": {
        "Behance 安全仪表盘搜索": "https://www.behance.net/search/projects/cyber+security+dashboard",
        "Dribbble 安全仪表盘搜索": "https://dribbble.com/search/security+dashboard+dark",
    },
    "视频平台": {
        "B 站搜索（网络安全年度报告）": "https://search.bilibili.com/all?keyword=%E7%BD%91%E7%BB%9C%E5%AE%89%E5%85%A8%E5%B9%B4%E5%BA%A6%E6%8A%A5%E5%91%8A",
        "B 站搜索（SOC安全运营中心）": "https://search.bilibili.com/all?keyword=SOC%E5%AE%89%E5%85%A8%E8%BF%90%E8%90%A5%E4%B8%AD%E5%BF%83",
    },
}

# 工具推荐（基于实验验证）
TOOL_RECOMMENDATION = {
    "crowdstrike.com": "WebFetch ✅",
    "docs.sophos.com": "WebFetch ✅",
    "azure.microsoft.com": "WebFetch ✅",
    "splunk.com": "WebFetch ✅",
    "verizon.com": "WebSearch ⚠️（常超时）",
    "behance.net": "WebFetch ✅",
    "dribbble.com": "WebSearch ⚠️（超时）",
    "bilibili.com": "WebFetch ✅",
    "zcool.com.cn": "WebSearch ⚠️（JS渲染）",
    "ui.cn": "WebSearch ⚠️（JS渲染）",
    "acfun.cn": "WebFetch / WebSearch",
}


def check_url(url: str, timeout: int = 8) -> dict:
    """检查 URL 可访问性"""
    domain = urlparse(url).netloc.replace("www.", "")
    tool = next(
        (v for k, v in TOOL_RECOMMENDATION.items() if k in domain),
        "WebFetch（未知）",
    )

    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            },
        )
        start = time.time()
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            elapsed = time.time() - start
            return {
                "status": resp.status,
                "elapsed": f"{elapsed:.1f}s",
                "tool": tool,
                "note": "✅ 可直接访问",
            }
    except urllib.error.HTTPError as e:
        return {"status": e.code, "elapsed": "-", "tool": tool, "note": f"⚠️ HTTP {e.code}"}
    except urllib.error.URLError as e:
        reason = str(e.reason)
        if "timed out" in reason.lower():
            return {"status": 0, "elapsed": f">{timeout}s", "tool": tool, "note": "⏱️ 超时"}
        return {"status": 0, "elapsed": "-", "tool": tool, "note": f"❌ 错误：{reason[:40]}"}
    except Exception as e:
        return {"status": 0, "elapsed": "-", "tool": tool, "note": f"❌ {str(e)[:40]}"}


def main():
    parser = argparse.ArgumentParser(description="竞品 URL 可访问性检查工具")
    parser.add_argument("--timeout", type=int, default=8, help="超时秒数（默认 8）")
    args = parser.parse_args()

    print("# 竞品 URL 可访问性检查报告\n")
    print(f"> 检查时间：自动生成 | 超时设置：{args.timeout}s\n")

    for category, urls in COMPETITOR_URLS.items():
        print(f"## {category}\n")
        print("| 竞品/页面 | URL 域名 | 状态 | 耗时 | 推荐工具 | 备注 |")
        print("|-----------|---------|------|------|---------|------|")
        for name, url in urls.items():
            domain = urlparse(url).netloc
            print(f"| 检查中：{name}... ", end="", flush=True)
            result = check_url(url, args.timeout)
            print(f"\r| {name} | {domain} | {result['status']} | {result['elapsed']} | {result['tool']} | {result['note']} |")
            time.sleep(1)  # 礼貌爬取间隔
        print()

    print("---")
    print("## 工具选择速查\n")
    print("| 平台域名 | 推荐工具 | 原因 |")
    print("|---------|---------|------|")
    reasons = {
        "crowdstrike.com": "页面正常渲染，内容丰富",
        "docs.sophos.com": "文档静态页面，WebFetch 可抓取",
        "azure.microsoft.com": "产品页内容正常",
        "splunk.com": "产品页内容正常",
        "verizon.com": "CDN 防护，常超时",
        "behance.net": "搜索结果页直接含作品列表",
        "dribbble.com": "WebFetch 超时，WebSearch 可获取摘要",
        "bilibili.com": "搜索页返回视频标题+BV号，完整可用",
        "zcool.com.cn": "JS 渲染，WebFetch 无法获取作品列表",
        "ui.cn": "JS 渲染，WebFetch 无法获取作品列表",
    }
    for domain, (tool, reason) in zip(
        TOOL_RECOMMENDATION.keys(),
        [(v, reasons.get(k, "-")) for k, v in TOOL_RECOMMENDATION.items()],
    ):
        print(f"| {domain} | {tool} | {reason} |")


if __name__ == "__main__":
    main()
