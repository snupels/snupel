import { PortalPage } from "@/components/PortalPage";

type CourseSearchParams = { category?: string | string[]; companion?: string | string[]; duration?: string | string[]; intensity?: string | string[]; theme?: string | string[] };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<CourseSearchParams> }) {
  const params = await searchParams;
  const category = params.category;
  return <PortalPage page="courses" activeFilters={{ category: Array.isArray(category) ? category[0] : category ?? "" }} preferenceValues={params} />;
}
