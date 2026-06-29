import { Building2, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
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
              专业的建筑材料价格查询平台，提供全国市场价、信息价及供货商信息查询服务，
              助力工程采购决策，提升询价效率。
            </p>
          </div>

          {/* 快捷链接 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">功能导航</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white cursor-pointer transition">材料价格查询</span></li>
              <li><span className="hover:text-white cursor-pointer transition">市场价查询</span></li>
              <li><span className="hover:text-white cursor-pointer transition">信息价查询</span></li>
              <li><span className="hover:text-white cursor-pointer transition">供货商查询</span></li>
              <li><span className="hover:text-white cursor-pointer transition">询价报告导出</span></li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">联系我们</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 400-888-0000</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> inquiry@platform.com</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 北京市朝阳区</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 内部询价采购平台 · 仅供内部采购询价使用</p>
          <p>数据来源参考：广材网 gldjc.com · 本系统为内部演示平台</p>
        </div>
      </div>
    </footer>
  );
}
