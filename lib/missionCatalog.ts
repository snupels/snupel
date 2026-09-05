import type { CourseItineraryResponse, CourseResponse } from "@/lib/api/dto";

type CourseItineraryStop = CourseItineraryResponse["stops"][number];

const PYEONGCHANG_MUSEUM_MISSION = "2018 평창동계올림픽대회 및 동계패럴림픽대회 기념관 방문 인증";

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
  officialUrl: string;
  officialLabel: string;
};

export function missionPresentation(
  course: Pick<CourseResponse, "title" | "description">,
  stop?: CourseItineraryStop | null,
): MissionPresentation {
  if (course.title === PYEONGCHANG_MUSEUM_MISSION) {
    return {
      category: "올림픽 레거시",
      region: "평창",
      intro: "평창 동계올림픽·동계패럴림픽의 역사와 유산을 만나고 기념관 포토존에서 방문 기록을 남겨 보세요.",
      scheduleLabel: "참여 기간",
      schedule: "상시 참여",
      reward: "평창 올림픽 레거시 스탬프 1개",
      proof: "기념관 포토존 앞에서 촬영한 사진 1장",
      photoPrompt: "기념관 포토존 앞에서 촬영한 사진을 선택해 주세요",
      steps: ["평창 동계올림픽·패럴림픽 기념관 방문", "기념관 포토존 앞에서 사진 촬영", "사진 등록 후 인증 제출"],
      officialUrl: "https://pom2018.org/",
      officialLabel: "기념관 공식 홈페이지",
    };
  }

  return {
    category: "육상스포츠",
    region: stop?.address?.includes("홍천") ? "홍천" : (stop?.placeName ?? "강원"),
    intro: course.description ?? "현장에서 참여 사진을 촬영하고 미션 인증을 신청해 보세요.",
    scheduleLabel: "행사 일시",
    schedule: "2026.10.04 09:00",
    reward: "홍천 마라톤 참가 스탬프 1개",
    proof: "대회 참여 사진 1장",
    photoPrompt: "현장에서 촬영한 참여 사진을 선택해 주세요",
    steps: ["홍천사랑마라톤 참여", "현장에서 참여 사진 촬영", "사진 등록 후 인증 제출"],
    officialUrl: "https://hongcheonrun.net/",
    officialLabel: "대회 공식 홈페이지",
  };
}
