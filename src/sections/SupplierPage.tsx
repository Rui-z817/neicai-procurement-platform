import { useState, useMemo, useCallback } from "react";
import {
  Search,
  MapPin,
  Phone,
  Building2,
  Package,
  Award,
  ExternalLink,
  Users,
  Loader2,
  Globe,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { suppliers, allRegions, allBrands, categories } from "@/data/materials";
import type { Supplier } from "@/types";

export function SupplierPage() {
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("全部");
  const [brand, setBrand] = useState("全部");
  const [category, setCategory] = useState("全部");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Supplier[]>([]);

  const doSearch = useCallback(() => {
    setLoading(true);
    setHasSearched(true);
    // 模拟异步加载
    setTimeout(() => {
      let filtered = suppliers.filter((s) => {
        // 关键词匹配：材料名、供应商名、品牌、主营产品
        if (keyword.trim()) {
          const kw = keyword.toLowerCase().trim();
          const matchName = s.name.toLowerCase().includes(kw);
          const matchBrand = (s.brand || "").toLowerCase().includes(kw);
          const matchProducts = (s.mainProducts || []).some((p) =>
            p.toLowerCase().includes(kw)
          );
          if (!matchName && !matchBrand && !matchProducts) return false;
        }
        // 地区
        if (region !== "全部" && s.region !== region) return false;
        // 品牌
        if (brand !== "全部" && s.brand !== brand) return false;
        // 分类
        if (category !== "全部") {
          const cat = categories.find((c) => c.name === category);
          if (cat && !(s.categoryIds || []).some((cid) =>
            cat.children.some((ch) => ch.id === cid)
          )) {
            return false;
          }
        }
        return true;
      });
      setResults(filtered);
      setLoading(false);
    }, 400);
  }, [keyword, region, brand, category]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch();
  };

  const stats = useMemo(() => {
    return {
      total: suppliers.length,
      regions: new Set(suppliers.map((s) => s.region)).size,
      brands: new Set(suppliers.filter((s) => s.brand).map((s) => s.brand)).size,
    };
  }, []);

  const levelColor = (level: string) => {
    if (level === "A级") return "bg-green-50 text-green-700 border-green-200";
    if (level === "B级") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const supplierBrands = useMemo(() => {
    return Array.from(new Set(suppliers.filter((s) => s.brand).map((s) => s.brand!)));
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(217,72%,28%)] to-[hsl(217,72%,40%)] flex items-center justify-center text-white">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">供货商查询</h1>
            <p className="text-sm text-slate-500">
              按材料名称、地区、品牌查询建材供应商联系方式
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-slate-500">
          <span>共 {stats.total} 家供应商</span>
          <span>·</span>
          <span>覆盖 {stats.regions} 个省市</span>
          <span>·</span>
          <span>{stats.brands} 个品牌</span>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 分类 */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[hsl(217,72%,40%)]/30 focus:border-[hsl(217,72%,40%)] cursor-pointer"
          >
            <option value="全部">全部分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* 地区 */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[hsl(217,72%,40%)]/30 focus:border-[hsl(217,72%,40%)] cursor-pointer"
          >
            {allRegions.map((r) => (
              <option key={r} value={r}>
                {r === "全部" ? "全部地区" : r}
              </option>
            ))}
          </select>

          {/* 品牌 */}
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[hsl(217,72%,40%)]/30 focus:border-[hsl(217,72%,40%)] cursor-pointer"
          >
            <option value="全部">全部品牌</option>
            {supplierBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* 关键词 */}
          <div className="flex-1 min-w-[260px] flex items-center relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入材料名称、供应商名或品牌，如：钢筋 / 防水 / 东方雨虹"
              className="h-11 pl-11 pr-4 text-sm border-slate-300"
            />
          </div>

          <Button
            onClick={doSearch}
            size="lg"
            className="h-11 px-8 bg-[hsl(217,72%,40%)] hover:bg-[hsl(217,72%,36%)] text-white font-medium"
          >
            <Search className="w-4 h-4 mr-1.5" /> 查 询
          </Button>
        </div>

        {/* 快捷搜索 */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
          <span className="text-slate-400">热门：</span>
          {["钢筋", "水泥", "防水卷材", "PPR管", "电力电缆", "瓷砖", "涂料", "空调"].map(
            (kw) => (
              <button
                key={kw}
                onClick={() => {
                  setKeyword(kw);
                  setHasSearched(false);
                }}
                className="px-2 py-0.5 rounded hover:bg-[hsl(217,72%,40%)]/10 hover:text-[hsl(217,72%,40%)] text-slate-600 transition"
              >
                {kw}
              </button>
            )
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[hsl(217,72%,40%)] animate-spin mb-3" />
          <p className="text-sm text-slate-500">正在查询供应商信息...</p>
        </div>
      ) : hasSearched ? (
        <>
          {/* 结果统计 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              共找到 <span className="font-semibold text-[hsl(217,72%,40%)]">{results.length}</span> 家供应商
            </p>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">未找到匹配的供应商</p>
              <p className="text-xs mt-1">尝试更换关键词或筛选条件</p>
            </div>
          ) : (
            /* 供应商卡片列表 */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 group"
                >
                  {/* 头部：名称 + 等级 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(217,72%,90%)] to-[hsl(217,72%,80%)] flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-[hsl(217,72%,40%)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-[hsl(217,72%,40%)] transition truncate">
                          {s.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {s.brand && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 border-[hsl(217,72%,40%)]/30 text-[hsl(217,72%,40%)] bg-[hsl(217,72%,50%)]/5">
                              <Tag className="w-2.5 h-2.5 mr-0.5" />
                              {s.brand}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs px-1.5 py-0 h-5 ${levelColor(s.level)}`}>
                            <Award className="w-2.5 h-2.5 mr-0.5" />
                            {s.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 联系信息 */}
                  <div className="space-y-2 text-sm">
                    {/* 电话 */}
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono">{s.contact}</span>
                    </div>

                    {/* 地址 */}
                    {s.address && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs leading-relaxed">{s.region} · {s.address}</span>
                      </div>
                    )}

                    {/* 主营材料 */}
                    {s.mainProducts && s.mainProducts.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {s.mainProducts.map((p, i) => (
                            <span
                              key={i}
                              className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 官网 */}
                    {s.website && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <a
                          href={`https://${s.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[hsl(217,72%,40%)] hover:underline flex items-center gap-0.5"
                        >
                          {s.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 数据来源 */}
                  {s.source && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">数据来源：{s.source}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* 初始引导 */
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">输入条件开始查询</p>
          <p className="text-xs mt-1">支持按材料名称、地区、品牌组合筛选供应商</p>
        </div>
      )}
    </div>
  );
}
