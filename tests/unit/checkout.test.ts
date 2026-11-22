import { afterEach, describe, expect, it, vi } from "vitest";
import {
  authorizeSignupCheckout,
  beginSignupCheckout,
  reserveCheckoutWindow,
  openCheckoutWindow,
  resetCheckoutState,
  signupCheckoutEligible,
} from "../../src/lib/checkout";
import { safeLocalDestination } from "../../src/app/navigation";
const id = "11111111-1111-4111-8111-111111111111";
afterEach(() => {
  resetCheckoutState();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("signup checkout safety", () => {
  it("allows confirmed signup returns without authorizing a query parameter alone", () => {
    const path = `/signup?signup=${id}&checkout=1`;
    expect(safeLocalDestination(path)).toBe(path);
    expect(beginSignupCheckout(id)).toBe(false);
    authorizeSignupCheckout(id);
    expect(beginSignupCheckout(id)).toBe(true);
    expect(beginSignupCheckout(id)).toBe(false);
    expect(safeLocalDestination(path + "&redirect=evil")).toBe("/");
  });
  it("fails closed on missing/malformed deadlines and existing payments", () => {
    const data = {
      signup: {
        id,
        organization_id: id,
        status: "pending",
        payment_due_at: new Date(Date.now() + 60000).toISOString(),
      },
      invoice: { id },
    };
    expect(signupCheckoutEligible(data)).toBe(true);
    for (const payment_due_at of [
      undefined,
      "bad",
      new Date(Date.now() - 1).toISOString(),
    ])
      expect(
        signupCheckoutEligible({
          ...data,
          signup: { ...data.signup, payment_due_at },
        }),
      ).toBe(false);
    expect(
      signupCheckoutEligible({ ...data, invoice: { id, payment_id: id } }),
    ).toBe(false);
    expect(
      signupCheckoutEligible({
        ...data,
        signup: { ...data.signup, status: "paid" },
      }),
    ).toBe(false);
  });
  it("detaches the reserved opener and navigates only once to an approved gateway", () => {
    const popup = {
      closed: false,
      opener: {} as unknown,
      document: { title: "", body: { textContent: "" } },
      location: { replace: vi.fn() },
      close: vi.fn(),
    };
    vi.stubGlobal("window", { open: vi.fn().mockReturnValue(popup) });
    expect(reserveCheckoutWindow()).toBe(true);
    expect(popup.opener).toBeNull();
    expect(() => openCheckoutWindow("https://evil.test/", id)).toThrow();
    expect(popup.location.replace).not.toHaveBeenCalled();
    expect(
      openCheckoutWindow(
        "https://gateway.samsam123.name.my/index.html?data=test",
        id,
      ),
    ).toBe(true);
    expect(
      openCheckoutWindow(
        "https://gateway.samsam123.name.my/index.html?data=test",
        id,
      ),
    ).toBe(true);
    expect(popup.location.replace).toHaveBeenCalledOnce();
  });
  it("does not create another window when the browser blocks the reserved one", () => {
    const open = vi.fn().mockReturnValue(null);
    vi.stubGlobal("window", { open });
    expect(reserveCheckoutWindow()).toBe(false);
    expect(
      openCheckoutWindow(
        "https://gateway.samsam123.name.my/index.html?data=test",
        id,
      ),
    ).toBe(false);
    expect(open).toHaveBeenCalledOnce();
  });
});
