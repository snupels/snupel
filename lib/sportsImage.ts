import type { StaticImageData } from "next/image";
import type { ActivityResponse } from "@/lib/api/dto";
import gangneungOlympicMuseumImage from "@/imports/SportsAI/gangneung-olympic-museum.jpg";
import { verifiedSportsPhotos } from "@/lib/verifiedSportsPhotos";

type SportImageActivity = Pick<ActivityResponse, "placeName" | "sportName" | "representativeImageUrl" | "metadata">;

function normalized(value: string | null | undefined) {
  return value?.replace(/\s+/g, "").toLocaleLowerCase("ko-KR") ?? "";
}

// Real API images take priority. Museum content types can also contain real photos.
function apiSportImage(activity: SportImageActivity) {
  const url = activity.representativeImageUrl?.trim();
  return url?.startsWith("https://tong.visitkorea.or.kr/") ? url : undefined;
}

function verifiedPhoto(activity: SportImageActivity) {
  return verifiedSportsPhotos.find((photo) => normalized(photo.placeName) === normalized(activity.placeName));
}

export function sportsImage(activity: SportImageActivity, _categories: string[] = []): StaticImageData | string {
  // Retain the call signature for course/mission consumers; category photos are no longer used.
  void _categories;
  const apiImage = apiSportImage(activity);
  if (apiImage) return apiImage;
  const photo = verifiedPhoto(activity);
  if (photo) return `/sports-real/${photo.file}`;
  if (normalized(activity.placeName) === "강릉올림픽뮤지엄") return gangneungOlympicMuseumImage;
  return "/sports-real/photo-pending.svg";
}

export function sportsPhotoSource(activity: SportImageActivity) {
  if (apiSportImage(activity)) return null;
  const photo = verifiedPhoto(activity);
  return photo ? { label: photo.credit, url: photo.sourcePage } : null;
}

export function isExcludedSportActivity(
  activity: Pick<ActivityResponse, "placeName" | "source" | "externalId">,
) {
  const place = normalized(activity.placeName);
  const source = normalized(activity.source);
  const externalId = normalized(activity.externalId);
  return place === "알펜시아리조트대관령스키역사관"
    || place.includes("잼버리수련장")
    || source === "mountain100"
    || externalId.startsWith("stamp-catalog-");
}
