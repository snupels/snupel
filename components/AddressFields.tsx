import type { AuthUser } from "@/lib/api/dto";

type AddressValue = Partial<Pick<AuthUser, "postalCode" | "address" | "addressDetail">>;

export function AddressFields({ idPrefix, value, disabled = false }: {
  idPrefix: string;
  value?: AddressValue;
  disabled?: boolean;
}) {
  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#dce4df] bg-white px-4 text-sm outline-none focus:border-[#008f45] focus:ring-2 focus:ring-[#008f45]/15 disabled:bg-[#f4f6f5]";
  return (
    <fieldset disabled={disabled} aria-describedby={`${idPrefix}-address-help`} className="rounded-2xl border border-[#dce4df] bg-[#f8faf9] p-4">
      <legend className="px-1 text-sm font-bold">주소 <span className="font-normal text-[#68736d]">(선택)</span></legend>
      <div className="space-y-4">
        <div className="max-w-[180px]">
          <label htmlFor={`${idPrefix}-postal-code`} className="text-sm font-semibold">우편번호</label>
          <input id={`${idPrefix}-postal-code`} name="postalCode" type="text" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" maxLength={5} defaultValue={value?.postalCode ?? ""} placeholder="5자리 우편번호" className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-address`} className="text-sm font-semibold">기본주소</label>
          <input id={`${idPrefix}-address`} name="address" autoComplete="address-line1" maxLength={500} defaultValue={value?.address ?? ""} placeholder="도로명 또는 지번 주소" className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-address-detail`} className="text-sm font-semibold">상세주소</label>
          <input id={`${idPrefix}-address-detail`} name="addressDetail" autoComplete="address-line2" maxLength={200} defaultValue={value?.addressDetail ?? ""} placeholder="동·호수 등 상세주소" className={inputClass} />
        </div>
      </div>
      <p id={`${idPrefix}-address-help`} className="mt-3 text-xs leading-6 text-[#68736d]">주소는 선택 입력이며 내 계정에서만 확인할 수 있습니다. 공개 프로필·스포츠 피드에는 표시되지 않습니다. 마이페이지에서 수정하거나 비우고 저장하여 삭제할 수 있습니다.</p>
    </fieldset>
  );
}
