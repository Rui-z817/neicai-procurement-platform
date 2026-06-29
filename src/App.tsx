import { useState, useCallback, useEffect } from "react";
import "./App.css";
import { Header } from "@/sections/Header";
import { HomePage } from "@/sections/HomePage";
import { SearchResultsPage } from "@/sections/SearchResultsPage";
import { HistoryPage } from "@/sections/HistoryPage";
import { Footer } from "@/sections/Footer";
import { LoginPage } from "@/sections/LoginPage";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import type { SearchParams } from "@/types";
import { getSession, logout, initAccounts, type Session } from "@/lib/auth";

type Page = "home" | "search" | "history";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [searchParams, setSearchParams] = useState<SearchParams>({ keyword: "" });
  const [passwordOpen, setPasswordOpen] = useState(false);

  // 初始化账户 + 检查会话
  useEffect(() => {
    initAccounts();
    const s = getSession();
    setSession(s);
    setAuthChecked(true);
  }, []);

  const goHome = useCallback(() => setPage("home"), []);
  const goHistory = useCallback(() => setPage("history"), []);

  const doSearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
    setPage("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLogin = useCallback((s: Session) => {
    setSession(s);
    setPage("home");
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setSession(null);
    setPage("home");
  }, []);

  // 未完成会话检查时显示加载
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm animate-pulse">加载中...</div>
      </div>
    );
  }

  // 未登录 → 显示登录页
  if (!session) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  // 已登录 → 显示主系统
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(210,20%,97%)]">
      <Header
        onSearch={doSearch}
        onHome={goHome}
        onHistory={goHistory}
        currentPage={page}
        session={session}
        onLogout={handleLogout}
        onChangePassword={() => setPasswordOpen(true)}
      />
      <main className="flex-1">
        {page === "home" && <HomePage onSearch={doSearch} />}
        {page === "search" && (
          <SearchResultsPage params={searchParams} onSearch={doSearch} />
        )}
        {page === "history" && <HistoryPage onSearch={doSearch} />}
      </main>
      <Footer />

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        username={session.username}
        onSuccess={() => {
          // 密码修改成功提示（可选：这里可以加 toast）
        }}
      />
    </div>
  );
}
