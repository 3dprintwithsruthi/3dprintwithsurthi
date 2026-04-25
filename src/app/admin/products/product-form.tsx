"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction, updateProductAction } from "@/app/actions/product";
import type { CustomFieldDef } from "@/types";
import {
  Plus, X, Image as ImageIcon, Video, Tag, Package,
  ChevronDown, ChevronUp, Info, Loader2, CheckCircle2, Upload
} from "lucide-react";

type DefaultValues = {
  name: string; description: string; price: number;
  stock: number; images: string[]; videoUrl: string; customFields: CustomFieldDef[];
};
type Props = { productId?: string; defaultValues?: DefaultValues };

const emptyDefaults: DefaultValues = { name: "", description: "", price: 0, stock: 0, images: [], videoUrl: "", customFields: [] };
function makeKey() { return "field_" + Math.random().toString(36).slice(2, 9); }

const QUICK_TEMPLATES = [
  { label: "Keychain", fields: [{ label: "Name to Print", type: "text", required: true, placeholder: "e.g. John" }] },
  { label: "Nameplate", fields: [{ label: "Full Name", type: "text", required: true, placeholder: "e.g. Smith Family" }, { label: "Font Style", type: "text", required: false, placeholder: "e.g. Script, Bold" }] },
  { label: "Custom Box", fields: [{ label: "Message", type: "textarea", required: false, placeholder: "e.g. Happy Birthday!" }, { label: "Quantity", type: "number", required: true, placeholder: "1" }] },
];

export function ProductForm({ productId, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagesStr, setImagesStr] = useState((defaultValues?.images ?? []).join("\n"));
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>(
    defaultValues?.customFields?.length
      ? defaultValues.customFields.map((f) => ({ ...f, key: f.key || makeKey() }))
      : []
  );
  const [showImageHelp, setShowImageHelp] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!productId;
  const values = defaultValues ?? emptyDefaults;

  // Parse current image list for preview
  const imageList = imagesStr.split("\n").map(s => s.trim()).filter(Boolean);

  const addField = () => setCustomFields(prev => [...prev, { key: makeKey(), label: "", type: "text", required: false, placeholder: "" }]);
  const removeField = (key: string) => setCustomFields(prev => prev.filter(f => f.key !== key));
  const updateField = (key: string, updates: Partial<CustomFieldDef>) =>
    setCustomFields(prev => prev.map(f => f.key === key ? { ...f, ...updates } : f));

  function applyTemplate(tmpl: typeof QUICK_TEMPLATES[0]) {
    setCustomFields(tmpl.fields.map(f => ({ ...f, key: makeKey(), type: f.type as "text" | "textarea" | "number" })));
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const id = Math.random().toString(36).slice(2);
      setUploadingImages(prev => [...prev, id]);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        }
      } catch { /* silently skip failed uploads */ }
      setUploadingImages(prev => prev.filter(x => x !== id));
    }
    if (newUrls.length > 0) {
      setImagesStr(prev => {
        const existing = prev.trim();
        return existing ? `${existing}\n${newUrls.join("\n")}` : newUrls.join("\n");
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const images = imagesStr.split("\n").map(s => s.trim()).filter(Boolean);
    const fields = customFields.filter(f => f.label.trim()).map(f => ({
      key: f.key, label: f.label.trim(), type: f.type,
      required: !!f.required, placeholder: f.placeholder?.trim() || undefined,
    }));
    formData.set("images", JSON.stringify(images));
    formData.set("customFields", JSON.stringify(fields));

    startTransition(async () => {
      const result = isEdit
        ? await updateProductAction(productId, formData)
        : await createProductAction(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => { router.push("/admin/products"); router.refresh(); }, 1000);
        return;
      }
      setError(result.error ?? "Failed to save product");
    });
  }

  const SectionHeader = ({ id, icon: Icon, title, subtitle, color }: { id: string; icon: any; title: string; subtitle: string; color: string }) => (
    <div
      className="flex items-center justify-between cursor-pointer group"
      onClick={() => setActiveSection(activeSection === id ? null : id)}
    >
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      {activeSection === id
        ? <ChevronUp className="h-4 w-4 text-gray-400" />
        : <ChevronDown className="h-4 w-4 text-gray-400" />}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Banner */}
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="font-semibold text-emerald-800">Product {isEdit ? "updated" : "created"} successfully! Redirecting…</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4">
          <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── SECTION 1: Basic Info ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Tag className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Basic Information</p>
                <p className="text-xs text-gray-500">Product name, description, price and stock</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name" name="name" required defaultValue={values.name}
                placeholder="e.g. Custom Name Keychain"
                className="mt-1.5 h-11 rounded-xl focus-visible:ring-indigo-500 text-gray-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                <span className="text-xs text-gray-400">Tell customers what makes this special</span>
              </div>
              <textarea
                id="description" name="description" rows={3}
                defaultValue={values.description}
                placeholder="Describe your product — materials, dimensions, use cases…"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-semibold text-gray-700">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <Input
                    id="price" name="price" type="number" step="0.01" min="0" required
                    defaultValue={values.price || undefined}
                    placeholder="0.00"
                    className="pl-7 h-11 rounded-xl focus-visible:ring-indigo-500 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">
                  Stock Quantity <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="stock" name="stock" type="number" min="0" required
                    defaultValue={values.stock}
                    placeholder="0"
                    className="pl-9 h-11 rounded-xl focus-visible:ring-indigo-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Images ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center shrink-0">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Product Images</p>
                  <p className="text-xs text-gray-500">{imageList.length} image{imageList.length !== 1 ? "s" : ""} added</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageHelp(h => !h)}
                className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline"
              >
                <Info className="h-3 w-3" /> How to add images?
              </button>
            </div>
          </div>

          {showImageHelp && (
            <div className="mx-5 mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-800 space-y-1">
              <p className="font-bold text-sm mb-2">📌 3 ways to add images:</p>
              <p><strong>1. Upload directly</strong> — Click the upload area below to pick files from your computer.</p>
              <p><strong>2. Google Drive</strong> — Share your file (Anyone with link), copy the link, paste below.</p>
              <p><strong>3. Any direct URL</strong> — Paste any public image URL ending in .jpg/.png/.webp</p>
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Upload Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
              className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
            >
              <input
                ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleFileUpload(e.target.files)}
              />
              <Upload className="h-8 w-8 text-gray-300 group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm font-semibold text-gray-600 group-hover:text-indigo-600">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — multiple files supported</p>
              {uploadingImages.length > 0 && (
                <div className="mt-3 flex items-center justify-center gap-2 text-indigo-600 text-xs font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading {uploadingImages.length} file{uploadingImages.length > 1 ? "s" : ""}…
                </div>
              )}
            </div>

            {/* Live Image Previews */}
            {imageList.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {imageList.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Product ${i + 1}`} className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' text-anchor='middle' dy='.3em' font-size='12'%3EBroken%3C/text%3E%3C/svg%3E"; }} />
                    <button
                      type="button"
                      onClick={() => setImagesStr(prev => prev.split("\n").filter((_, idx) => idx !== i).join("\n"))}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                      #{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* URL textarea */}
            <div>
              <Label className="text-xs font-semibold text-gray-600">Or paste image URLs (one per line)</Label>
              <textarea
                value={imagesStr}
                onChange={(e) => setImagesStr(e.target.value)}
                rows={3}
                placeholder={"https://drive.google.com/file/d/YOUR_FILE_ID/view\nhttps://example.com/image.jpg"}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-mono text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Video ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-pink-500 flex items-center justify-center shrink-0">
              <Video className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Product Video <span className="text-gray-400 font-normal">(Optional)</span></p>
              <p className="text-xs text-gray-500">YouTube, Vimeo or direct video URL</p>
            </div>
          </div>
          <Input
            id="videoUrl" name="videoUrl" type="url"
            defaultValue={values.videoUrl}
            placeholder="https://youtube.com/watch?v=... or https://..."
            className="h-11 rounded-xl focus-visible:ring-pink-400 text-gray-900"
          />
        </div>

        {/* ── SECTION 4: Custom Fields ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Customization Fields</p>
                  <p className="text-xs text-gray-500">Extra inputs shown to customers at checkout</p>
                </div>
              </div>
              <Button type="button" size="sm" onClick={addField}
                className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg border-0">
                <Plus className="h-3 w-3 mr-1" /> Add Field
              </Button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Quick Templates */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map(t => (
                  <button
                    key={t.label} type="button" onClick={() => applyTemplate(t)}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    ⚡ {t.label}
                  </button>
                ))}
                {customFields.length > 0 && (
                  <button type="button" onClick={() => setCustomFields([])}
                    className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {customFields.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-100 p-8 text-center">
                <p className="text-sm text-gray-500">No custom fields yet.</p>
                <p className="text-xs text-gray-400 mt-1">Use a template above or click "Add Field" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customFields.map((field, index) => (
                  <div key={field.key} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Field #{index + 1}</span>
                      <button type="button" onClick={() => removeField(field.key)}
                        className="h-6 w-6 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="text-xs font-semibold text-gray-600">Field Label</Label>
                        <Input
                          placeholder="e.g. Name to Print"
                          value={field.label}
                          onChange={e => updateField(field.key, { label: e.target.value })}
                          className="mt-1 h-9 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-600">Input Type</Label>
                        <select
                          value={field.type}
                          onChange={e => updateField(field.key, { type: e.target.value as "text" | "textarea" | "number" })}
                          className="mt-1 w-full h-9 rounded-lg border border-gray-200 px-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                          <option value="text">📝 Short Text</option>
                          <option value="textarea">📄 Long Text</option>
                          <option value="number">🔢 Number</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Label className="text-xs font-semibold text-gray-600">Placeholder Hint</Label>
                      <Input
                        placeholder="e.g. Enter name here..."
                        value={field.placeholder ?? ""}
                        onChange={e => updateField(field.key, { placeholder: e.target.value })}
                        className="mt-1 h-9 rounded-lg text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                      <input
                        type="checkbox" checked={!!field.required}
                        onChange={e => updateField(field.key, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Mark as required</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="flex gap-3 pb-8">
          <Button
            type="submit" disabled={isPending || success}
            className="flex-1 h-12 text-base font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all border-0"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</>
              : success
                ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved!</>
                : isEdit ? "Update Product" : "Create Product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}
            className="h-12 px-6 rounded-xl font-semibold text-gray-700 border-gray-200">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
