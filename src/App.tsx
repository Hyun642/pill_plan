import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  HeartHandshake,
  Home,
  Loader2,
  MessageCircle,
  Phone,
  Pill,
  Plus,
  QrCode,
  RefreshCw,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Screen =
  | "home"
  | "scan"
  | "ocr"
  | "schedule"
  | "meds"
  | "alerts"
  | "report"
  | "plan"
  | "settings";

type DoseStatus = "done" | "missed" | "scheduled" | "snoozed";
type HomeMode = "self" | "guardian";

const user = {
  name: "김민준",
  role: "보호자",
  patient: "어머니",
  age: 68,
  medicines: ["혈압약", "당뇨약", "위장약"],
  rule: "1일 3회 식후 30분",
  period: "7일",
};

const loadingSteps = [
  "OCR로 약봉투를 읽는 중...",
  "복용법을 스케줄로 바꾸는 중...",
  "보호자 알림 설정을 준비하는 중...",
];

const alerts = [
  {
    tone: "warn",
    title: "어머니 점심약이 40분째 미기록 상태예요.",
    time: "방금 전",
  },
  {
    tone: "danger",
    title: "어머니가 '잘 모르겠어요'를 선택했어요.",
    time: "오늘 12:52",
  },
  {
    tone: "blue",
    title: "내일 약이 끝나요. 재처방이나 약국 방문이 필요할 수 있어요.",
    time: "오늘 09:10",
  },
  {
    tone: "green",
    title: "최근 7일 복약률은 86%예요.",
    time: "어제",
  },
];

const plans = [
  {
    name: "Free",
    price: "0원",
    features: ["약 3개 등록", "기본 복약 알림", "복용 기록"],
  },
  {
    name: "Premium",
    price: "월 3,900원",
    features: ["무제한 약 등록", "리필 알림", "PDF 리포트"],
  },
  {
    name: "Family",
    price: "월 7,900원",
    features: [
      "부모님/가족 여러 명 관리",
      "보호자 여러 명 초대",
      "미복용 알림",
      "월간 리포트",
      "응급 QR 카드",
    ],
    recommended: true,
  },
];

const tabItems = [
  { id: "home" as Screen, label: "홈", icon: Home },
  { id: "scan" as Screen, label: "스캔", icon: ScanLine },
  { id: "meds" as Screen, label: "복약", icon: Pill },
  { id: "report" as Screen, label: "리포트", icon: FileText },
  { id: "settings" as Screen, label: "설정", icon: Settings },
];

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [homeMode, setHomeMode] = useState<HomeMode>("self");
  const [doseStatus, setDoseStatus] = useState<DoseStatus>("missed");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"unknown" | "payment" | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!ocrLoading) return;
    setLoadingIndex(0);
    const stepTimer = window.setInterval(() => {
      setLoadingIndex((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 560);
    const doneTimer = window.setTimeout(() => {
      setOcrLoading(false);
      setScreen("ocr");
    }, 1800);
    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(doneTimer);
    };
  }, [ocrLoading]);

  const activeTab = useMemo(() => {
    if (["ocr", "schedule"].includes(screen)) return "scan";
    if (screen === "alerts" || screen === "plan") return "home";
    return screen;
  }, [screen]);

  const startScan = () => {
    setScreen("scan");
    setOcrLoading(true);
  };

  const startSchedule = () => {
    setToast("어머니 복약 알림이 시작됐어요.");
    setScreen("home");
  };

  const content = (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-care-bg text-care-ink shadow-soft md:h-[880px] md:max-h-[92vh] md:rounded-[34px] md:border md:border-white/70">
      {toast && <Toast text={toast} />}
      <AppHeader onBell={() => setScreen("alerts")} />
      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-4">
        {screen === "home" && (
          <HomeScreen
            mode={homeMode}
            onModeChange={setHomeMode}
            doseStatus={doseStatus}
            onNotify={() => setToast("어머니께 복약 알림을 보냈어요.")}
            onScan={() => setScreen("scan")}
            onOpenMeds={() => setScreen("meds")}
            onPlan={() => setScreen("plan")}
          />
        )}
        {screen === "scan" && (
          <ScanScreen loading={ocrLoading} step={loadingIndex} onScan={startScan} />
        )}
        {screen === "ocr" && <OcrScreen onConfirm={() => setScreen("schedule")} />}
        {screen === "schedule" && (
          <ScheduleScreen onStart={startSchedule} onEdit={() => setToast("시간 수정은 데모에서 준비 중이에요.")} />
        )}
        {screen === "meds" && (
          <MedicationScreen
            doseStatus={doseStatus}
            onDone={() => {
              setDoseStatus("done");
              setToast("점심약을 먹었어요로 기록했어요.");
            }}
            onSnooze={() => {
              setDoseStatus("snoozed");
              setToast("30분 뒤 다시 알려드릴게요.");
            }}
            onUnknown={() => setModal("unknown")}
          />
        )}
        {screen === "alerts" && <AlertsScreen />}
        {screen === "report" && <ReportScreen onPlan={() => setScreen("plan")} />}
        {screen === "plan" && <PlanScreen onPayment={() => setModal("payment")} />}
        {screen === "settings" && <SettingsScreen />}
      </main>
      <BottomTabs active={activeTab} onChange={(next) => setScreen(next)} />
      {modal === "unknown" && (
        <SafetyModal onClose={() => setModal(null)} />
      )}
      {modal === "payment" && (
        <PaymentModal onClose={() => setModal(null)} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen md:flex md:items-center md:justify-center md:p-8">
      <div className="hidden pb-4 text-center text-sm font-medium text-slate-600 md:block md:absolute md:top-5">
        모바일 화면에 최적화된 프로토타입입니다.
      </div>
      {content}
    </div>
  );
}

function AppHeader({ onBell }: { onBell: () => void }) {
  return (
    <header className="flex items-center justify-between px-5 pb-2 pt-5">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-care-blue text-white shadow-lift">
          <HeartHandshake size={21} strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-xs font-semibold text-care-green">부모님 약 챙김 앱</p>
          <h1 className="text-lg font-extrabold tracking-normal">약속케어</h1>
        </div>
      </div>
      <button
        aria-label="보호자 알림"
        onClick={onBell}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-care-ink shadow-sm"
      >
        <Bell size={21} />
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-care-danger ring-2 ring-white" />
      </button>
    </header>
  );
}

function Onboarding({
  onStart,
  onDemo,
}: {
  onStart: () => void;
  onDemo: () => void;
}) {
  return (
    <section className="flex min-h-full flex-col px-1 pb-8 pt-5">
      <div className="mb-7 flex items-center gap-2 px-1">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-care-blue text-white shadow-lift">
          <HeartHandshake size={23} />
        </div>
        <div>
          <p className="text-xs font-bold text-care-green">부모님 약 챙김 앱</p>
          <h1 className="text-xl font-extrabold">약속케어</h1>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="mb-5 rounded-[24px] bg-[#EAF7F5] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-care-blue shadow-sm">
              <UserRound size={28} />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-care-green shadow-sm">
              <Pill size={28} />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-care-blue text-white shadow-sm">
              <Bell size={27} />
            </div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-sm font-bold">어머니 점심약이 미기록 상태예요.</p>
            <p className="mt-1 text-xs text-slate-500">가족에게 안심 알림이 도착합니다.</p>
          </div>
        </div>

        <h2 className="whitespace-pre-line text-[30px] font-black leading-tight tracking-normal">
          부모님 약 드셨는지{"\n"}매일 전화하지 마세요
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600">
          약봉투를 찍으면 복약 알림이 자동으로 만들어지고, 미복용 시 가족에게 알려드려요.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <RoleCard selected title="부모님 약을 챙기는 보호자" desc="기본 선택" />
        <RoleCard title="내 약을 직접 관리하는 사용자" desc="직접 복약 기록" />
      </div>

      <div className="mt-auto space-y-3 pt-6">
        <PrimaryButton onClick={onStart}>부모님 약 관리 시작하기</PrimaryButton>
        <SecondaryButton onClick={onDemo}>먼저 데모 보기</SecondaryButton>
        <p className="px-3 text-center text-xs leading-5 text-slate-500">
          진단·처방이 아닌 복약 기록과 알림을 돕는 서비스입니다.
        </p>
      </div>
    </section>
  );
}

function RoleCard({
  title,
  desc,
  selected,
}: {
  title: string;
  desc: string;
  selected?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm ${selected ? "border-care-blue" : "border-transparent"}`}>
      <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? "border-care-blue bg-care-blue text-white" : "border-slate-300"}`}>
        {selected && <Check size={15} />}
      </div>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function HomeScreen({
  mode,
  onModeChange,
  doseStatus,
  onNotify,
  onScan,
  onOpenMeds,
  onPlan,
}: {
  mode: HomeMode;
  onModeChange: (mode: HomeMode) => void;
  doseStatus: DoseStatus;
  onNotify: () => void;
  onScan: () => void;
  onOpenMeds: () => void;
  onPlan: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
        <button
          onClick={() => onModeChange("self")}
          className={`h-12 rounded-xl text-sm font-black transition ${mode === "self" ? "bg-care-blue text-white shadow-lift" : "text-slate-500"}`}
        >
          본인 약관리
        </button>
        <button
          onClick={() => onModeChange("guardian")}
          className={`h-12 rounded-xl text-sm font-black transition ${mode === "guardian" ? "bg-care-blue text-white shadow-lift" : "text-slate-500"}`}
        >
          보호자 페이지
        </button>
      </div>

      {mode === "self" ? (
        <SelfHome doseStatus={doseStatus} onScan={onScan} onOpenMeds={onOpenMeds} />
      ) : (
        <GuardianHome
          doseStatus={doseStatus}
          onNotify={onNotify}
          onScan={onScan}
          onPlan={onPlan}
        />
      )}
    </section>
  );
}

function SelfHome({
  doseStatus,
  onScan,
  onOpenMeds,
}: {
  doseStatus: DoseStatus;
  onScan: () => void;
  onOpenMeds: () => void;
}) {
  return (
    <>
      <div>
        <p className="text-sm font-semibold text-care-green">{user.name}님</p>
        <h2 className="text-[24px] font-black leading-tight">오늘 내 약 관리예요</h2>
      </div>

      <div className="rounded-[26px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-care-blue">지금 확인할 약</p>
            <h3 className="mt-1 text-3xl font-black">점심약</h3>
          </div>
          <StatusPill tone={doseStatus === "done" ? "green" : "warn"}>
            {doseStatus === "done" ? "먹었어요" : doseStatus === "snoozed" ? "다시 알림" : "아직 미기록"}
          </StatusPill>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-lg font-extrabold">혈압약 1정, 당뇨약 1정, 위장약 1정</p>
          <p className="mt-2 text-base text-slate-600">식후 30분 · 12:30</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <DoseCard label="아침약" status="먹었어요" tone="green" />
        <DoseCard
          label="점심약"
          status={doseStatus === "done" ? "먹었어요" : doseStatus === "snoozed" ? "다시 알림" : "기록 필요"}
          tone={doseStatus === "done" ? "green" : "warn"}
        />
        <DoseCard label="저녁약" status="18:30 예정" tone="blue" />
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={onOpenMeds} icon={<Check size={20} />}>
          내 점심약 먹었어요
        </PrimaryButton>
        <SecondaryButton onClick={onScan} icon={<Plus size={20} />}>
          새 약 등록하기
        </SecondaryButton>
      </div>

      <InfoCard
        icon={<ShieldCheck size={22} />}
        title="쉽게 기록하세요"
        text="복용 여부가 헷갈리면 임의로 추가 복용하지 말고 약봉투 지시나 의사·약사에게 확인하세요."
      />
    </>
  );
}

function GuardianHome({
  doseStatus,
  onNotify,
  onScan,
  onPlan,
}: {
  doseStatus: DoseStatus;
  onNotify: () => void;
  onScan: () => void;
  onPlan: () => void;
}) {
  return (
    <>
      <div>
        <p className="text-sm font-semibold text-care-green">{user.name}님</p>
        <h2 className="text-[24px] font-black leading-tight">오늘 어머니 복약 상태예요</h2>
      </div>

      <div className="rounded-[26px] bg-care-ink p-5 text-white shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70">관리 대상</p>
            <h3 className="mt-1 text-2xl font-black">어머니, {user.age}세</h3>
          </div>
          <StatusPill tone="warn">점심약 40분 지연</StatusPill>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-sm text-white/70">오늘 복약률</p>
            <p className="text-4xl font-black">67%</p>
          </div>
          <div className="h-16 w-28 rounded-2xl bg-white/10 p-2">
            <div className="flex h-full items-end gap-1.5">
              {[70, 38, 58, 82, 42, 90].map((height, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-full bg-care-mint"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <DoseCard label="아침약" status="먹었어요" tone="green" />
        <DoseCard
          label="점심약"
          status={doseStatus === "done" ? "먹었어요" : doseStatus === "snoozed" ? "다시 알림" : "아직 미기록"}
          tone={doseStatus === "done" ? "green" : "warn"}
        />
        <DoseCard label="저녁약" status="예정" tone="blue" />
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={onNotify} icon={<Bell size={20} />}>
          어머니께 복약 알림 보내기
        </PrimaryButton>
        <SecondaryButton onClick={onScan} icon={<Plus size={20} />}>
          약봉투 새로 등록하기
        </SecondaryButton>
      </div>

      <InfoCard
        icon={<ShieldCheck size={22} />}
        title="오늘의 안심 메시지"
        text="미기록 상태가 1시간 이상 지속되면 보호자에게 알려드려요."
      />

      <button
        onClick={onPlan}
        className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm"
      >
        <div>
          <p className="font-extrabold">가족 플랜으로 더 안심하기</p>
          <p className="mt-1 text-sm text-slate-500">여러 보호자가 함께 확인할 수 있어요.</p>
        </div>
        <ChevronRight className="text-slate-400" size={22} />
      </button>
    </>
  );
}

function ScanScreen({
  loading,
  step,
  onScan,
}: {
  loading: boolean;
  step: number;
  onScan: () => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-care-green">자동 스케줄 만들기</p>
        <h2 className="text-[25px] font-black">약봉투를 촬영해 주세요</h2>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-care-ink p-5 text-white shadow-soft">
        <div className="absolute inset-x-9 top-1/2 h-0.5 bg-care-mint/80" />
        <div className="flex h-72 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-white/35 bg-white/6">
          {loading ? (
            <>
              <Loader2 className="animate-spin text-care-mint" size={42} />
              <p className="mt-5 text-center text-lg font-extrabold">{loadingSteps[step]}</p>
              <p className="mt-2 text-center text-sm text-white/65">잠시만 기다려 주세요.</p>
            </>
          ) : (
            <>
              <Camera size={48} className="text-care-mint" />
              <p className="mt-4 text-center text-lg font-extrabold">약봉투 앞면을 프레임 안에 맞춰주세요</p>
              <p className="mt-2 px-5 text-center text-sm leading-6 text-white/65">
                약명, 복용법, 일수, 식전/식후 정보를 읽어 복약 스케줄을 만듭니다.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={onScan} disabled={loading} icon={<Camera size={20} />}>
          약봉투 촬영하기
        </PrimaryButton>
        <SecondaryButton onClick={onScan} disabled={loading} icon={<Sparkles size={20} />}>
          샘플 약봉투로 데모 보기
        </SecondaryButton>
      </div>

      <InfoCard
        icon={<AlertTriangle size={22} />}
        title="저장 전 확인이 필요해요"
        text="OCR 결과는 틀릴 수 있어요. 약봉투와 비교한 뒤 알림을 시작해 주세요."
      />
    </section>
  );
}

function OcrScreen({ onConfirm }: { onConfirm: () => void }) {
  const rows = [
    ["처방명", "5월 20일 내과 처방", "높음"],
    ["약 1", "혈압약 1정", "높음"],
    ["약 2", "당뇨약 1정", "높음"],
    ["약 3", "위장약 1정", "높음"],
    ["복용법", "1일 3회, 아침/점심/저녁 식후 30분", "높음"],
    ["기간", "7일", "높음"],
    ["주의", "운전 주의 정보 확인 필요", "확인 필요"],
  ];

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-care-green">OCR 결과 확인</p>
        <h2 className="text-[25px] font-black">아래 내용이 맞나요?</h2>
      </div>

      <div className="space-y-3 rounded-[26px] bg-white p-4 shadow-soft">
        {rows.map(([label, value, confidence]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${confidence === "높음" ? "bg-emerald-50 text-care-green" : "bg-amber-50 text-amber-700"}`}>
                {confidence}
              </span>
            </div>
            <input className="w-full bg-transparent text-[15px] font-bold outline-none" value={value} readOnly />
          </div>
        ))}
      </div>

      <InfoCard
        icon={<AlertTriangle size={22} />}
        title="꼭 비교해 주세요"
        text="OCR 결과는 틀릴 수 있어요. 저장 전 반드시 약봉투와 비교해 주세요. 복용량 변경이나 중단은 의사·약사에게 확인하세요."
      />

      <div className="space-y-3">
        <PrimaryButton onClick={onConfirm}>네, 스케줄 만들기</PrimaryButton>
        <SecondaryButton onClick={() => undefined}>직접 수정하기</SecondaryButton>
      </div>
    </section>
  );
}

function ScheduleScreen({
  onStart,
  onEdit,
}: {
  onStart: () => void;
  onEdit: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-50 text-care-green">
          <Check size={30} />
        </div>
        <h2 className="text-[26px] font-black leading-tight">복약 스케줄이 만들어졌어요</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          식후 30분 기준으로 기본 시간이 설정되었어요.
        </p>
      </div>

      <div className="space-y-3">
        {[
          ["아침", "08:30"],
          ["점심", "12:30"],
          ["저녁", "18:30"],
        ].map(([label, time]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-care-blue">
                <Clock3 size={21} />
              </div>
              <div>
                <p className="font-extrabold">{label}</p>
                <p className="text-sm text-slate-500">식후 30분</p>
              </div>
            </div>
            <p className="text-xl font-black">{time}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[24px] bg-white p-4 shadow-sm">
        <p className="mb-3 font-extrabold">부모님 화면 버튼 미리보기</p>
        <div className="grid grid-cols-3 gap-2">
          {["먹었어요", "나중에", "잘 모르겠어요"].map((label) => (
            <div key={label} className="flex h-16 items-center justify-center rounded-2xl bg-slate-50 px-2 text-center text-sm font-extrabold">
              {label}
            </div>
          ))}
        </div>
      </div>

      <InfoCard
        icon={<CalendarClock size={22} />}
        title="5월 27일 복약 종료 예정"
        text="7일간 반복됩니다. 가족 공유를 켜면 미복용 시 보호자에게 알려드려요."
      />

      <div className="space-y-3">
        <PrimaryButton onClick={onStart}>이 스케줄로 알림 시작하기</PrimaryButton>
        <SecondaryButton onClick={onEdit}>시간 수정하기</SecondaryButton>
      </div>
    </section>
  );
}

function MedicationScreen({
  doseStatus,
  onDone,
  onSnooze,
  onUnknown,
}: {
  doseStatus: DoseStatus;
  onDone: () => void;
  onSnooze: () => void;
  onUnknown: () => void;
}) {
  const statusText =
    doseStatus === "done"
      ? "완료 처리됨"
      : doseStatus === "snoozed"
        ? "30분 뒤 다시 알림"
        : "아직 미기록";

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-care-green">쉬운 복약 기록</p>
        <h2 className="text-[25px] font-black">어머니의 오늘 복약</h2>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-care-blue">현재 먹을 약</p>
            <h3 className="mt-1 text-3xl font-black">점심약</h3>
          </div>
          <StatusPill tone={doseStatus === "done" ? "green" : "warn"}>{statusText}</StatusPill>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-lg font-extrabold">혈압약 1정, 당뇨약 1정, 위장약 1정</p>
          <p className="mt-2 text-base text-slate-600">식후 30분</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onDone}
          className="flex h-16 w-full items-center justify-center rounded-2xl bg-care-green text-lg font-black text-white shadow-lift transition active:scale-[0.98]"
        >
          먹었어요
        </button>
        <button
          onClick={onSnooze}
          className="flex h-16 w-full items-center justify-center rounded-2xl bg-care-warn text-lg font-black text-white shadow-sm transition active:scale-[0.98]"
        >
          나중에
        </button>
        <button
          onClick={onUnknown}
          className="flex h-16 w-full items-center justify-center rounded-2xl bg-white text-lg font-black text-care-ink shadow-sm transition active:scale-[0.98]"
        >
          잘 모르겠어요
        </button>
      </div>

      <InfoCard
        icon={<ShieldCheck size={22} />}
        title="복용 여부가 애매할 때"
        text="임의로 추가 복용하지 말고 약봉투 지시나 의사·약사에게 확인하세요."
      />
    </section>
  );
}

function AlertsScreen() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-care-green">보호자 알림</p>
        <h2 className="text-[25px] font-black">확인이 필요한 소식이에요</h2>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.title} className="rounded-[22px] bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneBg(alert.tone)}`}>
                {alert.tone === "danger" ? <AlertTriangle size={21} /> : alert.tone === "green" ? <Check size={21} /> : <Bell size={21} />}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold leading-6">{alert.title}</p>
                <p className="mt-1 text-sm text-slate-500">{alert.time}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniAction icon={<Phone size={16} />} label="전화하기" />
              <MiniAction icon={<MessageCircle size={16} />} label="카톡 확인" />
              <MiniAction icon={<RefreshCw size={16} />} label="다시 알림" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportScreen({ onPlan }: { onPlan: () => void }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-care-green">가족 안심 리포트</p>
        <h2 className="text-[25px] font-black">이번 주 복약 리포트</h2>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <p className="text-sm font-bold text-slate-500">최근 7일 복약률</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-5xl font-black text-care-blue">86%</p>
          <StatusPill tone="green">꾸준해요</StatusPill>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[86%] rounded-full bg-care-blue" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ReportTile title="점심약 미기록" value="3회" icon={<Clock3 size={20} />} />
        <ReportTile title="잘 모르겠어요" value="2회" icon={<AlertTriangle size={20} />} />
        <ReportTile title="총 미기록" value="4회" icon={<Bell size={20} />} />
        <ReportTile title="부작용 메모" value="1건" icon={<FileText size={20} />} />
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={onPlan} icon={<FileText size={20} />}>
          진료실용 PDF 만들기
        </PrimaryButton>
        <SecondaryButton onClick={onPlan} icon={<UsersRound size={20} />}>
          가족에게 리포트 공유하기
        </SecondaryButton>
      </div>

      <InfoCard
        icon={<ShieldCheck size={22} />}
        title="참고용 리포트"
        text="이 리포트는 진료 상담을 돕기 위한 참고 자료입니다."
      />
    </section>
  );
}

function PlanScreen({ onPayment }: { onPayment: () => void }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-care-green">가족 플랜</p>
        <h2 className="text-[25px] font-black">매일 전화로 확인하던 일을 알림으로 바꾸세요.</h2>
        <p className="mt-2 leading-6 text-slate-600">부모님 1명 무료 관리 후 가족 플랜을 시작할 수 있어요.</p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-[24px] border bg-white p-4 shadow-sm ${plan.recommended ? "border-care-blue shadow-lift" : "border-transparent"}`}
          >
            {plan.recommended && (
              <span className="absolute right-4 top-4 rounded-full bg-care-blue px-3 py-1 text-xs font-black text-white">
                추천
              </span>
            )}
            <h3 className="text-xl font-black">{plan.name}</h3>
            <p className="mt-1 text-lg font-extrabold text-care-blue">{plan.price}</p>
            <div className="mt-3 space-y-2">
              {plan.features.map((feature) => (
                <p key={feature} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Check size={16} className="text-care-green" />
                  {feature}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={onPayment} icon={<CreditCard size={20} />}>
          7일 무료로 가족 플랜 시작하기
        </PrimaryButton>
        <SecondaryButton onClick={() => undefined}>무료로 계속 사용하기</SecondaryButton>
      </div>
    </section>
  );
}

function SettingsScreen() {
  const sections = [
    ["내 정보", "김민준 · 보호자"],
    ["관리 중인 가족", "어머니 68세"],
    ["알림 설정", "미복용 1시간 뒤 보호자 알림"],
    ["보호자 공유 설정", "초대와 동의 후 활성화"],
    ["개인정보 설정", "약봉투 이미지 저장 여부"],
    ["데이터 삭제", "복약 기록과 이미지 삭제"],
    ["서비스 안내", "약속케어 이용 방법"],
    ["의료 정보 고지", "진단, 처방, 복용량 조절 미제공"],
  ];

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-care-green">마이페이지</p>
        <h2 className="text-[25px] font-black">설정</h2>
      </div>
      <div className="space-y-2">
        {sections.map(([title, desc]) => (
          <button key={title} className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm">
            <div>
              <p className="font-extrabold">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        ))}
      </div>
      <InfoCard
        icon={<QrCode size={22} />}
        title="개인정보와 공유"
        text="약봉투 이미지는 사용자가 원할 경우 저장하지 않고 삭제할 수 있어요. 보호자 공유는 초대와 동의가 있어야만 활성화됩니다."
      />
      <InfoCard
        icon={<AlertTriangle size={22} />}
        title="의료 정보 고지"
        text="약속케어는 진단, 처방, 복용량 조절을 제공하지 않습니다. 약 복용 변경은 반드시 의사·약사와 상의하세요."
      />
    </section>
  );
}

function BottomTabs({
  active,
  onChange,
}: {
  active: Screen;
  onChange: (screen: Screen) => void;
}) {
  return (
    <nav className="absolute inset-x-4 bottom-4 z-20 rounded-[26px] border border-white/80 bg-white/95 px-2 py-2 shadow-soft backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition ${isActive ? "bg-blue-50 text-care-blue" : "text-slate-400"}`}
            >
              <Icon size={21} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DoseCard({
  label,
  status,
  tone,
}: {
  label: string;
  status: string;
  tone: "green" | "warn" | "blue";
}) {
  return (
    <div className="min-h-[112px] rounded-[22px] bg-white p-3 shadow-sm">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-2xl ${toneBg(tone)}`}>
        {tone === "green" ? <Check size={19} /> : tone === "warn" ? <AlertTriangle size={19} /> : <Clock3 size={19} />}
      </div>
      <p className="text-sm font-black">{label}</p>
      <p className="mt-1 text-xs font-bold leading-4 text-slate-500">{status}</p>
    </div>
  );
}

function ReportTile({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-care-blue">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function MiniAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex h-10 items-center justify-center gap-1 rounded-xl bg-slate-50 text-[12px] font-black text-slate-700">
      {icon}
      {label}
    </button>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-[22px] bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-care-green">
        {icon}
      </div>
      <div>
        <p className="font-extrabold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  icon,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-care-blue px-4 text-base font-black text-white shadow-lift transition active:scale-[0.98] disabled:opacity-60"
    >
      {icon}
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  icon,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-base font-black text-care-ink shadow-sm transition active:scale-[0.98] disabled:opacity-60"
    >
      {icon}
      {children}
    </button>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "warn" | "danger" | "blue";
}) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${toneBg(tone)}`}>
      {children}
    </span>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div className="toast-in absolute left-5 right-5 top-5 z-40 rounded-2xl bg-care-ink px-4 py-3 text-center text-sm font-black text-white shadow-soft">
      {text}
    </div>
  );
}

function SafetyModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex h-13 w-13 items-center justify-center rounded-3xl bg-red-50 text-care-danger">
        <AlertTriangle size={30} />
      </div>
      <h3 className="mt-4 text-2xl font-black">중복 복용 주의</h3>
      <p className="mt-3 leading-7 text-slate-600">
        복용 여부가 확실하지 않다면 임의로 추가 복용하지 말고, 약봉투 지시나 의사·약사에게 확인하세요.
      </p>
      <PrimaryButton onClick={onClose}>확인했어요</PrimaryButton>
    </Modal>
  );
}

function PaymentModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex h-13 w-13 items-center justify-center rounded-3xl bg-blue-50 text-care-blue">
        <CreditCard size={30} />
      </div>
      <h3 className="mt-4 text-2xl font-black">결제 준비 중</h3>
      <p className="mt-3 leading-7 text-slate-600">
        데모에서는 실제 결제가 진행되지 않아요. 가족 플랜 시작 흐름을 보여주는 mock 화면입니다.
      </p>
      <PrimaryButton onClick={onClose}>닫기</PrimaryButton>
    </Modal>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="w-full rounded-[28px] bg-white p-5 shadow-soft">
        <div className="mb-1 flex justify-end">
          <button
            aria-label="닫기"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function toneBg(tone: string) {
  switch (tone) {
    case "green":
      return "bg-emerald-50 text-care-green";
    case "warn":
      return "bg-amber-50 text-amber-700";
    case "danger":
      return "bg-red-50 text-care-danger";
    default:
      return "bg-blue-50 text-care-blue";
  }
}

export default App;
