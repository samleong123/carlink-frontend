import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Collapse,
  DatePicker,
  Input,
  Modal,
  Result,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  SafetyCertificateOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, orgPath, segment } from "../api/client";
import { object, text, type Row } from "../api/types";
import { useApp } from "../app/context";
import { dayjs, ErrorNotice, type Dayjs } from "./shared";
import {
  isWebNfcSupported,
  maskFingerprint,
  normalizeAndHashNfcUid,
} from "../lib/nfc";

type ScanPhase =
  "idle" | "scanning" | "captured" | "submitting" | "success" | "error";

interface WebNdefReadingEvent extends Event {
  serialNumber?: string;
}

interface WebNdefReader {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  addEventListener: (
    type: "reading" | "readingerror",
    listener: (event: WebNdefReadingEvent) => void,
    options?: { once?: boolean; signal?: AbortSignal },
  ) => void;
}

type WebNdefConstructor = new () => WebNdefReader;

interface ScanErrorInfo {
  title: string;
  description: string;
  canRetryScan?: boolean;
}

const SHA256_HEX_RE = /^[0-9a-fA-F]{64}$/;

export function NfcEnrollModal({
  open = true,
  driverId,
  driverName,
  onClose,
  onDone,
}: {
  open?: boolean;
  driverId: string;
  driverName?: string;
  onClose: () => void;
  onDone?: (credential: Row) => void;
}) {
  const app = useApp();
  const cache = useQueryClient();
  const nfcSupported = isWebNfcSupported();
  const tz = app.session?.user.timezone || "Asia/Kuala_Lumpur";

  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [fingerprintMasked, setFingerprintMasked] = useState<string | null>(
    null,
  );
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [manualFingerprint, setManualFingerprint] = useState("");
  const [scanError, setScanError] = useState<ScanErrorInfo | null>(null);
  const [apiError, setApiError] = useState<unknown>(null);
  const [enrolledCredential, setEnrolledCredential] = useState<Row | null>(
    null,
  );

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const stopActiveScan = () => {
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const resetForAnother = () => {
    stopActiveScan();
    setPhase("idle");
    setFingerprintMasked(null);
    setManualFingerprint("");
    setScanError(null);
    setApiError(null);
    setEnrolledCredential(null);
  };

  const handleClose = () => {
    if (phase === "submitting") return;
    stopActiveScan();
    onClose();
  };

  const submitFingerprint = async (credentialFingerprint: string) => {
    if (!mountedRef.current) return;
    setPhase("submitting");
    setScanError(null);
    setApiError(null);
    try {
      const body: {
        credential_fingerprint: string;
        credential_type: "nfc_uid_sha256";
        expires_at?: string;
      } = {
        credential_fingerprint: credentialFingerprint,
        credential_type: "nfc_uid_sha256",
      };
      if (expiresAt) {
        body.expires_at = expiresAt.tz(tz).format("YYYY-MM-DDTHH:mm:ssZ");
      }
      const response = await api<Row>(
        `${orgPath(app.organizationId)}/drivers/${segment(driverId)}/credentials`,
        {
          method: "POST",
          body,
          sensitive: true,
        },
      );
      await cache.invalidateQueries();
      if (!mountedRef.current) return;
      const credential = object(response.data.credential);
      setEnrolledCredential(credential);
      setPhase("success");
      onDone?.(credential);
    } catch (e) {
      if (!mountedRef.current) return;
      setPhase("error");
      if (e instanceof ApiError && e.status === 409) {
        setScanError({
          title: app.t("NFC card already linked"),
          description: app.t(
            "This NFC card is already active for a driver in this organization, or this driver is not active. Revoke the existing credential first or tap a different card.",
          ),
          canRetryScan: nfcSupported,
        });
      } else {
        setApiError(e);
      }
    }
  };

  const startScan = async () => {
    if (phase === "scanning" || phase === "submitting") return;
    stopActiveScan();

    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("scanning");
    setFingerprintMasked(null);
    setScanError(null);
    setApiError(null);
    setEnrolledCredential(null);

    try {
      const Ndef = (window as unknown as { NDEFReader?: WebNdefConstructor })
        .NDEFReader;
      if (!Ndef) {
        throw new DOMException("Web NFC is unavailable.", "NotSupportedError");
      }
      const reader = new Ndef();

      reader.addEventListener(
        "reading",
        (event) => {
          void (async () => {
            const serial =
              typeof event.serialNumber === "string" ? event.serialNumber : "";
            if (!serial.trim()) {
              stopActiveScan();
              if (!mountedRef.current) return;
              setPhase("error");
              setScanError({
                title: app.t("Card ISO UID unavailable"),
                description: app.t(
                  "This NFC tag did not expose an ISO UID. The card must expose a readable ISO 14443 serial number.",
                ),
                canRetryScan: true,
              });
              return;
            }
            try {
              const digest = await normalizeAndHashNfcUid(serial);
              stopActiveScan();
              if (!mountedRef.current) return;
              setFingerprintMasked(maskFingerprint(digest));
              setPhase("captured");
              await submitFingerprint(digest);
            } catch {
              stopActiveScan();
              if (!mountedRef.current) return;
              setPhase("error");
              setScanError({
                title: app.t("Invalid NFC card UID"),
                description: app.t(
                  "The scanned NFC card UID format could not be normalized. Ensure the card exposes a standard 4 to 10 byte ISO UID and try again.",
                ),
                canRetryScan: true,
              });
            }
          })();
        },
        { once: true, signal: controller.signal },
      );

      reader.addEventListener(
        "readingerror",
        () => {
          stopActiveScan();
          if (!mountedRef.current) return;
          setPhase("error");
          setScanError({
            title: app.t("Unable to read NFC card"),
            description: app.t(
              "Could not read the NFC card. Hold the card steady against the back of your Android phone and try again.",
            ),
            canRetryScan: true,
          });
        },
        { once: true, signal: controller.signal },
      );

      await reader.scan({ signal: controller.signal });
    } catch (err) {
      if (!mountedRef.current) return;
      if (err instanceof DOMException && err.name === "AbortError") {
        setPhase((prev) => (prev === "scanning" ? "idle" : prev));
        return;
      }
      stopActiveScan();
      setPhase("error");
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setScanError({
          title: app.t("NFC permission denied"),
          description: app.t(
            "Allow NFC permission in Android Chrome site settings and try again.",
          ),
          canRetryScan: true,
        });
      } else if (
        err instanceof DOMException &&
        err.name === "NotSupportedError"
      ) {
        setScanError({
          title: app.t("NFC is turned off or unsupported"),
          description: app.t(
            "Enable NFC in your Android device settings and ensure you are using Android Chrome over HTTPS.",
          ),
          canRetryScan: true,
        });
      } else {
        setScanError({
          title: app.t("NFC scan failed"),
          description:
            err instanceof Error
              ? err.message
              : app.t(
                  "Check that NFC is enabled on your Android device and try again.",
                ),
          canRetryScan: true,
        });
      }
    }
  };

  const manualTrimmed = manualFingerprint.trim().toLowerCase();
  const manualValid = SHA256_HEX_RE.test(manualTrimmed);

  const handleManualSubmit = async () => {
    if (!manualValid || phase === "submitting") return;
    stopActiveScan();
    setFingerprintMasked(maskFingerprint(manualTrimmed));
    await submitFingerprint(manualTrimmed);
  };

  const stageModifier =
    phase === "scanning"
      ? "is-scanning"
      : phase === "captured" || phase === "submitting" || phase === "success"
        ? "is-success"
        : phase === "error"
          ? "is-error"
          : "";

  const stageStatusIcon =
    phase === "captured" || phase === "submitting" || phase === "success" ? (
      <CheckCircleOutlined />
    ) : phase === "error" ? (
      <CloseCircleOutlined />
    ) : (
      <WifiOutlined />
    );

  const stageLabel =
    phase === "scanning"
      ? app.t("Hold the NFC card flat against the back of your phone…")
      : phase === "captured" || phase === "submitting"
        ? app.t("Fingerprint computed locally — linking to driver…")
        : phase === "success"
          ? app.t("NFC card linked to driver")
          : phase === "error"
            ? app.t("Scan or linking did not complete")
            : nfcSupported
              ? app.t(
                  "Tap Scan NFC card, then hold the card against the reader",
                )
              : app.t("Tap-to-scan requires Android Chrome over HTTPS");

  const credentialId = text(enrolledCredential?.id);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      destroyOnHidden
      mask={{ closable: phase !== "submitting" }}
      keyboard={phase !== "submitting"}
      title={
        <Space size={8}>
          <SafetyCertificateOutlined />
          <span>
            {driverName
              ? `${app.t("Link Driver NFC ID")} — ${driverName}`
              : app.t("Link Driver NFC ID")}
          </span>
        </Space>
      }
      footer={
        phase === "success" ? null : (
          <Button onClick={handleClose} disabled={phase === "submitting"}>
            {app.t("cancel")}
          </Button>
        )
      }
    >
      {phase === "success" ? (
        <Result
          status="success"
          title={app.t("Driver NFC card linked")}
          subTitle={
            driverName
              ? `${driverName} — ${app.t("Keep the credential reference below to revoke or audit this card later.")}`
              : app.t(
                  "Keep the credential reference below to revoke or audit this card later.",
                )
          }
          extra={[
            <Button key="another" onClick={resetForAnother}>
              {app.t("Link another card")}
            </Button>,
            <Button key="done" type="primary" onClick={handleClose}>
              {app.t("Done")}
            </Button>,
          ]}
        >
          <Space orientation="vertical" size={8} className="full-width">
            {credentialId && (
              <div>
                <Typography.Text type="secondary">
                  {app.t("Credential reference ID")}:{" "}
                </Typography.Text>
                <Typography.Text copyable code className="reference">
                  {credentialId}
                </Typography.Text>
              </div>
            )}
            {fingerprintMasked && (
              <div>
                <Tag color="blue">{`SHA-256: ${fingerprintMasked}`}</Tag>
              </div>
            )}
          </Space>
        </Result>
      ) : (
        <Space orientation="vertical" size={16} className="full-width">
          <div
            className={`nfc-scanner-stage ${stageModifier}`}
            aria-live="polite"
          >
            <div className="nfc-radar-zone" aria-hidden="true">
              <span className="nfc-wave nfc-wave-1" />
              <span className="nfc-wave nfc-wave-2" />
              <span className="nfc-wave nfc-wave-3" />
              <div className="nfc-reader-pad">{stageStatusIcon}</div>
              <div className="nfc-card-tile">
                <CreditCardOutlined />
              </div>
            </div>
            <Typography.Text strong>{stageLabel}</Typography.Text>
            {fingerprintMasked && (
              <Tag color="blue" className="nfc-fingerprint-tag">
                {`SHA-256: ${fingerprintMasked}`}
              </Tag>
            )}
          </div>

          {!nfcSupported && (
            <Alert
              type="warning"
              showIcon
              title={app.t("Web NFC unavailable in this browser")}
              description={app.t(
                "Tap-to-scan requires Android Chrome over HTTPS. Use an Android phone or expand the manual SHA-256 fingerprint entry below.",
              )}
            />
          )}

          {scanError && (
            <Alert
              type="error"
              showIcon
              title={scanError.title}
              description={scanError.description}
              action={
                scanError.canRetryScan && nfcSupported ? (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => void startScan()}
                  >
                    {app.t("Retry")}
                  </Button>
                ) : undefined
              }
            />
          )}

          <ErrorNotice error={apiError} />

          <div>
            <Typography.Text type="secondary">
              {app.t("Optional expiry date & time")}
            </Typography.Text>
            <DatePicker
              showTime
              needConfirm={false}
              className="full-width nfc-expiry-picker"
              placeholder={app.t("No expiry (optional)")}
              value={expiresAt}
              onChange={setExpiresAt}
              disabled={phase === "scanning" || phase === "submitting"}
              disabledDate={(d) => d.isBefore(dayjs(), "day")}
            />
          </div>

          {nfcSupported && (
            <Space wrap>
              {phase === "scanning" ? (
                <Button
                  onClick={() => {
                    stopActiveScan();
                    setPhase("idle");
                  }}
                >
                  {app.t("Stop scanning")}
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<WifiOutlined />}
                  loading={phase === "submitting"}
                  disabled={phase === "submitting"}
                  onClick={() => void startScan()}
                >
                  {phase === "error"
                    ? app.t("Retry NFC scan")
                    : app.t("Scan NFC card")}
                </Button>
              )}
            </Space>
          )}

          <Collapse
            size="small"
            defaultActiveKey={nfcSupported ? [] : ["manual"]}
            items={[
              {
                key: "manual",
                label: app.t("Manual SHA-256 fingerprint entry"),
                children: (
                  <Space
                    orientation="vertical"
                    size={10}
                    className="full-width"
                  >
                    <Typography.Text type="secondary">
                      {app.t(
                        "64 hexadecimal SHA-256 fingerprint only, not a raw NFC UID.",
                      )}
                    </Typography.Text>
                    <Input
                      value={manualFingerprint}
                      onChange={(e) => setManualFingerprint(e.target.value)}
                      maxLength={64}
                      autoComplete="off"
                      disabled={phase === "scanning" || phase === "submitting"}
                      status={
                        manualFingerprint.trim().length > 0 && !manualValid
                          ? "error"
                          : undefined
                      }
                      placeholder={app.t("64-character SHA-256 hex digest")}
                    />
                    <Button
                      type={nfcSupported ? "default" : "primary"}
                      disabled={!manualValid || phase === "submitting"}
                      loading={phase === "submitting"}
                      onClick={() => void handleManualSubmit()}
                    >
                      {app.t("Link fingerprint")}
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Space>
      )}
    </Modal>
  );
}
