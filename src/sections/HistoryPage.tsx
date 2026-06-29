import { useState, useEffect } from "react";
import { History, Trash2, Search, FileDown, Inbox, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getHistory, deleteHistory, clearHistory, formatTime } from "@/lib/storage";
import { generateReportPDF } from "@/lib/pdf";
import type { HistoryRecord, SearchParams } from "@/types";

interface HistoryPageProps {
  onSearch: (params: SearchParams) => void;
}

export function HistoryPage({ onSearch }: HistoryPageProps) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRecords(getHistory());
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleDelete = (id: string) => {
    deleteHistory(id);
    refresh();
  };

  const handleClearAll = () => {
    clearHistory();
    refresh();
  };

  const handleReSearch = (record: HistoryRecord) => {
    onSearch({
      keyword: record.keyword,
      category: record.filters.category,
      region: record.filters.region,
      brand: record.filters.brand,
    });
  };

  const handleExportRecord = (record: HistoryRecord) => {
    const params: SearchParams = {
      keyword: record.keyword,
      category: record.filters.category,
      region: record.filters.region,
      brand: record.filters.brand,
    };
    generateReportPDF(params, record.results || [], []);
  };

  const filtersText = (record: HistoryRecord): string => {
    const parts: string[] = [];
    if (record.filters.category && record.filters.category !== "全部") parts.push(`分类: ${record.filters.category}`);
    if (record.filters.region && record.filters.region !== "全部") parts.push(`地区: ${record.filters.region}`);
    if (record.filters.brand && record.filters.brand !== "全部") parts.push(`品牌: ${record.filters.brand}`);
    return parts.length ? parts.join(" · ") : "无附加筛选";
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      {/* 标题栏 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            查询历史记录
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            系统自动保存所有查询记录，共 {records.length} 条 · 可随时重新查询或导出报告
          </p>
        </div>
        {records.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-1.5" /> 清空全部
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认清空所有历史记录？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将删除全部 {records.length} 条查询历史记录，且不可恢复。请确认是否继续。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* 历史记录列表 */}
      {records.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 py-20 text-center">
          <Inbox className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-1">暂无查询历史记录</p>
          <p className="text-xs text-slate-400">进行材料价格查询后，记录将自动保存在这里</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm hover:border-primary/30 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                {/* 左侧：查询信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Search className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">
                      {record.keyword || "（全部材料）"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Filter className="w-3 h-3" />{filtersText(record)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatTime(record.timestamp)}
                    </span>
                    <span className="text-primary font-medium">
                      找到 {record.resultCount} 条结果
                    </span>
                  </div>
                </div>

                {/* 右侧：操作按钮 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReSearch(record)}
                    className="h-8 border-primary/30 text-primary hover:bg-primary hover:text-white"
                  >
                    <Search className="w-3.5 h-3.5 mr-1" /> 重新查询
                  </Button>
                  {record.results && record.results.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportRecord(record)}
                      className="h-8"
                    >
                      <FileDown className="w-3.5 h-3.5 mr-1" /> 导出PDF
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                        title="删除此记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除此条历史记录？</AlertDialogTitle>
                        <AlertDialogDescription>
                          将删除查询「{record.keyword || "全部材料"}」的历史记录，此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(record.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* 结果预览（如果有快照） */}
              {record.results && record.results.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {record.results.slice(0, 5).map((m) => (
                    <span
                      key={m.id}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100"
                    >
                      {m.materialName} · <span className="text-red-500">{m.price.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}元/{m.unit}</span>
                    </span>
                  ))}
                  {record.results.length > 5 && (
                    <span className="text-[11px] px-2 py-0.5 text-slate-400">
                      +{record.results.length - 5} 更多...
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
