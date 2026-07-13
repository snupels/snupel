import { PageShell } from "@/components/PageShell";

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PageShell>{children}</PageShell>;
}
