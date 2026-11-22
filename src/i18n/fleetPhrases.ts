import type { Locale } from "./messages";

export const FLEET_PHRASES: Record<Locale, Record<string, string>> = {
  en: {
    // Overview & platform summary
    "Current platform counts and confirmed paid-invoice totals.":
      "Current platform counts and confirmed paid-invoice totals.",
    "Last-known fleet observations and today’s operational context.":
      "Last-known fleet observations and today’s operational context.",
    "Paid invoice total": "Paid invoice total",
    "As of": "As of",
    "Automatic journeys are not passenger fares.":
      "Automatic journeys are not passenger fares.",
    "Fleet coordinates": "Fleet coordinates",
    "Auto-refresh every {seconds}s (threshold + 5s)":
      "Auto-refresh every {seconds}s (threshold + 5s)",
    "Operational context": "Operational context",
    "Observations, not a heartbeat": "Observations, not a heartbeat",
    "Packet freshness, movement, engine state and OBD connection are independent. Projection may be delayed.":
      "Packet freshness, movement, engine state and OBD connection are independent. Projection may be delayed.",
    "Use the vehicle list to inspect telemetry, maintenance and compliance. Location does not establish a destination or ETA.":
      "Use the vehicle list to inspect telemetry, maintenance and compliance. Location does not establish a destination or ETA.",
    "Fleet vehicle status": "Fleet vehicle status",
    organizations: "Organizations",
    observed_vehicles: "Observed vehicles",
    active_shifts: "Active shifts",
    active_automatic_journeys: "Active automatic journeys",
    open_alerts: "Open alerts",
    pending_telemetry: "Pending telemetry",
    make: "Make",
    model: "Model",
    freshness: "Freshness",
    occurred_at: "Occurred at",

    // Vehicles, telemetry, live OBD & charts
    "Original field": "Original field",
    "Vehicle Speed": "Vehicle Speed",
    "Engine Speed": "Engine Speed",
    "ECU / Control Module Voltage": "ECU / Control Module Voltage",
    "ECU Voltage": "ECU Voltage",
    "Throttle Position": "Throttle Position",
    "Engine Load": "Engine Load",
    "Coolant Temperature": "Coolant Temperature",
    "Coolant Temp": "Coolant Temp",
    "Intake Air Temperature": "Intake Air Temperature",
    "Intake Air Temp": "Intake Air Temp",
    "Mass Air Flow (MAF)": "Mass Air Flow (MAF)",
    "Mass Air Flow": "Mass Air Flow",
    "Fuel Rate": "Fuel Rate",
    "Fuel Tank Level": "Fuel Tank Level",
    "Fuel Level": "Fuel Level",
    "Instant Fuel Consumption": "Instant Fuel Consumption",
    "IMU Longitudinal Accel (Y)": "IMU Longitudinal Accel (Y)",
    "IMU Lateral Accel (X)": "IMU Lateral Accel (X)",
    "Engine Runtime": "Engine Runtime",
    "Latest:": "Latest:",
    "Max:": "Max:",
    "Avg:": "Avg:",
    pts: "pts",
    "{metric} versus observation time, {count} observed samples; gaps are not connected":
      "{metric} versus observation time, {count} observed samples; gaps are not connected",
    "Harsh braking": "Harsh braking",
    "Harsh acceleration": "Harsh acceleration",
    "Sharp cornering": "Sharp cornering",
    "Route Speed & Harsh Driving Summary":
      "Route Speed & Harsh Driving Summary",
    "GPS points": "GPS points",
    "Max speed": "Max speed",
    "Average speed": "Average speed",
    "Harsh Braking & Acceleration Moments":
      "Harsh Braking & Acceleration Moments",
    "Occurred at": "Occurred at",
    Event: "Event",
    Speed: "Speed",
    "Accel (m/s²)": "Accel (m/s²)",
    Detector: "Detector",
    Location: "Location",
    "No GPS fix": "No GPS fix",
    Map: "Map",
    "Locate danger": "Locate danger",
    "Live OBD-II & Telemetry Metrics": "Live OBD-II & Telemetry Metrics",
    "OBD:": "OBD:",
    Connected: "Connected",
    Disconnected: "Disconnected",
    "Engine:": "Engine:",
    Running: "Running",
    Off: "Off",
    "No live OBD-II & telemetry readings received yet.":
      "No live OBD-II & telemetry readings received yet.",
    "Loaded observations": "Loaded observations",
    "All valid OBD & telemetry charts": "All valid OBD & telemetry charts",
    "No usable metric samples in the loaded timeframe.":
      "No usable metric samples in the loaded timeframe.",
    "Chart covers all loaded samples in the selected timeframe. Unknown samples and intervals over {seconds} seconds remain gaps. Use the table for exact values.":
      "Chart covers all loaded samples in the selected timeframe. Unknown samples and intervals over {seconds} seconds remain gaps. Use the table for exact values.",
    "Export CSV": "Export CSV",
    Locate: "Locate",
    "No fix": "No fix",
    "Fuel is an interval estimate. Missing coverage remains unknown. CO₂ uses organization-configured emission factors (default: 2.31 kg/L petrol, 2.68 kg/L diesel).":
      "Fuel is an interval estimate. Missing coverage remains unknown. CO₂ uses organization-configured emission factors (default: 2.31 kg/L petrol, 2.68 kg/L diesel).",
    Overview: "Overview",
    "Vehicle identity": "Vehicle identity",
    "Public device identity": "Public device identity",
    "Latest observed sample": "Latest observed sample",
    "Reported fault presence": "Reported fault presence",
    Telemetry: "Telemetry",
    "Device & diagnostics": "Device & diagnostics",
    Mileage: "Mileage",
    "Mileage is partial and estimated. Unknown usage is not zero. Initial odometer observations anchor the absolute baseline.":
      "Mileage is partial and estimated. Unknown usage is not zero. Initial odometer observations anchor the absolute baseline.",
    "Record initial baseline": "Record initial baseline",
    Fuel: "Fuel",
    Journeys: "Journeys",
    Maintenance: "Maintenance",
    Compliance: "Compliance",
    "Network coverage": "Network coverage",
    Attachments: "Attachments",
    "Vehicle details": "Vehicle details",
    "Auto-refresh: ON ({refreshSeconds}s = {configuredSeconds}s + 5s)":
      "Auto-refresh: ON ({refreshSeconds}s = {configuredSeconds}s + 5s)",
    "Auto-refresh: OFF (until browser reload)":
      "Auto-refresh: OFF (until browser reload)",
    "Disable auto-refresh": "Disable auto-refresh",
    "Enable auto-refresh": "Enable auto-refresh",
    "Back to vehicles": "Back to vehicles",
    "Edit vehicle": "Edit vehicle",
    "Initial odometer baseline": "Initial odometer baseline",
    "Odometer reading (km)": "Odometer reading (km)",
    odo_baseline_km_help:
      "Enter the vehicle's odometer reading in kilometres (automatically converted to integer metres for the server).",
    "Carry-in distance (km)": "Carry-in distance (km)",
    "Public device record": "Public device record",
    "Commissioning, activation and installation writes are managed by SaaS staff.":
      "Commissioning, activation and installation writes are managed by SaaS staff.",
    position_observed_at: "Position observed at",
    latitude: "Latitude",
    longitude: "Longitude",
    engine_rpm: "Engine RPM",
    network_data: "Network data",
    source_format: "Source format",
    ecu_voltage_v: "ECU Voltage (V)",
    throttle_pct: "Throttle (%)",
    engine_load_pct: "Engine Load (%)",
    coolant_temp_c: "Coolant Temp (°C)",
    fuel_rate_lph: "Fuel Rate (L/h)",
    quality: "Quality",
    from_at: "From",
    to_at: "To",
    distance_m: "Distance (km)",
    source: "Source",
    reading_m: "Reading (km)",
    observed_at: "Observed at",
    vehicle_id: "Vehicle",
    effective_from: "Effective from",
    effective_to: "Effective to",
    closure_reason: "Closure reason",

    // Driving, journeys, safety, appeals, drivers, driver portal
    "Safety score": "Safety score",
    "Score (0–100)": "Score (0–100)",
    Unavailable: "Unavailable",
    "Events included": "Events included",
    "Observed speed samples": "Observed speed samples",
    "Eligible speed intervals": "Eligible speed intervals",
    Algorithm: "Algorithm",
    Quality: "Quality",
    "Retention window": "Retention window",
    "Approved appeals excluded": "Approved appeals excluded",
    Yes: "Yes",
    No: "No",
    "Scores use available observed speed intervals within your retention window and exclude approved appeals. Missing intervals or uncalibrated thresholds remain unverified.":
      "Scores use available observed speed intervals within your retention window and exclude approved appeals. Missing intervals or uncalibrated thresholds remain unverified.",
    "Automatic journey — Speed & Harsh Driving Route":
      "Automatic journey — Speed & Harsh Driving Route",
    "Long journey truncated to the first 5 days of telemetry samples.":
      "Long journey truncated to the first 5 days of telemetry samples.",
    Duration: "Duration",
    Distance: "Distance",
    "Fuel efficiency": "Fuel efficiency",
    "Avg speed": "Avg speed",
    "Telemetry read permission is required to plot the speed-colored route and IMU events.":
      "Telemetry read permission is required to plot the speed-colored route and IMU events.",
    "Journey Speed & Danger Map": "Journey Speed & Danger Map",
    "Harsh Braking & Acceleration in This Journey":
      "Harsh Braking & Acceleration in This Journey",
    Coordinates: "Coordinates",
    "{count} server safety event(s) matched the journey timeframe cleanly, but no telemetry GPS samples overlapped.":
      "{count} server safety event(s) matched the journey timeframe cleanly, but no telemetry GPS samples overlapped.",
    "No harsh braking or rapid acceleration events detected in this journey.":
      "No harsh braking or rapid acceleration events detected in this journey.",
    "Journey Metadata": "Journey Metadata",
    "Inspect journey": "Inspect journey",
    "0 speed Δ (inspect for IMU)": "0 speed Δ (inspect for IMU)",
    "Harsh accel": "Harsh accel",
    "Automatic vehicle journeys — inspect speed-colored routes and harsh braking / acceleration events.":
      "Automatic vehicle journeys — inspect speed-colored routes and harsh braking / acceleration events.",
    "No manual start/end controls. Journey distance and fleet driver attribution remain unavailable where not supplied. Click 'Inspect journey' to view the full speed-colored route and IMU + server harsh driving points.":
      "No manual start/end controls. Journey distance and fleet driver attribution remain unavailable where not supplied. Click 'Inspect journey' to view the full speed-colored route and IMU + server harsh driving points.",
    "All journey states": "All journey states",
    completed: "Completed",
    incomplete: "Incomplete",
    "harsh braking": "harsh braking",
    "harsh acceleration": "harsh acceleration",
    "0 speed delta": "0 speed delta",
    "At most 100 journeys in this filter; no cursor endpoint is available.":
      "At most 100 journeys in this filter; no cursor endpoint is available.",
    "Review braking and acceleration observations and appeal decisions.":
      "Review braking and acceleration observations and appeal decisions.",
    "Driving events are based on captured speed readings. Missing readings may hide events; review the context before drawing conclusions.":
      "Driving events are based on captured speed readings. Missing readings may hide events; review the context before drawing conclusions.",
    Inspect: "Inspect",
    "Submit appeal": "Submit appeal",
    "Review decision": "Review decision",
    "Appeal record": "Appeal record",
    "Safety observation": "Safety observation",
    "Submit my event appeal": "Submit my event appeal",
    "Decide appeal": "Decide appeal",
    "Describe why this driving event needs review. You can submit one appeal for each eligible event.":
      "Describe why this driving event needs review. You can submit one appeal for each eligible event.",
    "You cannot review your own appeal. Approval excludes the observation from safety calculations while retaining its history.":
      "You cannot review your own appeal. Approval excludes the observation from safety calculations while retaining its history.",
    "Driver details": "Driver details",
    "Profile identity and currently authorized NFC shifts.":
      "Profile identity and currently authorized NFC shifts.",
    "Edit driver": "Edit driver",
    "Profile & private photo": "Profile & private photo",
    "NFC shifts": "NFC shifts",
    "NFC device authorization creates shifts. Web sign-out does not end a physical shift.":
      "NFC device authorization creates shifts. Web sign-out does not end a physical shift.",
    "Inspect shift": "Inspect shift",
    "Administrative close": "Administrative close",
    "Safety score & events": "Safety score & events",
    "Driver safety score": "Driver safety score",
    "NFC credentials": "NFC credentials",
    "Enrol the SHA-256 fingerprint, not the raw NFC card number. Keep the returned credential reference to revoke that credential later.":
      "Enrol the SHA-256 fingerprint, not the raw NFC card number. Keep the returned credential reference to revoke that credential later.",
    "Enrol NFC fingerprint": "Enrol NFC fingerprint",
    "Known enrolled credential UUID": "Known enrolled credential UUID",
    "Revoke known credential": "Revoke known credential",
    "64 hexadecimal SHA-256 fingerprint only, not a raw NFC UID.":
      "64 hexadecimal SHA-256 fingerprint only, not a raw NFC UID.",
    "Driver shift": "Driver shift",
    "Administratively close shift": "Administratively close shift",
    "Current driver assignments": "Current driver assignments",
    "Locations require currently accepted active NFC shifts; old observations are not live GPS.":
      "Locations require currently accepted active NFC shifts; old observations are not live GPS.",
    "Active shift coordinates": "Active shift coordinates",
    "Private photo": "Private photo",
    "Direct S3 photo links last at most 5 minutes. Do not share: anyone holding a link can use it until expiry or object deletion, even after app access is revoked.":
      "Direct S3 photo links last at most 5 minutes. Do not share: anyone holding a link can use it until expiry or object deletion, even after app access is revoked.",
    "Legacy photo requires an authorized reupload. The original private file is preserved.":
      "Legacy photo requires an authorized reupload. The original private file is preserved.",
    "Private driver photograph": "Private driver photograph",
    "Clear photo": "Clear photo",
    "Request authorized photo": "Request authorized photo",
    "Only your retained, server-authorized safety score. Approved appeals are excluded.":
      "Only your retained, server-authorized safety score. Approved appeals are excluded.",
    "My safety score": "My safety score",
    "Safety scores are currently unavailable on your organization’s plan. You can still review your driving records and trips.":
      "Safety scores are currently unavailable on your organization’s plan. You can still review your driving records and trips.",
    "Only your retained, server-authorized driving data. No other driver’s trace or shared journey bounds.":
      "Only your retained, server-authorized driving data. No other driver’s trace or shared journey bounds.",
    "Own driver profile": "Own driver profile",
    "My current safety score": "My current safety score",
    "Currently NFC-authorized vehicle": "Currently NFC-authorized vehicle",
    "Trips are your observed intersections with automatic journeys, not whole shared-vehicle routes or paid fares.":
      "Trips are your observed intersections with automatic journeys, not whole shared-vehicle routes or paid fares.",
    "Records are limited to your accepted NFC attribution and purchased retention.":
      "Records are limited to your accepted NFC attribution and purchased retention.",
    "Outside an active authorized shift, no current vehicle is expected. We do not fall back to your last shared vehicle.":
      "Outside an active authorized shift, no current vehicle is expected. We do not fall back to your last shared vehicle.",
    "Own fuel and efficiency use aligned covered intervals only, not the entire vehicle total. Estimated CO₂ uses organization emission factors.":
      "Own fuel and efficiency use aligned covered intervals only, not the entire vehicle total. Estimated CO₂ uses organization emission factors.",
    event_id: "Event ID",
    driver_id: "Driver",
    decision_reason: "Decision reason",
    created_at: "Created at",
    kind: "Kind",
    state: "State",
    delta_speed_kmh: "Delta speed (km/h)",
    acceleration_ms2: "Acceleration (m/s²)",
    decision: "Decision",
    started_at: "Started at",
    ended_at: "Ended at",
    attribution_expires_at: "Attribution expires at",
    last_observed_at: "Last observed at",
    unknown_seconds: "Unknown seconds",
    distance_quality: "Distance quality",
    fuel_efficiency: "Fuel efficiency (L/100km / km/L)",
    fuel_litres: "Fuel used (L)",
    fuel_efficiency_l_per_100km: "Fuel efficiency (L/100km)",
    fuel_efficiency_km_per_l: "Fuel efficiency (km/L)",
    credential_fingerprint: "Credential fingerprint",
    credential_type: "Credential type",
    nfc_uid_sha256: "NFC UID (SHA-256)",
    expires_at: "Expires at",
    first_own_observation_at: "First own observation at",
    last_own_observation_at: "Last own observation at",

    // Diagnostics
    "Command status": "Command status",
    "Queued/running/completed are command metadata, not a stored diagnostic report, hardware certification or proof of AI success. Automatic checking stops after six minutes.":
      "Queued/running/completed are command metadata, not a stored diagnostic report, hardware certification or proof of AI success. Automatic checking stops after six minutes.",
    "Push device configuration": "Push device configuration",
    "Queue current organization settings (telemetry_interval_seconds, safety & cellular plan gates, and MAF assumptions) to the installed Pi device? Settings apply only after the device acknowledges the command.":
      "Queue current organization settings (telemetry_interval_seconds, safety & cellular plan gates, and MAF assumptions) to the installed Pi device? Settings apply only after the device acknowledges the command.",
    "Read-only diagnostics": "Read-only diagnostics",
    "Extended Read-Only DUDU2 DTC Scan": "Extended Read-Only DUDU2 DTC Scan",
    "DUDU2 OBD extended DTC method (read-only)":
      "DUDU2 OBD extended DTC method (read-only)",
    "Runs functional OBD-II plus ECU (7E0/7E8), TCM (7E1/7E9), and K-line/CAN read-only queries; no DTC codes are stored on CarLink. Only runs when vehicle OBD speed is 0 km/h, and OBD2 telemetry data will be interrupted for 2–5 minutes during scan execution.":
      "Runs functional OBD-II plus ECU (7E0/7E8), TCM (7E1/7E9), and K-line/CAN read-only queries; no DTC codes are stored on CarLink. Only runs when vehicle OBD speed is 0 km/h, and OBD2 telemetry data will be interrupted for 2–5 minutes during scan execution.",
    "Vehicle must be stationary at 0 km/h":
      "Vehicle must be stationary at 0 km/h",
    "Current observed OBD speed is {speed} km/h. Park the vehicle and wait for a fresh 0 km/h reading before requesting an extended scan.":
      "Current observed OBD speed is {speed} km/h. Park the vehicle and wait for a fresh 0 km/h reading before requesting an extended scan.",
    "No current OBD speed sample is observed. A fresh 0 km/h reading is required before requesting an extended scan.":
      "No current OBD speed sample is observed. A fresh 0 km/h reading is required before requesting an extended scan.",
    "I confirm the vehicle is parked at 0 km/h and understand OBD2 data will be interrupted for 2–5 minutes":
      "I confirm the vehicle is parked at 0 km/h and understand OBD2 data will be interrupted for 2–5 minutes",
    "Run extended DTC scan": "Run extended DTC scan",
    "Push organization settings to installed Pi device":
      "Push organization settings to installed Pi device",
    "Queues signed configuration containing telemetry_interval_seconds, safety and cellular plan gates, and MAF assumptions. The device must acknowledge the command before settings take effect.":
      "Queues signed configuration containing telemetry_interval_seconds, safety and cellular plan gates, and MAF assumptions. The device must acknowledge the command before settings take effect.",
    "Fault code explanation": "Fault code explanation",
    "The entered code is sent securely to Google for an AI explanation. This is not a verified diagnosis and is not saved by CarLink.":
      "The entered code is sent securely to Google for an AI explanation. This is not a verified diagnosis and is not saved by CarLink.",
    "DTC code": "DTC code",
    "Please enter a DTC code.": "Please enter a DTC code.",
    "Enter a normalized code, for example P0730.":
      "Enter a normalized code, for example P0730.",
    "e.g. P0730": "e.g. P0730",
    "Explain once": "Explain once",
    "Clear explanation": "Clear explanation",
    "AI Hints": "AI Hints",
    "Powered by Google Gemini": "Powered by Google Gemini",
    "AI Hints · Powered by Google Gemini":
      "AI Hints · Powered by Google Gemini",
    "Advisory only — generated by Google Gemini and not stored by CarLink.":
      "Advisory only — generated by Google Gemini and not stored by CarLink.",
    obd_speed_kmh: "OBD speed (km/h)",
    installed_device_status: "Installed device status",
    command_id: "Command ID",

    // Analytics (Coverage, Reports, Logs)
    Good: "Good",
    Fair: "Fair",
    Weak: "Weak",
    "Invalid CSV response": "Invalid CSV response",
    "Raw RSRP/SINR and operator observations — not a calibrated radio survey.":
      "Raw RSRP/SINR and operator observations — not a calibrated radio survey.",
    "Export server CSV": "Export server CSV",
    "Missing GPS or packets are not dead zones. RSRP is dBm, SINR is dB; sample alignment is unverified. CSV is limited to 10,000 samples and a 24-hour window.":
      "Missing GPS or packets are not dead zones. RSRP is dBm, SINR is dB; sample alignment is unverified. CSV is limited to 10,000 samples and a 24-hour window.",
    "Loaded observation coordinates": "Loaded observation coordinates",
    "Sort order": "Sort order",
    "Sort: Newest first": "Sort: Newest first",
    "Sort: Oldest first": "Sort: Oldest first",
    Vehicle: "Vehicle",
    Operator: "Operator",
    "Network type": "Network type",
    "Signal quality": "Signal quality",
    "RSRP (dBm)": "RSRP (dBm)",
    "SINR (dB)": "SINR (dB)",
    Latitude: "Latitude",
    Longitude: "Longitude",
    "{count} total in timeframe": "{count} total in timeframe",
    "Reached 50-page cap (10,000 rows); narrow the timeframe to see all observations.":
      "Reached 50-page cap (10,000 rows); narrow the timeframe to see all observations.",
    Updated: "Updated",
    "Organization activity and subscription summary.":
      "Organization activity and subscription summary.",
    "Global request metadata without tenant business association.":
      "Global request metadata without tenant business association.",
    "Permissioned request and action responsibility records.":
      "Permissioned request and action responsibility records.",
    "No request-body viewer. Credentials, DTC explanations, file signatures and payment callbacks must stay out of logs.":
      "No request-body viewer. Credentials, DTC explanations, file signatures and payment callbacks must stay out of logs.",
    "HTTP requests": "HTTP requests",
    "Action audit": "Action audit",
    request_id: "Request ID",
    method: "Method",
    route_template: "Route template",
    duration_ms: "Duration (ms)",
    actor_user_id: "Actor user ID",
    action: "Action",
    outcome: "Outcome",

    // Registry
    "Driver profile email is separate from the sign-in mailbox.":
      "Driver profile email is separate from the sign-in mailbox.",
    "Choose an active eligible driver membership. Primary role must be driver; the server checks eligibility.":
      "Choose an active eligible driver membership. Primary role must be driver; the server checks eligibility.",
    "Fleet identity, pending installations and vehicle records.":
      "Fleet identity, pending installations and vehicle records.",
    "Registered drivers, linked accounts and accepted NFC attribution.":
      "Registered drivers, linked accounts and accepted NFC attribution.",
    "Public device identity. Managed installation is reserved for SaaS technicians.":
      "Public device identity. Managed installation is reserved for SaaS technicians.",
    "Vehicle registration automatically creates a pending device. Contact SaaS staff for activation or relinking.":
      "Vehicle registration automatically creates a pending device. Contact SaaS staff for activation or relinking.",
    Archive: "Archive",
    "Archive this vehicle? The server checks active installations and other operational restrictions.":
      "Archive this vehicle? The server checks active installations and other operational restrictions.",
    "Register vehicle": "Register vehicle",
    "Register driver": "Register driver",
    "A new vehicle receives a pending device automatically. Unknown odometer mileage is not zero.":
      "A new vehicle receives a pending device automatically. Unknown odometer mileage is not zero.",
    "Suspending a driver closes current server-authorized shifts. Linking a human account requires an eligible active driver membership.":
      "Suspending a driver closes current server-authorized shifts. Linking a human account requires an eligible active driver membership.",
    registration_country: "Registration country",
    model_year: "Model year",
    fuel_type: "Fuel type",
    passenger_capacity: "Passenger capacity",
    seats: "seats",
    petrol: "Petrol",
    diesel: "Diesel",
    hybrid: "Hybrid",
    electric: "Electric",
    other: "Other",
    maintenance: "Maintenance",
    employee_code: "Employee code",
    phone: "Phone",
    user_id: "User ID",
    registered_vehicle_id: "Registered vehicle",

    // NFC card enrollment & credentials
    "Link Driver NFC ID": "Link Driver NFC ID",
    "Link NFC ID": "Link NFC ID",
    "NFC card already linked": "NFC card already linked",
    "This NFC card is already active for a driver in this organization, or this driver is not active. Revoke the existing credential first or tap a different card.":
      "This NFC card is already active for a driver in this organization, or this driver is not active. Revoke the existing credential first or tap a different card.",
    "Card ISO UID unavailable": "Card ISO UID unavailable",
    "This NFC tag did not expose an ISO UID. The card must expose a readable ISO 14443 serial number.":
      "This NFC tag did not expose an ISO UID. The card must expose a readable ISO 14443 serial number.",
    "Invalid NFC card UID": "Invalid NFC card UID",
    "The scanned NFC card UID format could not be normalized. Ensure the card exposes a standard 4 to 10 byte ISO UID and try again.":
      "The scanned NFC card UID format could not be normalized. Ensure the card exposes a standard 4 to 10 byte ISO UID and try again.",
    "Unable to read NFC card": "Unable to read NFC card",
    "Could not read the NFC card. Hold the card steady against the back of your Android phone and try again.":
      "Could not read the NFC card. Hold the card steady against the back of your Android phone and try again.",
    "NFC permission denied": "NFC permission denied",
    "Allow NFC permission in Android Chrome site settings and try again.":
      "Allow NFC permission in Android Chrome site settings and try again.",
    "NFC is turned off or unsupported": "NFC is turned off or unsupported",
    "Enable NFC in your Android device settings and ensure you are using Android Chrome over HTTPS.":
      "Enable NFC in your Android device settings and ensure you are using Android Chrome over HTTPS.",
    "NFC scan failed": "NFC scan failed",
    "Check that NFC is enabled on your Android device and try again.":
      "Check that NFC is enabled on your Android device and try again.",
    "Hold the NFC card flat against the back of your phone…":
      "Hold the NFC card flat against the back of your phone…",
    "Fingerprint computed locally — linking to driver…":
      "Fingerprint computed locally — linking to driver…",
    "NFC card linked to driver": "NFC card linked to driver",
    "Scan or linking did not complete": "Scan or linking did not complete",
    "Tap Scan NFC card, then hold the card against the reader":
      "Tap Scan NFC card, then hold the card against the reader",
    "Tap-to-scan requires Android Chrome over HTTPS":
      "Tap-to-scan requires Android Chrome over HTTPS",
    "Driver NFC card linked": "Driver NFC card linked",
    "Keep the credential reference below to revoke or audit this card later.":
      "Keep the credential reference below to revoke or audit this card later.",
    "Link another card": "Link another card",
    Done: "Done",
    "Credential reference ID": "Credential reference ID",
    "Only the SHA-256 digest of the NFC UID bytes is sent to CarLink. The raw card UID is never stored or logged.":
      "Only the SHA-256 digest of the NFC UID bytes is sent to CarLink. The raw card UID is never stored or logged.",
    "Web NFC unavailable in this browser":
      "Web NFC unavailable in this browser",
    "Tap-to-scan requires Android Chrome over HTTPS. Use an Android phone or expand the manual SHA-256 fingerprint entry below.":
      "Tap-to-scan requires Android Chrome over HTTPS. Use an Android phone or expand the manual SHA-256 fingerprint entry below.",
    Retry: "Retry",
    "Optional expiry date & time": "Optional expiry date & time",
    "No expiry (optional)": "No expiry (optional)",
    "Stop scanning": "Stop scanning",
    "Retry NFC scan": "Retry NFC scan",
    "Scan NFC card": "Scan NFC card",
    "Manual SHA-256 fingerprint entry": "Manual SHA-256 fingerprint entry",
    "64-character SHA-256 hex digest": "64-character SHA-256 hex digest",
    "Link fingerprint": "Link fingerprint",
    Assurance: "Assurance",
    "Issued at": "Issued at",
    "No expiry": "No expiry",
    Active: "Active",
    Revoked: "Revoked",
    Expired: "Expired",
    Revoke: "Revoke",
    "Revoke this NFC credential? Active shifts using this card will be closed by the server.":
      "Revoke this NFC credential? Active shifts using this card will be closed by the server.",

    // Active driver-vehicle sessions
    current_driver_name: "Current driver",
    current_driver_id: "Current driver ID",
    current_vehicle_registration: "Current vehicle",
    current_vehicle_id: "Current vehicle ID",
    current_vehicle_make: "Current vehicle make",
    current_vehicle_model: "Current vehicle model",
    current_shift_started_at: "Current shift started at",
    current_shift_expires_at: "Current shift expires at",
    registration_number: "Registration number",
    "Current driver": "Current driver",
    "Current driver session": "Current driver session",
    "Current vehicle session": "Current vehicle session",
    "Driver: {name}": "Driver: {name}",
    "No active driver": "No active driver",
    "No active driver shift on this vehicle. Tap an enrolled NFC card on the in-vehicle reader to start a driver session.":
      "No active driver shift on this vehicle. Tap an enrolled NFC card on the in-vehicle reader to start a driver session.",
    "No active vehicle shift for this driver. Tap an enrolled NFC card on a vehicle reader to start a shift.":
      "No active vehicle shift for this driver. Tap an enrolled NFC card on a vehicle reader to start a shift.",
    Driver: "Driver",
    Driving: "Driving",
    "Off shift": "Off shift",
    "Open driver": "Open driver",
    "Open vehicle": "Open vehicle",
    "Last authenticated": "Last authenticated",
    "Make / model": "Make / model",
    "Current assignments": "Current assignments",
    assignments: "Current assignments",
    "Locations require currently authorized NFC shifts; old observations are not live GPS.":
      "Locations require currently authorized NFC shifts; old observations are not live GPS.",
  },
  ms: {
    // Overview & platform summary
    "Current platform counts and confirmed paid-invoice totals.":
      "Bilangan platform semasa dan jumlah invois berbayar yang disahkan.",
    "Last-known fleet observations and today’s operational context.":
      "Pemerhatian armada terkini dan konteks operasi hari ini.",
    "Paid invoice total": "Jumlah invois dibayar",
    "As of": "Setakat",
    "Automatic journeys are not passenger fares.":
      "Perjalanan automatik bukan tambang penumpang.",
    "Fleet coordinates": "Koordinat armada",
    "Auto-refresh every {seconds}s (threshold + 5s)":
      "Muat semula automatik setiap {seconds}s (ambang + 5s)",
    "Operational context": "Konteks operasi",
    "Observations, not a heartbeat": "Pemerhatian, bukan isyarat denyut",
    "Packet freshness, movement, engine state and OBD connection are independent. Projection may be delayed.":
      "Kesegaran paket, pergerakan, keadaan enjin dan sambungan OBD adalah berasingan. Unjuran mungkin tertangguh.",
    "Use the vehicle list to inspect telemetry, maintenance and compliance. Location does not establish a destination or ETA.":
      "Gunakan senarai kenderaan untuk memeriksa telemetri, penyelenggaraan dan pematuhan. Lokasi tidak menentukan destinasi atau ETA.",
    "Fleet vehicle status": "Status kenderaan armada",
    organizations: "Organisasi",
    observed_vehicles: "Kenderaan diperhatikan",
    active_shifts: "Syif aktif",
    active_automatic_journeys: "Perjalanan automatik aktif",
    open_alerts: "Amaran terbuka",
    pending_telemetry: "Telemetri menunggu",
    make: "Jenama",
    model: "Model",
    freshness: "Kesegaran",
    occurred_at: "Berlaku pada",

    // Vehicles, telemetry, live OBD & charts
    "Original field": "Medan asal",
    "Vehicle Speed": "Kelajuan Kenderaan",
    "Engine Speed": "Kelajuan Enjin",
    "ECU / Control Module Voltage": "Voltan ECU / Modul Kawalan",
    "ECU Voltage": "Voltan ECU",
    "Throttle Position": "Kedudukan Pendikit",
    "Engine Load": "Beban Enjin",
    "Coolant Temperature": "Suhu Penyejuk",
    "Coolant Temp": "Suhu Penyejuk",
    "Intake Air Temperature": "Suhu Udara Masuk",
    "Intake Air Temp": "Suhu Udara Masuk",
    "Mass Air Flow (MAF)": "Aliran Udara Jisim (MAF)",
    "Mass Air Flow": "Aliran Udara Jisim",
    "Fuel Rate": "Kadar Bahan Api",
    "Fuel Tank Level": "Paras Tangki Bahan Api",
    "Fuel Level": "Paras Bahan Api",
    "Instant Fuel Consumption": "Penggunaan Bahan Api Semasa",
    "IMU Longitudinal Accel (Y)": "Pecutan Membujur IMU (Y)",
    "IMU Lateral Accel (X)": "Pecutan Sisi IMU (X)",
    "Engine Runtime": "Tempoh Operasi Enjin",
    "Latest:": "Terkini:",
    "Max:": "Maks:",
    "Avg:": "Purata:",
    pts: "titik",
    "{metric} versus observation time, {count} observed samples; gaps are not connected":
      "{metric} berbanding masa pemerhatian, {count} sampel diperhatikan; jurang tidak disambungkan",
    "Harsh braking": "Brek keras",
    "Harsh acceleration": "Pecutan keras",
    "Sharp cornering": "Selekoh tajam",
    "Route Speed & Harsh Driving Summary":
      "Ringkasan Kelajuan Laluan & Pemanduan Keras",
    "GPS points": "Titik GPS",
    "Max speed": "Kelajuan maksimum",
    "Average speed": "Kelajuan purata",
    "Harsh Braking & Acceleration Moments": "Detik Brek Keras & Pecutan Keras",
    "Occurred at": "Berlaku pada",
    Event: "Peristiwa",
    Speed: "Kelajuan",
    "Accel (m/s²)": "Pecutan (m/s²)",
    Detector: "Pengesan",
    Location: "Lokasi",
    "No GPS fix": "Tiada kunci GPS",
    Map: "Peta",
    "Locate danger": "Cari bahaya",
    "Live OBD-II & Telemetry Metrics": "Metrik OBD-II & Telemetri Langsung",
    "OBD:": "OBD:",
    Connected: "Disambungkan",
    Disconnected: "Terputus",
    "Engine:": "Enjin:",
    Running: "Berjalan",
    Off: "Dimatikan",
    "No live OBD-II & telemetry readings received yet.":
      "Tiada bacaan OBD-II & telemetri langsung diterima lagi.",
    "Loaded observations": "Pemerhatian dimuatkan",
    "All valid OBD & telemetry charts": "Semua carta OBD & telemetri yang sah",
    "No usable metric samples in the loaded timeframe.":
      "Tiada sampel metrik yang boleh digunakan dalam julat masa dimuatkan.",
    "Chart covers all loaded samples in the selected timeframe. Unknown samples and intervals over {seconds} seconds remain gaps. Use the table for exact values.":
      "Carta merangkumi semua sampel yang dimuatkan dalam julat masa dipilih. Sampel tidak diketahui dan selang melebihi {seconds} saat kekal sebagai jurang. Gunakan jadual untuk nilai tepat.",
    "Export CSV": "Eksport CSV",
    Locate: "Cari lokasi",
    "No fix": "Tiada lokasi",
    "Fuel is an interval estimate. Missing coverage remains unknown. CO₂ uses organization-configured emission factors (default: 2.31 kg/L petrol, 2.68 kg/L diesel).":
      "Bahan api ialah anggaran selang. Liputan yang hilang kekal tidak diketahui. CO₂ dikira menggunakan faktor pelepasan yang ditetapkan oleh organisasi (lalai: 2.31 kg/L petrol, 2.68 kg/L diesel).",
    Overview: "Gambaran",
    "Vehicle identity": "Identiti kenderaan",
    "Public device identity": "Identiti peranti awam",
    "Latest observed sample": "Sampel pemerhatian terkini",
    "Reported fault presence": "Kehadiran kerosakan dilaporkan",
    Telemetry: "Telemetri",
    "Device & diagnostics": "Peranti & diagnostik",
    Mileage: "Perbatuan",
    "Mileage is partial and estimated. Unknown usage is not zero. Initial odometer observations anchor the absolute baseline.":
      "Perbatuan adalah separa dan dianggarkan. Penggunaan tidak diketahui bukan sifar. Pemerhatian odometer awal menetapkan garis dasar mutlak.",
    "Record initial baseline": "Rekod garis dasar awal",
    Fuel: "Bahan api",
    Journeys: "Perjalanan",
    Maintenance: "Penyelenggaraan",
    Compliance: "Pematuhan",
    "Network coverage": "Liputan rangkaian",
    Attachments: "Lampiran",
    "Vehicle details": "Butiran kenderaan",
    "Auto-refresh: ON ({refreshSeconds}s = {configuredSeconds}s + 5s)":
      "Muat semula automatik: HIDUP ({refreshSeconds}s = {configuredSeconds}s + 5s)",
    "Auto-refresh: OFF (until browser reload)":
      "Muat semula automatik: MATI (sehingga pelayar dimuat semula)",
    "Disable auto-refresh": "Matikan muat semula automatik",
    "Enable auto-refresh": "Hidupkan muat semula automatik",
    "Back to vehicles": "Kembali ke kenderaan",
    "Edit vehicle": "Sunting kenderaan",
    "Initial odometer baseline": "Garis dasar odometer awal",
    "Odometer reading (km)": "Bacaan odometer (km)",
    odo_baseline_km_help:
      "Masukkan bacaan odometer kenderaan dalam kilometer (ditukar secara automatik kepada meter integer untuk pelayan).",
    "Carry-in distance (km)": "Jarak bawa masuk (km)",
    "Public device record": "Rekod peranti awam",
    "Commissioning, activation and installation writes are managed by SaaS staff.":
      "Pentauliahan, pengaktifan dan penulisan pemasangan diuruskan oleh kakitangan SaaS.",
    position_observed_at: "Kedudukan diperhatikan pada",
    latitude: "Latitud",
    longitude: "Longitud",
    engine_rpm: "RPM Enjin",
    network_data: "Data rangkaian",
    source_format: "Format sumber",
    ecu_voltage_v: "Voltan ECU (V)",
    throttle_pct: "Pendikit (%)",
    engine_load_pct: "Beban Enjin (%)",
    coolant_temp_c: "Suhu Penyejuk (°C)",
    fuel_rate_lph: "Kadar Bahan Api (L/j)",
    quality: "Kualiti",
    from_at: "Dari",
    to_at: "Hingga",
    distance_m: "Jarak (km)",
    source: "Sumber",
    reading_m: "Bacaan (km)",
    observed_at: "Diperhatikan pada",
    vehicle_id: "Kenderaan",
    effective_from: "Berkuat kuasa dari",
    effective_to: "Berkuat kuasa hingga",
    closure_reason: "Sebab penutupan",

    // Driving, journeys, safety, appeals, drivers, driver portal
    "Safety score": "Skor keselamatan",
    "Score (0–100)": "Skor (0–100)",
    Unavailable: "Tidak tersedia",
    "Events included": "Peristiwa disertakan",
    "Observed speed samples": "Sampel kelajuan diperhatikan",
    "Eligible speed intervals": "Selang kelajuan layak",
    Algorithm: "Algoritma",
    Quality: "Kualiti",
    "Retention window": "Tempoh pengekalan",
    "Approved appeals excluded": "Rayuan diluluskan dikecualikan",
    Yes: "Ya",
    No: "Tidak",
    "Scores use available observed speed intervals within your retention window and exclude approved appeals. Missing intervals or uncalibrated thresholds remain unverified.":
      "Skor menggunakan selang kelajuan yang diperhatikan dalam tempoh pengekalan anda dan mengecualikan rayuan yang diluluskan. Selang yang hilang atau ambang belum ditentukur kekal tidak disahkan.",
    "Automatic journey — Speed & Harsh Driving Route":
      "Perjalanan automatik — Laluan Kelajuan & Pemanduan Keras",
    "Long journey truncated to the first 5 days of telemetry samples.":
      "Perjalanan panjang dipendekkan kepada 5 hari pertama sampel telemetri.",
    Duration: "Tempoh",
    Distance: "Jarak",
    "Fuel efficiency": "Kecekapan bahan api",
    "Avg speed": "Kelajuan purata",
    "Telemetry read permission is required to plot the speed-colored route and IMU events.":
      "Kebenaran membaca telemetri diperlukan untuk memplot laluan berwarna kelajuan dan peristiwa IMU.",
    "Journey Speed & Danger Map": "Peta Kelajuan & Bahaya Perjalanan",
    "Harsh Braking & Acceleration in This Journey":
      "Brek Keras & Pecutan dalam Perjalanan Ini",
    Coordinates: "Koordinat",
    "{count} server safety event(s) matched the journey timeframe cleanly, but no telemetry GPS samples overlapped.":
      "{count} peristiwa keselamatan pelayan sepadan dengan julat masa perjalanan, tetapi tiada sampel GPS telemetri bertindih.",
    "No harsh braking or rapid acceleration events detected in this journey.":
      "Tiada peristiwa brek keras atau pecutan pantas dikesan dalam perjalanan ini.",
    "Journey Metadata": "Metadata Perjalanan",
    "Inspect journey": "Periksa perjalanan",
    "0 speed Δ (inspect for IMU)": "0 Δ kelajuan (periksa untuk IMU)",
    "Harsh accel": "Pecutan keras",
    "Automatic vehicle journeys — inspect speed-colored routes and harsh braking / acceleration events.":
      "Perjalanan kenderaan automatik — periksa laluan berwarna kelajuan dan peristiwa brek keras / pecutan.",
    "No manual start/end controls. Journey distance and fleet driver attribution remain unavailable where not supplied. Click 'Inspect journey' to view the full speed-colored route and IMU + server harsh driving points.":
      "Tiada kawalan mula/tamat manual. Jarak perjalanan dan atribusi pemandu armada tidak tersedia jika tidak dibekalkan. Klik 'Periksa perjalanan' untuk melihat laluan penuh berwarna kelajuan serta titik pemanduan keras IMU + pelayan.",
    "All journey states": "Semua status perjalanan",
    completed: "Selesai",
    incomplete: "Tidak lengkap",
    "harsh braking": "brek keras",
    "harsh acceleration": "pecutan keras",
    "0 speed delta": "0 delta kelajuan",
    "At most 100 journeys in this filter; no cursor endpoint is available.":
      "Maksimum 100 perjalanan dalam penapis ini; tiada titik akhir kursor tersedia.",
    "Review braking and acceleration observations and appeal decisions.":
      "Semak pemerhatian brek dan pecutan serta keputusan rayuan.",
    "Driving events are based on captured speed readings. Missing readings may hide events; review the context before drawing conclusions.":
      "Peristiwa pemanduan berdasarkan bacaan kelajuan yang dirakam. Bacaan yang hilang mungkin menyembunyikan peristiwa; semak konteks sebelum membuat kesimpulan.",
    Inspect: "Periksa",
    "Submit appeal": "Hantar rayuan",
    "Review decision": "Semak keputusan",
    "Appeal record": "Rekod rayuan",
    "Safety observation": "Pemerhatian keselamatan",
    "Submit my event appeal": "Hantar rayuan peristiwa saya",
    "Decide appeal": "Putuskan rayuan",
    "Describe why this driving event needs review. You can submit one appeal for each eligible event.":
      "Terangkan sebab peristiwa pemanduan ini perlu disemak. Anda boleh menghantar satu rayuan bagi setiap peristiwa yang layak.",
    "You cannot review your own appeal. Approval excludes the observation from safety calculations while retaining its history.":
      "Anda tidak boleh menyemak rayuan anda sendiri. Kelulusan mengecualikan pemerhatian daripada pengiraan keselamatan sambil mengekalkan sejarahnya.",
    "Driver details": "Butiran pemandu",
    "Profile identity and currently authorized NFC shifts.":
      "Identiti profil dan syif NFC yang dibenarkan pada masa ini.",
    "Edit driver": "Sunting pemandu",
    "Profile & private photo": "Profil & foto peribadi",
    "NFC shifts": "Syif NFC",
    "NFC device authorization creates shifts. Web sign-out does not end a physical shift.":
      "Pengesahan peranti NFC mewujudkan syif. Log keluar web tidak menamatkan syif fizikal.",
    "Inspect shift": "Periksa syif",
    "Administrative close": "Tutup secara pentadbiran",
    "Safety score & events": "Skor keselamatan & peristiwa",
    "Driver safety score": "Skor keselamatan pemandu",
    "NFC credentials": "Kelayakan NFC",
    "Enrol the SHA-256 fingerprint, not the raw NFC card number. Keep the returned credential reference to revoke that credential later.":
      "Daftarkan cap jari SHA-256, bukan nombor kad NFC mentah. Simpan rujukan kelayakan yang dikembalikan untuk membatalkannya kemudian.",
    "Enrol NFC fingerprint": "Daftar cap jari NFC",
    "Known enrolled credential UUID": "UUID kelayakan berdaftar yang diketahui",
    "Revoke known credential": "Batal kelayakan diketahui",
    "64 hexadecimal SHA-256 fingerprint only, not a raw NFC UID.":
      "Cap jari SHA-256 64 aksara heksadesimal sahaja, bukan UID NFC mentah.",
    "Driver shift": "Syif pemandu",
    "Administratively close shift": "Tutup syif secara pentadbiran",
    "Current driver assignments": "Tugasan pemandu semasa",
    "Locations require currently accepted active NFC shifts; old observations are not live GPS.":
      "Lokasi memerlukan syif NFC aktif yang diterima pada masa ini; pemerhatian lama bukan GPS langsung.",
    "Active shift coordinates": "Koordinat syif aktif",
    "Private photo": "Foto peribadi",
    "Direct S3 photo links last at most 5 minutes. Do not share: anyone holding a link can use it until expiry or object deletion, even after app access is revoked.":
      "Pautan foto S3 terus bertahan maksimum 5 minit. Jangan kongsi: sesiapa yang memegang pautan boleh menggunakannya sehingga tamat tempoh atau objek dipadamkan, walaupun selepas akses aplikasi dibatalkan.",
    "Legacy photo requires an authorized reupload. The original private file is preserved.":
      "Foto lama memerlukan muat naik semula yang dibenarkan. Fail peribadi asal dikekalkan.",
    "Private driver photograph": "Foto peribadi pemandu",
    "Clear photo": "Kosongkan foto",
    "Request authorized photo": "Minta foto dibenarkan",
    "Only your retained, server-authorized safety score. Approved appeals are excluded.":
      "Hanya skor keselamatan anda yang disimpan dan dibenarkan oleh pelayan. Rayuan yang diluluskan dikecualikan.",
    "My safety score": "Skor keselamatan saya",
    "Safety scores are currently unavailable on your organization’s plan. You can still review your driving records and trips.":
      "Skor keselamatan kini tidak tersedia pada pelan organisasi anda. Anda masih boleh menyemak rekod pemanduan dan perjalanan anda.",
    "Only your retained, server-authorized driving data. No other driver’s trace or shared journey bounds.":
      "Hanya data pemanduan anda yang disimpan dan dibenarkan oleh pelayan. Tiada jejak pemandu lain atau sempadan perjalanan dikongsi.",
    "Own driver profile": "Profil pemandu sendiri",
    "My current safety score": "Skor keselamatan semasa saya",
    "Currently NFC-authorized vehicle": "Kenderaan dibenarkan NFC semasa",
    "Trips are your observed intersections with automatic journeys, not whole shared-vehicle routes or paid fares.":
      "Perjalanan ialah persilangan pemerhatian anda dengan perjalanan automatik, bukan keseluruhan laluan kenderaan kongsi atau tambang berbayar.",
    "Records are limited to your accepted NFC attribution and purchased retention.":
      "Rekod terhad kepada atribusi NFC anda yang diterima dan tempoh pengekalan yang dibeli.",
    "Outside an active authorized shift, no current vehicle is expected. We do not fall back to your last shared vehicle.":
      "Di luar syif dibenarkan yang aktif, tiada kenderaan semasa dijangkakan. Kami tidak kembali kepada kenderaan kongsi terakhir anda.",
    "Own fuel and efficiency use aligned covered intervals only, not the entire vehicle total. Estimated CO₂ uses organization emission factors.":
      "Bahan api dan kecekapan sendiri hanya menggunakan selang liputan yang sejajar, bukan jumlah keseluruhan kenderaan. Anggaran CO₂ menggunakan faktor pelepasan organisasi.",
    event_id: "ID Peristiwa",
    driver_id: "Pemandu",
    decision_reason: "Sebab keputusan",
    created_at: "Dicipta pada",
    kind: "Jenis",
    state: "Keadaan",
    delta_speed_kmh: "Perubahan kelajuan (km/j)",
    acceleration_ms2: "Pecutan (m/s²)",
    decision: "Keputusan",
    started_at: "Bermula pada",
    ended_at: "Tamat pada",
    attribution_expires_at: "Atribusi tamat pada",
    last_observed_at: "Terakhir diperhatikan pada",
    unknown_seconds: "Saat tidak diketahui",
    distance_quality: "Kualiti jarak",
    fuel_efficiency: "Kecekapan bahan api (L/100km / km/L)",
    fuel_litres: "Bahan api digunakan (L)",
    fuel_efficiency_l_per_100km: "Kecekapan bahan api (L/100km)",
    fuel_efficiency_km_per_l: "Kecekapan bahan api (km/L)",
    credential_fingerprint: "Cap jari kelayakan",
    credential_type: "Jenis kelayakan",
    nfc_uid_sha256: "UID NFC (SHA-256)",
    expires_at: "Tamat tempoh pada",
    first_own_observation_at: "Pemerhatian sendiri pertama pada",
    last_own_observation_at: "Pemerhatian sendiri terakhir pada",

    // Diagnostics
    "Command status": "Status arahan",
    "Queued/running/completed are command metadata, not a stored diagnostic report, hardware certification or proof of AI success. Automatic checking stops after six minutes.":
      "Beratur/berjalan/selesai ialah metadata arahan, bukan laporan diagnostik tersimpan, pensijilan perkakasan atau bukti kejayaan AI. Semakan automatik berhenti selepas enam minit.",
    "Push device configuration": "Hantar konfigurasi peranti",
    "Queue current organization settings (telemetry_interval_seconds, safety & cellular plan gates, and MAF assumptions) to the installed Pi device? Settings apply only after the device acknowledges the command.":
      "Masukkan tetapan organisasi semasa (telemetry_interval_seconds, gerbang pelan keselamatan & selular, serta andaian MAF) ke dalam giliran peranti Pi yang dipasang? Tetapan hanya berkuat kuasa selepas peranti mengesahkan arahan.",
    "Read-only diagnostics": "Diagnostik baca sahaja",
    "Extended Read-Only DUDU2 DTC Scan":
      "Imbasan DTC DUDU2 Baca Sahaja Lanjutan",
    "DUDU2 OBD extended DTC method (read-only)":
      "Kaedah DTC lanjutan OBD DUDU2 (baca sahaja)",
    "Runs functional OBD-II plus ECU (7E0/7E8), TCM (7E1/7E9), and K-line/CAN read-only queries; no DTC codes are stored on CarLink. Only runs when vehicle OBD speed is 0 km/h, and OBD2 telemetry data will be interrupted for 2–5 minutes during scan execution.":
      "Menjalankan pertanyaan baca sahaja OBD-II berfungsi serta ECU (7E0/7E8), TCM (7E1/7E9), dan K-line/CAN; tiada kod DTC disimpan di CarLink. Hanya dijalankan apabila kelajuan OBD kenderaan ialah 0 km/j, dan data telemetri OBD2 akan terganggu selama 2–5 minit semasa imbasan dijalankan.",
    "Vehicle must be stationary at 0 km/h": "Kenderaan mesti pegun pada 0 km/j",
    "Current observed OBD speed is {speed} km/h. Park the vehicle and wait for a fresh 0 km/h reading before requesting an extended scan.":
      "Kelajuan OBD semasa yang diperhatikan ialah {speed} km/j. Letakkan kenderaan dan tunggu bacaan 0 km/j baharu sebelum meminta imbasan lanjutan.",
    "No current OBD speed sample is observed. A fresh 0 km/h reading is required before requesting an extended scan.":
      "Tiada sampel kelajuan OBD semasa diperhatikan. Bacaan 0 km/j baharu diperlukan sebelum meminta imbasan lanjutan.",
    "I confirm the vehicle is parked at 0 km/h and understand OBD2 data will be interrupted for 2–5 minutes":
      "Saya mengesahkan kenderaan diletakkan pada 0 km/j dan memahami data OBD2 akan terganggu selama 2–5 minit",
    "Run extended DTC scan": "Jalankan imbasan DTC lanjutan",
    "Push organization settings to installed Pi device":
      "Hantar tetapan organisasi ke peranti Pi yang dipasang",
    "Queues signed configuration containing telemetry_interval_seconds, safety and cellular plan gates, and MAF assumptions. The device must acknowledge the command before settings take effect.":
      "Memasukkan konfigurasi bertandatangan yang mengandungi telemetry_interval_seconds, gerbang pelan keselamatan dan selular, serta andaian MAF ke dalam giliran. Peranti mesti mengesahkan arahan sebelum tetapan berkuat kuasa.",
    "Fault code explanation": "Penjelasan kod kerosakan",
    "The entered code is sent securely to Google for an AI explanation. This is not a verified diagnosis and is not saved by CarLink.":
      "Kod yang dimasukkan dihantar secara selamat ke Google untuk penjelasan AI. Ini bukan diagnosis yang disahkan dan tidak disimpan oleh CarLink.",
    "DTC code": "Kod DTC",
    "Please enter a DTC code.": "Sila masukkan kod DTC.",
    "Enter a normalized code, for example P0730.":
      "Masukkan kod yang dinormalkan, contohnya P0730.",
    "e.g. P0730": "cth. P0730",
    "Explain once": "Terangkan sekali",
    "Clear explanation": "Kosongkan penjelasan",
    "AI Hints": "Petunjuk AI",
    "Powered by Google Gemini": "Dikuasakan oleh Google Gemini",
    "AI Hints · Powered by Google Gemini":
      "Petunjuk AI · Dikuasakan oleh Google Gemini",
    "Advisory only — generated by Google Gemini and not stored by CarLink.":
      "Nasihat sahaja — dijana oleh Google Gemini dan tidak disimpan oleh CarLink.",
    obd_speed_kmh: "Kelajuan OBD (km/j)",
    installed_device_status: "Status peranti dipasang",
    command_id: "ID Arahan",

    // Analytics (Coverage, Reports, Logs)
    Good: "Baik",
    Fair: "Sederhana",
    Weak: "Lemah",
    "Invalid CSV response": "Respons CSV tidak sah",
    "Raw RSRP/SINR and operator observations — not a calibrated radio survey.":
      "Pemerhatian RSRP/SINR mentah dan pengendali — bukan tinjauan radio yang ditentukur.",
    "Export server CSV": "Eksport CSV pelayan",
    "Missing GPS or packets are not dead zones. RSRP is dBm, SINR is dB; sample alignment is unverified. CSV is limited to 10,000 samples and a 24-hour window.":
      "GPS atau paket yang hilang bukan zon mati. RSRP ialah dBm, SINR ialah dB; penjajaran sampel tidak disahkan. CSV terhad kepada 10,000 sampel dan tetingkap 24 jam.",
    "Loaded observation coordinates": "Koordinat pemerhatian dimuatkan",
    "Sort order": "Susunan isihan",
    "Sort: Newest first": "Isih: Terkini dahulu",
    "Sort: Oldest first": "Isih: Terlama dahulu",
    Vehicle: "Kenderaan",
    Operator: "Pengendali rangkaian",
    "Network type": "Jenis rangkaian",
    "Signal quality": "Kualiti isyarat",
    "RSRP (dBm)": "RSRP (dBm)",
    "SINR (dB)": "SINR (dB)",
    Latitude: "Latitud",
    Longitude: "Longitud",
    "{count} total in timeframe": "{count} jumlah dalam julat masa",
    "Reached 50-page cap (10,000 rows); narrow the timeframe to see all observations.":
      "Mencapai had 50 halaman (10,000 baris); sempitkan julat masa untuk melihat semua pemerhatian.",
    Updated: "Dikemas kini",
    "Organization activity and subscription summary.":
      "Ringkasan aktiviti organisasi dan langganan.",
    "Global request metadata without tenant business association.":
      "Metadata permintaan global tanpa perkaitan perniagaan penyewa.",
    "Permissioned request and action responsibility records.":
      "Rekod permintaan berkeizinan dan tanggungjawab tindakan.",
    "No request-body viewer. Credentials, DTC explanations, file signatures and payment callbacks must stay out of logs.":
      "Tiada pemapar isi permintaan. Kelayakan, penjelasan DTC, tandatangan fail dan panggil balik pembayaran mesti berada di luar log.",
    "HTTP requests": "Permintaan HTTP",
    "Action audit": "Audit tindakan",
    request_id: "ID Permintaan",
    method: "Kaedah",
    route_template: "Templat laluan",
    duration_ms: "Tempoh (ms)",
    actor_user_id: "ID Pengguna Pelaku",
    action: "Tindakan",
    outcome: "Keputusan",

    // Registry
    "Driver profile email is separate from the sign-in mailbox.":
      "E-mel profil pemandu adalah berasingan daripada peti mel log masuk.",
    "Choose an active eligible driver membership. Primary role must be driver; the server checks eligibility.":
      "Pilih keahlian pemandu yang aktif dan layak. Peranan utama mestilah pemandu; pelayan menyemak kelayakan.",
    "Fleet identity, pending installations and vehicle records.":
      "Identiti armada, pemasangan menunggu dan rekod kenderaan.",
    "Registered drivers, linked accounts and accepted NFC attribution.":
      "Pemandu berdaftar, akaun dipautkan dan atribusi NFC diterima.",
    "Public device identity. Managed installation is reserved for SaaS technicians.":
      "Identiti peranti awam. Pemasangan terurus dikhaskan untuk juruteknik SaaS.",
    "Vehicle registration automatically creates a pending device. Contact SaaS staff for activation or relinking.":
      "Pendaftaran kenderaan secara automatik mencipta peranti menunggu. Hubungi kakitangan SaaS untuk pengaktifan atau pautan semula.",
    Archive: "Arkibkan",
    "Archive this vehicle? The server checks active installations and other operational restrictions.":
      "Arkibkan kenderaan ini? Pelayan menyemak pemasangan aktif dan sekatan operasi lain.",
    "Register vehicle": "Daftar kenderaan",
    "Register driver": "Daftar pemandu",
    "A new vehicle receives a pending device automatically. Unknown odometer mileage is not zero.":
      "Kenderaan baharu menerima peranti menunggu secara automatik. Perbatuan odometer yang tidak diketahui bukan sifar.",
    "Suspending a driver closes current server-authorized shifts. Linking a human account requires an eligible active driver membership.":
      "Menggantung pemandu menutup syif dibenarkan pelayan semasa. Memautkan akaun pengguna memerlukan keahlian pemandu aktif yang layak.",
    registration_country: "Negara pendaftaran",
    model_year: "Tahun model",
    fuel_type: "Jenis bahan api",
    passenger_capacity: "Kapasiti penumpang",
    seats: "tempat duduk",
    petrol: "Petrol",
    diesel: "Diesel",
    hybrid: "Hibrid",
    electric: "Elektrik",
    other: "Lain-lain",
    maintenance: "Penyelenggaraan",
    employee_code: "Kod pekerja",
    phone: "Telefon",
    user_id: "ID Pengguna",
    registered_vehicle_id: "Kenderaan berdaftar",

    // NFC card enrollment & credentials
    "Link Driver NFC ID": "Pautkan ID NFC Pemandu",
    "Link NFC ID": "Pautkan ID NFC",
    "NFC card already linked": "Kad NFC sudah dipautkan",
    "This NFC card is already active for a driver in this organization, or this driver is not active. Revoke the existing credential first or tap a different card.":
      "Kad NFC ini sudah aktif untuk pemandu dalam organisasi ini, atau pemandu ini tidak aktif. Batalkan kelayakan sedia ada dahulu atau sentuh kad lain.",
    "Card ISO UID unavailable": "UID ISO kad tidak tersedia",
    "This NFC tag did not expose an ISO UID. The card must expose a readable ISO 14443 serial number.":
      "Tag NFC ini tidak mendedahkan UID ISO. Kad mesti mendedahkan nombor siri ISO 14443 yang boleh dibaca.",
    "Invalid NFC card UID": "UID kad NFC tidak sah",
    "The scanned NFC card UID format could not be normalized. Ensure the card exposes a standard 4 to 10 byte ISO UID and try again.":
      "Format UID kad NFC yang diimbas tidak dapat dinormalkan. Pastikan kad mempunyai UID ISO 4 hingga 10 bait yang standard dan cuba lagi.",
    "Unable to read NFC card": "Tidak dapat membaca kad NFC",
    "Could not read the NFC card. Hold the card steady against the back of your Android phone and try again.":
      "Tidak dapat membaca kad NFC. Pegang kad dengan stabil di bahagian belakang telefon Android anda dan cuba lagi.",
    "NFC permission denied": "Kebenaran NFC ditolak",
    "Allow NFC permission in Android Chrome site settings and try again.":
      "Benarkan kebenaran NFC dalam tetapan tapak Android Chrome dan cuba lagi.",
    "NFC is turned off or unsupported": "NFC dimatikan atau tidak disokong",
    "Enable NFC in your Android device settings and ensure you are using Android Chrome over HTTPS.":
      "Aktifkan NFC dalam tetapan peranti Android anda dan pastikan anda menggunakan Android Chrome melalui HTTPS.",
    "NFC scan failed": "Imbasan NFC gagal",
    "Check that NFC is enabled on your Android device and try again.":
      "Pastikan NFC diaktifkan pada peranti Android anda dan cuba lagi.",
    "Hold the NFC card flat against the back of your phone…":
      "Letakkan kad NFC rata di bahagian belakang telefon anda…",
    "Fingerprint computed locally — linking to driver…":
      "Cap jari dikira secara setempat — memautkan ke pemandu…",
    "NFC card linked to driver": "Kad NFC dipautkan kepada pemandu",
    "Scan or linking did not complete": "Imbasan atau pautan tidak selesai",
    "Tap Scan NFC card, then hold the card against the reader":
      "Ketik Imbas kad NFC, kemudian pegang kad pada pembaca",
    "Tap-to-scan requires Android Chrome over HTTPS":
      "Imbasan sentuh memerlukan Android Chrome melalui HTTPS",
    "Driver NFC card linked": "Kad NFC pemandu berjaya dipautkan",
    "Keep the credential reference below to revoke or audit this card later.":
      "Simpan rujukan kelayakan di bawah untuk membatalkan atau mengaudit kad ini kemudian.",
    "Link another card": "Pautkan kad lain",
    Done: "Selesai",
    "Credential reference ID": "ID rujukan kelayakan",
    "Only the SHA-256 digest of the NFC UID bytes is sent to CarLink. The raw card UID is never stored or logged.":
      "Hanya ringkasan SHA-256 bagi bait UID NFC dihantar ke CarLink. UID kad mentah tidak pernah disimpan atau direkodkan.",
    "Web NFC unavailable in this browser":
      "Web NFC tidak tersedia dalam pelayar ini",
    "Tap-to-scan requires Android Chrome over HTTPS. Use an Android phone or expand the manual SHA-256 fingerprint entry below.":
      "Imbasan sentuh memerlukan Android Chrome melalui HTTPS. Gunakan telefon Android atau buka kemasukan cap jari SHA-256 manual di bawah.",
    Retry: "Cuba semula",
    "Optional expiry date & time": "Tarikh & masa tamat tempoh pilihan",
    "No expiry (optional)": "Tiada tamat tempoh (pilihan)",
    "Stop scanning": "Hentikan imbasan",
    "Retry NFC scan": "Imbas NFC semula",
    "Scan NFC card": "Imbas kad NFC",
    "Manual SHA-256 fingerprint entry": "Kemasukan cap jari SHA-256 manual",
    "64-character SHA-256 hex digest":
      "Ringkasan heksadesimal SHA-256 64 aksara",
    "Link fingerprint": "Pautkan cap jari",
    Assurance: "Jaminan",
    "Issued at": "Dikeluarkan pada",
    "No expiry": "Tiada tamat tempoh",
    Active: "Aktif",
    Revoked: "Dibatalkan",
    Expired: "Tamat tempoh",
    Revoke: "Batal",
    "Revoke this NFC credential? Active shifts using this card will be closed by the server.":
      "Batalkan kelayakan NFC ini? Syif aktif yang menggunakan kad ini akan ditutup oleh pelayan.",

    // Active driver-vehicle sessions
    current_driver_name: "Pemandu semasa",
    current_driver_id: "ID pemandu semasa",
    current_vehicle_registration: "Kenderaan semasa",
    current_vehicle_id: "ID kenderaan semasa",
    current_vehicle_make: "Jenama kenderaan semasa",
    current_vehicle_model: "Model kenderaan semasa",
    current_shift_started_at: "Syif semasa bermula pada",
    current_shift_expires_at: "Syif semasa tamat pada",
    registration_number: "Nombor pendaftaran",
    "Current driver": "Pemandu semasa",
    "Current driver session": "Sesi pemandu semasa",
    "Current vehicle session": "Sesi kenderaan semasa",
    "Driver: {name}": "Pemandu: {name}",
    "No active driver": "Tiada pemandu aktif",
    "No active driver shift on this vehicle. Tap an enrolled NFC card on the in-vehicle reader to start a driver session.":
      "Tiada syif pemandu aktif pada kenderaan ini. Sentuh kad NFC berdaftar pada pembaca dalam kenderaan untuk memulakan sesi pemandu.",
    "No active vehicle shift for this driver. Tap an enrolled NFC card on a vehicle reader to start a shift.":
      "Tiada syif kenderaan aktif bagi pemandu ini. Sentuh kad NFC berdaftar pada pembaca kenderaan untuk memulakan syif.",
    Driver: "Pemandu",
    Driving: "Memandu",
    "Off shift": "Luar syif",
    "Open driver": "Buka pemandu",
    "Open vehicle": "Buka kenderaan",
    "Last authenticated": "Terakhir disahkan",
    "Make / model": "Jenama / model",
    "Current assignments": "Tugasan semasa",
    assignments: "Tugasan semasa",
    "Locations require currently authorized NFC shifts; old observations are not live GPS.":
      "Lokasi memerlukan syif NFC aktif yang dibenarkan; pemerhatian lama bukan GPS langsung.",
  },
  zh: {
    // Overview & platform summary
    "Current platform counts and confirmed paid-invoice totals.":
      "当前平台统计数量与已确认的付款发票总额。",
    "Last-known fleet observations and today’s operational context.":
      "车队最新已知观察数据与今日运营概况。",
    "Paid invoice total": "已付款发票总额",
    "As of": "截至",
    "Automatic journeys are not passenger fares.": "自动行程并非乘客车费订单。",
    "Fleet coordinates": "车队坐标",
    "Auto-refresh every {seconds}s (threshold + 5s)":
      "每 {seconds} 秒自动刷新（阈值 + 5 秒）",
    "Operational context": "运营概况",
    "Observations, not a heartbeat": "观察记录，而非实时心跳",
    "Packet freshness, movement, engine state and OBD connection are independent. Projection may be delayed.":
      "数据包新鲜度、行驶状态、发动机状态与 OBD 连接相互独立，数据同步可能存在延迟。",
    "Use the vehicle list to inspect telemetry, maintenance and compliance. Location does not establish a destination or ETA.":
      "请通过车辆列表查看遥测、维护与合规信息。当前位置不代表目的地或预计到达时间。",
    "Fleet vehicle status": "车队车辆状态",
    organizations: "组织",
    observed_vehicles: "已观察车辆",
    active_shifts: "进行中班次",
    active_automatic_journeys: "进行中自动行程",
    open_alerts: "未关闭告警",
    pending_telemetry: "待处理遥测",
    make: "品牌",
    model: "型号",
    freshness: "数据新鲜度",
    occurred_at: "发生时间",

    // Vehicles, telemetry, live OBD & charts
    "Original field": "原始字段",
    "Vehicle Speed": "车速",
    "Engine Speed": "发动机转速",
    "ECU / Control Module Voltage": "ECU / 控制模块电压",
    "ECU Voltage": "ECU 电压",
    "Throttle Position": "节气门位置",
    "Engine Load": "发动机负荷",
    "Coolant Temperature": "冷却液温度",
    "Coolant Temp": "冷却液温度",
    "Intake Air Temperature": "进气温度",
    "Intake Air Temp": "进气温度",
    "Mass Air Flow (MAF)": "空气流量 (MAF)",
    "Mass Air Flow": "空气流量",
    "Fuel Rate": "燃油速率",
    "Fuel Tank Level": "油箱液位",
    "Fuel Level": "油位",
    "Instant Fuel Consumption": "瞬时油耗",
    "IMU Longitudinal Accel (Y)": "IMU 纵向加速度 (Y)",
    "IMU Lateral Accel (X)": "IMU 横向加速度 (X)",
    "Engine Runtime": "发动机运行时长",
    "Latest:": "最新：",
    "Max:": "最高：",
    "Avg:": "平均：",
    pts: "个采样点",
    "{metric} versus observation time, {count} observed samples; gaps are not connected":
      "{metric}随观察时间变化，共 {count} 个样本；缺失区间不连线",
    "Harsh braking": "急刹车",
    "Harsh acceleration": "急加速",
    "Sharp cornering": "急转弯",
    "Route Speed & Harsh Driving Summary": "路线速度与危险驾驶摘要",
    "GPS points": "GPS 定位点",
    "Max speed": "最高速度",
    "Average speed": "平均速度",
    "Harsh Braking & Acceleration Moments": "急刹车与急加速时刻",
    "Occurred at": "发生时间",
    Event: "事件",
    Speed: "速度",
    "Accel (m/s²)": "加速度 (m/s²)",
    Detector: "检测来源",
    Location: "位置",
    "No GPS fix": "无 GPS 定位",
    Map: "地图",
    "Locate danger": "定位危险点",
    "Live OBD-II & Telemetry Metrics": "实时 OBD-II 与遥测指标",
    "OBD:": "OBD：",
    Connected: "已连接",
    Disconnected: "已断开",
    "Engine:": "发动机：",
    Running: "运行中",
    Off: "已熄火",
    "No live OBD-II & telemetry readings received yet.":
      "尚未收到实时 OBD-II 与遥测读数。",
    "Loaded observations": "已加载观察数据",
    "All valid OBD & telemetry charts": "全部有效 OBD 与遥测图表",
    "No usable metric samples in the loaded timeframe.":
      "所选时间范围内暂无可用指标样本。",
    "Chart covers all loaded samples in the selected timeframe. Unknown samples and intervals over {seconds} seconds remain gaps. Use the table for exact values.":
      "图表涵盖所选时间范围内已加载的全部样本。未知样本及超过 {seconds} 秒的间隔将显示为断点。精确数值请查看下方表格。",
    "Export CSV": "导出 CSV",
    Locate: "定位",
    "No fix": "无定位",
    "Fuel is an interval estimate. Missing coverage remains unknown. CO₂ uses organization-configured emission factors (default: 2.31 kg/L petrol, 2.68 kg/L diesel).":
      "油耗为区间估算值，缺失覆盖时段仍标记为未知。CO₂ 采用组织配置的排放系数计算（默认：汽油 2.31 kg/L，柴油 2.68 kg/L）。",
    Overview: "概览",
    "Vehicle identity": "车辆标识",
    "Public device identity": "公开设备标识",
    "Latest observed sample": "最新观察样本",
    "Reported fault presence": "已上报故障状态",
    Telemetry: "遥测",
    "Device & diagnostics": "设备与诊断",
    Mileage: "里程",
    "Mileage is partial and estimated. Unknown usage is not zero. Initial odometer observations anchor the absolute baseline.":
      "里程为部分估算值。未知行驶里程不等于零。初始里程表读数用于锚定绝对基准。",
    "Record initial baseline": "记录初始基准",
    Fuel: "油耗",
    Journeys: "行程",
    Maintenance: "维护",
    Compliance: "合规",
    "Network coverage": "网络覆盖",
    Attachments: "附件",
    "Vehicle details": "车辆详情",
    "Auto-refresh: ON ({refreshSeconds}s = {configuredSeconds}s + 5s)":
      "自动刷新：开启（{refreshSeconds}秒 = {configuredSeconds}秒 + 5秒）",
    "Auto-refresh: OFF (until browser reload)":
      "自动刷新：关闭（直至重新加载浏览器）",
    "Disable auto-refresh": "关闭自动刷新",
    "Enable auto-refresh": "开启自动刷新",
    "Back to vehicles": "返回车辆列表",
    "Edit vehicle": "编辑车辆",
    "Initial odometer baseline": "初始里程基准",
    "Odometer reading (km)": "里程表读数 (km)",
    odo_baseline_km_help:
      "请输入车辆的里程表读数（公里，提交时自动换算为整数米发送给服务器）。",
    "Carry-in distance (km)": "结转已行驶里程 (km)",
    "Public device record": "公开设备记录",
    "Commissioning, activation and installation writes are managed by SaaS staff.":
      "调试、激活与安装写入操作由 SaaS 工作人员管理。",
    position_observed_at: "定位时间",
    latitude: "纬度",
    longitude: "经度",
    engine_rpm: "发动机转速 (RPM)",
    network_data: "网络数据",
    source_format: "源格式",
    ecu_voltage_v: "ECU 电压 (V)",
    throttle_pct: "节气门 (%)",
    engine_load_pct: "发动机负荷 (%)",
    coolant_temp_c: "冷却液温度 (°C)",
    fuel_rate_lph: "燃油速率 (L/h)",
    quality: "质量",
    from_at: "开始时间",
    to_at: "结束时间",
    distance_m: "距离 (km)",
    source: "来源",
    reading_m: "读数 (km)",
    observed_at: "观察时间",
    vehicle_id: "车辆",
    effective_from: "生效时间",
    effective_to: "失效时间",
    closure_reason: "关闭原因",

    // Driving, journeys, safety, appeals, drivers, driver portal
    "Safety score": "安全评分",
    "Score (0–100)": "评分（0–100）",
    Unavailable: "暂不可用",
    "Events included": "计入事件数",
    "Observed speed samples": "已观察速度样本",
    "Eligible speed intervals": "符合条件的速度区间",
    Algorithm: "算法",
    Quality: "质量",
    "Retention window": "数据保留窗口",
    "Approved appeals excluded": "已排除批准的申诉",
    Yes: "是",
    No: "否",
    "Scores use available observed speed intervals within your retention window and exclude approved appeals. Missing intervals or uncalibrated thresholds remain unverified.":
      "评分基于保留窗口内可用的已观察速度区间并排除已批准的申诉。缺失区间或未校准阈值仍属于未验证状态。",
    "Automatic journey — Speed & Harsh Driving Route":
      "自动行程 — 速度与危险驾驶路线",
    "Long journey truncated to the first 5 days of telemetry samples.":
      "长行程已截断为前 5 天的遥测样本。",
    Duration: "时长",
    Distance: "距离",
    "Fuel efficiency": "燃油效率",
    "Avg speed": "平均速度",
    "Telemetry read permission is required to plot the speed-colored route and IMU events.":
      "需要遥测读取权限才能绘制按速度着色的路线及 IMU 事件。",
    "Journey Speed & Danger Map": "行程速度与危险地图",
    "Harsh Braking & Acceleration in This Journey":
      "本次行程中的急刹车与急加速",
    Coordinates: "坐标",
    "{count} server safety event(s) matched the journey timeframe cleanly, but no telemetry GPS samples overlapped.":
      "有 {count} 条服务器安全事件准确匹配该行程时间范围，但没有重叠的遥测 GPS 样本。",
    "No harsh braking or rapid acceleration events detected in this journey.":
      "本次行程未检测到急刹车或急加速事件。",
    "Journey Metadata": "行程元数据",
    "Inspect journey": "查看行程",
    "0 speed Δ (inspect for IMU)": "速度变化为 0（查看 IMU 详情）",
    "Harsh accel": "急加速",
    "Automatic vehicle journeys — inspect speed-colored routes and harsh braking / acceleration events.":
      "车辆自动行程 — 查看按速度着色的路线及急刹车/急加速事件。",
    "No manual start/end controls. Journey distance and fleet driver attribution remain unavailable where not supplied. Click 'Inspect journey' to view the full speed-colored route and IMU + server harsh driving points.":
      "无手动起止控制。未提供的行程里程与驾驶员归属信息仍将显示为不可用。点击“查看行程”可查看完整的速度着色路线及 IMU 与服务器检测到的危险驾驶点。",
    "All journey states": "全部行程状态",
    completed: "已完成",
    incomplete: "未完整",
    "harsh braking": "次急刹车",
    "harsh acceleration": "次急加速",
    "0 speed delta": "0 速度变化",
    "At most 100 journeys in this filter; no cursor endpoint is available.":
      "当前筛选最多显示 100 条行程；暂不支持游标分页。",
    "Review braking and acceleration observations and appeal decisions.":
      "查看刹车和加速观察记录及申诉处理结果。",
    "Driving events are based on captured speed readings. Missing readings may hide events; review the context before drawing conclusions.":
      "驾驶事件基于已采集的速度读数判断。缺失读数可能会遗漏事件；下结论前请结合上下文审阅。",
    Inspect: "查看",
    "Submit appeal": "提交申诉",
    "Review decision": "审核决定",
    "Appeal record": "申诉记录",
    "Safety observation": "安全观察记录",
    "Submit my event appeal": "提交我的事件申诉",
    "Decide appeal": "裁决申诉",
    "Describe why this driving event needs review. You can submit one appeal for each eligible event.":
      "请说明为何需要复核此驾驶事件。每个符合条件的事件只能提交一次申诉。",
    "You cannot review your own appeal. Approval excludes the observation from safety calculations while retaining its history.":
      "您不能审核自己提交的申诉。批准后将从安全评分计算中排除该观察记录，但会保留其历史记录。",
    "Driver details": "驾驶员详情",
    "Profile identity and currently authorized NFC shifts.":
      "个人身份信息与当前已授权的 NFC 班次。",
    "Edit driver": "编辑驾驶员",
    "Profile & private photo": "资料与私密照片",
    "NFC shifts": "NFC 班次",
    "NFC device authorization creates shifts. Web sign-out does not end a physical shift.":
      "班次由 NFC 设备授权创建。网页端退出登录不会结束实体班次。",
    "Inspect shift": "查看班次",
    "Administrative close": "管理员关闭",
    "Safety score & events": "安全评分与事件",
    "Driver safety score": "驾驶员安全评分",
    "NFC credentials": "NFC 凭证",
    "Enrol the SHA-256 fingerprint, not the raw NFC card number. Keep the returned credential reference to revoke that credential later.":
      "请注册 SHA-256 指纹，而非原始 NFC 卡号。请妥善保管返回的凭证参考号以便日后吊销。",
    "Enrol NFC fingerprint": "注册 NFC 指纹",
    "Known enrolled credential UUID": "已知已注册凭证 UUID",
    "Revoke known credential": "吊销已知凭证",
    "64 hexadecimal SHA-256 fingerprint only, not a raw NFC UID.":
      "仅限 64 位十六进制 SHA-256 指纹，请勿输入原始 NFC UID。",
    "Driver shift": "驾驶员班次",
    "Administratively close shift": "管理员关闭班次",
    "Current driver assignments": "当前驾驶员分配",
    "Locations require currently accepted active NFC shifts; old observations are not live GPS.":
      "位置显示需要当前已接受的有效 NFC 班次；历史观察记录并非实时 GPS。",
    "Active shift coordinates": "当前班次坐标",
    "Private photo": "私密照片",
    "Direct S3 photo links last at most 5 minutes. Do not share: anyone holding a link can use it until expiry or object deletion, even after app access is revoked.":
      "S3 照片直链有效期最长 5 分钟。切勿分享：即使应用权限被撤销，任何持有链接的人在过期或对象删除前均可访问。",
    "Legacy photo requires an authorized reupload. The original private file is preserved.":
      "旧版照片需要经过授权后重新上传。原始私密文件仍保留。",
    "Private driver photograph": "驾驶员私密照片",
    "Clear photo": "清除照片",
    "Request authorized photo": "请求授权照片",
    "Only your retained, server-authorized safety score. Approved appeals are excluded.":
      "仅显示您的保留期内、经服务器授权的安全评分。已批准的申诉不计入评分。",
    "My safety score": "我的安全评分",
    "Safety scores are currently unavailable on your organization’s plan. You can still review your driving records and trips.":
      "您所在组织的当前套餐暂不提供安全评分功能。您仍可查看自己的驾驶记录和行程。",
    "Only your retained, server-authorized driving data. No other driver’s trace or shared journey bounds.":
      "仅显示您个人在保留期内且经服务器授权的驾驶数据，不包含其他驾驶员轨迹或共享行程边界。",
    "Own driver profile": "本人驾驶员资料",
    "My current safety score": "我当前的安全评分",
    "Currently NFC-authorized vehicle": "当前 NFC 授权车辆",
    "Trips are your observed intersections with automatic journeys, not whole shared-vehicle routes or paid fares.":
      "个人行程为您与自动行程重合的已观察区间，而非共享车辆的完整路线或付费行程。",
    "Records are limited to your accepted NFC attribution and purchased retention.":
      "记录仅限于您已接受的 NFC 归属时段及所购数据保留期限。",
    "Outside an active authorized shift, no current vehicle is expected. We do not fall back to your last shared vehicle.":
      "在有效授权班次之外不会显示当前车辆，系统也不会回退显示您上次使用的共享车辆。",
    "Own fuel and efficiency use aligned covered intervals only, not the entire vehicle total. Estimated CO₂ uses organization emission factors.":
      "个人油耗与能效仅统计已对齐的覆盖区间，而非整车总计。估算 CO₂ 使用组织配置的排放系数。",
    event_id: "事件 ID",
    driver_id: "驾驶员",
    decision_reason: "决定原因",
    created_at: "创建时间",
    kind: "类型",
    state: "状态",
    delta_speed_kmh: "速度变化 (km/h)",
    acceleration_ms2: "加速度 (m/s²)",
    decision: "决定",
    started_at: "开始时间",
    ended_at: "结束时间",
    attribution_expires_at: "归属过期时间",
    last_observed_at: "最后观察时间",
    unknown_seconds: "未知秒数",
    distance_quality: "里程质量",
    fuel_efficiency: "燃油效率 (L/100km / km/L)",
    fuel_litres: "耗油量 (L)",
    fuel_efficiency_l_per_100km: "百公里油耗 (L/100km)",
    fuel_efficiency_km_per_l: "燃油经济性 (km/L)",
    credential_fingerprint: "凭证指纹",
    credential_type: "凭证类型",
    nfc_uid_sha256: "NFC UID (SHA-256)",
    expires_at: "过期时间",
    first_own_observation_at: "本人首次观察时间",
    last_own_observation_at: "本人最后观察时间",

    // Diagnostics
    "Command status": "指令状态",
    "Queued/running/completed are command metadata, not a stored diagnostic report, hardware certification or proof of AI success. Automatic checking stops after six minutes.":
      "排队中/执行中/已完成仅代表指令状态元数据，并非已保存的诊断报告、硬件认证或 AI 诊断成功证明。自动轮询将在六分钟后停止。",
    "Push device configuration": "推送设备配置",
    "Queue current organization settings (telemetry_interval_seconds, safety & cellular plan gates, and MAF assumptions) to the installed Pi device? Settings apply only after the device acknowledges the command.":
      "确定将当前组织设置（telemetry_interval_seconds、安全与蜂窝套餐开关及 MAF 参数）下发至已安装的树莓派设备吗？设备确认指令后设置才会生效。",
    "Read-only diagnostics": "只读诊断",
    "Extended Read-Only DUDU2 DTC Scan": "DUDU2 扩展只读故障码扫描",
    "DUDU2 OBD extended DTC method (read-only)":
      "DUDU2 OBD 扩展故障码读取方法（只读）",
    "Runs functional OBD-II plus ECU (7E0/7E8), TCM (7E1/7E9), and K-line/CAN read-only queries; no DTC codes are stored on CarLink. Only runs when vehicle OBD speed is 0 km/h, and OBD2 telemetry data will be interrupted for 2–5 minutes during scan execution.":
      "执行标准 OBD-II 及 ECU (7E0/7E8)、TCM (7E1/7E9) 与 K-line/CAN 只读查询；CarLink 不会保存故障码。仅当车辆 OBD 车速为 0 km/h 时可执行，扫描期间 OBD2 遥测数据将中断 2–5 分钟。",
    "Vehicle must be stationary at 0 km/h": "车辆必须处于静止状态（0 km/h）",
    "Current observed OBD speed is {speed} km/h. Park the vehicle and wait for a fresh 0 km/h reading before requesting an extended scan.":
      "当前观察到的 OBD 车速为 {speed} km/j，请停稳车辆并等待最新的 0 km/h 读数后再请求扩展扫描。",
    "No current OBD speed sample is observed. A fresh 0 km/h reading is required before requesting an extended scan.":
      "暂未观察到当前 OBD 车速样本。请求扩展扫描前需要最新的 0 km/h 读数。",
    "I confirm the vehicle is parked at 0 km/h and understand OBD2 data will be interrupted for 2–5 minutes":
      "我确认车辆已停稳在 0 km/h，并知晓扫描期间 OBD2 数据将中断 2–5 分钟",
    "Run extended DTC scan": "运行扩展故障码扫描",
    "Push organization settings to installed Pi device":
      "向已安装的树莓派设备推送组织设置",
    "Queues signed configuration containing telemetry_interval_seconds, safety and cellular plan gates, and MAF assumptions. The device must acknowledge the command before settings take effect.":
      "将包含 telemetry_interval_seconds、安全与蜂窝套餐开关及 MAF 参数的签名配置加入下发队列。设备确认指令后配置才会生效。",
    "Fault code explanation": "故障码解释",
    "The entered code is sent securely to Google for an AI explanation. This is not a verified diagnosis and is not saved by CarLink.":
      "输入的故障码将安全发送至 Google 获取 AI 解释。该结果并非经验证的诊断结论，CarLink 也不会保存。",
    "DTC code": "DTC 故障码",
    "Please enter a DTC code.": "请输入 DTC 故障码。",
    "Enter a normalized code, for example P0730.":
      "请输入标准格式故障码，例如 P0730。",
    "e.g. P0730": "例如 P0730",
    "Explain once": "单次解释",
    "Clear explanation": "清除解释",
    "AI Hints": "AI 提示",
    "Powered by Google Gemini": "由 Google Gemini 提供支持",
    "AI Hints · Powered by Google Gemini":
      "AI 提示 · 由 Google Gemini 提供支持",
    "Advisory only — generated by Google Gemini and not stored by CarLink.":
      "仅供参考 — 由 Google Gemini 生成，CarLink 不会保存。",
    obd_speed_kmh: "OBD 车速 (km/h)",
    installed_device_status: "已安装设备状态",
    command_id: "指令 ID",

    // Analytics (Coverage, Reports, Logs)
    Good: "良好",
    Fair: "一般",
    Weak: "较弱",
    "Invalid CSV response": "无效的 CSV 响应",
    "Raw RSRP/SINR and operator observations — not a calibrated radio survey.":
      "原始 RSRP/SINR 与运营商观察数据 — 并非经校准的无线电测试。",
    "Export server CSV": "导出服务器 CSV",
    "Missing GPS or packets are not dead zones. RSRP is dBm, SINR is dB; sample alignment is unverified. CSV is limited to 10,000 samples and a 24-hour window.":
      "GPS 或数据包缺失不代表信号盲区。RSRP 单位为 dBm，SINR 单位为 dB；样本对齐未经验证。CSV 导出上限为 10,000 条样本及 24 小时时间窗口。",
    "Loaded observation coordinates": "已加载的观察坐标",
    "Sort order": "排序方式",
    "Sort: Newest first": "排序：最新优先",
    "Sort: Oldest first": "排序：最早优先",
    Vehicle: "车辆",
    Operator: "运营商",
    "Network type": "网络类型",
    "Signal quality": "信号质量",
    "RSRP (dBm)": "RSRP (dBm)",
    "SINR (dB)": "SINR (dB)",
    Latitude: "纬度",
    Longitude: "经度",
    "{count} total in timeframe": "时间范围内共 {count} 条",
    "Reached 50-page cap (10,000 rows); narrow the timeframe to see all observations.":
      "已达到 50 页上限（10,000 行）；请缩小时间范围以查看全部观察数据。",
    Updated: "更新时间",
    "Organization activity and subscription summary.": "组织活动与订阅摘要。",
    "Global request metadata without tenant business association.":
      "不包含租户业务关联的全局请求元数据。",
    "Permissioned request and action responsibility records.":
      "带权限控制的请求与操作责任记录。",
    "No request-body viewer. Credentials, DTC explanations, file signatures and payment callbacks must stay out of logs.":
      "不提供请求体查看器。凭证、故障码解释、文件签名与支付回调内容均不得记入日志。",
    "HTTP requests": "HTTP 请求",
    "Action audit": "操作审计",
    request_id: "请求 ID",
    method: "请求方法",
    route_template: "路由模板",
    duration_ms: "耗时 (ms)",
    actor_user_id: "操作用户 ID",
    action: "操作",
    outcome: "结果",

    // Registry
    "Driver profile email is separate from the sign-in mailbox.":
      "驾驶员资料邮箱与登录账号邮箱相互独立。",
    "Choose an active eligible driver membership. Primary role must be driver; the server checks eligibility.":
      "请选择有效且符合资格的驾驶员成员。主角色必须为驾驶员；服务器会校验资格。",
    "Fleet identity, pending installations and vehicle records.":
      "车队标识、待安装设备及车辆记录。",
    "Registered drivers, linked accounts and accepted NFC attribution.":
      "已注册驾驶员、关联账号及已接受的 NFC 归属。",
    "Public device identity. Managed installation is reserved for SaaS technicians.":
      "公开设备标识。受管安装操作仅限 SaaS 技术人员执行。",
    "Vehicle registration automatically creates a pending device. Contact SaaS staff for activation or relinking.":
      "注册车辆会自动创建待处理设备。如需激活或重新绑定，请联系 SaaS 工作人员。",
    Archive: "归档",
    "Archive this vehicle? The server checks active installations and other operational restrictions.":
      "确定归档此车辆吗？服务器会检查活跃安装及其他运营限制。",
    "Register vehicle": "注册车辆",
    "Register driver": "注册驾驶员",
    "A new vehicle receives a pending device automatically. Unknown odometer mileage is not zero.":
      "新车辆会自动获配待处理设备。未知里程数不代表零。",
    "Suspending a driver closes current server-authorized shifts. Linking a human account requires an eligible active driver membership.":
      "暂停驾驶员会关闭当前服务器授权的班次。关联个人账号需要有效且符合条件的驾驶员成员资格。",
    registration_country: "注册国家/地区",
    model_year: "年份",
    fuel_type: "燃料类型",
    passenger_capacity: "核载人数",
    seats: "座",
    petrol: "汽油",
    diesel: "柴油",
    hybrid: "混合动力",
    electric: "纯电动",
    other: "其他",
    maintenance: "维护中",
    employee_code: "工号",
    phone: "电话",
    user_id: "用户 ID",
    registered_vehicle_id: "已注册车辆",

    // NFC card enrollment & credentials
    "Link Driver NFC ID": "绑定驾驶员 NFC ID",
    "Link NFC ID": "绑定 NFC ID",
    "NFC card already linked": "该 NFC 卡已绑定",
    "This NFC card is already active for a driver in this organization, or this driver is not active. Revoke the existing credential first or tap a different card.":
      "此 NFC 卡已在本组织中为某位驾驶员激活，或当前驾驶员未处于激活状态。请先吊销现有凭证或刷另一张卡。",
    "Card ISO UID unavailable": "无法获取卡片 ISO UID",
    "This NFC tag did not expose an ISO UID. The card must expose a readable ISO 14443 serial number.":
      "此 NFC 标签未公开 ISO UID。卡片必须支持读取 ISO 14443 序列号。",
    "Invalid NFC card UID": "无效的 NFC 卡 UID",
    "The scanned NFC card UID format could not be normalized. Ensure the card exposes a standard 4 to 10 byte ISO UID and try again.":
      "无法规范化扫描到的 NFC 卡 UID 格式。请确认卡片使用标准的 4 至 10 字节 ISO UID 后重试。",
    "Unable to read NFC card": "无法读取 NFC 卡",
    "Could not read the NFC card. Hold the card steady against the back of your Android phone and try again.":
      "读取 NFC 卡失败。请将卡片贴稳在 Android 手机背面后重试。",
    "NFC permission denied": "NFC 权限被拒绝",
    "Allow NFC permission in Android Chrome site settings and try again.":
      "请在 Android Chrome 网站设置中允许 NFC 权限后重试。",
    "NFC is turned off or unsupported": "NFC 未开启或不受支持",
    "Enable NFC in your Android device settings and ensure you are using Android Chrome over HTTPS.":
      "请在 Android 设备设置中开启 NFC，并确保通过 HTTPS 使用 Android Chrome 浏览器。",
    "NFC scan failed": "NFC 扫描失败",
    "Check that NFC is enabled on your Android device and try again.":
      "请检查您的 Android 设备是否已开启 NFC，然后重试。",
    "Hold the NFC card flat against the back of your phone…":
      "请将 NFC 卡平贴在手机背面…",
    "Fingerprint computed locally — linking to driver…":
      "已在本地计算指纹 — 正在绑定到驾驶员…",
    "NFC card linked to driver": "NFC 卡已绑定到驾驶员",
    "Scan or linking did not complete": "扫描或绑定未完成",
    "Tap Scan NFC card, then hold the card against the reader":
      "点击“扫描 NFC 卡”，然后将卡片贴近手机感应区",
    "Tap-to-scan requires Android Chrome over HTTPS":
      "贴卡扫描需要通过 HTTPS 使用 Android Chrome",
    "Driver NFC card linked": "驾驶员 NFC 卡已成功绑定",
    "Keep the credential reference below to revoke or audit this card later.":
      "请保留下方凭证参考 ID，以便日后吊销或审计该卡片。",
    "Link another card": "绑定另一张卡",
    Done: "完成",
    "Credential reference ID": "凭证参考 ID",
    "Only the SHA-256 digest of the NFC UID bytes is sent to CarLink. The raw card UID is never stored or logged.":
      "仅会向 CarLink 发送 NFC UID 字节的 SHA-256 摘要，原始卡号 UID 不会被存储或记录。",
    "Web NFC unavailable in this browser": "当前浏览器不支持 Web NFC",
    "Tap-to-scan requires Android Chrome over HTTPS. Use an Android phone or expand the manual SHA-256 fingerprint entry below.":
      "贴卡扫描需要通过 HTTPS 使用 Android Chrome。请改用 Android 手机，或展开下方的手动输入 SHA-256 指纹。",
    Retry: "重试",
    "Optional expiry date & time": "可选过期日期与时间",
    "No expiry (optional)": "无过期时间（可选）",
    "Stop scanning": "停止扫描",
    "Retry NFC scan": "重新扫描 NFC",
    "Scan NFC card": "扫描 NFC 卡",
    "Manual SHA-256 fingerprint entry": "手动输入 SHA-256 指纹",
    "64-character SHA-256 hex digest": "64 位 SHA-256 十六进制摘要",
    "Link fingerprint": "绑定指纹",
    Assurance: "可信等级",
    "Issued at": "签发时间",
    "No expiry": "永不过期",
    Active: "有效",
    Revoked: "已吊销",
    Expired: "已过期",
    Revoke: "吊销",
    "Revoke this NFC credential? Active shifts using this card will be closed by the server.":
      "确定吊销此 NFC 凭证吗？使用该卡的进行中班次将被服务器关闭。",

    // Active driver-vehicle sessions
    current_driver_name: "当前驾驶员",
    current_driver_id: "当前驾驶员 ID",
    current_vehicle_registration: "当前车辆",
    current_vehicle_id: "当前车辆 ID",
    current_vehicle_make: "当前车辆品牌",
    current_vehicle_model: "当前车辆型号",
    current_shift_started_at: "当前班次开始时间",
    current_shift_expires_at: "当前班次过期时间",
    registration_number: "车牌号",
    "Current driver": "当前驾驶员",
    "Current driver session": "当前驾驶员会话",
    "Current vehicle session": "当前车辆会话",
    "Driver: {name}": "驾驶员：{name}",
    "No active driver": "暂无当前驾驶员",
    "No active driver shift on this vehicle. Tap an enrolled NFC card on the in-vehicle reader to start a driver session.":
      "此车辆当前没有进行中的驾驶员班次。请在车载读卡器上轻触已注册的 NFC 卡以开始驾驶员会话。",
    "No active vehicle shift for this driver. Tap an enrolled NFC card on a vehicle reader to start a shift.":
      "此驾驶员当前没有进行中的车辆班次。请在车辆读卡器上轻触已注册的 NFC 卡以开始班次。",
    Driver: "驾驶员",
    Driving: "驾驶中",
    "Off shift": "未在班次中",
    "Open driver": "打开驾驶员",
    "Open vehicle": "打开车辆",
    "Last authenticated": "最后验证时间",
    "Make / model": "品牌 / 型号",
    "Current assignments": "当前驾驶员分配",
    assignments: "当前驾驶员分配",
    "Locations require currently authorized NFC shifts; old observations are not live GPS.":
      "位置需基于当前已授权的活动 NFC 班次；历史观测数据并非实时 GPS。",
  },
  ta: {
    // Overview & platform summary
    "Current platform counts and confirmed paid-invoice totals.":
      "தற்போதைய தள எண்ணிக்கைகள் மற்றும் உறுதிப்படுத்தப்பட்ட கட்டண விலைப்பட்டியல் மொத்தம்.",
    "Last-known fleet observations and today’s operational context.":
      "கடைசியாக அறியப்பட்ட வாகனக் கண்காணிப்புகள் மற்றும் இன்றைய செயல்பாட்டுச் சூழல்.",
    "Paid invoice total": "செலுத்தப்பட்ட விலைப்பட்டியல் மொத்தம்",
    "As of": "நிலவரப்படி",
    "Automatic journeys are not passenger fares.":
      "தானியங்கி பயணங்கள் பயணிகள் கட்டண சவாரிகள் அல்ல.",
    "Fleet coordinates": "வாகனத் தொகுப்பு ஆயத்தொலைவுகள்",
    "Auto-refresh every {seconds}s (threshold + 5s)":
      "ஒவ்வொரு {seconds} வினாடிக்கும் தானியங்கி புதுப்பிப்பு (வரம்பு + 5 வி)",
    "Operational context": "செயல்பாட்டுச் சூழல்",
    "Observations, not a heartbeat": "கண்காணிப்புகள் மட்டுமே, இதயத்துடிப்பு அல்ல",
    "Packet freshness, movement, engine state and OBD connection are independent. Projection may be delayed.":
      "தரவுப் பொதியின் புதுமை, இயக்கம், எஞ்சின் நிலை மற்றும் OBD இணைப்பு ஆகியவை தனித்தனியானவை. காட்சிப்படுத்தல் தாமதமாகலாம்.",
    "Use the vehicle list to inspect telemetry, maintenance and compliance. Location does not establish a destination or ETA.":
      "டெலிமெட்ரி, பராமரிப்பு மற்றும் இணக்கத்தை ஆய்வு செய்ய வாகனப் பட்டியலைப் பயன்படுத்தவும். இடம் என்பது சேருமிடத்தையோ ETA-வையோ குறிக்காது.",
    "Fleet vehicle status": "வாகனத் தொகுப்பு நிலை",
    organizations: "நிறுவனங்கள்",
    observed_vehicles: "கண்காணிக்கப்பட்ட வாகனங்கள்",
    active_shifts: "செயலில் உள்ள ஷிப்டுகள்",
    active_automatic_journeys: "செயலில் உள்ள தானியங்கி பயணங்கள்",
    open_alerts: "திறந்த எச்சரிக்கைகள்",
    pending_telemetry: "நிலுவையிலுள்ள டெலிமெட்ரி",
    make: "தயாரிப்பு நிறுவனம்",
    model: "மாடல்",
    freshness: "தரவுப் புதுமை",
    occurred_at: "நடந்த நேரம்",

    // Vehicles, telemetry, live OBD & charts
    "Original field": "அசல் புலம்",
    "Vehicle Speed": "வாகன வேகம்",
    "Engine Speed": "எஞ்சின் வேகம்",
    "ECU / Control Module Voltage": "ECU / கட்டுப்பாட்டு தொகுதி மின்னழுத்தம்",
    "ECU Voltage": "ECU மின்னழுத்தம்",
    "Throttle Position": "த்ராட்டில் நிலை",
    "Engine Load": "எஞ்சின் சுமை",
    "Coolant Temperature": "குளிரூட்டி வெப்பநிலை",
    "Coolant Temp": "குளிரூட்டி வெப்பம்",
    "Intake Air Temperature": "உள்வரும் காற்று வெப்பநிலை",
    "Intake Air Temp": "உள்வரும் காற்று வெப்பம்",
    "Mass Air Flow (MAF)": "நிறை காற்றோட்டம் (MAF)",
    "Mass Air Flow": "நிறை காற்றோட்டம்",
    "Fuel Rate": "எரிபொருள் விகிதம்",
    "Fuel Tank Level": "எரிபொருள் தொட்டி அளவு",
    "Fuel Level": "எரிபொருள் அளவு",
    "Instant Fuel Consumption": "உடனடி எரிபொருள் நுகர்வு",
    "IMU Longitudinal Accel (Y)": "IMU நீளவாக்கு முடுக்கம் (Y)",
    "IMU Lateral Accel (X)": "IMU பக்கவாட்டு முடுக்கம் (X)",
    "Engine Runtime": "எஞ்சின் இயங்கிய நேரம்",
    "Latest:": "சமீபத்தியது:",
    "Max:": "அதிகபட்சம்:",
    "Avg:": "சராசரி:",
    pts: "புள்ளிகள்",
    "{metric} versus observation time, {count} observed samples; gaps are not connected":
      "கண்காணிப்பு நேரத்திற்கு எதிரான {metric}, {count} மாதிரிகள்; இடைவெளிகள் இணைக்கப்படவில்லை",
    "Harsh braking": "கடுமையான பிரேக்",
    "Harsh acceleration": "கடுமையான முடுக்கம்",
    "Sharp cornering": "கூர்மையான திருப்பம்",
    "Route Speed & Harsh Driving Summary":
      "வழித்தட வேகம் & கடுமையான ஓட்டுநர் சுருக்கம்",
    "GPS points": "GPS புள்ளிகள்",
    "Max speed": "அதிகபட்ச வேகம்",
    "Average speed": "சராசரி வேகம்",
    "Harsh Braking & Acceleration Moments": "கடுமையான பிரேக் & முடுக்கம் தருணங்கள்",
    "Occurred at": "நடந்த நேரம்",
    Event: "நிகழ்வு",
    Speed: "வேகம்",
    "Accel (m/s²)": "முடுக்கம் (m/s²)",
    Detector: "கண்டறிவான்",
    Location: "இடம்",
    "No GPS fix": "GPS சிக்னல் இல்லை",
    Map: "வரைபடம்",
    "Locate danger": "ஆபத்தைக் காட்டு",
    "Live OBD-II & Telemetry Metrics": "நேரலை OBD-II & டெலிமெட்ரி அளவீடுகள்",
    "OBD:": "OBD:",
    Connected: "இணைக்கப்பட்டது",
    Disconnected: "துண்டிக்கப்பட்டது",
    "Engine:": "எஞ்சின்:",
    Running: "இயங்குகிறது",
    Off: "நிறுத்தப்பட்டது",
    "No live OBD-II & telemetry readings received yet.":
      "நேரலை OBD-II & டெலிமெட்ரி அளவீடுகள் இன்னும் பெறப்படவில்லை.",
    "Loaded observations": "ஏற்றப்பட்ட கண்காணிப்புகள்",
    "All valid OBD & telemetry charts":
      "அனைத்து சரியான OBD & டெலிமெட்ரி வரைபடங்கள்",
    "No usable metric samples in the loaded timeframe.":
      "ஏற்றப்பட்ட கால அளவில் பயன்படுத்தக்கூடிய அளவீட்டு மாதிரிகள் இல்லை.",
    "Chart covers all loaded samples in the selected timeframe. Unknown samples and intervals over {seconds} seconds remain gaps. Use the table for exact values.":
      "தேர்ந்தெடுக்கப்பட்ட கால அளவில் ஏற்றப்பட்ட அனைத்து மாதிரிகளையும் வரைபடம் காட்டுகிறது. அறியப்படாத மாதிரிகள் மற்றும் {seconds} வினாடிகளுக்கு மேற்பட்ட இடைவெளிகள் இடைவெளியாகவே இருக்கும். துல்லியமான மதிப்புகளுக்கு அட்டவணையைப் பார்க்கவும்.",
    "Export CSV": "CSV ஏற்றுமதி",
    Locate: "இடம் காட்டு",
    "No fix": "இடம் இல்லை",
    "Fuel is an interval estimate. Missing coverage remains unknown. CO₂ uses organization-configured emission factors (default: 2.31 kg/L petrol, 2.68 kg/L diesel).":
      "எரிபொருள் என்பது இடைவெளி மதிப்பீடு மட்டுமே; விடுபட்ட பகுதிகள் அறியப்படாதவையாகும். CO₂ நிறுவனம் அமைத்த உமிழ்வு காரணிகளைப் பயன்படுத்துகிறது (இயல்புநிலை: பெட்ரோல் 2.31 kg/L, டீசல் 2.68 kg/L).",
    Overview: "மேலோட்டம்",
    "Vehicle identity": "வாகன அடையாளம்",
    "Public device identity": "பொது சாதன அடையாளம்",
    "Latest observed sample": "சமீபத்திய கண்காணிப்பு மாதிரி",
    "Reported fault presence": "அறிவிக்கப்பட்ட கோளாறு நிலை",
    Telemetry: "டெலிமெட்ரி",
    "Device & diagnostics": "சாதனம் & கண்டறிதல்",
    Mileage: "மைலேஜ்",
    "Mileage is partial and estimated. Unknown usage is not zero. Initial odometer observations anchor the absolute baseline.":
      "மைலேஜ் பகுதியளவானது மற்றும் மதிப்பீடாகும். அறியப்படாத பயன்பாடு பூஜ்ஜியம் அல்ல. ஆரம்ப ஓடோமீட்டர் பதிவுகள் அடிப்படை அளவை நிர்ணயிக்கின்றன.",
    "Record initial baseline": "ஆரம்ப அடிப்படை அளவைப் பதிவுசெய்",
    Fuel: "எரிபொருள்",
    Journeys: "பயணங்கள்",
    Maintenance: "பராமரிப்பு",
    Compliance: "இணக்கம்",
    "Network coverage": "நெட்வொர்க் கவரேஜ்",
    Attachments: "இணைப்புகள்",
    "Vehicle details": "வாகன விவரங்கள்",
    "Auto-refresh: ON ({refreshSeconds}s = {configuredSeconds}s + 5s)":
      "தானியங்கி புதுப்பிப்பு: இயக்கத்தில் ({refreshSeconds}வி = {configuredSeconds}வி + 5வி)",
    "Auto-refresh: OFF (until browser reload)":
      "தானியங்கி புதுப்பிப்பு: நிறுத்தப்பட்டது (உலாவியைப் புதுப்பிக்கும் வரை)",
    "Disable auto-refresh": "தானியங்கி புதுப்பிப்பை நிறுத்து",
    "Enable auto-refresh": "தானியங்கி புதுப்பிப்பை இயக்கு",
    "Back to vehicles": "வாகனங்களுக்குத் திரும்பு",
    "Edit vehicle": "வாகனத்தைத் திருத்து",
    "Initial odometer baseline": "ஆரம்ப ஓடோமீட்டர் அடிப்படை",
    "Odometer reading (km)": "ஓடோமீட்டர் அளவு (km)",
    odo_baseline_km_help:
      "வாகனத்தின் ஓடோமீட்டர் அளவை கிலோமீட்டரில் உள்ளிடவும் (சேவையகத்திற்கு தானாக முழு மீட்டராக மாற்றப்படும்).",
    "Carry-in distance (km)": "முன் தொடர் தூரம் (km)",
    "Public device record": "பொது சாதனப் பதிவு",
    "Commissioning, activation and installation writes are managed by SaaS staff.":
      "இயக்கத் தொடக்கம், செயலாக்கம் மற்றும் நிறுவல் பதிவுகள் SaaS பணியாளர்களால் நிர்வகிக்கப்படுகின்றன.",
    position_observed_at: "நிலை கண்காணிக்கப்பட்ட நேரம்",
    latitude: "அட்சரேகை",
    longitude: "தீர்க்கரேகை",
    engine_rpm: "எஞ்சின் RPM",
    network_data: "நெட்வொர்க் தரவு",
    source_format: "மூல வடிவம்",
    ecu_voltage_v: "ECU மின்னழுத்தம் (V)",
    throttle_pct: "த்ராட்டில் (%)",
    engine_load_pct: "எஞ்சின் சுமை (%)",
    coolant_temp_c: "குளிரூட்டி வெப்பம் (°C)",
    fuel_rate_lph: "எரிபொருள் விகிதம் (L/h)",
    quality: "தரம்",
    from_at: "தொடக்கம்",
    to_at: "முடிவு",
    distance_m: "தூரம் (km)",
    source: "மூலம்",
    reading_m: "அளவீடு (km)",
    observed_at: "கண்காணிக்கப்பட்ட நேரம்",
    vehicle_id: "வாகனம்",
    effective_from: "நடைமுறைத் தொடக்கம்",
    effective_to: "நடைமுறை முடிவு",
    closure_reason: "மூடுவதற்கான காரணம்",

    // Driving, journeys, safety, appeals, drivers, driver portal
    "Safety score": "பாதுகாப்பு மதிப்பெண்",
    "Score (0–100)": "மதிப்பெண் (0–100)",
    Unavailable: "கிடைக்கவில்லை",
    "Events included": "சேர்க்கப்பட்ட நிகழ்வுகள்",
    "Observed speed samples": "கண்காணிக்கப்பட்ட வேக மாதிரிகள்",
    "Eligible speed intervals": "தகுதியான வேக இடைவெளிகள்",
    Algorithm: "வழிமுறை",
    Quality: "தரம்",
    "Retention window": "தரவுத் தக்கவைப்பு காலம்",
    "Approved appeals excluded": "ஏற்கப்பட்ட மேல்முறையீடுகள் விலக்கப்பட்டுள்ளன",
    Yes: "ஆம்",
    No: "இல்லை",
    "Scores use available observed speed intervals within your retention window and exclude approved appeals. Missing intervals or uncalibrated thresholds remain unverified.":
      "மதிப்பெண்கள் உங்கள் தக்கவைப்பு காலத்திற்குள் உள்ள வேக இடைவெளிகளைப் பயன்படுத்துகின்றன மற்றும் ஏற்கப்பட்ட மேல்முறையீடுகளை விலக்குகின்றன. விடுபட்ட இடைவெளிகள் அல்லது அளவீடு செய்யப்படாத வரம்புகள் சரிபார்க்கப்படாதவையாகும்.",
    "Automatic journey — Speed & Harsh Driving Route":
      "தானியங்கி பயணம் — வேகம் & கடுமையான ஓட்டுநர் வழித்தடம்",
    "Long journey truncated to the first 5 days of telemetry samples.":
      "நீண்ட பயணம் முதல் 5 நாட்கள் டெலிமெட்ரி மாதிரிகளாகச் சுருக்கப்பட்டுள்ளது.",
    Duration: "கால அளவு",
    Distance: "தூரம்",
    "Fuel efficiency": "எரிபொருள் திறன்",
    "Avg speed": "சராசரி வேகம்",
    "Telemetry read permission is required to plot the speed-colored route and IMU events.":
      "வேக-நிற வழித்தடம் மற்றும் IMU நிகழ்வுகளை வரைய டெலிமெட்ரி வாசிப்பு அனுமதி தேவை.",
    "Journey Speed & Danger Map": "பயண வேகம் & ஆபத்து வரைபடம்",
    "Harsh Braking & Acceleration in This Journey":
      "இந்தப் பயணத்தில் கடுமையான பிரேக் & முடுக்கம்",
    Coordinates: "ஆயத்தொலைவுகள்",
    "{count} server safety event(s) matched the journey timeframe cleanly, but no telemetry GPS samples overlapped.":
      "{count} சேவையகப் பாதுகாப்பு நிகழ்வு(கள்) பயண நேரத்துடன் பொருந்தின, ஆனால் டெலிமெட்ரி GPS மாதிரிகள் ஒன்றுடன் ஒன்று பொருந்தவில்லை.",
    "No harsh braking or rapid acceleration events detected in this journey.":
      "இந்தப் பயணத்தில் கடுமையான பிரேக் அல்லது விரைவான முடுக்கம் எதுவும் கண்டறியப்படவில்லை.",
    "Journey Metadata": "பயண மெட்டாடேட்டா",
    "Inspect journey": "பயணத்தை ஆய்வு செய்",
    "0 speed Δ (inspect for IMU)": "0 வேக Δ (IMU-க்கு ஆய்வு செய்)",
    "Harsh accel": "கடுமையான முடுக்கம்",
    "Automatic vehicle journeys — inspect speed-colored routes and harsh braking / acceleration events.":
      "தானியங்கி வாகனப் பயணங்கள் — வேக-நிற வழித்தடங்கள் மற்றும் கடுமையான பிரேக் / முடுக்கம் நிகழ்வுகளை ஆய்வு செய்யவும்.",
    "No manual start/end controls. Journey distance and fleet driver attribution remain unavailable where not supplied. Click 'Inspect journey' to view the full speed-colored route and IMU + server harsh driving points.":
      "கைமுறை தொடக்க/நிறுத்தக் கட்டுப்பாடுகள் இல்லை. வழங்கப்படாத இடங்களில் பயணத் தூரம் மற்றும் ஓட்டுநர் இணைப்பு கிடைக்காது. முழு வேக-நிற வழித்தடம் மற்றும் IMU + சேவையக கடுமையான ஓட்டுநர் புள்ளிகளைப் பார்க்க 'பயணத்தை ஆய்வு செய்' என்பதைக் கிளிக் செய்யவும்.",
    "All journey states": "அனைத்து பயண நிலைகள்",
    completed: "நிறைவடைந்தது",
    incomplete: "முழுமையடையாதது",
    "harsh braking": "கடுமையான பிரேக்",
    "harsh acceleration": "கடுமையான முடுக்கம்",
    "0 speed delta": "0 வேக மாற்றம்",
    "At most 100 journeys in this filter; no cursor endpoint is available.":
      "இந்த வடிகட்டியில் அதிகபட்சம் 100 பயணங்கள்; கர்சர் முனையம் கிடைக்கவில்லை.",
    "Review braking and acceleration observations and appeal decisions.":
      "பிரேக் மற்றும் முடுக்கம் கண்காணிப்புகள் மற்றும் மேல்முறையீட்டு முடிவுகளை மதிப்பாய்வு செய்யவும்.",
    "Driving events are based on captured speed readings. Missing readings may hide events; review the context before drawing conclusions.":
      "ஓட்டுநர் நிகழ்வுகள் பதிவுசெய்யப்பட்ட வேக அளவீடுகளின் அடிப்படையில் அமைந்தவை. விடுபட்ட அளவீடுகள் நிகழ்வுகளை மறைக்கலாம்; முடிவுக்கு முன் சூழலைச் சரிபார்க்கவும்.",
    Inspect: "ஆய்வு செய்",
    "Submit appeal": "மேல்முறையீடு சமர்ப்பி",
    "Review decision": "முடிவை மதிப்பாய்வு செய்",
    "Appeal record": "மேல்முறையீட்டுப் பதிவு",
    "Safety observation": "பாதுகாப்பு கண்காணிப்பு",
    "Submit my event appeal": "எனது நிகழ்வு மேல்முறையீட்டைச் சமர்ப்பி",
    "Decide appeal": "மேல்முறையீட்டைத் தீர்மானி",
    "Describe why this driving event needs review. You can submit one appeal for each eligible event.":
      "இந்த ஓட்டுநர் நிகழ்வுக்கு ஏன் மறுஆய்வு தேவை என்பதை விவரிக்கவும். தகுதியான ஒவ்வொரு நிகழ்விற்கும் ஒரு மேல்முறையீட்டைச் சமர்ப்பிக்கலாம்.",
    "You cannot review your own appeal. Approval excludes the observation from safety calculations while retaining its history.":
      "உங்கள் சொந்த மேல்முறையீட்டை நீங்களே மதிப்பாய்வு செய்ய முடியாது. ஒப்புதல் அளிப்பது அதன் வரலாற்றைத் தக்கவைத்துக்கொண்டே பாதுகாப்பு கணக்கீடுகளிலிருந்து விலக்கும்.",
    "Driver details": "ஓட்டுநர் விவரங்கள்",
    "Profile identity and currently authorized NFC shifts.":
      "சுயவிவர அடையாளம் மற்றும் தற்போது அங்கீகரிக்கப்பட்ட NFC ஷிப்டுகள்.",
    "Edit driver": "ஓட்டுநரைத் திருத்து",
    "Profile & private photo": "சுயவிவரம் & தனிப்பட்ட புகைப்படம்",
    "NFC shifts": "NFC ஷிப்டுகள்",
    "NFC device authorization creates shifts. Web sign-out does not end a physical shift.":
      "NFC சாதன அங்கீகாரம் ஷிப்டுகளை உருவாக்குகிறது. இணையத்திலிருந்து வெளியேறுவது நேரடி ஷிப்டை முடிக்காது.",
    "Inspect shift": "ஷிப்டை ஆய்வு செய்",
    "Administrative close": "நிர்வாக ரீதியாக மூடு",
    "Safety score & events": "பாதுகாப்பு மதிப்பெண் & நிகழ்வுகள்",
    "Driver safety score": "ஓட்டுநர் பாதுகாப்பு மதிப்பெண்",
    "NFC credentials": "NFC சான்றுகள்",
    "Enrol the SHA-256 fingerprint, not the raw NFC card number. Keep the returned credential reference to revoke that credential later.":
      "அசல் NFC அட்டை எண்ணை அல்லாமல் SHA-256 கைரேகையைப் பதிவு செய்யவும். பின்னர் ரத்து செய்ய திரும்பப் பெறும் சான்றுக் குறிப்பைப் பாதுகாக்கவும்.",
    "Enrol NFC fingerprint": "NFC கைரேகையைப் பதிவுசெய்",
    "Known enrolled credential UUID": "பதிவுசெய்யப்பட்ட சான்று UUID",
    "Revoke known credential": "சான்றை ரத்து செய்",
    "64 hexadecimal SHA-256 fingerprint only, not a raw NFC UID.":
      "64 ஹெக்ஸாடெசிமல் SHA-256 கைரேகை மட்டுமே, அசல் NFC UID அல்ல.",
    "Driver shift": "ஓட்டுநர் ஷிப்ட்",
    "Administratively close shift": "ஷிப்டை நிர்வாக ரீதியாக மூடு",
    "Current driver assignments": "தற்போதைய ஓட்டுநர் ஒதுக்கீடுகள்",
    "Locations require currently accepted active NFC shifts; old observations are not live GPS.":
      "இருப்பிடங்களுக்கு தற்போது ஏற்கப்பட்ட செயலில் உள்ள NFC ஷிப்டுகள் தேவை; பழைய கண்காணிப்புகள் நேரலை GPS அல்ல.",
    "Active shift coordinates": "செயலில் உள்ள ஷிப்ட் ஆயத்தொலைவுகள்",
    "Private photo": "தனிப்பட்ட புகைப்படம்",
    "Direct S3 photo links last at most 5 minutes. Do not share: anyone holding a link can use it until expiry or object deletion, even after app access is revoked.":
      "நேரடி S3 புகைப்பட இணைப்புகள் அதிகபட்சம் 5 நிமிடங்கள் மட்டுமே செல்லுபடியாகும். பகிர வேண்டாம்: செயலி அணுகல் ரத்து செய்யப்பட்ட பிறகும், காலாவதியாகும் வரை அல்லது கோப்பு நீக்கப்படும் வரை இணைப்பை வைத்திருக்கும் எவரும் பயன்படுத்தலாம்.",
    "Legacy photo requires an authorized reupload. The original private file is preserved.":
      "பழைய புகைப்படத்திற்கு அங்கீகரிக்கப்பட்ட மறுபதிவேற்றம் தேவை. அசல் தனிப்பட்ட கோப்பு பாதுகாக்கப்படுகிறது.",
    "Private driver photograph": "ஓட்டுநர் தனிப்பட்ட புகைப்படம்",
    "Clear photo": "புகைப்படத்தை நீக்கு",
    "Request authorized photo": "அங்கீகரிக்கப்பட்ட புகைப்படத்தைக் கோரு",
    "Only your retained, server-authorized safety score. Approved appeals are excluded.":
      "தக்கவைக்கப்பட்ட, சேவையகத்தால் அங்கீகரிக்கப்பட்ட உங்கள் பாதுகாப்பு மதிப்பெண் மட்டுமே. ஏற்கப்பட்ட மேல்முறையீடுகள் விலக்கப்பட்டுள்ளன.",
    "My safety score": "எனது பாதுகாப்பு மதிப்பெண்",
    "Safety scores are currently unavailable on your organization’s plan. You can still review your driving records and trips.":
      "உங்கள் நிறுவனத்தின் திட்டத்தில் பாதுகாப்பு மதிப்பெண்கள் தற்போது கிடைக்கவில்லை. உங்கள் ஓட்டுநர் பதிவுகளையும் பயணங்களையும் இன்னும் மதிப்பாய்வு செய்யலாம்.",
    "Only your retained, server-authorized driving data. No other driver’s trace or shared journey bounds.":
      "தக்கவைக்கப்பட்ட, சேவையகத்தால் அங்கீகரிக்கப்பட்ட உங்கள் ஓட்டுநர் தரவு மட்டுமே. பிற ஓட்டுநர் தடங்கள் அல்லது பகிரப்பட்ட பயண எல்லைகள் இல்லை.",
    "Own driver profile": "சொந்த ஓட்டுநர் சுயவிவரம்",
    "My current safety score": "எனது தற்போதைய பாதுகாப்பு மதிப்பெண்",
    "Currently NFC-authorized vehicle": "தற்போது NFC அங்கீகரிக்கப்பட்ட வாகனம்",
    "Trips are your observed intersections with automatic journeys, not whole shared-vehicle routes or paid fares.":
      "பயணங்கள் என்பவை தானியங்கி பயணங்களுடன் உங்கள் கண்காணிக்கப்பட்ட குறுக்கீடுகள் மட்டுமே, முழு பகிரப்பட்ட வாகன வழித்தடங்கள் அல்லது கட்டணப் பயணங்கள் அல்ல.",
    "Records are limited to your accepted NFC attribution and purchased retention.":
      "பதிவுகள் உங்கள் ஏற்கப்பட்ட NFC இணைப்பு மற்றும் வாங்கிய தக்கவைப்பு காலத்திற்கு மட்டுமே வரையறுக்கப்பட்டவை.",
    "Outside an active authorized shift, no current vehicle is expected. We do not fall back to your last shared vehicle.":
      "செயலில் உள்ள அங்கீகரிக்கப்பட்ட ஷிப்டுக்கு வெளியே தற்போதைய வாகனம் எதிர்பார்க்கப்படாது. உங்கள் கடைசி பகிரப்பட்ட வாகனத்தைக் காட்டமாட்டோம்.",
    "Own fuel and efficiency use aligned covered intervals only, not the entire vehicle total. Estimated CO₂ uses organization emission factors.":
      "சொந்த எரிபொருள் மற்றும் திறன் ஆகியவை சீரமைக்கப்பட்ட இடைவெளிகளை மட்டுமே பயன்படுத்துகின்றன, முழு வாகன மொத்தத்தை அல்ல. மதிப்பிடப்பட்ட CO₂ நிறுவன உமிழ்வு காரணிகளைப் பயன்படுத்துகிறது.",
    event_id: "நிகழ்வு ID",
    driver_id: "ஓட்டுநர்",
    decision_reason: "முடிவு காரணம்",
    created_at: "உருவாக்கப்பட்ட நேரம்",
    kind: "வகை",
    state: "நிலை",
    delta_speed_kmh: "வேக மாற்றம் (km/h)",
    acceleration_ms2: "முடுக்கம் (m/s²)",
    decision: "முடிவு",
    started_at: "தொடங்கிய நேரம்",
    ended_at: "முடிந்த நேரம்",
    attribution_expires_at: "இணைப்பு காலாவதி நேரம்",
    last_observed_at: "கடைசியாக கண்காணிக்கப்பட்ட நேரம்",
    unknown_seconds: "அறியப்படாத வினாடிகள்",
    distance_quality: "தூரத் தரம்",
    fuel_efficiency: "எரிபொருள் திறன் (L/100km / km/L)",
    fuel_litres: "பயன்படுத்தப்பட்ட எரிபொருள் (L)",
    fuel_efficiency_l_per_100km: "எரிபொருள் திறன் (L/100km)",
    fuel_efficiency_km_per_l: "எரிபொருள் திறன் (km/L)",
    credential_fingerprint: "சான்று கைரேகை",
    credential_type: "சான்று வகை",
    nfc_uid_sha256: "NFC UID (SHA-256)",
    expires_at: "காலாவதியாகும் நேரம்",
    first_own_observation_at: "முதல் சொந்த கண்காணிப்பு நேரம்",
    last_own_observation_at: "கடைசி சொந்த கண்காணிப்பு நேரம்",

    // Diagnostics
    "Command status": "கட்டளை நிலை",
    "Queued/running/completed are command metadata, not a stored diagnostic report, hardware certification or proof of AI success. Automatic checking stops after six minutes.":
      "வரிசையில்/இயக்கத்தில்/நிறைவடைந்தது என்பவை கட்டளை மெட்டாடேட்டா மட்டுமே; சேமிக்கப்பட்ட கண்டறிதல் அறிக்கை, வன்பொருள் சான்றிதழ் அல்லது AI வெற்றி ஆதாரம் அல்ல. ஆறு நிமிடங்களுக்குப் பிறகு தானியங்கி சரிபார்ப்பு நிற்கும்.",
    "Push device configuration": "சாதன உள்ளமைவை அனுப்பு",
    "Queue current organization settings (telemetry_interval_seconds, safety & cellular plan gates, and MAF assumptions) to the installed Pi device? Settings apply only after the device acknowledges the command.":
      "நிறுவப்பட்ட Pi சாதனத்திற்கு தற்போதைய நிறுவன அமைப்புகளை (telemetry_interval_seconds, பாதுகாப்பு & செல்லுலார் திட்ட வரம்புகள், மற்றும் MAF அனுமானங்கள்) வரிசைப்படுத்தவா? சாதனம் கட்டளையை உறுதிப்படுத்திய பிறகே அமைப்புகள் நடைமுறைக்கு வரும்.",
    "Read-only diagnostics": "வாசிப்பு-மட்டும் கண்டறிதல்",
    "Extended Read-Only DUDU2 DTC Scan":
      "விரிவாக்கப்பட்ட வாசிப்பு-மட்டும் DUDU2 DTC ஸ்கேன்",
    "DUDU2 OBD extended DTC method (read-only)":
      "DUDU2 OBD விரிவாக்கப்பட்ட DTC முறை (வாசிப்பு-மட்டும்)",
    "Runs functional OBD-II plus ECU (7E0/7E8), TCM (7E1/7E9), and K-line/CAN read-only queries; no DTC codes are stored on CarLink. Only runs when vehicle OBD speed is 0 km/h, and OBD2 telemetry data will be interrupted for 2–5 minutes during scan execution.":
      "செயல்பாட்டு OBD-II உடன் ECU (7E0/7E8), TCM (7E1/7E9), மற்றும் K-line/CAN வாசிப்பு-மட்டும் வினவல்களை இயக்கும்; CarLink-இல் DTC குறியீடுகள் சேமிக்கப்படாது. வாகன OBD வேகம் 0 km/h ஆக இருக்கும்போது மட்டுமே இயங்கும், மேலும் ஸ்கேன் இயங்கும்போது OBD2 டெலிமெட்ரி தரவு 2–5 நிமிடங்களுக்குத் தடைபடும்.",
    "Vehicle must be stationary at 0 km/h":
      "வாகனம் 0 km/h நிலையில் நின்றிருக்க வேண்டும்",
    "Current observed OBD speed is {speed} km/h. Park the vehicle and wait for a fresh 0 km/h reading before requesting an extended scan.":
      "தற்போது கண்காணிக்கப்பட்ட OBD வேகம் {speed} km/h. விரிவாக்கப்பட்ட ஸ்கேனைக் கோருவதற்கு முன் வாகனத்தை நிறுத்தி புதிய 0 km/h அளவீட்டிற்காகக் காத்திருக்கவும்.",
    "No current OBD speed sample is observed. A fresh 0 km/h reading is required before requesting an extended scan.":
      "தற்போதைய OBD வேக மாதிரி எதுவும் கண்காணிக்கப்படவில்லை. விரிவாக்கப்பட்ட ஸ்கேனைக் கோர புதிய 0 km/h அளவீடு தேவை.",
    "I confirm the vehicle is parked at 0 km/h and understand OBD2 data will be interrupted for 2–5 minutes":
      "வாகனம் 0 km/h-இல் நிறுத்தப்பட்டுள்ளது என்பதை உறுதிசெய்கிறேன், மேலும் 2–5 நிமிடங்களுக்கு OBD2 தரவு தடைபடும் என்பதைப் புரிந்துகொள்கிறேன்",
    "Run extended DTC scan": "விரிவாக்கப்பட்ட DTC ஸ்கேனை இயக்கு",
    "Push organization settings to installed Pi device":
      "நிறுவப்பட்ட Pi சாதனத்திற்கு நிறுவன அமைப்புகளை அனுப்பு",
    "Queues signed configuration containing telemetry_interval_seconds, safety and cellular plan gates, and MAF assumptions. The device must acknowledge the command before settings take effect.":
      "telemetry_interval_seconds, பாதுகாப்பு & செல்லுலார் திட்ட வரம்புகள் மற்றும் MAF அனுமானங்களைக் கொண்ட கையொப்பமிடப்பட்ட உள்ளமைவை வரிசைப்படுத்துகிறது. அமைப்புகள் நடைமுறைக்கு வர சாதனம் கட்டளையை உறுதிப்படுத்த வேண்டும்.",
    "Fault code explanation": "கோளாறு குறியீட்டு விளக்கம்",
    "The entered code is sent securely to Google for an AI explanation. This is not a verified diagnosis and is not saved by CarLink.":
      "உள்ளிடப்பட்ட குறியீடு AI விளக்கத்திற்காக Google-க்கு பாதுகாப்பாக அனுப்பப்படுகிறது. இது சரிபார்க்கப்பட்ட நோயறிதல் அல்ல, மேலும் CarLink-ஆல் சேமிக்கப்படாது.",
    "DTC code": "DTC குறியீடு",
    "Please enter a DTC code.": "தயவுசெய்து DTC குறியீட்டை உள்ளிடவும்.",
    "Enter a normalized code, for example P0730.":
      "சீரான குறியீட்டை உள்ளிடவும், எ.கா. P0730.",
    "e.g. P0730": "எ.கா. P0730",
    "Explain once": "ஒருமுறை விளக்கு",
    "Clear explanation": "விளக்கத்தை அழி",
    "AI Hints": "AI குறிப்புகள்",
    "Powered by Google Gemini": "Google Gemini ஆல் இயக்கப்படுகிறது",
    "AI Hints · Powered by Google Gemini":
      "AI குறிப்புகள் · Google Gemini ஆல் இயக்கப்படுகிறது",
    "Advisory only — generated by Google Gemini and not stored by CarLink.":
      "ஆலோசனை மட்டுமே — Google Gemini ஆல் உருவாக்கப்பட்டது, CarLink ஆல் சேமிக்கப்படாது.",
    obd_speed_kmh: "OBD வேகம் (km/h)",
    installed_device_status: "நிறுவப்பட்ட சாதன நிலை",
    command_id: "கட்டளை ID",

    // Analytics (Coverage, Reports, Logs)
    Good: "நல்லது",
    Fair: "மிதமானது",
    Weak: "பலவீனம்",
    "Invalid CSV response": "செல்லாத CSV பதில்",
    "Raw RSRP/SINR and operator observations — not a calibrated radio survey.":
      "அசல் RSRP/SINR மற்றும் ஆபரேட்டர் கண்காணிப்புகள் — அளவீடு செய்யப்பட்ட ரேடியோ ஆய்வு அல்ல.",
    "Export server CSV": "சேவையக CSV ஏற்றுமதி",
    "Missing GPS or packets are not dead zones. RSRP is dBm, SINR is dB; sample alignment is unverified. CSV is limited to 10,000 samples and a 24-hour window.":
      "விடுபட்ட GPS அல்லது பொதிகள் சிக்னல் இல்லாத பகுதிகள் அல்ல. RSRP என்பது dBm, SINR என்பது dB; மாதிரி சீரமைப்பு சரிபார்க்கப்படவில்லை. CSV 10,000 மாதிரிகள் மற்றும் 24 மணி நேரத்திற்குள் வரையறுக்கப்பட்டுள்ளது.",
    "Loaded observation coordinates": "ஏற்றப்பட்ட கண்காணிப்பு ஆயத்தொலைவுகள்",
    "Sort order": "வரிசைப்படுத்தும் முறை",
    "Sort: Newest first": "வரிசை: புதியது முதலில்",
    "Sort: Oldest first": "வரிசை: பழையது முதலில்",
    Vehicle: "வாகனம்",
    Operator: "நெட்வொர்க் ஆபரேட்டர்",
    "Network type": "நெட்வொர்க் வகை",
    "Signal quality": "சிக்னல் தரம்",
    "RSRP (dBm)": "RSRP (dBm)",
    "SINR (dB)": "SINR (dB)",
    Latitude: "அட்சரேகை",
    Longitude: "தீர்க்கரேகை",
    "{count} total in timeframe": "கால அளவில் மொத்தம் {count}",
    "Reached 50-page cap (10,000 rows); narrow the timeframe to see all observations.":
      "50-பக்க வரம்பை (10,000 வரிசைகள்) எட்டியது; அனைத்து கண்காணிப்புகளையும் காண கால அளவைக் குறைக்கவும்.",
    Updated: "புதுப்பிக்கப்பட்டது",
    "Organization activity and subscription summary.":
      "நிறுவன செயல்பாடு மற்றும் சந்தா சுருக்கம்.",
    "Global request metadata without tenant business association.":
      "குத்தகைதாரர் வணிகத் தொடர்பு இல்லாத உலகளாவிய கோரிக்கை மெட்டாடேட்டா.",
    "Permissioned request and action responsibility records.":
      "அனுமதி பெற்ற கோரிக்கை மற்றும் செயல் பொறுப்புப் பதிவுகள்.",
    "No request-body viewer. Credentials, DTC explanations, file signatures and payment callbacks must stay out of logs.":
      "கோரிக்கை-உடல் பார்வையாளர் இல்லை. சான்றுகள், DTC விளக்கங்கள், கோப்பு கையொப்பங்கள் மற்றும் கட்டண திரும்ப அழைப்புகள் பதிவுகளுக்கு வெளியே இருக்க வேண்டும்.",
    "HTTP requests": "HTTP கோரிக்கைகள்",
    "Action audit": "செயல் தணிக்கை",
    request_id: "கோரிக்கை ID",
    method: "முறை",
    route_template: "வழித்தட வார்ப்புரு",
    duration_ms: "கால அளவு (ms)",
    actor_user_id: "செயல்பட்ட பயனர் ID",
    action: "செயல்",
    outcome: "முடிவு",

    // Registry
    "Driver profile email is separate from the sign-in mailbox.":
      "ஓட்டுநர் சுயவிவர மின்னஞ்சல் உள்நுழைவு அஞ்சல் பெட்டியிலிருந்து தனித்தனியானது.",
    "Choose an active eligible driver membership. Primary role must be driver; the server checks eligibility.":
      "செயலில் உள்ள தகுதியான ஓட்டுநர் உறுப்பினரைத் தேர்ந்தெடுக்கவும். முதன்மைப் பங்கு ஓட்டுநராக இருக்க வேண்டும்; சேவையகம் தகுதியைச் சரிபார்க்கும்.",
    "Fleet identity, pending installations and vehicle records.":
      "வாகனத் தொகுப்பு அடையாளம், நிலுவையிலுள்ள நிறுவல்கள் மற்றும் வாகனப் பதிவுகள்.",
    "Registered drivers, linked accounts and accepted NFC attribution.":
      "பதிவுசெய்யப்பட்ட ஓட்டுநர்கள், இணைக்கப்பட்ட கணக்குகள் மற்றும் ஏற்கப்பட்ட NFC இணைப்பு.",
    "Public device identity. Managed installation is reserved for SaaS technicians.":
      "பொது சாதன அடையாளம். நிர்வகிக்கப்பட்ட நிறுவல் SaaS தொழில்நுட்ப வல்லுநர்களுக்காக ஒதுக்கப்பட்டுள்ளது.",
    "Vehicle registration automatically creates a pending device. Contact SaaS staff for activation or relinking.":
      "வாகனப் பதிவு தானாகவே நிலுவையிலுள்ள சாதனத்தை உருவாக்குகிறது. செயலாக்கம் அல்லது மறுஇணைப்புக்கு SaaS பணியாளர்களைத் தொடர்பு கொள்ளவும்.",
    Archive: "காப்பகப்படுத்து",
    "Archive this vehicle? The server checks active installations and other operational restrictions.":
      "இந்த வாகனத்தைக் காப்பகப்படுத்தவா? செயலில் உள்ள நிறுவல்கள் மற்றும் பிற செயல்பாட்டுக் கட்டுப்பாடுகளைச் சேவையகம் சரிபார்க்கும்.",
    "Register vehicle": "வாகனத்தைப் பதிவுசெய்",
    "Register driver": "ஓட்டுநரைப் பதிவுசெய்",
    "A new vehicle receives a pending device automatically. Unknown odometer mileage is not zero.":
      "புதிய வாகனம் தானாகவே நிலுவையிலுள்ள சாதனத்தைப் பெறும். அறியப்படாத ஓடோமீட்டர் மைலேஜ் பூஜ்ஜியம் அல்ல.",
    "Suspending a driver closes current server-authorized shifts. Linking a human account requires an eligible active driver membership.":
      "ஓட்டுநரை இடைநீக்கம் செய்வது தற்போது சேவையகத்தால் அங்கீகரிக்கப்பட்ட ஷிப்டுகளை மூடும். மனித கணக்கை இணைக்க தகுதியான செயலில் உள்ள ஓட்டுநர் உறுப்பினர் தேவை.",
    registration_country: "பதிவு செய்த நாடு",
    model_year: "மாடல் ஆண்டு",
    fuel_type: "எரிபொருள் வகை",
    passenger_capacity: "பயணிகள் கொள்ளளவு",
    seats: "இருக்கைகள்",
    petrol: "பெட்ரோல்",
    diesel: "டீசல்",
    hybrid: "ஹைப்ரிட்",
    electric: "மின்சாரம்",
    other: "மற்றவை",
    maintenance: "பராமரிப்பு",
    employee_code: "பணியாளர் குறியீடு",
    phone: "தொலைபேசி",
    user_id: "பயனர் ID",
    registered_vehicle_id: "பதிவுசெய்யப்பட்ட வாகனம்",

    // NFC card enrollment & credentials
    "Link Driver NFC ID": "ஓட்டுநர் NFC ID-ஐ இணை",
    "Link NFC ID": "NFC ID-ஐ இணை",
    "NFC card already linked": "NFC அட்டை ஏற்கனவே இணைக்கப்பட்டுள்ளது",
    "This NFC card is already active for a driver in this organization, or this driver is not active. Revoke the existing credential first or tap a different card.":
      "இந்த NFC அட்டை இந்த நிறுவனத்தில் ஒரு ஓட்டுநருக்கு ஏற்கனவே செயலில் உள்ளது, அல்லது இந்த ஓட்டுநர் செயலில் இல்லை. முதலில் உள்ள சான்றை ரத்துசெய்யவும் அல்லது வேறு அட்டையைத் தட்டவும்.",
    "Card ISO UID unavailable": "அட்டை ISO UID கிடைக்கவில்லை",
    "This NFC tag did not expose an ISO UID. The card must expose a readable ISO 14443 serial number.":
      "இந்த NFC டேக் ISO UID-ஐ வழங்கவில்லை. அட்டை படிக்கக்கூடிய ISO 14443 வரிசை எண்ணை வழங்க வேண்டும்.",
    "Invalid NFC card UID": "செல்லாத NFC அட்டை UID",
    "The scanned NFC card UID format could not be normalized. Ensure the card exposes a standard 4 to 10 byte ISO UID and try again.":
      "ஸ்கேன் செய்யப்பட்ட NFC அட்டை UID வடிவத்தை இயல்பாக்க முடியவில்லை. அட்டை 4 முதல் 10 பைட் ISO UID-ஐக் கொண்டுள்ளதா என உறுதிசெய்து மீண்டும் முயற்சிக்கவும்.",
    "Unable to read NFC card": "NFC அட்டையைப் படிக்க முடியவில்லை",
    "Could not read the NFC card. Hold the card steady against the back of your Android phone and try again.":
      "NFC அட்டையைப் படிக்க முடியவில்லை. உங்கள் Android தொலைபேசியின் பின்புறத்தில் அட்டையை நிலையாக வைத்து மீண்டும் முயற்சிக்கவும்.",
    "NFC permission denied": "NFC அனுமதி மறுக்கப்பட்டது",
    "Allow NFC permission in Android Chrome site settings and try again.":
      "Android Chrome தள அமைப்புகளில் NFC அனுமதியை வழங்கி மீண்டும் முயற்சிக்கவும்.",
    "NFC is turned off or unsupported":
      "NFC முடக்கப்பட்டுள்ளது அல்லது ஆதரிக்கப்படவில்லை",
    "Enable NFC in your Android device settings and ensure you are using Android Chrome over HTTPS.":
      "உங்கள் Android சாதன அமைப்புகளில் NFC-ஐ இயக்கி, HTTPS வழியாக Android Chrome-ஐப் பயன்படுத்துவதை உறுதிசெய்யவும்.",
    "NFC scan failed": "NFC ஸ்கேன் தோல்வியடைந்தது",
    "Check that NFC is enabled on your Android device and try again.":
      "உங்கள் Android சாதனத்தில் NFC இயக்கப்பட்டுள்ளதா எனச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    "Hold the NFC card flat against the back of your phone…":
      "NFC அட்டையை உங்கள் தொலைபேசியின் பின்புறத்தில் தட்டையாக வைக்கவும்…",
    "Fingerprint computed locally — linking to driver…":
      "கைரேகை உள்ளூரில் கணக்கிடப்பட்டது — ஓட்டுநருடன் இணைக்கப்படுகிறது…",
    "NFC card linked to driver": "NFC அட்டை ஓட்டுநருடன் இணைக்கப்பட்டது",
    "Scan or linking did not complete": "ஸ்கேன் அல்லது இணைப்பு முடியவில்லை",
    "Tap Scan NFC card, then hold the card against the reader":
      "NFC அட்டையை ஸ்கேன் செய் என்பதைத் தட்டி, அட்டையை ரீடருக்கு எதிராக வைக்கவும்",
    "Tap-to-scan requires Android Chrome over HTTPS":
      "தட்டி ஸ்கேன் செய்ய HTTPS வழியாக Android Chrome தேவை",
    "Driver NFC card linked": "ஓட்டுநர் NFC அட்டை இணைக்கப்பட்டது",
    "Keep the credential reference below to revoke or audit this card later.":
      "இந்த அட்டையைப் பின்னர் ரத்துசெய்ய அல்லது தணிக்கை செய்ய கீழே உள்ள சான்று குறிப்பைச் சேமித்து வைக்கவும்.",
    "Link another card": "மற்றொரு அட்டையை இணை",
    Done: "முடிந்தது",
    "Credential reference ID": "சான்று குறிப்பு ID",
    "Only the SHA-256 digest of the NFC UID bytes is sent to CarLink. The raw card UID is never stored or logged.":
      "NFC UID பைட்டுகளின் SHA-256 சுருக்கம் மட்டுமே CarLink-க்கு அனுப்பப்படும். மூல அட்டை UID ஒருபோதும் சேமிக்கப்படாது அல்லது பதிவு செய்யப்படாது.",
    "Web NFC unavailable in this browser": "இந்த உலாவியில் Web NFC கிடைக்கவில்லை",
    "Tap-to-scan requires Android Chrome over HTTPS. Use an Android phone or expand the manual SHA-256 fingerprint entry below.":
      "தட்டி ஸ்கேன் செய்ய HTTPS வழியாக Android Chrome தேவை. Android தொலைபேசியைப் பயன்படுத்தவும் அல்லது கீழே உள்ள கைமுறை SHA-256 கைரேகை உள்ளீட்டை விரிவாக்கவும்.",
    Retry: "மீண்டும் முயற்சி",
    "Optional expiry date & time": "விருப்ப காலாவதி தேதி & நேரம்",
    "No expiry (optional)": "காலாவதி இல்லை (விருப்பம்)",
    "Stop scanning": "ஸ்கேனிங்கை நிறுத்து",
    "Retry NFC scan": "NFC ஸ்கேனை மீண்டும் செய்",
    "Scan NFC card": "NFC அட்டையை ஸ்கேன் செய்",
    "Manual SHA-256 fingerprint entry": "கைமுறை SHA-256 கைரேகை உள்ளீடு",
    "64-character SHA-256 hex digest": "64-எழுத்து SHA-256 ஹெக்ஸ் சுருக்கம்",
    "Link fingerprint": "கைரேகையை இணை",
    Assurance: "உறுதித்தன்மை",
    "Issued at": "வழங்கப்பட்ட நேரம்",
    "No expiry": "காலாவதி இல்லை",
    Active: "செயலில்",
    Revoked: "ரத்துசெய்யப்பட்டது",
    Expired: "காலாவதியானது",
    Revoke: "ரத்து செய்",
    "Revoke this NFC credential? Active shifts using this card will be closed by the server.":
      "இந்த NFC சான்றை ரத்துசெய்யவா? இந்த அட்டையைப் பயன்படுத்தும் செயலில் உள்ள ஷிப்டுகள் சேவையகத்தால் மூடப்படும்.",

    // Active driver-vehicle sessions
    current_driver_name: "தற்போதைய ஓட்டுநர்",
    current_driver_id: "தற்போதைய ஓட்டுநர் ID",
    current_vehicle_registration: "தற்போதைய வாகனம்",
    current_vehicle_id: "தற்போதைய வாகனம் ID",
    current_vehicle_make: "தற்போதைய வாகன தயாரிப்பு",
    current_vehicle_model: "தற்போதைய வாகன மாடல்",
    current_shift_started_at: "தற்போதைய ஷிப்ட் தொடங்கிய நேரம்",
    current_shift_expires_at: "தற்போதைய ஷிப்ட் காலாவதி நேரம்",
    registration_number: "வாகனப் பதிவு எண்",
    "Current driver": "தற்போதைய ஓட்டுநர்",
    "Current driver session": "தற்போதைய ஓட்டுநர் அமர்வு",
    "Current vehicle session": "தற்போதைய வாகன அமர்வு",
    "Driver: {name}": "ஓட்டுநர்: {name}",
    "No active driver": "செயலில் ஓட்டுநர் இல்லை",
    "No active driver shift on this vehicle. Tap an enrolled NFC card on the in-vehicle reader to start a driver session.":
      "இந்த வாகனத்தில் செயலில் உள்ள ஓட்டுநர் ஷிப்ட் இல்லை. ஓட்டுநர் அமர்வைத் தொடங்க வாகனத்தில் உள்ள ரீடரில் பதிவுசெய்யப்பட்ட NFC அட்டையைத் தட்டவும்.",
    "No active vehicle shift for this driver. Tap an enrolled NFC card on a vehicle reader to start a shift.":
      "இந்த ஓட்டுநருக்கு செயலில் உள்ள வாகன ஷிப்ட் இல்லை. ஷிப்டைத் தொடங்க வாகன ரீடரில் பதிவுசெய்யப்பட்ட NFC அட்டையைத் தட்டவும்.",
    Driver: "ஓட்டுநர்",
    Driving: "ஓட்டுகிறார்",
    "Off shift": "ஷிப்டில் இல்லை",
    "Open driver": "ஓட்டுநரைத் திற",
    "Open vehicle": "வாகனத்தைத் திற",
    "Last authenticated": "கடைசியாக அங்கீகரிக்கப்பட்டது",
    "Make / model": "தயாரிப்பு / மாடல்",
    "Current assignments": "தற்போதைய ஒதுக்கீடுகள்",
    assignments: "தற்போதைய ஒதுக்கீடுகள்",
    "Locations require currently authorized NFC shifts; old observations are not live GPS.":
      "இருப்பிடங்களுக்கு தற்போது அங்கீகரிக்கப்பட்ட செயலில் உள்ள NFC ஷிப்டுகள் தேவை; பழைய பதிவுகள் நேரடி GPS அல்ல.",
  },
};
