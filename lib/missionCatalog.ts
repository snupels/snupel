import type { CourseItineraryResponse, CourseResponse } from "@/lib/api/dto";

type CourseItineraryStop = CourseItineraryResponse["stops"][number];
const SPORT_CATEGORIES: Record<string, string> = { MOUNTAIN: "산악스포츠", SNOW: "동계스포츠", WATER: "수상스포츠", ATHLETICS: "육상스포츠", OLYMPIC: "올림픽 레거시" };

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
  const category = SPORT_CATEGORIES[course.sportName ?? ""] ?? course.sportName ?? ({ sports: "스포츠", event: "이벤트", festival: "축제", tour: "관광" }[course.category]);
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
