import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Truck } from "lucide-react";
import AWBInputComponent from "./awb-input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminShippingDashboard() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      OR: [
        { status: "Shipped" },
        { status: "InProgress" } // Orders ready to be shipped
      ]
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      orderItems: { include: { product: true } },
    },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Truck className="h-8 w-8 text-indigo-600" />
            Shipping Management
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Manage dispatch tracking and generate thermal shipping labels.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No shipments found</h3>
            <p className="text-gray-500 mt-2">There are currently no orders ready for dispatch.</p>
          </div>
        ) : (
          orders.map((order) => {
             // Basic product summary creation
             const productSummary = order.orderItems.map(p => `${p.quantity}x ${p.product.name}`).join(", ");
             
             return (
              <div key={order.id} className="card-rounded p-6 bg-white flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${order.status === 'Shipped' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.status === 'Shipped' ? 'Dispatched' : 'Ready to Ship'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{order.user.name}</h3>
                  <p className="text-gray-600 font-medium text-sm mt-1 line-clamp-1">{productSummary}</p>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-800 border border-gray-200 shadow-sm relative w-max min-w-[320px]">
                     <p className="font-extrabold text-gray-900 mb-2 uppercase tracking-wide text-xs">Shipping Address</p>
                     {(() => {
                        try {
                           const addr = JSON.parse(order.address);
                           return (
                             <div className="leading-relaxed whitespace-pre-wrap">
                               <p className="font-bold text-black text-base">{addr.fullName}</p>
                               <p>{addr.addressLine1}</p>
                               {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                               <p>{addr.city}, {addr.state} - <span className="font-bold text-black">{addr.pincode}</span></p>
                               <p className="mt-2 pt-2 border-t border-gray-200 font-medium text-black">📞 {addr.phone || 'Not Provided'}</p>
                             </div>
                           );
                        } catch(e) {
                           return <p className="leading-relaxed whitespace-pre-wrap">{order.address}</p>;
                        }
                     })()}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[280px]">
                  {/* AWB Component (Client) */}
                  <AWBInputComponent orderId={order.id} currentAwb={order.awbNumber || ""} />
                  
                  {/* Print Label Generator Button */}
                  <Button asChild variant="outline" className="w-full flex justify-center border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                     <Link href={`/admin/shipping/label/${order.id}`} target="_blank">
                        Generate Shipping Label (PDF)
                     </Link>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
