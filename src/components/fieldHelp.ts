import type { Locale } from "../i18n/messages";
import {
  ORIGINAL_FIELD_PREFIX,
  ORIGINAL_VALUE_PREFIX,
  TECHNICAL_FIELD_DESCRIPTIONS,
  TECHNICAL_FIELD_LABELS,
  TECHNICAL_VALUE_DESCRIPTIONS,
  TECHNICAL_VALUE_LABELS,
} from "../i18n/technicalTerms";

export type FieldHelpEntry = {
  label: string;
  description: string;
};

export const fieldHelp: Record<string, FieldHelpEntry> = {
  telemetry_interval_seconds: {
    label: "Telemetry interval (seconds)",
    description:
      "Time between OBD readings: 2–30 seconds, within your plan's minimum. Smaller intervals give more detail. Analytics currently use gaps up to 15 seconds; slower readings can leave mileage, fuel and braking estimates unavailable. Device settings take effect only after the installed collector applies them.",
  },
  harsh_braking_ms2: {
    label: "Harsh braking threshold (m/s²)",
    description:
      "Minimum rate of speed decrease counted as a braking observation. m/s² means metres per second per second. At 3 m/s², speed drops about 10.8 km/h in one second. Lower values record more events. Default: 3.0. This uses speed observations, not a calibrated risk or disciplinary assessment.",
  },
  rapid_acceleration_ms2: {
    label: "Rapid acceleration threshold (m/s²)",
    description:
      "Minimum rate of speed increase counted as an acceleration observation. At 3 m/s², speed rises about 10.8 km/h in one second. Lower values record more events. Default: 3.0. Gaps and sparse readings can miss short events.",
  },
  maf_air_fuel_ratio: {
    label: "MAF air-to-fuel ratio",
    description:
      "Air mass divided by fuel mass. Used to estimate petrol fuel consumption from the Mass Air Flow sensor when OBD fuel-rate data is missing. Default: 14.7. Not used as a replacement for a directly reported fuel rate or for unsupported fuel types.",
  },
  maf_fuel_density_g_per_litre: {
    label: "Fuel density (g/L)",
    description:
      "Mass of one litre of fuel in grams. Converts the MAF fuel estimate into litres. Default for petrol: 745 g/L. Use an appropriate measured value; estimated consumption is not a fuel-meter reading.",
  },
  co2_petrol_kg_per_litre: {
    label: "Petrol CO₂ emission factor (kg/L)",
    description:
      "Estimated tank-to-wheel CO₂ emitted per litre of petrol burned. Default: 2.31 kg CO₂/L. Used to calculate estimated CO₂ emissions on petrol and hybrid vehicles.",
  },
  co2_diesel_kg_per_litre: {
    label: "Diesel CO₂ emission factor (kg/L)",
    description:
      "Estimated tank-to-wheel CO₂ emitted per litre of diesel burned. Default: 2.68 kg CO₂/L. Used to calculate estimated CO₂ emissions on diesel vehicles.",
  },
  device_offline_after_s: {
    label: "Stale reading threshold (seconds)",
    description:
      "A vehicle's last captured reading becomes stale after this age. Default: 180 seconds. A stale reading does not by itself prove that the device or mobile network is offline.",
  },
  email_digest_hour: {
    label: "Daily email hour",
    description:
      "Hour in the organization timezone, from 0 (midnight) to 23 (11 pm). Reports cover the previous completed day and are generated after this hour. Default: 8 am.",
  },
  email_weekly_iso_day: {
    label: "Weekly email day",
    description:
      "Organization-local weekday for weekly driver summaries. Default: Monday. The summary covers the previous completed week.",
  },
  email_subscription_warning_days: {
    label: "Subscription renewal reminder (days)",
    description:
      "How many days before the paid subscription expires to send a renewal reminder. Default: 30. Compliance reminders have their own separate lead times.",
  },
  email_organization_daily: {
    label: "Organization daily summary",
    description:
      "Email authorized organization staff the previous day's driving, braking and acceleration summary. Default: on. Requires a running scheduler, mail worker and eligible recipients.",
  },
  email_driver_daily: {
    label: "Driver daily summary",
    description:
      "Email each eligible driver only their own attributed driving analytics for the previous day. Default: on.",
  },
  email_driver_weekly: {
    label: "Driver weekly driving events",
    description:
      "Email each eligible driver their own weekly braking and acceleration summary. Default: on. Safety metrics require the plan's safety feature.",
  },
  email_score_changes: {
    label: "Safety score updates",
    description:
      "Email an eligible driver when their available score changes. This is based on the current observation-count algorithm, not a calibrated driving-risk assessment.",
  },
  telemetry_min_seconds: {
    label: "Minimum telemetry interval (seconds)",
    description:
      "The shortest OBD reading interval this plan allows, between 2 and 30 seconds. For example, 5 prevents an organization selecting 2 seconds. Current analytics use intervals up to 15 seconds; slower plans can leave estimates unavailable.",
  },
  vehicle_limit: {
    label: "Vehicle limit",
    description:
      "Maximum number of non-archived vehicles an organization can register under this plan. Registering a vehicle automatically reserves a pending device; installation is separate.",
  },
  driver_limit: {
    label: "Driver limit",
    description:
      "Maximum number of registered driver profiles under this plan. A suspended driver still counts toward the limit.",
  },
  retention_days: {
    label: "Driver history retention (days)",
    description:
      "How long driver observations and history remain available: 30, 90, 180 or 365 days. Financial and independent audit evidence follow separate retention rules.",
  },
  cellular_enabled: {
    label: "4G & coverage feature",
    description:
      "Allow cellular coverage features for this plan. Enabling it does not install or activate a physical 4G module.",
  },
  safety_enabled: {
    label: "Driver safety feature",
    description:
      "Allow braking and acceleration observations, threshold settings and appeals. A configured feature is not proof of calibrated safety-scoring accuracy.",
  },
  period_days: {
    label: "Billing period (days)",
    description:
      "Length of the paid subscription period, between 1 and 365 days. Renewals cannot override a SaaS suspension or deactivation.",
  },
  warning_days: {
    label: "Renewal reminder lead time (days)",
    description:
      "Send the reminder this many days before the compliance item expires. Default: 30. Set each road tax, insurance, PUSPAKOM or other compliance type separately.",
  },
  obd_bluetooth_mac: {
    label: "OBD Bluetooth MAC address",
    description:
      "The adapter's hardware Bluetooth address, for example AA:BB:CC:DD:EE:FF. It is different from the random OBD UUID. Saving it prepares installation configuration; it does not prove a connection.",
  },
  rsrp: {
    label: "RSRP (dBm)",
    description:
      "Reference signal received power. Values closer to zero generally mean a stronger mobile signal. Compare only readings from compatible radio modes; missing readings are unknown.",
  },
  sinr: {
    label: "SINR (dB)",
    description:
      "Signal-to-interference-plus-noise ratio. Higher values generally mean a clearer mobile signal. Missing packets alone are not evidence of a coverage dead zone.",
  },
  acknowledge_interruption: {
    label: "Acknowledge telemetry interruption",
    description:
      "Running an extended OBD diagnostic scan temporarily interrupts normal telemetry collection on the device and requires the vehicle to remain stationary.",
  },
  compliance_type_name: {
    label: "Compliance type",
    description:
      "Category of the compliance requirement (for example, Road Tax, Insurance, or PUSPAKOM inspection). Reminder lead times are configured per compliance type.",
  },
  evidence_reference: {
    label: "Evidence reference",
    description:
      "Reviewed supporting-document reference required before a pending compliance renewal can be verified. The system records this reference without validating the external document.",
  },
  obd_uuid: {
    label: "OBD UUID",
    description:
      "Random service UUID advertised by the OBD Bluetooth adapter. It is distinct from the adapter's hardware Bluetooth MAC address (obd_bluetooth_mac).",
  },
};

export const localizedFieldHelp: Record<
  Locale,
  Record<string, FieldHelpEntry>
> = {
  en: fieldHelp,
  ms: {
    telemetry_interval_seconds: {
      label: "Selang telemetri (saat)",
      description:
        "Masa antara bacaan OBD: 2–30 saat, mengikut had minimum pelan anda. Selang lebih pendek memberi butiran lebih terperinci. Analitik kini menggunakan jurang hingga 15 saat; bacaan lebih perlahan boleh menyebabkan anggaran jarak, bahan api dan brek tidak tersedia. Tetapan hanya berkuat kuasa selepas peranti mengaplikasikannya.",
    },
    harsh_braking_ms2: {
      label: "Ambang brek keras (m/s²)",
      description:
        "Kadar pengurangan kelajuan minimum yang dikira sebagai pemerhatian brek keras. m/s² bermaksud meter sesaat kuasa dua. Pada 3 m/s², kelajuan turun kira-kira 10.8 km/j dalam satu saat. Nilai lebih rendah merekodkan lebih banyak kejadian. Lalai: 3.0. Ini menggunakan pemerhatian kelajuan, bukan penilaian risiko atau disiplin yang ditentukur.",
    },
    rapid_acceleration_ms2: {
      label: "Ambang pecutan mendadak (m/s²)",
      description:
        "Kadar peningkatan kelajuan minimum yang dikira sebagai pemerhatian pecutan. Pada 3 m/s², kelajuan meningkat kira-kira 10.8 km/j dalam satu saat. Nilai lebih rendah merekodkan lebih banyak kejadian. Lalai: 3.0. Jurang dan bacaan jarang boleh terlepas kejadian singkat.",
    },
    maf_air_fuel_ratio: {
      label: "Nisbah udara-bahan api MAF",
      description:
        "Jisim udara dibahagi dengan jisim bahan api. Digunakan untuk menganggar penggunaan petrol daripada penderia Aliran Jisim Udara apabila data kadar bahan api OBD tiada. Lalai: 14.7. Tidak menggantikan kadar bahan api terus atau untuk jenis bahan api tidak disokong.",
    },
    maf_fuel_density_g_per_litre: {
      label: "Ketumpatan bahan api (g/L)",
      description:
        "Jisim satu liter bahan api dalam gram. Menukar anggaran bahan api MAF kepada liter. Lalai bagi petrol: 745 g/L. Gunakan nilai terukur yang sesuai; penggunaan anggaran bukan bacaan meter bahan api sebenar.",
    },
    co2_petrol_kg_per_litre: {
      label: "Faktor pelepasan CO₂ petrol (kg/L)",
      description:
        "Anggaran pelepasan CO₂ bagi setiap liter petrol yang dibakar. Lalai: 2.31 kg CO₂/L. Digunakan untuk mengira anggaran pelepasan CO₂ kenderaan petrol dan hibrid.",
    },
    co2_diesel_kg_per_litre: {
      label: "Faktor pelepasan CO₂ diesel (kg/L)",
      description:
        "Anggaran pelepasan CO₂ bagi setiap liter diesel yang dibakar. Lalai: 2.68 kg CO₂/L. Digunakan untuk mengira anggaran pelepasan CO₂ kenderaan diesel.",
    },
    device_offline_after_s: {
      label: "Ambang bacaan lapuk (saat)",
      description:
        "Bacaan terakhir kenderaan dianggap lapuk selepas tempoh ini. Lalai: 180 saat. Bacaan lapuk tidak semestinya membuktikan peranti atau rangkaian mudah alih terputus.",
    },
    email_digest_hour: {
      label: "Jam e-mel harian",
      description:
        "Jam mengikut zon waktu organisasi, dari 0 (tengah malam) hingga 23 (11 malam). Laporan merangkumi hari lengkap sebelumnya dan dijana selepas jam ini. Lalai: 8 pagi.",
    },
    email_weekly_iso_day: {
      label: "Hari e-mel mingguan",
      description:
        "Hari minggu setempat organisasi untuk ringkasan pemandu mingguan. Lalai: Isnin. Ringkasan merangkumi minggu lengkap sebelumnya.",
    },
    email_subscription_warning_days: {
      label: "Peringatan pembaharuan langganan (hari)",
      description:
        "Berapa hari sebelum langganan berbayar tamat tempoh untuk menghantar peringatan pembaharuan. Lalai: 30. Peringatan pematuhan mempunyai tempoh masa berasingan.",
    },
    email_organization_daily: {
      label: "Ringkasan harian organisasi",
      description:
        "E-mel kepada kakitangan organisasi yang dibenarkan mengenai ringkasan pemanduan, brek dan pecutan hari sebelumnya. Lalai: aktif. Memerlukan penjadual, pekerja mel dan penerima layak.",
    },
    email_driver_daily: {
      label: "Ringkasan harian pemandu",
      description:
        "E-mel kepada setiap pemandu yang layak hanya analitik pemanduan mereka sendiri bagi hari sebelumnya. Lalai: aktif.",
    },
    email_driver_weekly: {
      label: "Kejadian pemanduan mingguan pemandu",
      description:
        "E-mel kepada setiap pemandu yang layak ringkasan brek dan pecutan mingguan mereka sendiri. Lalai: aktif. Metrik keselamatan memerlukan ciri keselamatan dalam pelan.",
    },
    email_score_changes: {
      label: "Kemas kini skor keselamatan",
      description:
        "E-mel kepada pemandu yang layak apabila skor tersedia mereka berubah. Ini berdasarkan algoritma kiraan pemerhatian semasa, bukan penilaian risiko pemanduan yang ditentukur.",
    },
    telemetry_min_seconds: {
      label: "Selang telemetri minimum (saat)",
      description:
        "Selang bacaan OBD terpendek yang dibenarkan oleh pelan ini, antara 2 hingga 30 saat. Contohnya, 5 menghalang organisasi memilih 2 saat. Analitik kini menggunakan selang hingga 15 saat; pelan lebih perlahan boleh menyebabkan anggaran tidak tersedia.",
    },
    vehicle_limit: {
      label: "Had kenderaan",
      description:
        "Bilangan maksimum kenderaan tidak diarkibkan yang boleh didaftarkan organisasi di bawah pelan ini. Mendaftar kenderaan secara automatik menempah peranti menunggu; pemasangan dilakukan berasingan.",
    },
    driver_limit: {
      label: "Had pemandu",
      description:
        "Bilangan maksimum profil pemandu berdaftar di bawah pelan ini. Pemandu yang digantung masih dikira dalam had ini.",
    },
    retention_days: {
      label: "Simpanan sejarah pemandu (hari)",
      description:
        "Tempoh pemerhatian dan sejarah pemandu kekal tersedia: 30, 90, 180 atau 365 hari. Rekod kewangan dan audit bebas mengikut peraturan simpanan berasingan.",
    },
    cellular_enabled: {
      label: "Ciri 4G & liputan",
      description:
        "Benarkan ciri liputan selular untuk pelan ini. Mengaktifkannya tidak memasang atau mengaktifkan modul 4G fizikal secara automatik.",
    },
    safety_enabled: {
      label: "Ciri keselamatan pemandu",
      description:
        "Benarkan pemerhatian brek dan pecutan, tetapan ambang serta rayuan. Ciri yang dikonfigurasikan bukan bukti ketepatan pemarkahan keselamatan yang ditentukur.",
    },
    period_days: {
      label: "Tempoh pengebilan (hari)",
      description:
        "Tempoh langganan berbayar, antara 1 hingga 365 hari. Pembaharuan tidak boleh mengatasi penggantungan atau penyahaktifan SaaS.",
    },
    warning_days: {
      label: "Tempoh peringatan pembaharuan (hari)",
      description:
        "Hantar peringatan beberapa hari ini sebelum item pematuhan tamat tempoh. Lalai: 30. Tetapkan cukai jalan, insurans, PUSPAKOM atau jenis pematuhan lain secara berasingan.",
    },
    obd_bluetooth_mac: {
      label: "Alamat MAC Bluetooth OBD",
      description:
        "Alamat perkakasan Bluetooth penyesuai, contohnya AA:BB:CC:DD:EE:FF. Ia berbeza daripada UUID OBD rawak. Menyimpannya menyediakan konfigurasi pemasangan; ia tidak membuktikan sambungan.",
    },
    rsrp: {
      label: "RSRP (dBm)",
      description:
        "Kuasa Isyarat Rujukan Diterima. Nilai lebih hampir kepada sifar lazimnya bermaksud isyarat mudah alih lebih kuat. Bandingkan bacaan daripada mod radio yang serasi sahaja; bacaan tiada tidak diketahui.",
    },
    sinr: {
      label: "SINR (dB)",
      description:
        "Nisbah isyarat kepada gangguan dan hingar. Nilai lebih tinggi lazimnya bermaksud isyarat mudah alih lebih jelas. Paket hilang semata-mata bukan bukti zon mati liputan.",
    },
    acknowledge_interruption: {
      label: "Akui gangguan telemetri",
      description:
        "Menjalankan imbasan diagnostik OBD lanjutan akan menghentikan sementara pengumpulan telemetri biasa pada peranti dan memerlukan kenderaan kekal pegun.",
    },
    compliance_type_name: {
      label: "Jenis pematuhan",
      description:
        "Kategori keperluan pematuhan (contohnya Cukai Jalan, Insurans, atau pemeriksaan PUSPAKOM). Tempoh masa peringatan dikonfigurasikan mengikut jenis pematuhan.",
    },
    evidence_reference: {
      label: "Rujukan bukti",
      description:
        "Rujukan dokumen sokongan yang telah disemak yang diperlukan sebelum pembaharuan pematuhan tertunggak boleh disahkan. Sistem merekodkan rujukan ini tanpa mengesahkan dokumen luaran.",
    },
    obd_uuid: {
      label: "UUID OBD",
      description:
        "UUID perkhidmatan rawak yang diiklankan oleh penyesuai Bluetooth OBD. Ia berbeza daripada alamat MAC Bluetooth perkakasan penyesuai (obd_bluetooth_mac).",
    },
  },
  zh: {
    telemetry_interval_seconds: {
      label: "遥测采集间隔（秒）",
      description:
        "两次 OBD 读数之间的时间间隔（2–30 秒，且不低于套餐允许的最小值）。间隔越小细节越丰富。当前分析最多支持 15 秒内的连续间隔；过慢可能导致里程、油耗与急刹估算不可用。设备需应用新配置后才会生效。",
    },
    harsh_braking_ms2: {
      label: "急刹车阈值 (m/s²)",
      description:
        "计为一次急刹观察的最小减速度阈值。m/s² 表示米每二次方秒；在 3 m/s² 时车速每秒约下降 10.8 km/h。数值越低记录的事件越多，默认 3.0。该指标基于车速观测，并非经过校准的风险或纪律评定。",
    },
    rapid_acceleration_ms2: {
      label: "急加速阈值 (m/s²)",
      description:
        "计为一次急加速观察的最小加速度阈值。在 3 m/s² 时车速每秒约提升 10.8 km/h。数值越低记录的事件越多，默认 3.0。数据中断或采样稀疏可能遗漏短暂事件。",
    },
    maf_air_fuel_ratio: {
      label: "MAF 空燃比",
      description:
        "进入发动机的空气质量与燃油质量之比。当缺少 OBD 直接油耗速率时，用于通过空气流量传感器估算汽油消耗，默认 14.7。不会替代直接上报的油耗速率，也不适用于不支持的燃料类型。",
    },
    maf_fuel_density_g_per_litre: {
      label: "燃油密度 (g/L)",
      description:
        "每升燃油的质量（克），用于将 MAF 油耗估算值换算为升。汽油默认 745 g/L。请填写合适的实测参考值；估算值并非真实加油机或油表计量。",
    },
    co2_petrol_kg_per_litre: {
      label: "汽油 CO₂ 排放系数 (kg/L)",
      description:
        "每消耗一升汽油估算排放的 CO₂ 千克数，默认 2.31 kg CO₂/L。用于估算汽油和混合动力车辆的 CO₂ 排放量。",
    },
    co2_diesel_kg_per_litre: {
      label: "柴油 CO₂ 排放系数 (kg/L)",
      description:
        "每消耗一升柴油估算排放的 CO₂ 千克数，默认 2.68 kg CO₂/L。用于估算柴油车辆的 CO₂ 排放量。",
    },
    device_offline_after_s: {
      label: "数据过期阈值（秒）",
      description:
        "车辆最新采集读数超过此时长后将被标记为过时，默认 180 秒。读数过时本身并不能直接证明设备或移动网络已离线。",
    },
    email_digest_hour: {
      label: "每日邮件发送时间（小时）",
      description:
        "按组织所在时区计算的小时数，范围 0（午夜）至 23（晚上 11 点）。报告统计前一个完整自然日的数据并在该小时之后生成，默认上午 8 点。",
    },
    email_weekly_iso_day: {
      label: "每周邮件发送日",
      description:
        "用于发送每周驾驶员汇总报告的组织本地星期几，默认周一。报告统计上一个完整自然周的数据。",
    },
    email_subscription_warning_days: {
      label: "订阅续费提醒提前天数",
      description:
        "在付费订阅到期前多少天发送续费提醒，默认 30 天。车辆合规到期提醒单独配置。",
    },
    email_organization_daily: {
      label: "组织每日汇总邮件",
      description:
        "向已授权的组织工作人员发送前一天的驾驶、刹车和加速汇总邮件，默认开启。需要调度器、邮件服务及符合条件的收件人。",
    },
    email_driver_daily: {
      label: "驾驶员每日汇总邮件",
      description:
        "仅向每位符合条件的驾驶员发送其本人前一天归属驾驶记录的汇总分析，默认开启。",
    },
    email_driver_weekly: {
      label: "驾驶员每周驾驶事件邮件",
      description:
        "向每位符合条件的驾驶员发送其本人每周急刹与急加速汇总邮件，默认开启。安全指标需要套餐包含安全功能。",
    },
    email_score_changes: {
      label: "安全评分变更通知",
      description:
        "当符合条件的驾驶员可用评分发生变化时发送邮件通知。该评分基于当前观测计数算法，并非经过校准的驾驶风险评估。",
    },
    telemetry_min_seconds: {
      label: "最小遥测间隔（秒）",
      description:
        "该套餐允许配置的最短 OBD 采样间隔（2 至 30 秒）。例如设为 5 将禁止组织选择 2 秒。当前分析支持最多 15 秒的间隔；更长的间隔会导致部分估算不可用。",
    },
    vehicle_limit: {
      label: "车辆数量上限",
      description:
        "该套餐下组织可注册的非归档车辆最大数量。注册车辆会自动预留待安装设备记录，实际硬件安装另行完成。",
    },
    driver_limit: {
      label: "驾驶员数量上限",
      description:
        "该套餐下可注册的驾驶员档案最大数量。已暂停的驾驶员仍计入此上限。",
    },
    retention_days: {
      label: "驾驶历史保留天数",
      description:
        "驾驶员观测记录与历史数据的可查询保留时长：30、90、180 或 365 天。财务与独立审计凭证遵循单独的保留规则。",
    },
    cellular_enabled: {
      label: "4G 与网络覆盖功能",
      description:
        "为此套餐启用蜂窝网络覆盖相关功能。启用此开关不会自动安装或激活物理 4G 硬件模块。",
    },
    safety_enabled: {
      label: "驾驶安全功能",
      description:
        "允许使用急刹与急加速观测、阈值设置和申诉流程。启用此功能不代表安全评分经过专业校准。",
    },
    period_days: {
      label: "计费周期（天）",
      description:
        "付费订阅的周期长度（1 至 365 天）。续费操作无法覆盖 SaaS 平台级暂停或停用状态。",
    },
    warning_days: {
      label: "续期提醒提前天数",
      description:
        "在合规项到期前多少天发送提醒，默认 30 天。路税、保险、PUSPAKOM 验车等各类合规项目分别设置。",
    },
    obd_bluetooth_mac: {
      label: "OBD 蓝牙 MAC 地址",
      description:
        "OBD 适配器的硬件蓝牙地址，例如 AA:BB:CC:DD:EE:FF，与随机的 OBD UUID 不同。保存后仅用于准备安装配置，并不证明当前已连接。",
    },
    rsrp: {
      label: "RSRP (dBm)",
      description:
        "参考信号接收功率。数值越接近 0 通常代表移动信号越强。请仅在兼容的无线制式之间进行比较；缺失读数表示未知。",
    },
    sinr: {
      label: "SINR (dB)",
      description:
        "信号与干扰加噪声比。数值越高通常代表移动信号越清晰。仅出现丢包不足以证明当地存在信号盲区。",
    },
    acknowledge_interruption: {
      label: "确认遥测采集短暂中断",
      description:
        "执行扩展 OBD 诊断扫描会暂时中断设备上的常规遥测采集，且要求车辆全程保持静止。",
    },
    compliance_type_name: {
      label: "合规类型",
      description:
        "合规要求的类别（例如路税 Road Tax、保险 Insurance 或 PUSPAKOM 验车）。提醒提前天数按合规类型分别配置。",
    },
    evidence_reference: {
      label: "凭证参考编号",
      description:
        "在验证待审合规续期前必须提供的已审核证明文件参考编号。系统仅记录该编号，不会自动校验外部文档真伪。",
    },
    obd_uuid: {
      label: "OBD UUID",
      description:
        "OBD 蓝牙适配器广播的随机服务 UUID，与适配器硬件的蓝牙 MAC 地址 (obd_bluetooth_mac) 不同。",
    },
  },
  ta: {
    telemetry_interval_seconds: {
      label: "டெலிமெட்ரி இடைவெளி (வினாடிகள்)",
      description:
        "OBD அளவீடுகளுக்கு இடையேயான நேரம்: 2–30 வினாடிகள் (உங்கள் திட்டத்தின் குறைந்தபட்ச வரம்பிற்குள்). சிறிய இடைவெளி கூடுதல் விவரங்களைத் தரும். தற்போதைய பகுப்பாய்வு 15 வினாடிகள் வரையிலான இடைவெளியைப் பயன்படுத்துகிறது; மெதுவான இடைவெளியில் எரிபொருள் மற்றும் பிரேக் மதிப்பீடுகள் கிடைக்காமல் போகலாம். சாதனம் அமைப்பைப் பெற்ற பிறகே இது செயல்படும்.",
    },
    harsh_braking_ms2: {
      label: "கடுமையான பிரேக்கிங் வரம்பு (m/s²)",
      description:
        "கடுமையான பிரேக் பதிவாகக் கணக்கிடப்படும் குறைந்தபட்ச வேகக் குறைப்பு விகிதம். m/s² என்பது வினாடிக்கு மீட்டர்/வினாடி ஆகும். 3 m/s² வேகக் குறைப்பில் ஒரு வினாடியில் வேகம் சுமார் 10.8 km/h குறையும். குறைந்த மதிப்புகள் அதிக நிகழ்வுகளைப் பதிவு செய்யும். இயல்புநிலை: 3.0. இது வேக அளவீடுகளை அடிப்படையாகக் கொண்டது; அளவுத்திருத்தப்பட்ட இடர் மதிப்பீடு அல்ல.",
    },
    rapid_acceleration_ms2: {
      label: "திடீர் முடுக்க வரம்பு (m/s²)",
      description:
        "திடீர் முடுக்கப் பதிவாகக் கணக்கிடப்படும் குறைந்தபட்ச வேக அதிகரிப்பு விகிதம். 3 m/s² வேகத்தில் ஒரு வினாடியில் வேகம் சுமார் 10.8 km/h உயரும். குறைந்த மதிப்புகள் அதிக நிகழ்வுகளைப் பதிவு செய்யும். இயல்புநிலை: 3.0. தரவு இடைவெளிகள் குறுகிய நிகழ்வுகளைத் தவறவிடலாம்.",
    },
    maf_air_fuel_ratio: {
      label: "MAF காற்று-எரிபொருள் விகிதம்",
      description:
        "காற்றின் நிறையை எரிபொருள் நிறையால் வகுத்த விகிதம். OBD எரிபொருள் விகிதத் தரவு இல்லாதபோது MAF சென்சாரிலிருந்து பெட்ரோல் நுகர்வைக் கணக்கிடப் பயன்படுகிறது. இயல்புநிலை: 14.7. நேரடி எரிபொருள் அளவிற்கு மாற்றாகவோ ஆதரிக்கப்படாத எரிபொருட்களுக்கோ பயன்படுத்தப்படாது.",
    },
    maf_fuel_density_g_per_litre: {
      label: "எரிபொருள் அடர்த்தி (g/L)",
      description:
        "ஒரு லிட்டர் எரிபொருளின் நிறை கிராமில். MAF எரிபொருள் மதிப்பீட்டை லிட்டராக மாற்றப் பயன்படுகிறது. பெட்ரோலுக்கான இயல்புநிலை: 745 g/L. பொருத்தமான அளவிடப்பட்ட மதிப்பைப் பயன்படுத்தவும்; கணக்கிடப்பட்ட அளவு எரிபொருள் மீட்டர் அளவு அல்ல.",
    },
    co2_petrol_kg_per_litre: {
      label: "பெட்ரோல் CO₂ உமிழ்வு காரணி (kg/L)",
      description:
        "ஒரு லிட்டர் பெட்ரோல் எரிக்கப்படும்போது வெளிப்படும் மதிப்பிடப்பட்ட CO₂ அளவு. இயல்புநிலை: 2.31 kg CO₂/L. பெட்ரோல் மற்றும் ஹைப்ரிட் வாகனங்களின் CO₂ உமிழ்வைக் கணக்கிடப் பயன்படுகிறது.",
    },
    co2_diesel_kg_per_litre: {
      label: "டீசல் CO₂ உமிழ்வு காரணி (kg/L)",
      description:
        "ஒரு லிட்டர் டீசல் எரிக்கப்படும்போது வெளிப்படும் மதிப்பிடப்பட்ட CO₂ அளவு. இயல்புநிலை: 2.68 kg CO₂/L. டீசல் வாகனங்களின் CO₂ உமிழ்வைக் கணக்கிடப் பயன்படுகிறது.",
    },
    device_offline_after_s: {
      label: "பழைய தரவு வரம்பு (வினாடிகள்)",
      description:
        "இந்த நேரத்திற்குப் பிறகு வாகனத்தின் கடைசிப் பதிவு பழையதாகக் கருதப்படும். இயல்புநிலை: 180 வினாடிகள். பழைய தரவு என்பதால் சாதனமோ நெட்வொர்க்கோ ஆஃப்லைனில் உள்ளது என்று உறுதியாகக் கூற முடியாது.",
    },
    email_digest_hour: {
      label: "தினசரி மின்னஞ்சல் நேரம் (மணி)",
      description:
        "நிறுவனத்தின் நேர மண்டலப்படி மணி நேரம், 0 (நள்ளிரவு) முதல் 23 (இரவு 11 மணி) வரை. முந்தைய முழு நாளுக்கான அறிக்கைகள் இந்த நேரத்திற்குப் பிறகு உருவாக்கப்படும். இயல்புநிலை: காலை 8 மணி.",
    },
    email_weekly_iso_day: {
      label: "வாராந்திர மின்னஞ்சல் நாள்",
      description:
        "வாராந்திர ஓட்டுநர் சுருக்கத்திற்கான நிறுவன உள்ளூர் வார நாள். இயல்புநிலை: திங்கள். முந்தைய முழு வாரத்தின் தரவு இதில் அடங்கும்.",
    },
    email_subscription_warning_days: {
      label: "சந்தா புதுப்பித்தல் நினைவூட்டல் (நாட்கள்)",
      description:
        "கட்டணச் சந்தா காலாவதியாகும் எத்தனை நாட்களுக்கு முன் புதுப்பித்தல் நினைவூட்டல் அனுப்ப வேண்டும். இயல்புநிலை: 30. இணக்க நினைவூட்டல்களுக்குத் தனி கால அளவுகள் உள்ளன.",
    },
    email_organization_daily: {
      label: "நிறுவன தினசரி சுருக்கம்",
      description:
        "அங்கீகரிக்கப்பட்ட நிறுவனப் பணியாளர்களுக்கு முந்தைய நாளின் ஓட்டுநர், பிரேக் மற்றும் முடுக்கச் சுருக்கத்தை மின்னஞ்சல் செய்க. இயல்புநிலை: இயக்கம். இதற்கு அட்டவணைச் சேவை, மின்னஞ்சல் சேவை மற்றும் தகுதியான பெறுநர்கள் தேவை.",
    },
    email_driver_daily: {
      label: "ஓட்டுநர் தினசரி சுருக்கம்",
      description:
        "தகுதியான ஒவ்வொரு ஓட்டுநருக்கும் முந்தைய நாளின் அவர்களுக்குரிய ஓட்டுநர் பகுப்பாய்வை மட்டும் மின்னஞ்சல் செய்க. இயல்புநிலை: இயக்கம்.",
    },
    email_driver_weekly: {
      label: "ஓட்டுநர் வாராந்திர ஓட்டுநர் நிகழ்வுகள்",
      description:
        "தகுதியான ஒவ்வொரு ஓட்டுநருக்கும் அவர்களின் வாராந்திர பிரேக் மற்றும் முடுக்கச் சுருக்கத்தை மின்னஞ்சல் செய்க. இயல்புநிலை: இயக்கம். பாதுகாப்பு அளவீடுகளுக்குத் திட்டத்தில் பாதுகாப்பு அம்சம் இருக்க வேண்டும்.",
    },
    email_score_changes: {
      label: "பாதுகாப்பு மதிப்பெண் மாற்றங்கள்",
      description:
        "தகுதியான ஓட்டுநரின் மதிப்பெண் மாறும்போது மின்னஞ்சல் அனுப்புக. இது தற்போதைய பதிவு எண்ணிக்கை வழிமுறையை அடிப்படையாகக் கொண்டது; அளவுத்திருத்தப்பட்ட இடர் மதிப்பீடு அல்ல.",
    },
    telemetry_min_seconds: {
      label: "குறைந்தபட்ச டெலிமெட்ரி இடைவெளி (வினாடிகள்)",
      description:
        "இந்தத் திட்டம் அனுமதிக்கும் மிகக் குறுகிய OBD அளவீட்டு இடைவெளி (2 முதல் 30 வினாடிகள்). எ.கா., 5 என அமைத்தால் நிறுவனம் 2 வினாடிகளைத் தேர்ந்தெடுக்க முடியாது. தற்போதைய பகுப்பாய்வு 15 வினாடிகள் வரை பயன்படுத்துகிறது; மெதுவான திட்டங்களில் சில மதிப்பீடுகள் கிடைக்காது.",
    },
    vehicle_limit: {
      label: "வாகன வரம்பு",
      description:
        "இந்தத் திட்டத்தின் கீழ் ஒரு நிறுவனம் பதிவு செய்யக்கூடிய காப்பகப்படுத்தப்படாத அதிகபட்ச வாகனங்களின் எண்ணிக்கை. வாகனத்தைப் பதிவு செய்யும்போது காத்திருக்கும் சாதனம் ஒதுக்கப்படும்; நிறுவல் தனிப் பணியாகும்.",
    },
    driver_limit: {
      label: "ஓட்டுநர் வரம்பு",
      description:
        "இந்தத் திட்டத்தின் கீழ் பதிவு செய்யக்கூடிய அதிகபட்ச ஓட்டுநர் சுயவிவரங்களின் எண்ணிக்கை. இடைநீக்கம் செய்யப்பட்ட ஓட்டுநரும் இந்த வரம்பில் கணக்கிடப்படுவார்.",
    },
    retention_days: {
      label: "ஓட்டுநர் வரலாறு சேமிப்பு (நாட்கள்)",
      description:
        "ஓட்டுநர் பதிவுகள் மற்றும் வரலாறு எத்தனை நாட்கள் அணுகக்கூடியதாக இருக்கும்: 30, 90, 180 அல்லது 365 நாட்கள். நிதி மற்றும் தணிக்கை ஆவணங்கள் தனி விதிகளைப் பின்பற்றும்.",
    },
    cellular_enabled: {
      label: "4G & சிக்னல் கவரேஜ் அம்சம்",
      description:
        "இந்தத் திட்டத்திற்கு செல்லுலார் கவரேஜ் அம்சங்களை அனுமதிக்கவும். இதை இயக்குவது இயற்பியல் 4G தொகுதியைத் தானாக நிறுவவோ இயக்கவோ செய்யாது.",
    },
    safety_enabled: {
      label: "ஓட்டுநர் பாதுகாப்பு அம்சம்",
      description:
        "பிரேக் மற்றும் முடுக்கப் பதிவுகள், வரம்பு அமைப்புகள் மற்றும் மேல்முறையீடுகளை அனுமதிக்கவும். இந்த அம்சத்தை இயக்குவது அளவுத்திருத்தப்பட்ட பாதுகாப்பு மதிப்பெண் துல்லியத்திற்கான சான்று அல்ல.",
    },
    period_days: {
      label: "கட்டணக் காலம் (நாட்கள்)",
      description:
        "கட்டணச் சந்தா காலத்தின் நீளம், 1 முதல் 365 நாட்கள் வரை. புதுப்பித்தல்கள் SaaS இடைநீக்கம் அல்லது முடக்கத்தை மீற முடியாது.",
    },
    warning_days: {
      label: "புதுப்பித்தல் நினைவூட்டல் முன்னறிவிப்பு (நாட்கள்)",
      description:
        "இணக்க உருப்படி காலாவதியாகும் எத்தனை நாட்களுக்கு முன் நினைவூட்டல் அனுப்ப வேண்டும். இயல்புநிலை: 30. சாலை வரி, காப்பீடு, PUSPAKOM அல்லது பிற வகைகளுக்குத் தனித்தனியாக அமைக்கவும்.",
    },
    obd_bluetooth_mac: {
      label: "OBD புளூடூத் MAC முகவரி",
      description:
        "அடாப்டரின் வன்பொருள் புளூடூத் முகவரி, எ.கா. AA:BB:CC:DD:EE:FF. இது சீரற்ற OBD UUID-இலிருந்து வேறுபட்டது. இதைச் சேமிப்பது நிறுவல் உள்ளமைவைத் தயார் செய்யும்; இணைப்பை உறுதிப்படுத்தாது.",
    },
    rsrp: {
      label: "RSRP (dBm)",
      description:
        "குறிப்பு சிக்னல் பெறப்பட்ட திறன். பூஜ்ஜியத்திற்கு நெருக்கமான மதிப்புகள் வலுவான மொபைல் சிக்னலைக் குறிக்கும். இணக்கமான ரேடியோ பயன்முறை அளவீடுகளை மட்டுமே ஒப்பிடவும்; இல்லாத அளவீடுகள் தெரியாதவை.",
    },
    sinr: {
      label: "SINR (dB)",
      description:
        "சிக்னல்-இடையூறு-இரைச்சல் விகிதம். அதிக மதிப்புகள் தெளிவான மொபைல் சிக்னலைக் குறிக்கும். தரவுப் பொதிகள் விடுபடுவது மட்டுமே சிக்னல் இல்லாத பகுதி என்பதற்கான சான்று அல்ல.",
    },
    acknowledge_interruption: {
      label: "டெலிமெட்ரி இடையூறை ஒப்புக்கொள்க",
      description:
        "விரிவான OBD கண்டறிதல் ஸ்கேன் இயக்குவது சாதனத்தின் வழக்கமான டெலிமெட்ரி சேகரிப்பைத் தற்காலிகமாக நிறுத்தும்; மேலும் வாகனம் அசையாமல் இருக்க வேண்டும்.",
    },
    compliance_type_name: {
      label: "இணக்க வகை",
      description:
        "இணக்கத் தேவையின் வகை (எ.கா. சாலை வரி, காப்பீடு, அல்லது PUSPAKOM ஆய்வு). நினைவூட்டல் முன்னறிவிப்பு நாட்கள் ஒவ்வொரு இணக்க வகைக்கும் தனித்தனியாக அமைக்கப்படும்.",
    },
    evidence_reference: {
      label: "ஆதாரக் குறிப்பு",
      description:
        "நிலுவையில் உள்ள இணக்கப் புதுப்பித்தலைச் சரிபார்க்கும் முன் தேவைப்படும் மதிப்பாய்வு செய்யப்பட்ட ஆதார ஆவணக் குறிப்பு. வெளிப்புற ஆவணத்தைச் சரிபார்க்காமல் அமைப்பு இந்தக் குறிப்பைப் பதிவு செய்யும்.",
    },
    obd_uuid: {
      label: "OBD UUID",
      description:
        "OBD புளூடூத் அடாப்டரால் அறிவிக்கப்படும் சீரற்ற சேவை UUID. இது அடாப்டரின் வன்பொருள் புளூடூத் MAC முகவரியிலிருந்து (obd_bluetooth_mac) வேறுபட்டது.",
    },
  },
};

export function helpFor(
  name: string,
  locale: Locale = "en",
): { label: string; description: string; rawKey: string } | undefined {
  const rawKey = name.split(".").at(-1) ?? "";
  if (!rawKey) return undefined;

  const lang: Locale = locale in localizedFieldHelp ? locale : "en";
  const prefix = ORIGINAL_FIELD_PREFIX[lang] ?? ORIGINAL_FIELD_PREFIX.en;

  const settingsEntry =
    localizedFieldHelp[lang]?.[rawKey] ?? localizedFieldHelp.en[rawKey];
  if (settingsEntry) {
    return {
      label: settingsEntry.label,
      description: `${settingsEntry.description}\n(${prefix}: ${rawKey})`,
      rawKey,
    };
  }

  const techLabel =
    TECHNICAL_FIELD_LABELS[lang]?.[rawKey] ?? TECHNICAL_FIELD_LABELS.en[rawKey];
  const techDescription =
    TECHNICAL_FIELD_DESCRIPTIONS[lang]?.[rawKey] ??
    TECHNICAL_FIELD_DESCRIPTIONS.en[rawKey];
  if (techLabel && techDescription) {
    return {
      label: techLabel,
      description: `${techDescription}\n(${prefix}: ${rawKey})`,
      rawKey,
    };
  }

  return undefined;
}

export function valueHelpFor(
  rawValue: unknown,
  locale: Locale = "en",
): { label: string; description: string; rawValue: string } | undefined {
  if (typeof rawValue !== "string") return undefined;
  const key = rawValue.trim();
  if (!key) return undefined;

  const lang: Locale = locale in TECHNICAL_VALUE_LABELS ? locale : "en";
  const label =
    TECHNICAL_VALUE_LABELS[lang]?.[key] ?? TECHNICAL_VALUE_LABELS.en[key];
  const description =
    TECHNICAL_VALUE_DESCRIPTIONS[lang]?.[key] ??
    TECHNICAL_VALUE_DESCRIPTIONS.en[key];
  if (!label || !description) return undefined;

  const prefix = ORIGINAL_VALUE_PREFIX[lang] ?? ORIGINAL_VALUE_PREFIX.en;
  return {
    label,
    description: `${description}\n(${prefix}: ${key})`,
    rawValue: key,
  };
}
