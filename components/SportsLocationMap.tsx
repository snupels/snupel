"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityResponse } from "@/lib/api/dto";
import { AppIcon } from "./AppIcon";

const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
const GANGWON_CENTER = { latitude: 37.8228, longitude: 128.1555 };

function validCoordinate(latitude: number | null, longitude: number | null) {
  return latitude !== null
    && longitude !== null
    && Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= 37
    && latitude <= 38.7
    && longitude >= 127
    && longitude <= 129.6;
}

export function SportsLocationMap({ activity }: { activity: ActivityResponse }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [message, setMessage] = useState("");
  const title = activity.placeName ?? activity.sportName ?? "스포츠 장소";
  const mapHref = `/map?id=${activity.id}`;

  const drawMap = useCallback(() => {
    const maps = window.kakao?.maps;
    const container = containerRef.current;
    if (!maps || !container) return;

    const render = (latitude: number, longitude: number) => {
      const position = new maps.LatLng(latitude, longitude);
      const map = new maps.Map(container, {
        center: position,
        level: 4,
        draggable: true,
        scrollwheel: true,
      });
      new maps.Marker({ map, position, title });
    };

    if (validCoordinate(activity.latitude, activity.longitude)) {
      render(activity.latitude as number, activity.longitude as number);
      return;
    }

    if (!activity.address) {
      const center = new maps.LatLng(GANGWON_CENTER.latitude, GANGWON_CENTER.longitude);
      new maps.Map(container, { center, level: 10, draggable: true, scrollwheel: true });
      return;
    }

    const geocoder = new maps.services.Geocoder();
    geocoder.addressSearch(activity.address, (results, status) => {
      if (status === maps.services.Status.OK && results[0]) {
        render(Number(results[0].y), Number(results[0].x));
      } else {
        const center = new maps.LatLng(GANGWON_CENTER.latitude, GANGWON_CENTER.longitude);
        new maps.Map(container, { center, level: 10, draggable: true, scrollwheel: true });
        setMessage("정확한 위치를 찾지 못해 강원도 전체 위치를 표시합니다.");
      }
    });
  }, [activity.address, activity.latitude, activity.longitude, title]);

  useEffect(() => {
    if (sdkReady) drawMap();
  }, [drawMap, sdkReady]);

  function loadKakaoMap() {
    if (!window.kakao?.maps) return;
    window.kakao.maps.load(() => setSdkReady(true));
  }

  return (
    <section className="mt-8">
      {KAKAO_MAP_KEY && (
        <Script
          id="kakao-map-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=clusterer,services`}
          strategy="afterInteractive"
          onLoad={loadKakaoMap}
          onReady={loadKakaoMap}
          onError={() => setMessage("카카오 지도를 불러오지 못했습니다.")}
        />
      )}
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#008f45]">장소 위치</p>
          <h2 className="mt-1 text-xl font-bold">카카오맵에서 확인하기</h2>
        </div>
        <Link href={mapHref} className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#008f45] hover:text-[#006f37]">전체 지도 보기<AppIcon name="arrowRight" /></Link>
      </div>
      <div className="relative h-[300px] overflow-hidden rounded-2xl border border-[#dce6df] bg-[#eaf1ec] shadow-sm sm:h-[360px]">
        <div ref={containerRef} className="size-full" aria-label={`${title} 카카오 지도`} />
        <Link href={mapHref} aria-label={`${title}를 전체 지도에서 보기`} className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#172033] shadow-lg transition hover:text-[#008f45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45]">지도에서 보기<AppIcon name="arrowRight" /></Link>
        <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-lg bg-white/90 px-3 py-2 text-[11px] font-semibold text-[#59675f] shadow">드래그로 이동 · 휠/손가락으로 확대·축소</span>
        {!KAKAO_MAP_KEY && <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-[#68756d]">카카오맵 연결 정보를 확인하고 있습니다.</p>}
        {message && <p className="absolute bottom-3 left-3 right-3 z-20 rounded-lg bg-white/95 px-4 py-2 text-xs text-[#68756d] shadow">{message}</p>}
      </div>
    </section>
  );
}
