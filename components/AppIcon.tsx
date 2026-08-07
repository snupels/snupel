import {
  Activity,
  ArrowRight,
  Award,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CloudSun,
  Dumbbell,
  Flame,
  Gift,
  Handshake,
  Heart,
  Instagram,
  Lock,
  Mail,
  Map,
  MapPin,
  Medal,
  Mountain,
  Newspaper,
  PersonStanding,
  Phone,
  Search,
  Smile,
  Snowflake,
  Trophy,
  Timer,
  Users,
  Waves,
  Zap,
  type LucideProps,
} from "lucide-react";

function OlympicRings({ className, ...props }: LucideProps) {
  return (
    <svg
      viewBox="0 0 32 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <circle cx="6" cy="7" r="4.5" />
      <circle cx="16" cy="7" r="4.5" />
      <circle cx="26" cy="7" r="4.5" />
      <circle cx="11" cy="13" r="4.5" />
      <circle cx="21" cy="13" r="4.5" />
    </svg>
  );
}

const icons = {
  activity: Activity,
  arrowRight: ArrowRight,
  award: Award,
  badgeCheck: BadgeCheck,
  bookmark: Bookmark,
  calendar: CalendarDays,
  checkCircle: CheckCircle2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clipboard: ClipboardList,
  cloudSun: CloudSun,
  dumbbell: Dumbbell,
  flame: Flame,
  gift: Gift,
  handshake: Handshake,
  heart: Heart,
  instagram: Instagram,
  lock: Lock,
  mail: Mail,
  map: Map,
  mapPin: MapPin,
  medal: Medal,
  mountain: Mountain,
  newspaper: Newspaper,
  olympicRings: OlympicRings,
  person: PersonStanding,
  phone: Phone,
  search: Search,
  smile: Smile,
  snowflake: Snowflake,
  trophy: Trophy,
  timer: Timer,
  users: Users,
  waves: Waves,
  zap: Zap,
} as const;

export type AppIconName = keyof typeof icons;

export function AppIcon({ name, className = "size-[1em]", ...props }: LucideProps & { name: AppIconName }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" focusable="false" className={`inline-block shrink-0 ${className}`} {...props} />;
}
