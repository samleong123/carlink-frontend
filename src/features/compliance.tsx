import { useRef, useState } from "react";
import {
  App,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Radio,
  Tabs,
} from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/context";
import { api, ApiError, orgPath, segment } from "../api/client";
import { object, rows, text, type Row } from "../api/types";
import {
  Details,
  Directory,
  ErrorNotice,
  PageTitle,
  useData,
} from "../components/shared";
import {
  Action,
  EntitySelect,
  Workflow,
  choice,
  field,
  number,
  reason,
  version,
} from "../components/workflow";
import { Files } from "./files";

export function Compliance({
  vehicleId,
  poll,
}: {
  vehicleId?: string;
  poll?: number;
}) {
  const app = useApp(),
    navigate = useNavigate(),
    path = orgPath(app.organizationId),
    [createType, setCreateType] = useState(false),
    [editType, setEditType] = useState<Row | null>(null),
    [createObligation, setCreateObligation] = useState(false),
    [obligation, setObligation] = useState<string | null>(null),
    [record, setRecord] = useState<string | null>(null);
  return (
    <div className="stack">
      {!vehicleId && (
        <PageTitle
          title={app.t("compliance")}
          subtitle={app.t("comp_subtitle")}
        />
      )}
      <Tabs
        destroyOnHidden
        items={[
          {
            key: "status",
            label: app.t("comp_tab_status"),
            children: (
              <Directory
                path={`${path}/compliance/status`}
                poll={poll}
                rowFilter={
                  vehicleId ? (row) => row.vehicle_id === vehicleId : undefined
                }
                fields={[
                  "registration_number",
                  "compliance_type_name",
                  "status",
                  "expires_on",
                  "days_remaining",
                  "warning_days",
                ]}
                scope={app.t("comp_status_scope")}
                action={(row) => (
                  <>
                    {(!vehicleId || row.vehicle_id === vehicleId) && (
                      <Button
                        size="small"
                        onClick={() => setObligation(text(row.obligation_id))}
                      >
                        {app.t("comp_btn_obligation_renewal")}
                      </Button>
                    )}
                    {row.record_id &&
                      (!vehicleId || row.vehicle_id === vehicleId) && (
                        <Button
                          size="small"
                          onClick={() => setRecord(text(row.record_id))}
                        >
                          {app.t("comp_btn_evidence_history")}
                        </Button>
                      )}
                  </>
                )}
              />
            ),
          },
          ...(app.can("compliance.read")
            ? [
                {
                  key: "pending",
                  label: app.t("comp_tab_pending"),
                  children: (
                    <Directory
                      path={`${path}/compliance-records`}
                      poll={poll}
                      query={{
                        state: "pending",
                        vehicle_id: vehicleId,
                        per_page: 50,
                      }}
                      fields={[
                        "registration_number",
                        "compliance_type_name",
                        "valid_from",
                        "expires_on",
                        "evidence_reference",
                        "created_at",
                      ]}
                      action={(row) => (
                        <Button
                          size="small"
                          onClick={() => setRecord(text(row.id))}
                        >
                          {app.t("comp_btn_evidence_verify")}
                        </Button>
                      )}
                    />
                  ),
                },
              ]
            : []),
          {
            key: "obligations",
            label: app.t("comp_tab_obligations"),
            children: (
              <div className="stack">
                {app.can("compliance.write") && (
                  <Button onClick={() => setCreateObligation(true)}>
                    {app.t("comp_btn_create_obligation")}
                  </Button>
                )}
                <Directory
                  path={`${path}/compliance-obligations`}
                  poll={poll}
                  rowFilter={
                    vehicleId
                      ? (row) => row.vehicle_id === vehicleId
                      : undefined
                  }
                  fields={[
                    "compliance_type_name",
                    "registration_number",
                    "subject_type",
                    "subject_name",
                    "applicability",
                  ]}
                  action={(row) => (
                    <Button
                      size="small"
                      onClick={() => setObligation(text(row.id))}
                    >
                      {app.t("comp_btn_inspect_renew")}
                    </Button>
                  )}
                />
              </div>
            ),
          },
          ...(!vehicleId && app.can("maintenance.read")
            ? [
                {
                  key: "maintenance-due",
                  label: app.t("comp_tab_maintenance_due"),
                  children: (
                    <Directory
                      path={`${path}/maintenance/due-summary`}
                      poll={poll}
                      fields={[
                        "registration_number",
                        "make",
                        "model",
                        "name",
                        "service_type",
                        "status",
                        "remaining_km",
                        "remaining_days",
                        "due_date",
                        "baseline_quality",
                      ]}
                      action={(row) => (
                        <Button
                          size="small"
                          onClick={() =>
                            navigate(
                              `/organization/${app.organizationId}/vehicles/${row.vehicle_id}`,
                            )
                          }
                        >
                          {app.t("comp_btn_inspect_vehicle")}
                        </Button>
                      )}
                    />
                  ),
                },
              ]
            : []),
          {
            key: "types",
            label: app.t("comp_tab_types"),
            children: (
              <div className="stack">
                {app.can("compliance.write") && (
                  <Button onClick={() => setCreateType(true)}>
                    {app.t("comp_btn_create_type")}
                  </Button>
                )}
                <Directory
                  path={`${path}/compliance-types`}
                  poll={poll}
                  fields={[
                    "code",
                    "name",
                    "subject_type",
                    "warning_days",
                    "active",
                    "version",
                  ]}
                  action={(row) =>
                    app.can("compliance.write") && (
                      <Button
                        size="small"
                        onClick={() =>
                          setEditType({ ...row, active: !!row.active })
                        }
                      >
                        {app.t("comp_btn_edit_reminder")}
                      </Button>
                    )
                  }
                />
              </div>
            ),
          },
          {
            key: "known",
            label: app.t("comp_tab_known"),
            children: (
              <Card title={app.t("comp_known_card_title")}>
                <Input.Search
                  placeholder={app.t("comp_known_placeholder")}
                  enterButton={app.t("comp_btn_open_record")}
                  onSearch={(value) => {
                    if (/^[a-fA-F0-9-]{36}$/.test(value)) setRecord(value);
                  }}
                />
              </Card>
            ),
          },
        ]}
      />
      {createType && (
        <Workflow
          title={app.t("comp_btn_create_type")}
          path={`${path}/compliance-types`}
          fields={[
            field("code", { required: true, pattern: /^[A-Za-z0-9_-]{1,80}$/ }),
            field("name", { required: true, max: 160 }),
            choice(
              "subject_type",
              [
                { value: "vehicle", label: app.t("comp_subject_vehicle") },
                { value: "driver", label: app.t("comp_subject_driver") },
              ],
              { required: true },
            ),
            number("warning_days", 0, 3650, {
              default: 30,
              suffix: app.t("unit_days"),
            }),
          ]}
          onClose={() => setCreateType(false)}
        />
      )}
      {editType && (
        <Workflow
          title={app.t("comp_edit_reminder_title")}
          path={`${path}/compliance-types/${segment(text(editType.id))}`}
          method="PATCH"
          fields={[
            version,
            field("name", { max: 160 }),
            number("warning_days", 0, 3650, { suffix: app.t("unit_days") }),
            field("active", { kind: "switch" }),
          ]}
          initial={editType}
          onClose={() => setEditType(null)}
        />
      )}
      {createObligation && (
        <CreateObligationDrawer
          path={path}
          vehicleId={vehicleId}
          onClose={() => setCreateObligation(false)}
        />
      )}
      {obligation && (
        <ObligationDetail
          key={obligation}
          id={obligation}
          onClose={() => setObligation(null)}
          onRecord={(id) => {
            setObligation(null);
            setRecord(id);
          }}
        />
      )}
      {record && (
        <ComplianceRecord
          key={record}
          id={record}
          onClose={() => setRecord(null)}
        />
      )}
    </div>
  );
}
function ObligationDetail({
  id,
  onClose,
  onRecord,
}: {
  id: string;
  onClose: () => void;
  onRecord: (id: string) => void;
}) {
  const app = useApp(),
    path = orgPath(
      app.organizationId,
      `/compliance-obligations/${segment(id)}`,
    ),
    q = useData(path),
    [renew, setRenew] = useState(false);
  return (
    <Drawer
      open
      title={app.t("comp_obligation_drawer_title")}
      size={650}
      onClose={onClose}
    >
      <div className="stack">
        <ErrorNotice error={q.error} />
        <Details data={q.data?.data} />
        {app.can("compliance.write") && (
          <Button type="primary" onClick={() => setRenew(true)}>
            {app.t("comp_btn_record_renewal")}
          </Button>
        )}
        {renew && (
          <Workflow
            title={app.t("comp_record_renewal_title")}
            path={`${path}/renewals`}
            fields={[
              field("reference_number", { max: 160 }),
              field("issuing_authority", { max: 160 }),
              field("issued_on", { kind: "date" }),
              field("valid_from", { kind: "date", required: true }),
              field("expires_on", { kind: "date", required: true }),
              field("evidence_reference", {
                required: true,
                max: 255,
                help: app.t("comp_evidence_ref_help"),
              }),
            ]}
            idempotent
            description={app.t("comp_renewal_desc")}
            onDone={(data) => onRecord(text(data.id))}
            onClose={() => setRenew(false)}
          />
        )}
      </div>
    </Drawer>
  );
}
function ComplianceRecord({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const app = useApp(),
    path = orgPath(app.organizationId, `/compliance-records/${segment(id)}`),
    q = useData(`${path}/history`),
    [suspend, setSuspend] = useState(false);
  const current = rows(q.data?.data.records).find((row) => row.id === id);
  return (
    <Drawer
      open
      title={app.t("comp_record_drawer_title")}
      size={760}
      onClose={onClose}
    >
      <div className="stack">
        <p className="reference">
          {app.t("comp_current_record_ref").replace("{id}", id)}
        </p>
        <ErrorNotice error={q.error} />
        <Details data={q.data?.data} />
        <Files
          targetType="compliance_record"
          targetId={id}
          write={app.can("compliance.write")}
        />
        {app.can("compliance.verify") && current?.state === "pending" && (
          <Action
            label={app.t("comp_btn_verify_evidence")}
            path={`${path}/verify`}
            description={app.t("comp_verify_desc")}
          />
        )}
        {app.can("compliance.write") &&
          current?.state === "verified" &&
          !current.suspended_at && (
            <Button danger onClick={() => setSuspend(true)}>
              {app.t("comp_btn_suspend_record")}
            </Button>
          )}
        {suspend && (
          <Workflow
            title={app.t("comp_suspend_title")}
            path={`${path}/suspend`}
            fields={[reason]}
            onClose={() => setSuspend(false)}
          />
        )}
      </div>
    </Drawer>
  );
}
function CreateObligationDrawer({
  path,
  vehicleId,
  onClose,
}: {
  path: string;
  vehicleId?: string;
  onClose: () => void;
}) {
  const { modal } = App.useApp(),
    app = useApp(),
    cache = useQueryClient(),
    [form] = Form.useForm(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const submitting = useRef(false);
  const subjectType =
    (Form.useWatch("subject_type", form) as "vehicle" | "driver" | undefined) ??
    (vehicleId ? "vehicle" : undefined);
  const submit = async (values: {
    compliance_type_id: string;
    subject_type: "vehicle" | "driver";
    subject_id: string;
  }) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    const confirmed = await new Promise<boolean>((resolve) =>
      modal.confirm({
        title: app.t("comp_create_obligation_title"),
        content: app.t("common_confirm_submit_content"),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
        okText: app.t("confirm"),
        cancelText: app.t("cancel"),
      }),
    );
    if (!confirmed) {
      submitting.current = false;
      setBusy(false);
      return;
    }
    setError(null);
    try {
      await api(`${path}/compliance-obligations`, {
        method: "POST",
        body: values,
      });
      await cache.invalidateQueries({
        predicate: (query) =>
          query.queryKey.some(
            (part) => typeof part === "string" && part.startsWith(path),
          ),
      });
      onClose();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e);
      if (e instanceof ApiError)
        form.setFields(
          Object.entries(e.fields).map(([name, errors]) => ({
            name: name.split("."),
            errors,
          })),
        );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <Drawer
      open
      title={app.t("comp_create_obligation_title")}
      size={520}
      onClose={busy ? undefined : onClose}
      destroyOnHidden
      footer={
        <Button onClick={onClose} disabled={busy}>
          {app.t("cancel")}
        </Button>
      }
    >
      <div className="stack">
        <ErrorNotice error={error} />
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            subject_type: vehicleId ? "vehicle" : undefined,
            subject_id: vehicleId,
          }}
          onValuesChange={(changed) => {
            if ("subject_type" in changed)
              form.setFieldValue("subject_id", undefined);
          }}
          onFinish={(values) => void submit(values)}
        >
          <Form.Item
            name="compliance_type_id"
            label={app.t("compliance_type_name")}
            rules={[{ required: true, message: app.t("field_required") }]}
          >
            <EntitySelect path={`${path}/compliance-types`} labelKey="name" />
          </Form.Item>
          <Form.Item
            name="subject_type"
            label={app.t("comp_subject_type")}
            rules={[{ required: true, message: app.t("field_required") }]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={[
                { value: "vehicle", label: app.t("comp_subject_vehicle") },
                { value: "driver", label: app.t("comp_subject_driver") },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="subject_id"
            label={app.t("subject_name")}
            tooltip={app.t("comp_subject_tooltip")}
            rules={[{ required: true, message: app.t("field_required") }]}
          >
            <EntitySelect
              key={subjectType}
              path={`${path}/${subjectType === "driver" ? "drivers" : "vehicles"}`}
              labelKey={
                subjectType === "driver" ? "name" : "registration_number"
              }
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={busy}>
            {app.t("save")}
          </Button>
        </Form>
      </div>
    </Drawer>
  );
}
