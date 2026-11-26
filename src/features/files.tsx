import { useEffect, useRef, useState } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Image,
  Select,
  Space,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  api,
  ApiError,
  ResponseContractError,
  isUncertainError,
  privateFileLink,
  orgPath,
  segment,
} from "../api/client";
import { object, text, type Row } from "../api/types";
import { useApp } from "../app/context";
import { Directory, ErrorNotice } from "../components/shared";
import { Action } from "../components/workflow";

export function validateFile(
  file: File,
  photo = false,
  t?: (key: string) => string,
) {
  if (
    !(
      photo
        ? ["image/png", "image/jpeg"]
        : ["image/png", "image/jpeg", "application/pdf"]
    ).includes(file.type)
  )
    throw new Error(
      t
        ? t("files_err_type")
        : "Select a JPEG, PNG or PDF file. Photos must be JPEG or PNG.",
    );
  const mb = photo ? 2 : 10;
  if (file.size === 0 || file.size > mb * 1024 * 1024)
    throw new Error(
      t
        ? t("files_err_size").replace("{mb}", String(mb))
        : `Maximum decoded file size is ${mb} MiB.`,
    );
}
export async function base64File(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
export async function validatePhoto(file: File, t?: (key: string) => string) {
  validateFile(file, true, t);
  const image = await createImageBitmap(file);
  try {
    if (
      !image.width ||
      !image.height ||
      image.width > 4096 ||
      image.height > 4096 ||
      image.width * image.height > 8388608
    )
      throw new Error(
        t
          ? t("files_err_photo_dims")
          : "Photos must be at most 4096 px per dimension and 8,388,608 pixels.",
      );
  } finally {
    image.close();
  }
}
export function Files({
  targetType,
  targetId,
  version,
  write = false,
  photoWrapper = false,
}: {
  targetType: string;
  targetId: string;
  version?: number;
  write?: boolean;
  photoWrapper?: boolean;
}) {
  const app = useApp(),
    { modal } = App.useApp(),
    cache = useQueryClient(),
    path = orgPath(app.organizationId, "/files");
  const [file, setFile] = useState<File | null>(null),
    [purpose, setPurpose] = useState(
      photoWrapper
        ? "photo"
        : targetType === "incident"
          ? "incident_evidence"
          : "document",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [notice, setNotice] = useState(""),
    [preview, setPreview] = useState<ReturnType<typeof privateFileLink> | null>(
      null,
    ),
    [downloadLink, setDownloadLink] = useState<ReturnType<
      typeof privateFileLink
    > | null>(null);
  const submitting = useRef(false),
    linkScope = useRef(0);
  const [uploadUncertain, setUploadUncertain] = useState(false);
  useEffect(() => {
    linkScope.current++;
    setPreview(null);
    setDownloadLink(null);
    setFile(null);
    return () => {
      linkScope.current++;
    };
  }, [app.organizationId, targetType, targetId]);
  useEffect(() => {
    if (!preview && !downloadLink) return;
    const expiry = Math.min(
      preview?.expiresAt ?? Infinity,
      downloadLink?.expiresAt ?? Infinity,
    );
    const timer = window.setTimeout(
      () => {
        if (preview && preview.expiresAt <= Date.now()) setPreview(null);
        if (downloadLink && downloadLink.expiresAt <= Date.now())
          setDownloadLink(null);
      },
      Math.max(0, expiry - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [preview, downloadLink]);
  const purposes =
    targetType === "compliance_record"
      ? ["document", "road_tax", "insurance"]
      : targetType === "mileage"
        ? ["mileage_evidence", "document"]
        : targetType === "maintenance_order"
          ? ["maintenance_evidence", "document"]
          : targetType === "incident"
            ? ["incident_evidence", "photo", "document"]
            : ["organization", "driver"].includes(targetType)
              ? ["document", "photo"]
              : ["document"];
  const upload = async () => {
    if (!file || submitting.current || uploadUncertain) return;
    submitting.current = true;
    setBusy(true);
    const yes = await new Promise<boolean>((resolve) =>
      modal.confirm({
        title: app.t("files_upload_confirm_title"),
        content: app.t("files_upload_confirm_content"),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      }),
    );
    if (!yes) {
      submitting.current = false;
      setBusy(false);
      return;
    }
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      validateFile(file, purpose === "photo", app.t);
      if (purpose === "photo") await validatePhoto(file, app.t);
      const content_base64 = await base64File(file);
      await api(
        path === ""
          ? ""
          : photoWrapper
            ? orgPath(app.organizationId, `/drivers/${segment(targetId)}/photo`)
            : path,
        {
          method: "POST",
          sensitive: true,
          body: photoWrapper
            ? { version, content_base64 }
            : {
                target_type: targetType,
                target_id: targetId,
                purpose,
                filename: file.name,
                ...(purpose === "photo" && targetType === "driver"
                  ? { version }
                  : {}),
                content_base64,
              },
        },
      );
      setFile(null);
      setNotice(app.t("files_saved_notice"));
      await cache.invalidateQueries();
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (isUncertainError(e)) setUploadUncertain(true);
      const apiFailure =
        e instanceof ApiError || e instanceof ResponseContractError;
      setError(e instanceof Error && !apiFailure ? null : e);
      if (e instanceof Error && !apiFailure) setNotice(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const issue = async (row: Row, mode: "view" | "download") => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    const scope = linkScope.current;
    try {
      const response = await api<Row>(`${path}/${segment(text(row.id))}/link`, {
        method: "POST",
        body: { mode },
        sensitive: true,
      });
      if (scope !== linkScope.current) return;
      const link = privateFileLink(response.data.link);
      if (mode === "view" && row.mime_type !== "application/pdf")
        setPreview(link);
      else setDownloadLink(link);
    } catch (e) {
      setError(e);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <Card
      title={
        photoWrapper
          ? app.t("files_card_photo")
          : app.t("files_card_attachments")
      }
    >
      <div className="stack">
        <ErrorNotice error={error} />
        {uploadUncertain && (
          <Alert type="warning" title={app.t("files_upload_uncertain_alert")} />
        )}
        {notice && <Alert type="info" title={notice} />}
        {downloadLink && (
          <Space orientation="vertical">
            <a
              href={downloadLink.url}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
            >
              {app.t("files_open_s3_download")}
            </a>
            <Button onClick={() => setDownloadLink(null)}>
              {app.t("files_clear_download_link")}
            </Button>
          </Space>
        )}
        {write && (
          <Form layout="vertical">
            <Form.Item label={app.t("files_label_purpose")}>
              <Select
                value={purpose}
                onChange={setPurpose}
                options={(photoWrapper ? ["photo"] : purposes).map((value) => ({
                  value,
                  label: app.t(`files_purpose_${value}`),
                }))}
              />
            </Form.Item>
            <Form.Item label={app.t("files_label_file")}>
              <Upload
                accept={
                  purpose === "photo"
                    ? "image/png,image/jpeg"
                    : "image/png,image/jpeg,application/pdf"
                }
                maxCount={1}
                fileList={
                  file
                    ? [{ uid: "selected", name: file.name, status: "done" }]
                    : []
                }
                beforeUpload={(f) => {
                  try {
                    validateFile(f, purpose === "photo", app.t);
                    setFile(f);
                    setNotice("");
                  } catch (e) {
                    setNotice((e as Error).message);
                  }
                  return false;
                }}
                onRemove={() => setFile(null)}
              >
                <Button icon={<UploadOutlined />}>
                  {app.t("files_choose_file")}
                </Button>
              </Upload>
            </Form.Item>
            <Button
              type="primary"
              disabled={!file || uploadUncertain}
              loading={busy}
              onClick={() => void upload()}
            >
              {app.t("files_upload_securely")}
            </Button>
          </Form>
        )}
        <Directory
          path={path}
          query={{ target_type: targetType, target_id: targetId, per_page: 50 }}
          fields={[
            "filename",
            "purpose",
            "mime_type",
            "size_bytes",
            "created_at",
            "version",
          ]}
          action={(row) => (
            <>
              <Button
                size="small"
                disabled={busy}
                onClick={() => void issue(row, "download")}
              >
                {app.t("files_btn_download")}
              </Button>
              {row.mime_type !== "application/pdf" && (
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => void issue(row, "view")}
                >
                  {app.t("files_btn_view_image")}
                </Button>
              )}
              {write && (
                <Action
                  label={app.t("files_btn_revoke")}
                  danger
                  path={`${path}/${segment(text(row.id))}/revoke`}
                  body={{ version: row.version }}
                  options={{ sensitive: true }}
                  onDone={() => {
                    setPreview(null);
                    setDownloadLink(null);
                  }}
                />
              )}
            </>
          )}
        />
        {preview && (
          <Space orientation="vertical">
            <Image
              src={preview.url}
              alt={app.t("files_img_alt")}
              referrerPolicy="no-referrer"
              preview={false}
              onError={() => {
                setPreview(null);
                setNotice(app.t("files_img_load_error"));
              }}
            />
            <Button onClick={() => setPreview(null)}>
              {app.t("files_close_image")}
            </Button>
          </Space>
        )}
      </div>
    </Card>
  );
}
