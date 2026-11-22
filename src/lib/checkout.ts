import { checkoutUrl } from "../api/client";
import { object, text, type Row } from "../api/types";

let reserved: Window | null = null;
const authorizedSignups = new Set<string>();
const openedPayments = new Set<string>();
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
export function validSignup(data: Row): boolean {
  const s = object(data?.signup),
    inv = object(data?.invoice);
  return (
    isUuid(s.id) &&
    isUuid(s.organization_id) &&
    isUuid(inv.id) &&
    Number.isFinite(Date.parse(text(s.payment_due_at)))
  );
}
export function signupCheckoutEligible(data: Row): boolean {
  const s = object(data?.signup),
    inv = object(data?.invoice);
  return (
    validSignup(data) &&
    s.status === "pending" &&
    s.deadline_passed !== true &&
    Date.parse(text(s.payment_due_at)) > Date.now() &&
    !inv.payment_id
  );
}
export function resetCheckoutState() {
  closeReservedCheckout();
  authorizedSignups.clear();
  openedPayments.clear();
}

/** Reserve a window inside the confirmation/click gesture, before any async API calls. */
export function reserveCheckoutWindow(): boolean {
  closeReservedCheckout();
  try {
    reserved = window.open("about:blank", "_blank");
    if (!reserved) return false;
    reserved.opener = null;
    reserved.document.title = "CarLink · Preparing secure payment";
    reserved.document.body.textContent =
      "Preparing your secure payment page. Keep this window open.";
    return true;
  } catch {
    closeReservedCheckout();
    return false;
  }
}
export function closeReservedCheckout() {
  if (reserved && !reserved.closed) reserved.close();
  reserved = null;
}
export function authorizeSignupCheckout(id: string) {
  authorizedSignups.add(id);
}
export function beginSignupCheckout(id: string): boolean {
  return authorizedSignups.delete(id);
}
export function openCheckoutWindow(url: string, paymentId: string): boolean {
  const destination = checkoutUrl(url);
  if (openedPayments.has(paymentId)) return true;
  if (!reserved || reserved.closed) return false;
  try {
    reserved.location.replace(destination.href);
    openedPayments.add(paymentId);
    reserved = null;
    return true;
  } catch {
    closeReservedCheckout();
    return false;
  }
}
