import type { Locale } from "./messages";

type LocalizedText = Record<Locale, string>;

type TermEntry = {
  label: LocalizedText;
  description: LocalizedText;
};

export const ORIGINAL_FIELD_PREFIX: Record<Locale, string> = {
  en: "Original field",
  ms: "Medan asal",
  zh: "原始字段",
  ta: "மூலப் புலம்",
};

export const ORIGINAL_VALUE_PREFIX: Record<Locale, string> = {
  en: "Original value",
  ms: "Nilai asal",
  zh: "原始值",
  ta: "மூல மதிப்பு",
};

const FIELD_TERMS: Record<string, TermEntry> = {
  mil_on: {
    label: {
      en: "Check Engine Light (MIL)",
      ms: "Lampu Periksa Enjin (MIL)",
      zh: "发动机故障指示灯 (MIL)",
      ta: "என்ஜின் எச்சரிக்கை விளக்கு (MIL)",
    },
    description: {
      en: "Whether the vehicle's Malfunction Indicator Lamp (Check Engine light) is currently turned on by the ECU.",
      ms: "Menunjukkan sama ada Lampu Penunjuk Kerosakan (lampu periksa enjin) kenderaan sedang dinyalakan oleh ECU.",
      zh: "指示车辆 ECU 当前是否点亮了故障指示灯（即发动机警告灯）。",
      ta: "வாகனத்தின் ECU தற்போது என்ஜின் எச்சரிக்கை விளக்கை (MIL) ஒளிரச் செய்துள்ளதா என்பதைக் காட்டுகிறது.",
    },
  },
  has_dtc_fault: {
    label: {
      en: "Diagnostic Trouble Code (DTC) Fault",
      ms: "Kod Kerosakan Diagnostik (DTC) Aktif",
      zh: "存在诊断故障码 (DTC)",
      ta: "கண்டறியும் பிழைக் குறியீடு (DTC) உள்ளது",
    },
    description: {
      en: "Whether the vehicle's onboard diagnostics reported one or more active or stored trouble codes.",
      ms: "Menunjukkan sama ada sistem diagnostik kenderaan melaporkan satu atau lebih kod kerosakan aktif atau tersimpan.",
      zh: "指示车辆车载诊断系统是否报告了一个或多个当前或已存储的故障码。",
      ta: "வாகனத்தின் உள்ளகக் கண்டறிதல் அமைப்பு ஒன்று அல்லது அதற்கு மேற்பட்ட பிழைக் குறியீடுகளைப் பதிவு செய்துள்ளதா என்பதைக் காட்டுகிறது.",
    },
  },
  calculated_fuel_consumption: {
    label: {
      en: "Calculated Fuel Consumption",
      ms: "Penggunaan Bahan Api Dikira",
      zh: "计算燃油消耗",
      ta: "கணக்கிடப்பட்ட எரிபொருள் நுகர்வு",
    },
    description: {
      en: "Estimated or derived fuel consumption summary computed from OBD telemetry packets over the observed period.",
      ms: "Ringkasan anggaran penggunaan bahan api yang dikira daripada paket telemetri OBD sepanjang tempoh pemerhatian.",
      zh: "根据观测时段内的 OBD 遥测数据包计算或估算得出的燃油消耗汇总信息。",
      ta: "கண்காணிக்கப்பட்ட காலத்தில் OBD டெலிமெட்ரி தரவுகளிலிருந்து கணக்கிடப்பட்ட எரிபொருள் நுகர்வுச் சுருக்கம்.",
    },
  },
  rateLph: {
    label: {
      en: "Fuel Litres per Hour (L/h)",
      ms: "Liter Bahan Api Sejam (L/j)",
      zh: "每小时耗油量 (L/h)",
      ta: "மணிக்கு எரிபொருள் லிட்டர் (L/h)",
    },
    description: {
      en: "Current fuel burn rate in litres per hour, either read directly from the ECU or estimated from airflow.",
      ms: "Kadar pembakaran bahan api semasa dalam liter sejam, sama ada dibaca terus daripada ECU atau dianggarkan daripada aliran udara.",
      zh: "当前每小时燃油消耗速率（升/小时），可直接来自 ECU 或根据空气流量估算。",
      ta: "தற்போதைய மணிநேர எரிபொருள் பயன்பாட்டு விகிதம் (L/h); இது ECU-இல் இருந்து நேரடியாகவோ காற்றோட்டத்திலிருந்து கணக்கிடப்பட்டோ பெறப்படும்.",
    },
  },
  rateSource: {
    label: {
      en: "Fuel Calculation Method",
      ms: "Kaedah Pengiraan Bahan Api",
      zh: "油耗计算方式",
      ta: "எரிபொருள் கணக்கீட்டு முறை",
    },
    description: {
      en: "The method or sensor source used to determine the fuel consumption rate (for example, direct ECU reading or MAF estimate).",
      ms: "Kaedah atau sumber penderia yang digunakan untuk menentukan kadar penggunaan bahan api (contohnya bacaan terus ECU atau anggaran MAF).",
      zh: "用于确定油耗速率的方法或传感器来源（例如 ECU 直接读取或基于 MAF 的估算）。",
      ta: "எரிபொருள் நுகர்வு விகிதத்தைக் கணக்கிடப் பயன்படுத்தப்பட்ட முறை அல்லது சென்சார் மூலம் (எ.கா. நேரடி ECU அல்லது MAF மதிப்பீடு).",
    },
  },
  instantL100km: {
    label: {
      en: "Instant Fuel Consumption (L/100km)",
      ms: "Penggunaan Bahan Api Semasa (L/100km)",
      zh: "瞬时百公里油耗 (L/100km)",
      ta: "உடனடி எரிபொருள் நுகர்வு (L/100km)",
    },
    description: {
      en: "Instantaneous fuel usage per 100 km based on current speed and fuel rate. Lower values indicate better efficiency.",
      ms: "Penggunaan bahan api serta-merta bagi setiap 100 km berdasarkan kelajuan dan kadar bahan api semasa. Nilai lebih rendah lebih menjimatkan.",
      zh: "按当前车速与耗油速率计算的瞬时每百公里耗油量，数值越低表示越省油。",
      ta: "தற்போதைய வேகம் மற்றும் எரிபொருள் விகிதத்தின் அடிப்படையில் 100 கி.மீ.-க்கு உடனடி எரிபொருள் நுகர்வு. குறைந்த மதிப்பு சிறந்த சிக்கனத்தைக் குறிக்கும்.",
    },
  },
  totalLitres: {
    label: {
      en: "Total Fuel Consumed (L)",
      ms: "Jumlah Bahan Api Digunakan (L)",
      zh: "累计耗油量 (L)",
      ta: "மொத்த எரிபொருள் பயன்பாடு (L)",
    },
    description: {
      en: "Total estimated or measured litres of fuel consumed across the selected journey or telemetry window.",
      ms: "Jumlah keseluruhan liter bahan api yang digunakan atau dianggarkan sepanjang perjalanan atau tetingkap telemetri yang dipilih.",
      zh: "在所选行程或遥测时间窗口内累计消耗（或估算）的燃油总升数。",
      ta: "தேர்ந்தெடுக்கப்பட்ட பயணம் அல்லது கால அளவில் பயன்படுத்தப்பட்ட மொத்த எரிபொருள் அளவு (லிட்டரில்).",
    },
  },
  distanceKm: {
    label: {
      en: "Distance Travelled (km)",
      ms: "Jarak Perjalanan (km)",
      zh: "已行驶距离 (km)",
      ta: "பயணித்த தூரம் (km)",
    },
    description: {
      en: "Total distance covered during the trip or analysis period in kilometres.",
      ms: "Jumlah jarak yang dilalui sepanjang perjalanan atau tempoh analisis dalam kilometer.",
      zh: "在本次行程或分析周期内行驶的总里程（公里）。",
      ta: "பயணம் அல்லது பகுப்பாய்வுக் காலத்தில் கடக்கப்பட்ட மொத்த தூரம் (கிலோமீட்டரில்).",
    },
  },
  averageL100km: {
    label: {
      en: "Average Fuel Consumption (L/100km)",
      ms: "Purata Penggunaan Bahan Api (L/100km)",
      zh: "平均百公里油耗 (L/100km)",
      ta: "சராசரி எரிபொருள் நுகர்வு (L/100km)",
    },
    description: {
      en: "Average litres of fuel consumed per 100 km travelled over the trip or period. Lower values indicate lower fuel use.",
      ms: "Purata liter bahan api yang digunakan bagi setiap 100 km perjalanan dalam tempoh tersebut. Nilai lebih rendah lebih menjimatkan.",
      zh: "整个行程或时段内平均每百公里消耗的燃油升数，数值越低越省油。",
      ta: "பயணம் அல்லது கால அளவில் சராசரியாக 100 கி.மீ.-க்கு நுகரப்பட்ட எரிபொருள் (லிட்டர்). குறைந்த மதிப்பு குறைந்த செலவைக் குறிக்கும்.",
    },
  },
  averageKmPerL: {
    label: {
      en: "Average Fuel Economy (km/L)",
      ms: "Purata Ekonomi Bahan Api (km/L)",
      zh: "平均燃油经济性 (km/L)",
      ta: "சராசரி எரிபொருள் சிக்கனம் (km/L)",
    },
    description: {
      en: "Average distance travelled per litre of fuel consumed. Higher values indicate better fuel economy.",
      ms: "Purata jarak perjalanan bagi setiap liter bahan api yang digunakan. Nilai lebih tinggi bermakna lebih jimat.",
      zh: "每升燃油平均可行驶的公里数，数值越高表示燃油经济性越好。",
      ta: "ஒரு லிட்டர் எரிபொருளில் சராசரியாகப் பயணித்த தூரம் (கி.மீ./லி). அதிக மதிப்பு சிறந்த சிக்கனத்தைக் குறிக்கும்.",
    },
  },
  ecu_voltage_v: {
    label: {
      en: "ECU Voltage (V)",
      ms: "Voltan ECU (V)",
      zh: "ECU 电压 (V)",
      ta: "ECU மின்னழுத்தம் (V)",
    },
    description: {
      en: "Vehicle battery or control module supply voltage measured by the OBD adapter in volts.",
      ms: "Voltan bekalan bateri atau modul kawalan kenderaan yang diukur oleh penyesuai OBD dalam unit volt.",
      zh: "OBD 适配器测得的车辆电瓶或控制模块供电电压（伏特）。",
      ta: "OBD அடாப்டரால் அளவிடப்பட்ட வாகன பேட்டரி அல்லது கட்டுப்பாட்டு அலகின் மின்னழுத்தம் (வோல்ட்).",
    },
  },
  engine_rpm: {
    label: {
      en: "Engine Speed (RPM)",
      ms: "Kelajuan Enjin (RPM)",
      zh: "发动机转速 (RPM)",
      ta: "என்ஜின் வேகம் (RPM)",
    },
    description: {
      en: "Engine crankshaft revolutions per minute reported via OBD.",
      ms: "Pusingan enjin seminit (RPM) yang dilaporkan melalui OBD.",
      zh: "通过 OBD 上报的发动机每分钟转数 (RPM)。",
      ta: "OBD வழியாகப் பதிவான என்ஜின் நிமிடச் சுழற்சி எண்ணிக்கை (RPM).",
    },
  },
  speed_kmh: {
    label: {
      en: "Vehicle Speed (km/h)",
      ms: "Kelajuan Kenderaan (km/j)",
      zh: "车辆速度 (km/h)",
      ta: "வாகன வேகம் (km/h)",
    },
    description: {
      en: "Observed vehicle road speed in kilometres per hour.",
      ms: "Kelajuan kenderaan yang diperhatikan dalam kilometer sejam.",
      zh: "观测到的车辆行驶速度（公里/小时）。",
      ta: "கண்காணிக்கப்பட்ட வாகனத்தின் சாலை வேகம் (மணிக்கு கி.மீ.).",
    },
  },
  coolant_temp_c: {
    label: {
      en: "Engine Coolant Temp (°C)",
      ms: "Suhu Penyejuk Enjin (°C)",
      zh: "发动机冷却液温度 (°C)",
      ta: "என்ஜின் குளிரூட்டி வெப்பநிலை (°C)",
    },
    description: {
      en: "Engine coolant temperature in degrees Celsius. Useful for spotting warm-up state or overheating.",
      ms: "Suhu cecair penyejuk enjin dalam darjah Celsius. Berguna untuk memantau pemanasan atau kepanasan melampau.",
      zh: "发动机冷却液温度（摄氏度），用于观察热车状态或是否过热。",
      ta: "என்ஜின் குளிரூட்டியின் வெப்பநிலை (செல்சியஸ்). என்ஜின் சூடேறுதல் அல்லது அதிக வெப்பமடைதலைக் கண்டறிய உதவும்.",
    },
  },
  intake_temp_c: {
    label: {
      en: "Intake Air Temp (°C)",
      ms: "Suhu Udara Masuk (°C)",
      zh: "进气温度 (°C)",
      ta: "உள்வரும் காற்று வெப்பநிலை (°C)",
    },
    description: {
      en: "Temperature of air entering the engine intake manifold in degrees Celsius.",
      ms: "Suhu udara yang memasuki manifold masuk enjin dalam darjah Celsius.",
      zh: "进入发动机进气歧管的空气温度（摄氏度）。",
      ta: "என்ஜின் உட்கொள்ளும் குழாய்க்குள் செல்லும் காற்றின் வெப்பநிலை (செல்சியஸ்).",
    },
  },
  engine_load_pct: {
    label: {
      en: "Calculated Engine Load (%)",
      ms: "Beban Enjin Dikira (%)",
      zh: "计算发动机负荷 (%)",
      ta: "கணக்கிடப்பட்ட என்ஜின் சுமை (%)",
    },
    description: {
      en: "Percentage of available engine torque/airflow currently being demanded.",
      ms: "Peratusan kapasiti atau beban kerja enjin semasa yang digunakan.",
      zh: "当前发动机正在输出的工作负荷百分比。",
      ta: "தற்போது பயன்படுத்தப்படும் என்ஜின் திறன் சுமையின் சதவீதம்.",
    },
  },
  throttle_pct: {
    label: {
      en: "Throttle Position (%)",
      ms: "Kedudukan Pendikit (%)",
      zh: "节气门开度 (%)",
      ta: "த்ராட்டில் நிலை (%)",
    },
    description: {
      en: "Throttle valve opening percentage reported by the engine control unit.",
      ms: "Peratusan bukaan injap pendikit yang dilaporkan oleh unit kawalan enjin.",
      zh: "发动机控制单元上报的节气门开度百分比。",
      ta: "என்ஜின் கட்டுப்பாட்டு அலகு தெரிவிக்கும் த்ராட்டில் திறப்பு சதவீதம்.",
    },
  },
  maf_gps: {
    label: {
      en: "Mass Air Flow (g/s)",
      ms: "Aliran Jisim Udara / MAF (g/s)",
      zh: "空气质量流量 MAF (g/s)",
      ta: "காற்று நிறை ஓட்டம் MAF (g/s)",
    },
    description: {
      en: "Mass of air entering the engine per second in grams per second, used to estimate petrol fuel usage when direct fuel rate is absent.",
      ms: "Jisim udara yang masuk ke enjin sesaat (gram/saat), digunakan untuk menganggar penggunaan petrol jika kadar bahan api terus tiada.",
      zh: "每秒进入发动机的空气质量（克/秒）；在缺少直接喷油量数据时可用于估算汽油油耗。",
      ta: "வினாடிக்கு என்ஜினுக்குள் செல்லும் காற்றின் நிறை (கிராம்/வினாடி); நேரடி எரிபொருள் விகிதம் இல்லாதபோது பெட்ரோல் நுகர்வைக் கணக்கிட உதவும்.",
    },
  },
  fuel_rate_lph: {
    label: {
      en: "OBD Fuel Rate (L/h)",
      ms: "Kadar Bahan Api OBD (L/j)",
      zh: "OBD 燃油速率 (L/h)",
      ta: "OBD எரிபொருள் விகிதம் (L/h)",
    },
    description: {
      en: "Direct instantaneous fuel consumption rate in litres per hour reported by the vehicle ECU.",
      ms: "Kadar penggunaan bahan api terus dalam liter sejam yang dilaporkan oleh ECU kenderaan.",
      zh: "车辆 ECU 直接上报的瞬时燃油消耗速率（升/小时）。",
      ta: "வாகனத்தின் ECU நேரடியாகத் தெரிவிக்கும் உடனடி எரிபொருள் நுகர்வு விகிதம் (L/h).",
    },
  },
  fuel_level_pct: {
    label: {
      en: "Fuel Tank Level (%)",
      ms: "Paras Tangki Bahan Api (%)",
      zh: "油箱液位 (%)",
      ta: "எரிபொருள் தொட்டி அளவு (%)",
    },
    description: {
      en: "Remaining fuel tank level percentage reported by the vehicle's fuel level sender.",
      ms: "Peratusan baki bahan api dalam tangki seperti yang dilaporkan oleh penderia kenderaan.",
      zh: "车辆油量传感器上报的油箱剩余油量百分比。",
      ta: "வாகனத்தின் சென்சார் தெரிவிக்கும் தொட்டியில் உள்ள மீதமுள்ள எரிபொருள் சதவீதம்.",
    },
  },
  engine_runtime_s: {
    label: {
      en: "Engine Runtime (s)",
      ms: "Masa Operasi Enjin (s)",
      zh: "发动机运行时长 (秒)",
      ta: "என்ஜின் இயங்கிய நேரம் (வி)",
    },
    description: {
      en: "Seconds elapsed since the engine was last started, as reported by the ECU.",
      ms: "Bilangan saat enjin telah beroperasi sejak dihidupkan kali terakhir menurut ECU.",
      zh: "自本次发动机启动以来累计运行的秒数（由 ECU 上报）。",
      ta: "கடைசியாக என்ஜின் தொடங்கப்பட்டதிலிருந்து இயங்கிய நேரம் (வினாடிகளில்).",
    },
  },
  odometer_km: {
    label: {
      en: "Odometer Km (km)",
      ms: "Bacaan Odometer (km)",
      zh: "里程表读数 (km)",
      ta: "ஓடோமீட்டர் அளவு (km)",
    },
    description: {
      en: "Vehicle odometer distance reading in kilometres.",
      ms: "Bacaan jarak odometer kenderaan dalam kilometer.",
      zh: "车辆里程表累计行驶距离读数（公里）。",
      ta: "வாகனத்தின் ஓடோமீட்டர் தூர அளவு (கிலோமீட்டரில்).",
    },
  },
  obd_connected: {
    label: {
      en: "OBD Connected",
      ms: "OBD Disambungkan",
      zh: "OBD 已连接",
      ta: "OBD இணைக்கப்பட்டது",
    },
    description: {
      en: "Whether the edge telemetry device had an active OBD-II link with the vehicle at this sample.",
      ms: "Menunjukkan sama ada peranti telemetri mempunyai sambungan OBD-II aktif dengan kenderaan pada sampel ini.",
      zh: "指示采集此样本时车载终端与车辆 OBD-II 接口是否保持连接。",
      ta: "இந்தப் பதிவின்போது டெலிமெட்ரி சாதனம் வாகனத்தின் OBD-II உடன் செயலில் உள்ள இணைப்பில் இருந்ததா என்பதைக் காட்டுகிறது.",
    },
  },
  engine_running: {
    label: {
      en: "Engine Running",
      ms: "Enjin Hidup",
      zh: "发动机运行中",
      ta: "என்ஜின் இயங்குகிறது",
    },
    description: {
      en: "Whether the engine was detected as running (for example, RPM above zero) when the packet was captured.",
      ms: "Menunjukkan sama ada enjin dikesan sedang hidup (contohnya RPM melebihi sifar) semasa paket ditangkap.",
      zh: "指示捕获该数据包时是否检测到发动机正在运转（例如转速大于零）。",
      ta: "தரவு பெறப்பட்டபோது என்ஜின் இயங்கிக் கொண்டிருந்ததா (எ.கா. RPM பூஜ்ஜியத்திற்கு மேல்) என்பதைக் காட்டுகிறது.",
    },
  },
  harsh_braking: {
    label: {
      en: "Harsh Braking",
      ms: "Brek Keras",
      zh: "急刹车",
      ta: "கடுமையான பிரேக்கிங்",
    },
    description: {
      en: "Indicates whether strong deceleration exceeding the configured harsh braking threshold was observed.",
      ms: "Menunjukkan sama ada nyahpecutan kuat yang melebihi ambang brek keras telah dikesan.",
      zh: "指示是否观测到超过所设阈值的剧烈减速（急刹车）行为。",
      ta: "நிர்ணயிக்கப்பட்ட வரம்பை மீறிய கடுமையான வேகக் குறைப்பு (பிரேக்) கண்டறியப்பட்டதா என்பதைக் காட்டுகிறது.",
    },
  },
  rapid_acceleration: {
    label: {
      en: "Rapid Acceleration",
      ms: "Pecutan Mendadak",
      zh: "急加速",
      ta: "திடீர் முடுக்கம்",
    },
    description: {
      en: "Indicates whether strong forward acceleration exceeding the configured rapid acceleration threshold was observed.",
      ms: "Menunjukkan sama ada pecutan ke hadapan yang melebihi ambang pecutan mendadak telah dikesan.",
      zh: "指示是否观测到超过所设阈值的急剧加速行为。",
      ta: "நிர்ணயிக்கப்பட்ட வரம்பை மீறிய திடீர் வேக அதிகரிப்பு கண்டறியப்பட்டதா என்பதைக் காட்டுகிறது.",
    },
  },
  sharp_cornering: {
    label: {
      en: "Sharp Cornering",
      ms: "Selekoh Tajam",
      zh: "急转弯",
      ta: "கூர்மையான திருப்பம்",
    },
    description: {
      en: "Indicates whether lateral acceleration or yaw rate exceeded the sharp cornering threshold.",
      ms: "Menunjukkan sama ada pecutan sisi atau kadar pusingan melebihi ambang selekoh tajam.",
      zh: "指示横向加速度或角速度是否超过急转弯阈值。",
      ta: "பக்கவாட்டு முடுக்கம் அல்லது திருப்ப வேகம் கூர்மையான திருப்ப வரம்பை மீறியதா என்பதைக் காட்டுகிறது.",
    },
  },
  acceleration: {
    label: {
      en: "IMU Acceleration (m/s²)",
      ms: "Pecutan IMU (m/s²)",
      zh: "IMU 加速度 (m/s²)",
      ta: "IMU முடுக்கம் (m/s²)",
    },
    description: {
      en: "Three-axis linear acceleration readings from the onboard inertial measurement unit (IMU) in m/s².",
      ms: "Bacaan pecutan linear tiga paksi daripada unit ukuran inersia (IMU) peranti dalam unit m/s².",
      zh: "车载惯性测量单元 (IMU) 上报的三轴线性加速度读数（单位：m/s²）。",
      ta: "சாதனத்தில் உள்ள IMU சென்சாரின் முப்பரிமாண நேர்கோட்டு முடுக்க அளவுகள் (m/s²).",
    },
  },
  gyroscope: {
    label: {
      en: "IMU Gyroscope (°/s)",
      ms: "Giroskop IMU (°/s)",
      zh: "IMU 陀螺仪 (°/s)",
      ta: "IMU கைரோஸ்கோப் (°/s)",
    },
    description: {
      en: "Three-axis angular rotation rate readings from the onboard gyroscope in degrees per second.",
      ms: "Bacaan kadar putaran sudut tiga paksi daripada giroskop peranti dalam darjah sesaat.",
      zh: "车载陀螺仪上报的三轴角速度读数（单位：度/秒）。",
      ta: "சாதனத்தில் உள்ள கைரோஸ்கோப்பின் முப்பரிமாண சுழற்சி வேக அளவுகள் (வினாடிக்கு டிகிரியில்).",
    },
  },
  x_mps2: {
    label: {
      en: "X-Axis Acceleration (m/s²)",
      ms: "Pecutan Paksi-X (m/s²)",
      zh: "X 轴加速度 (m/s²)",
      ta: "X-அச்சு முடுக்கம் (m/s²)",
    },
    description: {
      en: "Linear acceleration along the device's X axis in metres per second squared.",
      ms: "Pecutan linear sepanjang paksi-X peranti dalam meter sesaat kuasa dua.",
      zh: "沿设备 X 轴方向的线性加速度（米/秒²）。",
      ta: "சாதனத்தின் X அச்சில் உள்ள நேர்கோட்டு முடுக்கம் (m/s²).",
    },
  },
  y_mps2: {
    label: {
      en: "Y-Axis Acceleration (m/s²)",
      ms: "Pecutan Paksi-Y (m/s²)",
      zh: "Y 轴加速度 (m/s²)",
      ta: "Y-அச்சு முடுக்கம் (m/s²)",
    },
    description: {
      en: "Linear acceleration along the device's Y axis in metres per second squared.",
      ms: "Pecutan linear sepanjang paksi-Y peranti dalam meter sesaat kuasa dua.",
      zh: "沿设备 Y 轴方向的线性加速度（米/秒²）。",
      ta: "சாதனத்தின் Y அச்சில் உள்ள நேர்கோட்டு முடுக்கம் (m/s²).",
    },
  },
  z_mps2: {
    label: {
      en: "Z-Axis Acceleration (m/s²)",
      ms: "Pecutan Paksi-Z (m/s²)",
      zh: "Z 轴加速度 (m/s²)",
      ta: "Z-அச்சு முடுக்கம் (m/s²)",
    },
    description: {
      en: "Linear acceleration along the device's Z (vertical) axis in metres per second squared.",
      ms: "Pecutan linear sepanjang paksi-Z (menegak) peranti dalam meter sesaat kuasa dua.",
      zh: "沿设备 Z 轴（垂直方向）的线性加速度（米/秒²）。",
      ta: "சாதனத்தின் Z (செங்குத்து) அச்சில் உள்ள நேர்கோட்டு முடுக்கம் (m/s²).",
    },
  },
  x_dps: {
    label: {
      en: "X-Axis Rotation (°/s)",
      ms: "Putaran Paksi-X (°/s)",
      zh: "X 轴角速度 (°/s)",
      ta: "X-அச்சு சுழற்சி (°/s)",
    },
    description: {
      en: "Angular rotation rate around the device's X axis in degrees per second.",
      ms: "Kadar putaran sudut mengelilingi paksi-X peranti dalam darjah sesaat.",
      zh: "绕设备 X 轴旋转的角速度（度/秒）。",
      ta: "சாதனத்தின் X அச்சைச் சுற்றிய சுழற்சி வேகம் (டிகிரி/வினாடி).",
    },
  },
  y_dps: {
    label: {
      en: "Y-Axis Rotation (°/s)",
      ms: "Putaran Paksi-Y (°/s)",
      zh: "Y 轴角速度 (°/s)",
      ta: "Y-அச்சு சுழற்சி (°/s)",
    },
    description: {
      en: "Angular rotation rate around the device's Y axis in degrees per second.",
      ms: "Kadar putaran sudut mengelilingi paksi-Y peranti dalam darjah sesaat.",
      zh: "绕设备 Y 轴旋转的角速度（度/秒）。",
      ta: "சாதனத்தின் Y அச்சைச் சுற்றிய சுழற்சி வேகம் (டிகிரி/வினாடி).",
    },
  },
  z_dps: {
    label: {
      en: "Z-Axis Rotation (°/s)",
      ms: "Putaran Paksi-Z (°/s)",
      zh: "Z 轴角速度 (°/s)",
      ta: "Z-அச்சு சுழற்சி (°/s)",
    },
    description: {
      en: "Angular rotation rate around the device's Z (yaw) axis in degrees per second.",
      ms: "Kadar putaran sudut mengelilingi paksi-Z (olengan) peranti dalam darjah sesaat.",
      zh: "绕设备 Z 轴（偏航方向）旋转的角速度（度/秒）。",
      ta: "சாதனத்தின் Z அச்சைச் சுற்றிய சுழற்சி வேகம் (டிகிரி/வினாடி).",
    },
  },
  sensor: {
    label: {
      en: "Motion Sensor Status",
      ms: "Status Penderia Gerakan",
      zh: "运动传感器状态",
      ta: "இயக்க சென்சார் நிலை",
    },
    description: {
      en: "Metadata or health state reported by the onboard motion sensor (IMU).",
      ms: "Metadata atau status kesihatan yang dilaporkan oleh penderia gerakan (IMU) pada peranti.",
      zh: "车载运动传感器 (IMU) 上报的元数据或健康状态。",
      ta: "சாதனத்தின் இயக்க சென்சார் (IMU) தெரிவிக்கும் நிலை அல்லது விவரம்.",
    },
  },
  threshold: {
    label: {
      en: "Trigger Thresholds",
      ms: "Ambang Pencetus",
      zh: "触发阈值",
      ta: "தூண்டுதல் வரம்புகள்",
    },
    description: {
      en: "Configured threshold values used on the edge device when evaluating driving behaviour.",
      ms: "Nilai ambang yang dikonfigurasikan pada peranti pinggir untuk menilai tingkah laku pemanduan.",
      zh: "边缘设备在评估驾驶行为时使用的配置阈值。",
      ta: "ஓட்டுநர் நடத்தையை மதிப்பிடும்போது சாதனம் பயன்படுத்தும் வரம்பு மதிப்புகள்.",
    },
  },
  cpu_temp_c: {
    label: {
      en: "Device CPU Temp (°C)",
      ms: "Suhu CPU Peranti (°C)",
      zh: "设备 CPU 温度 (°C)",
      ta: "சாதன CPU வெப்பநிலை (°C)",
    },
    description: {
      en: "Internal processor temperature of the telemetry hardware in degrees Celsius.",
      ms: "Suhu pemproses dalaman perkakasan telemetri dalam darjah Celsius.",
      zh: "车载遥测终端内部处理器的温度（摄氏度）。",
      ta: "டெலிமெட்ரி சாதனத்தின் உள் செயலியின் வெப்பநிலை (செல்சியஸ்).",
    },
  },
  cpu_usage_pct: {
    label: {
      en: "Device CPU Usage (%)",
      ms: "Penggunaan CPU Peranti (%)",
      zh: "设备 CPU 使用率 (%)",
      ta: "சாதன CPU பயன்பாடு (%)",
    },
    description: {
      en: "Percentage of the edge device's CPU capacity currently in use.",
      ms: "Peratusan kapasiti CPU peranti pinggir yang sedang digunakan.",
      zh: "边缘设备当前正在占用的 CPU 资源百分比。",
      ta: "தற்போது பயன்பாட்டில் உள்ள சாதனத்தின் CPU திறன் சதவீதம்.",
    },
  },
  memory_usage_pct: {
    label: {
      en: "Device Memory Usage (%)",
      ms: "Penggunaan Memori Peranti (%)",
      zh: "设备内存使用率 (%)",
      ta: "சாதன நினைவகப் பயன்பாடு (%)",
    },
    description: {
      en: "Percentage of RAM currently used on the telemetry device.",
      ms: "Peratusan RAM yang sedang digunakan pada peranti telemetri.",
      zh: "遥测设备当前已使用的运行内存 (RAM) 百分比。",
      ta: "டெலிமெட்ரி சாதனத்தில் தற்போது பயன்படுத்தப்படும் RAM நினைவக சதவீதம்.",
    },
  },
  disk_usage_pct: {
    label: {
      en: "Device Storage Usage (%)",
      ms: "Penggunaan Storan Peranti (%)",
      zh: "设备存储使用率 (%)",
      ta: "சாதன சேமிப்பகப் பயன்பாடு (%)",
    },
    description: {
      en: "Percentage of local storage used on the edge device (including buffered telemetry records).",
      ms: "Peratusan storan tempatan yang digunakan pada peranti (termasuk rekod telemetri yang ditimbal).",
      zh: "边缘设备本地存储空间的使用百分比（包含暂存的遥测记录）。",
      ta: "சாதனத்தின் உள்ளூர் சேமிப்பகப் பயன்பாட்டு சதவீதம் (சேமிக்கப்பட்ட டெலிமெட்ரி பதிவுகள் உட்பட).",
    },
  },
  uptime_s: {
    label: {
      en: "Device Uptime (s)",
      ms: "Masa Aktif Peranti (s)",
      zh: "设备运行时长 (秒)",
      ta: "சாதன இயக்க நேரம் (வி)",
    },
    description: {
      en: "Seconds since the telemetry device last booted.",
      ms: "Bilangan saat sejak peranti telemetri kali terakhir dihidupkan semula.",
      zh: "遥测设备自上次启动以来的持续运行秒数。",
      ta: "டெலிமெட்ரி சாதனம் கடைசியாகத் தொடங்கியதிலிருந்து இயங்கிய வினாடிகள்.",
    },
  },
  ble_obd_connected: {
    label: {
      en: "Bluetooth OBD Link",
      ms: "Sambungan OBD Bluetooth",
      zh: "蓝牙 OBD 连接状态",
      ta: "புளூடூத் OBD இணைப்பு",
    },
    description: {
      en: "Whether the edge device has an active Bluetooth Low Energy (BLE) connection to the OBD adapter.",
      ms: "Menunjukkan sama ada peranti mempunyai sambungan Bluetooth Tenaga Rendah (BLE) yang aktif dengan penyesuai OBD.",
      zh: "指示边缘设备与 OBD 适配器之间的低功耗蓝牙 (BLE) 连接是否处于活动状态。",
      ta: "சாதனம் OBD அடாப்டருடன் செயலில் உள்ள BLE புளூடூத் இணைப்பில் உள்ளதா என்பதைக் காட்டுகிறது.",
    },
  },
  lte_connected: {
    label: {
      en: "4G LTE Link",
      ms: "Sambungan 4G LTE",
      zh: "4G LTE 连接状态",
      ta: "4G LTE இணைப்பு",
    },
    description: {
      en: "Whether the edge device's cellular modem reported an active 4G LTE data connection.",
      ms: "Menunjukkan sama ada modem selular peranti melaporkan sambungan data 4G LTE yang aktif.",
      zh: "指示设备蜂窝调制解调器当前是否已建立 4G LTE 数据连接。",
      ta: "சாதனத்தின் செல்லுலார் மோடம் செயலில் உள்ள 4G LTE தரவு இணைப்பில் உள்ளதா என்பதைக் காட்டுகிறது.",
    },
  },
  pending_records: {
    label: {
      en: "Pending Buffered Records",
      ms: "Rekod Menunggu Muat Naik",
      zh: "待同步缓存记录数",
      ta: "பதிவேற்றக் காத்திருக்கும் பதிவுகள்",
    },
    description: {
      en: "Number of telemetry records stored locally on the device waiting to be uploaded to the server.",
      ms: "Bilangan rekod telemetri yang disimpan sementara pada peranti menunggu untuk dimuat naik ke pelayan.",
      zh: "当前暂存在设备本地、等待上传至服务器的遥测记录数量。",
      ta: "சேவையகத்திற்குப் பதிவேற்றப்படுவதற்காகச் சாதனத்தில் காத்திருக்கும் பதிவுகளின் எண்ணிக்கை.",
    },
  },
  last_sync_at: {
    label: {
      en: "Last Device Sync",
      ms: "Segerak Terakhir Peranti",
      zh: "设备上次同步时间",
      ta: "சாதனம் கடைசியாக ஒத்திசைத்த நேரம்",
    },
    description: {
      en: "Timestamp when the edge device last reported a successful sync with the backend.",
      ms: "Cap masa kali terakhir peranti melaporkan penyegerakan yang berjaya dengan pelayan.",
      zh: "边缘设备上次向后端报告成功同步的时间戳。",
      ta: "சாதனம் கடைசியாகச் சேவையகத்துடன் வெற்றிகரமாகத் தரவை ஒத்திசைத்த நேரம்.",
    },
  },
  rsrp_dbm: {
    label: {
      en: "RSRP Signal Power (dBm)",
      ms: "Kuasa Isyarat RSRP (dBm)",
      zh: "RSRP 信号强度 (dBm)",
      ta: "RSRP சிக்னல் திறன் (dBm)",
    },
    description: {
      en: "Reference Signal Received Power in dBm. Values closer to 0 (for example -80 dBm) indicate stronger 4G reception than -115 dBm.",
      ms: "Kuasa Isyarat Rujukan Diterima (RSRP) dalam dBm. Nilai menghampiri 0 (contoh -80 dBm) lebih kuat berbanding -115 dBm.",
      zh: "参考信号接收功率 (dBm)。数值越接近 0（如 -80 dBm）表示 4G 信号越强，低于 -115 dBm 表示极弱。",
      ta: "RSRP சிக்னல் திறன் (dBm). பூஜ்ஜியத்திற்கு நெருக்கமான மதிப்புகள் (எ.கா. -80 dBm) வலுவான 4G சிக்னலைக் குறிக்கும்.",
    },
  },
  rsrq_db: {
    label: {
      en: "RSRQ Signal Quality (dB)",
      ms: "Kualiti Isyarat RSRQ (dB)",
      zh: "RSRQ 信号质量 (dB)",
      ta: "RSRQ சிக்னல் தரம் (dB)",
    },
    description: {
      en: "Reference Signal Received Quality in dB. Higher values (closer to 0, such as -6 dB) mean less cell load and interference.",
      ms: "Kualiti Isyarat Rujukan Diterima (RSRQ) dalam dB. Nilai lebih tinggi (menghampiri 0) bermakna gangguan sel lebih rendah.",
      zh: "参考信号接收质量 (dB)。数值越接近 0（如 -6 dB）表示小区负载和干扰越小。",
      ta: "RSRQ சிக்னல் தரம் (dB). அதிக மதிப்புகள் (பூஜ்ஜியத்திற்கு அருகில்) குறைந்த இடையூறைக் குறிக்கும்.",
    },
  },
  rssi_dbm: {
    label: {
      en: "RSSI Total Power (dBm)",
      ms: "Kuasa Keseluruhan RSSI (dBm)",
      zh: "RSSI 接收总功率 (dBm)",
      ta: "RSSI மொத்த சிக்னல் (dBm)",
    },
    description: {
      en: "Received Signal Strength Indicator measuring total received radio power including noise and interference.",
      ms: "Penunjuk Kekuatan Isyarat Diterima yang mengukur jumlah kuasa radio termasuk hingar dan gangguan.",
      zh: "接收信号强度指示 (dBm)，包含有用信号、噪声和干扰在内的总接收功率。",
      ta: "இரைச்சல் மற்றும் இடையூறு உட்பட பெறப்பட்ட மொத்த ரேடியோ சிக்னல் வலிமை (dBm).",
    },
  },
  sinr_db: {
    label: {
      en: "SINR Signal-to-Noise (dB)",
      ms: "Nisbah Isyarat kepada Hingar SINR (dB)",
      zh: "SINR 信噪比 (dB)",
      ta: "SINR சிக்னல்-இரைச்சல் விகிதம் (dB)",
    },
    description: {
      en: "Signal-to-Interference-plus-Noise Ratio in dB. Higher positive values indicate a cleaner 4G radio link.",
      ms: "Nisbah Isyarat kepada Gangguan dan Hingar dalam dB. Nilai positif yang lebih tinggi bermakna sambungan radio lebih jelas.",
      zh: "信号与干扰加噪声比 (dB)。正值越高表示 4G 无线链路越清晰稳定。",
      ta: "சிக்னல் மற்றும் இரைச்சல் விகிதம் (dB). அதிக நேர்மறை மதிப்புகள் தெளிவான 4G இணைப்பைக் குறிக்கும்.",
    },
  },
  lte_band: {
    label: {
      en: "LTE Frequency Band",
      ms: "Jalur Frekuensi LTE",
      zh: "LTE 频段",
      ta: "LTE அதிர்வெண் அலைவரிசை",
    },
    description: {
      en: "Cellular LTE frequency band number used by the modem (for example Band 3 or Band 7).",
      ms: "Nombor jalur frekuensi LTE selular yang digunakan oleh modem (contohnya Band 3 atau Band 7).",
      zh: "调制解调器当前使用的蜂窝 LTE 频段编号（如 Band 3 或 Band 7）。",
      ta: "மோடம் பயன்படுத்தும் செல்லுலார் LTE அதிர்வெண் அலைவரிசை எண் (எ.கா. Band 3 அல்லது Band 7).",
    },
  },
  earfcn: {
    label: {
      en: "EARFCN Channel",
      ms: "Saluran EARFCN",
      zh: "EARFCN 频点号",
      ta: "EARFCN அலைவரிசை எண்",
    },
    description: {
      en: "E-UTRA Absolute Radio Frequency Channel Number identifying the exact LTE carrier frequency.",
      ms: "Nombor Saluran Frekuensi Radio Mutlak E-UTRA yang mengenal pasti frekuensi pembawa LTE yang tepat.",
      zh: "E-UTRA 绝对射频频道号，用于唯一标识当前使用的 LTE 载波频率。",
      ta: "தற்போதைய LTE கேரியர் அதிர்வெண்ணைத் துல்லியமாகக் குறிக்கும் ரேடியோ அலைவரிசை எண்.",
    },
  },
  pci: {
    label: {
      en: "Physical Cell ID (PCI)",
      ms: "ID Sel Fizikal (PCI)",
      zh: "物理小区标识 (PCI)",
      ta: "இயற்பியல் செல் ஐடி (PCI)",
    },
    description: {
      en: "Physical-layer identifier (0–503) of the serving cellular sector antenna.",
      ms: "Pengecam lapisan fizikal (0–503) bagi sektor menara selular yang sedang berkhidmat.",
      zh: "当前服务基站扇区的物理层小区标识符（范围 0–503）。",
      ta: "சேவை வழங்கும் செல்லுலார் கோபுரப் பிரிவின் இயற்பியல் அடையாள எண் (0–503).",
    },
  },
  cell_id: {
    label: {
      en: "Cell Tower ID",
      ms: "ID Sel Menara",
      zh: "基站小区 ID",
      ta: "செல் கோபுர ஐடி",
    },
    description: {
      en: "Network-assigned identifier of the cellular tower sector currently serving the device.",
      ms: "Pengecam yang ditetapkan rangkaian bagi sel menara yang sedang menghubungkan peranti.",
      zh: "移动网络为当前连接基站扇区分配的小区识别码。",
      ta: "சாதனத்திற்குத் தற்போது சேவை வழங்கும் செல் கோபுரப் பிரிவின் நெட்வொர்க் அடையாள எண்.",
    },
  },
  tac: {
    label: {
      en: "Tracking Area Code (TAC)",
      ms: "Kod Kawasan Penjejakan (TAC)",
      zh: "跟踪区代码 (TAC)",
      ta: "கண்காணிப்புப் பகுதி குறியீடு (TAC)",
    },
    description: {
      en: "Regional LTE tracking area code used by the mobile carrier for paging and handovers.",
      ms: "Kod kawasan penjejakan LTE serantau yang digunakan oleh syarikat telekomunikasi.",
      zh: "移动运营商用于寻呼和区域管理的 LTE 跟踪区编码。",
      ta: "செல்லுலார் நெட்வொர்க் பயன்படுத்தும் பிராந்திய LTE கண்காணிப்புப் பகுதி குறியீடு.",
    },
  },
  registered_plmn: {
    label: {
      en: "Registered PLMN (MCC/MNC)",
      ms: "PLMN Berdaftar (MCC/MNC)",
      zh: "已注册运营商代码 (PLMN)",
      ta: "பதிவுசெய்யப்பட்ட PLMN குறியீடு",
    },
    description: {
      en: "Public Land Mobile Network code (country + carrier code, such as 50212) that the modem is registered on.",
      ms: "Kod Rangkaian Mudah Alih Awam (kod negara + pengendali, seperti 50212) tempat modem berdaftar.",
      zh: "调制解调器当前注册的公共陆地移动网络代码（国家码 + 运营商码，如 50212）。",
      ta: "மோடம் பதிவு செய்துள்ள பொது மொபைல் நெட்வொர்க் குறியீடு (நாடு + சேவை வழங்குநர் குறியீடு).",
    },
  },
  registration_status: {
    label: {
      en: "Network Registration Status",
      ms: "Status Pendaftaran Rangkaian",
      zh: "网络注册状态",
      ta: "நெட்வொர்க் பதிவு நிலை",
    },
    description: {
      en: "Modem registration state on the mobile network (for example registered home, roaming, or searching).",
      ms: "Status pendaftaran modem pada rangkaian mudah alih (contohnya berdaftar, perayauan, atau mencari).",
      zh: "调制解调器在移动网络上的注册状态（例如本地已注册、漫游或搜索中）。",
      ta: "மொபைல் நெட்வொர்க்கில் மோடத்தின் பதிவு நிலை (எ.கா. பதிவுசெய்யப்பட்டது, ரோமிங், அல்லது தேடுகிறது).",
    },
  },
  roaming: {
    label: {
      en: "Roaming Active",
      ms: "Perayauan Aktif",
      zh: "漫游状态",
      ta: "ரோமிங் நிலை",
    },
    description: {
      en: "Whether the SIM is connected via a partner carrier network outside its home PLMN.",
      ms: "Menunjukkan sama ada kad SIM disambungkan melalui rangkaian rakan kongsi di luar rangkaian asal.",
      zh: "指示 SIM 卡当前是否通过归属网络以外的合作运营商漫游接入。",
      ta: "SIM அட்டை தனது சொந்த நெட்வொர்க்கிற்கு வெளியே கூட்டாளி நெட்வொர்க் வழியாக இணைந்துள்ளதா என்பதைக் காட்டுகிறது.",
    },
  },
  connected: {
    label: {
      en: "Modem Data Connected",
      ms: "Sambungan Data Modem",
      zh: "调制解调器已联网",
      ta: "மோடம் தரவு இணைப்பு",
    },
    description: {
      en: "Whether the cellular modem reports an active packet data session.",
      ms: "Menunjukkan sama ada modem selular melaporkan sesi data paket yang aktif.",
      zh: "指示蜂窝调制解调器当前是否已建立分组数据会话。",
      ta: "செல்லுலார் மோடம் செயலில் உள்ள தரவு இணைப்பில் உள்ளதா என்பதைக் காட்டுகிறது.",
    },
  },
  modem_model: {
    label: {
      en: "Modem Hardware Model",
      ms: "Model Perkakasan Modem",
      zh: "调制解调器型号",
      ta: "மோடம் மாதிரி",
    },
    description: {
      en: "Hardware model string reported by the cellular modem module.",
      ms: "Nama model perkakasan yang dilaporkan oleh modul modem selular.",
      zh: "蜂窝通信模块上报的硬件型号名称。",
      ta: "செல்லுலார் மோடம் தெரிவிக்கும் வன்பொருள் மாதிரிப் பெயர்.",
    },
  },
  imei: {
    label: {
      en: "Modem IMEI",
      ms: "IMEI Modem",
      zh: "设备 IMEI",
      ta: "மோடம் IMEI",
    },
    description: {
      en: "International Mobile Equipment Identity number uniquely identifying the cellular modem hardware.",
      ms: "Nombor Identiti Peralatan Mudah Alih Antarabangsa yang mengenal pasti perkakasan modem secara unik.",
      zh: "唯一标识蜂窝调制解调器硬件的国际移动设备识别码。",
      ta: "செல்லுலார் மோடம் வன்பொருளைத் தனித்துவமாக அடையாளம் காணும் IMEI எண்.",
    },
  },
  imsi: {
    label: {
      en: "SIM IMSI",
      ms: "IMSI Kad SIM",
      zh: "SIM 卡 IMSI",
      ta: "SIM IMSI எண்",
    },
    description: {
      en: "International Mobile Subscriber Identity stored on the installed SIM card.",
      ms: "Identiti Pelanggan Mudah Alih Antarabangsa yang disimpan pada kad SIM yang dipasang.",
      zh: "存储在所安装 SIM 卡上的国际移动用户识别码。",
      ta: "பொருத்தப்பட்டுள்ள SIM அட்டையில் சேமிக்கப்பட்டுள்ள சந்தாதாரர் அடையாள எண் (IMSI).",
    },
  },
  operator: {
    label: {
      en: "Mobile Operator",
      ms: "Pengendali Mudah Alih",
      zh: "移动运营商",
      ta: "மொபைல் நெட்வொர்க் வழங்குநர்",
    },
    description: {
      en: "Name of the cellular carrier providing mobile network connectivity.",
      ms: "Nama syarikat telekomunikasi yang menyediakan sambungan rangkaian mudah alih.",
      zh: "当前提供移动网络连接的电信运营商名称。",
      ta: "மொபைல் நெட்வொர்க் இணைப்பை வழங்கும் தொலைத்தொடர்பு நிறுவனத்தின் பெயர்.",
    },
  },
  network_type: {
    label: {
      en: "Network Type",
      ms: "Jenis Rangkaian",
      zh: "网络类型",
      ta: "நெட்வொர்க் வகை",
    },
    description: {
      en: "Radio access technology reported for the connection (such as LTE, WCDMA, or GSM).",
      ms: "Teknologi akses radio yang dilaporkan untuk sambungan (seperti LTE, WCDMA atau GSM).",
      zh: "当前连接所报告的无线接入技术类型（例如 LTE、WCDMA 或 GSM）。",
      ta: "இணைப்பிற்குப் பதிவான ரேடியோ அணுகல் தொழில்நுட்பம் (எ.கா. LTE, WCDMA, அல்லது GSM).",
    },
  },
  network_mode: {
    label: {
      en: "Network Mode",
      ms: "Mod Rangkaian",
      zh: "网络制式",
      ta: "நெட்வொர்க் பயன்முறை",
    },
    description: {
      en: "Detailed cellular radio mode or sub-technology reported by the modem.",
      ms: "Mod radio selular atau sub-teknologi terperinci yang dilaporkan oleh modem.",
      zh: "调制解调器上报的详细蜂窝网络制式或子技术模式。",
      ta: "மோடம் தெரிவிக்கும் விரிவான செல்லுலார் ரேடியோ பயன்முறை.",
    },
  },
  fix_valid: {
    label: {
      en: "GPS Fix Valid",
      ms: "Kedudukan GPS Sah",
      zh: "GPS 定位有效",
      ta: "GPS நிலைத்தன்மை செல்லுபடியாகும்",
    },
    description: {
      en: "Whether the GPS receiver had a valid satellite position lock when this sample was recorded.",
      ms: "Menunjukkan sama ada penerima GPS mempunyai kunci kedudukan satelit yang sah semasa sampel direkodkan.",
      zh: "指示记录该样本时 GPS 接收器是否已获得有效的卫星定位锁定。",
      ta: "இந்தப் பதிவு எடுக்கப்பட்டபோது GPS செயற்கைக்கோள் இருப்பிடப் பூட்டுதல் சரியாக இருந்ததா என்பதைக் காட்டுகிறது.",
    },
  },
  hdop: {
    label: {
      en: "GPS HDOP",
      ms: "HDOP GPS",
      zh: "GPS 水平精度因子 (HDOP)",
      ta: "GPS HDOP மதிப்பு",
    },
    description: {
      en: "Horizontal Dilution of Precision from GPS satellites. Lower values (below 2.0) indicate tighter horizontal accuracy.",
      ms: "Pencairan Ketepatan Mendatar daripada satelit GPS. Nilai lebih rendah (bawah 2.0) menunjukkan ketepatan lebih tinggi.",
      zh: "GPS 水平精度衰减因子，数值越低（如小于 2.0）表示水平定位精度越高。",
      ta: "GPS செயற்கைக்கோள்களின் கிடைமட்டத் துல்லிய அளவு. குறைந்த மதிப்புகள் (2.0-க்கு கீழ்) அதிகத் துல்லியத்தைக் குறிக்கும்.",
    },
  },
  satellites: {
    label: {
      en: "GPS Satellites",
      ms: "Satelit GPS",
      zh: "GPS 可见卫星数",
      ta: "GPS செயற்கைக்கோள்கள்",
    },
    description: {
      en: "Number of GPS/GNSS satellites tracked or used in the position solution.",
      ms: "Bilangan satelit GPS/GNSS yang dijejaki atau digunakan dalam pengiraan kedudukan.",
      zh: "用于定位解算或当前跟踪到的 GPS/GNSS 卫星数量。",
      ta: "இருப்பிடத்தைக் கணக்கிடப் பயன்படுத்தப்பட்ட GPS/GNSS செயற்கைக்கோள்களின் எண்ணிக்கை.",
    },
  },
  altitude_m: {
    label: {
      en: "Altitude (m)",
      ms: "Altitud (m)",
      zh: "海拔高度 (m)",
      ta: "உயரம் (மீ)",
    },
    description: {
      en: "GPS-reported elevation above sea level in metres.",
      ms: "Ketinggian dari paras laut yang dilaporkan oleh GPS dalam meter.",
      zh: "GPS 上报的海拔高度（米）。",
      ta: "கடல் மட்டத்திலிருந்து GPS தெரிவிக்கும் உயரம் (மீட்டரில்).",
    },
  },
  heading_deg: {
    label: {
      en: "Heading (°)",
      ms: "Arah Haluan (°)",
      zh: "航向角 (°)",
      ta: "பயணத் திசை (°)",
    },
    description: {
      en: "Direction of travel in degrees clockwise from true north (0°–359°).",
      ms: "Arah pergerakan dalam darjah mengikut arah jam dari utara sebenar (0°–359°).",
      zh: "相对正北方向顺时针计量的行驶方向角度（0°–359°）。",
      ta: "வடக்கிலிருந்து கடிகார திசையில் வாகனத்தின் பயணத் திசை (0°–359°).",
    },
  },
  latitude: {
    label: {
      en: "Latitude",
      ms: "Latitud",
      zh: "纬度",
      ta: "அட்சரேகை",
    },
    description: {
      en: "North–south geographic coordinate in decimal degrees.",
      ms: "Koordinat geografi utara–selatan dalam darjah perpuluhan.",
      zh: "十进制度数表示的地理纬度坐标。",
      ta: "தசம டிகிரியில் வடக்கு–தெற்கு புவியியல் ஆயத்தொலைவு.",
    },
  },
  longitude: {
    label: {
      en: "Longitude",
      ms: "Longitud",
      zh: "经度",
      ta: "தீர்க்கரேகை",
    },
    description: {
      en: "East–west geographic coordinate in decimal degrees.",
      ms: "Koordinat geografi timur–barat dalam darjah perpuluhan.",
      zh: "十进制度数表示的地理经度坐标。",
      ta: "தசம டிகிரியில் கிழக்கு–மேற்கு புவியியல் ஆயத்தொலைவு.",
    },
  },
  position_observed_at: {
    label: {
      en: "Position Observed At",
      ms: "Masa Kedudukan Dikesan",
      zh: "定位观测时间",
      ta: "இருப்பிடம் பதிவான நேரம்",
    },
    description: {
      en: "Timestamp when the GPS coordinates were observed by the receiver.",
      ms: "Cap masa apabila koordinat GPS diperhatikan oleh penerima.",
      zh: "GPS 接收器实际观测到该坐标的时间戳。",
      ta: "GPS கருவியால் இருப்பிட ஆயத்தொலைவுகள் பதிவு செய்யப்பட்ட நேரம்.",
    },
  },
  occurred_at: {
    label: {
      en: "Occurred At",
      ms: "Berlaku Pada",
      zh: "发生时间",
      ta: "நிகழ்ந்த நேரம்",
    },
    description: {
      en: "Timestamp recorded by the device for when this telemetry sample or event occurred.",
      ms: "Cap masa yang direkodkan oleh peranti apabila sampel telemetri atau kejadian ini berlaku.",
      zh: "设备记录的该遥测样本或事件实际发生的时间。",
      ta: "இந்த டெலிமெட்ரி பதிவு அல்லது நிகழ்வு நடந்ததாகச் சாதனம் பதிவு செய்த நேரம்.",
    },
  },
  received_at: {
    label: {
      en: "Server Received At",
      ms: "Diterima Pelayan Pada",
      zh: "服务器接收时间",
      ta: "சேவையகம் பெற்ற நேரம்",
    },
    description: {
      en: "Timestamp when the CarLink backend received and stored this packet (may be later than occurred_at if buffered offline).",
      ms: "Cap masa apabila pelayan CarLink menerima dan menyimpan paket ini (mungkin lewat daripada masa berlaku jika ditimbal luar talian).",
      zh: "CarLink 后端接收并存储该数据包的时间（若离线缓存后补传，会晚于发生时间）。",
      ta: "CarLink சேவையகம் இந்தத் தரவைப் பெற்றுச் சேமித்த நேரம் (ஆஃப்லைனில் சேமிக்கப்பட்டுப் பிறகு அனுப்பப்பட்டால் நிகழ்ந்த நேரத்தைவிடப் பிந்தியதாக இருக்கலாம்).",
    },
  },
  source_format: {
    label: {
      en: "Packet Source Format",
      ms: "Format Sumber Paket",
      zh: "数据包来源格式",
      ta: "தரவுப் பொதி வடிவம்",
    },
    description: {
      en: "Schema version or wire format used by the device when sending this telemetry payload.",
      ms: "Versi skema atau format muatan yang digunakan oleh peranti semasa menghantar data telemetri ini.",
      zh: "设备发送此遥测载荷时所采用的数据格式版本。",
      ta: "இந்த டெலிமெட்ரி தரவை அனுப்பும்போது சாதனம் பயன்படுத்திய வடிவமைப்புப் பதிப்பு.",
    },
  },
  vehicle_data: {
    label: {
      en: "Vehicle OBD Data",
      ms: "Data OBD Kenderaan",
      zh: "车辆 OBD 数据",
      ta: "வாகன OBD தரவு",
    },
    description: {
      en: "Nested OBD-II vehicle diagnostics and sensor readings captured in this packet.",
      ms: "Bacaan penderia dan diagnostik OBD-II kenderaan yang dirakam dalam paket ini.",
      zh: "该数据包中包含的车辆 OBD-II 诊断与传感器嵌套数据。",
      ta: "இந்தப் பதிவில் சேகரிக்கப்பட்ட வாகன OBD-II சென்சார் மற்றும் கண்டறிதல் தரவுகள்.",
    },
  },
  behaviour_data: {
    label: {
      en: "Driving Behaviour Data",
      ms: "Data Tingkah Laku Pemanduan",
      zh: "驾驶行为数据",
      ta: "ஓட்டுநர் நடத்தைத் தரவு",
    },
    description: {
      en: "Onboard IMU motion readings and edge-detected driving behaviour flags in this packet.",
      ms: "Bacaan gerakan IMU dan penanda tingkah laku pemanduan yang dikesan peranti dalam paket ini.",
      zh: "该数据包中包含的车载 IMU 运动传感器读数及终端识别的驾驶行为标记。",
      ta: "இந்தப் பதிவில் உள்ள IMU இயக்க அளவுகள் மற்றும் சாதனம் கண்டறிந்த ஓட்டுநர் நடத்தைக் குறியீடுகள்.",
    },
  },
  network_data: {
    label: {
      en: "Cellular Network Data",
      ms: "Data Rangkaian Selular",
      zh: "蜂窝网络数据",
      ta: "செல்லுலார் நெட்வொர்க் தரவு",
    },
    description: {
      en: "4G modem signal strength, carrier, and cell tower metadata captured in this packet.",
      ms: "Kekuatan isyarat modem 4G, pengendali rangkaian dan metadata menara sel dalam paket ini.",
      zh: "该数据包中包含的 4G 调制解调器信号强度、运营商及基站小区元数据。",
      ta: "இந்தப் பதிவில் உள்ள 4G மோடம் சிக்னல் வலிமை, நெட்வொர்க் வழங்குநர் மற்றும் கோபுர விவரங்கள்.",
    },
  },
  health_data: {
    label: {
      en: "Device Health Data",
      ms: "Data Kesihatan Peranti",
      zh: "设备健康状态数据",
      ta: "சாதன ஆரோக்கியத் தரவு",
    },
    description: {
      en: "Telemetry collector hardware metrics such as CPU temperature, memory, storage, and sync backlog.",
      ms: "Metrik perkakasan pengumpul telemetri seperti suhu CPU, memori, storan dan rekod tertunggak.",
      zh: "车载终端硬件健康指标，如 CPU 温度、内存、存储空间及待同步队列。",
      ta: "டெலிமெட்ரி சாதனத்தின் CPU வெப்பநிலை, நினைவகம், சேமிப்பகம் மற்றும் ஒத்திசைவு நிலுவை விவரங்கள்.",
    },
  },
  quality: {
    label: {
      en: "Data Quality",
      ms: "Kualiti Data",
      zh: "数据质量",
      ta: "தரவுத் தரம்",
    },
    description: {
      en: "System assessment of how complete or reliable the observed metric is.",
      ms: "Penilaian sistem terhadap tahap kelengkapan atau kebolehpercayaan metrik yang diperhatikan.",
      zh: "系统对当前观测指标完整性或可靠程度的评估结果。",
      ta: "கண்காணிக்கப்பட்ட அளவீட்டின் முழுமை மற்றும் நம்பகத்தன்மை குறித்த அமைப்பின் மதிப்பீடு.",
    },
  },
  freshness: {
    label: {
      en: "Reading Freshness",
      ms: "Kesegaran Bacaan",
      zh: "数据新鲜度",
      ta: "தரவுப் புதுமை",
    },
    description: {
      en: "Indicates whether the latest observation is recent, stale, or never observed.",
      ms: "Menunjukkan sama ada pemerhatian terkini masih baharu, lama (lapuk) atau belum pernah diperhatikan.",
      zh: "指示最新一条观测数据属于近期有效、已过时还是从未观测。",
      ta: "சமீபத்திய தரவு புதியதா, பழையதா அல்லது இதுவரை பெறப்படவில்லையா என்பதைக் காட்டுகிறது.",
    },
  },
  fuel_rate_source: {
    label: {
      en: "Fuel Rate Source",
      ms: "Sumber Kadar Bahan Api",
      zh: "燃油速率来源",
      ta: "எரிபொருள் விகித மூலம்",
    },
    description: {
      en: "Indicates how fuel consumption rate was obtained (such as direct OBD fuel rate or MAF petrol estimate).",
      ms: "Menunjukkan cara kadar penggunaan bahan api diperoleh (seperti bacaan terus OBD atau anggaran petrol MAF).",
      zh: "说明燃油消耗速率的获取方式（例如 OBD 直接读取或 MAF 汽油估算）。",
      ta: "எரிபொருள் நுகர்வு விகிதம் எவ்வாறு பெறப்பட்டது என்பதைக் காட்டுகிறது (நேரடி OBD அல்லது MAF பெட்ரோல் மதிப்பீடு).",
    },
  },
  acceleration_ms2: {
    label: {
      en: "Measured Acceleration (m/s²)",
      ms: "Pecutan Diukur (m/s²)",
      zh: "实测加速度 (m/s²)",
      ta: "அளவிடப்பட்ட முடுக்கம் (m/s²)",
    },
    description: {
      en: "Calculated or measured rate of speed change in m/s² for a safety event (negative values indicate braking).",
      ms: "Kadar perubahan kelajuan yang dikira atau diukur dalam m/s² bagi kejadian keselamatan (nilai negatif menandakan brek).",
      zh: "安全事件中计算或测得的加速度（米/秒²；负值表示减速/刹车）。",
      ta: "பாதுகாப்பு நிகழ்வின்போது அளவிடப்பட்ட வேக மாற்ற விகிதம் (m/s²); எதிர்மறை மதிப்பு பிரேக்கிங்கைக் குறிக்கும்.",
    },
  },
  threshold_ms2: {
    label: {
      en: "Threshold Applied (m/s²)",
      ms: "Ambang Digunakan (m/s²)",
      zh: "应用阈值 (m/s²)",
      ta: "பயன்படுத்தப்பட்ட வரம்பு (m/s²)",
    },
    description: {
      en: "Organization threshold in m/s² against which this braking or acceleration event was evaluated.",
      ms: "Ambang organisasi dalam m/s² yang digunakan untuk menilai kejadian brek atau pecutan ini.",
      zh: "评估此次刹车或加速事件时所依据的组织阈值（米/秒²）。",
      ta: "இந்த பிரேக் அல்லது முடுக்க நிகழ்வை மதிப்பிடப் பயன்படுத்தப்பட்ட நிறுவன வரம்பு (m/s²).",
    },
  },
  delta_speed_kmh: {
    label: {
      en: "Speed Change (km/h)",
      ms: "Perubahan Kelajuan (km/j)",
      zh: "速度变化量 (km/h)",
      ta: "வேக மாற்றம் (km/h)",
    },
    description: {
      en: "Net change in vehicle speed in km/h across the observed event interval.",
      ms: "Perubahan bersih kelajuan kenderaan dalam km/j sepanjang selang kejadian yang diperhatikan.",
      zh: "在观测事件时间间隔内的车速净变化量（公里/小时）。",
      ta: "கண்காணிக்கப்பட்ட நிகழ்வு இடைவெளியில் வாகன வேகத்தில் ஏற்பட்ட நிகர மாற்றம் (km/h).",
    },
  },
  unknown_seconds: {
    label: {
      en: "Unknown / Gap Duration (s)",
      ms: "Tempoh Tidak Diketahui / Jurang (s)",
      zh: "未知/间隔时长 (秒)",
      ta: "தெரியாத / இடைவெளி நேரம் (வி)",
    },
    description: {
      en: "Duration in seconds where telemetry was missing or could not be reliably classified.",
      ms: "Tempoh dalam saat apabila data telemetri tiada atau tidak dapat dikelaskan dengan pasti.",
      zh: "由于遥测缺失或无法可靠归类而计为未知状态的持续秒数。",
      ta: "டெலிமெட்ரி தரவு இல்லாத அல்லது நம்பகமாக வகைப்படுத்த முடியாத கால அளவு (வினாடிகளில்).",
    },
  },
  distance_m: {
    label: {
      en: "Distance (km)",
      ms: "Jarak (km)",
      zh: "距离 (km)",
      ta: "தூரம் (km)",
    },
    description: {
      en: "Calculated distance converted from server metres to kilometres (with exact metres shown beside it).",
      ms: "Jarak yang dikira dan ditukar daripada meter pelayan kepada kilometer (bersama nilai meter sebenar).",
      zh: "由服务器记录的米折算为公里显示的计算距离（附带原始米数）。",
      ta: "சேவையக மீட்டரிலிருந்து கிலோமீட்டராக மாற்றிக் காட்டப்படும் கணக்கிடப்பட்ட தூரம் (துல்லியமான மீட்டருடன்).",
    },
  },
  accepted_distance_m: {
    label: {
      en: "Accepted Distance (km)",
      ms: "Jarak Diterima (km)",
      zh: "已确认距离 (km)",
      ta: "ஏற்றுக்கொள்ளப்பட்ட தூரம் (km)",
    },
    description: {
      en: "Total accepted distance accumulated from valid speed segments, converted from metres to kilometres on the frontend.",
      ms: "Jumlah jarak diterima daripada segmen kelajuan sah, ditukar daripada meter kepada kilometer pada antara muka.",
      zh: "由有效速度路段累计的已确认行驶距离，前端由米自动折算为公里显示。",
      ta: "செல்லுபடியாகும் வேகப் பிரிவுகளிலிருந்து சேர்க்கப்பட்ட மொத்த ஏற்றுக்கொள்ளப்பட்ட தூரம் (முன்முனையில் மீட்டரிலிருந்து கிலோமீட்டராக மாற்றப்பட்டது).",
    },
  },
  distance_since_baseline_m: {
    label: {
      en: "Distance Since Baseline (km)",
      ms: "Jarak Sejak Garis Dasar (km)",
      zh: "基准以来行驶距离 (km)",
      ta: "அடிப்படைக்குப் பின் தூரம் (km)",
    },
    description: {
      en: "Accepted distance accrued after the initial odometer baseline timestamp, converted from metres to kilometres.",
      ms: "Jarak diterima yang terkumpul selepas cap masa garis dasar odometer awal, ditukar daripada meter kepada kilometer.",
      zh: "自初始里程基准时间点之后累计的已确认距离（前端由米折算为公里显示）。",
      ta: "ஆரம்ப ஓடோமீட்டர் அடிப்படை நேரத்திற்குப் பிறகு சேர்ந்த தூரம் (மீட்டரிலிருந்து கிலோமீட்டராக மாற்றப்பட்டது).",
    },
  },
  estimated_odometer_m: {
    label: {
      en: "Estimated Odometer (km)",
      ms: "Anggaran Odometer (km)",
      zh: "估算里程表读数 (km)",
      ta: "மதிப்பிடப்பட்ட ஓடோமீட்டர் (km)",
    },
    description: {
      en: "Estimated vehicle odometer combining the initial baseline reading and accepted distance since baseline, displayed in kilometres.",
      ms: "Anggaran odometer kenderaan yang menggabungkan bacaan garis dasar awal dan jarak sejak garis dasar dalam kilometer.",
      zh: "结合初始基准读数与基准后累计距离得出的估算总里程（以公里显示）。",
      ta: "ஆரம்ப அடிப்படை அளவையும் அதற்குப் பின் சேர்ந்த தூரத்தையும் இணைத்து கிலோமீட்டரில் காட்டப்படும் மதிப்பிடப்பட்ட ஓடோமீட்டர்.",
    },
  },
  packet_snapshot_distance_m: {
    label: {
      en: "Packet Snapshot Distance (km)",
      ms: "Jarak Petikan Paket (km)",
      zh: "数据包快照距离 (km)",
      ta: "தரவு பொதி நிலை தூரம் (km)",
    },
    description: {
      en: "Subset of accepted distance estimated from packet snapshots rather than high-rate OBD samples, displayed in kilometres.",
      ms: "Sebahagian jarak diterima yang dianggarkan daripada petikan paket dan bukannya sampel OBD, dipaparkan dalam kilometer.",
      zh: "仅基于数据包快照（而非高频 OBD 样本）估算的那部分里程，以公里显示。",
      ta: "OBD மாதிரிகளுக்குப் பதிலாக தரவு பொதி நிலைகளிலிருந்து மதிப்பிடப்பட்ட தூரப் பகுதி (கிலோமீட்டரில்).",
    },
  },
  reading_m: {
    label: {
      en: "Odometer Baseline Reading (km)",
      ms: "Bacaan Garis Dasar Odometer (km)",
      zh: "里程基准读数 (km)",
      ta: "ஓடோமீட்டர் அடிப்படை அளவு (km)",
    },
    description: {
      en: "Observed odometer reading entered and displayed in kilometres; converted to integer metres for the server.",
      ms: "Bacaan odometer yang dimasukkan dan dipaparkan dalam kilometer; ditukar kepada meter integer untuk pelayan.",
      zh: "以公里录入并显示的里程表基准读数；提交至服务器时自动换算为整数米。",
      ta: "கிலோமீட்டரில் உள்ளிடப்பட்டு காட்டப்படும் ஓடோமீட்டர் அளவு; சேவையகத்திற்கு முழு மீட்டராக மாற்றப்படும்.",
    },
  },
  carry_in_distance_m: {
    label: {
      en: "Carry-in Distance (km)",
      ms: "Jarak Bawa Masuk (km)",
      zh: "结转已行驶里程 (km)",
      ta: "முன் தொடர் தூரம் (km)",
    },
    description: {
      en: "Attested pre-monitoring distance carried into the maintenance cycle, entered and displayed in kilometres (converted to integer metres for the server).",
      ms: "Jarak pra-pemantauan yang disahkan untuk kitaran penyelenggaraan, dimasukkan dan dipaparkan dalam kilometer (ditukar kepada meter integer untuk pelayan).",
      zh: "结转至本次保养周期的已确认历史行驶距离，前端以公里录入与显示（提交给服务器时自动换算为整数米）。",
      ta: "பராமரிப்பு சுழற்சிக்கு கொண்டுவரப்பட்ட முந்தைய தூரம், கிலோமீட்டரில் உள்ளிடப்பட்டு காட்டப்படும் (சேவையகத்திற்கு மீட்டராக மாற்றப்படும்).",
    },
  },
  usage_since_service_m: {
    label: {
      en: "Usage Since Last Service (km)",
      ms: "Penggunaan Sejak Servis Terakhir (km)",
      zh: "上次保养以来里程 (km)",
      ta: "கடைசி சேவைக்குப் பின் பயன்பாடு (km)",
    },
    description: {
      en: "Combined carry-in and tracked distance accrued since the last recorded service, displayed in kilometres.",
      ms: "Gabungan jarak bawa masuk dan jarak yang dikesan sejak servis terakhir, dipaparkan dalam kilometer.",
      zh: "自上次保养记录以来累计（含结转与追踪）的行驶里程，以公里显示。",
      ta: "கடைசி சேவைக்குப் பிறகு கணக்கிடப்பட்ட மொத்த பயன்பாட்டுத் தூரம் (கிலோமீட்டரில்).",
    },
  },
  cost_minor: {
    label: {
      en: "Service Cost",
      ms: "Kos Servis",
      zh: "保养费用",
      ta: "சேவை செலவு",
    },
    description: {
      en: "Recorded maintenance service cost formatted from server minor currency units into standard currency units (100 minor units = 1.00).",
      ms: "Kos servis penyelenggaraan yang diformatkan daripada unit mata wang minor pelayan kepada unit standard (100 unit minor = 1.00).",
      zh: "由服务器最小货币单位自动换算为常规金额显示的保养费用（100 最小单位 = 1.00）。",
      ta: "சேவையக சிறிய நாணய அலகுகளிலிருந்து சாதாரண நாணயத் தொகையாக மாற்றிக் காட்டப்படும் பராமரிப்பு சேவை செலவு (100 = 1.00).",
    },
  },
  price_minor: {
    label: {
      en: "Plan Price",
      ms: "Harga Pelan",
      zh: "套餐价格",
      ta: "திட்ட விலை",
    },
    description: {
      en: "Subscription plan price formatted from server minor currency units into standard currency units (100 minor units = 1.00).",
      ms: "Harga pelan langganan yang diformatkan daripada unit mata wang minor pelayan kepada unit standard (100 unit minor = 1.00).",
      zh: "由服务器最小货币单位自动换算为常规金额显示的订阅套餐价格（100 最小单位 = 1.00）。",
      ta: "சேவையக சிறிய நாணய அலகுகளிலிருந்து சாதாரண நாணயத் தொகையாக மாற்றிக் காட்டப்படும் சந்தா திட்ட விலை (100 = 1.00).",
    },
  },
  amount_minor: {
    label: {
      en: "Invoice Amount",
      ms: "Jumlah Invois",
      zh: "发票金额",
      ta: "ரசீதுத் தொகை",
    },
    description: {
      en: "Billed amount formatted from server minor currency units into standard currency units (100 minor units = 1.00).",
      ms: "Jumlah bil yang diformatkan daripada unit mata wang minor pelayan kepada unit standard (100 unit minor = 1.00).",
      zh: "由服务器最小货币单位自动换算为常规金额显示的账单金额（100 最小单位 = 1.00）。",
      ta: "சேவையக சிறிய நாணய அலகுகளிலிருந்து சாதாரண நாணயத் தொகையாக மாற்றிக் காட்டப்படும் ரசீதுத் தொகை (100 = 1.00).",
    },
  },
  estimated_co2_kg: {
    label: {
      en: "Estimated CO₂ (kg)",
      ms: "Anggaran CO₂ (kg)",
      zh: "估算 CO₂ 排放量 (kg)",
      ta: "மதிப்பிடப்பட்ட CO₂ (kg)",
    },
    description: {
      en: "Estimated tailpipe CO₂ emissions in kilograms calculated by multiplying estimated fuel litres by the organization or default fuel emission factor.",
      ms: "Anggaran pelepasan CO₂ ekzos dalam kilogram yang dikira dengan mendarabkan liter bahan api anggaran dengan faktor pelepasan organisasi atau lalai.",
      zh: "根据估算油耗（升）乘以组织配置或默认燃油排放系数计算得出的 CO₂ 估算排放量（千克）。",
      ta: "மதிப்பிடப்பட்ட எரிபொருள் லிட்டரை நிறுவன அல்லது இயல்புநிலை உமிழ்வு காரணியால் பெருக்கிக் கணக்கிடப்பட்ட CO₂ அளவு (கிலோவில்).",
    },
  },
  emission_factor: {
    label: {
      en: "CO₂ Emission Factor",
      ms: "Faktor Pelepasan CO₂",
      zh: "CO₂ 排放系数",
      ta: "CO₂ உமிழ்வு காரணி",
    },
    description: {
      en: "Applied tank-to-wheel emission factor (kg CO₂ per litre) and whether it came from organization settings or standard fuel defaults.",
      ms: "Faktor pelepasan tangki-ke-roda yang digunakan (kg CO₂ seliter) serta sumbernya daripada tetapan organisasi atau nilai lalai standard.",
      zh: "实际应用的燃油 CO₂ 排放系数（kg CO₂/L）及其来源（组织自定义设置或标准燃料默认值）。",
      ta: "பயன்படுத்தப்பட்ட எரிபொருள் CO₂ உமிழ்வு காரணி (kg CO₂/L) மற்றும் அதன் மூலம் (நிறுவன அமைப்பு அல்லது இயல்புநிலை).",
    },
  },
  co2_petrol_kg_per_litre: {
    label: {
      en: "Petrol CO₂ Factor (kg/L)",
      ms: "Faktor CO₂ Petrol (kg/L)",
      zh: "汽油 CO₂ 系数 (kg/L)",
      ta: "பெட்ரோல் CO₂ காரணி (kg/L)",
    },
    description: {
      en: "Configured CO₂ emission factor in kg per litre for petrol and hybrid vehicles (default: 2.31 kg/L).",
      ms: "Faktor pelepasan CO₂ yang dikonfigurasikan dalam kg seliter untuk kenderaan petrol dan hibrid (lalai: 2.31 kg/L).",
      zh: "为汽油及混动车辆配置的每升燃料 CO₂ 排放系数（默认 2.31 kg/L）。",
      ta: "பெட்ரோல் மற்றும் ஹைப்ரிட் வாகனங்களுக்கு அமைக்கப்பட்ட ஒரு லிட்டருக்கான CO₂ காரணி (இயல்புநிலை: 2.31 kg/L).",
    },
  },
  co2_diesel_kg_per_litre: {
    label: {
      en: "Diesel CO₂ Factor (kg/L)",
      ms: "Faktor CO₂ Diesel (kg/L)",
      zh: "柴油 CO₂ 系数 (kg/L)",
      ta: "டீசல் CO₂ காரணி (kg/L)",
    },
    description: {
      en: "Configured CO₂ emission factor in kg per litre for diesel vehicles (default: 2.68 kg/L).",
      ms: "Faktor pelepasan CO₂ yang dikonfigurasikan dalam kg seliter untuk kenderaan diesel (lalai: 2.68 kg/L).",
      zh: "为柴油车辆配置的每升燃料 CO₂ 排放系数（默认 2.68 kg/L）。",
      ta: "டீசல் வாகனங்களுக்கு அமைக்கப்பட்ட ஒரு லிட்டருக்கான CO₂ காரணி (இயல்புநிலை: 2.68 kg/L).",
    },
  },
  distance_quality: {
    label: {
      en: "Distance Data Quality",
      ms: "Kualiti Data Jarak",
      zh: "距离数据质量",
      ta: "தூரத் தரவுத் தரம்",
    },
    description: {
      en: "Reliability indicator for the computed journey distance based on telemetry continuity and source.",
      ms: "Penunjuk kebolehpercayaan bagi jarak perjalanan yang dikira berdasarkan kesinambungan dan sumber telemetri.",
      zh: "基于遥测连续性与数据源评估的行程距离计算可靠度标识。",
      ta: "டெலிமெட்ரி தொடர்ச்சி மற்றும் மூலத்தின் அடிப்படையில் கணக்கிடப்பட்ட பயணத் தூரத்தின் நம்பகத்தன்மை நிலை.",
    },
  },
  fuel_efficiency: {
    label: {
      en: "Fuel efficiency (L/100km / km/L)",
      ms: "Kecekapan bahan api (L/100km / km/L)",
      zh: "燃油效率 (L/100km / km/L)",
      ta: "எரிபொருள் திறன் (L/100km / km/L)",
    },
    description: {
      en: "Combined fuel economy summary showing average consumption in L/100km and distance per litre in km/L.",
      ms: "Ringkasan ekonomi bahan api gabungan yang menunjukkan purata penggunaan dalam L/100km dan jarak seliter dalam km/L.",
      zh: "综合燃油经济性摘要，同时显示平均百公里油耗 (L/100km) 与每升燃油可行驶公里数 (km/L)。",
      ta: "100 கி.மீ.-க்கு சராசரி எரிபொருள் நுகர்வு (L/100km) மற்றும் ஒரு லிட்டருக்குக் கிடைக்கும் தூரம் (km/L) ஆகியவற்றைக் காட்டும் ஒருங்கிணைந்த எரிபொருள் திறன் சுருக்கம்.",
    },
  },
  fuel_litres: {
    label: {
      en: "Fuel used (L)",
      ms: "Bahan api digunakan (L)",
      zh: "耗油量 (L)",
      ta: "பயன்படுத்தப்பட்ட எரிபொருள் (L)",
    },
    description: {
      en: "Estimated total litres of fuel consumed over the journey from OBD fuel rate or MAF integration.",
      ms: "Anggaran jumlah liter bahan api yang digunakan sepanjang perjalanan daripada integrasi kadar bahan api OBD atau MAF.",
      zh: "根据 OBD 燃油速率或 MAF 空气流量积分估算的本次行程累计耗油量（升）。",
      ta: "OBD எரிபொருள் விகிதம் அல்லது MAF கணக்கீட்டிலிருந்து பயணத்தில் பயன்படுத்தப்பட்டதாக மதிப்பிடப்பட்ட மொத்த எரிபொருள் அளவு (லிட்டர்).",
    },
  },
  fuel_efficiency_l_per_100km: {
    label: {
      en: "Fuel efficiency (L/100km)",
      ms: "Kecekapan bahan api (L/100km)",
      zh: "百公里油耗 (L/100km)",
      ta: "எரிபொருள் திறன் (L/100km)",
    },
    description: {
      en: "Average fuel consumed per 100 kilometres travelled during the journey. Lower values indicate better efficiency.",
      ms: "Purata bahan api yang digunakan bagi setiap 100 kilometer perjalanan. Nilai lebih rendah menunjukkan kecekapan lebih baik.",
      zh: "行程期间平均每行驶 100 公里消耗的燃油升数，数值越低越省油。",
      ta: "பயணத்தின்போது சராசரியாக 100 கிலோமீட்டருக்குப் பயன்படுத்தப்பட்ட எரிபொருள் (லிட்டர்). குறைந்த மதிப்பு சிறந்த திறனைக் குறிக்கும்.",
    },
  },
  fuel_efficiency_km_per_l: {
    label: {
      en: "Fuel efficiency (km/L)",
      ms: "Kecekapan bahan api (km/L)",
      zh: "燃油经济性 (km/L)",
      ta: "எரிபொருள் திறன் (km/L)",
    },
    description: {
      en: "Average kilometres travelled per litre of fuel consumed during the journey. Higher values indicate better efficiency.",
      ms: "Purata kilometer perjalanan bagi setiap liter bahan api yang digunakan semasa perjalanan. Nilai lebih tinggi lebih jimat.",
      zh: "行程期间每升燃油平均行驶的公里数，数值越高表示越省油。",
      ta: "பயணத்தின்போது ஒரு லிட்டர் எரிபொருளில் சராசரியாகப் பயணித்த கிலோமீட்டர்கள். அதிக மதிப்பு சிறந்த திறனைக் குறிக்கும்.",
    },
  },
  driver_attribution: {
    label: {
      en: "Driver Attribution",
      ms: "Pengaitan Pemandu",
      zh: "驾驶员归属",
      ta: "ஓட்டுநர் இணைப்பு",
    },
    description: {
      en: "How this trip or event was linked to a driver (such as an authorized shift or unattributed).",
      ms: "Cara perjalanan atau kejadian ini dikaitkan dengan pemandu (seperti syif dibenarkan atau belum dikaitkan).",
      zh: "说明该行程或事件如何关联到具体驾驶员（如通过已授权班次或未归属）。",
      ta: "இந்தப் பயணம் அல்லது நிகழ்வு ஓட்டுநருடன் எவ்வாறு இணைக்கப்பட்டது (எ.கா. அங்கீகரிக்கப்பட்ட ஷிப்ட்).",
    },
  },
  is_passenger_trip: {
    label: {
      en: "Passenger Trip Flag",
      ms: "Penanda Perjalanan Penumpang",
      zh: "乘客行程标记",
      ta: "பயணி பயணக் குறியீடு",
    },
    description: {
      en: "Indicates whether this journey record is marked as a passenger trip rather than active driving.",
      ms: "Menunjukkan sama ada rekod perjalanan ini ditandakan sebagai perjalanan penumpang dan bukan pemanduan aktif.",
      zh: "指示该行程记录是否标记为乘车行程而非本人主动驾驶。",
      ta: "இந்தப் பயணப் பதிவு ஓட்டுநராக அல்லாமல் பயணியாகச் சென்ற பயணமா என்பதைக் காட்டுகிறது.",
    },
  },
  detection_version: {
    label: {
      en: "Detection Algorithm Version",
      ms: "Versi Algoritma Pengesanan",
      zh: "检测算法版本",
      ta: "கண்டறிதல் வழிமுறைப் பதிப்பு",
    },
    description: {
      en: "Version identifier of the backend analytics logic that derived this journey or safety result.",
      ms: "Pengecam versi logik analitik pelayan yang menjana keputusan perjalanan atau keselamatan ini.",
      zh: "生成此行程划分或安全事件结果的后端分析算法版本号。",
      ta: "இந்தப் பயணம் அல்லது பாதுகாப்பு முடிவைக் கணக்கிட்ட சேவையகப் பகுப்பாய்வுப் பதிப்பு.",
    },
  },
  revision: {
    label: {
      en: "Record Revision",
      ms: "Semakan Rekod",
      zh: "记录修订号",
      ta: "பதிவுத் திருத்த எண்",
    },
    description: {
      en: "Incremental revision number updated when derived journey or summary analytics are recomputed.",
      ms: "Nombor semakan berperingkat yang dikemas kini apabila analitik perjalanan atau ringkasan dikira semula.",
      zh: "当行程或汇总分析结果被重新计算时递增的修订版本号。",
      ta: "பயணப் பகுப்பாய்வு மீண்டும் கணக்கிடப்படும்போது புதுப்பிக்கப்படும் திருத்த எண்.",
    },
  },
  end_reason: {
    label: {
      en: "Journey End Reason",
      ms: "Sebab Perjalanan Tamat",
      zh: "行程结束原因",
      ta: "பயணம் முடிந்த காரணம்",
    },
    description: {
      en: "Condition that closed the detected journey (for example engine turned off or telemetry gap).",
      ms: "Keadaan yang menamatkan perjalanan yang dikesan (contohnya enjin dimatikan atau jurang telemetri).",
      zh: "触发当前行程判定结束的条件（例如发动机熄火或遥测信号中断）。",
      ta: "பயணம் முடிவடைந்ததைக் குறிக்கும் காரணம் (எ.கா. என்ஜின் அணைக்கப்பட்டது அல்லது தரவு இடைவெளி).",
    },
  },
  authorized_shift_id: {
    label: {
      en: "Authorized Shift ID",
      ms: "ID Syif Dibenarkan",
      zh: "授权班次 ID",
      ta: "அங்கீகரிக்கப்பட்ட ஷிப்ட் ஐடி",
    },
    description: {
      en: "Unique identifier of the driver shift that authorized operation during this journey or event.",
      ms: "Pengecam unik syif pemandu yang membenarkan operasi semasa perjalanan atau kejadian ini.",
      zh: "关联此次行程或事件的已授权驾驶员班次唯一标识符。",
      ta: "இந்தப் பயணம் அல்லது நிகழ்வின்போது வாகன இயக்கத்தை அங்கீகரித்த ஓட்டுநர் ஷிப்ட்டின் தனித்துவ ஐடி.",
    },
  },
  sample_id: {
    label: {
      en: "Telemetry Sample ID",
      ms: "ID Sampel Telemetri",
      zh: "遥测样本 ID",
      ta: "டெலிமெட்ரி மாதிரி ஐடி",
    },
    description: {
      en: "Unique identifier of this individual telemetry sample record.",
      ms: "Pengecam unik bagi rekod sampel telemetri individu ini.",
      zh: "单条遥测样本记录的唯一标识符。",
      ta: "இந்தத் தனிப்பட்ட டெலிமெட்ரி பதிவின் தனித்துவ அடையாள எண்.",
    },
  },
  inbox_id: {
    label: {
      en: "Ingestion Inbox ID",
      ms: "ID Peti Masuk Pengambilan",
      zh: "接收队列 ID",
      ta: "தரவு வரவேற்பு ஐடி",
    },
    description: {
      en: "Internal ingestion queue identifier for the raw incoming telemetry batch.",
      ms: "Pengecam baris gilir pengambilan dalaman bagi kelompok telemetri mentah yang diterima.",
      zh: "原始遥测数据包进入后端接收队列时分配的内部标识符。",
      ta: "உள்வரும் மூல டெலிமெட்ரி தொகுப்பிற்கான உள் வரவேற்பு வரிசை ஐடி.",
    },
  },
  installation_id: {
    label: {
      en: "Device Installation ID",
      ms: "ID Pemasangan Peranti",
      zh: "设备安装 ID",
      ta: "சாதன நிறுவல் ஐடி",
    },
    description: {
      en: "Unique identifier of the physical installation pairing a device to a vehicle.",
      ms: "Pengecam unik pemasangan fizikal yang memadankan peranti dengan kenderaan.",
      zh: "将特定硬件设备绑定到某辆车的物理安装记录唯一标识符。",
      ta: "சாதனத்தை வாகனத்துடன் இணைக்கும் நிறுவல் பதிவின் தனித்துவ ஐடி.",
    },
  },
  device_id: {
    label: {
      en: "Device ID",
      ms: "ID Peranti",
      zh: "设备 ID",
      ta: "சாதன ஐடி",
    },
    description: {
      en: "Unique identifier of the registered telemetry hardware device.",
      ms: "Pengecam unik peranti perkakasan telemetri yang berdaftar.",
      zh: "已注册车载遥测硬件设备的唯一标识符。",
      ta: "பதிவுசெய்யப்பட்ட டெலிமெட்ரி வன்பொருள் சாதனத்தின் தனித்துவ ஐடி.",
    },
  },
  vehicle_id: {
    label: {
      en: "Vehicle ID",
      ms: "ID Kenderaan",
      zh: "车辆 ID",
      ta: "வாகன ஐடி",
    },
    description: {
      en: "Unique identifier of the vehicle record in the organization fleet.",
      ms: "Pengecam unik rekod kenderaan dalam armada organisasi.",
      zh: "组织车队中该车辆记录的唯一标识符。",
      ta: "நிறுவனத்தின் வாகனப் பதிவேட்டில் உள்ள வாகனத்தின் தனித்துவ ஐடி.",
    },
  },
  driver_id: {
    label: {
      en: "Driver ID",
      ms: "ID Pemandu",
      zh: "驾驶员 ID",
      ta: "ஓட்டுநர் ஐடி",
    },
    description: {
      en: "Unique identifier of the driver profile.",
      ms: "Pengecam unik profil pemandu.",
      zh: "驾驶员档案的唯一标识符。",
      ta: "ஓட்டுநர் சுயவிவரத்தின் தனித்துவ ஐடி.",
    },
  },
  shift_id: {
    label: {
      en: "Shift ID",
      ms: "ID Syif",
      zh: "班次 ID",
      ta: "ஷிப்ட் ஐடி",
    },
    description: {
      en: "Unique identifier of the driving shift record.",
      ms: "Pengecam unik rekod syif pemanduan.",
      zh: "驾驶班次记录的唯一标识符。",
      ta: "ஓட்டுநர் ஷிப்ட் பதிவின் தனித்துவ ஐடி.",
    },
  },
  performed_at: {
    label: {
      en: "Performed At",
      ms: "Dilakukan Pada",
      zh: "执行时间",
      ta: "நிறைவேற்றப்பட்ட நேரம்",
    },
    description: {
      en: "Date and time when the maintenance service or action was performed (for example ISO-8601 timestamp).",
      ms: "Tarikh dan masa apabila penyelenggaraan atau tindakan dijalankan (contohnya cap masa ISO-8601).",
      zh: "执行维护保养或操作的具体日期与时间（例如 ISO-8601 时间戳）。",
      ta: "பராமரிப்புப் பணி அல்லது செயல் செய்யப்பட்ட தேதி மற்றும் நேரம் (ISO-8601 வடிவத்தில்).",
    },
  },
  completed_item_ids: {
    label: {
      en: "Completed Item Ids",
      ms: "ID Item Selesai",
      zh: "已完成项目 ID",
      ta: "முடிக்கப்பட்ட உருப்படி ஐடிகள்",
    },
    description: {
      en: "Maintenance checklist or schedule item IDs completed during this service record.",
      ms: "ID item senarai semak atau jadual penyelenggaraan yang disiapkan dalam rekod servis ini.",
      zh: "在本次维修保养记录中已完成的保养项目 ID 列表。",
      ta: "இந்தப் பராமரிப்புப் பதிவில் முடிக்கப்பட்ட பராமரிப்புப் பட்டியல் உருப்படிகளின் ஐடிகள்.",
    },
  },
  odometer_source: {
    label: {
      en: "Odometer Source",
      ms: "Sumber Odometer",
      zh: "里程读数来源",
      ta: "ஓடோமீட்டர் மூலம்",
    },
    description: {
      en: "Indicates where the recorded odometer reading came from (such as manual entry or OBD telemetry).",
      ms: "Menunjukkan sumber bacaan odometer yang direkodkan (seperti input manual atau telemetri OBD).",
      zh: "说明所记录里程表读数的来源（例如人工录入或 OBD 遥测获取）。",
      ta: "பதிவுசெய்யப்பட்ட ஓடோமீட்டர் அளவு எங்கிருந்து பெறப்பட்டது என்பதைக் காட்டுகிறது (கைமுறை உள்ளீடு அல்லது OBD).",
    },
  },
  model_year: {
    label: {
      en: "Model Year",
      ms: "Tahun Model",
      zh: "车型年份",
      ta: "மாதிரி ஆண்டு",
    },
    description: {
      en: "Manufacturer model year of the vehicle.",
      ms: "Tahun model pengeluar bagi kenderaan.",
      zh: "车辆的出厂车型年份。",
      ta: "வாகனத்தின் உற்பத்தி மாதிரி ஆண்டு.",
    },
  },
  id: {
    label: {
      en: "Record ID",
      ms: "ID Rekod",
      zh: "记录 ID",
      ta: "பதிவு ஐடி",
    },
    description: {
      en: "Unique UUID identifier assigned to this record.",
      ms: "Pengecam UUID unik yang diberikan kepada rekod ini.",
      zh: "分配给此记录的唯一 UUID 标识符。",
      ta: "இந்தப் பதிவிற்கு ஒதுக்கப்பட்ட தனித்துவ UUID அடையாள எண்.",
    },
  },
  route: {
    label: {
      en: "Route",
      ms: "Laluan API",
      zh: "请求路由",
      ta: "வழித்தடம்",
    },
    description: {
      en: "Matched API route template handled by the server (without raw query strings or secrets).",
      ms: "Templat laluan API yang dipadankan oleh pelayan (tanpa rentetan pertanyaan atau rahsia).",
      zh: "服务器匹配的 API 路由模板（不含原始查询参数或敏感信息）。",
      ta: "சேவையகத்தால் கையாளப்பட்ட API வழித்தட வார்ப்புரு (ரகசியத் தரவுகள் இன்றி).",
    },
  },
  http_status: {
    label: {
      en: "HTTP Status",
      ms: "Status HTTP",
      zh: "HTTP 状态码",
      ta: "HTTP நிலை",
    },
    description: {
      en: "Numeric HTTP response status code returned for the request (for example 200, 403, or 500).",
      ms: "Kod status respons HTTP berangka yang dikembalikan untuk permintaan (contohnya 200, 403, atau 500).",
      zh: "请求返回的 HTTP 响应状态码（例如 200、403 或 500）。",
      ta: "கோரிக்கைக்குத் திருப்பப்பட்ட எண் HTTP பதில் குறியீடு (எ.கா. 200, 403, அல்லது 500).",
    },
  },
  ip_address: {
    label: {
      en: "Client IP Address",
      ms: "Alamat IP Klien",
      zh: "客户端 IP 地址",
      ta: "கிளையண்ட் IP முகவரி",
    },
    description: {
      en: "Resolved client IP address determined using trusted ingress proxy rules.",
      ms: "Alamat IP klien yang dikenal pasti menggunakan peraturan proksi masuk yang dipercayai.",
      zh: "依据受信任代理规则解析得到的客户端 IP 地址。",
      ta: "நம்பகமான ப்ராக்ஸி விதிகளின் அடிப்படையில் தீர்மானிக்கப்பட்ட கிளையண்ட் IP முகவரி.",
    },
  },
  user_agent: {
    label: {
      en: "User Agent / Browser",
      ms: "Ejen Pengguna / Pelayar",
      zh: "User-Agent / 浏览器",
      ta: "பயனர் முகவர் / உலாவி",
    },
    description: {
      en: "Reported client User-Agent header or parsed browser and platform metadata.",
      ms: "Pengepala User-Agent klien yang dilaporkan atau metadata pelayar dan platform yang dihuraikan.",
      zh: "客户端上报的 User-Agent 请求头或解析后的浏览器与平台信息。",
      ta: "கிளையண்ட் தெரிவித்த User-Agent தலைப்பு அல்லது உலாவி மற்றும் இயங்குதளத் தகவல்.",
    },
  },
  actor_user_id: {
    label: {
      en: "Actor User ID",
      ms: "ID Pengguna Pelaku",
      zh: "操作用户 ID",
      ta: "செயல்பட்ட பயனர் ஐடி",
    },
    description: {
      en: "Unique identifier of the authenticated user account associated with this audit action, if any.",
      ms: "Pengecam unik akaun pengguna sah yang dikaitkan dengan tindakan audit ini, jika ada.",
      zh: "与此审计操作关联的已认证用户账户唯一标识符（如适用）。",
      ta: "இந்தத் தணிக்கைச் செயலுடன் தொடர்புடைய அங்கீகரிக்கப்பட்ட பயனர் கணக்கின் தனித்துவ ஐடி (இருப்பின்).",
    },
  },
  actor_name: {
    label: {
      en: "Actor",
      ms: "Pelaku",
      zh: "操作者",
      ta: "செயல்பட்டவர்",
    },
    description: {
      en: "Human user display name and email, or the system component that initiated the audited action.",
      ms: "Nama paparan dan e-mel pengguna, atau komponen sistem yang memulakan tindakan audit.",
      zh: "发起此次审计操作的用户显示名称与邮箱，或系统组件标识。",
      ta: "இந்தத் தணிக்கைச் செயலைத் தொடங்கிய பயனரின் பெயர் மற்றும் மின்னஞ்சல் அல்லது கணினிப் பகுதி.",
    },
  },
  action: {
    label: {
      en: "Action",
      ms: "Tindakan",
      zh: "操作",
      ta: "செயல்",
    },
    description: {
      en: "Canonical name of the audited HTTP route or background system operation.",
      ms: "Nama kanonik bagi laluan HTTP atau operasi sistem latar belakang yang diaudit.",
      zh: "被审计的 HTTP 路由或后台系统操作的规范名称。",
      ta: "தணிக்கை செய்யப்பட்ட HTTP வழித்தடம் அல்லது பின்னணி கணினிச் செயலின் பெயர்.",
    },
  },
  action_name: {
    label: {
      en: "Action Name",
      ms: "Nama Tindakan",
      zh: "操作名称",
      ta: "செயலின் பெயர்",
    },
    description: {
      en: "Recorded audit action identifier describing the endpoint or worker event.",
      ms: "Pengecam tindakan audit yang direkodkan untuk menerangkan titik akhir atau acara pekerja.",
      zh: "记录的审计操作标识符，用于说明接口或后台任务事件。",
      ta: "முனையம் அல்லது பின்னணி நிகழ்வை விவரிக்கும் பதிவுசெய்யப்பட்ட தணிக்கைச் செயல் பெயர்.",
    },
  },
  source: {
    label: {
      en: "Event Source",
      ms: "Sumber Acara",
      zh: "事件来源",
      ta: "நிகழ்வு மூலம்",
    },
    description: {
      en: "Execution origin of the audit record (such as http, queue, scheduler, cli, or telemetry).",
      ms: "Asal pelaksanaan rekod audit (seperti http, queue, scheduler, cli, atau telemetry).",
      zh: "审计记录的执行来源（例如 http、queue、scheduler、cli 或 telemetry）。",
      ta: "தணிக்கைப் பதிவின் செயல்பாட்டு மூலம் (எ.கா. http, queue, scheduler, cli, அல்லது telemetry).",
    },
  },
  plmn: {
    label: {
      en: "PLMN (MCC/MNC)",
      ms: "PLMN (MCC/MNC)",
      zh: "PLMN 运营商代码",
      ta: "PLMN குறியீடு",
    },
    description: {
      en: "Public Land Mobile Network identifier combining country (MCC) and mobile carrier (MNC) codes.",
      ms: "Pengecam Rangkaian Mudah Alih Awam yang menggabungkan kod negara (MCC) dan pengendali (MNC).",
      zh: "公共陆地移动网络标识，由国家码 (MCC) 和运营商码 (MNC) 组成。",
      ta: "நாடு (MCC) மற்றும் மொபைல் சேவை வழங்குநர் (MNC) குறியீடுகளை இணைக்கும் பொது மொபைல் நெட்வொர்க் அடையாளம்.",
    },
  },
};

const VALUE_TERMS: Record<string, TermEntry> = {
  maf: {
    label: {
      en: "MAF Air Flow Sensor Estimate",
      ms: "Anggaran Penderia Aliran Udara MAF",
      zh: "MAF 空气流量传感器估算",
      ta: "MAF காற்றோட்ட சென்சார் மதிப்பீடு",
    },
    description: {
      en: "Fuel rate is estimated from Mass Air Flow (MAF) readings using the configured air-to-fuel ratio and fuel density.",
      ms: "Kadar bahan api dianggarkan daripada bacaan Aliran Jisim Udara (MAF) menggunakan nisbah udara-bahan api dan ketumpatan yang ditetapkan.",
      zh: "根据空气质量流量 (MAF) 读数结合设定的空燃比与燃油密度估算耗油速率。",
      ta: "அமைக்கப்பட்ட காற்று-எரிபொருள் விகிதம் மற்றும் அடர்த்தியைப் பயன்படுத்தி MAF காற்றோட்ட அளவிலிருந்து எரிபொருள் விகிதம் கணக்கிடப்படுகிறது.",
    },
  },
  direct: {
    label: {
      en: "Direct ECU Fuel Sensor",
      ms: "Penderia Bahan Api ECU Terus",
      zh: "ECU 直接油耗传感器",
      ta: "நேரடி ECU எரிபொருள் சென்சார்",
    },
    description: {
      en: "Fuel rate is read directly from the vehicle ECU's reported OBD fuel-rate parameter.",
      ms: "Kadar bahan api dibaca terus daripada parameter kadar bahan api OBD yang dilaporkan oleh ECU kenderaan.",
      zh: "直接采用车辆 ECU 通过 OBD 上报的瞬时燃油消耗率参数。",
      ta: "வாகனத்தின் ECU நேரடியாகத் தெரிவிக்கும் OBD எரிபொருள் விகித அளவிலிருந்து பெறப்படுகிறது.",
    },
  },
  maf_petrol_estimate: {
    label: {
      en: "MAF Petrol Estimate",
      ms: "Anggaran Petrol MAF",
      zh: "MAF 汽油油耗估算",
      ta: "MAF பெட்ரோல் மதிப்பீடு",
    },
    description: {
      en: "Petrol fuel consumption estimated from OBD Mass Air Flow (MAF) when a direct ECU fuel rate is unavailable.",
      ms: "Penggunaan petrol yang dianggarkan daripada MAF OBD apabila bacaan kadar bahan api ECU terus tiada.",
      zh: "在 ECU 未直接提供油耗速率时，依据 OBD 空气流量 (MAF) 估算的汽油消耗量。",
      ta: "நேரடி ECU எரிபொருள் விகிதம் இல்லாதபோது OBD MAF அளவிலிருந்து கணக்கிடப்பட்ட பெட்ரோல் நுகர்வு.",
    },
  },
  direct_packet_snapshot: {
    label: {
      en: "Direct Packet Snapshot",
      ms: "Petikan Paket Terus",
      zh: "数据包直接快照",
      ta: "நேரடித் தரவுப் பொதிப் பதிவு",
    },
    description: {
      en: "Value taken directly from the latest received telemetry packet without secondary estimation.",
      ms: "Nilai diambil terus daripada paket telemetri terkini yang diterima tanpa anggaran sekunder.",
      zh: "直接取自最新接收的遥测数据包原始快照，未经过二次推算。",
      ta: "இரண்டாம் நிலை மதிப்பீடு இன்றி சமீபத்திய டெலிமெட்ரி தரவுப் பொதியிலிருந்து நேரடியாக எடுக்கப்பட்ட மதிப்பு.",
    },
  },
  packet_snapshot: {
    label: {
      en: "Packet Snapshot",
      ms: "Petikan Paket",
      zh: "数据包快照",
      ta: "தரவுப் பொதிப் பதிவு",
    },
    description: {
      en: "Value captured as a point-in-time snapshot from an ingested telemetry packet.",
      ms: "Nilai dirakam sebagai petikan titik masa daripada paket telemetri yang diterima.",
      zh: "从已接收的遥测数据包中提取的瞬时快照值。",
      ta: "பெறப்பட்ட டெலிமெட்ரி தரவுப் பொதியிலிருந்து அந்த நேரத்தில் எடுக்கப்பட்ட மதிப்பு.",
    },
  },
  reported_fix: {
    label: {
      en: "Reported GPS Fix",
      ms: "Kedudukan GPS Dilaporkan",
      zh: "设备上报 GPS 定位",
      ta: "பதிவான GPS இருப்பிடம்",
    },
    description: {
      en: "Location and quality derived from a GPS fix explicitly reported by the device.",
      ms: "Lokasi dan kualiti diperoleh daripada kunci kedudukan GPS yang dilaporkan oleh peranti.",
      zh: "基于设备明确上报的有效 GPS 定位结果。",
      ta: "சாதனம் நேரடியாகத் தெரிவித்த GPS இருப்பிடப் பூட்டிலிருந்து பெறப்பட்டது.",
    },
  },
  unusable: {
    label: {
      en: "Unusable Reading",
      ms: "Bacaan Tidak Boleh Digunakan",
      zh: "不可用数据",
      ta: "பயன்படுத்த முடியாத அளவு",
    },
    description: {
      en: "Telemetry data was missing, invalid, or had gaps too large for reliable calculation.",
      ms: "Data telemetri tiada, tidak sah atau mempunyai jurang terlalu besar untuk pengiraan yang boleh dipercayai.",
      zh: "由于遥测数据缺失、无效或采样间隔过大，无法用于可靠计算。",
      ta: "தரவு இல்லாததால், தவறானதால் அல்லது இடைவெளி அதிகமாக இருப்பதால் நம்பகமான கணக்கீட்டிற்குப் பயன்படுத்த முடியாது.",
    },
  },
  unreported: {
    label: {
      en: "Not Reported",
      ms: "Tidak Dilaporkan",
      zh: "未上报",
      ta: "பதிவாகவில்லை",
    },
    description: {
      en: "The vehicle ECU or device did not report this field in the telemetry payload.",
      ms: "ECU kenderaan atau peranti tidak melaporkan medan ini dalam muatan telemetri.",
      zh: "车辆 ECU 或车载终端未在遥测数据中上报该字段。",
      ta: "வாகன ECU அல்லது சாதனம் இந்தப் புலத்தைத் தரவில் தெரிவிக்கவில்லை.",
    },
  },
  unverified_edge_claim: {
    label: {
      en: "Unverified Edge Claim",
      ms: "Dakwaan Peranti Belum Disahkan",
      zh: "未验证的终端上报声明",
      ta: "சரிபார்க்கப்படாத சாதனத் தகவல்",
    },
    description: {
      en: "Flag or metric reported by the edge device that has not been independently verified by server-side physics checks.",
      ms: "Penanda atau metrik yang dilaporkan peranti yang belum disahkan secara bebas oleh semakan pelayan.",
      zh: "由边缘设备自行上报、尚未经过服务端独立校验的标记或指标。",
      ta: "சாதனம் தெரிவித்த இந்தத் தகவல் சேவையகத்தின் சுயாதீனச் சரிபார்ப்பால் இன்னும் உறுதிப்படுத்தப்படவில்லை.",
    },
  },
  pi_snapshot_v1: {
    label: {
      en: "Pi Snapshot v1 Format",
      ms: "Format Petikan Pi v1",
      zh: "树莓派快照格式 v1",
      ta: "Pi ஸ்னாப்ஷாட் v1 வடிவம்",
    },
    description: {
      en: "Legacy Raspberry Pi edge collector telemetry packet format (v1).",
      ms: "Format paket telemetri pengumpul pinggir Raspberry Pi (v1).",
      zh: "Raspberry Pi 边缘采集端使用的 v1 快照遥测数据包格式。",
      ta: "Raspberry Pi சாதனம் அனுப்பும் v1 டெலிமெட்ரி தரவுப் பொதி வடிவம்.",
    },
  },
  canonical_v1: {
    label: {
      en: "Canonical v1 Format",
      ms: "Format Kanonik v1",
      zh: "标准格式 v1",
      ta: "நியம v1 வடிவம்",
    },
    description: {
      en: "Normalized canonical CarLink telemetry payload schema (v1).",
      ms: "Skema muatan telemetri kanonik CarLink yang dinormalkan (v1).",
      zh: "经过规范化处理的 CarLink 标准遥测载荷格式 (v1)。",
      ta: "தரப்படுத்தப்பட்ட CarLink டெலிமெட்ரி தரவு வடிவம் (v1).",
    },
  },
  telemetry_gap: {
    label: {
      en: "Telemetry Gap",
      ms: "Jurang Telemetri",
      zh: "遥测数据中断",
      ta: "டெலிமெட்ரி இடைவெளி",
    },
    description: {
      en: "Ended or split because no new telemetry packets arrived within the allowed continuity window.",
      ms: "Ditamatkan atau diasingkan kerana tiada paket telemetri baharu diterima dalam tempoh kesinambungan yang dibenarkan.",
      zh: "由于在允许的连续时间窗口内未收到新遥测数据包而结束或分段。",
      ta: "அனுமதிக்கப்பட்ட நேர இடைவெளிக்குள் புதிய டெலிமெட்ரி தரவு வராததால் முடிவடைந்தது.",
    },
  },
  automatic_end: {
    label: {
      en: "Automatic end",
      ms: "Tamat automatik",
      zh: "自动结束",
      ta: "தானியங்கி முடிவு",
    },
    description: {
      en: "Journey ended automatically after vehicle inactivity or the end of the telemetry continuity window.",
      ms: "Perjalanan tamat secara automatik selepas kenderaan tidak aktif atau tamat tetingkap kesinambungan telemetri.",
      zh: "车辆停止活动或超过遥测连续时间窗口后，系统自动结束了本次行程。",
      ta: "வாகன இயக்கம் நின்றதால் அல்லது டெலிமெட்ரி தொடர்ச்சி நேரம் முடிந்ததால் பயணம் தானாகவே முடிவடைந்தது.",
    },
  },
  speed_trapezoid: {
    label: {
      en: "Speed trapezoid",
      ms: "Trapezoid kelajuan",
      zh: "速度梯形积分",
      ta: "வேக சரிவகக் கணக்கீடு",
    },
    description: {
      en: "Distance integrated using trapezoidal averaging of consecutive vehicle speed readings.",
      ms: "Jarak diintegrasikan menggunakan purata trapezoid bacaan kelajuan kenderaan berturutan.",
      zh: "使用连续车速读数的梯形积分法计算得到的行驶距离。",
      ta: "தொடர்ச்சியான வாகன வேக அளவீடுகளின் சரிவகச் சராசரி முறையில் கணக்கிடப்பட்ட தூரம்.",
    },
  },
  speed_estimated: {
    label: {
      en: "Speed estimated",
      ms: "Dianggarkan kelajuan",
      zh: "速度估算",
      ta: "வேக மதிப்பீடு",
    },
    description: {
      en: "Distance estimated client-side from observed vehicle speed samples over time.",
      ms: "Jarak dianggarkan di bahagian klien daripada sampel kelajuan kenderaan yang diperhatikan.",
      zh: "在前端根据观测到的车速样本随时间积分估算的行驶距离。",
      ta: "நேரத்தைப் பொறுத்த வாகன வேக மாதிரிகளிலிருந்து கணக்கிடப்பட்ட தூரம்.",
    },
  },
  gps_coordinates: {
    label: {
      en: "GPS coordinates",
      ms: "Koordinat GPS",
      zh: "GPS 坐标",
      ta: "GPS ஆயத்தொலைவுகள்",
    },
    description: {
      en: "Distance estimated from great-circle (Haversine) distances between consecutive GPS coordinates.",
      ms: "Jarak dianggarkan daripada jarak bulatan besar (Haversine) antara koordinat GPS berturutan.",
      zh: "基于连续 GPS 经纬度坐标之间的大圆距离（Haversine 公式）估算的行驶距离。",
      ta: "தொடர்ச்சியான GPS ஆயத்தொலைவுகளுக்கு இடையேயான Haversine தூரத்திலிருந்து கணக்கிடப்பட்ட தூரம்.",
    },
  },
  stationary_engine_off: {
    label: {
      en: "Stationary (Engine Off)",
      ms: "Pegun (Enjin Mati)",
      zh: "静止（发动机熄火）",
      ta: "நிலையானது (என்ஜின் அணைப்பு)",
    },
    description: {
      en: "Vehicle came to a stop and the engine was detected as turned off.",
      ms: "Kenderaan berhenti dan enjin dikesan telah dimatikan.",
      zh: "车辆已停稳且检测到发动机处于熄火状态。",
      ta: "வாகனம் நின்று என்ஜின் அணைக்கப்பட்டதாகக் கண்டறியப்பட்டது.",
    },
  },
  stationary_engine_unknown: {
    label: {
      en: "Stationary (Engine State Unknown)",
      ms: "Pegun (Status Enjin Tidak Diketahui)",
      zh: "静止（发动机状态未知）",
      ta: "நிலையானது (என்ஜின் நிலை தெரியவில்லை)",
    },
    description: {
      en: "Vehicle appeared stationary, but engine running status could not be confirmed from OBD readings.",
      ms: "Kenderaan kelihatan pegun, tetapi status hidup enjin tidak dapat dipastikan daripada bacaan OBD.",
      zh: "车辆处于静止状态，但根据 OBD 读数无法确认发动机是否仍在运转。",
      ta: "வாகனம் நகராமல் உள்ளது, ஆனால் OBD அளவுகளிலிருந்து என்ஜின் நிலையை உறுதிப்படுத்த முடியவில்லை.",
    },
  },
  not_implemented: {
    label: {
      en: "Not Implemented",
      ms: "Belum Dilaksanakan",
      zh: "暂未实现",
      ta: "செயல்படுத்தப்படவில்லை",
    },
    description: {
      en: "This metric or calculation path is not yet implemented for the current vehicle or telemetry setup.",
      ms: "Metrik atau kaedah pengiraan ini belum dilaksanakan lagi untuk tetapan kenderaan atau telemetri semasa.",
      zh: "当前车辆或遥测配置下尚未实现该指标或计算路径。",
      ta: "தற்போதைய வாகனம் அல்லது டெலிமெட்ரி அமைப்பிற்கு இந்தக் கணக்கீடு இன்னும் செயல்படுத்தப்படவில்லை.",
    },
  },
  uncalibrated_speed_difference: {
    label: {
      en: "Uncalibrated Speed Difference",
      ms: "Perbezaan Kelajuan Tidak Ditentukur",
      zh: "未校准的速度差值",
      ta: "அளவுத்திருத்தம் செய்யாத வேக வேறுபாடு",
    },
    description: {
      en: "Derived from the change in reported vehicle speed over time without external sensor calibration.",
      ms: "Diperoleh daripada perubahan kelajuan kenderaan yang dilaporkan dari semasa ke semasa tanpa penentukuran penderia luaran.",
      zh: "直接根据上报车速随时间的变化率计算得出，未经外部传感器校准。",
      ta: "வெளிப்புற சென்சார் அளவுத்திருத்தம் இன்றி நேரத்தைப் பொறுத்த வாகன வேக மாற்றத்திலிருந்து கணக்கிடப்பட்டது.",
    },
  },
};

function byLocale(
  entries: Record<string, TermEntry>,
  pick: "label" | "description",
): Record<Locale, Record<string, string>> {
  const result: Record<Locale, Record<string, string>> = {
    en: {},
    ms: {},
    zh: {},
    ta: {},
  };
  for (const [key, entry] of Object.entries(entries)) {
    result.en[key] = entry[pick].en;
    result.ms[key] = entry[pick].ms;
    result.zh[key] = entry[pick].zh;
    result.ta[key] = entry[pick].ta;
  }
  return result;
}

export const TECHNICAL_FIELD_LABELS: Record<
  Locale,
  Record<string, string>
> = byLocale(FIELD_TERMS, "label");

export const TECHNICAL_FIELD_DESCRIPTIONS: Record<
  Locale,
  Record<string, string>
> = byLocale(FIELD_TERMS, "description");

export const TECHNICAL_VALUE_LABELS: Record<
  Locale,
  Record<string, string>
> = byLocale(VALUE_TERMS, "label");

export const TECHNICAL_VALUE_DESCRIPTIONS: Record<
  Locale,
  Record<string, string>
> = byLocale(VALUE_TERMS, "description");
