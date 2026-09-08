const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_MISSION_PHOTO_BYTES = 10 * 1024 * 1024;

/** Keep client guidance aligned with the upload API; the server still validates uploads. */
export function missionPhotoError(photo: { type: string; size: number }): string | null {
  if (!ALLOWED_PHOTO_TYPES.has(photo.type)) return "JPG, PNG, WEBP 형식의 사진을 선택해 주세요.";
  if (photo.size === 0) return "내용이 없는 사진 파일입니다. 다른 사진을 선택해 주세요.";
  if (photo.size > MAX_MISSION_PHOTO_BYTES) return "사진은 10MB 이하로 올려 주세요.";
  return null;
}
