import {
  Typography,
  Card,
  Space,
  Divider,
  Button,
  Alert,
  Tag,
  Breadcrumb,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  SafetyCertificateOutlined,
  LockOutlined,
  CarOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  EditorialFooter,
  PUBLIC_CHROME_COPY,
  PublicHeader,
  useLandingNavigation,
} from "./Landing";
import { useApp } from "../app/context";
import type { Locale } from "../i18n/messages";
import "../styles/landing.css";

const { Title, Paragraph, Text } = Typography;

const SUPPORT_EMAIL = "support_carlink@samsam123.name.my";

type LegalLayoutCopy = {
  home: string;
  effectiveDate: string;
  back: string;
};

const LEGAL_LAYOUT_COPY: Record<Locale, LegalLayoutCopy> = {
  en: {
    home: "Home",
    effectiveDate: "Effective Date: November 2026 · Version 2.4",
    back: "Back",
  },
  ms: {
    home: "Utama",
    effectiveDate: "Tarikh Kuat Kuasa: November 2026 · Versi 2.4",
    back: "Kembali",
  },
  zh: {
    home: "首页",
    effectiveDate: "生效日期：2026 年 11 月 · 版本 2.4",
    back: "返回",
  },
  ta: {
    home: "முகப்பு",
    effectiveDate: "நடைமுறைத் தேதி: நவம்பர் 2026 · பதிப்பு 2.4",
    back: "பின்செல்",
  },
};

type LabeledItem = {
  label: string;
  body: string;
  highlight?: string;
  after?: string;
};

type TermsCopy = {
  title: string;
  subtitle: string;
  badge: string;
  mandatoryTitle: string;
  mandatoryDesc: string;
  s1Title: string;
  s1P1: string;
  s1P2Lead: string;
  s1P2Body: string;
  s1P3Lead: string;
  s1P3Body: string;
  s2Title: string;
  s2Intro: string;
  s2AlertTitle: string;
  s2AlertDesc: string;
  s2Items: LabeledItem[];
  s2ConsequencesLabel: string;
  s2ConsequencesBody: string;
  s3Title: string;
  s3P1: string;
  s3P2: string;
  s3Items: string[];
  s4Title: string;
  s4Intro: string;
  s4Items: LabeledItem[];
  s5Title: string;
  s5Body: string;
  s6Title: string;
  s6Body: string;
  s7Title: string;
  s7Body: string;
};

const TERMS_COPY: Record<Locale, TermsCopy> = {
  en: {
    title: "Terms & Conditions",
    subtitle:
      "Comprehensive Master Terms of Service governing the CarLink SaaS platform, telematics infrastructure, and connected edge devices.",
    badge: "Terms of Service",
    mandatoryTitle: "Mandatory Agreement Required Prior to Service",
    mandatoryDesc:
      "Access to the CarLink web console, mobile portal, telemetry ingestion pipelines, and vehicle monitoring APIs is strictly conditional upon acceptance of these Terms. By creating an organization, deploying a Telemetry Kit, or logging into the CarLink service, you agree to be legally bound by this agreement.",
    s1Title: "1. Agreement Scope & Definitions",
    s1P1:
      'This Software-as-a-Service Agreement ("Agreement") is executed between CarLink ("Company", "we", "us") and the organization or individual subscribing to our services ("Subscriber", "Customer", "you").',
    s1P2Lead: '"Telemetry Kit"',
    s1P2Body:
      "refers to the edge telematics hardware bundle supplied or configured for use with CarLink, consisting of the onboard computer unit (e.g., Raspberry Pi-based edge gateway), cellular modem, pre-provisioned SIM card, GPS antenna module, OBD-II communication interface, and embedded operating software.",
    s1P3Lead: '"Service"',
    s1P3Body:
      "encompasses the CarLink cloud backend, web management console, telemetry processing servers, MQTT broker infrastructure, driver shift attribution engines, and associated APIs.",
    s2Title: "2. Strict Hardware & Telemetry Kit Restrictions",
    s2Intro:
      "The Telemetry Kit is engineered and authenticated exclusively to transmit authorized vehicle telemetry directly to CarLink infrastructure over secured, dedicated channels.",
    s2AlertTitle: "Non-Negotiable Hardware Anti-Tampering Prohibition",
    s2AlertDesc:
      "Subscribers, fleet operators, drivers, and contractors are strictly prohibited from performing any of the following actions on or with the Telemetry Kit:",
    s2Items: [
      {
        label: "No Disassembly or Reverse Engineering:",
        body: "You shall not disassemble, dismantle, de-encapsulate, probe, trace, or attempt to reverse engineer the physical Telemetry Kit, internal printed circuit boards, or wiring harnesses.",
      },
      {
        label: "Strict Prohibition on SIM Removal:",
        body: "You shall ",
        highlight:
          "not under any circumstances remove, swap, extract, or repurpose the internal SIM card",
        after:
          " bundled inside the Telemetry Kit. The SIM card is cryptographically tethered to the device installation and authorized solely for CarLink telemetry transmission. Unauthorized removal or insertion into third-party devices will result in immediate network blacklisting, termination of service, and direct recovery of all unauthorized cellular bandwidth costs.",
      },
      {
        label: "No Alternate Software or Code Execution:",
        body: "You shall not install, execute, compile, sideload, or run any unauthorized software, operating systems, background daemons, or custom code on the Telemetry Kit.",
      },
      {
        label: "No Hardware or Firmware Modification:",
        body: "You shall not alter, flash, tamper with, or bridge the onboard bootloaders, memory chips, microcontrollers, OBD-II pins, or internal bus transceivers of the Telemetry Kit.",
      },
    ],
    s2ConsequencesLabel: "Consequences of Breach:",
    s2ConsequencesBody:
      "Any attempt to tamper with, modify, or inspect the interior of the Telemetry Kit immediately voids all hardware warranties, revokes the device’s cryptographic certificate, triggers immediate remote revocation of fleet access, and may result in civil and criminal liability for unauthorized electronic access.",
    s3Title: "3. Prohibition on Server & Console Reverse Engineering",
    s3P1: "All intellectual property rights in the CarLink platform, web console, backend microservices, database schemas, MQTT brokers, communication protocols, and algorithmic calculation methods (including our speed trapezoid distance calculations, fuel efficiency algorithms, and safety event scoring) belong exclusively to CarLink.",
    s3P2: "You agree that you will not, directly or indirectly:",
    s3Items: [
      "Decompile, disassemble, reverse compile, or reverse engineer any part of the CarLink console, server binaries, or frontend client scripts.",
      "Bypass, disable, circumvent, or probe any access controls, rate limits, subscription gates, or security boundaries.",
      "Publish, benchmark, or expose proprietary API response signatures or protocol payloads without prior written consent.",
    ],
    s4Title: "4. Subscription, Billing & 12-Hour Unpaid Organization Policy",
    s4Intro:
      "Services are provided on a recurring subscription basis according to the plan selected during organization creation.",
    s4Items: [
      {
        label: "Payment Obligation:",
        body: "Newly created organizations are placed in pending payment state. Invoices must be paid within 12 hours of organization creation.",
      },
      {
        label: "Automatic Deletion Policy:",
        body: "If invoice payment is not confirmed within 12 hours, the unpaid organization and pending configurations are permanently deleted by automated database maintenance. Financial accounting records and audit evidence are retained separately in accordance with financial regulations.",
      },
      {
        label: "Renewals:",
        body: "Subscriptions must be renewed prior to their expiry date to maintain continuous device telemetry collection, GPS route logging, and driver portal access.",
      },
    ],
    s5Title: "5. Driver Authorization & Compliance",
    s5Body:
      "Subscribers are solely responsible for ensuring that all vehicle drivers, employees, and operators are informed of vehicle tracking and have given appropriate consent in compliance with applicable local labor, transportation, and privacy laws. NFC card credentials must be assigned only to authorized personnel.",
    s6Title: "6. Disclaimer & Limitation of Liability",
    s6Body:
      "CarLink telematics data, fuel estimations, speed events, and journey projections are provided for fleet management convenience. They do not constitute certified vehicle inspection records, legal speed radar certifications, or guarantees against vehicular accidents or breakdowns. To the fullest extent permitted by law, CarLink shall not be liable for indirect, incidental, or consequential damages resulting from telemetry transmission delays, cellular dead zones, or device disconnections.",
    s7Title: "7. Support Contact",
    s7Body:
      "For support inquiries, hardware inquiries, or legal notifications, contact our dedicated support desk at:",
  },
  ms: {
    title: "Terma & Syarat",
    subtitle:
      "Terma Perkhidmatan Induk Komprehensif yang mengawal platform SaaS CarLink, infrastruktur telematik, dan peranti tepi yang disambungkan.",
    badge: "Terma Perkhidmatan",
    mandatoryTitle: "Perjanjian Mandatori Diperlukan Sebelum Perkhidmatan",
    mandatoryDesc:
      "Akses kepada konsol web CarLink, portal mudah alih, saluran penyerapan telemetri, dan API pemantauan kenderaan adalah tertakluk secara ketat kepada penerimaan Terma ini. Dengan mencipta organisasi, memasang Kit Telemetri, atau log masuk ke perkhidmatan CarLink, anda bersetuju untuk terikat secara sah oleh perjanjian ini.",
    s1Title: "1. Skop Perjanjian & Definisi",
    s1P1: 'Perjanjian Perisian-sebagai-Perkhidmatan ("Perjanjian") ini dimeterai antara CarLink ("Syarikat", "kami") dan organisasi atau individu yang melanggan perkhidmatan kami ("Pelanggan", "anda").',
    s1P2Lead: '"Kit Telemetri"',
    s1P2Body:
      "merujuk kepada himpunan perkakasan telematik tepi yang dibekalkan atau dikonfigurasi untuk digunakan bersama CarLink, yang terdiri daripada unit komputer dalaman (seperti gerbang tepi berasaskan Raspberry Pi), modem selular, kad SIM pra-peruntukan, modul antena GPS, antara muka komunikasi OBD-II, dan perisian operasi terbenam.",
    s1P3Lead: '"Perkhidmatan"',
    s1P3Body:
      "merangkumi bahagian belakang awan CarLink, konsol pengurusan web, pelayan pemprosesan telemetri, infrastruktur broker MQTT, enjin atribusi syif pemandu, dan API berkaitan.",
    s2Title: "2. Sekatan Perkakasan & Kit Telemetri yang Ketat",
    s2Intro:
      "Kit Telemetri direka bentuk dan disahkan secara eksklusif untuk menghantar telemetri kenderaan yang dibenarkan terus ke infrastruktur CarLink melalui saluran khusus yang selamat.",
    s2AlertTitle: "Larangan Anti-Pengusikan Perkakasan Tanpa Kompromi",
    s2AlertDesc:
      "Pelanggan, pengendali armada, pemandu, dan kontraktor dilarang sama sekali melakukan mana-mana tindakan berikut ke atas atau menggunakan Kit Telemetri:",
    s2Items: [
      {
        label: "Tiada Pembongkaran atau Kejuruteraan Balik:",
        body: "Anda tidak boleh membongkar, meleraikan, membuka sarung, mencuba, menjejak, atau cuba melakukan kejuruteraan balik ke atas Kit Telemetri fizikal, papan litar bercetak dalaman, atau abah-abah pendawaian.",
      },
      {
        label: "Larangan Ketat Mengeluarkan Kad SIM:",
        body: "Anda ",
        highlight:
          "tidak boleh dalam apa jua keadaan mengeluarkan, menukar, mengekstrak, atau menggunakan semula kad SIM dalaman",
        after:
          " yang dibekalkan di dalam Kit Telemetri. Kad SIM ini diikat secara kriptografi kepada pemasangan peranti dan dibenarkan hanya untuk penghantaran telemetri CarLink. Pengeluaran tanpa kebenaran atau pemasukan ke dalam peranti pihak ketiga akan mengakibatkan penyenaraian hitam rangkaian serta-merta, penamatan perkhidmatan, dan tuntutan terus ke atas semua kos lebar jalur selular yang tidak dibenarkan.",
      },
      {
        label: "Tiada Perisian atau Pelaksanaan Kod Alternatif:",
        body: "Anda tidak boleh memasang, melaksanakan, menyusun, memuat sisi, atau menjalankan sebarang perisian, sistem pengendalian, daemon latar belakang, atau kod tersuai yang tidak dibenarkan pada Kit Telemetri.",
      },
      {
        label: "Tiada Pengubahsuaian Perkakasan atau Perisian Tegar:",
        body: "Anda tidak boleh mengubah, memancar (flash), mengusik, atau merentasi pemuat but dalaman, cip memori, mikropengawal, pin OBD-II, atau penghantar-terima bas dalaman Kit Telemetri.",
      },
    ],
    s2ConsequencesLabel: "Akibat Pelanggaran:",
    s2ConsequencesBody:
      "Sebarang percubaan untuk mengusik, mengubah suai, atau memeriksa bahagian dalaman Kit Telemetri membatalkan semua jaminan perkakasan serta-merta, membatalkan sijil kriptografi peranti, mencetuskan pembatalan akses armada jarak jauh serta-merta, dan boleh membawa kepada liabiliti sivil dan jenayah bagi akses elektronik tanpa kebenaran.",
    s3Title: "3. Larangan Kejuruteraan Balik Pelayan & Konsol",
    s3P1: "Semua hak harta intelek dalam platform CarLink, konsol web, perkhidmatan mikro bahagian belakang, skema pangkalan data, broker MQTT, protokol komunikasi, dan kaedah pengiraan algoritma (termasuk pengiraan jarak trapezoid kelajuan, algoritma kecekapan bahan api, dan pemarkahan peristiwa keselamatan) adalah hak milik eksklusif CarLink.",
    s3P2: "Anda bersetuju bahawa anda tidak akan, secara langsung atau tidak langsung:",
    s3Items: [
      "Menyahkompilasi, membongkar, menyusun balik, atau melakukan kejuruteraan balik ke atas mana-mana bahagian konsol CarLink, binari pelayan, atau skrip klien bahagian hadapan.",
      "Memintas, melumpuhkan, mengelak, atau menguji mana-mana kawalan akses, had kadar, sekatan langganan, atau sempadan keselamatan.",
      "Menerbitkan, menanda aras, atau mendedahkan tandatangan respons API proprietari atau muatan protokol tanpa kebenaran bertulis terlebih dahulu.",
    ],
    s4Title: "4. Langganan, Pengebilan & Polisi Organisasi Tidak Dibayar 12 Jam",
    s4Intro:
      "Perkhidmatan disediakan secara langganan berulang mengikut pelan yang dipilih semasa penciptaan organisasi.",
    s4Items: [
      {
        label: "Kewajipan Pembayaran:",
        body: "Organisasi yang baru dicipta diletakkan dalam status menunggu pembayaran. Invois mesti dibayar dalam tempoh 12 jam selepas organisasi dicipta.",
      },
      {
        label: "Polisi Pemadaman Automatik:",
        body: "Jika pembayaran invois tidak disahkan dalam tempoh 12 jam, organisasi yang belum dibayar dan konfigurasi yang menunggu akan dipadamkan secara kekal oleh penyelenggaraan pangkalan data automatik. Rekod perakaunan kewangan dan bukti audit disimpan secara berasingan mengikut peraturan kewangan.",
      },
      {
        label: "Pembaharuan:",
        body: "Langganan mesti diperbaharui sebelum tarikh tamat tempoh untuk mengekalkan pengumpulan telemetri peranti, pengelogan laluan GPS, dan akses portal pemandu yang berterusan.",
      },
    ],
    s5Title: "5. Kebenaran Pemandu & Pematuhan",
    s5Body:
      "Pelanggan bertanggungjawab sepenuhnya untuk memastikan semua pemandu kenderaan, pekerja, dan pengendali dimaklumkan tentang penjejakan kenderaan serta telah memberikan persetujuan yang sewajarnya selaras dengan undang-undang buruh, pengangkutan, dan privasi tempatan yang berkuat kuasa. Kelayakan kad NFC hanya boleh diberikan kepada kakitangan yang dibenarkan.",
    s6Title: "6. Penafian & Had Liabiliti",
    s6Body:
      "Data telematik CarLink, anggaran bahan api, peristiwa kelajuan, dan unjuran perjalanan disediakan untuk kemudahan pengurusan armada. Ia bukan rekod pemeriksaan kenderaan bertauliah, pensijilan radar kelajuan undang-undang, atau jaminan terhadap kemalangan atau kerosakan kenderaan. Setakat maksimum yang dibenarkan oleh undang-undang, CarLink tidak akan bertanggungjawab ke atas kerosakan tidak langsung, sampingan, atau berbangkit akibat kelewatan penghantaran telemetri, zon mati selular, atau pemutusan sambungan peranti.",
    s7Title: "7. Hubungi Sokongan",
    s7Body:
      "Untuk pertanyaan sokongan, pertanyaan perkakasan, atau pemberitahuan undang-undang, hubungi meja sokongan khusus kami di:",
  },
  zh: {
    title: "条款与条件",
    subtitle:
      "规范 CarLink SaaS 平台、车联网遥测基础设施及联网边缘设备的全面主服务条款。",
    badge: "服务条款",
    mandatoryTitle: "使用服务前必须接受的强制性协议",
    mandatoryDesc:
      "访问 CarLink 网页控制台、移动端门户、遥测数据接入管道及车辆监控 API，均严格以接受本条款为前提。一旦您创建组织、部署 Telemetry Kit 或登录 CarLink 服务，即表示您同意受本协议的法律约束。",
    s1Title: "1. 协议范围与定义",
    s1P1: '本软件即服务协议（简称“协议”）由 CarLink（简称“公司”或“我们”）与订阅我们服务的组织或个人（简称“订阅方”、“客户”或“您”）共同订立。',
    s1P2Lead: "“Telemetry Kit”",
    s1P2Body:
      "指为配合 CarLink 使用而提供或配置的边缘车联网硬件套件，包括车载计算单元（例如基于 Raspberry Pi 的边缘网关）、蜂窝调制解调器、预配置 SIM 卡、GPS 天线模块、OBD-II 通信接口及嵌入式操作系统软件。",
    s1P3Lead: "“服务”",
    s1P3Body:
      "涵盖 CarLink 云端后端、网页管理控制台、遥测处理服务器、MQTT 代理基础设施、驾驶员班次归属引擎及相关 API。",
    s2Title: "2. 严格的硬件与 Telemetry Kit 限制",
    s2Intro:
      "Telemetry Kit 经过专门设计与身份认证，仅用于通过加密专用通道将经授权的车辆遥测数据直接传输至 CarLink 基础设施。",
    s2AlertTitle: "不可协商的硬件防篡改禁令",
    s2AlertDesc:
      "严格禁止订阅方、车队运营方、驾驶员及承包商对 Telemetry Kit 执行以下任何操作：",
    s2Items: [
      {
        label: "禁止拆卸或逆向工程：",
        body: "您不得拆卸、拆解、剥离封装、探测、追踪或试图对物理 Telemetry Kit、内部印刷电路板或线束进行逆向工程。",
      },
      {
        label: "严禁拆卸或替换 SIM 卡：",
        body: "您在",
        highlight:
          "任何情况下均不得取出、更换、提取或挪用 Telemetry Kit 内部随附的 SIM 卡",
        after:
          "。该 SIM 卡与设备安装状态进行了加密绑定，仅授权用于 CarLink 遥测传输。未经授权取出或插入第三方设备将导致立即被网络拉黑、终止服务，并直接向您追偿所有未经授权的蜂窝流量费用。",
      },
      {
        label: "禁止运行其他软件或代码：",
        body: "您不得在 Telemetry Kit 上安装、执行、编译、侧载或运行任何未经授权的软件、操作系统、后台守护进程或自定义代码。",
      },
      {
        label: "禁止修改硬件或固件：",
        body: "您不得更改、刷写、篡改或短接 Telemetry Kit 的板载引导程序、存储芯片、微控制器、OBD-II 引脚或内部总线收发器。",
      },
    ],
    s2ConsequencesLabel: "违约后果：",
    s2ConsequencesBody:
      "任何篡改、修改或窥探 Telemetry Kit 内部结构的企图都将立即使所有硬件保修失效、吊销设备的加密证书、触发车队访问权限的立即远程撤销，并可能因未经授权的电子访问而承担民事和刑事法律责任。",
    s3Title: "3. 禁止对服务器与控制台进行逆向工程",
    s3P1: "CarLink 平台、网页控制台、后端微服务、数据库模式、MQTT 代理、通信协议及算法计算方法（包括我们的速度梯形距离计算、燃油效率算法及安全事件评分）的所有知识产权均归 CarLink 独家所有。",
    s3P2: "您同意不会直接或间接地：",
    s3Items: [
      "对 CarLink 控制台、服务器二进制文件或前端客户端脚本的任何部分进行反编译、反汇编、逆向编译或逆向工程。",
      "绕过、禁用、规避或探测任何访问控制、速率限制、订阅门槛或安全边界。",
      "未经事先书面同意，发布、基准测试或公开专有 API 响应特征或协议载荷。",
    ],
    s4Title: "4. 订阅、计费与 12 小时未付款组织政策",
    s4Intro:
      "服务依据创建组织时所选定的套餐，按周期性订阅方式提供。",
    s4Items: [
      {
        label: "付款义务：",
        body: "新创建的组织将处于待付款状态。账单必须在组织创建后的 12 小时内完成支付。",
      },
      {
        label: "自动删除政策：",
        body: "若在 12 小时内未确认账单付款，自动化数据库维护程序将永久删除该未付款组织及其待生效配置。财务会计记录与审计证据将依据财务法规另行保存。",
      },
      {
        label: "续订：",
        body: "必须在到期日之前完成订阅续费，以确保持续的设备遥测采集、GPS 轨迹记录及驾驶员门户访问。",
      },
    ],
    s5Title: "5. 驾驶员授权与合规",
    s5Body:
      "订阅方全权负责确保所有车辆驾驶员、雇员及操作人员均已被告知车辆追踪情况，并已按照适用的当地劳动、交通及隐私法律法规给予适当同意。NFC 卡片凭证仅可分配给经授权的人员。",
    s6Title: "6. 免责声明与责任限制",
    s6Body:
      "CarLink 遥测数据、油耗估算、超速/急刹事件及行程预测仅供车队管理参考之用，不构成经认证的车辆检验记录、法定测速雷达认证或针对交通事故及机械故障的担保。在法律允许的最大范围内，对于因遥测传输延迟、蜂窝信号盲区或设备断开连接导致的间接、附带或后果性损害，CarLink 概不承担责任。",
    s7Title: "7. 支持联系",
    s7Body:
      "如需技术支持、硬件咨询或发送法律通知，请联系我们的专属支持团队：",
  },
  ta: {
    title: "விதிமுறைகள் & நிபந்தனைகள்",
    subtitle:
      "CarLink SaaS தளம், டெலிமேட்டிக்ஸ் உள்கட்டமைப்பு மற்றும் இணைக்கப்பட்ட எட்ஜ் சாதனங்களை நிர்வகிக்கும் விரிவான முதன்மை சேவை விதிமுறைகள்.",
    badge: "சேவை விதிமுறைகள்",
    mandatoryTitle: "சேவைக்கு முன் கட்டாய ஒப்பந்தம் தேவை",
    mandatoryDesc:
      "CarLink வலைக் கன்சோல், மொபைல் போர்டல், டெலிமெட்ரி தரவுப் பாதைகள் மற்றும் வாகன கண்காணிப்பு API-களுக்கான அணுகல் இந்த விதிமுறைகளை ஏற்பதைப் பொறுத்தே அமையும். ஒரு நிறுவனத்தை உருவாக்குவதன் மூலம், Telemetry Kit-ஐப் பொருத்துவதன் மூலம், அல்லது CarLink சேவையில் உள்நுழைவதன் மூலம், இந்த ஒப்பந்தத்திற்குச் சட்டப்படி கட்டுப்பட ஒப்புக்கொள்கிறீர்கள்.",
    s1Title: "1. ஒப்பந்த வரம்பு & வரையறைகள்",
    s1P1: 'இந்த மென்பொருள்-சேவை ஒப்பந்தம் ("ஒப்பந்தம்") CarLink ("நிறுவனம்", "நாங்கள்") மற்றும் எங்கள் சேவைகளுக்குச் சந்தா செலுத்தும் நிறுவனம் அல்லது தனிநபர் ("சந்தாதாரர்", "வாடிக்கையாளர்", "நீங்கள்") ஆகியோருக்கு இடையே நிறைவேற்றப்படுகிறது.',
    s1P2Lead: '"Telemetry Kit (டெலிமெட்ரி கிட்)"',
    s1P2Body:
      "என்பது CarLink உடன் பயன்படுத்த வழங்கப்படும் அல்லது கட்டமைக்கப்படும் எட்ஜ் டெலிமேட்டிக்ஸ் வன்பொருள் தொகுப்பைக் குறிக்கிறது; இதில் உள் கணினி அலகு (எ.கா., Raspberry Pi அடிப்படையிலான எட்ஜ் கேட்வே), செல்லுலார் மோடம், முன்பே ஒதுக்கப்பட்ட சிம் கார்டு, GPS ஆண்டெனா தொகுதி, OBD-II தொடர்பு இடைமுகம் மற்றும் உள்ளமைக்கப்பட்ட இயக்க மென்பொருள் ஆகியவை அடங்கும்.",
    s1P3Lead: '"சேவை"',
    s1P3Body:
      "என்பது CarLink கிளவுட் பேக்எண்ட், வலை மேலாண்மை கன்சோல், டெலிமெட்ரி செயலாக்க சர்வர்கள், MQTT புரோக்கர் உள்கட்டமைப்பு, ஓட்டுநர் ஷிப்ட் ஒதுக்கீட்டு இயந்திரங்கள் மற்றும் தொடர்புடைய API-களை உள்ளடக்கியது.",
    s2Title: "2. கடுமையான வன்பொருள் & Telemetry Kit கட்டுப்பாடுகள்",
    s2Intro:
      "Telemetry Kit என்பது பாதுகாப்பான, பிரத்யேக சேனல்கள் வழியாக அங்கீகரிக்கப்பட்ட வாகன டெலிமெட்ரியை நேரடியாக CarLink உள்கட்டமைப்பிற்கு அனுப்புவதற்காக மட்டுமே வடிவமைக்கப்பட்டு அங்கீகரிக்கப்பட்டுள்ளது.",
    s2AlertTitle: "விட்டுக்கொடுக்க முடியாத வன்பொருள் சேதப்படுத்தல் தடை",
    s2AlertDesc:
      "சந்தாதாரர்கள், வாகனத் தொகுதி இயக்குநர்கள், ஓட்டுநர்கள் மற்றும் ஒப்பந்ததாரர்கள் Telemetry Kit மீது அல்லது அதனுடன் பின்வரும் எந்தவொரு செயலையும் செய்யக் கண்டிப்பாகத் தடைசெய்யப்பட்டுள்ளது:",
    s2Items: [
      {
        label: "பிரித்தல் அல்லது தலைகீழ் பொறியியல் தடை:",
        body: "இயற்பியல் Telemetry Kit, உள் அச்சிடப்பட்ட சர்க்யூட் போர்டுகள் அல்லது வயரிங் ஹார்னெஸ்களைப் பிரிக்கவோ, கழற்றவோ, துருவவோ, கண்காணிக்கவோ அல்லது தலைகீழ் பொறியியல் (reverse engineer) செய்ய முயற்சிக்கவோ கூடாது.",
      },
      {
        label: "சிம் (SIM) கார்டை அகற்றுவதற்கான கடுமையான தடை:",
        body: "Telemetry Kit உள்ளே இணைக்கப்பட்டுள்ள உள் சிம் கார்டை ",
        highlight:
          "எந்தச் சூழ்நிலையிலும் அகற்றவோ, மாற்றவோ, பிரித்தெடுக்கவோ அல்லது வேறு பயன்பாட்டிற்கு மாற்றவோ கூடாது",
        after:
          ". அந்த சிம் கார்டு சாதன நிறுவலுடன் கிரிப்டோகிராஃபிக் முறையில் பிணைக்கப்பட்டு CarLink டெலிமெட்ரி பரிமாற்றத்திற்கு மட்டுமே அங்கீகரிக்கப்பட்டுள்ளது. அங்கீகாரமின்றி அகற்றுவது அல்லது மூன்றாம் தரப்பு சாதனங்களில் செருகுவது உடனடி நெட்வொர்க் தடுப்புப்பட்டியல், சேவை நிறுத்தம் மற்றும் அங்கீகரிக்கப்படாத செல்லுலார் அலைவரிசை செலவுகள் அனைத்தையும் நேரடியாக வசூலிக்க வழிவகுக்கும்.",
      },
      {
        label: "மாற்று மென்பொருள் அல்லது குறியீடு இயக்கத் தடை:",
        body: "Telemetry Kit-இல் அங்கீகரிக்கப்படாத எந்தவொரு மென்பொருள், இயக்க முறைமைகள், பின்னணி டீமான்கள் அல்லது தனிப்பயன் குறியீடுகளையும் நிறுவவோ, இயக்கவோ, தொகுக்கவோ அல்லது சைட்லோட் செய்யவோ கூடாது.",
      },
      {
        label: "வன்பொருள் அல்லது ஃபார்ம்வேர் மாற்றத் தடை:",
        body: "Telemetry Kit-இன் உள் பூட்லோடர்கள், நினைவக சில்லுகள், மைக்ரோகண்ட்ரோலர்கள், OBD-II பின்கள் அல்லது உள் பஸ் டிரான்ஸ்சீவர்களை மாற்றவோ, ஃப்ளாஷ் செய்யவோ, சேதப்படுத்தவோ அல்லது இணைக்கவோ கூடாது.",
      },
    ],
    s2ConsequencesLabel: "மீறலின் விளைவுகள்:",
    s2ConsequencesBody:
      "Telemetry Kit-இன் உட்பகுதியைச் சேதப்படுத்த, மாற்ற அல்லது ஆய்வு செய்ய மேற்கொள்ளப்படும் எந்தவொரு முயற்சியும் அனைத்து வன்பொருள் உத்தரவாதங்களையும் உடனடியாக ரத்து செய்யும், சாதனத்தின் கிரிப்டோகிராஃபிக் சான்றிதழைத் திரும்பப் பெறும், வாகனத் தொகுதி அணுகலை உடனடியாகத் தொலைவிலிருந்து ரத்து செய்யும், மேலும் அங்கீகரிக்கப்படாத மின்னணு அணுகலுக்கான சிவில் மற்றும் குற்றவியல் பொறுப்புக்கு வழிவகுக்கும்.",
    s3Title: "3. சர்வர் & கன்சோல் தலைகீழ் பொறியியல் தடை",
    s3P1: "CarLink தளம், வலைக் கன்சோல், பேக்எண்ட் மைக்ரோசர்வீஸ்கள், தரவுத்தளத் திட்டங்கள், MQTT புரோக்கர்கள், தொடர்பு நெறிமுறைகள் மற்றும் அல்காரிதம் கணக்கீட்டு முறைகள் (எங்கள் வேக டிராப்சாய்டு தூரக் கணக்கீடுகள், எரிபொருள் திறன் அல்காரிதம்கள் மற்றும் பாதுகாப்பு நிகழ்வு மதிப்பீடு உட்பட) ஆகியவற்றின் அனைத்து அறிவுசார் சொத்துரிமைகளும் CarLink-க்கு மட்டுமே உரியவை.",
    s3P2: "நீங்கள் நேரடியாகவோ அல்லது மறைமுகமாகவோ பின்வருவனவற்றைச் செய்ய மாட்டீர்கள் என ஒப்புக்கொள்கிறீர்கள்:",
    s3Items: [
      "CarLink கன்சோல், சர்வர் பைனரிகள் அல்லது ஃப்ரண்ட்எண்ட் கிளையண்ட் ஸ்கிரிப்டுகளின் எந்தப் பகுதியையும் டிகம்பைல், டிஸ்அசெம்பிள், ரிவர்ஸ் கம்பைல் அல்லது தலைகீழ் பொறியியல் செய்தல்.",
      "எந்தவொரு அணுகல் கட்டுப்பாடுகள், வீத வரம்புகள், சந்தா வாயில்கள் அல்லது பாதுகாப்பு எல்லைகளைத் தவிர்த்தல், முடக்குதல் அல்லது ஆய்வு செய்தல்.",
      "முன் எழுத்துப்பூர்வ அனுமதியின்றி தனியுரிம API பதில் கையொப்பங்கள் அல்லது நெறிமுறை பேலோடுகளை வெளியிடுதல், அளவிடுதல் அல்லது வெளிப்படுத்துதல்.",
    ],
    s4Title: "4. சந்தா, பில்லிங் & 12-மணி நேர பணம் செலுத்தப்படாத நிறுவனக் கொள்கை",
    s4Intro:
      "நிறுவன உருவாக்கத்தின் போது தேர்ந்தெடுக்கப்பட்ட திட்டத்தின் அடிப்படையில் தொடர்ச்சியான சந்தா முறையில் சேவைகள் வழங்கப்படுகின்றன.",
    s4Items: [
      {
        label: "பணம் செலுத்தும் கடமை:",
        body: "புதிதாக உருவாக்கப்பட்ட நிறுவனங்கள் நிலுவையில் உள்ள கட்டண நிலையில் வைக்கப்படுகின்றன. நிறுவனம் உருவாக்கப்பட்ட 12 மணி நேரத்திற்குள் விலைப்பட்டியல்கள் செலுத்தப்பட வேண்டும்.",
      },
      {
        label: "தானியங்கி நீக்கக் கொள்கை:",
        body: "12 மணி நேரத்திற்குள் விலைப்பட்டியல் கட்டணம் உறுதிப்படுத்தப்படாவிட்டால், பணம் செலுத்தப்படாத நிறுவனம் மற்றும் நிலுவையில் உள்ள கட்டமைப்புகள் தானியங்கி தரவுத்தளப் பராமரிப்பால் நிரந்தரமாக நீக்கப்படும். நிதிக் கணக்கியல் பதிவுகள் மற்றும் தணிக்கை ஆதாரங்கள் நிதி விதிமுறைகளுக்கு ஏற்பத் தனித்தனியாகப் பாதுகாக்கப்படும்.",
      },
      {
        label: "புதுப்பித்தல்கள்:",
        body: "தொடர்ச்சியான சாதன டெலிமெட்ரி சேகரிப்பு, GPS வழிப் பதிவு மற்றும் ஓட்டுநர் போர்டல் அணுகலைப் பராமரிக்க காலாவதி தேதிக்கு முன் சந்தாக்கள் புதுப்பிக்கப்பட வேண்டும்.",
      },
    ],
    s5Title: "5. ஓட்டுநர் அங்கீகாரம் & இணக்கம்",
    s5Body:
      "அனைத்து வாகன ஓட்டுநர்கள், பணியாளர்கள் மற்றும் இயக்குநர்களுக்கும் வாகனக் கண்காணிப்பு குறித்துத் தெரிவிக்கப்பட்டு, பொருந்தக்கூடிய உள்ளூர் தொழிலாளர், போக்குவரத்து மற்றும் தனியுரிமைச் சட்டங்களுக்கு இணங்கத் தகுந்த ஒப்புதல் பெறப்படுவதை உறுதி செய்வதற்குச் சந்தாதாரர்களே முழுப் பொறுப்பாவர். NFC அட்டைச் சான்றுகள் அங்கீகரிக்கப்பட்ட பணியாளர்களுக்கு மட்டுமே ஒதுக்கப்பட வேண்டும்.",
    s6Title: "6. பொறுப்புத் துறப்பு & பொறுப்பு வரம்பு",
    s6Body:
      "CarLink டெலிமெட்ரி தரவு, எரிபொருள் மதிப்பீடுகள், வேக நிகழ்வுகள் மற்றும் பயணக் கணிப்புகள் வாகனத் தொகுதி மேலாண்மை வசதிக்காக வழங்கப்படுகின்றன. அவை சான்றளிக்கப்பட்ட வாகன ஆய்வுப் பதிவுகளாகவோ, சட்டப்பூர்வ வேக ரேடார் சான்றிதழ்களாகவோ அல்லது வாகன விபத்துகள் மற்றும் பழுதுகளுக்கு எதிரான உத்தரவாதங்களாகவோ கருதப்படாது. சட்டத்தால் அனுமதிக்கப்பட்ட முழு அளவிற்கு, டெலிமெட்ரி பரிமாற்ற தாமதங்கள், செல்லுலார் சிக்னல் இல்லாத பகுதிகள் அல்லது சாதனத் துண்டிப்புகளால் ஏற்படும் மறைமுக, தற்செயலான அல்லது விளைவான சேதங்களுக்கு CarLink பொறுப்பேற்காது.",
    s7Title: "7. ஆதரவு தொடர்பு",
    s7Body:
      "ஆதரவு விசாரணைகள், வன்பொருள் விசாரணைகள் அல்லது சட்ட அறிவிப்புகளுக்கு, எங்கள் பிரத்யேக ஆதரவு மையத்தைத் தொடர்பு கொள்ளவும்:",
  },
};

type PrivacyCopy = {
  title: string;
  subtitle: string;
  badge: string;
  alertTitle: string;
  alertDesc: string;
  s1Title: string;
  s1Intro: string;
  s1Items: LabeledItem[];
  s2Title: string;
  s2AlertTitle: string;
  s2AlertDesc: string;
  s2BeforeBold: string;
  s2Bold: string;
  s2AfterBold: string;
  s2Items: string[];
  s2Note: string;
  s3Title: string;
  s3Intro: string;
  s3Items: LabeledItem[];
  s4Title: string;
  s4Intro: string;
  s4Items: LabeledItem[];
  s5Title: string;
  s5Intro: string;
  s5Items: LabeledItem[];
  s6Title: string;
  s6Body: string;
};

const PRIVACY_COPY: Record<Locale, PrivacyCopy> = {
  en: {
    title: "Privacy Policy",
    subtitle:
      "How CarLink collects, processes, protects, and retains fleet telematics, driver records, and operational telemetry.",
    badge: "Privacy & Data Protection",
    alertTitle: "Committed to Fleet Data Integrity & Transparency",
    alertDesc:
      "CarLink processes telemetry and fleet operational metrics on behalf of our corporate subscribers. This policy outlines our strict technical safeguards, data segregation boundaries, and mandatory log retention policies.",
    s1Title: "1. Information We Collect",
    s1Intro:
      "CarLink collects information necessary to deliver connected vehicle telemetry, driver attribution, and fleet compliance reporting:",
    s1Items: [
      {
        label: "Vehicle Telemetry Observations:",
        body: "High-frequency GPS coordinates (latitude, longitude, speed, heading), OBD-II engine parameters (engine RPM, fuel rate L/h, coolant temperature, intake air temperature, battery voltage, calculated engine load), Diagnostic Trouble Codes (DTCs), and IMU acceleration/braking samples.",
      },
      {
        label: "Driver & Shift Attribution:",
        body: "Driver names, business email addresses, shift starting/ending timestamps, and driver NFC card identifiers (which are processed and stored as irreversible cryptographic SHA-256 digests).",
      },
      {
        label: "Account & Administration Records:",
        body: "Fleet manager names, verified email addresses, organization profile information, subscription tiers, and payment invoice histories.",
      },
    ],
    s2Title: "2. Mandatory 2-Year API Request Log Retention",
    s2AlertTitle: "Two-Year Retention Schedule for All API Request Logs",
    s2AlertDesc:
      "In compliance with cybersecurity compliance frameworks, operational auditing requirements, and fraud prevention standards, CarLink enforces an automated 2-year retention policy for all API request logs.",
    s2BeforeBold: "Specifically, ",
    s2Bold:
      "all HTTP and API request logs are retained in immutable audit databases for a continuous duration of two (2) years",
    s2AfterBold: ". These records include:",
    s2Items: [
      "Exact UTC timestamp and duration/latency of each incoming request.",
      "HTTP method, request URL path, and route template.",
      "Client origin IP address, TLS protocol parameters, and User-Agent identification string.",
      "Authenticated user ID, organization ID, and API credential identifier.",
      "HTTP response status code and execution outcome.",
    ],
    s2Note:
      "Request bodies containing passwords, authentication tokens, or personal cardholder data are stripped and never recorded in plaintext request logs.",
    s3Title: "3. Telemetry Retention & Data Lifecycle",
    s3Intro:
      "Different data categories within CarLink are governed by distinct operational retention windows:",
    s3Items: [
      {
        label: "Raw Telemetry Samples & Journeys:",
        body: "Retained in accordance with your organization’s active subscription plan window (defaulting to 30 days unless an extended enterprise retention tier is active).",
      },
      {
        label: "Compliance & Maintenance Records:",
        body: "Maintained for the full lifecycle of vehicle service tracking until explicitly archived or deleted by organization administrators.",
      },
      {
        label: "API Access & Security Audit Logs:",
        body: "Retained for exactly ",
        highlight: "2 years",
        after: " as outlined in Section 2.",
      },
      {
        label: "Billing & Tax Invoices:",
        body: "Retained for 7 years in accordance with statutory accounting and financial audit regulations.",
      },
    ],
    s4Title: "4. Technical Data Protection Safeguards",
    s4Intro:
      "CarLink implements rigorous architectural safeguards to protect vehicle and driver data:",
    s4Items: [
      {
        label: "Encrypted Transport:",
        body: "All telemetry transmitted from edge Telemetry Kits to CarLink ingestion brokers uses TLS 1.3 encryption with mutual certificate authentication.",
      },
      {
        label: "Multi-Tenant Isolation:",
        body: "All database queries, telemetry partitions, and storage buckets enforce strict organization ID isolation. No fleet operator or driver can inspect data from another organization.",
      },
      {
        label: "Cryptographic Digests:",
        body: "NFC badges and driver credentials are converted to cryptographic hashes so raw badge numbers are never exposed.",
      },
    ],
    s5Title: "5. Third-Party Service Providers",
    s5Intro:
      "We partner with trusted third-party providers for infrastructure hosting and payment processing:",
    s5Items: [
      {
        label: "Payment Gateways (Stripe & Card Networks):",
        body: "Payment information is processed directly by PCI-DSS Level 1 certified processors. CarLink never stores full credit card numbers or CVV codes.",
      },
      {
        label: "Cellular Telecommunications Carriers:",
        body: "Telemetry Kits communicate over private cellular APNs for machine-to-machine telemetry transport.",
      },
      {
        label: "Cloud Storage & Compute:",
        body: "Telemetry data and static assets are hosted in secure enterprise cloud data centers.",
      },
    ],
    s6Title: "6. Contacting the Privacy Officer",
    s6Body:
      "If you have questions regarding this Privacy Policy, wish to exercise your data subject rights, or require data deletion upon contract termination, please contact:",
  },
  ms: {
    title: "Dasar Privasi",
    subtitle:
      "Bagaimana CarLink mengumpul, memproses, melindungi, dan menyimpan telematik armada, rekod pemandu, dan telemetri operasi.",
    badge: "Privasi & Perlindungan Data",
    alertTitle: "Komited kepada Integriti & Ketelusan Data Armada",
    alertDesc:
      "CarLink memproses telemetri dan metrik operasi armada bagi pihak pelanggan korporat kami. Dasar ini menggariskan perlindungan teknikal yang ketat, sempadan pengasingan data, dan dasar pengekalan log mandatori kami.",
    s1Title: "1. Maklumat yang Kami Kumpul",
    s1Intro:
      "CarLink mengumpul maklumat yang diperlukan untuk menyampaikan telemetri kenderaan terhubung, atribusi pemandu, dan pelaporan pematuhan armada:",
    s1Items: [
      {
        label: "Pemerhatian Telemetri Kenderaan:",
        body: "Koordinat GPS berfrekuensi tinggi (latitud, longitud, kelajuan, haluan), parameter enjin OBD-II (RPM enjin, kadar bahan api L/j, suhu penyejuk, suhu udara masuk, voltan bateri, beban enjin dikira), Kod Masalah Diagnostik (DTC), serta sampel pecutan/brek IMU.",
      },
      {
        label: "Atribusi Pemandu & Syif:",
        body: "Nama pemandu, alamat e-mel perniagaan, cap masa mula/tamat syif, dan pengecam kad NFC pemandu (yang diproses dan disimpan sebagai ringkasan kriptografi SHA-256 yang tidak boleh diterbalikkan).",
      },
      {
        label: "Rekod Akaun & Pentadbiran:",
        body: "Nama pengurus armada, alamat e-mel yang disahkan, maklumat profil organisasi, peringkat langganan, dan sejarah invois pembayaran.",
      },
    ],
    s2Title: "2. Pengekalan Log Permintaan API Mandatori 2 Tahun",
    s2AlertTitle: "Jadual Pengekalan Dua Tahun bagi Semua Log Permintaan API",
    s2AlertDesc:
      "Selaras dengan rangka kerja pematuhan keselamatan siber, keperluan pengauditan operasi, dan piawaian pencegahan penipuan, CarLink menguatkuasakan dasar pengekalan automatik selama 2 tahun untuk semua log permintaan API.",
    s2BeforeBold: "Secara khusus, ",
    s2Bold:
      "semua log permintaan HTTP dan API disimpan dalam pangkalan data audit tidak berubah untuk tempoh berterusan selama dua (2) tahun",
    s2AfterBold: ". Rekod ini merangkumi:",
    s2Items: [
      "Cap masa UTC yang tepat dan tempoh/kependaman setiap permintaan masuk.",
      "Kaedah HTTP, laluan URL permintaan, dan templat laluan.",
      "Alamat IP asal klien, parameter protokol TLS, dan rentetan pengenalan User-Agent.",
      "ID pengguna yang disahkan, ID organisasi, dan pengecam kelayakan API.",
      "Kod status respons HTTP dan hasil pelaksanaan.",
    ],
    s2Note:
      "Badan permintaan yang mengandungi kata laluan, token pengesahan, atau data pemegang kad peribadi akan dilucutkan dan tidak pernah direkodkan dalam log permintaan teks biasa.",
    s3Title: "3. Pengekalan Telemetri & Kitaran Hayat Data",
    s3Intro:
      "Kategori data yang berbeza di dalam CarLink ditadbir oleh tetingkap pengekalan operasi yang berbeza:",
    s3Items: [
      {
        label: "Sampel Telemetri Mentah & Perjalanan:",
        body: "Disimpan mengikut tetingkap pelan langganan aktif organisasi anda (lalai kepada 30 hari melainkan peringkat pengekalan perusahaan lanjutan aktif).",
      },
      {
        label: "Rekod Pematuhan & Penyelenggaraan:",
        body: "Dikekalkan sepanjang kitaran hayat penjejakan servis kenderaan sehingga diarkibkan atau dipadamkan secara eksplisit oleh pentadbir organisasi.",
      },
      {
        label: "Log Akses API & Audit Keselamatan:",
        body: "Disimpan tepat selama ",
        highlight: "2 tahun",
        after: " seperti yang digariskan dalam Bahagian 2.",
      },
      {
        label: "Invois Pengebilan & Cukai:",
        body: "Disimpan selama 7 tahun selaras dengan peraturan perakaunan berkanun dan audit kewangan.",
      },
    ],
    s4Title: "4. Perlindungan Data Teknikal",
    s4Intro:
      "CarLink melaksanakan perlindungan seni bina yang ketat untuk melindungi data kenderaan dan pemandu:",
    s4Items: [
      {
        label: "Pengangkutan Disulitkan:",
        body: "Semua telemetri yang dihantar daripada Kit Telemetri tepi ke broker penyerapan CarLink menggunakan penyulitan TLS 1.3 dengan pengesahan sijil bersama.",
      },
      {
        label: "Pengasingan Berbilang Penyewa:",
        body: "Semua pertanyaan pangkalan data, petak telemetri, dan baldi storan menguatkuasakan pengasingan ID organisasi yang ketat. Tiada pengendali armada atau pemandu boleh memeriksa data daripada organisasi lain.",
      },
      {
        label: "Ringkasan Kriptografi:",
        body: "Lencana NFC dan kelayakan pemandu ditukar kepada cincangan kriptografi supaya nombor lencana mentah tidak pernah didedahkan.",
      },
    ],
    s5Title: "5. Pembekal Perkhidmatan Pihak Ketiga",
    s5Intro:
      "Kami bekerjasama dengan pembekal pihak ketiga yang dipercayai untuk pengehosan infrastruktur dan pemprosesan pembayaran:",
    s5Items: [
      {
        label: "Gerbang Pembayaran (Stripe & Rangkaian Kad):",
        body: "Maklumat pembayaran diproses terus oleh pemproses bertauliah PCI-DSS Tahap 1. CarLink tidak pernah menyimpan nombor kad kredit penuh atau kod CVV.",
      },
      {
        label: "Pengendali Telekomunikasi Selular:",
        body: "Kit Telemetri berkomunikasi melalui APN selular peribadi untuk pengangkutan telemetri mesin-ke-mesin.",
      },
      {
        label: "Storan Awan & Pengkomputeran:",
        body: "Data telemetri dan aset statik dihoskan di pusat data awan perusahaan yang selamat.",
      },
    ],
    s6Title: "6. Menghubungi Pegawai Privasi",
    s6Body:
      "Jika anda mempunyai soalan mengenai Dasar Privasi ini, ingin melaksanakan hak subjek data anda, atau memerlukan pemadaman data selepas penamatan kontrak, sila hubungi:",
  },
  zh: {
    title: "隐私政策",
    subtitle:
      "说明 CarLink 如何收集、处理、保护及保留车队遥测数据、驾驶员记录及运营遥测信息。",
    badge: "隐私与数据保护",
    alertTitle: "致力于车队数据的完整性与透明度",
    alertDesc:
      "CarLink 代表企业订阅客户处理遥测和车队运营指标。本政策阐述了我们严格的技术保障措施、数据隔离边界以及强制性日志保留政策。",
    s1Title: "1. 我们收集的信息",
    s1Intro:
      "CarLink 收集提供联网车辆遥测、驾驶员归属及车队合规报告所必需的信息：",
    s1Items: [
      {
        label: "车辆遥测观测数据：",
        body: "高频 GPS 坐标（纬度、经度、速度、航向）、OBD-II 发动机参数（发动机转速 RPM、油耗率 L/h、冷却液温度、进气温度、电瓶电压、计算发动机负荷）、故障诊断码 (DTC) 以及 IMU 加速度/制动采样数据。",
      },
      {
        label: "驾驶员与班次归属：",
        body: "驾驶员姓名、工作电子邮箱、班次开始/结束时间戳以及驾驶员 NFC 卡标识符（经由不可逆的 SHA-256 加密摘要算法处理并存储）。",
      },
      {
        label: "账户与管理记录：",
        body: "车队管理员姓名、已验证电子邮箱、组织资料信息、订阅等级以及付款账单历史。",
      },
    ],
    s2Title: "2. 强制性 2 年 API 请求日志保留",
    s2AlertTitle: "所有 API 请求日志均执行两年保留计划",
    s2AlertDesc:
      "为遵守网络安全合规框架、运营审计要求及反欺诈标准，CarLink 对所有 API 请求日志强制执行自动化的 2 年保留政策。",
    s2BeforeBold: "具体而言，",
    s2Bold: "所有 HTTP 与 API 请求日志均在不可变审计数据库中连续保留两 (2) 年",
    s2AfterBold: "。这些记录包括：",
    s2Items: [
      "每次传入请求的精确 UTC 时间戳及处理耗时/延迟。",
      "HTTP 方法、请求 URL 路径及路由模板。",
      "客户端来源 IP 地址、TLS 协议参数及 User-Agent 标识字符串。",
      "已认证的用户 ID、组织 ID 及 API 凭证标识符。",
      "HTTP 响应状态码及执行结果。",
    ],
    s2Note:
      "包含密码、身份验证令牌或个人持卡人数据的请求体会被剥离，绝不会以明文形式记录在请求日志中。",
    s3Title: "3. 遥测数据保留与生命周期",
    s3Intro:
      "CarLink 内的不同数据类别受各自独立的运营保留周期规范：",
    s3Items: [
      {
        label: "原始遥测样本与行程记录：",
        body: "根据您组织当前的有效订阅套餐保留期进行保留（除非启用了扩展的企业保留等级，否则默认为 30 天）。",
      },
      {
        label: "合规与维保记录：",
        body: "在车辆维保追踪的整个生命周期内持续保存，直至组织管理员明确归档或删除。",
      },
      {
        label: "API 访问与安全审计日志：",
        body: "如第 2 节所述，严格保留 ",
        highlight: "2 年",
        after: "。",
      },
      {
        label: "账单与税务发票：",
        body: "依据法定会计和财务审计法规保留 7 年。",
      },
    ],
    s4Title: "4. 技术数据保护措施",
    s4Intro:
      "CarLink 实施严格的系统架构安全防护，以保护车辆及驾驶员数据：",
    s4Items: [
      {
        label: "加密传输：",
        body: "从边缘 Telemetry Kit 传输至 CarLink 接入代理的所有遥测数据均采用支持双向证书认证的 TLS 1.3 加密。",
      },
      {
        label: "多租户隔离：",
        body: "所有数据库查询、遥测分区及存储桶均强制执行严格的组织 ID 隔离。任何车队运营方或驾驶员均无法查看其他组织的数据。",
      },
      {
        label: "加密摘要：",
        body: "NFC 工牌与驾驶员凭证均转换为加密哈希值，原始卡号永不暴露。",
      },
    ],
    s5Title: "5. 第三方服务提供商",
    s5Intro:
      "我们与值得信赖的第三方提供商合作进行基础设施托管和支付处理：",
    s5Items: [
      {
        label: "支付网关（Stripe 与银行卡网络）：",
        body: "付款信息由通过 PCI-DSS 1 级认证的支付处理商直接处理。CarLink 从不存储完整信用卡号或 CVV 安全码。",
      },
      {
        label: "蜂窝电信运营商：",
        body: "Telemetry Kit 通过私有蜂窝 APN 进行机器对机器的遥测数据传输。",
      },
      {
        label: "云存储与计算：",
        body: "遥测数据与静态资源托管在安全的企业级云数据中心中。",
      },
    ],
    s6Title: "6. 联系隐私保护专员",
    s6Body:
      "如您对本隐私政策有任何疑问、希望行使数据主体权利，或在合同终止后需要删除数据，请联系：",
  },
  ta: {
    title: "தனியுரிமைக் கொள்கை",
    subtitle:
      "CarLink எவ்வாறு வாகனத் தொகுதி டெலிமெட்ரி, ஓட்டுநர் பதிவுகள் மற்றும் செயல்பாட்டு டெலிமெட்ரியைச் சேகரிக்கிறது, செயலாக்குகிறது, பாதுகாக்கிறது மற்றும் வைத்திருக்கிறது.",
    badge: "தனியுரிமை & தரவுப் பாதுகாப்பு",
    alertTitle: "வாகனத் தொகுதி தரவு ஒருமைப்பாடு & வெளிப்படைத்தன்மைக்கு உறுதியளிப்பு",
    alertDesc:
      "எங்கள் நிறுவனச் சந்தாதாரர்களின் சார்பாக CarLink டெலிமெட்ரி மற்றும் வாகனத் தொகுதி செயல்பாட்டு அளவீடுகளைச் செயலாக்குகிறது. எங்கள் கடுமையான தொழில்நுட்பப் பாதுகாப்புகள், தரவுப் பிரிப்பு எல்லைகள் மற்றும் கட்டாய பதிவுத் தக்கவைப்புக் கொள்கைகளை இக்கொள்கை விவரிக்கிறது.",
    s1Title: "1. நாங்கள் சேகரிக்கும் தகவல்கள்",
    s1Intro:
      "இணைக்கப்பட்ட வாகன டெலிமெட்ரி, ஓட்டுநர் ஒதுக்கீடு மற்றும் வாகனத் தொகுதி இணக்க அறிக்கைகளை வழங்கத் தேவையான தகவல்களை CarLink சேகரிக்கிறது:",
    s1Items: [
      {
        label: "வாகன டெலிமெட்ரி அவதானிப்புகள்:",
        body: "அதிக அதிர்வெண் GPS ஆயத்தொலைவுகள் (அட்சரேகை, தீர்க்கரேகை, வேகம், திசை), OBD-II இயந்திர அளவுருக்கள் (இயந்திர RPM, எரிபொருள் விகிதம் L/h, குளிரூட்டி வெப்பநிலை, உள்வரும் காற்று வெப்பநிலை, பேட்டரி மின்னழுத்தம், கணக்கிடப்பட்ட இயந்திர சுமை), கண்டறியும் சிக்கல் குறியீடுகள் (DTCs) மற்றும் IMU முடுக்கம்/பிரேக்கிங் மாதிரிகள்.",
      },
      {
        label: "ஓட்டுநர் & ஷிப்ட் ஒதுக்கீடு:",
        body: "ஓட்டுநர் பெயர்கள், வணிக மின்னஞ்சல் முகவரிகள், ஷிப்ட் தொடங்கும்/முடியும் நேரமுத்திரைகள் மற்றும் ஓட்டுநர் NFC அட்டை அடையாளங்காட்டிகள் (மாற்ற முடியாத கிரிப்டோகிராஃபிக் SHA-256 டைஜெஸ்டுகளாகச் செயலாக்கப்பட்டுச் சேமிக்கப்படுகின்றன).",
      },
      {
        label: "கணக்கு & நிர்வாகப் பதிவுகள்:",
        body: "வாகனத் தொகுதி மேலாளர் பெயர்கள், சரிபார்க்கப்பட்ட மின்னஞ்சல் முகவரிகள், நிறுவனச் சுயவிவரத் தகவல், சந்தா நிலைகள் மற்றும் கட்டண விலைப்பட்டியல் வரலாறுகள்.",
      },
    ],
    s2Title: "2. கட்டாய 2-ஆண்டு API கோரிக்கைப் பதிவுத் தக்கவைப்பு",
    s2AlertTitle: "அனைத்து API கோரிக்கைப் பதிவுகளுக்கும் இரண்டு ஆண்டு தக்கவைப்பு அட்டவணை",
    s2AlertDesc:
      "சைபர் பாதுகாப்பு இணக்கக் கட்டமைப்புகள், செயல்பாட்டுத் தணிக்கைத் தேவைகள் மற்றும் மோசடித் தடுப்புத் தரநிலைகளுக்கு இணங்க, அனைத்து API கோரிக்கைப் பதிவுகளுக்கும் CarLink தானியங்கி 2-ஆண்டு தக்கவைப்புக் கொள்கையை அமல்படுத்துகிறது.",
    s2BeforeBold: "குறிப்பாக, ",
    s2Bold:
      "அனைத்து HTTP மற்றும் API கோரிக்கைப் பதிவுகளும் மாற்ற முடியாத தணிக்கைத் தரவுத்தளங்களில் தொடர்ந்து இரண்டு (2) ஆண்டுகள் வைத்திருக்கப்படுகின்றன",
    s2AfterBold: ". இப்பதிவுகளில் அடங்குவன:",
    s2Items: [
      "உள்வரும் ஒவ்வொரு கோரிக்கையின் துல்லியமான UTC நேரமுத்திரை மற்றும் கால அளவு/தாமதம்.",
      "HTTP முறை, கோரிக்கை URL பாதை மற்றும் வழி டெம்ப்ளேட்.",
      "கிளையண்ட் மூல IP முகவரி, TLS நெறிமுறை அளவுருக்கள் மற்றும் User-Agent அடையாளச் சரம்.",
      "அங்கீகரிக்கப்பட்ட பயனர் ID, நிறுவன ID மற்றும் API சான்று அடையாளங்காட்டி.",
      "HTTP பதில் நிலைக் குறியீடு மற்றும் செயல்பாட்டு முடிவு.",
    ],
    s2Note:
      "கடவுச்சொற்கள், அங்கீகார டோக்கன்கள் அல்லது தனிப்பட்ட அட்டைதாரர் தரவைக் கொண்ட கோரிக்கை உடல்கள் நீக்கப்பட்டு, எளிய உரை கோரிக்கைப் பதிவுகளில் ஒருபோதும் பதிவு செய்யப்படாது.",
    s3Title: "3. டெலிமெட்ரி தக்கவைப்பு & தரவு வாழ்க்கைச் சுழற்சி",
    s3Intro:
      "CarLink-க்குள் உள்ள வெவ்வேறு தரவு வகைகள் தனித்துவமான செயல்பாட்டுத் தக்கவைப்புக் காலங்களால் நிர்வகிக்கப்படுகின்றன:",
    s3Items: [
      {
        label: "மூல டெலிமெட்ரி மாதிரிகள் & பயணங்கள்:",
        body: "உங்கள் நிறுவனத்தின் செயலில் உள்ள சந்தா திட்டக் காலத்திற்கு ஏற்ப வைத்திருக்கப்படுகின்றன (நீட்டிக்கப்பட்ட நிறுவனத் தக்கவைப்பு நிலை செயலில் இல்லாவிட்டால் இயல்பாக 30 நாட்கள்).",
      },
      {
        label: "இணக்கம் & பராமரிப்புப் பதிவுகள்:",
        body: "நிறுவன நிர்வாகிகளால் வெளிப்படையாகக் காப்பகப்படுத்தப்படும் அல்லது நீக்கப்படும் வரை வாகனச் சேவைக் கண்காணிப்பின் முழு வாழ்க்கைச் சுழற்சிக்கும் பராமரிக்கப்படுகின்றன.",
      },
      {
        label: "API அணுகல் & பாதுகாப்பு தணிக்கைப் பதிவுகள்:",
        body: "பிரிவு 2-இல் விவரிக்கப்பட்டுள்ளபடி சரியாக ",
        highlight: "2 ஆண்டுகள்",
        after: " வைத்திருக்கப்படுகின்றன.",
      },
      {
        label: "பில்லிங் & வரி விலைப்பட்டியல்கள்:",
        body: "சட்டப்பூர்வ கணக்கியல் மற்றும் நிதித் தணிக்கை விதிமுறைகளுக்கு ஏற்ப 7 ஆண்டுகள் வைத்திருக்கப்படுகின்றன.",
      },
    ],
    s4Title: "4. தொழில்நுட்பத் தரவுப் பாதுகாப்பு நடவடிக்கைகள்",
    s4Intro:
      "வாகன மற்றும் ஓட்டுநர் தரவைப் பாதுகாக்க CarLink கடுமையான கட்டமைப்புப் பாதுகாப்புகளை நடைமுறைப்படுத்துகிறது:",
    s4Items: [
      {
        label: "மறைகுறியாக்கப்பட்ட பரிமாற்றம்:",
        body: "எட்ஜ் Telemetry Kit-களில் இருந்து CarLink உள்வாங்கும் புரோக்கர்களுக்கு அனுப்பப்படும் அனைத்து டெலிமெட்ரியும் பரஸ்பர சான்றிதழ் அங்கீகாரத்துடன் TLS 1.3 மறைகுறியாக்கத்தைப் பயன்படுத்துகிறது.",
      },
      {
        label: "பல-குத்தகைதாரர் தனிமைப்படுத்தல்:",
        body: "அனைத்து தரவுத்தள வினவல்கள், டெலிமெட்ரி பகிர்வுகள் மற்றும் சேமிப்பகப் பக்கெட்டுகள் கடுமையான நிறுவன ID தனிமைப்படுத்தலைச் செயல்படுத்துகின்றன. எந்தவொரு வாகனத் தொகுதி இயக்குநரும் அல்லது ஓட்டுநரும் மற்றொரு நிறுவனத்தின் தரவைப் பார்க்க முடியாது.",
      },
      {
        label: "கிரிப்டோகிராஃபிக் டைஜெஸ்டுகள்:",
        body: "மூல பேட்ஜ் எண்கள் ஒருபோதும் வெளிப்படுத்தப்படாதவாறு NFC பேட்ஜ்கள் மற்றும் ஓட்டுநர் சான்றுகள் கிரிப்டோகிராஃபிக் ஹாஷ்களாக மாற்றப்படுகின்றன.",
      },
    ],
    s5Title: "5. மூன்றாம் தரப்பு சேவை வழங்குநர்கள்",
    s5Intro:
      "உள்கட்டமைப்பு ஹோஸ்டிங் மற்றும் கட்டணச் செயலாக்கத்திற்காக நம்பகமான மூன்றாம் தரப்பு வழங்குநர்களுடன் நாங்கள் இணைந்து பணியாற்றுகிறோம்:",
    s5Items: [
      {
        label: "கட்டண நுழைவாயில்கள் (Stripe & அட்டை நெட்வொர்க்குகள்):",
        body: "கட்டணத் தகவல்கள் PCI-DSS நிலை 1 சான்றளிக்கப்பட்ட செயலிகளால் நேரடியாகச் செயலாக்கப்படுகின்றன. CarLink முழு கிரெடிட் கார்டு எண்களையோ CVV குறியீடுகளையோ ஒருபோதும் சேமிப்பதில்லை.",
      },
      {
        label: "செல்லுலார் தொலைத்தொடர்பு நிறுவனங்கள்:",
        body: "Telemetry Kit-கள் இயந்திரத்திலிருந்து இயந்திரத்திற்கான டெலிமெட்ரி பரிமாற்றத்திற்குத் தனிப்பட்ட செல்லுலார் APN-கள் வழியாகத் தொடர்பு கொள்கின்றன.",
      },
      {
        label: "கிளவுட் சேமிப்பகம் & கணினி:",
        body: "டெலிமெட்ரி தரவு மற்றும் நிலையான சொத்துகள் பாதுகாப்பான நிறுவன கிளவுட் தரவு மையங்களில் ஹோஸ்ட் செய்யப்படுகின்றன.",
      },
    ],
    s6Title: "6. தனியுரிமை அதிகாரியைத் தொடர்பு கொள்ள",
    s6Body:
      "இந்தத் தனியுரிமைக் கொள்கை குறித்து உங்களுக்குக் கேள்விகள் இருந்தால், உங்கள் தரவு உரிமைகளைப் பயன்படுத்த விரும்பினால், அல்லது ஒப்பந்த முடிவின் போது தரவு நீக்கம் தேவைப்பட்டால், தயவுசெய்து தொடர்பு கொள்ளவும்:",
  },
};

function LabeledBulletList({ items }: { items: LabeledItem[] }) {
  return (
    <ul style={{ paddingLeft: 24, lineHeight: 1.8 }}>
      {items.map((item) => (
        <li key={item.label}>
          <strong>{item.label}</strong> {item.body}
          {item.highlight ? <strong>{item.highlight}</strong> : null}
          {item.after ?? null}
        </li>
      ))}
    </ul>
  );
}

function LegalLayout({
  title,
  subtitle,
  badgeText,
  children,
}: {
  title: string;
  subtitle: string;
  badgeText: string;
  children: React.ReactNode;
}) {
  const app = useApp();
  const navigate = useNavigate();
  const scrollToSection = useLandingNavigation();
  const layoutCopy = LEGAL_LAYOUT_COPY[app.locale] ?? LEGAL_LAYOUT_COPY.en;
  const chromeCopy = PUBLIC_CHROME_COPY[app.locale] ?? PUBLIC_CHROME_COPY.en;

  return (
    <div className="public-page carlink-landing">
      <PublicHeader />
      <main style={{ minHeight: "80vh", padding: "40px 16px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Breadcrumb
              items={[
                {
                  title: (
                    <Link to="/">
                      <CarOutlined /> {layoutCopy.home}
                    </Link>
                  ),
                },
                { title: badgeText },
              ]}
            />
            <Space wrap size={4}>
              <Link to="/terms">
                <Button type="link" size="small">
                  {chromeCopy.terms}
                </Button>
              </Link>
              <span>·</span>
              <Link to="/privacy">
                <Button type="link" size="small">
                  {chromeCopy.privacy}
                </Button>
              </Link>
              <span>·</span>
              <Link to="/user_manual">
                <Button type="link" size="small" icon={<BookOutlined />}>
                  {chromeCopy.userManual}
                </Button>
              </Link>
            </Space>
          </div>

          <div style={{ marginBottom: 32 }}>
            <Space wrap style={{ marginBottom: 12 }}>
              <Tag color="blue" icon={<SafetyCertificateOutlined />}>
                {badgeText}
              </Tag>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {layoutCopy.effectiveDate}
              </Text>
            </Space>
            <Title
              level={1}
              style={{ marginTop: 0, marginBottom: 8, fontSize: 32 }}
            >
              {title}
            </Title>
            <Paragraph
              style={{
                fontSize: 16,
                color: "var(--nb-graphite-text, #4a5568)",
                maxWidth: 780,
              }}
            >
              {subtitle}
            </Paragraph>
          </div>

          <Card
            style={{
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--nb-grid, #e2e8f0)",
            }}
          >
            {children}
          </Card>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              {layoutCopy.back}
            </Button>
            <Space wrap>
              <Link to="/terms">
                <Button type="link">{chromeCopy.terms}</Button>
              </Link>
              <span>·</span>
              <Link to="/privacy">
                <Button type="link">{chromeCopy.privacy}</Button>
              </Link>
              <span>·</span>
              <Link to="/user_manual">
                <Button type="link" icon={<BookOutlined />}>
                  {chromeCopy.userManual}
                </Button>
              </Link>
            </Space>
          </div>
        </div>
      </main>

      <EditorialFooter onJump={scrollToSection} />
    </div>
  );
}

export function TermsAndConditions() {
  const app = useApp();
  const c = TERMS_COPY[app.locale] ?? TERMS_COPY.en;

  return (
    <LegalLayout title={c.title} subtitle={c.subtitle} badgeText={c.badge}>
      <div className="stack" style={{ gap: 24 }}>
        <Alert
          type="info"
          showIcon
          icon={<CheckCircleOutlined />}
          title={c.mandatoryTitle}
          description={c.mandatoryDesc}
        />

        <section>
          <Title level={3}>{c.s1Title}</Title>
          <Paragraph>{c.s1P1}</Paragraph>
          <Paragraph>
            <strong>{c.s1P2Lead}</strong> {c.s1P2Body}
          </Paragraph>
          <Paragraph>
            <strong>{c.s1P3Lead}</strong> {c.s1P3Body}
          </Paragraph>
        </section>

        <Divider />

        <section>
          <Title level={3} style={{ color: "#cf1322" }}>
            <WarningOutlined style={{ marginRight: 8 }} />
            {c.s2Title}
          </Title>
          <Paragraph>{c.s2Intro}</Paragraph>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title={c.s2AlertTitle}
            description={c.s2AlertDesc}
          />
          <LabeledBulletList items={c.s2Items} />
          <Paragraph type="secondary" style={{ marginTop: 12 }}>
            <strong>{c.s2ConsequencesLabel}</strong> {c.s2ConsequencesBody}
          </Paragraph>
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s3Title}</Title>
          <Paragraph>{c.s3P1}</Paragraph>
          <Paragraph>{c.s3P2}</Paragraph>
          <ul style={{ paddingLeft: 24, lineHeight: 1.8 }}>
            {c.s3Items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s4Title}</Title>
          <Paragraph>{c.s4Intro}</Paragraph>
          <LabeledBulletList items={c.s4Items} />
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s5Title}</Title>
          <Paragraph>{c.s5Body}</Paragraph>
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s6Title}</Title>
          <Paragraph>{c.s6Body}</Paragraph>
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s7Title}</Title>
          <Paragraph>{c.s7Body}</Paragraph>
          <Paragraph>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: "var(--nb-blue, #1677ff)",
              }}
            >
              <MailOutlined style={{ marginRight: 8 }} />
              {SUPPORT_EMAIL}
            </a>
          </Paragraph>
        </section>
      </div>
    </LegalLayout>
  );
}

export function PrivacyPolicy() {
  const app = useApp();
  const c = PRIVACY_COPY[app.locale] ?? PRIVACY_COPY.en;

  return (
    <LegalLayout title={c.title} subtitle={c.subtitle} badgeText={c.badge}>
      <div className="stack" style={{ gap: 24 }}>
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title={c.alertTitle}
          description={c.alertDesc}
        />

        <section>
          <Title level={3}>{c.s1Title}</Title>
          <Paragraph>{c.s1Intro}</Paragraph>
          <LabeledBulletList items={c.s1Items} />
        </section>

        <Divider />

        <section>
          <Title level={3} style={{ color: "var(--nb-blue, #1677ff)" }}>
            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
            {c.s2Title}
          </Title>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title={c.s2AlertTitle}
            description={c.s2AlertDesc}
          />
          <Paragraph>
            {c.s2BeforeBold}
            <strong>{c.s2Bold}</strong>
            {c.s2AfterBold}
          </Paragraph>
          <ul style={{ paddingLeft: 24, lineHeight: 1.8 }}>
            {c.s2Items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Paragraph type="secondary">{c.s2Note}</Paragraph>
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s3Title}</Title>
          <Paragraph>{c.s3Intro}</Paragraph>
          <LabeledBulletList items={c.s3Items} />
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s4Title}</Title>
          <Paragraph>{c.s4Intro}</Paragraph>
          <LabeledBulletList items={c.s4Items} />
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s5Title}</Title>
          <Paragraph>{c.s5Intro}</Paragraph>
          <LabeledBulletList items={c.s5Items} />
        </section>

        <Divider />

        <section>
          <Title level={3}>{c.s6Title}</Title>
          <Paragraph>{c.s6Body}</Paragraph>
          <Paragraph>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: "var(--nb-blue, #1677ff)",
              }}
            >
              <MailOutlined style={{ marginRight: 8 }} />
              {SUPPORT_EMAIL}
            </a>
          </Paragraph>
        </section>
      </div>
    </LegalLayout>
  );
}
