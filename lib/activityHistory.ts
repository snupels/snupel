import type { ActivityHistoryResponse, ActivityHistoryStatus } from "@/lib/api/dto";

export const ACTIVITY_HISTORY_STATUS: Record<ActivityHistoryStatus, { label: string; className: string; description: string }> = {
  pending: { label: "검토 중", className: "bg-[#fff5d9] text-[#9a7100]", description: "인증 신청이 접수되었습니다. 운영자가 제출한 사진을 확인하고 있습니다." },
  approved: { label: "승인 완료", className: "bg-[#e5f5eb] text-[#008f45]", description: "사진 인증이 승인되었습니다. 지급된 스탬프는 나의 패스포트에서 확인할 수 있습니다." },
  rejected: { label: "반려", className: "bg-[#fff0ed] text-[#b14b3d]", description: "인증 조건을 충족하지 못했습니다. 아래 반려 사유를 확인한 뒤 미션 안내에 맞는 사진으로 다시 신청해 주세요." },
  collected: { label: "스탬프 획득", className: "bg-[#e8eefb] text-[#345da7]", description: "획득한 스탬프는 나의 패스포트에서 확인할 수 있습니다." },
};

export const ACTIVITY_HISTORY_TYPE = { submission: "사진 인증", stamp: "스탬프 획득", saved: "관심 활동 저장" };

export function isMissionHistory(item: ActivityHistoryResponse) {
  return item.type === "submission" || item.type === "stamp";
}

export function activityHistoryDetailHref(historyId: number) {
  return "/activity-feed/detail/?historyId=" + encodeURIComponent(String(historyId));
}
