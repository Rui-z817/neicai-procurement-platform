import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { saveFile, savePrice, batchSavePrices, getFile, getFileURL, type InternalPrice, type StoredFile } from "@/lib/db";
import { parseFile, getExtractedPriceRows, type ExtractedPriceRow, type ParsedFileResult } from "@/lib/fileParser";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

interface UploadedFileState {
  file: File;
  stored: StoredFile | null;
  parsing: boolean;
  parsed: ParsedFileResult | null;
  extractedRows: ExtractedPriceRow[];
  selectedRows: Set<number>;
  error: string | null;
  batchBrand: string;
  batchSupplier: string;
}

export function UploadDialog({ open, onOpenChange, onUploaded }: UploadDialogProps) {
  const [files, setFiles] = useState<UploadedFileState[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback(async (fileList: File[]) => {
    const newStates: UploadedFileState[] = fileList.map((file) => ({
      file,
      stored: null,
      parsing: true,
      parsed: null,
      extractedRows: [],
      selectedRows: new Set(),
      error: null,
      batchBrand: "",
      batchSupplier: "",
    }));

    setFiles((prev) => [...prev, ...newStates]);

    // 逐个解析（只解析，不保存）
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const parsed = await parseFile(file);
        const extracted = getExtractedPriceRows(parsed);

        // 默认选中所有提取到的行
        const selectedRows = new Set(extracted.map((_, idx) => idx));

        setFiles((prev) =>
          prev.map((s, idx) => {
            const targetIdx = prev.length - fileList.length + i;
            if (idx !== targetIdx) return s;
            return {
              ...s,
              parsing: false,
              parsed,
              extractedRows: extracted,
              selectedRows,
            };
          })
        );
      } catch (e) {
        setFiles((prev) =>
          prev.map((s, idx) => {
            const targetIdx = prev.length - fileList.length + i;
            if (idx !== targetIdx) return s;
            return { ...s, parsing: false, error: e instanceof Error ? e.message : "解析失败" };
          })
        );
      }
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) handleFiles(dropped);
    },
    [handleFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRow = (fileIdx: number, rowIdx: number) => {
    setFiles((prev) =>
      prev.map((s, i) => {
        if (i !== fileIdx) return s;
        const newSet = new Set(s.selectedRows);
        if (newSet.has(rowIdx)) newSet.delete(rowIdx);
        else newSet.add(rowIdx);
        return { ...s, selectedRows: newSet };
      })
    );
  };

  const updateRowField = (
    fileIdx: number,
    rowIdx: number,
    field: "brand" | "supplier",
    value: string
  ) => {
    setFiles((prev) =>
      prev.map((s, i) => {
        if (i !== fileIdx) return s;
        const newRows = s.extractedRows.map((r, ri) =>
          ri === rowIdx ? { ...r, [field]: value } : r
        );
        return { ...s, extractedRows: newRows };
      })
    );
  };

  const updateBatchField = (
    fileIdx: number,
    field: "batchBrand" | "batchSupplier",
    value: string
  ) => {
    setFiles((prev) =>
      prev.map((s, i) => (i === fileIdx ? { ...s, [field]: value } : s))
    );
  };

  const applyBatchToSelected = (fileIdx: number) => {
    setFiles((prev) =>
      prev.map((s, i) => {
        if (i !== fileIdx) return s;
        const newRows = s.extractedRows.map((r, ri) => {
          if (!s.selectedRows.has(ri)) return r;
          return {
            ...r,
            brand: s.batchBrand || r.brand,
            supplier: s.batchSupplier || r.supplier,
          };
        });
        return { ...s, extractedRows: newRows };
      })
    );
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      for (const fileState of files) {
        // 先保存文件到存储（此时才上传到 CloudBase 或存入 IndexedDB）
        const stored = await saveFile(fileState.file, fileState.parsed?.text || null);
        const fileId = stored.id;
        const fileName = stored.name;

        // 保存选中的提取行
        const prices: Array<Omit<InternalPrice, "id" | "createdAt">> = [];
        for (const rowIdx of fileState.selectedRows) {
          const row = fileState.extractedRows[rowIdx];
          if (!row || !row.materialName) continue;
          prices.push({
            materialName: row.materialName,
            spec: row.spec,
            brand: row.brand,
            supplier: row.supplier,
            price: parseFloat(row.price.replace(/,/g, "")) || 0,
            unit: row.unit || "元",
            region: "",
            inquiryDate: new Date().toISOString().slice(0, 10),
            projectType: "其它材料",
            notes: `从文件解析：${fileName}`,
            fileId,
            fileName,
          });
        }

        if (prices.length > 0) {
          await batchSavePrices(prices);
        }
      }

      onUploaded();
      onOpenChange(false);
      setFiles([]);
    } finally {
      setUploading(false);
    }
  };

  const previewFile = async (fileId: string, type: string) => {
    const stored = await getFile(fileId);
    if (!stored) return;
    const url = await getFileURL(stored);
    if (!url) return;

    if (type === "image") {
      setShowPreview(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const fileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
    if (type === "excel") return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    if (type === "image") return <ImageIcon className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const hasSelectedRows = files.some((f) => f.selectedRows.size > 0);

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!uploading) { onOpenChange(v); if (!v) setFiles([]); } }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              上传询价资料
            </DialogTitle>
            <DialogDescription>
              上传 PDF / Excel / 图片文件，系统自动解析提取价格信息
            </DialogDescription>
          </DialogHeader>

          {/* 拖拽上传区 */}
          <div
            ref={dragRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[hsl(217,72%,40%)] hover:bg-blue-50/30 transition cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium">点击或拖拽文件到此处上传</p>
            <p className="text-xs text-slate-400 mt-1">支持 PDF、Excel、图片格式</p>
          </div>

          {/* 已上传文件列表 */}
          {files.length > 0 && (
            <div className="space-y-3 mt-4">
              {files.map((fileState, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  {/* 文件头部 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {fileIcon(fileState.stored?.type || "other")}
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {fileState.file.name}
                      </span>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {(fileState.file.size / 1024).toFixed(0)}KB
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {fileState.stored && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => previewFile(fileState.stored!.id, fileState.stored!.type)}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> 预览
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(idx)}
                        className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* 解析状态 */}
                  {fileState.parsing && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在解析文件...
                    </div>
                  )}

                  {fileState.parsed && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      {fileState.parsed.summary}
                    </div>
                  )}

                  {fileState.error && (
                    <div className="flex items-center gap-2 text-xs text-red-500 mb-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {fileState.error}
                    </div>
                  )}

                  {/* 提取到的价格行 */}
                  {fileState.extractedRows.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-slate-500 mb-1.5 font-medium">
                        识别到 {fileState.extractedRows.length} 条价格（已选 {fileState.selectedRows.size} 条）
                      </div>

                      {/* 批量填写品牌/供应商 */}
                      {fileState.selectedRows.size > 0 && (
                        <div className="mb-2 p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs">
                          <span className="text-amber-700 flex-shrink-0">批量填充：</span>
                          <input
                            type="text"
                            placeholder="品牌"
                            value={fileState.batchBrand || ""}
                            onChange={(e) => updateBatchField(idx, "batchBrand", e.target.value)}
                            className="h-7 px-2 rounded border border-amber-200 bg-white text-xs w-24"
                          />
                          <input
                            type="text"
                            placeholder="供应商"
                            value={fileState.batchSupplier || ""}
                            onChange={(e) => updateBatchField(idx, "batchSupplier", e.target.value)}
                            className="h-7 px-2 rounded border border-amber-200 bg-white text-xs w-32 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => applyBatchToSelected(idx)}
                            className="h-7 px-3 rounded bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 flex-shrink-0"
                          >
                            应用到已选 {fileState.selectedRows.size} 条
                          </button>
                        </div>
                      )}

                      <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="px-2 py-1.5 text-left w-8"></th>
                              <th className="px-2 py-1.5 text-left">材料名称</th>
                              <th className="px-2 py-1.5 text-left">规格</th>
                              <th className="px-2 py-1.5 text-left">品牌 *</th>
                              <th className="px-2 py-1.5 text-right">价格</th>
                              <th className="px-2 py-1.5 text-left">单位</th>
                              <th className="px-2 py-1.5 text-left">供应商 *</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fileState.extractedRows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className={`border-t border-slate-100 ${
                                  fileState.selectedRows.has(rowIdx) ? "bg-blue-50/30" : "opacity-50"
                                }`}
                                onClick={() => toggleRow(idx, rowIdx)}
                              >
                                <td className="px-2 py-1">
                                  <input
                                    type="checkbox"
                                    checked={fileState.selectedRows.has(rowIdx)}
                                    onChange={() => toggleRow(idx, rowIdx)}
                                    className="w-3.5 h-3.5 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </td>
                                <td className="px-2 py-1 text-slate-700">{row.materialName || "—"}</td>
                                <td className="px-2 py-1 text-slate-500">{row.spec || "—"}</td>
                                <td className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={row.brand}
                                    onChange={(e) => updateRowField(idx, rowIdx, "brand", e.target.value)}
                                    placeholder="手填品牌"
                                    className="h-6 px-1.5 rounded border border-slate-200 bg-white text-xs w-full focus:outline-none focus:border-amber-400"
                                  />
                                </td>
                                <td className="px-2 py-1 text-right font-mono text-slate-700">{row.price || "—"}</td>
                                <td className="px-2 py-1 text-slate-500">{row.unit || "—"}</td>
                                <td className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={row.supplier}
                                    onChange={(e) => updateRowField(idx, rowIdx, "supplier", e.target.value)}
                                    placeholder="手填供应商"
                                    className="h-6 px-1.5 rounded border border-slate-200 bg-white text-xs w-full focus:outline-none focus:border-amber-400"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 无提取结果时的手动录入提示 */}
                  {fileState.parsed && fileState.extractedRows.length === 0 && !fileState.error && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2">
                      未自动识别到价格行，可稍后手动录入价格信息
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { onOpenChange(false); setFiles([]); }}
              disabled={uploading}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={uploading || !hasSelectedRows || files.length === 0}
              className="bg-[hsl(217,72%,40%)] hover:bg-[hsl(217,72%,36%)]"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  保存选中的价格（{files.reduce((s, f) => s + f.selectedRows.size, 0)} 条）
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 图片预览弹窗 */}
      {showPreview && (
        <Dialog open={true} onOpenChange={() => setShowPreview(null)}>
          <DialogContent className="max-w-2xl">
            <img src={showPreview} alt="预览" className="w-full rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
