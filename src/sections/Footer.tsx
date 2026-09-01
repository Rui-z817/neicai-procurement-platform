import { Building2, Phone, MapPin } from "lucide-react";
import type { SearchParams } from "@/types";

interface FooterProps {
  onHome: () => void;
  onSearch: (params: SearchParams) => void;
  onSupplier: () => void;
  onInternal: () => void;
  onHistory: () => void;
}

export function Footer({ onHome, onSearch, onSupplier, onInternal, onHistory }: FooterProps) {
  // 快速导航（与系统真实页面对应）
  const navItems: Array<{ label: string; action: () => void }> = [
    { label: "材料价格查询", action: () => onSearch({ keyword: "" }) },
    { label: "供货商查询", action: onSupplier },
    { label: "内部价格管理", action: onInternal },
    { label: "历史查询记录", action: onHistory },
    { label: "返回首页", action: onHome },
  ];

  const handleNav = (action: () => void) => {
    action();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[hsl(217,72%,22%)] text-slate-300 mt-12">
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 平台信息 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center ring-1 ring-white/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">内部询价采购平台</div>
                <div className="text-xs text-slate-400">Internal Inquiry & Procurement Platform</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              专业的建筑材料价格查询平台，提供市场价、南京信息价及供货商信息查询服务，
              支持内部报价单上传与管理，助力工程采购决策，提升询价效率。
            </p>
          </div>

          {/* 快速导航 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">快速导航</h4>
            <ul className="space-y-2 text-sm">
              {navItems.map((nav) => (
                <li key={nav.label}>
                  <button
                    onClick={() => handleNav(nav.action)}
                    className="hover:text-white transition text-left"
                  >
                    {nav.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">联系我们</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:18118848584" className="hover:text-white transition">18118848584</a>
              </li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 南京市鼓楼区</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 内部询价采购平台 · 仅供内部采购询价使用</p>
          <p>信息价数据来源：南京市建设工程造价监督站 njszj.cn</p>
        </div>
      </div>
    </footer>
  );
}
