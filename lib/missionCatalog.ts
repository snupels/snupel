import type { CourseItineraryResponse, CourseResponse } from "@/lib/api/dto";

type CourseItineraryStop = CourseItineraryResponse["stops"][number];
const SPORT_CATEGORIES: Record<string, string> = {
  mountain: "산악스포츠", hiking: "산악스포츠", mtb: "산악스포츠", paragliding: "산악스포츠", zipline: "산악스포츠", zipwire: "산악스포츠", 산악스포츠: "산악스포츠", 등산: "산악스포츠", 산악: "산악스포츠", 패러글라이딩: "산악스포츠", 짚와이어: "산악스포츠", 짚라인: "산악스포츠",
  snow: "동계스포츠", ski: "동계스포츠", snowboarding: "동계스포츠", skating: "동계스포츠", ice: "동계스포츠", 동계스포츠: "동계스포츠", 스키: "동계스포츠", 스노보드: "동계스포츠", 스케이트: "동계스포츠", 빙상스포츠: "동계스포츠",
  water: "수상스포츠", marine: "수상스포츠", surfing: "수상스포츠", rafting: "수상스포츠", kayaking: "수상스포츠", canoe: "수상스포츠", sailing: "수상스포츠", 수상스포츠: "수상스포츠", 서핑: "수상스포츠", 래프팅: "수상스포츠", 카약: "수상스포츠", 카누: "수상스포츠", 해양레저: "수상스포츠",
  athletics: "육상스포츠", marathon: "육상스포츠", running: "육상스포츠", cycling: "육상스포츠", trekking: "육상스포츠", walking: "육상스포츠", 육상스포츠: "육상스포츠", 마라톤: "육상스포츠", 러닝: "육상스포츠", 달리기: "육상스포츠", 자전거: "육상스포츠", 트레킹: "육상스포츠", 걷기: "육상스포츠",
  olympic: "올림픽 레거시", olympic_legacy: "올림픽 레거시", 올림픽레거시: "올림픽 레거시", 올림픽: "올림픽 레거시",
};

export type MissionPresentation = {
  category: string;
  region: string;
  intro: string;
  scheduleLabel: string;
  schedule: string;
  reward: string;
  proof: string;
  photoPrompt: string;
  steps: string[];
  officialUrl: string | null;
  officialLabel: string | null;
  sportsActivityId?: number;
  sportsLinkLabel?: string;
};

export function missionPresentation(course: CourseResponse, stop?: CourseItineraryStop | null): MissionPresentation {
  // Legacy event missions have no course sport; their actual certification place does.
  const sport = course.sportName?.trim() || stop?.sportName?.trim();
  const category = (sport ? SPORT_CATEGORIES[sport.toLowerCase().replace(/\s+/g, "")] ?? sport : null)
    ?? ({ sports: "스포츠", event: "이벤트", festival: "축제", tour: "관광" }[course.category]);
  const region = stop?.address?.split(" ").find((part) => part.endsWith("시") || part.endsWith("군"))?.replace(/[시군]$/, "");
  return {
    category,
    region: region ?? stop?.placeName ?? "강원",
    intro: course.description ?? "현장에서 참여 사진을 촬영하고 미션 인증을 신청해 보세요.",
    scheduleLabel: "참여 기간",
    schedule: course.participationPeriod ?? "공식 안내에서 운영 일정을 확인해 주세요.",
    reward: course.rewardDescription ?? "스탬프 1개",
    proof: course.proofInstructions ?? "현장에서 촬영한 참여 사진 1장",
    photoPrompt: course.photoPrompt ?? "현장에서 촬영한 참여 사진을 선택해 주세요",
    steps: course.steps?.length ? course.steps : ["현장 방문 및 활동 참여", "인증 조건에 맞는 사진 촬영", "사진 제출 후 운영자 승인 확인"],
    officialUrl: course.officialUrl ?? null,
    officialLabel: course.officialLabel ?? null,
    sportsActivityId: stop?.activityId,
    sportsLinkLabel: stop ? "스포츠 탐색에서 장소 보기" : undefined,
  };
}
