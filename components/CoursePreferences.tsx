import { AppIcon, type AppIconName } from "./AppIcon";

const groups: Array<{
  title: string;
  description?: string;
  name: string;
  items: Array<{ label: string; caption?: string; value: string; icon: AppIconName }>;
}> = [
  {
    title: "어느 지역을 여행하고 싶나요?",
    name: "sigun",
    items: [
      "춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군",
      "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군",
    ].map((value) => ({ label: value, value, icon: "mapPin" as AppIconName })),
  },
  {
    title: "어떤 스포츠를 즐기고 싶나요?",
    description: "전체 선택 가능",
    name: "sport",
    items: [
      { label: "전체", value: "", icon: "medal" },
      { label: "트레킹", value: "trekking", icon: "mountain" },
      { label: "해양 레저", value: "marine", icon: "waves" },
      { label: "스키", value: "ski", icon: "snowflake" },
      { label: "자전거", value: "cycling", icon: "activity" },
      { label: "러닝", value: "running", icon: "person" },
      { label: "올림픽 레거시", value: "olympic_legacy", icon: "olympicRings" },
      { label: "골프", value: "golf", icon: "award" },
    ],
  },
  {
    title: "어떤 테마를 원하나요?",
    name: "theme",
    items: [
      { label: "힐링", value: "healing", icon: "heart" },
      { label: "스릴", value: "thrill", icon: "zap" },
      { label: "포토 스팟", value: "photo_spot", icon: "mountain" },
      { label: "스탬프", value: "stamp", icon: "award" },
    ],
  },
  {
    title: "얼마나 시간을 낼 수 있나요?",
    name: "availableMinutes",
    items: [
      { label: "3시간", caption: "가볍게", value: "180", icon: "timer" },
      { label: "6시간", caption: "반나절", value: "360", icon: "calendar" },
      { label: "12시간", caption: "하루", value: "720", icon: "map" },
      { label: "24시간", caption: "여유롭게", value: "1440", icon: "mountain" },
    ],
  },
];

export function CoursePreferences({ values = {} }: { values?: Record<string, string | string[] | undefined> }) {
  return (
    <section className="bg-[#f3f7f4] px-4 py-12 sm:px-6">
      <form action="/courses" className="mx-auto max-w-[1180px] overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-sm">
        <input type="hidden" name="recommend" value="1" />
        <input type="hidden" name="region" value="강원특별자치도" />
        <div className="flex items-center justify-between bg-[#008f45] px-6 py-5 text-white">
          <div className="flex items-center gap-2"><AppIcon name="activity" className="size-5" /><h2 className="font-bold">맞춤 코스 설정</h2></div>
          <span className="text-xs text-white/80">백엔드 추천 결과를 바로 확인해보세요</span>
        </div>
        <div className="space-y-8 p-6 sm:p-8">
          {groups.map((group) => (
            <fieldset key={group.name}>
              <legend className="flex items-center gap-2 text-sm font-bold"><AppIcon name={group.items[0].icon} className="size-4 text-[#00a94f]" />{group.title}{group.description && <span className="font-normal text-[#96a09a]">{group.description}</span>}</legend>
              <div className={`mt-4 grid gap-3 ${group.name === "sigun" ? "grid-cols-3 sm:grid-cols-6 lg:grid-cols-9" : "grid-cols-2 lg:grid-cols-4"}`}>
                {group.items.map((item, index) => {
                  const selected = values[group.name];
                  const defaultValue = group.name === "sigun" ? "강릉시" : group.name === "theme" ? "healing" : group.name === "availableMinutes" ? "360" : "";
                  const defaultChecked = Array.isArray(selected) ? selected.includes(item.value) : (selected ?? defaultValue) === item.value;
                  return (
                    <div key={`${group.name}-${item.value || "all"}`}>
                      <input className="peer sr-only" id={`${group.name}-${item.value || "all"}`} name={group.name} value={item.value} type="radio" defaultChecked={defaultChecked || (!selected && !defaultValue && index === 0)} />
                      <label htmlFor={`${group.name}-${item.value || "all"}`} className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#e0e7e2] px-3 py-3 text-center text-sm font-semibold text-[#445065] transition hover:border-[#8cc3a1] peer-checked:border-[#008f45] peer-checked:bg-[#e9f6ee] peer-checked:text-[#008f45] focus-within:ring-2 focus-within:ring-[#008f45] sm:min-h-20 sm:flex-col">
                        <AppIcon name={item.icon} className="size-5" />
                        <span>{item.label}{item.caption && <small className="mt-1 hidden font-normal text-[#8a9590] sm:block">{item.caption}</small>}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="flex justify-end"><button type="submit" className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#008f45] px-7 text-sm font-bold text-white transition hover:bg-[#00783a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45] focus-visible:ring-offset-2">맞춤 코스 추천받기<AppIcon name="arrowRight" /></button></div>
        </div>
      </form>
    </section>
  );
}
