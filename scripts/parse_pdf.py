"""
解析南京信息价PDF，提取材料价格数据
输出结构化JSON供系统使用
"""
import pdfplumber
import json
import re
import sys
import os

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "latest_info_price.pdf")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "parsed_prices.json")

def main():
    print(f"→ 解析PDF: {PDF_PATH}")
    results = []
    all_tables = []  # 记录每个表的表头
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"  总页数: {len(pdf.pages)}")
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            tables = page.extract_tables() or []
            if i < 3 or (i + 1) % 10 == 0:
                print(f"  第{i+1}页: 文本{len(text)}字, 表格{len(tables)}个")

            # 解析表格
            for tbl_idx, table in enumerate(tables):
                if not table or len(table) < 2:
                    continue
                # 识别表头
                header = [str(c).strip() if c else "" for c in table[0]]
                if header not in [h for h in all_tables]:
                    all_tables.append(header)
                # 确定当前材料大类（从文本中推断）
                section = "其它"
                if "建筑材料" in text or i < 10:
                    section = "建筑材料"
                elif "安装材料" in text:
                    section = "安装材料"
                elif "市政材料" in text:
                    section = "市政材料"
                elif "装饰材料" in text:
                    section = "装饰材料"
                elif "园林苗木" in text or "苗木" in text:
                    section = "园林苗木"

                for row in table[1:]:
                    if not row or len(row) < 3:
                        continue
                    cells = [str(c).strip() if c else "" for c in row]
                    if all(not c for c in cells):
                        continue
                    results.append({
                        "page": i + 1,
                        "table": tbl_idx,
                        "section": section,
                        "header": header,
                        "cells": cells,
                    })

    print(f"\n✓ 共提取 {len(results)} 行数据")

    # 输出前20行示例
    print("\n前20行示例:")
    for r in results[:20]:
        print(f"  P{r['page']}T{r['table']}: {r['cells']}")

    # 保存
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n✓ 结果已保存: {OUT_PATH}")

if __name__ == "__main__":
    main()
