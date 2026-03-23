"use client";

import { useTransition, useState } from "react";
import { updateOrderAWBAction } from "@/app/actions/order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AWBInputComponent({
  orderId,
  currentAwb,
}: {
  orderId: string;
  currentAwb: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [awbValue, setAwbValue] = useState(currentAwb);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = () => {
    if (!awbValue || awbValue === currentAwb) return;

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await updateOrderAWBAction(orderId, awbValue);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to update AWB tracking");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl relative">
      {success && (
        <span className="absolute -top-3 right-2 flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm shadow-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Updated
        </span>
      )}
      <Label className="text-sm font-semibold text-indigo-900 border-none">ST Courier Tracking AWB Number</Label>
      <div className="flex gap-2 isolate">
        <Input
          value={awbValue}
          onChange={(e) => setAwbValue(e.target.value)}
          placeholder="e.g. ST123456789"
          className="bg-white border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg h-10 w-full font-mono text-sm"
          disabled={isPending}
        />
        <Button
          onClick={handleUpdate}
          disabled={isPending || !awbValue || awbValue === currentAwb}
          className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
      <p className="text-xs text-indigo-500 font-medium">Auto-triggers tracking email to customer when saved.</p>
    </div>
  );
}
