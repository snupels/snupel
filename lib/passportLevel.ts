export type PassportLevel = {
  level: number;
  name: "Beginner" | "Explorer" | "Challenger" | "Adventure Pro" | "Champion" | "Legend";
  criterion: string;
  meaning: string;
};

export const PASSPORT_LEVELS: PassportLevel[] = [
  { level: 1, name: "Beginner", criterion: "가입", meaning: "강원 스포츠 여정 시작" },
  { level: 2, name: "Explorer", criterion: "첫 미션 완료", meaning: "다양한 스포츠 탐색" },
  { level: 3, name: "Challenger", criterion: "스탬프 5개", meaning: "적극적인 도전 단계" },
  { level: 4, name: "Adventure Pro", criterion: "스탬프 7개", meaning: "고난도 스포츠·지역 미션 참여" },
  { level: 5, name: "Champion", criterion: "스탬프 15개", meaning: "강원 스포츠 대표 참가자" },
  { level: 6, name: "Legend", criterion: "스탬프 20개 이상", meaning: "최상위 완주자 및 명예 참가자" },
];

export function resolvePassportLevel(stampCount: number, completedFirstMission: boolean): PassportLevel {
  if (stampCount >= 20) return PASSPORT_LEVELS[5];
  if (stampCount >= 15) return PASSPORT_LEVELS[4];
  if (stampCount >= 7) return PASSPORT_LEVELS[3];
  if (stampCount >= 5) return PASSPORT_LEVELS[2];
  if (completedFirstMission) return PASSPORT_LEVELS[1];
  return PASSPORT_LEVELS[0];
}

export function passportLevelLabel(level: PassportLevel) {
  return `Level ${level.level} ${level.name}`;
}
