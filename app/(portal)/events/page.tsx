import { PortalPage } from "@/components/PortalPage";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ region?: string | string[] }> }) {
  const region = (await searchParams).region;
  return <PortalPage page="events" activeFilters={{ region: Array.isArray(region) ? region[0] : region ?? "" }} />;
}
