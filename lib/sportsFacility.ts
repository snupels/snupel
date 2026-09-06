import type { ActivityResponse } from "./api/dto";

type FacilityActivity = Pick<ActivityResponse, "placeName" | "metadata">;

const GENERAL_SPORTS_FACILITIES = new Set([
  "강릉국민체육센터",
  "강릉볼링장",
  "강릉생활체육센터",
  "강릉스쿼시장",
  "강릉실내체육관",
]);

export function isGeneralSportsFacility(placeName: string | null | undefined) {
  return GENERAL_SPORTS_FACILITIES.has(placeName?.replace(/\s+/g, "") ?? "");
}

export function sportsFacilityType(activity: FacilityActivity) {
  const metadata = activity.metadata;
  const categoryCode = String(metadata?.cat3 ?? "").trim();
  const registeredType = String(metadata?.type ?? "").trim();
  const title = activity.placeName ?? "";

  if (registeredType.includes("스키장")) return "스키장·리조트";
  if (registeredType.includes("골프장")) return "골프장";
  if (/(스키장|스키\s*리조트|오크밸리|용평|알펜시아|엘리시안|휘닉스|하이원|웰리힐리)/i.test(title)) return "스키장·리조트";
  if (categoryCode === "A03021200") return "장비·의류 대여점";
  if (/(렌탈|대여)/i.test(title)) return "장비 대여점";
  if (/(스쿨|학교|아카데미)/i.test(title)) return "스포츠 교육·체험 업체";

  return null;
}
