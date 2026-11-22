import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  api,
  ApiError,
  ResponseContractError,
  orgPath,
  resetContext,
} from "../api/client";
import type { Membership, Session, SubscriptionData } from "../api/types";
import { sessionData, membershipData, subscriptionData } from "../api/adapters";
import { translate, type Locale } from "../i18n/messages";
import { resetCheckoutState } from "../lib/checkout";

export type Workspace = "fleet" | "driver" | "platform" | "technician";
interface Context {
  session: Session | null;
  memberships: Membership[];
  loading: boolean;
  error: unknown;
  organizationId: string;
  workspace: Workspace;
  revision: number;
  locale: Locale;
  subscription: SubscriptionData | null;
  subscriptionPending: boolean;
  t: (key: string) => string;
  can: (key: string) => boolean;
  feature: (key: "safety" | "cellular") => boolean;
  reload: () => Promise<void>;
  select: (workspace: Workspace, organizationId: string) => void;
  setLocale: (locale: Locale) => void;
  clear: () => void;
}
const LOCALE_STORAGE_KEY = "carlink.locale";
const SUPPORTED_LOCALES = new Set<Locale>(["en", "ms", "zh", "ta"]);

function readStoredLocale(): Locale | null {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return saved && SUPPORTED_LOCALES.has(saved as Locale)
      ? (saved as Locale)
      : null;
  } catch {
    return null;
  }
}

const AppContext = createContext<Context | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const cache = useQueryClient();
  const storedLocale = readStoredLocale();
  const [session, setSession] = useState<Session | null>(null),
    [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState<unknown>(null);
  const [organizationId, setOrganizationId] = useState(""),
    [workspace, setWorkspace] = useState<Workspace>("fleet");
  const [revision, setRevision] = useState(0),
    [locale, setLocaleState] = useState<Locale>(storedLocale ?? "en");
  const userSelectedLocaleRef = useRef<boolean>(storedLocale !== null);
  const setLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES.has(next)) return;
    userSelectedLocaleRef.current = true;
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors under strict browser privacy modes.
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [subscriptionFor, setSubscriptionFor] = useState("");
  const identity = useRef("");
  const reloadSequence = useRef(0);
  const clear = useCallback(() => {
    resetCheckoutState();
    reloadSequence.current++;
    identity.current = "";
    resetContext();
    cache.clear();
    setSession(null);
    setMemberships([]);
    setSubscription(null);
    setSubscriptionFor("");
    setOrganizationId("");
    setRevision((v) => v + 1);
    setLoading(false);
  }, [cache]);
  const reload = useCallback(async () => {
    const sequence = ++reloadSequence.current;
    setError(null);
    try {
      const [profile, orgs] = await Promise.all([
        api<Session>("/api/v1/me"),
        api<{ organizations: Membership[] }>("/api/v1/organizations"),
      ]);
      if (sequence !== reloadSequence.current) return;
      profile.data = sessionData(profile.data, profile.request_id, {
        path: "/api/v1/me",
        httpStatus: profile.status,
      });
      orgs.data.organizations = membershipData(orgs.data, orgs.request_id, {
        path: "/api/v1/organizations",
        httpStatus: orgs.status,
      });
      const fingerprint = JSON.stringify({
        user: profile.data.user.id,
        permissions: profile.data.permissions,
        platform: profile.data.platform,
        memberships: orgs.data.organizations.map((m) => [
          m.id,
          m.organization_id,
          m.status,
          m.role,
        ]),
      });
      if (identity.current && identity.current !== fingerprint) {
        resetContext();
        cache.clear();
        setSubscription(null);
        setRevision((v) => v + 1);
      }
      identity.current = fingerprint;
      setSession(profile.data);
      setMemberships(
        orgs.data.organizations.filter((m) => m.status === "active"),
      );
      if (!userSelectedLocaleRef.current) {
        setLocaleState(profile.data.user.locale || "en");
      }
      setOrganizationId((current) =>
        orgs.data.organizations.some(
          (m) => m.organization_id === current && m.status === "active",
        )
          ? current
          : orgs.data.organizations.find((m) => m.status === "active")
              ?.organization_id || "",
      );
      setWorkspace((current) => {
        if (current === "platform" && profile.data.platform?.role === "admin")
          return current;
        if (
          current === "technician" &&
          profile.data.platform?.role === "technician"
        )
          return current;
        if (!orgs.data.organizations.length && profile.data.platform)
          return profile.data.platform.role === "admin"
            ? "platform"
            : "technician";
        if (current === "platform" || current === "technician") return "fleet";
        const id = orgs.data.organizations[0]?.organization_id;
        const permissions = profile.data.permissions[id] || [];
        return permissions.includes("profile.own") &&
          !permissions.includes("vehicles.read")
          ? "driver"
          : current;
      });
    } catch (e) {
      if (sequence !== reloadSequence.current) return;
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (
        e instanceof ResponseContractError ||
        (e instanceof ApiError && [401, 403].includes(e.status))
      ) {
        clear();
        setError(e);
      } else setError(e);
    } finally {
      if (sequence === reloadSequence.current) setLoading(false);
    }
  }, [clear, cache]);
  useEffect(() => {
    void reload();
    window.addEventListener("carlink:session-expired", clear);
    return () => window.removeEventListener("carlink:session-expired", clear);
  }, [reload, clear]);
  useEffect(() => {
    if (!session) return;
    const onFocus = () => {
      if (!document.hidden) void reload();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [session, reload]);
  const select = useCallback(
    (next: Workspace, org: string) => {
      if (
        org &&
        !memberships.some(
          (m) => m.organization_id === org && m.status === "active",
        )
      )
        return;
      if (next === "platform" && session?.platform?.role !== "admin") return;
      if (next === "technician" && session?.platform?.role !== "technician")
        return;
      resetCheckoutState();
      resetContext();
      cache.clear();
      setSubscription(null);
      setWorkspace(next);
      setOrganizationId(org);
      setRevision((v) => v + 1);
    },
    [memberships, session, cache],
  );
  const scopeKey =
    session && organizationId
      ? `${session.user.id}:${organizationId}:${revision}`
      : "";
  const subscriptionPending =
    !!scopeKey &&
    !!session?.permissions[organizationId]?.includes("subscription.read") &&
    subscriptionFor !== scopeKey;
  useEffect(() => {
    setSubscription(null);
    if (
      !scopeKey ||
      !organizationId ||
      !session?.permissions[organizationId]?.includes("subscription.read")
    )
      return;
    const controller = new AbortController();
    api<SubscriptionData>(orgPath(organizationId, "/subscription"), {
      signal: controller.signal,
    })
      .then((r) => {
        if (!controller.signal.aborted)
          setSubscription(
            subscriptionData(r.data, r.request_id, {
              path: orgPath(organizationId, "/subscription"),
              httpStatus: r.status,
            }),
          );
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setSubscriptionFor(scopeKey);
      });
    return () => controller.abort();
  }, [scopeKey, organizationId, session]);
  return (
    <AppContext.Provider
      value={{
        session,
        memberships,
        loading,
        error,
        organizationId,
        workspace,
        revision,
        locale,
        subscription,
        subscriptionPending,
        t: (key) => translate(locale, key),
        can: (key) => !!session?.permissions[organizationId]?.includes(key),
        feature: (key) =>
          subscription?.subscription?.plan_snapshot
            ? [true, 1].includes(
                subscription.subscription.plan_snapshot[`${key}_enabled`] as
                  boolean | number,
              )
            : true,
        reload,
        select,
        setLocale,
        clear,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("Missing application context.");
  return value;
}
