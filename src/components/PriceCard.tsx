import { MapPin, Calendar, FileDown, Factory, BadgeCheck } from "lucide-react";
import type { MarketPrice } from "@/types";
import { categories } from "@/data/materials";

interface PriceCardProps {
  item: MarketPrice;
  onExport?: (item: MarketPrice) => void;
}

export function PriceCard({ item, onExport }: PriceCardProps) {
  const cat = categories.find((c) => c.children.some((ch) => ch.id === item.categoryId));
  // 判断是否为信息价价格（brand 为 "南京信息价" 或 supplier.id 为 "nj-info-price"）
  const isInfoPrice = item.brand === "南京信息价" || item.supplier.id === "nj-info-price";

  return (
    <div
      className={`rounded-lg border p-4 hover:shadow-md transition-all group ${
        isInfoPrice
          ? "bg-amber-50/30 border-amber-200 hover:border-amber-400"
          : "bg-white border-slate-200 hover:border-primary/30"
      }`}
    >
      {/* 材料名称 + 分类标签 + 信息价标签 */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-bold text-slate-800 text-[15px] leading-snug group-hover:text-primary transition">
          {item.materialName}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
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

      {/* 供货商 / 信息价来源 */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
        {isInfoPrice ? (
          <BadgeCheck className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Factory className="w-3.5 h-3.5" />
        )}
        <span className="truncate">{item.supplier.name}</span>
        <span
          className={`shrink-0 px-1 py-0.5 rounded text-[10px] border ${
            isInfoPrice
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
          <span className="text-slate-400">{isInfoPrice ? "来源" : "品牌"}:</span>{" "}
          <span className={`font-medium ${isInfoPrice ? "text-amber-600" : "text-primary"}`}>
            {item.brand}
          </span>
        </span>
      </div>

      {/* 底部：价格 + 地区/日期 + 操作 */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-slate-400">
              {isInfoPrice ? "信息价" : "工程价"}
            </span>
            <span className={`text-xl font-bold ${isInfoPrice ? "text-amber-600" : "text-red-600"}`}>
              {item.price.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500">元/{item.unit}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{item.region}</span>
            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{item.date}</span>
          </div>
        </div>
        {onExport && (
          <button
            onClick={() => onExport(item)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-primary/30 text-primary hover:bg-primary hover:text-white transition"
          >
            <FileDown className="w-3.5 h-3.5" /> 报价单
          </button>
        )}
      </div>
    </div>
  );
}
