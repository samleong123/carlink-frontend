import { useEffect, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row as GridRow,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useApp } from "../app/context";
import { object, text, type Row } from "../api/types";
import { Time } from "./shared";

function formatShortTime(iso: unknown): string {
  const s = text(iso);
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

function defaultSummaryItems(entry: Row): { label: string; value: string }[] {
  const res = object(entry.result);
  const items: { label: string; value: string }[] = [];

  if (text(res.code)) {
    items.push({ label: "Code", value: `${text(res.code)} (${text(res.component) || "—"})` });
  }
  if (text(res.description)) {
    items.push({ label: "Description", value: text(res.description) });
  }
  if (text(res.possible_solution)) {
    items.push({ label: "Possible solution", value: text(res.possible_solution) });
  }
  if (text(res.executive_summary)) {
    items.push({ label: "Executive summary", value: text(res.executive_summary) });
  }
  const metrics = object(res.metrics_summary);
  if (Object.keys(metrics).length > 0) {
    items.push({
      label: "Metrics",
      value: Object.entries(metrics)
        .filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(" · "),
    });
  }
  const waste = object(res.estimated_avoidable_waste);
  if (waste.fuel_litres !== undefined || waste.co2_kg !== undefined) {
    items.push({
      label: "Avoidable waste",
      value: `${String(waste.fuel_litres ?? 0)} L / ${String(waste.co2_kg ?? 0)} kg CO₂`,
    });
  }
  if (text(res.encouragement_summary)) {
    items.push({ label: "Coach summary", value: text(res.encouragement_summary) });
  }
  const snap = object(res.efficiency_snapshot);
  if (Object.keys(snap).length > 0) {
    items.push({
      label: "Efficiency snapshot",
      value: [
        snap.distance_km !== undefined ? `Distance: ${snap.distance_km} km` : null,
        snap.fuel_litres !== undefined ? `Fuel: ${snap.fuel_litres} L` : null,
        snap.litres_per_100km !== undefined ? `${snap.litres_per_100km} L/100km` : null,
        snap.safety_score !== undefined ? `Score: ${snap.safety_score}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }
  if (text(res.summary)) {
    items.push({ label: "Audit summary", value: text(res.summary) });
  }
  if (text(res.executive_brief)) {
    items.push({ label: "Executive brief", value: text(res.executive_brief) });
  }
  const signals = object(res.platform_signals);
  if (Object.keys(signals).length > 0) {
    items.push({
      label: "Signals",
      value: Object.entries(signals)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(" · "),
    });
  }
  if (items.length === 0) {
    items.push({
      label: "Payload",
      value: JSON.stringify(res).slice(0, 300),
    });
  }
  return items;
}

export function AiHistoryPanel({
  history,
  activeGenerationId,
  onSelectResult,
  renderCompareBody,
}: {
  history: Row[];
  activeGenerationId?: string | null;
  onSelectResult: (result: Row, entry: Row) => void;
  renderCompareBody?: (entry: Row) => ReactNode;
}) {
  const app = useApp();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [comparing, setComparing] = useState(false);
  const [leftId, setLeftId] = useState<string | undefined>(undefined);
  const [rightId, setRightId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (activeGenerationId) {
      setSelectedId(activeGenerationId);
    }
  }, [activeGenerationId]);

  useEffect(() => {
    if (history.length >= 2) {
      if (!leftId || !history.some((h) => text(h.id) === leftId)) {
        setLeftId(text(history[0].id));
      }
      if (!rightId || !history.some((h) => text(h.id) === rightId)) {
        setRightId(text(history[1].id));
      }
    } else if (history.length === 1) {
      setComparing(false);
    }
  }, [history, leftId, rightId]);

  if (!history.length) return null;

  const options = history.map((entry) => ({
    value: text(entry.id),
    label: `${formatShortTime(entry.created_at)} · ${text(entry.title) || text(entry.feature)} (${text(entry.model) || "AI"})`,
  }));

  const leftEntry = history.find((h) => text(h.id) === leftId) ?? history[0];
  const rightEntry = history.find((h) => text(h.id) === rightId) ?? history[1];

  const renderCard = (entry: Row, label: string) => {
    const summaryItems = defaultSummaryItems(entry);
    return (
      <Card
        size="small"
        title={
          <Space wrap size={6}>
            <Tag color="blue">{label}</Tag>
            <Typography.Text strong>{text(entry.title) || "—"}</Typography.Text>
          </Space>
        }
        extra={
          <Space size={6}>
            <Tag>{text(entry.model) || "AI"}</Tag>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              <Time value={entry.created_at} />
            </Typography.Text>
          </Space>
        }
      >
        {renderCompareBody ? (
          renderCompareBody(entry)
        ) : (
          <Descriptions
            size="small"
            column={1}
            bordered
            items={summaryItems.map((it, idx) => ({
              key: `${idx}-${it.label}`,
              label: it.label,
              children: it.value || "—",
            }))}
          />
        )}
      </Card>
    );
  };

  return (
    <Card size="small" style={{ background: "#fafafa" }}>
      <div className="stack" style={{ gap: 10 }}>
        <Space wrap style={{ justifyContent: "space-between", width: "100%" }}>
          <Space wrap>
            <Space size={6}>
              <Typography.Text strong>
                {app.t("Saved AI Results History")} ({history.length})
              </Typography.Text>
              <Tooltip
                styles={{ root: { maxWidth: 360 } }}
                title={app.t(
                  "AI History is the chronological log of every individual Gemini AI generation run (including re-analyses). Unlike the DTC Catalog (one cached entry per code) and DTC Episodes (vehicle fault timeline), every run creates a snapshot here for inspection or comparison.",
                )}
              >
                <span tabIndex={0} style={{ cursor: "help", opacity: 0.7 }}>
                  ⓘ
                </span>
              </Tooltip>
            </Space>
            <Select<string>
              size="small"
              style={{ minWidth: 280, maxWidth: 460 }}
              placeholder={app.t("View a previous generated result...")}
              value={selectedId}
              options={options}
              onChange={(id) => {
                setSelectedId(id);
                const found = history.find((h) => text(h.id) === id);
                if (found) {
                  onSelectResult(object(found.result), found);
                }
              }}
            />
          </Space>
          {history.length >= 2 && (
            <Button
              size="small"
              icon={<SwapOutlined />}
              type={comparing ? "primary" : "default"}
              onClick={() => setComparing((v) => !v)}
            >
              {comparing ? app.t("Hide comparison") : app.t("Compare 2 results")}
            </Button>
          )}
        </Space>

        {comparing && history.length >= 2 && (
          <div className="stack" style={{ gap: 10 }}>
            <GridRow gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }} size={6}>
                  <Select<string>
                    size="small"
                    style={{ width: "100%" }}
                    value={text(leftEntry?.id)}
                    options={options}
                    onChange={setLeftId}
                  />
                  {leftEntry && renderCard(leftEntry, app.t("Result A"))}
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }} size={6}>
                  <Select<string>
                    size="small"
                    style={{ width: "100%" }}
                    value={text(rightEntry?.id)}
                    options={options}
                    onChange={setRightId}
                  />
                  {rightEntry && renderCard(rightEntry, app.t("Result B"))}
                </Space>
              </Col>
            </GridRow>
          </div>
        )}
      </div>
    </Card>
  );
}
