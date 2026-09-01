import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Search,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Trash2,
  Eye,
  Database,
  Loader2,
  Package,
  TrendingUp,
  HardDrive,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UploadDialog } from "@/components/UploadDialog";
import {
  getAllPrices,
  deletePrice,
  getAllFiles,
  deleteFileWithPrices,
  getFile,
  getFileURL,
  getStorageUsage,
  exportAllData,
  detectBackend,
  type InternalPrice,
  type StoredFile,
  type StorageBackend,
} from "@/lib/db";

export function InternalPricePage() {
  const [prices, setPrices] = useState<InternalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [storage, setStorage] = useState({ fileCount: 0, totalSize: 0 });
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [backend, setBackend] = useState<StorageBackend>("indexeddb");
  const [deleteByFileOpen, setDeleteByFileOpen] = useState(false);
  const [filesList, setFilesList] = useState<StoredFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [allPrices, usage, detectedBackend] = await Promise.all([
      getAllPrices(),
      getStorageUsage(),
      detectBackend(),
    ]);
    setPrices(allPrices);
    setStorage(usage);
    setBackend(detectedBackend);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPrices = keyword.trim()
    ? prices.filter(
        (p) =>
          p.materialName.includes(keyword) ||
          p.brand.includes(keyword) ||
          p.supplier.includes(keyword) ||
          p.spec.includes(keyword)
      )
    : prices;

  const handleDelete = async (id: string) => {
    await deletePrice(id);
    setShowConfirmDelete(null);
    loadData();
  };

  const handlePreviewFile = async (fileId: string | null, fileType: string) => {
    if (!fileId) return;
    const stored = await getFile(fileId);
    if (!stored) return;
    const url = await getFileURL(stored);
    window.open(url, "_blank");
  };

  const handleExport = async () => {
    const blob = await exportAllData();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `procurement-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 打开"按报价单删除"弹窗，加载文件列表
  const openDeleteByFile = async () => {
    setSelectedFileId(null);
    setDeletePassword("");
    setDeleteError(null);
    setDeleteByFileOpen(true);
    const files = await getAllFiles();
    setFilesList(files);
  };

  // 统计某文件关联的价格条数
  const countPricesByFile = (fileId: string) =>
    prices.filter((p) => p.fileId === fileId).length;

  // 执行按报价单批量删除（需密码）
  const handleDeleteByFile = async () => {
    if (!selectedFileId) return;
    if (deletePassword !== "123456") {
      setDeleteError("删除密码错误，请重新输入");
      return;
    }
    setDeletingFile(true);
    setDeleteError(null);
    try {
      await deleteFileWithPrices(selectedFileId, deletePassword);
      setDeleteByFileOpen(false);
      setSelectedFileId(null);
      setDeletePassword("");
      await loadData();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setDeletingFile(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return dateStr;
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      {/* 标题区 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(217,72%,28%)] to-[hsl(217,72%,40%)] flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">内部价格</h1>
              <p className="text-sm text-slate-500">
                上传询价资料，自动解析存储内部真实价格
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> 导出备份
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openDeleteByFile}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <FileX className="w-3.5 h-3.5 mr-1" /> 按报价单删除
            </Button>
            <Button
              onClick={() => setUploadOpen(true)}
              className="bg-[hsl(217,72%,40%)] hover:bg-[hsl(217,72%,36%)]"
            >
              <Upload className="w-4 h-4 mr-1.5" /> 上传询价资料
            </Button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500">价格记录</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{prices.length}</div>
          <div className="text-xs text-slate-400">条</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <HardDrive className="w-4 h-4 text-green-500" />
            <span className="text-xs text-slate-500">存储文件</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{storage.fileCount}</div>
          <div className="text-xs text-slate-400">个文件 / {formatSize(storage.totalSize)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500">本月新增</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {prices.filter((p) => {
              const d = new Date(p.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="text-xs text-slate-400">条</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Database className={`w-4 h-4 ${backend === "server" ? "text-blue-500" : backend === "cloudbase" ? "text-green-500" : "text-purple-500"}`} />
            <span className="text-xs text-slate-500">存储方式</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {backend === "server" ? "云服务器数据库" : backend === "cloudbase" ? "腾讯云 CloudBase" : "本地浏览器"}
          </div>
          <div className="text-xs text-slate-400">
            {backend === "server" ? "SQLite 持久存储（重装不丢失）" : backend === "cloudbase" ? "云端同步（多设备共享）" : "IndexedDB（已自动降级）"}
          </div>
        </div>
      </div>

      {/* 存储状态提示（按实际后端显示） */}
      {prices.length > 0 && backend === "server" && (
        <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          数据已存储在云服务器数据库中，清除浏览器缓存不会丢失，任何设备访问都是同一份数据。
        </div>
      )}
      {prices.length > 0 && backend === "cloudbase" && (
        <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          数据已存储在腾讯云 CloudBase，清除浏览器缓存不会丢失（云服务器不可用时的备用通道）。
        </div>
      )}
      {prices.length > 0 && backend === "indexeddb" && (
        <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          服务器暂时不可用，数据暂存在本地浏览器中，清除浏览器缓存会丢失数据。建议定期点击「导出备份」，恢复后再上传。
        </div>
      )}

      {/* 搜索栏 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索材料名称、规格、品牌、供应商..."
              className="h-11 pl-11 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 价格列表 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[hsl(217,72%,40%)] animate-spin mb-3" />
          <p className="text-sm text-slate-500">加载中...</p>
        </div>
      ) : filteredPrices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            {prices.length === 0 ? "暂无内部价格数据" : "未找到匹配的记录"}
          </p>
          <p className="text-xs mt-1">
            {prices.length === 0 ? "点击「上传询价资料」开始添加" : "尝试更换搜索关键词"}
          </p>
        </div>
      ) : (
        <>
          {/* 结果统计 */}
          <div className="mb-3 text-sm text-slate-600">
            共 <span className="font-semibold text-[hsl(217,72%,40%)]">{filteredPrices.length}</span> 条记录
          </div>

          {/* 表格 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">材料名称</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">规格</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">品牌</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">供应商</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-slate-500">价格</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">单位</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500">询价日期</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-slate-500">询价单</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-slate-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 text-slate-800 font-medium">{p.materialName}</td>
                      <td className="px-3 py-3 text-slate-600 text-xs">{p.spec || "—"}</td>
                      <td className="px-3 py-3">
                        {p.brand ? (
                          <Badge variant="outline" className="text-xs">{p.brand}</Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-xs">{p.supplier || "—"}</td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-slate-800">
                        {p.price.toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-slate-500 text-xs">{p.unit || "—"}</td>
                      <td className="px-3 py-3 text-slate-500 text-xs">{formatDate(p.inquiryDate)}</td>
                      <td className="px-3 py-3 text-center">
                        {p.fileId ? (
                          <button
                            onClick={() => handlePreviewFile(p.fileId, p.notes?.includes(".pdf") ? "pdf" : p.notes?.includes(".xls") ? "excel" : "image")}
                            className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-blue-100 text-blue-600 transition"
                            title={`查看原件：${p.fileName}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {showConfirmDelete === p.id ? (
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-xs px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setShowConfirmDelete(null)}
                              className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowConfirmDelete(p.id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-red-100 text-red-500 transition"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={loadData}
      />

      {/* 按报价单批量删除弹窗 */}
      <Dialog open={deleteByFileOpen} onOpenChange={(v) => { if (!deletingFile) setDeleteByFileOpen(v); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileX className="w-5 h-5 text-red-500" />
              按报价单批量删除
            </DialogTitle>
            <DialogDescription>
              选择一个报价单，将其文件及关联的全部价格记录一并删除。此操作不可恢复。
            </DialogDescription>
          </DialogHeader>

          {/* 文件列表 */}
          <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-100 rounded-lg p-2">
            {filesList.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-6">暂无存储文件</div>
            )}
            {filesList.map((f) => {
              const count = countPricesByFile(f.id);
              const selected = selectedFileId === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFileId(selected ? null : f.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                    selected
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input type="radio" checked={selected} readOnly className="accent-red-500" />
                  {f.type === "pdf" ? (
                    <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                  ) : f.type === "excel" ? (
                    <FileSpreadsheet className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : f.type === "image" ? (
                    <ImageIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-700 truncate">{f.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {(f.size / 1024).toFixed(0)}KB · 关联 {count} 条价格
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 删除密码 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 flex-shrink-0 font-medium">删除密码：</label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }}
                placeholder="请输入删除密码"
                className="h-8 text-xs w-40"
                disabled={!selectedFileId}
              />
            </div>
            {deleteError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertTriangle className="w-3.5 h-3.5" /> {deleteError}
              </div>
            )}
            {selectedFileId && !deleteError && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2">
                将删除报价单及其关联的 {countPricesByFile(selectedFileId)} 条价格记录，不可恢复！
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteByFileOpen(false)} disabled={deletingFile}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteByFile}
              disabled={!selectedFileId || deletePassword.length === 0 || deletingFile}
            >
              {deletingFile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> 删除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" /> 确认删除
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
