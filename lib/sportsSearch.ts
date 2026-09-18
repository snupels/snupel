import { sportsPlainText } from "./sportsDescription";
import { sportDisplayName } from "./sportsLabels";

export function sportsSearchText(activity: {
  placeName?: string | null; sigun?: string | null;
  summary?: string | null; sportName?: string | null; metadata?: Record<string, unknown> | null;
}): string {
  // Search visitor-facing route descriptions, not arbitrary IDs or internal metadata.
  const routes = activity.metadata?.hiking_routes;
  const routeText = Array.isArray(routes) ? routes.flatMap((route) => {
    if (!route || typeof route !== "object") return [];
    return [route.infoname, route.infotext].filter((text): text is string => typeof text === "string");
  }) : [];
  const text = sportsPlainText([activity.placeName, activity.summary, sportDisplayName(activity.sportName), ...routeText].filter(Boolean).join(" "));
  // Named Seoraksan trails may omit the parent mountain in their API title.
  // Limit the alias to its three municipalities and explicit landmark names.
  const seorakRegion = /속초|인제|양양/.test(activity.sigun ?? "");
  const seorakTrail = /흘림골|울산바위|대승령|대승폭포|오색약수|공룡능선|권금성|대청봉|토왕성폭포|토왕폭/.test(text);
  return seorakRegion && seorakTrail ? `${text} 설악산 설악산국립공원` : text;
}

export function matchesSportsKeyword(text: string, query?: string): boolean {
  const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
  return !query?.trim() || normalize(text).includes(normalize(query));
}
