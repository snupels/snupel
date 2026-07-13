import { PortalPage } from "@/components/PortalPage";

export default async function SportsPage({ searchParams }: { searchParams: Promise<{ region?: string | string[]; sport?: string | string[] }> }) {
  const params = await searchParams;
  return <PortalPage page="sports" activeFilters={{ region: Array.isArray(params.region) ? params.region[0] : params.region ?? "", sport: Array.isArray(params.sport) ? params.sport[0] : params.sport ?? "" }} />;
}
