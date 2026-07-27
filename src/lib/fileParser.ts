/**
 * 文件解析模块
 *
 * 支持：
 * - PDF：提取文字内容
 * - Excel：解析表格数据
 * - 图片：返回元信息（OCR暂不实现）
 */

import * as XLSX from "xlsx";

export interface ParsedFileResult {
  text: string;
  tables: ParsedTable[];
  summary: string;
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

export interface ExtractedPriceRow {
  materialName: string;
  spec: string;
  brand: string;
  price: string;
  unit: string;
  supplier: string;
}

/**
 * 解析 PDF 文件，提取文字内容
 */
export async function parsePDF(file: File): Promise<ParsedFileResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjs = await import("pdfjs-dist");
    const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    const tables: ParsedTable[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const items = content.items as Array<{ str: string; transform: number[] }>;
      const lines: Map<number, string[]> = new Map();

      for (const item of items) {
        const y = Math.round(item.transform[5]);
        const bucket = Array.from(lines.keys()).find((k) => Math.abs(k - y) < 3);
        const key = bucket !== undefined ? bucket : y;
        if (!lines.has(key)) lines.set(key, []);
        lines.get(key)!.push(item.str);
      }

      const sortedLines = Array.from(lines.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, vals]) => vals.join("  "));

      fullText += sortedLines.join("\n") + "\n\n";
    }

    const priceRows = extractPricesFromText(fullText);
    return {
      text: fullText,
      tables: [],
      summary: `PDF共${pdf.numPages}页，提取到${fullText.length}字。${priceRows.length > 0 ? `识别到${priceRows.length}条疑似价格行。` : ""}`,
    };
  } catch (e) {
    return {
      text: "",
      tables: [],
      summary: `PDF解析失败：${e instanceof Error ? e.message : "未知错误"}`,
    };
  }
}

/**
 * 解析 Excel 文件
 */
export async function parseExcel(file: File): Promise<ParsedFileResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const tables: ParsedTable[] = [];
    let fullText = "";

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as string[][];

      if (jsonData.length === 0) continue;

      // 自动检测表头行：找包含文本最多且最有"表头感"的那一行
      const headerRowIdx = detectHeaderRow(jsonData);
      const headers = jsonData[headerRowIdx].map((h) => String(h).trim());
      const rows = jsonData
        .slice(headerRowIdx + 1)
        .map((row) => row.map((c) => String(c).trim()));

      tables.push({ headers, rows });
      const sheetText = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
      fullText += `=== ${sheetName} ===\n${sheetText}\n\n`;
    }

    const priceRows = extractPricesFromExcel(tables);
    return {
      text: fullText,
      tables,
      summary: `Excel共${workbook.SheetNames.length}个工作表，${tables.reduce((s, t) => s + t.rows.length, 0)}行数据。${priceRows.length > 0 ? `识别到${priceRows.length}条疑似价格行。` : ""}`,
    };
  } catch (e) {
    return {
      text: "",
      tables: [],
      summary: `Excel解析失败：${e instanceof Error ? e.message : "未知错误"}`,
    };
  }
}

/**
 * 自动检测表头行：找第一个有较多非空单元格的行
 * 启发式：取前 5 行里"看起来像表头"的那一行
 */
function detectHeaderRow(jsonData: string[][]): number {
  // 优先找第一行（最常见）
  if (jsonData[0] && jsonData[0].filter((c) => c && String(c).trim()).length >= 2) {
    return 0;
  }
  // 否则在前5行里找非空单元格最多的
  let bestIdx = 0;
  let bestCount = 0;
  for (let i = 0; i < Math.min(5, jsonData.length); i++) {
    const count = jsonData[i].filter((c) => c && String(c).trim()).length;
    if (count > bestCount) {
      bestCount = count;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export async function parseImage(file: File): Promise<ParsedFileResult> {
  return {
    text: "",
    tables: [],
    summary: `图片文件：${file.name}，${(file.size / 1024).toFixed(0)}KB。可手动录入价格信息。`,
  };
}

export async function parseFile(file: File): Promise<ParsedFileResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  if (ext === "pdf" || file.type === "application/pdf") {
    return parsePDF(file);
  }
  if (["xls", "xlsx", "csv"].includes(ext) || file.type.includes("spreadsheet") || file.type.includes("excel")) {
    return parseExcel(file);
  }
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext) || file.type.startsWith("image/")) {
    return parseImage(file);
  }

  return {
    text: "",
    tables: [],
    summary: `不支持的文件类型：${ext}。可手动录入价格信息。`,
  };
}

// ============ 价格提取逻辑 ============

function extractPricesFromText(text: string): ExtractedPriceRow[] {
  const rows: ExtractedPriceRow[] = [];
  const lines = text.split("\n");
  const pricePattern = /(\d+(?:[.,]\d+)?)\s*(?:元|￥|¥|RMB)/;

  for (const line of lines) {
    if (line.trim().length < 5) continue;
    const match = line.match(pricePattern);
    if (match) {
      rows.push({
        materialName: line.replace(pricePattern, "").trim().slice(0, 50),
        spec: "",
        brand: "",
        price: match[1],
        unit: "元",
        supplier: "",
      });
    }
  }

  return rows.slice(0, 50);
}

/**
 * 模糊匹配列名（不区分大小写，允许部分匹配）
 */
function fuzzyMatch(h: string, keywords: string[]): number {
  const low = h.toLowerCase().replace(/[\s_-]/g, "");
  return keywords.some((k) => low.includes(k.toLowerCase().replace(/[\s_-]/g, ""))) ? 1 : 0;
}

function findColIdx(headers: string[], keywords: string[]): number {
  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i] || "";
    if (!h) continue;
    // 完全匹配优先
    const low = h.toLowerCase().replace(/[\s_-]/g, "");
    for (const k of keywords) {
      const kl = k.toLowerCase().replace(/[\s_-]/g, "");
      if (low === kl) return i;
      if (low.includes(kl) || kl.includes(low)) {
        const score = 2;
        if (score > bestScore) { bestScore = score; bestIdx = i; }
      }
    }
  }
  // 退化匹配
  for (let i = 0; i < headers.length; i++) {
    const score = fuzzyMatch(headers[i] || "", keywords);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  return bestIdx;
}

/**
 * 检查单元格是否像价格：纯数字、含小数、含"元"等
 */
function isPriceLike(s: string): boolean {
  if (!s) return false;
  const t = s.replace(/[,¥￥元RMB\s]/g, "").trim();
  if (!/^\d+(\.\d+)?$/.test(t)) return false;
  const num = parseFloat(t);
  return num > 0 && num < 1e9;
}

function extractPricesFromExcel(tables: ParsedTable[]): ExtractedPriceRow[] {
  const rows: ExtractedPriceRow[] = [];

  for (const table of tables) {
    if (table.headers.length < 2) continue;
    if (table.rows.length === 0) continue;

    // 智能列匹配
    const nameIdx = findColIdx(table.headers, [
      "材料名称", "材料名", "物料名称", "物料名", "品名", "产品名称", "产品名", "名称", "材料", "货物", "物资", "项目", "商品", "内容"
    ]);
    const specIdx = findColIdx(table.headers, [
      "规格型号", "规格", "型号", "参数", "规格参数", "技术要求", "材质", "标号"
    ]);
    const brandIdx = findColIdx(table.headers, [
      "品牌", "厂家", "生产厂家", "制造商", "厂商", "商标", "生产商"
    ]);
    const priceIdx = findColIdx(table.headers, [
      "单价", "价格", "金额", "报价", "市场价", "参考价", "含税价", "单价(元)", "价格(元)", "元", "价"
    ]);
    const unitIdx = findColIdx(table.headers, [
      "单位", "计量单位", "计价单位"
    ]);
    const supplierIdx = findColIdx(table.headers, [
      "供应商", "供货商", "厂家", "来源", "供方", "厂商"
    ]);
    const qtyIdx = findColIdx(table.headers, [
      "数量", "工程量"
    ]);

    // 如果找不到价格列，尝试自动检测：找含数字最多的列
    let actualPriceIdx = priceIdx;
    if (actualPriceIdx === -1) {
      const priceLikeCount: number[] = new Array(table.headers.length).fill(0);
      for (const row of table.rows) {
        for (let c = 0; c < row.length && c < priceLikeCount.length; c++) {
          if (isPriceLike(row[c] || "")) priceLikeCount[c]++;
        }
      }
      let maxCount = 0;
      for (let c = 0; c < priceLikeCount.length; c++) {
        if (priceLikeCount[c] > maxCount) {
          maxCount = priceLikeCount[c];
          actualPriceIdx = c;
        }
      }
      if (actualPriceIdx === -1 || maxCount === 0) continue;
    }

    for (const row of table.rows) {
      if (row.length <= actualPriceIdx) continue;
      const priceStr = (row[actualPriceIdx] || "").trim();
      if (!isPriceLike(priceStr)) continue;

      // 提取名称：优先用匹配列，否则用整行
      let materialName = "";
      if (nameIdx >= 0 && row[nameIdx]) materialName = row[nameIdx];
      if (!materialName) {
        // 退化：取第一个非空非价格的列
        for (let c = 0; c < row.length; c++) {
          if (c === actualPriceIdx) continue;
          if (c === qtyIdx) continue;
          const v = (row[c] || "").trim();
          if (v && !isPriceLike(v)) { materialName = v; break; }
        }
      }

      rows.push({
        materialName,
        spec: specIdx >= 0 ? (row[specIdx] || "").trim() : "",
        brand: brandIdx >= 0 ? (row[brandIdx] || "").trim() : "",
        price: priceStr.replace(/[^\d.,]/g, ""),
        unit: unitIdx >= 0 ? (row[unitIdx] || "").trim() : "",
        supplier: supplierIdx >= 0 ? (row[supplierIdx] || "").trim() : "",
      });
    }
  }

  return rows;
}

export function getExtractedPriceRows(result: ParsedFileResult): ExtractedPriceRow[] {
  if (result.tables.length > 0) {
    return extractPricesFromExcel(result.tables);
  }
  if (result.text) {
    return extractPricesFromText(result.text);
  }
  return [];
}
