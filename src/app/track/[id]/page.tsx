import { trackAWB } from "@/lib/shiprocket/tracking";
import { prisma } from "@/lib/db";
import { Truck, MapPin, CheckCircle, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TrackingPage({ params }: { params: { id: string } }) {
  // `params.id` can be AWB or Order ID
  const idStr = params.id;

  // Try to find the order if an order ID was passed
  const order = await prisma.order.findUnique({
    where: { id: idStr },
    include: { user: true, orderItems: { include: { product: true } } },
  }).catch(() => null);

  const awb = order?.awbNumber || idStr; // If it's an order, use its AWB, otherwise assume the ID is the AWB

  let trackingData = null;
  let trackingError = null;

  try {
    if (awb) {
      const res = await trackAWB(awb);
      // Shiprocket tracking response structure varies, typical path: res.tracking_data.track_status or res.tracking_data.shipment_track
      if (res && res.tracking_data?.track_status) {
         trackingData = res;
      } else {
         trackingData = res;
      }
    }
  } catch (e: any) {
    trackingError = e.message;
  }

  // Define some UI helpers
  const shipped = trackingData?.tracking_data?.shipment_track?.[0]?.current_status === "SHIPPED";
  const delivered = trackingData?.tracking_data?.shipment_track?.[0]?.current_status === "DELIVERED";
  const scans = trackingData?.tracking_data?.shipment_track_activities || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Track Your Package
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Tracking number: <span className="font-mono text-indigo-600 font-semibold">{awb}</span>
            </p>
        </div>

        {trackingError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
                Could not retrieve tracking info. {trackingError}
            </div>
        )}

        {!trackingError && trackingData && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            
            {/* Header / Status Banner */}
            <div className={`px-4 py-5 sm:px-6 border-b text-white ${delivered ? 'bg-green-600' : 'bg-indigo-600'}`}>
               <h3 className="text-xl leading-6 font-bold flex items-center gap-2">
                 {delivered ? <CheckCircle className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                 {delivered ? "Delivered" : "In Transit"}
               </h3>
               <p className="mt-1 max-w-2xl text-sm opacity-90">
                 {trackingData?.tracking_data?.shipment_track?.[0]?.current_status || "Awaiting scan from courier"}
               </p>
            </div>

            {/* Timeline UI */}
            <div className="px-4 py-5 sm:p-6">
                <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {scans.length > 0 ? scans.map((scan: any, idx: number) => (
                        <li key={idx}>
                          <div className="relative pb-8">
                            {idx !== scans.length - 1 ? (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${idx === 0 ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                                  <Package className="h-4 w-4 text-white" aria-hidden="true" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-900 font-medium">
                                    {scan.activity}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {scan.location || "Location Unavailable"}
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500 font-mono">
                                  <time dateTime={scan.date}>{new Date(scan.date).toLocaleString()}</time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      )) : (
                         <p className="text-center text-gray-500 py-8">Tracking details have not been updated by the courier yet. Please check back later.</p>
                      )}
                    </ul>
                </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
