import { isGeneralSportsFacility } from "./sportsFacility";

export function sportCategory(sportName: string | null, placeName?: string | null) {
  const sport = sportName?.toLowerCase() ?? "";
  const place = placeName?.replace(/\s+/g, "").toLowerCase() ?? "";
  if (isGeneralSportsFacility(placeName)) return "스포츠";
  const isWalkingRoute = ["둘레길", "탐방로", "산소길", "트레킹", "걷기길", "산책로"].some((value) => place.includes(value))
    || /(?:길|로)$/.test(place);
  if (["짚와이어", "짚라인", "zipwire", "zipline"].some((value) => place.includes(value))) return "산악스포츠";
  if (["mtb", "hiking", "등산", "산악"].some((value) => sport.includes(value))) return "산악스포츠";
  if (["ski", "snow", "skating", "ice"].some((value) => sport.includes(value))) return "동계스포츠";
  if (["surf", "rafting", "kayak", "water", "sailing", "marine", "ocean", "yacht", "canoe", "wakeboard", "paddle", "sup", "snorkel", "scuba"].some((value) => sport.includes(value))) return "수상스포츠";
  if (isWalkingRoute || ["trekking", "trail", "running", "marathon", "walking", "athletics", "트레킹", "트레일", "러닝", "마라톤", "워킹", "걷기"].some((value) => sport.includes(value))) return "육상스포츠";
  if (["paragliding"].some((value) => sport.includes(value))) return "산악스포츠";
  if (["olympic", "legacy"].some((value) => sport.includes(value))) return "올림픽레거시";
  return "스포츠";
}

export function sportCategories(
  sportName: string | null,
  metadata: Record<string, unknown> | null | undefined,
  placeName?: string | null,
) {
  const labels: Record<string, string> = {
    snow: "동계스포츠",
    olympic_legacy: "올림픽레거시",
  };
  const metadataCategories = Array.isArray(metadata?.sport_categories)
    ? metadata.sport_categories
      .map((value) => labels[String(value)] ?? "")
      .filter(Boolean)
    : [];
  return [...new Set(metadataCategories.length ? metadataCategories : [sportCategory(sportName, placeName)])];
}
