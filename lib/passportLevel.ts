export type PassportLevel = {
  level: number;
  minStamps: number;
  name: "Beginner" | "Explorer" | "Challenger" | "Adventure Pro" | "Champion" | "Legend";
  criterion: string;
  meaning: string;
};

export const PASSPORT_LEVELS: PassportLevel[] = [
  { level: 1, minStamps: 0, name: "Beginner", criterion: "가입", meaning: "강원 스포츠 여정 시작" },
  { level: 2, minStamps: 1, name: "Explorer", criterion: "스탬프 1개", meaning: "다양한 스포츠 탐색" },
  { level: 3, minStamps: 5, name: "Challenger", criterion: "스탬프 5개", meaning: "적극적인 도전 단계" },
  { level: 4, minStamps: 10, name: "Adventure Pro", criterion: "스탬프 10개", meaning: "고난도 스포츠·지역 미션 참여" },
  { level: 5, minStamps: 20, name: "Champion", criterion: "스탬프 20개", meaning: "강원 스포츠 대표 참가자" },
  { level: 6, minStamps: 40, name: "Legend", criterion: "스탬프 40개 이상", meaning: "최상위 완주자 및 명예 참가자" },
];

export function resolvePassportLevel(stampCount: number): PassportLevel {
  return PASSPORT_LEVELS.reduce(
    (current, candidate) => stampCount >= candidate.minStamps ? candidate : current,
    PASSPORT_LEVELS[0],
  );
}

export function passportLevelLabel(level: PassportLevel) {
  return `Level ${level.level} ${level.name}`;
}
