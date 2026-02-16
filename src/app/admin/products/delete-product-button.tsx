"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/app/actions/product";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${productName}"?`)) return;
    setLoading(true);
    const result = await deleteProductAction(productId);
    setLoading(false);
    if (result.success) router.refresh();
    else alert(result.error);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-red-600 hover:text-red-700"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
