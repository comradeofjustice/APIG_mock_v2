#!/usr/bin/env python3
"""
update_report.py
将新收集的竞品资料（作品/视频）批量写入报告 Markdown 文件。
解决 Cursor StrReplace 工具处理大段中文字符时的可靠性问题。

用法：
    python3 scripts/update_report.py --report docs/xxx-竞品分析.md --dry-run
    python3 scripts/update_report.py --report docs/xxx-竞品分析.md

功能：
    1. 扫描报告中的「暂未捕获」占位符并列出
    2. 替换指定章节内容（传入 old_block/new_block）
    3. 追加内容到指定章节末尾
    4. 更新报告尾注的检索日期
"""

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path


def load_report(filepath: str) -> str:
    """读取报告文件"""
    path = Path(filepath)
    if not path.exists():
        print(f"❌ 文件不存在：{filepath}", file=sys.stderr)
        sys.exit(1)
    return path.read_text(encoding="utf-8")


def save_report(filepath: str, content: str, dry_run: bool = False) -> None:
    """保存报告文件"""
    if dry_run:
        print(f"[DRY-RUN] 未写入文件，内容长度：{len(content)} 字符")
        return
    Path(filepath).write_text(content, encoding="utf-8")
    print(f"✅ 已写入：{filepath}")


def scan_placeholders(content: str) -> list[dict]:
    """扫描报告中的占位符行"""
    placeholders = []
    for i, line in enumerate(content.split("\n"), 1):
        if any(p in line for p in ["暂未捕获", "建议人工检索", "需登录后检索"]):
            placeholders.append({"line": i, "content": line.strip()[:80]})
    return placeholders


def replace_block(content: str, old_block: str, new_block: str) -> tuple[str, bool]:
    """替换指定文本块，返回 (新内容, 是否成功)"""
    if old_block not in content:
        # 尝试忽略空白差异的模糊匹配
        normalized_old = re.sub(r"\s+", " ", old_block.strip())
        normalized_content = re.sub(r"\s+", " ", content)
        if normalized_old not in normalized_content:
            return content, False
    return content.replace(old_block, new_block, 1), True


def append_to_section(content: str, section_anchor: str, new_rows: list[str]) -> tuple[str, bool]:
    """
    在指定章节末尾（最后一个表格行之后）追加新行。
    section_anchor：章节标题字符串，如「### 4.1 Behance」
    new_rows：要追加的 Markdown 表格行列表
    """
    idx = content.find(section_anchor)
    if idx == -1:
        return content, False

    # 找到该章节之后的第一个空行（代表表格结束）
    section_content = content[idx:]
    lines = section_content.split("\n")

    # 找到最后一个非空表格行
    last_table_line = -1
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and line.strip().endswith("|"):
            last_table_line = i

    if last_table_line == -1:
        return content, False

    # 在最后一个表格行之后插入新行
    insert_pos = idx + sum(len(l) + 1 for l in lines[: last_table_line + 1])
    new_content = (
        content[:insert_pos]
        + "\n"
        + "\n".join(new_rows)
        + "\n"
        + content[insert_pos:]
    )
    return new_content, True


def update_footer_date(content: str, update_summary: str) -> str:
    """更新报告尾注中的检索日期"""
    today = datetime.now().strftime("%Y-%m-%d")
    # 匹配尾注格式
    pattern = r"（本次更新：[\d-]+，[^）]+）"
    replacement = f"（本次更新：{today}，{update_summary}）"

    if re.search(pattern, content):
        return re.sub(pattern, replacement, content, count=1)

    # 若无「本次更新」字段，在首次检索日期后添加
    pattern2 = r"(，[\d-]+ 检索)"
    if re.search(pattern2, content):
        return re.sub(
            pattern2,
            f"\\1（本次更新：{today}，{update_summary}）",
            content,
            count=1,
        )

    return content


# ─── 主函数 ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="竞品报告内容更新工具")
    parser.add_argument("--report", required=True, help="目标报告文件路径")
    parser.add_argument(
        "--dry-run", action="store_true", help="预览模式，不写入文件"
    )
    parser.add_argument("--scan", action="store_true", help="仅扫描占位符，不做修改")
    args = parser.parse_args()

    content = load_report(args.report)

    # 扫描模式
    if args.scan:
        placeholders = scan_placeholders(content)
        if not placeholders:
            print("✅ 报告中无「暂未捕获」占位符，内容已完整。")
        else:
            print(f"⚠️  发现 {len(placeholders)} 处占位符：\n")
            for p in placeholders:
                print(f"  行 {p['line']:>4}: {p['content']}")
        return

    print(f"📄 已读取报告：{args.report}（{len(content.split(chr(10)))} 行）")
    placeholders = scan_placeholders(content)
    print(f"📋 当前占位符数量：{len(placeholders)}")

    # ── 在这里编写具体替换逻辑 ──────────────────────────────────────────────
    # 示例：替换站酷 3.1 节
    # old_block = """| （暂未捕获具体作品，建议人工检索） | 站酷 | ..."""
    # new_block = """| **火车站安防 3D 数据可视化**..."""
    # content, ok = replace_block(content, old_block, new_block)
    # if ok:
    #     print("✅ 站酷 3.1 节替换成功")
    # else:
    #     print("⚠️  站酷 3.1 节替换失败，请检查 old_block 是否匹配")

    # 更新尾注
    # content = update_footer_date(content, "补充 Behance 新作品 5 条，B 站视频 9 条")

    save_report(args.report, content, dry_run=args.dry_run)

    # 完成后再次扫描
    remaining = scan_placeholders(content)
    if remaining:
        print(f"\n⚠️  仍有 {len(remaining)} 处未处理占位符，请手动补充或再次运行。")
    else:
        print("\n✅ 报告中已无占位符，内容完整！")


if __name__ == "__main__":
    main()
