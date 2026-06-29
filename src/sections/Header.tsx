import { useState } from "react";
import { Search, Building2, History, Home, LogOut, UserCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allRegions, categories } from "@/data/materials";
import type { SearchParams } from "@/types";
import type { Session } from "@/lib/auth";

interface HeaderProps {
  onSearch: (params: SearchParams) => void;
  onHome: () => void;
  onHistory: () => void;
  currentPage: string;
  session: Session | null;
  onLogout: () => void;
  onChangePassword: () => void;
}

export function Header({ onSearch, onHome, onHistory, currentPage, session, onLogout, onChangePassword }: HeaderProps) {
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("全部");
  const [category, setCategory] = useState("全部");

  const handleSearch = () => {
    onSearch({ keyword, region, category });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 顶部品牌条 */}
      <div className="bg-gradient-to-r from-[hsl(217,72%,28%)] to-[hsl(217,72%,40%)] text-white">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onHome} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/30 group-hover:bg-white/25 transition">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold tracking-wide leading-tight">内部询价采购平台</div>
              <div className="text-[11px] text-blue-100/90 leading-tight">
                Internal Inquiry & Procurement Platform · 建筑材料价格查询
              </div>
            </div>
          </button>

          <nav className="flex items-center gap-1">
            <Button
              variant={currentPage === "home" ? "secondary" : "ghost"}
              size="sm"
              onClick={onHome}
              className="text-white hover:bg-white/15 hover:text-white data-[secondary]:text-primary"
            >
              <Home className="w-4 h-4 mr-1" /> 首页
            </Button>
            <Button
              variant={currentPage === "history" ? "secondary" : "ghost"}
              size="sm"
              onClick={onHistory}
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <History className="w-4 h-4 mr-1" /> 历史记录
            </Button>

            {/* 用户菜单 */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 transition text-white text-sm">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-300 to-cyan-200 flex items-center justify-center text-[hsl(217,72%,28%)] font-semibold text-xs">
                      {session.displayName.charAt(0)}
                    </div>
                    <span className="hidden sm:inline">{session.displayName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{session.displayName}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      账号：{session.username} · {session.role === "admin" ? "管理员" : "用户"}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onChangePassword} className="cursor-pointer">
                    <KeyRound className="w-4 h-4 mr-2 text-slate-500" />
                    修改密码
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>

      {/* 搜索栏区域 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 分类选择 */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer"
            >
              <option value="全部">全部分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>

            {/* 地区选择 */}
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer"
            >
              {allRegions.map((r) => (
                <option key={r} value={r}>
                  {r === "全部" ? "全部地区" : r}
                </option>
              ))}
            </select>

            {/* 搜索输入框 */}
            <div className="flex-1 min-w-[260px] flex items-center relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入材料名称、型号规格、品牌，如：钢筋 HRB400E / 东方雨虹 / PPR管"
                className="h-11 pl-11 pr-4 text-sm border-slate-300 focus-visible:ring-primary/40"
              />
            </div>

            {/* 搜索按钮 */}
            <Button
              onClick={handleSearch}
              size="lg"
              className="h-11 px-8 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <Search className="w-4 h-4 mr-1.5" /> 搜 询
            </Button>
          </div>

          {/* 热门搜索词 */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <span className="text-slate-400">热门：</span>
            {["钢筋", "商品混凝土", "防水卷材", "PPR管", "电力电缆", "水泥", "花岗岩", "坐便器"].map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setKeyword(kw);
                  onSearch({ keyword: kw, region: "全部", category: "全部" });
                }}
                className="px-2 py-0.5 rounded hover:bg-primary/10 hover:text-primary text-slate-600 transition"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
