import { MapPin, Calendar, FileDown, Factory, BadgeCheck, ExternalLink, Building2 } from "lucide-react";
import type { MarketPrice } from "@/types";
import { categories } from "@/data/materials";

interface PriceCardProps {
  item: MarketPrice;
  onExport?: (item: MarketPrice) => void;
}

export function PriceCard({ item, onExport }: PriceCardProps) {
  const cat = categories.find((c) => c.children.some((ch) => ch.id === item.categoryId));
  // 价格来源判断：内部价格 / 信息价 / 普通市场价
  const isInternal = item.sourceType === "internal" || item.supplier.id === "internal-price";
  const isInfoPrice = !isInternal && (item.brand === "南京信息价" || item.supplier.id === "nj-info-price");

  // 提取月份显示
  const monthLabel = item.month ? `${item.month}月` : "";

  // 打开信息价 PDF
  const handleOpenPdf = () => {
    if (item.pdfUrl) {
      window.open(item.pdfUrl, "_blank");
    }
  };

  // 查看/下载内部价格关联的报价单
  const handleOpenQuotation = () => {
    if (item.fileId) {
      window.open(`/api/files/${item.fileId}/download`, "_blank");
    }
  };

  // 卡片配色：内部价格=蓝色，信息价=琥珀色，普通=白色
  const cardCls = isInternal
    ? "bg-blue-50/40 border-blue-200 hover:border-blue-400"
    : isInfoPrice
      ? "bg-amber-50/30 border-amber-200 hover:border-amber-400"
      : "bg-white border-slate-200 hover:border-primary/30";

  return (
    <div className={`rounded-lg border p-4 hover:shadow-md transition-all group ${cardCls}`}>
      {/* 材料名称 + 分类标签 + 来源标签 */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-bold text-slate-800 text-[15px] leading-snug group-hover:text-primary transition">
          {item.materialName}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {isInternal && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-300 font-medium inline-flex items-center gap-0.5">
              <Building2 className="w-2.5 h-2.5" /> 内部价
            </span>
          )}
          {isInfoPrice && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 font-medium inline-flex items-center gap-0.5">
              <BadgeCheck className="w-2.5 h-2.5" /> 信息价
            </span>
          )}
          {cat && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
              {cat.name}
            </span>
          )}
        </div>
      </div>

      {/* 供货商 / 价格来源 */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
        {isInfoPrice ? (
          <BadgeCheck className="w-3.5 h-3.5 text-amber-500" />
        ) : isInternal ? (
          <Building2 className="w-3.5 h-3.5 text-blue-500" />
        ) : (
          <Factory className="w-3.5 h-3.5" />
        )}
        <span className="truncate">{item.supplier.name}</span>
        <span
          className={`shrink-0 px-1 py-0.5 rounded text-[10px] border ${
            isInternal
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : isInfoPrice
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-green-50 text-green-600 border-green-200"
          }`}
        >
          {item.supplier.level}
        </span>
      </div>

      {/* 规格参数 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 mb-3 bg-slate-50 rounded px-2.5 py-2 border border-slate-100">
        {item.specs.map((s, i) => (
          <span key={i}>
            <span className="text-slate-400">{s.key}:</span>{" "}
            <span className="font-medium text-slate-700">{s.value}</span>
          </span>
        ))}
        <span>
          <span className="text-slate-400">{isInternal ? "品牌" : isInfoPrice ? "来源" : "品牌"}:</span>{" "}
          <span className={`font-medium ${isInternal ? "text-blue-600" : isInfoPrice ? "text-amber-600" : "text-primary"}`}>
            {isInfoPrice ? `南京信息价${monthLabel ? `（${monthLabel}）` : ""}` : item.brand}
          </span>
        </span>
      </div>

      {/* 底部：价格 + 地区/日期 + 操作 */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-slate-400">
              {isInternal ? "内部价" : isInfoPrice ? "信息价" : "工程价"}
            </span>
            <span className={`text-xl font-bold ${isInternal ? "text-blue-600" : isInfoPrice ? "text-amber-600" : "text-red-600"}`}>
              {item.price.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500">元/{item.unit}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{item.region}</span>
            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{item.date}</span>
          </div>
        </div>
        {isInternal && item.fileId ? (
          <button
            onClick={handleOpenQuotation}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
            title="查看/下载该价格对应的报价单原件"
          >
            <FileDown className="w-3.5 h-3.5" /> 报价单
          </button>
        ) : isInfoPrice && item.pdfUrl ? (
          <button
            onClick={handleOpenPdf}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
            title={`打开${monthLabel}信息价PDF`}
          >
            <ExternalLink className="w-3.5 h-3.5" /> 信息价PDF
          </button>
        ) : onExport ? (
          <button
            onClick={() => onExport(item)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-primary/30 text-primary hover:bg-primary hover:text-white transition"
          >
            <FileDown className="w-3.5 h-3.5" /> 报价单
          </button>
        ) : null}
      </div>
    </div>
  );
}
