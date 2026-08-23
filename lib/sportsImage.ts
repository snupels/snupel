import type { StaticImageData } from "next/image";
import type { ActivityResponse } from "@/lib/api/dto";
import aiMountainImage from "@/imports/SportsAI/sports-ai-mountain.jpg";
import aiSnowImage from "@/imports/SportsAI/sports-ai-snow.jpg";
import aiWaterImage from "@/imports/SportsAI/sports-ai-water.jpg";
import aiRunningImage from "@/imports/SportsAI/sports-ai-running.jpg";
import aiOlympicLegacyImage from "@/imports/SportsAI/sports-ai-olympic-legacy.jpg";
import aiGolfImage from "@/imports/SportsAI/sports-ai-golf.jpg";
import aiCyclingImage from "@/imports/SportsAI/sports-ai-cycling.jpg";
import aiFishingImage from "@/imports/SportsAI/sports-ai-fishing.jpg";
import aiBowlingImage from "@/imports/SportsAI/sports-ai-bowling.jpg";
import aiSquashImage from "@/imports/SportsAI/sports-ai-squash.jpg";
import aiCommunityCenterImage from "@/imports/SportsAI/sports-ai-community-center.jpg";
import aiIndoorArenaImage from "@/imports/SportsAI/sports-ai-indoor-arena.jpg";
import aiFitnessCenterImage from "@/imports/SportsAI/sports-ai-fitness-center.jpg";
import aiAthleticsStadiumImage from "@/imports/SportsAI/sports-ai-athletics-stadium.jpg";
import aiRailBikeImage from "@/imports/SportsAI/sports-ai-rail-bike.jpg";

type SportImageActivity = Pick<ActivityResponse, "placeName" | "sportName" | "representativeImageUrl" | "metadata">;

function normalized(value: string | null | undefined) {
  return value?.replace(/\s+/g, "").toLocaleLowerCase("ko-KR") ?? "";
}

function facilityImage(placeName: string | null): StaticImageData | undefined {
  const place = normalized(placeName);
  if (place.includes("강릉볼링장")) return aiBowlingImage;
  if (place.includes("강릉스쿼시장")) return aiSquashImage;
  if (place.includes("강릉생활체육센터")) return aiCommunityCenterImage;
  if (place.includes("강릉실내체육관")) return aiIndoorArenaImage;
  if (place.includes("강릉국민체육센터")) return aiFitnessCenterImage;
  if (place.includes("강릉강북공설운동장")) return aiAthleticsStadiumImage;
  if (place.includes("레일바이크")) return aiRailBikeImage;
  return undefined;
}

function apiSportImage(activity: SportImageActivity) {
  const contentType = activity.metadata?.contenttypeid;
  const categories = Array.isArray(activity.metadata?.sport_categories)
    ? activity.metadata.sport_categories.map(String)
    : [];
  return (String(contentType ?? "") === "28" || categories.includes("olympic_legacy"))
    && activity.representativeImageUrl?.startsWith("https://tong.visitkorea.or.kr/")
    ? activity.representativeImageUrl
    : undefined;
}

function categoryFallback(activity: SportImageActivity, categories: string[]): StaticImageData {
  const sport = normalized(activity.sportName);
  if (categories.includes("올림픽레거시") || ["olympic", "legacy"].some((value) => sport.includes(value))) return aiOlympicLegacyImage;
  if (sport.includes("bowling") || sport.includes("볼링")) return aiBowlingImage;
  if (sport.includes("squash") || sport.includes("스쿼시")) return aiSquashImage;
  if (sport.includes("fishing") || sport.includes("낚시")) return aiFishingImage;
  if (sport.includes("golf") || sport.includes("골프")) return aiGolfImage;
  if (["cycling", "bicycle", "자전거"].some((value) => sport.includes(value))) return aiCyclingImage;
  if (["ski", "snow", "skating", "ice", "스키", "스노우", "빙상"].some((value) => sport.includes(value))) return aiSnowImage;
  if (["surf", "rafting", "kayak", "water", "sailing", "marine", "ocean", "yacht", "canoe", "wakeboard", "paddle", "sup", "snorkel", "scuba", "서핑", "래프팅", "카약", "수상", "해양"].some((value) => sport.includes(value))) return aiWaterImage;
  if (["hiking", "trekking", "trail", "mtb", "paragliding", "등산", "트레킹", "산악"].some((value) => sport.includes(value))) return aiMountainImage;
  return aiRunningImage;
}

export function sportsImage(activity: SportImageActivity, categories: string[] = []): StaticImageData | string {
  return facilityImage(activity.placeName)
    ?? apiSportImage(activity)
    ?? categoryFallback(activity, categories);
}

export function isExcludedSportPlace(placeName: string | null | undefined) {
  const place = normalized(placeName);
  return place === "알펜시아리조트대관령스키역사관"
    || place.includes("잼버리수련장");
}
