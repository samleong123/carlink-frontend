import type { Locale } from "./messages";

export const LANDING_EDITORIAL_PHRASES: Record<
  Locale,
  Record<string, string>
> = {
  en: {
    ed_nav_how_it_works: "How it works",
    ed_nav_story: "Start",
    ed_nav_tap: "Tap-in",
    ed_nav_route: "Route",
    ed_nav_telemetry: "Telemetry",
    ed_nav_fleet: "Fleet",
    ed_nav_plans: "Plans",
    ed_rail_aria: "Journey chapters",
    ed_scroll_cue: "Scroll to trace the trip",

    ed_ch1_title: "Know where every vehicle is, and how it's driven.",
    ed_ch1_body:
      "CarLink connects each vehicle's OBD port, GPS, and driver NFC card to one quiet fleet console.",
    ed_ch1_cta_primary: "Get started",
    ed_ch1_cta_secondary: "Open console",
    ed_ch1_cta_signin: "Sign in",
    ed_ch1_cta_plans: "View plans",
    ed_ch1_scene_aria:
      "Blue ballpoint sketch of a car parked at the kerb and a driver walking up holding an NFC card",
    ed_ch1_ann_curb: "Parked at the kerb",
    ed_ch1_ann_card: "Driver holding NFC card",

    ed_ch2_title: "Driver taps in",
    ed_ch2_body:
      "Before the engine turns, one tap on the dashboard NFC reader records who is driving and opens an authenticated shift.",
    ed_ch2_scene_aria:
      "Blue ballpoint sketch of a driver's hand tapping an NFC card on a dashboard reader beside the steering wheel",
    ed_ch2_callout_nfc: "Dashboard NFC reader",
    ed_ch2_callout_shift: "Card verified, shift active",

    ed_ch3_title: "Route traced",
    ed_ch3_body:
      "Along city streets and highways, live GPS and 4G readings draw a speed-coloured path and mark harsh braking the moment it happens.",
    ed_ch3_scene_aria:
      "Blue ballpoint sketch of a road bending into a speed-coloured GPS trace with an amber harsh-brake marker",
    ed_ch3_ann_gps: "GPS and 4G live trace",
    ed_ch3_ann_speed: "Speed-coloured route",
    ed_ch3_ann_brake: "Harsh brake",
    ed_ch3_ann_spool: "Buffered if signal drops",

    ed_ch4_title: "Health and fuel, live",
    ed_ch4_body:
      "Read speed, fuel rate, battery voltage, and check-engine status straight from the OBD-II port, without storing raw fault codes.",
    ed_ch4_scene_aria:
      "Blue ballpoint sketch of an instrument cluster with fuel rate, battery voltage, and a live speed graph below",
    ed_ch4_ann_gauge: "Engine load and fuel",
    ed_ch4_label_fuel: "Fuel rate",
    ed_ch4_val_fuel: "2.4 L/h",
    ed_ch4_label_battery: "Battery",
    ed_ch4_val_battery: "13.9 V, warning clear",
    ed_ch4_wave_speed: "Speed trace (km/h)",
    ed_ch4_wave_volt: "Battery voltage",

    ed_ch5_title: "Whole fleet, one screen",
    ed_ch5_body:
      "Pull back from one vehicle to follow every active route, driver shift, and road-tax or service renewal in one place.",
    ed_ch5_scene_aria:
      "Blue ballpoint sketch of a city map with multiple vehicles following live routes",
    ed_ch5_ann_map: "Active vehicles across the city",

    ed_plans_heading: "Pay for the vehicles you run.",
    ed_plans_intro:
      "Choose a plan by fleet size, history window, and safety or 4G modules.",
    ed_dim_fleet_size: "Fleet size",
    ed_dim_fleet_size_val: "Vehicles and drivers",
    ed_dim_retention: "History",
    ed_dim_retention_val: "30, 90, 180, or 365 days",
    ed_dim_modules: "Modules",
    ed_dim_modules_val: "Safety score and 4G coverage",
    ed_dim_reporting: "Reports",
    ed_dim_reporting_val: "Usage and CSV exports",
    ed_plan_per_days: "per {days} days, billed by invoice",

    ed_preview_badge: "Live console preview",
    ed_preview_caption: "CarLink fleet console",
    ed_preview_tab_map: "Live fleet & routes",
    ed_preview_tab_telemetry: "Telemetry & safety",
    ed_preview_tab_compliance: "Compliance & service",
    ed_preview_active_fleet: "Active vehicles",
    ed_preview_speed_legend: "Route colour by speed",
    ed_preview_harsh_pin: "Harsh brake",
    ed_preview_driver: "Driver shift",
    ed_preview_signal: "4G signal",
    ed_preview_speed: "OBD-II speed",
    ed_preview_voltage: "Battery voltage",
    ed_preview_fuel: "Fuel rate",
    ed_preview_mil: "Check engine",
    ed_preview_mil_clear: "Clear · No fault",
    ed_preview_status_online: "Recent packet",
    ed_preview_status_stale: "Stale",
    ed_preview_comp_roadtax: "Road tax renewal",
    ed_preview_comp_insurance: "Motor insurance",
    ed_preview_comp_puspakom: "PUSPAKOM inspection",
    ed_preview_comp_service: "10,000 km service",
    ed_preview_due_14d: "Due in 14 days",
    ed_preview_due_42d: "Valid · 42 days",
    ed_preview_due_680km: "680 km left",
    ed_preview_due_ok: "Valid · 118 days",

    ed_ch6_title: "Start with one vehicle today.",
    ed_ch6_body:
      "Plug in the OBD gateway, tap a driver card, and see your first trip appear on the console.",
    ed_ch6_scene_aria:
      "Blue ink line underlining the primary get started button",
    ed_ch6_cta_plans: "Compare plans",

    ed_footer_tagline:
      "Vehicle telemetry, driver tap-in, and renewal tracking for working fleets.",
    ed_footer_story_col: "How it works",
    ed_footer_platform_col: "Platform",
    ed_footer_note:
      "OBD-II telemetry, NFC shift logs, and compliance reminders by CarLink.",
  },

  ms: {
    ed_nav_how_it_works: "Cara ia berfungsi",
    ed_nav_story: "Mula",
    ed_nav_tap: "Sentuh kad",
    ed_nav_route: "Laluan",
    ed_nav_telemetry: "Telemetri",
    ed_nav_fleet: "Armada",
    ed_nav_plans: "Pelan",
    ed_rail_aria: "Bab perjalanan",
    ed_scroll_cue: "Tatal untuk menjejak perjalanan",

    ed_ch1_title: "Ketahui lokasi setiap kenderaan dan cara ia dipandu.",
    ed_ch1_body:
      "CarLink menghubungkan port OBD, GPS, dan kad NFC pemandu setiap kenderaan ke satu konsol armada.",
    ed_ch1_cta_primary: "Mula sekarang",
    ed_ch1_cta_secondary: "Buka konsol",
    ed_ch1_cta_signin: "Log masuk",
    ed_ch1_cta_plans: "Lihat pelan",
    ed_ch1_scene_aria:
      "Lakaran pen biru sebuah kereta di tepi jalan bersama pemandu yang memegang kad NFC",
    ed_ch1_ann_curb: "Diletakkan di tepi jalan",
    ed_ch1_ann_card: "Pemandu memegang kad NFC",

    ed_ch2_title: "Pemandu sentuh kad",
    ed_ch2_body:
      "Sebelum enjin dihidupkan, satu sentuhan pada pengimbas NFC papan pemuka merekodkan pemandu dan membuka syif yang disahkan.",
    ed_ch2_scene_aria:
      "Lakaran pen biru tangan pemandu menyentuh kad NFC pada pengimbas papan pemuka di sebelah stereng",
    ed_ch2_callout_nfc: "Pengimbas NFC papan pemuka",
    ed_ch2_callout_shift: "Kad disahkan, syif aktif",

    ed_ch3_title: "Laluan dijejak",
    ed_ch3_body:
      "Di jalan bandar dan lebuh raya, bacaan GPS dan 4G melukis laluan mengikut kelajuan serta menanda brek keras serta-merta.",
    ed_ch3_scene_aria:
      "Lakaran pen biru jalan yang melengkung menjadi jejak GPS berwarna dengan tanda brek keras ambar",
    ed_ch3_ann_gps: "Jejak langsung GPS dan 4G",
    ed_ch3_ann_speed: "Laluan ikut kelajuan",
    ed_ch3_ann_brake: "Brek keras",
    ed_ch3_ann_spool: "Disimpan jika isyarat terputus",

    ed_ch4_title: "Kesihatan enjin dan bahan api, langsung",
    ed_ch4_body:
      "Baca kelajuan, kadar bahan api, voltan bateri, dan status lampu enjin terus dari port OBD-II tanpa menyimpan kod kerosakan mentah.",
    ed_ch4_scene_aria:
      "Lakaran pen biru kluster instrumen dengan kadar bahan api, voltan bateri, dan graf kelajuan di bawah",
    ed_ch4_ann_gauge: "Beban enjin dan bahan api",
    ed_ch4_label_fuel: "Kadar bahan api",
    ed_ch4_val_fuel: "2.4 L/j",
    ed_ch4_label_battery: "Bateri",
    ed_ch4_val_battery: "13.9 V, amaran bersih",
    ed_ch4_wave_speed: "Jejak kelajuan (km/j)",
    ed_ch4_wave_volt: "Voltan bateri",

    ed_ch5_title: "Seluruh armada, satu skrin",
    ed_ch5_body:
      "Lihat gambaran luas daripada satu kenderaan untuk memantau setiap laluan aktif, syif pemandu, serta pembaharuan cukai jalan atau servis.",
    ed_ch5_scene_aria:
      "Lakaran pen biru peta bandar dengan beberapa kenderaan mengikuti laluan langsung",
    ed_ch5_ann_map: "Kenderaan aktif di seluruh bandar",

    ed_plans_heading: "Bayar untuk kenderaan yang anda jalankan.",
    ed_plans_intro:
      "Pilih pelan mengikut saiz armada, tempoh sejarah, serta modul keselamatan atau 4G.",
    ed_dim_fleet_size: "Saiz armada",
    ed_dim_fleet_size_val: "Kenderaan dan pemandu",
    ed_dim_retention: "Sejarah",
    ed_dim_retention_val: "30, 90, 180, atau 365 hari",
    ed_dim_modules: "Modul",
    ed_dim_modules_val: "Skor keselamatan dan liputan 4G",
    ed_dim_reporting: "Laporan",
    ed_dim_reporting_val: "Penggunaan dan eksport CSV",
    ed_plan_per_days: "setiap {days} hari, dibilkan melalui invois",

    ed_preview_badge: "Pratonton konsol langsung",
    ed_preview_caption: "Konsol armada CarLink",
    ed_preview_tab_map: "Armada & laluan langsung",
    ed_preview_tab_telemetry: "Telemetri & keselamatan",
    ed_preview_tab_compliance: "Pematuhan & servis",
    ed_preview_active_fleet: "Kenderaan aktif",
    ed_preview_speed_legend: "Warna laluan ikut kelajuan",
    ed_preview_harsh_pin: "Brek keras",
    ed_preview_driver: "Syif pemandu",
    ed_preview_signal: "Isyarat 4G",
    ed_preview_speed: "Kelajuan OBD-II",
    ed_preview_voltage: "Voltan bateri",
    ed_preview_fuel: "Kadar bahan api",
    ed_preview_mil: "Lampu enjin",
    ed_preview_mil_clear: "Bersih · Tiada kerosakan",
    ed_preview_status_online: "Paket terkini",
    ed_preview_status_stale: "Lapuk",
    ed_preview_comp_roadtax: "Pembaharuan cukai jalan",
    ed_preview_comp_insurance: "Insurans motor",
    ed_preview_comp_puspakom: "Pemeriksaan PUSPAKOM",
    ed_preview_comp_service: "Servis 10,000 km",
    ed_preview_due_14d: "Tamat dalam 14 hari",
    ed_preview_due_42d: "Sah · 42 hari",
    ed_preview_due_680km: "Baki 680 km",
    ed_preview_due_ok: "Sah · 118 hari",

    ed_ch6_title: "Mulakan dengan satu kenderaan hari ini.",
    ed_ch6_body:
      "Pasang gerbang OBD, sentuh kad pemandu, dan lihat perjalanan pertama anda muncul di konsol.",
    ed_ch6_scene_aria:
      "Garis dakwat biru menggarisi butang mula sekarang",
    ed_ch6_cta_plans: "Bandingkan pelan",

    ed_footer_tagline:
      "Telemetri kenderaan, sentuhan kad pemandu, dan jejak pembaharuan untuk armada aktif.",
    ed_footer_story_col: "Cara ia berfungsi",
    ed_footer_platform_col: "Platform",
    ed_footer_note:
      "Telemetri OBD-II, log syif NFC, dan peringatan pematuhan oleh CarLink.",
  },

  zh: {
    ed_nav_how_it_works: "工作原理",
    ed_nav_story: "启程",
    ed_nav_tap: "刷卡",
    ed_nav_route: "路线",
    ed_nav_telemetry: "车况",
    ed_nav_fleet: "车队",
    ed_nav_plans: "方案",
    ed_rail_aria: "行程章节",
    ed_scroll_cue: "向下滚动查看行程轨迹",

    ed_ch1_title: "随时掌握每辆车的位置与驾驶状态。",
    ed_ch1_body:
      "CarLink 将每辆车的 OBD 接口、GPS 与驾驶员 NFC 卡接入同一个清晰的车队控制台。",
    ed_ch1_cta_primary: "立即开始",
    ed_ch1_cta_secondary: "打开控制台",
    ed_ch1_cta_signin: "登录",
    ed_ch1_cta_plans: "查看方案",
    ed_ch1_scene_aria: "蓝色圆珠笔手绘停靠在路边的汽车和手持 NFC 卡走近的驾驶员",
    ed_ch1_ann_curb: "路边停靠",
    ed_ch1_ann_card: "驾驶员手持 NFC 卡",

    ed_ch2_title: "驾驶员刷卡上车",
    ed_ch2_body:
      "发动引擎前，在仪表台 NFC 读卡器上轻触一下，即可记录当前驾驶员并开启认证班次。",
    ed_ch2_scene_aria: "蓝色圆珠笔手绘驾驶员在方向盘旁将 NFC 卡轻触仪表台读卡器",
    ed_ch2_callout_nfc: "仪表台 NFC 读卡器",
    ed_ch2_callout_shift: "卡片已验证，班次已开启",

    ed_ch3_title: "路线实时描绘",
    ed_ch3_body:
      "行驶于城市道路与高速途中，实时 GPS 与 4G 读数绘出按车速着色的轨迹，并在急刹车瞬间标出警示。",
    ed_ch3_scene_aria:
      "蓝色圆珠笔手绘弯道转变为按车速着色的 GPS 轨迹，并带有一个琥珀色急刹车标记",
    ed_ch3_ann_gps: "GPS 与 4G 实时轨迹",
    ed_ch3_ann_speed: "按车速着色路线",
    ed_ch3_ann_brake: "急刹车",
    ed_ch3_ann_spool: "信号中断时本地缓存",

    ed_ch4_title: "车况与油耗，实时可见",
    ed_ch4_body:
      "直接从 OBD-II 接口读取车速、油耗流速、电瓶电压与故障灯状态，同时不保存原始故障码。",
    ed_ch4_scene_aria: "蓝色圆珠笔手绘带油耗与电压读数的仪表盘以及下方实时车速曲线",
    ed_ch4_ann_gauge: "发动机负载与油耗",
    ed_ch4_label_fuel: "瞬时油耗",
    ed_ch4_val_fuel: "2.4 L/h",
    ed_ch4_label_battery: "电瓶",
    ed_ch4_val_battery: "13.9 V，无故障警示",
    ed_ch4_wave_speed: "车速曲线 (km/h)",
    ed_ch4_wave_volt: "电瓶电压",

    ed_ch5_title: "整支车队，一屏掌控",
    ed_ch5_body:
      "从单辆车拉远视角，集中查看团队每条在途路线、驾驶员班次以及路税和保养到期提醒。",
    ed_ch5_scene_aria: "蓝色圆珠笔手绘城市地图与多辆沿实时路线行驶的车辆",
    ed_ch5_ann_map: "全城在途车辆",

    ed_plans_heading: "按实际运营车辆数量付费。",
    ed_plans_intro: "根据车队规模、历史保留天数以及安全或 4G 模块选择方案。",
    ed_dim_fleet_size: "车队规模",
    ed_dim_fleet_size_val: "车辆与驾驶员上限",
    ed_dim_retention: "数据保留",
    ed_dim_retention_val: "30、90、180 或 365 天",
    ed_dim_modules: "功能模块",
    ed_dim_modules_val: "安全评分与 4G 覆盖",
    ed_dim_reporting: "数据报表",
    ed_dim_reporting_val: "利用率与 CSV 导出",
    ed_plan_per_days: "每 {days} 天，按发票结算",

    ed_preview_badge: "实时控制台预览",
    ed_preview_caption: "CarLink 车队控制台",
    ed_preview_tab_map: "实时车队与路线",
    ed_preview_tab_telemetry: "遥测与安全",
    ed_preview_tab_compliance: "合规与保养",
    ed_preview_active_fleet: "在线车辆",
    ed_preview_speed_legend: "按车速着色路线",
    ed_preview_harsh_pin: "急刹车",
    ed_preview_driver: "驾驶员班次",
    ed_preview_signal: "4G 信号",
    ed_preview_speed: "OBD-II 车速",
    ed_preview_voltage: "电瓶电压",
    ed_preview_fuel: "油耗流速",
    ed_preview_mil: "故障灯",
    ed_preview_mil_clear: "正常 · 无故障",
    ed_preview_status_online: "最新数据包",
    ed_preview_status_stale: "信号滞后",
    ed_preview_comp_roadtax: "路税续期",
    ed_preview_comp_insurance: "车险续保",
    ed_preview_comp_puspakom: "PUSPAKOM 验车",
    ed_preview_comp_service: "10,000 公里保养",
    ed_preview_due_14d: "14 天内到期",
    ed_preview_due_42d: "有效 · 42 天",
    ed_preview_due_680km: "剩余 680 公里",
    ed_preview_due_ok: "有效 · 118 天",

    ed_ch6_title: "今天就可以从一辆车开始。",
    ed_ch6_body:
      "插上 OBD 网关，轻触驾驶员卡片，即可在控制台看到首段行程。",
    ed_ch6_scene_aria: "蓝色墨水线条在立即开始按钮下方划出收尾下划线",
    ed_ch6_cta_plans: "对比方案",

    ed_footer_tagline: "为运营车队打造的车辆遥测、刷卡上车与合规到期追踪。",
    ed_footer_story_col: "工作原理",
    ed_footer_platform_col: "平台",
    ed_footer_note: "由 CarLink 提供 OBD-II 遥测、NFC 班次记录与合规提醒。",
  },

  ta: {
    ed_nav_how_it_works: "எப்படி செயல்படுகிறது",
    ed_nav_story: "தொடக்கம்",
    ed_nav_tap: "அட்டை தொடுதல்",
    ed_nav_route: "வழித்தடம்",
    ed_nav_telemetry: "டெலிமெட்ரி",
    ed_nav_fleet: "வாகனக் குழு",
    ed_nav_plans: "திட்டங்கள்",
    ed_rail_aria: "பயண அத்தியாயங்கள்",
    ed_scroll_cue: "பயணத்தைப் பின்தொடர கீழே உருட்டவும்",

    ed_ch1_title:
      "ஒவ்வொரு வாகனமும் எங்கே உள்ளது, எப்படி ஓட்டப்படுகிறது என்பதை அறியுங்கள்.",
    ed_ch1_body:
      "CarLink ஒவ்வொரு வாகனத்தின் OBD போர்ட், GPS மற்றும் ஓட்டுநர் NFC அட்டையை ஒரே வாகனக் குழு கன்சோலில் இணைக்கிறது.",
    ed_ch1_cta_primary: "தொடங்குங்கள்",
    ed_ch1_cta_secondary: "கன்சோலைத் திறக்கவும்",
    ed_ch1_cta_signin: "உள்நுழையவும்",
    ed_ch1_cta_plans: "திட்டங்களைப் பார்க்கவும்",
    ed_ch1_scene_aria:
      "சாலையோரம் நிறுத்தப்பட்ட கார் மற்றும் NFC அட்டையுடன் நடந்து வரும் ஓட்டுநரின் நீல பால்பாயிண்ட் ஓவியம்",
    ed_ch1_ann_curb: "சாலையோரம் நிறுத்தப்பட்டுள்ளது",
    ed_ch1_ann_card: "ஓட்டுநர் கையில் NFC அட்டை",

    ed_ch2_title: "ஓட்டுநர் அட்டையைத் தொடுகிறார்",
    ed_ch2_body:
      "இயந்திரம் இயங்கும் முன், டேஷ்போர்டு NFC ரீடரில் ஒரு முறை தொட்டால் யார் ஓட்டுகிறார்கள் என்பது பதிவாகி அங்கீகரிக்கப்பட்ட பணிநேரம் தொடங்கும்.",
    ed_ch2_scene_aria:
      "ஸ்டியரிங் சக்கரத்திற்கு அருகிலுள்ள டேஷ்போர்டு NFC ரீடரில் ஓட்டுநரின் கை NFC அட்டையைத் தொடும் நீல பால்பாயிண்ட் ஓவியம்",
    ed_ch2_callout_nfc: "டேஷ்போர்டு NFC ரீடர்",
    ed_ch2_callout_shift: "அட்டை சரிபார்க்கப்பட்டது, பணிநேரம் செயலில்",

    ed_ch3_title: "வழித்தடம் பதிவு செய்யப்படுகிறது",
    ed_ch3_body:
      "நகரச் சாலைகள் மற்றும் நெடுஞ்சாலைகளில், நேரடி GPS மற்றும் 4G அளவீடுகள் வேக நிற வழித்தடத்தை வரைந்து கடுமையான பிரேக்கை உடனே குறிக்கின்றன.",
    ed_ch3_scene_aria:
      "வேக நிற GPS தடமாக வளைந்து செல்லும் சாலை மற்றும் கடுமையான பிரேக் குறியீட்டின் நீல பால்பாயிண்ட் ஓவியம்",
    ed_ch3_ann_gps: "நேரடி GPS மற்றும் 4G தடம்",
    ed_ch3_ann_speed: "வேகத்திற்கேற்ற வழித்தடம்",
    ed_ch3_ann_brake: "கடுமையான பிரேக்",
    ed_ch3_ann_spool: "சிக்னல் குறைந்தால் உள்ளூரில் சேமிப்பு",

    ed_ch4_title: "இயந்திர நலனும் எரிபொருளும், நேரலையில்",
    ed_ch4_body:
      "வேகம், எரிபொருள் ஓட்டம், பேட்டரி மின்னழுத்தம் மற்றும் இயந்திர எச்சரிக்கை நிலையை OBD-II போர்ட்டிலிருந்து நேரடியாகப் படிக்கலாம் — மூலக் கோளாறு குறியீடுகளைச் சேமிக்காமல்.",
    ed_ch4_scene_aria:
      "எரிபொருள் ஓட்டம், பேட்டரி மின்னழுத்தம் கொண்ட டேஷ்போர்டு கருவி தொகுப்பு மற்றும் கீழே நேரடி வேக வரைபடத்தின் நீல பால்பாயிண்ட் ஓவியம்",
    ed_ch4_ann_gauge: "இயந்திரச் சுமை மற்றும் எரிபொருள்",
    ed_ch4_label_fuel: "எரிபொருள் ஓட்டம்",
    ed_ch4_val_fuel: "2.4 L/h",
    ed_ch4_label_battery: "பேட்டரி",
    ed_ch4_val_battery: "13.9 V, எச்சரிக்கை இல்லை",
    ed_ch4_wave_speed: "வேகத் தடம் (km/h)",
    ed_ch4_wave_volt: "பேட்டரி மின்னழுத்தம்",

    ed_ch5_title: "முழு வாகனக் குழுவும், ஒரே திரையில்",
    ed_ch5_body:
      "ஒற்றை வாகனத்திலிருந்து விரிவாகப் பார்த்து, உங்கள் குழுவின் ஒவ்வொரு செயலில் உள்ள வழித்தடம், ஓட்டுநர் பணிநேரம் மற்றும் சாலை வரி அல்லது சேவைப் புதுப்பிப்பைக் கண்காணிக்கவும்.",
    ed_ch5_scene_aria:
      "நேரடி வழித்தடங்களில் செல்லும் பல வாகனங்களைக் காட்டும் நகர வரைபடத்தின் நீல பால்பாயிண்ட் ஓவியம்",
    ed_ch5_ann_map: "நகரம் முழுவதும் செயலில் உள்ள வாகனங்கள்",

    ed_plans_heading: "நீங்கள் இயக்கும் வாகனங்களுக்கு மட்டுமே கட்டணம்.",
    ed_plans_intro:
      "குழு அளவு, தரவு வரலாறு மற்றும் பாதுகாப்பு அல்லது 4G தொகுதிகளுக்கு ஏற்ப திட்டத்தைத் தேர்ந்தெடுக்கவும்.",
    ed_dim_fleet_size: "குழு அளவு",
    ed_dim_fleet_size_val: "வாகனங்கள் மற்றும் ஓட்டுநர்கள்",
    ed_dim_retention: "தரவு வரலாறு",
    ed_dim_retention_val: "30, 90, 180, அல்லது 365 நாட்கள்",
    ed_dim_modules: "தொகுதிகள்",
    ed_dim_modules_val: "பாதுகாப்பு மதிப்பெண் மற்றும் 4G அலைவரிசை",
    ed_dim_reporting: "அறிக்கைகள்",
    ed_dim_reporting_val: "பயன்பாடு மற்றும் CSV ஏற்றுமதி",
    ed_plan_per_days: "{days} நாட்களுக்கு, விலைப்பட்டியல் மூலம் வசூலிக்கப்படும்",

    ed_preview_badge: "நேரடி கன்சோல் முன்னோட்டம்",
    ed_preview_caption: "CarLink வாகனக் குழு கன்சோல்",
    ed_preview_tab_map: "நேரடி குழு & வழித்தடங்கள்",
    ed_preview_tab_telemetry: "டெலிமெட்ரி & பாதுகாப்பு",
    ed_preview_tab_compliance: "இணக்கம் & சேவை",
    ed_preview_active_fleet: "செயலில் உள்ள வாகனங்கள்",
    ed_preview_speed_legend: "வேகத்திற்கேற்ப வழித்தட நிறம்",
    ed_preview_harsh_pin: "கடுமையான பிரேக்",
    ed_preview_driver: "ஓட்டுநர் பணிநேரம்",
    ed_preview_signal: "4G சிக்னல்",
    ed_preview_speed: "OBD-II வேகம்",
    ed_preview_voltage: "பேட்டரி மின்னழுத்தம்",
    ed_preview_fuel: "எரிபொருள் ஓட்டம்",
    ed_preview_mil: "இயந்திர எச்சரிக்கை",
    ed_preview_mil_clear: "சீரானது · கோளாறு இல்லை",
    ed_preview_status_online: "சமீபத்திய பாக்கெட்",
    ed_preview_status_stale: "பழைய தரவு",
    ed_preview_comp_roadtax: "சாலை வரி புதுப்பிப்பு",
    ed_preview_comp_insurance: "வாகனக் காப்பீடு",
    ed_preview_comp_puspakom: "PUSPAKOM ஆய்வு",
    ed_preview_comp_service: "10,000 கி.மீ சேவை",
    ed_preview_due_14d: "14 நாட்களில் காலாவதி",
    ed_preview_due_42d: "செல்லுபடி · 42 நாட்கள்",
    ed_preview_due_680km: "680 கி.மீ மீதமுள்ளது",
    ed_preview_due_ok: "செல்லுபடி · 118 நாட்கள்",

    ed_ch6_title: "இன்று ஒரு வாகனத்துடன் தொடங்குங்கள்.",
    ed_ch6_body:
      "OBD கேட்வேயை இணைத்து, ஓட்டுநர் அட்டையைத் தொட்டு, உங்கள் முதல் பயணத்தைக் கன்சோலில் பாருங்கள்.",
    ed_ch6_scene_aria:
      "தொடங்குங்கள் பொத்தானின் கீழ் அடிக்கோடிடும் நீல மை கோடு",
    ed_ch6_cta_plans: "திட்டங்களை ஒப்பிடுக",

    ed_footer_tagline:
      "செயலில் உள்ள வாகனக் குழுக்களுக்கான டெலிமெட்ரி, ஓட்டுநர் அட்டைப் பதிவு மற்றும் புதுப்பிப்புக் கண்காணிப்பு.",
    ed_footer_story_col: "எப்படி செயல்படுகிறது",
    ed_footer_platform_col: "தளம்",
    ed_footer_note:
      "OBD-II டெலிமெட்ரி, NFC பணிநேரப் பதிவு மற்றும் இணக்க நினைவூட்டல்கள் CarLink மூலம்.",
  },
};
