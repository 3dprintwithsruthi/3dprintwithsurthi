"use server";

/**
 * Product server actions – CRUD for admin; list/detail for store
 */
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validations/product";
import type { CustomFieldDef } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

export type ProductActionResult = { success: boolean; error?: string; id?: string };

/** Admin: create product */
export async function createProductAction(formData: FormData): Promise<ProductActionResult> {
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    images: parseJson(formData.get("images"), [] as string[]),
    videoUrl: (formData.get("videoUrl") as string) || undefined,
    customFields: parseJson(formData.get("customFields"), undefined as CustomFieldDef[] | undefined),
  };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.name?.[0] ?? parsed.error.message;
    return { success: false, error: msg };
  }
  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        price: new Decimal(parsed.data.price),
        stock: parsed.data.stock,
        images: parsed.data.images ?? [],
        videoUrl: parsed.data.videoUrl || null,
        customFields: (parsed.data.customFields ?? []) as object,
      },
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true, id: product.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create" };
  }
}

/** Admin: update product */
export async function updateProductAction(
  id: string,
  formData: FormData
): Promise<ProductActionResult> {
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    images: parseJson(formData.get("images"), [] as string[]),
    videoUrl: (formData.get("videoUrl") as string) || undefined,
    customFields: parseJson(formData.get("customFields"), undefined as CustomFieldDef[] | undefined),
  };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        price: new Decimal(parsed.data.price),
        stock: parsed.data.stock,
        images: parsed.data.images ?? [],
        videoUrl: parsed.data.videoUrl || null,
        customFields: (parsed.data.customFields ?? []) as object,
      },
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath(`/products/${id}`);
    return { success: true, id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update" };
  }
}

/** Admin: delete product */
export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete" };
  }
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
