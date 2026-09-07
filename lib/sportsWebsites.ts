import type { ActivityResponse } from "@/lib/api/dto";

// Confirmed against the operator's own site on 2026-09-07.
// Keep sourceUrl as public-data provenance; these are visitor website overrides only.
export const verifiedSportsWebsites = [
  { id: 3272, name: "오투리조트 골프(대중제 18홀)", url: "https://www.o2resort.com/GLF/ccGuide.jsp" },
  { id: 3273, name: "오투리조트 C.C", url: "https://www.o2resort.com/GLF/ccGuide.jsp" },
  { id: 3283, name: "오투리조트 스키", url: "https://www.o2resort.com/SKI/basicInfo.jsp" },
  { id: 3274, name: "강원랜드골프클럽", url: "https://www.high1.com/golf/index.do" },
  { id: 3275, name: "제이드팰리스솔프클럽", url: "https://www.jadepalacegc.com/kr/main.do" },
  { id: 3277, name: "오크밸리대중골프장", url: "https://oakvalley.co.kr/" },
  { id: 3280, name: "오크밸리골프장", url: "https://oakvalley.co.kr/" },
  { id: 3278, name: "휘닉스파크골프장(회원제)", url: "https://phoenixhnr.co.kr/static/pyeongchang/golf/phoenix-intro" },
  { id: 3279, name: "휘닉스파크대중골프장", url: "https://phoenixhnr.co.kr/static/pyeongchang/golf/taegisan-intro" },
  { id: 3284, name: "휘닉스파크스키장", url: "https://phoenixhnr.co.kr/static/pyeongchang/guide/price/snowpark" },
  { id: 3281, name: "파크밸리대중골프장", url: "https://www.parkvalley.co.kr/" },
  { id: 3282, name: "동서울레스피아대중골프장", url: "https://www.dongseoulcc.kr/" },
  { id: 3285, name: "용평스키장", url: "https://www.yongpyong.co.kr/kor/skiNboard/introduce.do" },
  { id: 3384, name: "삼척서핑스쿨 킹서프", url: "https://www.kingsurf.co.kr/" },
  { id: 3663, name: "킹서프", url: "https://www.kingsurf.co.kr/" },
  { id: 3620, name: "서프홀릭 강릉경포점", url: "https://www.surfholic.co.kr/" },
  { id: 3686, name: "서프홀릭강릉", url: "https://www.surfholic.co.kr/" },
  { id: 3676, name: "하슬라아트월드", url: "https://www.museumhaslla.com/" },
] as const;

export function verifiedSportWebsite(activity: Pick<ActivityResponse, "id" | "placeName" | "sourceUrl">): string | null {
  // Never replace a previously registered facility website or course resource.
  try {
    const hostname = new URL(activity.sourceUrl ?? "").hostname.toLowerCase();
    if (hostname !== "data.go.kr" && !hostname.endsWith(".data.go.kr")) return null;
  } catch {
    return null;
  }
  const normalize = (name: string) => name.replace(/\s+/g, "");
  return verifiedSportsWebsites.find((site) => site.id === activity.id
    && normalize(site.name) === normalize(activity.placeName ?? ""))?.url ?? null;
}
