import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Empty, Segmented, Space, Typography } from "antd";
import { AimOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import type * as LeafletNs from "leaflet";
import { object, text, type Row } from "../api/types";
import { useApp } from "../app/context";
import { coreText } from "../i18n/corePhrases";
import {
  finiteNumber,
  formatSafetyLabel,
  getSafetySummary,
  RSRP_LEGEND_BANDS,
  rsrpColor,
  rowPointKey,
  SPEED_LEGEND_BANDS,
  speedColor,
} from "../lib/telemetrySafety";
import { dayjs } from "./shared";

type MapTheme = "clean" | "standard" | "slate";
export type CoordinateMapMode = "fleet" | "route" | "coverage";

export function coordinates(items: Row[]) {
  return items.filter(
    (row) =>
      row.latitude !== null &&
      row.latitude !== undefined &&
      row.longitude !== null &&
      row.longitude !== undefined &&
      Number.isFinite(Number(row.latitude)) &&
      Number.isFinite(Number(row.longitude)) &&
      Math.abs(Number(row.latitude)) <= 90 &&
      Math.abs(Number(row.longitude)) <= 180,
  );
}

function fleetFreshnessLabel(
  value: unknown,
  ct: (key: string) => string,
  occurredAt?: unknown,
): string {
  const key = text(value);
  if (key === "recent_packet") return ct("Recent packet");
  if (key === "stale") return ct("Stale observation");
  if (key === "never_observed") return ct("Never observed");
  if (!key && occurredAt) {
    const ts = Date.parse(text(occurredAt));
    if (Number.isFinite(ts)) {
      return Date.now() - ts <= 180_000
        ? ct("Recent packet")
        : ct("Stale observation");
    }
  }
  return key || ct("Freshness unknown");
}

function localizedSafetyLabel(
  safety: ReturnType<typeof getSafetySummary>,
  ct: (key: string) => string,
): string {
  const parts: string[] = [];
  if (safety.harshBraking) parts.push(ct("Harsh braking"));
  if (safety.rapidAcceleration) parts.push(ct("Harsh acceleration"));
  if (!parts.length && safety.sharpCornering) parts.push(ct("Sharp cornering"));
  return parts.join(" & ") || formatSafetyLabel(safety);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function dangerTriangleSvg(isBraking: boolean, ariaLabel: string): string {
  const fill = isBraking ? "#ef4444" : "#f59e0b";
  const stroke = "#ffffff";
  const mark = isBraking ? "#ffffff" : "#111827";
  return `<svg viewBox="0 0 24 24" aria-label="${escapeHtml(ariaLabel)}" role="img">
    <path d="M12 2.2 1.8 20.4c-.4.7.1 1.6.9 1.6h18.6c.8 0 1.3-.9.9-1.6L12 2.2z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="11" y="8.4" width="2" height="6.2" rx="1" fill="${mark}"/>
    <circle cx="12" cy="17.2" r="1.25" fill="${mark}"/>
  </svg>`;
}

export function CoordinateMap({
  items,
  onSelect,
  coverage = false,
  mode,
  focusRowKey,
  focusNonce,
  inspectLabel,
}: {
  items: Row[];
  onSelect?: (row: Row) => void;
  coverage?: boolean;
  mode?: CoordinateMapMode;
  focusRowKey?: string | null;
  focusNonce?: number;
  inspectLabel?: string;
}) {
  const { session, locale, t } = useApp();
  const ct = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      coreText(locale, key, t, vars),
    [locale, t],
  );
  const timezone = session?.user.timezone || "Asia/Kuala_Lumpur";
  const valid = useMemo(() => coordinates(items), [items]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof LeafletNs | null>(null);
  const mapRef = useRef<LeafletNs.Map | null>(null);
  const layerRef = useRef<LeafletNs.LayerGroup | null>(null);
  const validRef = useRef<Row[]>(valid);
  const onSelectRef = useRef(onSelect);
  const markersByKeyRef = useRef<Map<string, LeafletNs.Marker>>(new Map());
  const userMovedRef = useRef(false);
  const lastBoundsKeyRef = useRef<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [mapTheme, setMapTheme] = useState<MapTheme>("clean");
  const [leafletReady, setLeafletReady] = useState(false);

  validRef.current = valid;
  onSelectRef.current = onSelect;

  const resolvedMode: CoordinateMapMode = useMemo(() => {
    if (mode) return mode;
    if (coverage) return "coverage";
    const distinctVehicles = new Set(
      valid
        .map((r) => text(r.vehicle_id || r.registration_number))
        .filter(Boolean),
    );
    return distinctVehicles.size <= 1 && valid.length > 1 ? "route" : "fleet";
  }, [mode, coverage, valid]);

  const boundsInfo = useMemo(() => {
    if (!valid.length) return null;
    const latitudes = valid.map((r) => Number(r.latitude));
    const longitudes = valid.map((r) => Number(r.longitude));
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    return {
      minLat,
      maxLat,
      minLon,
      maxLon,
      key: `${resolvedMode}:${valid.length}:${minLat.toFixed(4)}:${maxLat.toFixed(4)}:${minLon.toFixed(4)}:${maxLon.toFixed(4)}`,
    };
  }, [valid, resolvedMode]);

  const fitAll = useCallback((animate = false) => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const rows = validRef.current;
    if (!L || !map || !rows.length) return;
    userMovedRef.current = false;
    const pts = rows.map(
      (r) => [Number(r.latitude), Number(r.longitude)] as [number, number],
    );
    if (pts.length === 1) {
      map.setView(pts[0], 15, { animate });
      return;
    }
    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16, animate });
  }, []);

  const hasPoints = valid.length > 0;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasPoints) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    void (async () => {
      const mod = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const L = (mod.default ?? mod) as typeof LeafletNs;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
      });
      class OsmReferrerTileLayer extends L.TileLayer {
        createTile(
          coords: LeafletNs.Coords,
          done: LeafletNs.DoneCallback,
        ): HTMLElement {
          const tile = super.createTile(coords, done) as HTMLImageElement;
          // Override document Referrer-Policy: no-referrer on OSM tile <img> elements so OSM receives the origin Referer required by its tile usage policy.
          tile.referrerPolicy = "strict-origin-when-cross-origin";
          return tile;
        }
      }
      new OsmReferrerTileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        },
      ).addTo(map);
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      const layer = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerRef.current = layer;

      map.on("dragstart", () => {
        userMovedRef.current = true;
      });
      map.on("zoomend", () => {
        setZoomLevel(Math.round(map.getZoom()));
      });
      map.on("popupopen", (e: LeafletNs.PopupEvent) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;
        const btn = popupEl.querySelector<HTMLButtonElement>(
          "[data-inspect-index]",
        );
        if (!btn) return;
        btn.onclick = () => {
          const idx = Number(btn.dataset.inspectIndex);
          const targetRow = validRef.current[idx];
          if (targetRow) onSelectRef.current?.(targetRow);
        };
      });

      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          map.invalidateSize({ animate: false });
        });
        ro.observe(containerRef.current);
      }

      setLeafletReady(true);
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerRef.current = null;
      markersByKeyRef.current.clear();
      lastBoundsKeyRef.current = "";
      setLeafletReady(false);
    };
  }, [hasPoints]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!leafletReady || !L || !map || !layer) return;

    layer.clearLayers();
    markersByKeyRef.current.clear();
    if (!valid.length || !boundsInfo) return;

    const drawPolylines = resolvedMode === "route";
    const isCoverageOrRoute =
      resolvedMode === "route" || resolvedMode === "coverage";
    const sorted = isCoverageOrRoute
      ? [...valid].sort(
          (a, b) =>
            (Date.parse(text(a.occurred_at)) || 0) -
            (Date.parse(text(b.occurred_at)) || 0),
        )
      : valid;

    if (drawPolylines && sorted.length > 1) {
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        const vA = text(a.vehicle_id || a.registration_number);
        const vB = text(b.vehicle_id || b.registration_number);
        if (vA && vB && vA !== vB) continue;
        const ptA: [number, number] = [Number(a.latitude), Number(a.longitude)];
        const ptB: [number, number] = [Number(b.latitude), Number(b.longitude)];
        const tA = Date.parse(text(a.occurred_at));
        const tB = Date.parse(text(b.occurred_at));
        const dtMs = Number.isFinite(tA) && Number.isFinite(tB) ? tB - tA : 0;

        if (dtMs > 120_000) {
          L.polyline([ptA, ptB], {
            color: "#94a3b8",
            weight: 2.5,
            opacity: 0.5,
            dashArray: "6 6",
            lineCap: "round",
          })
            .bindTooltip(
              ct("Telemetry gap ({seconds}s)", {
                seconds: Math.round(dtMs / 1000),
              }),
              {
                sticky: true,
                className: "carlink-map-tooltip",
              },
            )
            .addTo(layer);
          continue;
        }

        const sA = finiteNumber(
          a.speed_kmh ?? object(a.vehicle_data).speed_kmh,
        );
        const sB = finiteNumber(
          b.speed_kmh ?? object(b.vehicle_data).speed_kmh,
        );
        const segSpeed =
          sA !== null && sB !== null ? (sA + sB) / 2 : (sB ?? sA);
        const band = speedColor(segSpeed);
        const segColor = band.color;
        const segTooltip =
          segSpeed !== null
            ? ct("Speed: {value} km/h", { value: Math.round(segSpeed) })
            : ct("Speed unknown");

        L.polyline([ptA, ptB], {
          color: "#0f172a",
          weight: 6.5,
          opacity: 0.2,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(layer);

        L.polyline([ptA, ptB], {
          color: segColor,
          weight: 4.2,
          opacity: 0.92,
          lineCap: "round",
          lineJoin: "round",
        })
          .bindTooltip(segTooltip, {
            sticky: true,
            className: "carlink-map-tooltip",
          })
          .addTo(layer);
      }
    }

    sorted.forEach((row, idx) => {
      const lat = Number(row.latitude);
      const lon = Number(row.longitude);
      const net = object(row.network_data);
      const rsrpRaw =
        net.rsrp_dbm ?? net.rsrp ?? row.rsrp_dbm ?? row.rsrp ?? null;
      const sinrRaw =
        net.sinr_db ?? net.sinr ?? row.sinr_db ?? row.sinr ?? null;
      const rsrpNum = finiteNumber(rsrpRaw);
      const sinrNum = finiteNumber(sinrRaw);
      const operator = text(net.operator ?? row.operator) || ct("Unknown");
      const networkType =
        text(
          net.network_type ??
            net.network_mode ??
            row.network_type ??
            row.network_mode,
        ) || ct("Unknown");
      const plate =
        text(row.registration_number) || text(row.vehicle_id) || ct("Vehicle");
      const makeModel = [text(row.make), text(row.model)]
        .filter(Boolean)
        .join(" ");
      const observedRaw = text(row.occurred_at);
      const observedText =
        observedRaw && dayjs(observedRaw).isValid()
          ? dayjs(observedRaw).tz(timezone).format("DD MMM YYYY, HH:mm:ss")
          : ct("Unknown");

      const speedNum = finiteNumber(
        row.speed_kmh ?? object(row.vehicle_data).speed_kmh,
      );
      const rpmNum = finiteNumber(
        row.engine_rpm ?? object(row.vehicle_data).engine_rpm,
      );
      const safety = getSafetySummary(row);
      const safetyTitle = localizedSafetyLabel(safety, ct);

      const isStart = drawPolylines && sorted.length > 1 && idx === 0;
      const isLatest =
        drawPolylines && sorted.length > 1 && idx === sorted.length - 1;
      const isEndpoint = isStart || isLatest;

      let icon: LeafletNs.DivIcon;
      let zIndexOffset = isEndpoint ? 200 : 0;

      const effectiveFreshness =
        text(row.freshness) ||
        (Number.isFinite(Date.parse(text(row.occurred_at))) &&
        Date.now() - Date.parse(text(row.occurred_at)) <= 180_000
          ? "recent_packet"
          : "stale");

      if (safety.hasDangerEvent) {
        const badgeLabel = safetyTitle || ct("Danger driving event");
        icon = L.divIcon({
          className: "carlink-div-icon",
          html: `<span class="carlink-pin carlink-danger ${safety.harshBraking ? "braking" : "accel"}" title="${escapeHtml(badgeLabel)}">${dangerTriangleSvg(safety.harshBraking, badgeLabel)}</span>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -13],
        });
        zIndexOffset = 900;
      } else if (isCoverageOrRoute) {
        const dotColor =
          resolvedMode === "coverage"
            ? rsrpColor(rsrpRaw).color
            : speedColor(speedNum).color;
        const size = resolvedMode === "coverage" ? 10 : isEndpoint ? 13 : 8;
        icon = L.divIcon({
          className: "carlink-div-icon",
          html: `<span class="carlink-pin carlink-dot${isEndpoint ? " carlink-endpoint" : ""}" style="background:${dotColor};" aria-label="${escapeHtml(plate)}"></span>`,
          iconSize: [size + 4, size + 4],
          iconAnchor: [(size + 4) / 2, (size + 4) / 2],
          popupAnchor: [0, -(size / 2 + 4)],
        });
      } else {
        const pinClass =
          `carlink-pin ${effectiveFreshness === "stale" ? "stale" : "recent"} ${row.has_fault_code === true ? "fault" : ""}`.trim();
        icon = L.divIcon({
          className: "carlink-div-icon",
          html: `<span class="${pinClass}" aria-label="${escapeHtml(plate)}">●</span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -11],
        });
      }

      const marker = L.marker([lat, lon], {
        icon,
        title: safety.hasDangerEvent ? `${safetyTitle} · ${plate}` : plate,
        zIndexOffset,
      }).addTo(layer);

      markersByKeyRef.current.set(rowPointKey(row), marker);

      const driverName = text(
        row.current_driver_name ||
          row.driver_name ||
          (row.vehicle_id || row.registration_number ? row.name : ""),
      );
      const endpointLabel = isStart
        ? `${ct("Start")} · `
        : isLatest
          ? `${ct("Latest")} · `
          : "";
      const driverTooltipSegment =
        resolvedMode === "fleet" || (resolvedMode !== "coverage" && driverName)
          ? ` · ${driverName ? escapeHtml(ct("Driver: {name}", { name: driverName })) : escapeHtml(ct("No active driver"))}`
          : "";
      const tooltipText = safety.hasDangerEvent
        ? `⚠ ${escapeHtml(safetyTitle)}${driverTooltipSegment}${speedNum !== null ? ` · ${speedNum} km/h` : ""} · ${escapeHtml(observedText)}`
        : resolvedMode === "coverage"
          ? `${endpointLabel}${escapeHtml(plate)} · ${escapeHtml(networkType)} (${rsrpNum !== null ? `${rsrpNum} dBm` : escapeHtml(ct("Unknown"))})`
          : `${endpointLabel}${escapeHtml(plate)}${driverTooltipSegment}${speedNum !== null ? ` · ${speedNum} km/h` : ""} · ${escapeHtml(observedText)}`;
      marker.bindTooltip(tooltipText, {
        direction: "top",
        offset: [0, -10],
        className: "carlink-map-tooltip",
      });

      const origIndex = validRef.current.indexOf(row);
      const inspectBtn =
        onSelectRef.current && origIndex >= 0
          ? `<div class="carlink-popup-actions"><button type="button" class="carlink-popup-btn" data-inspect-index="${origIndex}">${escapeHtml(inspectLabel || ct("Inspect vehicle"))} &rarr;</button></div>`
          : "";

      const localizedSources = safety.sources.map((src) => ct(src));
      const dangerPopupBlock = safety.hasDangerEvent
        ? `<div class="carlink-popup-danger ${safety.harshBraking ? "" : "accel"}">
            <strong>⚠ ${escapeHtml(safetyTitle)}</strong>
            ${safety.accelerationMs2 !== null ? `<div>${escapeHtml(ct("Accel: {value} m/s²", { value: safety.accelerationMs2.toFixed(2) }))}${safety.thresholdMs2 !== null ? escapeHtml(ct(" (thresh {value} m/s²)", { value: safety.thresholdMs2 })) : ""}</div>` : ""}
            ${localizedSources.length ? `<div>${escapeHtml(ct("Detector: {sources}", { sources: localizedSources.join(" + ") }))}</div>` : ""}
          </div>`
        : "";

      const dtcCodes = Array.isArray(row.dtc_codes)
        ? row.dtc_codes.map((c) => text(c)).filter(Boolean)
        : [];
      const dtcPopupRow =
        dtcCodes.length > 0
          ? `<div class="carlink-popup-row"><span>${escapeHtml(ct("DTC"))}</span><span class="mono" style="color:#dc2626;font-weight:600">${escapeHtml(dtcCodes.join(", "))}</span></div>`
          : "";

      const popupHtml =
        resolvedMode === "coverage"
          ? `<div class="carlink-popup">
              <div class="carlink-popup-head"><strong>${escapeHtml(plate)}</strong><span class="carlink-popup-tag info">${escapeHtml(networkType)}</span></div>
              ${dangerPopupBlock}
              <div class="carlink-popup-row"><span>${escapeHtml(ct("Operator"))}</span><span>${escapeHtml(operator)}</span></div>
              <div class="carlink-popup-row"><span>${escapeHtml(ct("RSRP"))}</span><span>${rsrpNum !== null ? `${escapeHtml(rsrpNum)} dBm` : escapeHtml(ct("Unknown"))}</span></div>
              <div class="carlink-popup-row"><span>${escapeHtml(ct("SINR"))}</span><span>${sinrNum !== null ? `${escapeHtml(sinrNum)} dB` : escapeHtml(ct("Unknown"))}</span></div>
              <div class="carlink-popup-row"><span>${escapeHtml(ct("Coords"))}</span><span class="mono">${lat.toFixed(5)}, ${lon.toFixed(5)}</span></div>
              <div class="carlink-popup-row"><span>${escapeHtml(ct("Observed"))}</span><span>${escapeHtml(observedText)}</span></div>
              ${inspectBtn}
            </div>`
          : `<div class="carlink-popup">
              <div class="carlink-popup-head">
                <div><strong>${escapeHtml(plate)}</strong>${makeModel ? `<div class="carlink-popup-sub">${escapeHtml(makeModel)}</div>` : ""}</div>
                <span class="carlink-popup-tag ${
                  safety.hasDangerEvent || row.has_fault_code === true
                    ? "error"
                    : effectiveFreshness === "stale"
                      ? "warn"
                      : "ok"
                }">${escapeHtml(
                  safety.hasDangerEvent
                    ? safetyTitle
                    : row.has_fault_code === true
                      ? ct("Fault code")
                      : isStart
                        ? ct("Route start")
                        : isLatest
                          ? ct("Latest point")
                          : resolvedMode === "route"
                            ? speedColor(speedNum).shortLabel + " km/h"
                            : fleetFreshnessLabel(row.freshness, ct, row.occurred_at),
                )}</span>
              </div>
              ${dangerPopupBlock}
              ${dtcPopupRow}
              <div class="carlink-popup-row"><span>${escapeHtml(ct("Speed"))}</span><span>${speedNum === null ? escapeHtml(ct("Unknown")) : `${escapeHtml(speedNum)} km/h`}</span></div>
              ${resolvedMode === "fleet" || driverName ? `<div class="carlink-popup-row"><span>${escapeHtml(ct("Current driver"))}</span><span>${driverName ? escapeHtml(driverName) : escapeHtml(ct("No active driver"))}</span></div>` : ""}
              ${rpmNum !== null ? `<div class="carlink-popup-row"><span>${escapeHtml(ct("Engine RPM"))}</span><span>${escapeHtml(rpmNum)} rpm</span></div>` : ""}
              <div class="carlink-popup-row"><span>${escapeHtml(ct("Coords"))}</span><span class="mono">${lat.toFixed(5)}, ${lon.toFixed(5)}</span></div>
              <div class="carlink-popup-row"><span>${escapeHtml(ct("Observed"))}</span><span>${escapeHtml(observedText)}</span></div>
              ${inspectBtn}
            </div>`;

      marker.bindPopup(popupHtml, {
        maxWidth: 290,
        className: "carlink-map-popup",
      });
    });

    if (!userMovedRef.current || lastBoundsKeyRef.current !== boundsInfo.key) {
      lastBoundsKeyRef.current = boundsInfo.key;
      fitAll(false);
    }
  }, [leafletReady, valid, boundsInfo, resolvedMode, timezone, fitAll, ct, inspectLabel]);

  useEffect(() => {
    const map = mapRef.current;
    if (!leafletReady || !map || !focusRowKey) return;
    const marker = markersByKeyRef.current.get(focusRowKey);
    if (!marker) return;
    userMovedRef.current = true;
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 16), {
      animate: true,
    });
    marker.openPopup();
  }, [leafletReady, focusRowKey, focusNonce, valid]);

  if (!valid.length || !boundsInfo) {
    return (
      <div className="map-empty">
        <AimOutlined />
        <Empty description={ct("No observed coordinates in this window")} />
      </div>
    );
  }

  return (
    <div className="map-wrap">
      <div className={`map-stage theme-${mapTheme}`}>
        <div
          ref={containerRef}
          className="coordinate-map leaflet-ant-map"
          aria-label={ct("Interactive OpenStreetMap fleet coordinates")}
        />
        <div className="map-floating-controls">
          <Segmented
            size="small"
            aria-label={ct("Map theme")}
            value={mapTheme}
            onChange={(value) => setMapTheme(value as MapTheme)}
            options={[
              { label: ct("Ant Light"), value: "clean" },
              { label: ct("Standard"), value: "standard" },
              { label: ct("Slate"), value: "slate" },
            ]}
          />
          <Space.Compact size="small">
            <Button
              aria-label={ct("Zoom in")}
              icon={<PlusOutlined />}
              onClick={() => mapRef.current?.zoomIn()}
            />
            <Button
              aria-label={ct("Zoom out")}
              icon={<MinusOutlined />}
              onClick={() => mapRef.current?.zoomOut()}
            />
            <Button
              aria-label={ct("Reset map")}
              icon={<AimOutlined />}
              onClick={() => fitAll(true)}
            >
              {ct("Fit")}
            </Button>
          </Space.Compact>
        </div>
      </div>
      <div className="map-caption">
        <div className="map-caption-meta">
          <Typography.Text type="secondary">
            {ct(
              "{plotted} plotted / {loaded} loaded · OpenStreetMap basemap (zoom {zoom}x) · Missing packets are not dead zones.",
              {
                plotted: valid.length,
                loaded: items.length,
                zoom: zoomLevel,
              },
            )}
          </Typography.Text>
          <span className="map-axis">
            {ct("Latitude {minLat}–{maxLat} · Longitude {minLon}–{maxLon}", {
              minLat: boundsInfo.minLat.toFixed(4),
              maxLat: boundsInfo.maxLat.toFixed(4),
              minLon: boundsInfo.minLon.toFixed(4),
              maxLon: boundsInfo.maxLon.toFixed(4),
            })}
          </span>
        </div>
      </div>
      <div className="map-legend" aria-label={ct("Map pin legend")}>
        {resolvedMode === "coverage" ? (
          <>
            {RSRP_LEGEND_BANDS.map((b) => (
              <span className="map-legend-item" key={b.label}>
                <span
                  className="map-legend-dot"
                  style={{ background: b.color }}
                />{" "}
                {ct(b.label)}
              </span>
            ))}
            <span className="map-legend-item">
              <span className="map-legend-dot signal-unknown" />{" "}
              {ct("Unknown signal")}
            </span>
          </>
        ) : resolvedMode === "route" ? (
          <>
            <span className="map-legend-item">
              <span
                className="map-legend-danger"
                dangerouslySetInnerHTML={{
                  __html: dangerTriangleSvg(true, ct("Harsh braking")),
                }}
              />{" "}
              {ct("Harsh braking")}
            </span>
            <span className="map-legend-item">
              <span
                className="map-legend-danger"
                dangerouslySetInnerHTML={{
                  __html: dangerTriangleSvg(false, ct("Harsh acceleration")),
                }}
              />{" "}
              {ct("Harsh acceleration")}
            </span>
            {SPEED_LEGEND_BANDS.map((b) => (
              <span className="map-legend-item" key={b.label}>
                <span
                  className="map-legend-line"
                  style={{ background: b.color }}
                />{" "}
                {b.shortLabel} km/h
              </span>
            ))}
            <span className="map-legend-item">
              <span className="map-legend-dot signal-unknown" />{" "}
              {ct("Unknown speed")}
            </span>
            <span className="map-legend-item">
              <span className="map-legend-line dashed" /> {ct("Gap (> 120s)")}
            </span>
          </>
        ) : (
          <>
            <span className="map-legend-item">
              <span className="map-legend-dot recent" /> {ct("Recent packet")}
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot stale" />{" "}
              {ct("Stale observation")}
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot fault" />{" "}
              {ct("Active fault code")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
