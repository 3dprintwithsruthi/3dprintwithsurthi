"use client";

import { useState } from "react";
import { Loader2, RefreshCcw, FileText, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

export function ShiprocketOrderActions({
  orderId,
  shiprocketOrderId,
  shiprocketShipmentId,
  awbNumber,
}: {
  orderId: string;
  shiprocketOrderId?: string | null;
  shiprocketShipmentId?: string | null;
  awbNumber?: string | null;
  address?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: "create" | "label" | "track") => {
    setLoading(action);
    try {
      let endpoint = "";
      let body: any = null;
      let method = "POST";

      if (action === "create") {
        endpoint = "/api/shiprocket/create-order";
        body = { orderId };
      } else if (action === "label") {
        endpoint = "/api/shiprocket/generate-label";
        body = { shipmentId: shiprocketShipmentId, orderId };
      } else if (action === "track") {
        endpoint = `/api/shiprocket/track?awb=${awbNumber}`;
        method = "GET";
      }

      const res = await fetch(endpoint, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      if (action === "label" && data.label) {
         window.open(data.label, "_blank");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(`Action failed: ${error}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      {!shiprocketOrderId && (
        <button
          onClick={() => handleAction("create")}
          disabled={loading !== null}
          className="flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 disabled:opacity-50"
          title="Push to Shiprocket"
        >
          {loading === "create" ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
          Push
        </button>
      )}

      {shiprocketShipmentId && (
        <button
          onClick={() => handleAction("label")}
          disabled={loading !== null}
          className="flex items-center gap-1 rounded bg-violet-50 px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-100 disabled:opacity-50"
          title="Download Label"
        >
          {loading === "label" ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
          {awbNumber ? "Label" : "AWB"}
        </button>
      )}

      {awbNumber && (
        <button
          onClick={() => handleAction("track")}
          disabled={loading !== null}
          className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
          title="Sync Tracking"
        >
          {loading === "track" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
          Sync
        </button>
      )}
    </div>
  );
}
