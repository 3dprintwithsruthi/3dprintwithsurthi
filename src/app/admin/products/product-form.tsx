"use client";

/**
 * Product form – name, description, price, stock, image URLs (with link help), video, dynamic custom fields
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction, updateProductAction } from "@/app/actions/product";
import type { CustomFieldDef } from "@/types";
import { Plus, X } from "lucide-react";

type DefaultValues = {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  videoUrl: string;
  customFields: CustomFieldDef[];
};

type Props = {
  productId?: string;
  defaultValues?: DefaultValues;
};

const emptyDefaults: DefaultValues = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  images: [],
  videoUrl: "",
  customFields: [],
};

function makeKey() {
  return "field_" + Math.random().toString(36).slice(2, 9);
}

export function ProductForm({ productId, defaultValues }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [imagesStr, setImagesStr] = useState(
    (defaultValues?.images ?? []).join("\n")
  );
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>(
    defaultValues?.customFields?.length
      ? defaultValues.customFields.map((f) => ({ ...f, key: f.key || makeKey() }))
      : []
  );

  const isEdit = !!productId;
  const values = defaultValues ?? emptyDefaults;

  const addField = () => {
    setCustomFields((prev) => [
      ...prev,
      { key: makeKey(), label: "", type: "text", required: false, placeholder: "" },
    ]);
  };

  const removeField = (key: string) => {
    setCustomFields((prev) => prev.filter((f) => f.key !== key));
  };

  const updateField = (key: string, updates: Partial<CustomFieldDef>) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...updates } : f))
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const images = imagesStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const fields = customFields
      .filter((f) => f.label.trim())
      .map((f) => ({
        key: f.key,
        label: f.label.trim(),
        type: f.type,
        required: !!f.required,
        placeholder: f.placeholder?.trim() || undefined,
      }));
    formData.set("images", JSON.stringify(images));
    formData.set("customFields", JSON.stringify(fields));

    const result = isEdit
      ? await updateProductAction(productId, formData)
      : await createProductAction(formData);

    if (result.success) {
      router.push("/admin/products");
      router.refresh();
      return;
    }
    setError(result.error ?? "Failed");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6 p-6 card-rounded">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" required defaultValue={values.name} className="mt-1 rounded-xl" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={values.description}
          className="input-rounded mt-1 w-full px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={values.price || undefined}
            className="mt-1 rounded-xl"
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={values.stock}
            className="mt-1 rounded-xl"
          />
        </div>
      </div>

      {/* Product Images – paste URLs (including Google Drive) */}
      <div>
        <Label>Product Images</Label>
        <div className="mt-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Click to upload images or paste image URLs below</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB per image</p>
          </div>
          <p className="mt-4 text-left text-xs text-gray-600">
            <strong>Allowed image links:</strong> Any direct image URL (e.g. https://example.com/image.jpg). For{" "}
            <strong>Google Drive</strong>: open the image in Drive → right-click → Get link → set &quot;Anyone with the link&quot; → copy link. Use the <strong>direct preview URL</strong>:{" "}
            <code className="rounded bg-gray-200 px-1">https://drive.google.com/uc?export=view&amp;id=YOUR_FILE_ID</code>. Replace YOUR_FILE_ID with the ID from your share link (the long string after /d/).
          </p>
          <textarea
            value={imagesStr}
            onChange={(e) => setImagesStr(e.target.value)}
            rows={4}
            placeholder="Paste one image URL per line&#10;https://...&#10;https://drive.google.com/uc?export=view&id=..."
            className="input-rounded mt-3 w-full px-3 py-2 font-mono text-sm"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="videoUrl">Video URL (optional)</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          type="url"
          defaultValue={values.videoUrl}
          placeholder="https://..."
          className="mt-1 rounded-xl"
        />
      </div>

      {/* Custom Fields – dynamic Add Field, no JSON */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <Label>Custom Fields (for Customization)</Label>
          <Button type="button" variant="outline" size="sm" className="rounded-xl border-indigo-200 text-indigo-600" onClick={addField}>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-500">e.g. Name 1, Name 2, Custom Message – shown to customers when ordering</p>
        <div className="mt-4 space-y-4">
          {customFields.map((field, index) => (
            <div key={field.key} className="card-rounded relative p-4">
              <button
                type="button"
                onClick={() => removeField(field.key)}
                className="absolute right-3 top-3 rounded p-1 text-red-500 hover:bg-red-50"
                title="Remove field"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="mb-3 text-xs font-medium text-gray-500">Field #{index + 1}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Field Name</Label>
                  <Input
                    placeholder="e.g., Custom Text"
                    value={field.label}
                    onChange={(e) => updateField(field.key, { label: e.target.value })}
                    className="mt-1 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.key, { type: e.target.value as "text" | "textarea" | "number" })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <Label className="text-xs">Placeholder</Label>
                <Input
                  placeholder="Enter placeholder text"
                  value={field.placeholder ?? ""}
                  onChange={(e) => updateField(field.key, { placeholder: e.target.value })}
                  className="mt-1 rounded-lg"
                />
              </div>
              <label className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!field.required}
                  onChange={(e) => updateField(field.key, { required: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Required</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="rounded-xl">{isEdit ? "Update" : "Create"}</Button>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
