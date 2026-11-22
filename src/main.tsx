import { StrictMode, Component, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App as AntApp, ConfigProvider, Result } from "antd";
import enUS from "antd/locale/en_US";
import msMY from "antd/locale/ms_MY";
import taIN from "antd/locale/ta_IN";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/ms";
import "dayjs/locale/ta";
import "dayjs/locale/zh-cn";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import IconContext from "@ant-design/icons/es/components/Context";
import "antd/dist/reset.css";
import "antd/dist/antd.css";
import "./styles/application.css";
import { AppProvider, useApp } from "./app/context";
import { AppRoot } from "./app/App";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <Result
        status="error"
        title="CarLink could not render this page"
        subTitle="Reload the page. No diagnostic payload or private data is recorded by this application."
      />
    ) : (
      this.props.children
    );
  }
}
function Ui() {
  const { locale } = useApp();
  useEffect(() => {
    const dayjsLocale = { en: "en", ms: "ms", zh: "zh-cn", ta: "ta" }[locale];
    dayjs.locale(dayjsLocale);
  }, [locale]);
  return (
    <ConfigProvider
      getPopupContainer={() => document.getElementById("overlays")!}
      locale={{ en: enUS, ms: msMY, zh: zhCN, ta: taIN }[locale]}
      theme={{
        zeroRuntime: true,
        hashed: false,
        cssVar: { key: "css-var-_R_0_" },
      }}
      wave={{ disabled: true }}
    >
      <IconContext.Provider value={{ zeroRuntime: true }}>
        <AntApp>
          <HashRouter>
            <ErrorBoundary>
              <AppRoot />
            </ErrorBoundary>
          </HashRouter>
        </AntApp>
      </IconContext.Provider>
    </ConfigProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Ui />
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>,
);
