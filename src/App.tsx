import { useState, useCallback } from "react";
import "./App.css";
import { Header } from "@/sections/Header";
import { HomePage } from "@/sections/HomePage";
import { SearchResultsPage } from "@/sections/SearchResultsPage";
import { HistoryPage } from "@/sections/HistoryPage";
import { Footer } from "@/sections/Footer";
import type { SearchParams } from "@/types";

type Page = "home" | "search" | "history";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [searchParams, setSearchParams] = useState<SearchParams>({ keyword: "" });

  const goHome = useCallback(() => setPage("home"), []);
  const goHistory = useCallback(() => setPage("history"), []);

  const doSearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
    setPage("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(210,20%,97%)]">
      <Header
        onSearch={doSearch}
        onHome={goHome}
        onHistory={goHistory}
        currentPage={page}
      />
      <main className="flex-1">
        {page === "home" && <HomePage onSearch={doSearch} />}
        {page === "search" && (
          <SearchResultsPage params={searchParams} onSearch={doSearch} />
        )}
        {page === "history" && <HistoryPage onSearch={doSearch} />}
      </main>
      <Footer />
    </div>
  );
}
