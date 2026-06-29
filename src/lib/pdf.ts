import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { MarketPrice, InfoPrice, SearchParams } from "@/types";

// 格式化价格
function fmtPrice(p: number): string {
  return p.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 格式化时间
function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 生成PDF询价报告
export function generateReportPDF(
  params: SearchParams,
  marketPrices: MarketPrice[],
  infoPrices: InfoPrice[]
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(); // 210
  const margin = 14;

  // ===== 标题区域 =====
  // 顶部蓝色横条
  doc.setFillColor(30, 64, 120);
  doc.rect(0, 0, pageW, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INQUIRY REPORT", margin, 12);
  doc.setFontSize(20);
  doc.text("询价采购报告", margin, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Internal Inquiry & Procurement Platform", pageW - margin, 12, { align: "right" });
  doc.text(`Report Date: ${fmtDateTime(Date.now())}`, pageW - margin, 20, { align: "right" });

  let y = 34;

  // ===== 查询条件摘要 =====
  doc.setTextColor(30, 64, 120);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Query Conditions / 查询条件", margin, y);
  y += 2;
  doc.setDrawColor(30, 64, 120);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const condRows: [string, string][] = [
    ["Keyword / 关键词", params.keyword || "(all / 全部)"],
    ["Category / 分类", params.category || "All / 全部"],
    ["Region / 地区", params.region || "All / 全部"],
    ["Brand / 品牌", params.brand || "All / 全部"],
    ["Market Price Results / 市场价结果数", String(marketPrices.length)],
    ["Info Price Results / 信息价结果数", String(infoPrices.length)],
  ];

  condRows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, margin + 60, y);
    y += 6;
  });

  y += 4;

  // ===== 市场价明细表 =====
  if (marketPrices.length > 0) {
    doc.setTextColor(30, 64, 120);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Market Price Details / 市场价明细", margin, y);
    y += 4;

    const head = [["No.", "Material / 材料", "Specs / 规格", "Brand / 品牌", "Supplier / 供货商", "Region", "Price / 工程价", "Unit", "Date"]];
    const body = marketPrices.map((m, i) => {
      const specStr = m.specs.map((s) => `${s.key}:${s.value}`).join("; ");
      return [
        String(i + 1),
        m.materialName,
        specStr.length > 40 ? specStr.slice(0, 38) + ".." : specStr,
        m.brand,
        m.supplier.name.length > 18 ? m.supplier.name.slice(0, 16) + ".." : m.supplier.name,
        m.region,
        fmtPrice(m.price),
        m.unit,
        m.date,
      ];
    });

    autoTable(doc, {
      head: head as any,
      body: body as any,
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak", textColor: [40, 40, 40] },
      headStyles: { fillColor: [30, 64, 120], textColor: [255, 255, 255], fontSize: 7, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        6: { halign: "right", textColor: [200, 30, 30], fontStyle: "bold" },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ===== 信息价列表 =====
  if (infoPrices.length > 0) {
    // 检查是否需要分页
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(30, 64, 120);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Info Price List / 信息价列表", margin, y);
    y += 4;

    const head2 = [["No.", "Title / 信息价名称", "Region / 地区", "Period / 期次", "Type / 类型", "Publish Date / 发布日期"]];
    const body2 = infoPrices.map((i, idx) => [
      String(idx + 1),
      i.title,
      i.region,
      `${i.year}-${String(i.month).padStart(2, "0")}`,
      i.type,
      i.publishDate,
    ]);

    autoTable(doc, {
      head: head2 as any,
      body: body2 as any,
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 1.8, textColor: [40, 40, 40] },
      headStyles: { fillColor: [30, 64, 120], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 0: { cellWidth: 10, halign: "center" } },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ===== 供货商汇总 =====
  if (marketPrices.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    const supplierMap = new Map<string, { count: number; region: string; contact: string; level: string }>();
    marketPrices.forEach((m) => {
      const ex = supplierMap.get(m.supplier.name);
      if (ex) ex.count += 1;
      else supplierMap.set(m.supplier.name, { count: 1, region: m.supplier.region, contact: m.supplier.contact, level: m.supplier.level });
    });

    doc.setTextColor(30, 64, 120);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Supplier Summary / 供货商汇总", margin, y);
    y += 4;

    const head3 = [["No.", "Supplier / 供货商名称", "Region / 所在地", "Contact / 联系方式", "Level / 等级", "Items / 报价项数"]];
    const body3 = Array.from(supplierMap.entries()).map(([name, info], idx) => [
      String(idx + 1), name, info.region, info.contact, info.level, String(info.count),
    ]);

    autoTable(doc, {
      head: head3 as any,
      body: body3 as any,
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 1.8, textColor: [40, 40, 40] },
      headStyles: { fillColor: [30, 64, 120], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 0: { cellWidth: 10, halign: "center" } },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ===== 页脚 =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, ph - 12, pageW - margin, ph - 12);
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by Internal Inquiry & Procurement Platform / 内部询价采购平台", margin, ph - 7);
    doc.text(`Page ${i} / ${pageCount}`, pageW - margin, ph - 7, { align: "right" });
  }

  // 保存
  const dateStr = new Date().toISOString().slice(0, 10);
  const kwStr = params.keyword ? `_${params.keyword}` : "";
  doc.save(`InquiryReport${kwStr}_${dateStr}.pdf`);
}
