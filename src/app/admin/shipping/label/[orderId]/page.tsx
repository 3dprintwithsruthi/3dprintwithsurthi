import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Package, Smartphone, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrintShippingLabelPage({
  params,
}: {
  params: Promise<{ orderId: string }> | { orderId: string };
}) {
  const { orderId } = await Promise.resolve(params);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      orderItems: { include: { product: true } },
    },
  });

  if (!order) return notFound();

  // Parse custom address payload to properly format multiline if JSON
  let formattedAddress = order.address;
  let customerContact = order.user.phone || "Not Provided";
  try {
    const obj = JSON.parse(order.address);
    if (obj.fullName) {
       formattedAddress = `${obj.addressLine1}${obj.addressLine2 ? ', ' + obj.addressLine2 : ''}\n${obj.city}, ${obj.state} ${obj.pincode}`;
       if (obj.phone) customerContact = obj.phone;
    }
  } catch (e) {
    // Keep raw
  }

  // Weight / SKU generation logic mock
  const totalItems = order.orderItems.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: 100mm 150mm;
          margin: 0;
        }
        body {
           background-color: #f1f5f9;
        }
        @media print {
          body { margin: 0; padding: 0; background-color: white !important; }
          .no-print { display: none !important; }
          .print-area { 
            width: 100mm; 
            height: 150mm; 
            box-sizing: border-box; 
            margin: 0; 
            border: none;
            page-break-after: always;
            box-shadow: none;
          }
        }
      `}} />
      
      {/* Admin Controls (Hidden during printing) */}
      <div className="no-print p-6 max-w-2xl mx-auto flex flex-col items-center">
         <h2 className="text-xl font-bold mb-4">Preview Shipping Label</h2>
         <p className="text-gray-500 mb-6 text-center">Ensure your thermal printer is set to 4x6" (100x150mm) label scale.</p>
         <div className="flex gap-4">
           <button id="print-label-btn" className="bg-white border-2 border-indigo-200 text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition text-md" >
             🖨️ Print Native
           </button>
           <button id="download-pdf-btn" className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:-translate-y-1 transition text-md" >
             📥 Download PDF
           </button>
         </div>
         <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
         <script dangerouslySetInnerHTML={{ __html: `
            const orderIdSuffix = "${order.id.slice(-8)}";
            document.getElementById("print-label-btn").addEventListener("click", () => window.print());
            document.getElementById("download-pdf-btn").addEventListener("click", () => {
              const element = document.querySelector('.print-area');
              const opt = {
                margin: 0,
                filename: 'Shipping_Label_ORD_' + orderIdSuffix + '.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 4, useCORS: true },
                jsPDF: { unit: 'mm', format: [100, 150], orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            });
         `}} />
      </div>

      {/* Actual Label Boundary */}
      <div className="print-area mx-auto mt-10 bg-white border-[4px] border-black relative flex flex-col font-sans" style={{width: "100mm", height: "150mm", padding: "8mm"}}>
         
         {/* Header Row */}
         <div className="flex items-center gap-4 border-b-[3px] border-black pb-4 mb-4 shrink-0">
            {/* Native img tag is safest for html2pdf.js instead of Next Image loaders */}
            <img src="/logo.png" alt="Logo" crossOrigin="anonymous" className="w-14 h-14 object-contain rounded-full border-2 border-black p-0.5" />
            <div>
               <h1 className="font-extrabold text-lg uppercase tracking-tight leading-none text-black m-0 mb-1">3D PRINT WITH SRUTHI</h1>
               <div className="bg-black text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 inline-block">Official Merchandise</div>
            </div>
         </div>

         {/* Routing Info (Portrait Layout with Breathing Space) */}
         <div className="flex flex-col gap-5 grow mb-3">
            
            {/* Top Block: Ship To */}
            <div className="flex flex-col gap-3 border-b-2 border-gray-300 pb-5 shrink-0 px-1">
                <div>
                   <p className="text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-widest">Ship To:</p>
                   <p className="font-extrabold text-[22px] uppercase leading-none tracking-tight mb-2 text-black">{order.user.name}</p>
                   <p className="text-[13px] leading-snug whitespace-pre-wrap font-medium text-black">{formattedAddress}</p>
                </div>
                <div className="mt-1 flex items-center gap-2 border border-gray-300 rounded p-2 bg-gray-50 w-max">
                   <Smartphone className="w-4 h-4 text-gray-600"/>
                   <p className="font-bold text-sm tracking-wide text-black">{customerContact}</p>
                </div>
            </div>
            
            {/* Bottom Block: AWB & Details */}
            <div className="flex flex-col gap-4 shrink-0 px-1">
                <div className="bg-white p-3 border-[3px] border-black relative overflow-hidden flex flex-col justify-center min-h-[80px]">
                   <div className="absolute top-0 right-0 bg-black text-white px-2 py-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-white fill-black" /> FRAGILE</p>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1 opacity-80">AWB Tracking #</p>
                   {order.awbNumber ? (
                     <p className="font-mono font-black text-3xl tracking-widest leading-none mt-1 text-black">{order.awbNumber}</p>
                   ) : (
                     <p className="font-mono font-bold text-lg tracking-wider text-gray-400 mt-1 italic">NOT ASSIGNED</p>
                   )}
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-1">
                   <div className="border-b border-dashed border-gray-300 pb-1">
                     <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Date</p>
                     <p className="text-sm font-bold uppercase text-black tracking-tight">{new Date(order.createdAt).toLocaleDateString()}</p>
                   </div>
                   <div className="border-b border-dashed border-gray-300 pb-1">
                     <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Items</p>
                     <p className="text-sm font-bold uppercase text-black tracking-tight">{totalItems} PIECE(S)</p>
                   </div>
                   <div className="border-b border-dashed border-gray-300 pb-1">
                     <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Order #</p>
                     <p className="font-mono text-sm font-bold uppercase text-black tracking-tight">#{order.id.slice(-8)}</p>
                   </div>
                   <div className="border-b border-dashed border-gray-300 pb-1">
                     <p className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Payment</p>
                     <p className="text-[12px] font-black uppercase tracking-wider text-black">{order.paymentMethod}</p>
                   </div>
                </div>
            </div>
         </div>

         {/* Barcode Mock Placeholder (since external libraries cause huge dependency trees) */}
         <div className="shrink-0 h-16 border-t-2 border-black pt-2 flex flex-col items-center justify-center">
            {/* Extremely simple pure-CSS barcode simulation for visual aesthetic */}
            <div className="flex w-full h-10 bg-white">
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-3 h-full bg-black ml-1"></div>
                <div className="w-1 h-full bg-black ml-2"></div>
                <div className="w-2 h-full bg-black ml-1"></div>
                <div className="w-1 h-full bg-black ml-3"></div>
                <div className="w-4 h-full bg-black ml-1"></div>
                <div className="w-2 h-full bg-black ml-2"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-3 h-full bg-black ml-2"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-2 h-full bg-black ml-3"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-4 h-full bg-black ml-2"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-2 h-full bg-black ml-1"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-3 h-full bg-black ml-2"></div>
                <div className="w-1 h-full bg-black ml-3"></div>
                <div className="w-2 h-full bg-black ml-1"></div>
                <div className="w-1 h-full bg-black ml-1"></div>
                <div className="w-1 h-full bg-black ml-[40%] text-center text-[10px] w-auto bg-transparent px-2 font-mono self-center">*{order.awbNumber || order.id.slice(-8)}*</div>
                <div className="w-1 h-full bg-black ml-auto border-r-4 border-black border-double"></div>
            </div>
         </div>

      </div>
    </>
  );
}
