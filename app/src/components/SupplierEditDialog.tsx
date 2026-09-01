import { useState, useEffect } from "react";
import { Building2, Phone, MapPin, Tag, Package, Globe, Award, Plus, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { saveSupplierOverride, genSupplierId, type SupplierOverride } from "@/lib/supplierDb";
import type { Supplier } from "@/types";

interface SupplierEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSaved: () => void;
  isNew?: boolean;
}

export function SupplierEditDialog({
  open,
  onOpenChange,
  supplier,
  onSaved,
  isNew = false,
}: SupplierEditDialogProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("");
  const [brand, setBrand] = useState("");
  const [mainProducts, setMainProducts] = useState("");
  const [level, setLevel] = useState("C级");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<string[]>([]);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || "");
      setContact(supplier.contact || "");
      setAddress(supplier.address || "");
      setRegion(supplier.region || "");
      setBrand(supplier.brand || "");
      setMainProducts((supplier.mainProducts || []).join("、"));
      setLevel(supplier.level || "C级");
      setWebsite(supplier.website || "");
      setProducts(supplier.mainProducts || []);
    } else {
      setName("");
      setContact("");
      setAddress("");
      setRegion("");
      setBrand("");
      setMainProducts("");
      setLevel("C级");
      setWebsite("");
    }
  }, [supplier, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const id = supplier?.id || genSupplierId();
      const override: SupplierOverride = {
        id,
        name: name.trim(),
        contact: contact.trim(),
        address: address.trim(),
        region: region.trim(),
        brand: brand.trim(),
        mainProducts: mainProducts
          .split(/[、,，\s]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        level,
        website: website.trim(),
        isCustom: isNew,
        updatedAt: Date.now(),
      };
      await saveSupplierOverride(override);
      onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {isNew ? "新增供应商" : "编辑供应商"}
          </DialogTitle>
          <DialogDescription>
            {isNew ? "手动添加供应商信息" : "修改供应商联系方式等信息"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* 供应商名称 */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> 供应商名称 *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：南京东方雨虹防水工程有限公司"
              className="h-9 text-sm"
            />
          </div>

          {/* 品牌 + 等级 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 flex items-center gap-1">
                <Tag className="w-3 h-3" /> 品牌
              </Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="如：东方雨虹"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 flex items-center gap-1">
                <Award className="w-3 h-3" /> 等级
              </Label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="h-9 w-full px-3 rounded-md border border-slate-300 text-sm bg-white"
              >
                <option value="A级">A级</option>
                <option value="B级">B级</option>
                <option value="C级">C级</option>
              </select>
            </div>
          </div>

          {/* 联系电话 */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> 联系电话
            </Label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="如：025-88888001 或 400-xxx-xxxx"
              className="h-9 text-sm font-mono"
            />
          </div>

          {/* 地区 + 地址 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> 地区
              </Label>
              <Input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="如：南京"
                className="h-9 text-sm"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> 详细地址
              </Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="如：南京市雨花台区xxx路xx号"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* 主营材料 */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 flex items-center gap-1">
              <Package className="w-3 h-3" /> 主营材料（用顿号分隔）
            </Label>
            <Input
              value={mainProducts}
              onChange={(e) => setMainProducts(e.target.value)}
              placeholder="如：防水卷材、防水涂料、密封材料"
              className="h-9 text-sm"
            />
          </div>

          {/* 官网 */}
          <div className="space-y-1">
            <Label className="text-xs text-slate-500 flex items-center gap-1">
              <Globe className="w-3 h-3" /> 官网
            </Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="如：www.yuhong.com.cn"
              className="h-9 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-[hsl(217,72%,40%)] hover:bg-[hsl(217,72%,36%)]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> 保存中...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" /> 保存
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
