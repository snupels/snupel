import { AppIcon, type AppIconName } from "./AppIcon";

const groups: Array<{
  title: string;
  description?: string;
  name: string;
  multiple?: boolean;
  items: Array<{ label: string; caption?: string; value: string; icon: AppIconName }>;
}> = [
  {
    title: "누구와 떠나나요?",
    name: "companion",
    items: [
      { label: "혼자", caption: "나만의 도전", value: "solo", icon: "person" },
      { label: "커플", caption: "둘이서 특별하게", value: "couple", icon: "heart" },
      { label: "가족", caption: "아이와 함께", value: "family", icon: "users" },
      { label: "친구들", caption: "함께라서 더 재밌는", value: "friends", icon: "handshake" },
    ],
  },
  {
    title: "얼마나 즐기실 건가요?",
    name: "duration",
    items: [
      { label: "반나절", caption: "~3시간", value: "half-day", icon: "timer" },
      { label: "하루", caption: "6~8시간", value: "day", icon: "calendar" },
      { label: "1박 2일", caption: "여유롭게", value: "one-night", icon: "map" },
      { label: "2박 3일", caption: "완전 탐험", value: "two-nights", icon: "mountain" },
    ],
  },
  {
    title: "어느 정도 강도로?",
    name: "intensity",
    items: [
      { label: "가볍게", value: "light", icon: "smile" },
      { label: "적당히", value: "moderate", icon: "activity" },
      { label: "도전적으로", value: "challenge", icon: "flame" },
      { label: "극한으로", value: "extreme", icon: "zap" },
    ],
  },
  {
    title: "어떤 테마를 원하세요?",
    description: "복수 선택 가능",
    name: "theme",
    multiple: true,
    items: [
      { label: "힐링", value: "healing", icon: "heart" },
      { label: "스릴", value: "thrill", icon: "zap" },
      { label: "사진 명소", value: "photo", icon: "mountain" },
      { label: "맛집 포함", value: "food", icon: "clipboard" },
      { label: "스탬프", value: "stamp", icon: "award" },
      { label: "교통 편리", value: "transport", icon: "mapPin" },
    ],
  },
];

export function CoursePreferences({ values = {} }: { values?: Record<string, string | string[] | undefined> }) {
  return (
    <section className="bg-[#f3f7f4] px-4 py-12 sm:px-6">
      <form action="/courses" className="mx-auto max-w-[1180px] overflow-hidden rounded-[28px] border border-[#dce6df] bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[#008f45] px-6 py-5 text-white">
          <div className="flex items-center gap-2"><AppIcon name="activity" className="size-5" /><h2 className="font-bold">코스 취향 설정</h2></div>
          <span className="text-xs text-white/80">나에게 맞는 코스를 찾아보세요</span>
        </div>
        <div className="space-y-8 p-6 sm:p-8">
          {groups.map((group) => (
            <fieldset key={group.name}>
              <legend className="flex items-center gap-2 text-sm font-bold"><AppIcon name={group.items[0].icon} className="size-4 text-[#00a94f]" />{group.title}{group.description && <span className="font-normal text-[#96a09a]">{group.description}</span>}</legend>
              <div className={`mt-4 grid gap-3 ${group.multiple ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 lg:grid-cols-4"}`}>
                {group.items.map((item, index) => {
                  const selected = values[group.name];
                  const defaultChecked = Array.isArray(selected) ? selected.includes(item.value) : selected ? selected === item.value : index === 0 && !group.multiple;
                  return (
                  <div key={item.value}>
                    <input className="peer sr-only" id={`${group.name}-${item.value}`} name={group.name} value={item.value} type={group.multiple ? "checkbox" : "radio"} defaultChecked={defaultChecked} />
                    <label htmlFor={`${group.name}-${item.value}`} className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#e0e7e2] px-3 py-3 text-center text-sm font-semibold text-[#445065] transition hover:border-[#8cc3a1] peer-checked:border-[#008f45] peer-checked:bg-[#e9f6ee] peer-checked:text-[#008f45] focus-within:ring-2 focus-within:ring-[#008f45] sm:min-h-20 sm:flex-col">
                      <AppIcon name={item.icon} className="size-5" />
                      <span>{item.label}{item.caption && <small className="mt-1 hidden font-normal text-[#8a9590] sm:block">{item.caption}</small>}</span>
                    </label>
                  </div>
                )})}
              </div>
            </fieldset>
          ))}
          <div className="flex justify-end"><button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#008f45] px-7 text-sm font-bold text-white transition hover:bg-[#00783a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008f45] focus-visible:ring-offset-2">맞춤 코스 찾기<AppIcon name="arrowRight" /></button></div>
        </div>
      </form>
    </section>
  );
}
