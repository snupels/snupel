type CoursePlace = { activityId: number; placeName: string | null };

export function courseItineraryDescription(stops: readonly CoursePlace[]) {
  if (!stops.length) return "추천 장소가 없습니다. 조건을 바꿔 다시 추천받아 주세요.";
  const names = stops.map((stop, index) => stop.placeName?.trim() || `${index + 1}번째 장소`);
  return `${names.join(" → ")} 순서로 방문하는 ${stops.length}개 장소의 추천 일정입니다.`;
}

/** Replace only references to known itinerary IDs, never arbitrary numbers or addresses. */
export function courseStopReason(reason: string, stops: readonly CoursePlace[]) {
  const names = new Map(stops.filter((stop) => Number.isSafeInteger(stop.activityId) && stop.activityId > 0 && stop.placeName?.trim())
    .map((stop) => [String(stop.activityId), stop.placeName!.trim()]));
  if (!names.size) return reason;
  const ids = [...names.keys()].join("|");
  const explicitId = new RegExp(`(^|[^A-Za-z0-9가-힣_])(?:activityId|activity_id|장소\\s*ID|활동\\s*ID|ID)\\s*[:=#]?\\s*(${ids})(?![0-9A-Za-z_])`, "gi");
  const movementId = new RegExp(`(^\\s*|[.!?;,]\\s+|\\n\\s*)(${ids})(?=에서\\s*(?:약\\s*)?[0-9]+(?:\\.[0-9]+)?\\s*(?:분|시간)\\s*(?:정도\\s*)?이동)`, "g");
  return reason.replace(explicitId, (_match, prefix: string, id: string) => prefix + names.get(id)!)
    .replace(movementId, (_match, prefix: string, id: string) => prefix + names.get(id)!);
}
