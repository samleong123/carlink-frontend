import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  api,
  apiUrl,
  ApiError,
  ResponseContractError,
  checkoutUrl,
  csrfCookie,
  errorFields,
  fileUrl,
  privateFileLink,
  resetContext,
} from "../../src/api/client";
import { signedFileLink } from "../file-link-fixture";
const envelope = (data: unknown = {}) => ({
  status: 200,
  timestamp: "2026-11-18T00:00:00Z",
  ip_address: null,
  request_id: "test-request",
  title: "OK",
  desc: "",
  data,
});
const json = (data: unknown = {}, status = 200) =>
  new Response(JSON.stringify({ ...envelope(data), status }), {
    status,
    headers: {
      "content-type": "application/json",
      "X-Request-ID": "test-request",
    },
  });
beforeEach(() => {
  vi.stubGlobal("document", { cookie: "XSRF-TOKEN=encoded%2Btoken" });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
});
afterEach(() => {
  resetContext();
  vi.unstubAllGlobals();
});
describe("credentialed transport", () => {
  it("preserves null, false, zero and opaque cursors, omitting undefined", () => {
    const url = apiUrl("/api/v1/me", {
      zero: 0,
      off: false,
      nil: null,
      absent: undefined,
      cursor: "a+/=&b",
    });
    expect(url.origin).toBe("https://carlink-be.samsam123.name.my");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      zero: "0",
      off: "0",
      nil: "null",
      cursor: "a+/=&b",
    });
  });
  it.each([
    "https://evil.test/api/v1/me",
    "//evil.test/api/v1/me",
    "/api/v1/device/dtc-ai",
    "/api/v1/payment-gateway/callback/1/token",
    "/docs/openapi.json",
    "/api/v1/../../other",
  ])("rejects unsupported destination %s", (path) =>
    expect(() => apiUrl(path)).toThrow(),
  );
  it("validates direct S3 SigV4 links and provider origin", () => {
    expect(fileUrl(signedFileLink().url).protocol).toBe("https:");
    expect(() =>
      fileUrl("https://evil.test/api/v1/organizations/o/files/f/content"),
    ).toThrow();
    expect(() => checkoutUrl("javascript:alert(1)")).toThrow();
    expect(() => checkoutUrl("https://evil.test/checkout")).toThrow();
    expect(
      checkoutUrl("https://gateway.samsam123.name.my/pay/id").protocol,
    ).toBe("https:");
  });
  it("decodes the CSRF cookie and sends credentialed JSON without a manual Cookie or Origin", async () => {
    const fetcher = vi.fn().mockResolvedValue(json());
    vi.stubGlobal("fetch", fetcher);
    expect(csrfCookie()).toBe("encoded+token");
    await api("/api/v1/me", {
      method: "PATCH",
      body: {
        version: 1,
        enabled: false,
        count: 0,
        nil: null,
        omitted: undefined,
      },
    });
    const init = fetcher.mock.calls[0][1];
    expect(init).toMatchObject({
      credentials: "include",
      mode: "cors",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
    });
    expect(init.headers).toEqual({
      Accept: "application/json",
      "X-XSRF-TOKEN": "encoded+token",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(init.body)).toEqual({
      version: 1,
      enabled: false,
      count: 0,
      nil: null,
    });
  });
  it("initializes CSRF once for concurrent mutations", async () => {
    document.cookie = "";
    const fetcher = vi.fn(async (url: URL) => {
      if (url.pathname === "/sanctum/csrf-cookie")
        document.cookie = "XSRF-TOKEN=fresh";
      return json();
    });
    vi.stubGlobal("fetch", fetcher);
    await Promise.all([
      api("/api/v1/me", { method: "PATCH" }),
      api("/api/v1/auth/logout", { method: "POST" }),
    ]);
    expect(
      fetcher.mock.calls.filter(
        ([url]) => url.pathname === "/sanctum/csrf-cookie",
      ),
    ).toHaveLength(1);
  });
  it("maps Laravel validation containers", async () => {
    expect(errorFields({ errors: { name: ["Required"] } })).toEqual({
      name: ["Required"],
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(
          {
            error: {
              fields: { "settings.email_digest_hour": ["Too large"] },
            },
          },
          422,
        ),
      ),
    );
    await expect(api("/api/v1/me", { method: "PATCH" })).rejects.toMatchObject({
      status: 422,
      requestId: "test-request",
      fields: { "settings.email_digest_hour": ["Too large"] },
    });
  });
  it("does not retry an uncertain write or display HTML", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response("<html>secret error</html>", { status: 503 }),
      );
    vi.stubGlobal("fetch", fetcher);
    await expect(api("/api/v1/me", { method: "PATCH" })).rejects.toMatchObject({
      status: 503,
      uncertain: true,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("clears session on 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 401)));
    await expect(api("/api/v1/me")).rejects.toBeInstanceOf(ApiError);
    expect(window.dispatchEvent).toHaveBeenCalledOnce();
  });
  it.each([
    [
      "missing envelope fields",
      JSON.stringify({ data: {} }),
      "application/json",
    ],
    ["invalid JSON", "not JSON", "application/json"],
    ["an HTML success response", "<html>private contents</html>", "text/html"],
  ])(
    "preserves HTTP 200 and the request reference for %s",
    async (_name, body, type) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(body, {
            status: 200,
            headers: {
              "content-type": type,
              "X-Request-ID": "profile-response-reference",
            },
          }),
        ),
      );
      const error = await api("/api/v1/me").catch((failure) => failure);
      expect(error).toBeInstanceOf(ResponseContractError);
      expect(error).not.toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        httpStatus: 200,
        requestId: "profile-response-reference",
        path: "/api/v1/me",
        uncertain: false,
      });
      expect(error.message).not.toContain(body);
    },
  );
  it("keeps a genuine server HTTP 502 distinct from frontend response validation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 502)));
    const error = await api("/api/v1/me").catch((failure) => failure);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).not.toBeInstanceOf(ResponseContractError);
    expect(error).toMatchObject({
      status: 502,
      requestId: "test-request",
      path: "/api/v1/me",
      uncertain: false,
    });
  });
  it("retains the actual HTTP failure even if the error JSON is malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("not JSON", {
          status: 503,
          headers: {
            "content-type": "application/json",
            "X-Request-ID": "server-failure-reference",
          },
        }),
      ),
    );
    await expect(api("/api/v1/me")).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      requestId: "server-failure-reference",
      path: "/api/v1/me",
    });
  });
  it("keeps malformed successful writes uncertain without replaying them", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: {
          "content-type": "application/json",
          "X-Request-ID": "write-reference",
        },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await expect(
      api("/api/v1/me", { method: "PATCH", body: { version: 1 } }),
    ).rejects.toMatchObject({
      name: "ResponseContractError",
      httpStatus: 200,
      requestId: "write-reference",
      uncertain: true,
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it("aborts requests and ignores even uncooperative late responses after scope change", async () => {
    let complete!: (value: Response) => void;
    const fetcher = vi.fn(
      (_url: URL, init: RequestInit) =>
        new Promise<Response>((resolve) => {
          complete = resolve;
          expect(init.signal?.aborted).toBe(false);
        }),
    );
    vi.stubGlobal("fetch", fetcher);
    const pending = api("/api/v1/me");
    resetContext();
    complete(json({ private: "old tenant" }));
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(fetcher.mock.calls[0][1].signal?.aborted).toBe(true);
  });
  it("inspects JSON errors when issuing a link, without fetching S3 bytes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 403)));
    await expect(
      api("/api/v1/organizations/o/files/f/content"),
    ).rejects.toMatchObject({ status: 403, requestId: "test-request" });
  });
  it("validates link metadata without making any network request", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const link = signedFileLink();
    expect(privateFileLink(link)).toEqual({
      url: link.url,
      expiresAt: Date.parse(link.expires_at),
    });
    expect(fetcher).not.toHaveBeenCalled();
    for (const change of [
      { valid_for_seconds: 1800 },
      { requires_authenticated_session: true },
      { expires_at: "invalid" },
      { expires_at: new Date(0).toISOString() },
      { expires_at: new Date(Date.now() + 600000).toISOString() },
    ])
      expect(() => privateFileLink({ ...link, ...change })).toThrow();
  });
  it("rejects untrusted, insecure, malformed, expired and ambiguous signed links", () => {
    const link = signedFileLink().url;
    for (const invalid of [
      "/api/v1/organizations/o/files/f/content?signature=legacy",
      link.replace("https:", "http:"),
      link.replace(
        "private-test-bucket.s3.ap-southeast-1.amazonaws.com",
        "evil.test",
      ),
      link.replace("amazonaws.com", "amazonaws.com.evil.test"),
      link.replace("https://", "https://user:password@"),
      link + "#secret",
      link + "&X-Amz-Expires=300",
      link.replace("X-Amz-Algorithm=AWS4-HMAC-SHA256", "X-Amz-Algorithm=other"),
      link.replace("X-Amz-Expires=300", "X-Amz-Expires=301"),
      link.replace(/X-Amz-Date=[^&]+/, "X-Amz-Date=20260101T000000Z"),
      link.replace(/X-Amz-Date=[^&]+/, "X-Amz-Date=20261399T000000Z"),
      link.replace(
        "X-Amz-SignedHeaders=host",
        "X-Amz-SignedHeaders=host%3Bcookie",
      ),
      link.replace(/X-Amz-Signature=[^&]+/, "X-Amz-Signature=invalid"),
      link.replace("/private-assets/", "/public/"),
    ])
      expect(() => fileUrl(invalid)).toThrow();
  });
  it("accepts reviewed AWS path-style/global origins and temporary-token URLs without altering their query", () => {
    const link = signedFileLink().url;
    for (const host of [
      "https://s3.ap-southeast-1.amazonaws.com/bucket",
      "https://s3.amazonaws.com/bucket",
      "https://private-test-bucket.s3.amazonaws.com",
    ]) {
      const url =
        link.replace(
          "https://private-test-bucket.s3.ap-southeast-1.amazonaws.com",
          host,
        ) + "&X-Amz-Security-Token=fixture%2Btoken%2Fonly%3D";
      expect(fileUrl(url).href).toBe(url);
    }
    expect(() =>
      privateFileLink({
        ...signedFileLink(),
        expires_at: new Date(Date.now() + 30000).toISOString(),
      }),
    ).toThrow();
  });
  it("does not mark readOnlyAction POST 5xx errors as uncertain", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("bad gateway", { status: 502 }));
    vi.stubGlobal("fetch", fetcher);
    let err: unknown;
    try {
      await api("/api/v1/organizations/1/audit-ai", {
        method: "POST",
        body: { audit_ids: ["1"] },
        readOnlyAction: true,
      });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(502);
    expect((err as ApiError).uncertain).toBe(false);
  });
  it("extracts GEMINI_CAPACITY_ISSUE code and serverMessage from AI 502 errors and keeps path on status 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 502,
            timestamp: "2026-11-22T00:00:00Z",
            ip_address: null,
            request_id: "ai-req-1",
            title: "Request Failed",
            desc: "Please try again later due to Google Gemini capacity issue",
            data: { error: { code: "GEMINI_CAPACITY_ISSUE" } },
          }),
          {
            status: 502,
            headers: {
              "content-type": "application/json",
              "X-Request-ID": "ai-req-1",
            },
          },
        ),
      ),
    );
    await expect(
      api("/api/v1/organizations/1/dtc-ai", {
        method: "POST",
        body: { code: "P0730" },
        readOnlyAction: true,
      }),
    ).rejects.toMatchObject({
      status: 502,
      code: "GEMINI_CAPACITY_ISSUE",
      serverMessage:
        "Please try again later due to Google Gemini capacity issue",
      path: "/api/v1/organizations/1/dtc-ai",
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(
      api("/api/v1/organizations/1/dtc-ai", {
        method: "POST",
        body: { code: "P0730" },
        readOnlyAction: true,
      }),
    ).rejects.toMatchObject({
      status: 0,
      path: "/api/v1/organizations/1/dtc-ai",
      uncertain: false,
    });
  });
});
