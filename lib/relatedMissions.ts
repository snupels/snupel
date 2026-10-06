import type { CourseResponse } from "@/lib/api/dto";
import { api } from "@/lib/api/service";

type LinkedMission = { activityId: number; course: CourseResponse };
const CACHE_MS = 60_000;
let cached: { items: LinkedMission[]; expiresAt: number } | undefined;
let pending: Promise<LinkedMission[]> | undefined;

async function loadMissionIndex(): Promise<LinkedMission[]> {
  const courses = new Map<number, CourseResponse>();
  for (let page = 1; ; page++) {
    const batch = await api.courses.list(page, 100);
    for (const course of batch) {
      if (course.isPublished && !course.isClosed && course.category === "event") {
        courses.set(course.id, course);
      }
    }
    if (batch.length < 100) break;
  }

  const items: LinkedMission[] = [];
  const activeCourses = [...courses.values()];
  // Bound concurrent requests; reuse the public API used by the mission page.
  for (let offset = 0; offset < activeCourses.length; offset += 6) {
    const group = await Promise.all(activeCourses.slice(offset, offset + 6).map(async (course) => {
      const itinerary = await api.courseItinerary(course.id);
      // MissionDetailPage submits photos for stops[0], not other itinerary places.
      const certificationPlace = itinerary.stops[0];
      return certificationPlace ? { activityId: certificationPlace.activityId, course } : null;
    }));
    for (const item of group) if (item) items.push(item);
  }
  return items;
}

export async function relatedMissions(activityId: number): Promise<CourseResponse[]> {
  if (!Number.isInteger(activityId) || activityId <= 0) return [];
  if (!cached || cached.expiresAt <= Date.now()) {
    if (!pending) {
      pending = loadMissionIndex().then((items) => {
        cached = { items, expiresAt: Date.now() + CACHE_MS };
        return items;
      }).finally(() => { pending = undefined; });
    }
    const items = await pending;
    return items.filter((item) => item.activityId === activityId).map((item) => item.course);
  }
  return cached.items.filter((item) => item.activityId === activityId).map((item) => item.course);
}
