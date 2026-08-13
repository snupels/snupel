"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ActivityExploreResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";
import { sportsFacilityType } from "@/lib/sportsFacility";
import { AppIcon } from "./AppIcon";

type KakaoLatLng = object;
type KakaoMap = object;
type KakaoMarker = object;
type KakaoBounds = { extend(position: KakaoLatLng): void };

type KakaoMaps = {
  load(callback: () => void): void;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap & {
    setBounds(bounds: KakaoBounds): void;
  };
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoBounds;
  Marker: new (options: { map?: KakaoMap; position: KakaoLatLng; title: string }) => KakaoMarker;
  MarkerClusterer: new (options: { map: KakaoMap; markers: KakaoMarker[]; averageCenter: boolean; minLevel: number }) => object;
  InfoWindow: new (options: { content: HTMLElement; removable?: boolean }) => {
    open(map: KakaoMap, marker: KakaoMarker): void;
  };
  event: { addListener(target: KakaoMarker, type: "click", listener: () => void): void };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

const KAKAO_MAP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
const GANGWON_CENTER = { latitude: 37.8228, longitude: 128.1555 };
const regions = [
  "전체",
  "춘천시",
  "원주시",
  "강릉시",
  "동해시",
  "태백시",
  "속초시",
  "삼척시",
  "홍천군",
  "횡성군",
  "영월군",
  "평창군",
  "정선군",
  "철원군",
  "화천군",
  "양구군",
  "인제군",
  "고성군",
  "양양군",
] as const;

function normalizeRegion(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, "").replace(/[시군구]$/, "");
}

function markerContent(activity: ActivityExploreResponse) {
  const wrapper = document.createElement("div");
  wrapper.className = "min-w-52 max-w-64 rounded-xl bg-white p-4 shadow-xl";

  const title = document.createElement("strong");
  title.className = "block text-sm text-[#172033]";
  title.textContent = activity.placeName ?? activity.sportName ?? "스포츠 시설";
  wrapper.append(title);

  const detail = document.createElement("p");
  detail.className = "mt-1 text-xs text-[#68756d]";
  detail.textContent = [sportsFacilityType(activity), activity.sigun].filter(Boolean).join(" · ");
  wrapper.append(detail);

  const link = document.createElement("a");
  link.className = "mt-3 inline-flex text-xs font-bold text-[#008f45]";
  link.href = `/sports/detail?id=${activity.id}`;
  link.textContent = "상세정보 보기 →";
  wrapper.append(link);
  return wrapper;
}

export function SportsMapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activities, setActivities] = useState<ActivityExploreResponse[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("스포츠 시설을 불러오는 중입니다.");
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadSports() {
      try {
        const collected: ActivityExploreResponse[] = [];
        for (let page = 1; page <= 50; page += 1) {
          const batch = await api.sports.list({ page, size: 100 });
          collected.push(...batch);
          if (batch.length < 100) break;
        }
        if (!cancelled) {
          const unique = [...new Map(collected.map((item) => [item.id, item])).values()];
          setActivities(unique);
          setMessage("");
        }
      } catch {
        if (!cancelled) setMessage("스포츠 시설 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadSports();
    return () => { cancelled = true; };
  }, []);

  const mappedActivities = useMemo(() => activities.filter((activity) => (
    activity.latitude !== null
    && activity.longitude !== null
    && (selectedRegion === "전체" || normalizeRegion(activity.sigun || activity.region) === normalizeRegion(selectedRegion))
  )), [activities, selectedRegion]);

  const missingCoordinates = activities.filter((activity) => activity.latitude === null || activity.longitude === null).length;

  const initializeMap = useCallback(() => {
    const maps = window.kakao?.maps;
    const container = mapContainerRef.current;
    if (!maps || !container) return;

    const map = new maps.Map(container, {
      center: new maps.LatLng(GANGWON_CENTER.latitude, GANGWON_CENTER.longitude),
      level: 10,
    });
    if (mappedActivities.length === 0) return;

    const bounds = new maps.LatLngBounds();
    const markers = mappedActivities.map((activity) => {
      const position = new maps.LatLng(activity.latitude as number, activity.longitude as number);
      const marker = new maps.Marker({
        position,
        title: activity.placeName ?? activity.sportName ?? "스포츠 시설",
      });
      const infoWindow = new maps.InfoWindow({ content: markerContent(activity), removable: true });
      maps.event.addListener(marker, "click", () => infoWindow.open(map, marker));
      bounds.extend(position);
      return marker;
    });
    new maps.MarkerClusterer({ map, markers, averageCenter: true, minLevel: 7 });
    map.setBounds(bounds);
  }, [mappedActivities]);

  useEffect(() => {
    if (sdkReady) initializeMap();
  }, [initializeMap, sdkReady]);

  function loadKakaoMap() {
    if (!window.kakao) {
      setMessage("카카오맵을 불러오지 못했습니다. 도메인 등록과 JavaScript 키를 확인해주세요.");
      return;
    }
    window.kakao.maps.load(() => setSdkReady(true));
  }

  return (
    <main className="min-h-screen bg-[#f3f7f4] pb-16">
      {KAKAO_MAP_KEY && (
        <Script
          id="kakao-map-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=clusterer`}
          strategy="afterInteractive"
          onReady={loadKakaoMap}
          onError={() => setMessage("카카오맵 SDK를 불러오지 못했습니다.")}
        />
      )}

      <section className="border-b border-[#dfe8e2] bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 xl:px-20">
          <p className="text-sm font-bold text-[#008f45]">GANGWON SPORTS MAP</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#172033]">지역별로 보기</h1>
          <p className="mt-3 text-sm text-[#68756d]">강원 18개 시군의 스포츠 활동과 시설을 지도에서 확인하세요.</p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="지역 선택">
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`h-9 cursor-pointer rounded-full border px-4 text-xs font-bold transition ${selectedRegion === region ? "border-[#008f45] bg-[#008f45] text-white" : "border-[#d9e3dc] bg-white text-[#5f6c64] hover:border-[#7caf8d] hover:text-[#008f45]"}`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 xl:px-20">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e5f3ea] px-4 py-2 font-bold text-[#008f45]"><AppIcon name="mapPin" />지도 표시 {mappedActivities.length}곳</span>
          <span className="rounded-full bg-white px-4 py-2 text-[#68756d]">전체 API 데이터 {activities.length}곳</span>
          {missingCoordinates > 0 && <span className="rounded-full bg-[#fff6dd] px-4 py-2 text-[#8a6800]">좌표 미등록 {missingCoordinates}곳</span>}
        </div>

        {!KAKAO_MAP_KEY && (
          <div className="mb-4 rounded-2xl border border-[#f1d58b] bg-[#fff9e8] p-5 text-sm leading-6 text-[#725900]">
            카카오맵 JavaScript 키가 아직 배포 환경에 등록되지 않았습니다. GitHub Secret에 <strong>NEXT_PUBLIC_KAKAO_MAP_APP_KEY</strong>를 추가하면 지도가 표시됩니다.
          </div>
        )}
        {message && <p className="mb-4 rounded-2xl bg-white px-5 py-4 text-sm text-[#68756d]">{message}</p>}

        <div className="overflow-hidden rounded-[24px] border border-[#dce6df] bg-white shadow-[0_18px_50px_rgba(32,76,51,0.12)]">
          <div ref={mapContainerRef} className="h-[65vh] min-h-[480px] w-full" aria-label="강원 스포츠 시설 지도" />
          {!loading && mappedActivities.length === 0 && (
            <div className="border-t border-[#e5ebe7] p-5 text-center text-sm text-[#68756d]">선택한 지역에 좌표가 등록된 스포츠 시설이 없습니다.</div>
          )}
        </div>
      </section>
    </main>
  );
}
