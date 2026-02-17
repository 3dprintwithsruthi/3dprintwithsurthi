"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl, getOptimizedVideoUrl } from "@/lib/media";

interface ProductGalleryProps {
    images: string[];
    videoUrl?: string | null;
    productName: string;
}

export function ProductGallery({ images, videoUrl, productName }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Combine images and video into a single list of items
    const mediaItems = [
        ...images.map((url) => ({ type: "image" as const, url })),
        ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
    ];

    if (mediaItems.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-100 italic text-gray-400">
                No media available
            </div>
        );
    }

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
    };

    const activeItem = mediaItems[activeIndex];

    return (
        <div className="space-y-6">
            {/* Main Display */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 shadow-sm border border-gray-100 group">

                {/* Navigation Buttons (Only if > 1 item) */}
                {mediaItems.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95 focus:outline-none z-10 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 duration-300 pointer-events-none group-hover:pointer-events-auto"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95 focus:outline-none z-10 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 duration-300 pointer-events-none group-hover:pointer-events-auto"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Content */}
                <div className="h-full w-full relative">
                    {activeItem.type === "video" ? (
                        <iframe
                            src={getOptimizedVideoUrl(activeItem.url)}
                            title="Product video"
                            className="h-full w-full"
                            allowFullScreen
                        />
                    ) : (
                        <Image
                            src={getOptimizedImageUrl(activeItem.url)}
                            alt={`${productName} - View ${activeIndex + 1}`}
                            fill
                            className="object-cover object-center transition-opacity duration-300"
                            priority={activeIndex === 0}
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    )}
                </div>

                {/* Counter Pill */}
                {mediaItems.length > 1 && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white pointer-events-none">
                        {activeIndex + 1} / {mediaItems.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x px-1">
                    {mediaItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={cn(
                                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all hover:opacity-100 snap-start focus:outline-none focus:ring-2 focus:ring-indigo-500",
                                activeIndex === idx
                                    ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 opacity-100 scale-105 shadow-md"
                                    : "border-transparent opacity-60 hover:scale-105 hover:border-gray-300"
                            )}
                        >
                            {item.type === "video" ? (
                                <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
                                    <PlayCircle className="h-8 w-8 text-white/90" />
                                </div>
                            ) : (
                                <Image
                                    src={getOptimizedImageUrl(item.url)}
                                    alt={`Thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
