type DescriptionActivity = {
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type TrailRoute = { title: string | null; description: string };
export type TrailSection = { title: string; routes: TrailRoute[] };

/** Display API markup as text only. Source records are never changed. */
export function sportsPlainText(value: string): string {
  const entities: Record<string, string> = {
    nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
    middot: "·", ndash: "–", mdash: "—", rarr: "→",
  };
  let text = value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<br\b[^>]*>|<\/(?:p|div|li|tr|h[1-6])\s*>/gi, "\n")
    .replace(/<\/?[a-z][a-z0-9:-]*(?:\s[^<>]*|\s*\/?)>/gi, "");
  // Decode after removing actual markup so literal <안내소> and inequalities survive.
  for (let pass = 0; pass < 2; pass += 1) {
    text = text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (original, entity: string) => {
      if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? original;
      const code = entity[1].toLowerCase() === "x"
        ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code) : original;
    });
  }
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\t \u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitTrailRoutes(text: string): TrailRoute[] {
  // Recognize only explicit source labels; do not infer distances or route names.
  const markers = [...text.matchAll(/(?:^|\s)((?:[A-Z]\s*코스|제?\d+\s*코스|코스\s*\d+)\s*(?:\([^\n)]*\))?\s*[:：])/g)];
  if (!markers.length) {
    return text.split(/\n+/).map((description) => ({ title: null, description: description.trim() })).filter((route) => route.description);
  }
  const routes: TrailRoute[] = [];
  const prefix = text.slice(0, markers[0].index).trim();
  if (prefix) routes.push({ title: null, description: prefix });
  markers.forEach((marker, index) => {
    const start = marker.index! + marker[0].length;
    const end = markers[index + 1]?.index ?? text.length;
    routes.push({
      title: marker[1].replace(/[:：]$/, "").trim(),
      description: text.slice(start, end).trim(),
    });
  });
  return routes;
}

export function sportsDescription(activity: DescriptionActivity): {
  introduction: string;
  trails: TrailSection[];
} {
  const summary = sportsPlainText(activity.summary ?? "");
  const rawRoutes = activity.metadata?.hiking_routes;
  const records = Array.isArray(rawRoutes) ? rawRoutes : [];
  const sourceSections: { title: string; text: string }[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    if (!record || typeof record !== "object" || typeof record.infotext !== "string") continue;
    const text = sportsPlainText(record.infotext);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    sourceSections.push({ title: typeof record.infoname === "string" ? sportsPlainText(record.infoname) || "등산로" : "등산로", text });
  }
  // Older API records may have the same original route information only in summary.
  if (!sourceSections.length && /^등산로(?:\s|$)/.test(summary)) {
    const text = summary.replace(/^등산로\s*/, "");
    if (text) sourceSections.push({ title: "등산로", text });
  }
  const compact = (text: string) => text.replace(/\s+/g, "").trim();
  const routesSummary = sourceSections.map((section) => `${section.title}\n${section.text}`).join("\n\n");
  const onlyRoutes = sourceSections.length > 0 && (
    compact(summary) === compact(routesSummary)
    || compact(summary) === compact(sourceSections.map((section) => section.text).join("\n\n"))
  );
  let introduction = onlyRoutes ? "" : summary;
  const escapedText = (text: string) => text.split(/\s+/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
  // Ingestion may append route text to a genuine introduction, or repeat a source
  // record. Remove exact titled route blocks only; keep unrelated visitor notes.
  for (const section of sourceSections) {
    introduction = introduction.replace(new RegExp(`${escapedText(section.title)}\\s+${escapedText(section.text)}`, "g"), "").trim();
  }
  return {
    introduction: introduction.replace(/\n{3,}/g, "\n\n"),
    trails: sourceSections.map((section) => ({ title: section.title, routes: splitTrailRoutes(section.text) })),
  };
}
