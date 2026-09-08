import type { AuthUser } from "./api/dto";

/** Blank form values explicitly clear saved address data. */
export function readAccountAddress(form: FormData) {
  const text = (name: string) => String(form.get(name) ?? "").trim() || null;
  return { postalCode: text("postalCode"), address: text("address"), addressDetail: text("addressDetail") };
}

/** Private addresses stay in the authenticated account response, not browser storage. */
export function accountSessionUser(user: AuthUser) {
  const cached = { ...user };
  return Object.fromEntries(Object.entries(cached).filter(([key]) => !["postalCode", "address", "addressDetail"].includes(key)));
}
