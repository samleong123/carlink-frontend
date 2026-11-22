import { useState } from "react";
import { Alert, Button, Drawer } from "antd";
import { useApp } from "../app/context";
import { segment } from "../api/client";
import { text } from "../api/types";
import { bestExperienceText } from "./Landing";
import {
  Details,
  Directory,
  ErrorNotice,
  PageTitle,
  useTransientData,
} from "../components/shared";
function ArchiveDetail({ id }: { id: string }) {
  const app = useApp();
  const q = useTransientData(`/api/v1/platform/signup-archives/${segment(id)}`);
  return (
    <div className="stack">
      <Button loading={q.isFetching} onClick={() => void q.refetch()}>
        {app.t("signup_arch_refresh_evidence")}
      </Button>
      <ErrorNotice error={q.error} />
      {q.data && (
        <Details
          data={{
            snapshot: q.data.data.snapshot,
            payments: q.data.data.payments,
            archive_events: q.data.data.events,
          }}
        />
      )}
      <Alert type="warning" title={app.t("signup_arch_alert")} />
    </div>
  );
}
export function SignupArchives() {
  const app = useApp();
  const [id, setId] = useState("");
  return (
    <div className="stack">
      <PageTitle
        title={app.t("signup-archives")}
        subtitle={app.t("signup_arch_subtitle")}
      />
      <Directory
        path="/api/v1/platform/signup-archives"
        query={{ per_page: 50 }}
        fields={[
          "id",
          "organization_id",
          "payment_due_at",
          "deleted_at",
          "payments_requiring_reconciliation",
        ]}
        action={(row) => (
          <Button onClick={() => setId(text(row.id))}>
            {app.t("signup_arch_inspect_btn")}
          </Button>
        )}
      />
      {id && (
        <Drawer
          open
          title={app.t("signup_arch_drawer_title")}
          size={760}
          onClose={() => setId("")}
        >
          <ArchiveDetail id={id} />
        </Drawer>
      )}
      <footer
        style={{
          marginTop: 12,
          paddingTop: 14,
          borderTop: "1px solid #e8edf4",
          color: "#61748e",
          fontSize: 12,
          textAlign: "center",
        }}
      >
        {bestExperienceText(app.locale)}
      </footer>
    </div>
  );
}
