import { useState, useMemo, useEffect } from "react";
import {
  FileText,
  ChevronRight,
  Calendar,
  ExternalLink,
  Loader2,
  BadgeCheck,
  Archive,
  Download,
  FileDown,
} from "lucide-react";
import {
  nanjingRealInfoPrices,
  getRealYears,
  type NanjingInfoPriceRecord,
} from "@/data/nanjingInfoPrices";
import { delay } from "@/lib/api";

interface InfoPriceSectionProps {
  onViewAll?: () => void;
}

export function InfoPriceSection({ onViewAll }: InfoPriceSectionProps) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<NanjingInfoPriceRecord[]>([]);

  const availableYears = useMemo(() => getRealYears(), []);

  // 加载数据
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      await delay(300);
      if (!cancelled) {
        setData(nanjingRealInfoPrices);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 筛选
  const filteredPrices = useMemo(() => {
    if (selectedYear === "all") return data;
    return data.filter((p) => p.year === selectedYear);
  }, [data, selectedYear]);

  // 最新一期
  const latestPrice = useMemo(() => {
    return data.length > 0 ? data[0] : null;
  }, [data]);

  // 统计
  const stats = useMemo(() => {
    const total = data.length;
    const withPdf = data.filter((d) => d.pdfUrl).length;
    const yearRange = data.length > 0 ? `${data[data.length - 1].year}–${data[0].year}` : "";
    return { total, withPdf, yearRange };
  }, [data]);

  return (
    <section className="mb-6">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                南京信息价专区
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium border border-green-200">
                  真实数据
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium border border-blue-200">
                  每月更新
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <BadgeCheck className="w-3 h-3 text-green-500" />
                数据来源：南京造价信息网（njzjxh.cn）官方发布
                <span className="text-slate-300">|</span>
                共 {stats.total} 期 · {stats.yearRange} · {stats.withPdf} 期可下载PDF
              </p>
            </div>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-primary hover:underline flex items-center gap-0.5"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 最新一期高亮卡片 */}
        {latestPrice && (
          <div className="mx-5 mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <FileText className="w-32 h-32 -mr-8 -mt-8" />
            </div>
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 backdrop-blur font-medium">
                    最新一期 · 信息价
                  </span>
                  <span className="text-[11px] text-blue-100">{latestPrice.publishDate} 发布</span>
                </div>
                <h3 className="text-base font-bold truncate">{latestPrice.title}</h3>
                <p className="text-xs text-blue-100 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {latestPrice.year}年{latestPrice.month}月
                  <span className="mx-1">·</span>
                  来源：{latestPrice.source}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {latestPrice.pdfUrl && (
                  <a
                    href={latestPrice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white text-blue-600 hover:bg-blue-50 text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" /> 下载PDF
                  </a>
                )}
                <a
                  href={latestPrice.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur text-xs font-medium transition"
                >
                  查看原文 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 筛选栏：年份 */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Archive className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">年份：</span>
          </div>
          <button
            onClick={() => setSelectedYear("all")}
            className={`px-2.5 py-1 rounded text-xs transition ${
              selectedYear === "all"
                ? "bg-primary text-white font-medium"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            全部
          </button>
          {availableYears.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                selectedYear === y
                  ? "bg-primary text-white font-medium"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {y}年
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            {filteredPrices.length} 期
          </span>
        </div>

        {/* 信息价列表 */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
            <span className="text-sm">正在加载南京信息价数据...</span>
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            暂无信息价数据
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
            {filteredPrices.map((info) => (
              <li
                key={info.id}
                className="px-5 py-3 hover:bg-slate-50 transition group flex items-center justify-between"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* 月份徽章 */}
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-primary leading-none">
                      {String(info.month).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5">月</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-slate-800 font-medium group-hover:text-primary transition truncate">
                        {info.title}
                      </span>
                      <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 font-medium">
                        信息价
                      </span>
                      <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200 font-medium">
                        <BadgeCheck className="w-2.5 h-2.5" /> 官方
                      </span>
                      {info.isReal && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                          真实数据
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {info.publishDate}
                      </span>
                      <span>·</span>
                      <span>{info.year}年{info.month}月</span>
                      <span>·</span>
                      <span className="text-slate-500">{info.source}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  {info.pdfUrl && (
                    <a
                      href={info.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-medium transition"
                      title="下载PDF信息价文件"
                    >
                      <FileDown className="w-3.5 h-3.5" /> PDF
                    </a>
                  )}
                  <a
                    href={info.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition"
                    title="查看网页原文"
                  >
                    原文 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 底部说明 */}
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <BadgeCheck className="w-3 h-3 text-green-500" />
            信息价由南京市工程造价管理协会每月官方发布，本系统已对接其网站真实数据
          </span>
          <a
            href="http://www.njzjxh.cn/NECACMS/channels/1117.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary flex items-center gap-0.5"
          >
            前往南京造价协会 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}
