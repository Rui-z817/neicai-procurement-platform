import { useState, useEffect } from "react";
import { TrendingUp, FileText, ChevronRight, Search, Loader2, AlertCircle } from "lucide-react";
import { categories } from "@/data/materials";
import { projectTypes, getLatestMarketPrices, getLatestInfoPrices, getLatestByProjectType } from "@/lib/search";
import { PriceCard } from "@/components/PriceCard";
import { InfoPriceSection } from "@/components/InfoPriceSection";
import type { SearchParams, MarketPrice, InfoPrice, ProjectType } from "@/types";
import { generateReportPDF } from "@/lib/pdf";

interface HomePageProps {
  onSearch: (params: SearchParams) => void;
}

export function HomePage({ onSearch }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<ProjectType>(projectTypes[0]);
  const [latestMarket, setLatestMarket] = useState<MarketPrice[]>([]);
  const [latestInfo, setLatestInfo] = useState<InfoPrice[]>([]);
  const [tabMarket, setTabMarket] = useState<MarketPrice[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loadingTab, setLoadingTab] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载最新市场价
  useEffect(() => {
    let cancelled = false;
    setLoadingMarket(true);
    getLatestMarketPrices(8)
      .then((data) => { if (!cancelled) setLatestMarket(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoadingMarket(false); });
    return () => { cancelled = true; };
  }, []);

  // 加载最新信息价
  useEffect(() => {
    let cancelled = false;
    setLoadingInfo(true);
    getLatestInfoPrices(12)
      .then((data) => { if (!cancelled) setLatestInfo(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingInfo(false); });
    return () => { cancelled = true; };
  }, []);

  // 按工程类型加载
  useEffect(() => {
    let cancelled = false;
    setLoadingTab(true);
    getLatestByProjectType(activeTab, 4)
      .then((data) => { if (!cancelled) setTabMarket(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingTab(false); });
    return () => { cancelled = true; };
  }, [activeTab]);

  const handleExportSingle = (item: MarketPrice) => {
    generateReportPDF(
      { keyword: item.materialName, region: item.region, brand: item.brand },
      [item],
      []
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      {/* ===== 分类导航区 ===== */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full" />
            材料分类导航
          </h2>
          <span className="text-xs text-slate-400">共 {categories.length} 大类 · 点击分类快速查询</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-lg border border-slate-200 p-3.5 hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100">
                <span className="text-lg">{cat.icon}</span>
                <button
                  onClick={() => onSearch({ keyword: "", category: cat.name, region: "全部" })}
                  className="font-bold text-slate-800 hover:text-primary transition text-[15px]"
                >
                  {cat.name}
                </button>
                {cat.hot && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-200 font-medium">
                    🔥 热门
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {cat.children.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSearch({ keyword: sub.name, category: cat.name, region: "全部" })}
                    className="text-[13px] text-slate-600 hover:text-primary hover:underline transition"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 最新市场价 ===== */}
      <section className="mb-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              最新市场价
            </h2>
            <button
              onClick={() => onSearch({ keyword: "", region: "全部" })}
              className="text-sm text-primary hover:underline flex items-center gap-0.5"
            >
              更多 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 工程类型标签 */}
          <div className="px-5 py-2.5 border-b border-slate-100 flex flex-wrap gap-1.5">
            {projectTypes.map((pt) => (
              <button
                key={pt}
                onClick={() => setActiveTab(pt)}
                className={`px-3 py-1 rounded text-[13px] transition ${
                  activeTab === pt
                    ? "bg-primary text-white font-medium"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {pt}
              </button>
            ))}
          </div>

          {/* 价格卡片网格 */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[200px]">
            {loadingTab ? (
              <div className="col-span-2 py-10 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                <span className="text-sm">正在加载「{activeTab}」市场价数据...</span>
              </div>
            ) : tabMarket.length > 0 ? (
              tabMarket.map((item) => (
                <PriceCard key={item.id} item={item} onExport={handleExportSingle} />
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-slate-400 text-sm">
                暂无「{activeTab}」分类的最新市场价数据
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <div className="font-medium">数据加载失败</div>
            <div className="text-xs text-red-600">{error}</div>
          </div>
        </div>
      )}

      {/* ===== 信息价专区（每月自动更新，支持年份归档查询） ===== */}
      <InfoPriceSection onViewAll={() => onSearch({ keyword: "", region: "南京" })} />

      {/* 双栏：最新信息价 + 热门材料市场价 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 最新信息价 */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              最新信息价
            </h2>
            <button
              onClick={() => onSearch({ keyword: "", region: "全部" })}
              className="text-sm text-primary hover:underline flex items-center gap-0.5"
            >
              更多 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {loadingInfo ? (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
              <span className="text-sm">加载信息价...</span>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {latestInfo.map((info) => (
                <li
                  key={info.id}
                  className="px-5 py-2.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-sm text-slate-700 group-hover:text-primary truncate">
                      {info.title}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">{info.publishDate}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 热门材料市场价 */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              热门材料报价
            </h2>
            <button
              onClick={() => onSearch({ keyword: "", region: "全部" })}
              className="text-sm text-primary hover:underline flex items-center gap-0.5"
            >
              更多 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {loadingMarket ? (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
              <span className="text-sm">加载热门报价...</span>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {latestMarket.map((item) => (
                <li
                  key={item.id}
                  className="px-5 py-2.5 hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => onSearch({ keyword: item.materialName, region: "全部" })}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm text-slate-700 font-medium truncate">{item.materialName}</div>
                      <div className="text-xs text-slate-400 truncate">{item.brand} · {item.region}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-red-600 font-bold text-sm">
                        {item.price.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-slate-400 ml-0.5">元/{item.unit}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
