"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Banner = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
};

function BannerContent({ banner }: { banner: Banner }) {
  return (
    <>
      <img
        src={banner.image_url}
        alt={banner.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
        <h3 className="text-lg sm:text-xl font-bold drop-shadow-lg">{banner.title}</h3>
        {banner.description && (
          <p className="text-sm text-white/80 mt-1 drop-shadow-md">{banner.description}</p>
        )}
      </div>
    </>
  );
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {banner.link_url ? (
        <Link href={banner.link_url} className="block relative aspect-[3/1] sm:aspect-[4/1]">
          <BannerContent banner={banner} />
        </Link>
      ) : (
        <div className="block relative aspect-[3/1] sm:aspect-[4/1]">
          <BannerContent banner={banner} />
        </div>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 right-4 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`バナー ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
