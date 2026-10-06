import type { MetadataRoute } from "next";

const baseUrl = "https://sportspassport.kr";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/events", "/sports", "/courses", "/support", "/terms/service", "/terms/privacy"].map((path) => ({
    url: `${baseUrl}${path}/`,
  }));
}
