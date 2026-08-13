import type { ActivityResponse } from "./api/dto";

type FacilityActivity = Pick<ActivityResponse, "placeName" | "metadata">;

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
