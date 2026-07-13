export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/sports", label: "스포츠 탐색" },
  { href: "/courses", label: "맞춤 코스" },
  { href: "/missions", label: "패스포트 미션" },
  { href: "/events", label: "이벤트·축제" },
  { href: "/mypage", label: "마이페이지" },
];
