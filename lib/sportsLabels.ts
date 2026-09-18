const sports: Record<string, string> = {
  hiking: "등산", trekking: "트레킹", walking: "걷기", trail: "트레일",
  running: "러닝", marathon: "마라톤", athletics: "육상", cycling: "자전거", mtb: "산악자전거",
  ski: "스키", snow: "동계 스포츠", skating: "스케이트", ice: "빙상",
  marine: "해양 레저", water: "수상 스포츠", surfing: "서핑", surf: "서핑",
  rafting: "래프팅", kayak: "카약", canoe: "카누", yacht: "요트", sailing: "세일링",
  sup: "패들보드", wakeboard: "웨이크보드", scuba: "스쿠버다이빙", snorkeling: "스노클링",
  golf: "골프", paragliding: "패러글라이딩", olympic_legacy: "올림픽 레거시",
};
const sources: Record<string, string> = {
  tourapi: "한국관광공사", durunubi: "한국관광공사 두루누비", mountain100: "산림청",
  gangwon_ski_golf: "강원특별자치도 스키장·골프장 현황",
  gangwon_marine: "강원특별자치도 해양레저 현황",
  gangwon_marine_facility: "강원도 해양레저관광시설 현황",
  gangwon_oxygen_road: "강원특별자치도 산소길 현황",
};
export function sportDisplayName(value?: string | null): string {
  return sports[value?.toLowerCase() ?? ""] ?? (value && /[가-힣]/.test(value) ? value : "스포츠");
}
export function sourceDisplayName(value?: string | null): string {
  return sources[value?.toLowerCase() ?? ""] ?? (value && /[가-힣]/.test(value) ? value : "제공기관 정보 미확인");
}
