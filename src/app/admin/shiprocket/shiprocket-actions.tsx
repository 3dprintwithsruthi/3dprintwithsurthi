"use client";

import { useState } from "react";
import { Loader2, Download, RefreshCcw, Truck, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function ShiprocketActions({
  orderId,
  shiprocketOrderId,
  shiprocketShipmentId,
  awbNumber,
  labelUrl,
  trackingStatus,
}: {
  orderId: string;
  shiprocketOrderId?: string | null;
  shiprocketShipmentId?: string | null;
  awbNumber?: string | null;
  labelUrl?: string | null;
  trackingStatus?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  const handleCreateOrder = async () => {
    setLoading("create");
    try {
      const res = await fetch("/api/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading("");
    }
  };

  const handleGenerateLabel = async () => {
    setLoading("label");
    try {
      const res = await fetch("/api/shiprocket/generate-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId: shiprocketShipmentId, orderId }),
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading("");
    }
  };

  const handleSyncTracking = async () => {
    if (!awbNumber) return;
    setLoading("track");
    try {
      const res = await fetch(`/api/shiprocket/track?awb=${awbNumber}`);
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Truck className="w-4 h-4 text-indigo-600" />
        Shiprocket Fulfillment
      </h4>
      <div className="flex flex-wrap gap-2 text-sm max-w-2xl bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="grid grid-cols-2 gap-4 w-full mb-3">
          <div>
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider block">Shiprocket Order</span>
            <span className="font-medium text-gray-900">{shiprocketOrderId || "Not Synced"}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider block">Shipment ID</span>
            <span className="font-medium text-gray-900">{shiprocketShipmentId || "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider block">AWB Number</span>
            <span className="font-medium text-indigo-600 font-mono">{awbNumber || "Pending"}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase font-bold tracking-wider block">Tracking Status</span>
            <span className="font-medium inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs mt-1">
              {trackingStatus || "Unknown"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2 w-full pt-3 border-t border-gray-200">
          {!shiprocketOrderId && (
            <button
              onClick={handleCreateOrder}
              disabled={loading === "create"}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium text-xs transition-colors"
            >
              {loading === "create" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              Push to Shiprocket
            </button>
          )}

          {shiprocketShipmentId && !labelUrl && (
            <button
              onClick={handleGenerateLabel}
              disabled={loading === "label"}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-md font-medium text-xs transition-colors"
            >
              {loading === "label" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Generate Label
            </button>
          )}

          {labelUrl && (
            <a
              href={labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md font-medium text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Label
            </a>
          )}

          {awbNumber && (
            <button
              onClick={handleSyncTracking}
              disabled={loading === "track"}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium text-xs transition-colors ml-auto"
            >
              {loading === "track" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              Sync Tracking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
