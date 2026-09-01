import { useState, useEffect } from "react";
import { Search, FileDown, FileText, Filter, X, Inbox, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceCard } from "@/components/PriceCard";
import { searchMaterials } from "@/lib/search";
import { addHistory } from "@/lib/storage";
import { generateReportPDF } from "@/lib/pdf";
import { allRegions, allBrands, categories } from "@/data/materials";
import type { SearchParams, MarketPrice, InfoPrice } from "@/types";

interface SearchResultsPageProps {
  params: SearchParams;
  onSearch: (params: SearchParams) => void;
}

export function SearchResultsPage({ params, onSearch }: SearchResultsPageProps) {
  const [keyword, setKeyword] = useState(params.keyword || "");
  const [category, setCategory] = useState(params.category || "全部");
  const [region, setRegion] = useState(params.region || "全部");
  const [brand, setBrand] = useState(params.brand || "全部");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [infoPrices, setInfoPrices] = useState<InfoPrice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentParams: SearchParams = { keyword, category, region, brand };

  // 异步加载数据
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchMaterials(currentParams)
      .then((res) => {
        if (cancelled) return;
        setMarketPrices(res.marketPrices);
        setInfoPrices(res.infoPrices);
        setTotal(res.total);
        // 保存历史记录（含结果快照用于PDF）
        addHistory(currentParams, res.total, res.marketPrices);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "查询失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, region, brand]);

  const handleSearch = () => {
    onSearch(currentParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleExportAll = () => {
    generateReportPDF(currentParams, marketPrices, infoPrices);
  };

  const handleExportSingle = (item: MarketPrice) => {
    generateReportPDF(
      { keyword: item.materialName, region: item.region, brand: item.brand },
      [item],
      []
    );
  };

  const clearFilters = () => {
    setKeyword("");
    setCategory("全部");
    setRegion("全部");
    setBrand("全部");
  };

  const hasFilter = keyword || category !== "全部" || region !== "全部" || brand !== "全部";

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      {/* 搜索结果标题栏 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[240px] flex items-center relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入材料名称、型号规格、品牌..."
              className="h-10 pl-11"
            />
          </div>
          <Button onClick={handleSearch} className="h-10 px-6">
            <Search className="w-4 h-4 mr-1" /> 搜索
          </Button>
          <Button
            onClick={handleExportAll}
            variant="outline"
            className="h-10 px-5 border-primary/40 text-primary hover:bg-primary hover:text-white"
            disabled={marketPrices.length === 0 && infoPrices.length === 0}
          >
            <FileDown className="w-4 h-4 mr-1.5" /> 导出PDF报告
          </Button>
        </div>

        {/* 当前筛选条件 */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 flex items-center gap-1"><Filter className="w-3.5 h-3.5" />筛选：</span>
          {category !== "全部" && (
            <Tag label={`分类: ${category}`} onClear={() => setCategory("全部")} />
          )}
          {region !== "全部" && (
            <Tag label={`地区: ${region}`} onClear={() => setRegion("全部")} />
          )}
          {brand !== "全部" && (
            <Tag label={`品牌: ${brand}`} onClear={() => setBrand("全部")} />
          )}
          {keyword && (
            <Tag label={`关键词: ${keyword}`} onClear={() => setKeyword("")} />
          )}
          {!hasFilter && <span className="text-slate-400">无（显示全部）</span>}
          {hasFilter && (
            <button onClick={clearFilters} className="text-slate-500 hover:text-red-500 underline ml-1">
              清除全部
            </button>
          )}
          <span className="ml-auto text-slate-500 text-xs">
            共 <span className="text-primary font-bold">{total}</span> 条价格
            <span className="mx-1 text-amber-500">（含信息价 {marketPrices.filter((m: any) => m.brand === "南京信息价").length} 条）</span>
            · {infoPrices.length} 期信息价期刊
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        {/* 左侧筛选栏 */}
        <aside className="space-y-4">
          <FilterBox title="材料分类">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-2 rounded border border-slate-300 text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="全部">全部分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </FilterBox>

          <FilterBox title="报价地区">
            <div className="flex flex-wrap gap-1.5">
              {allRegions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-2 py-1 rounded text-xs transition ${
                    region === r
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </FilterBox>

          <FilterBox title="品牌">
            <div className="max-h-48 overflow-y-auto flex flex-wrap gap-1.5">
              {allBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`px-2 py-1 rounded text-xs transition ${
                    brand === b
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </FilterBox>
        </aside>

        {/* 右侧结果区 */}
        <div className="space-y-4 min-w-0">
          {/* 视图切换 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 p-0.5">
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  viewMode === "card" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                卡片视图
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  viewMode === "table" ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                表格视图
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-sm">
                <div className="font-medium">查询失败</div>
                <div className="text-xs text-red-600">{error}</div>
              </div>
            </div>
          )}

          {/* 加载状态 */}
          {loading ? (
            <div className="bg-white rounded-lg border border-slate-200 py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
              <p className="text-slate-500 text-sm">正在查询建材价格数据...</p>
              <p className="text-xs text-slate-400 mt-1">从数据库中检索市场价与信息价</p>
            </div>
          ) : marketPrices.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-1">未找到匹配的市场价数据</p>
              <p className="text-xs text-slate-400">请尝试调整筛选条件或更换关键词</p>
            </div>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {marketPrices.map((item) => (
                <PriceCard key={item.id} item={item} onExport={handleExportSingle} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium">材料名称</th>
                      <th className="px-3 py-2.5 text-left font-medium">规格参数</th>
                      <th className="px-3 py-2.5 text-left font-medium">类型</th>
                      <th className="px-3 py-2.5 text-left font-medium">来源/品牌</th>
                      <th className="px-3 py-2.5 text-left font-medium">供货商/发布方</th>
                      <th className="px-3 py-2.5 text-left font-medium">地区</th>
                      <th className="px-3 py-2.5 text-right font-medium">价格</th>
                      <th className="px-3 py-2.5 text-center font-medium">日期</th>
                      <th className="px-3 py-2.5 text-center font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marketPrices.map((item) => {
                      const isIP = item.brand === "南京信息价" || item.supplier.id === "nj-info-price";
                      return (
                      <tr key={item.id} className={`hover:bg-slate-50 transition ${isIP ? "bg-amber-50/30" : ""}`}>
                        <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">{item.materialName}</td>
                        <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[220px]">
                          {item.specs.map((s) => `${s.key}:${s.value}`).join(" ")}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {isIP ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 font-medium">信息价</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 font-medium">市场价</span>
                          )}
                        </td>
                        <td className={`px-3 py-2.5 whitespace-nowrap ${isIP ? "text-amber-600" : "text-primary"}`}>{item.brand}</td>
                        <td className="px-3 py-2.5 text-slate-600 text-xs whitespace-nowrap">{item.supplier.name}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{item.region}</td>
                        <td className={`px-3 py-2.5 text-right font-bold whitespace-nowrap ${isIP ? "text-amber-600" : "text-red-600"}`}>
                          {item.price.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                          <span className="text-xs text-slate-400 font-normal ml-0.5">/{item.unit}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center text-slate-500 text-xs whitespace-nowrap">{item.date}</td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => handleExportSingle(item)}
                            className="text-xs text-primary hover:underline"
                          >
                            报价单
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 信息价结果 */}
          {!loading && infoPrices.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  相关信息价 ({infoPrices.length})
                </h3>
              </div>
              <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {infoPrices.map((info) => (
                  <li key={info.id} className="px-5 py-2.5 hover:bg-slate-50 transition flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-sm text-slate-700 truncate">{info.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 ml-2">{info.publishDate}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
      {label}
      <button onClick={onClear} className="hover:bg-primary/20 rounded-full p-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function FilterBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5">
      <h4 className="text-sm font-semibold text-slate-700 mb-2.5 pb-2 border-b border-slate-100">{title}</h4>
      {children}
    </div>
  );
}
