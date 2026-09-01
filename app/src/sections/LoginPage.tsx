import { useState, useEffect } from "react";
import { Building2, Lock, User, Eye, EyeOff, Shield, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, isAuthenticated, type Session } from "@/lib/auth";

interface LoginPageProps {
  onLoginSuccess: (session: Session) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("请输入用户名和密码");
      return;
    }

    setLoading(true);
    // 模拟网络延迟，提升体验
    await new Promise((r) => setTimeout(r, 600));

    const result = login(username.trim(), password);
    if (result.ok && result.session) {
      if (!remember) {
        // 不记住时，session 仍然存 localStorage（简化实现），但 UI 不持久化
      }
      onLoginSuccess(result.session);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* 左侧品牌视觉区 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[hsl(217,72%,22%)] via-[hsl(217,72%,32%)] to-[hsl(210,80%,20%)]">
        {/* 装饰几何图形 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-cyan-300/10 blur-3xl" />
        </div>

        {/* 网格背景 */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* 品牌内容 */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo 区 */}
          <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-wide">内部询价采购平台</div>
                <div className="text-xs text-blue-200/80">Internal Procurement Platform</div>
              </div>
            </div>
          </div>

          {/* 主标语 */}
          <div className={`transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight mb-6">
              建筑材料价格
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                智能查询系统
              </span>
            </h1>
            <p className="text-blue-100/80 text-base leading-relaxed max-w-md">
              覆盖 17 大材料品类 · 2500+ 南京信息价真实数据
              <br />
              市场价 / 信息价 / PDF 报告导出 · 每月自动更新
            </p>
          </div>

          {/* 特性列表 */}
          <div className={`transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="space-y-3">
              {[
                { icon: Shield, text: "企业内部使用 · 安全可靠" },
                { icon: CheckCircle2, text: "数据每月自动同步更新" },
                { icon: ArrowRight, text: "支持 PDF 报告一键导出" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-blue-100/90 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                    <item.icon className="w-4 h-4" />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* 底部版本信息 */}
          <div className="text-xs text-blue-200/60">
            © 2026 内部询价采购平台 · v1.0 · 仅限内部使用
          </div>
        </div>
      </div>

      {/* 右侧登录表单区 */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className={`w-full max-w-md transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {/* 移动端 Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[hsl(217,72%,28%)] to-[hsl(217,72%,40%)] flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="text-lg font-bold text-slate-800">内部询价采购平台</div>
            </div>
          </div>

          {/* 标题 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">欢迎登录</h2>
            <p className="text-sm text-slate-500">请输入您的账户信息以访问系统</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 用户名 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">用户名</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  autoComplete="username"
                  disabled={loading}
                  className="h-12 pl-10 text-sm border-slate-200 focus-visible:ring-[hsl(217,72%,40%)]/30 focus-visible:border-[hsl(217,72%,40%)]"
                />
              </div>
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">密码</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-12 pl-10 pr-10 text-sm border-slate-200 focus-visible:ring-[hsl(217,72%,40%)]/30 focus-visible:border-[hsl(217,72%,40%)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 记住我 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[hsl(217,72%,40%)] focus:ring-[hsl(217,72%,40%)]/30 cursor-pointer"
                />
                <span className="text-sm text-slate-600">保持登录状态</span>
              </label>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-medium bg-gradient-to-r from-[hsl(217,72%,28%)] to-[hsl(217,72%,40%)] hover:from-[hsl(217,72%,24%)] hover:to-[hsl(217,72%,36%)] text-white shadow-lg shadow-blue-900/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在登录...
                </>
              ) : (
                <>
                  登 录
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* 底部信息 */}
          <div className="mt-8 text-center text-xs text-slate-400">
            本系统仅供内部员工使用 · 请勿外传账户信息
          </div>
        </div>
      </div>
    </div>
  );
}
