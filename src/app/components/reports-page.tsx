import { useState, useEffect, useMemo, useRef } from "react";
import jsQR from "jsqr";
import {
  Pencil,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Check,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Maximize2,
  Trash2,
  Brain,
  MessageSquare,
  BarChart2,
  Download,
  Play,
  Camera,
  Upload,
  QrCode,
  ShieldCheck,
  Send,
  ArrowLeft,
  ArrowRight,
  Image,
  RefreshCw
} from "lucide-react";
import { type ScheduleRow } from "./generate-schedule-modal";
import { defaultMachines } from "./machines-page";
import { taskStepsMap, defaultSopSteps, type SopStep, type TrainingTask, validateStep, getSopSteps, getPrereqsForMachine, getPrereqsForSop } from "./my-task-page";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  AreaChart,
  Area
} from "recharts";

import image1 from "../../imports/image-1.png";
import image2 from "../../imports/image-2.png";
import image3 from "../../imports/image-3.png";
import image4 from "../../imports/image-4.png";
import image5 from "../../imports/image-5.png";
import image6 from "../../imports/image-6.png";

type ReportTab =
  | "AUDIT REPORTS"
  | "CHANGEOVER REPORTS"
  | "MAINTENANCE REPORTS"
  | "TRAINING REPORTS"
  | "ALARM SOP REPORTS"
  | "OEE REPORTS"
  | "AMC REPORTS";

interface ReportItem {
  id: string;
  title: string;
  performedOn: string;
  doneBy: string;
  remarks: string;
  status: "In Progress" | "Ready for Review" | "Reviewed" | "Expired" | "Cancelled";
  type: string;
  machine: string;
  steps: SopStep[];
  sopProgress?: Record<number, { remarks: string; qrScanned: boolean; attachmentName: string; attachmentUrl?: string; oldPartAttachmentName?: string; oldPartAttachmentUrl?: string; newPartAttachmentName?: string; newPartAttachmentUrl?: string }>;
}

const TABS: ReportTab[] = [
  "AUDIT REPORTS",
  // "CHANGEOVER REPORTS",
  "MAINTENANCE REPORTS",
  // "TRAINING REPORTS",
  "ALARM SOP REPORTS",
  "OEE REPORTS",
  "AMC REPORTS",
];

// Pre-populated mock reports for all tabs other than AMC
const INITIAL_MOCK_REPORTS: Record<Exclude<ReportTab, "OEE REPORTS" | "AMC REPORTS">, ReportItem[]> = {
  "MAINTENANCE REPORTS": [
    {
      id: "maint-1",
      title: "Preventive-1",
      performedOn: "05 Jun 2026",
      doneBy: "Dibyanshu.Pandey",
      remarks: "Completed clean workspace check and HEPA filter inspect. System runs smooth.",
      status: "Ready for Review",
      type: "Preventive",
      machine: "CADMACH",
      steps: [
        {
          title: "Step 1: Clean machine workspace and wipe exterior panels",
          mediaUrl: image4,
          qrRequired: true,
          desc: "Clean product residue from workspace. Wipe down stainless steel exterior panels.",
          ans: "Panels are clean; workspace is free of powder debris.",
          type: "normal",
        },
        {
          title: "Step 2: Empty refuse containers and inspect filter seals",
          mediaUrl: image5,
          qrRequired: false,
          desc: "Empty powder dust collector waste. Check the intake filter seals for tears.",
          ans: "Waste bin empty; filter seals show no signs of bypass leaks.",
          type: "info",
        }
      ],
      sopProgress: {
        0: { remarks: "Wiped all surfaces, verified cleanliness.", qrScanned: true, attachmentName: "workspace-clean.png", attachmentUrl: image4 },
        1: { remarks: "Bins emptied, seals inspected and found intact.", qrScanned: false, attachmentName: "" },
      }
    },
    {
      id: "maint-2",
      title: "Corrective Shaft Alignment",
      performedOn: "02 Jun 2026",
      doneBy: "john",
      remarks: "Realigned main drive shaft. Vibration levels measured and within tolerance.",
      status: "Reviewed",
      type: "Corrective",
      machine: "Korsch",
      steps: [
        {
          title: "Step 1: Check drive motor belt tension and electrical connections",
          mediaUrl: image3,
          qrRequired: true,
          desc: "Verify belt tension is within 10-15mm deflection. Tighten electrical terminals if loose.",
          ans: "Deflection is 12mm; connections are torqued.",
          type: "normal"
        }
      ],
      sopProgress: {
        0: { remarks: "Deflection verified, torqued connector screws.", qrScanned: true, attachmentName: "tension-reading.png", attachmentUrl: image3 }
      }
    },
    {
      id: "maint-3",
      title: "Breakdown Belt Repair",
      performedOn: "28 May 2026",
      doneBy: "operator",
      remarks: "Replaced main drive belt which was worn out. Checked functionality.",
      status: "Reviewed",
      type: "Breakdown",
      machine: "Fette Compactin...",
      steps: [
        {
          title: "Step 1: General inspection and belt removal",
          mediaUrl: image2,
          qrRequired: true,
          desc: "Inspect main pulleys for damage. Carefully remove the torn drive belt.",
          ans: "Belt removed; pulley tracks clean.",
          type: "critical"
        }
      ],
      sopProgress: {
        0: { remarks: "Pulleys inspected, removed damaged belt.", qrScanned: true, attachmentName: "" }
      }
    },
    {
      id: "maint-4",
      title: "Monthly Compressor Lubrication",
      performedOn: "09 May 2026",
      doneBy: "john",
      remarks: "",
      status: "In Progress",
      type: "Preventive",
      machine: "CADMACH",
      steps: getSopSteps("CADMACH", "Monthly Lubrication"),
      sopProgress: {}
    }
  ],
  "AUDIT REPORTS": [
    {
      id: "audit-1",
      title: "Monthly Safety Audit",
      performedOn: "04 Jun 2026",
      doneBy: "supervisor",
      remarks: "Emergency stops checked. Guard door interlocks operational.",
      status: "Reviewed",
      type: "Internal",
      machine: "Fette Compactin...",
      steps: [
        {
          title: "Step 1: Emergency Stop Check",
          mediaUrl: image1,
          qrRequired: false,
          desc: "Trip all E-stops and ensure the main contactor drops out.",
          ans: "Contactor tripped instantly.",
          type: "critical"
        }
      ],
      sopProgress: {
        0: { remarks: "E-stops functional on all operator stations.", qrScanned: false, attachmentName: "" }
      }
    },
    {
      id: "audit-2",
      title: "Cleanroom Air Quality Check",
      performedOn: "01 Jun 2026",
      doneBy: "external_inspector",
      remarks: "HEPA filters checked. Particle count within regulatory limits.",
      status: "Reviewed",
      type: "External",
      machine: "All",
      steps: [
        {
          title: "Step 1: Particle Counter Placement",
          mediaUrl: image6,
          qrRequired: false,
          desc: "Place counter at 4 locations in cleanroom and record particle counts.",
          ans: "Particle count satisfies ISO Class 5 limits.",
          type: "normal"
        }
      ],
      sopProgress: {
        0: { remarks: "All locations measured under 100 particles/m3.", qrScanned: false, attachmentName: "" }
      }
    }
  ],
  "CHANGEOVER REPORTS": [
    {
      id: "changeover-1",
      title: "CADMACH Format Changeover",
      performedOn: "06 Jun 2026",
      doneBy: "operator",
      remarks: "Format parts changed from size 10 to 12. Pre-run test successful.",
      status: "Ready for Review",
      type: "Format Change",
      machine: "CADMACH",
      steps: [
        {
          title: "Step 1: Install new size guides and tooling",
          mediaUrl: image4,
          qrRequired: true,
          desc: "Fit size-specific format guides and compression tooling onto the turret assembly.",
          ans: "Format parts securely seated and aligned.",
          type: "critical"
        }
      ],
      sopProgress: {
        0: { remarks: "Changed format elements to size 12, checked rotation manually.", qrScanned: true, attachmentName: "" }
      }
    },
    {
      id: "changeover-2",
      title: "Fette Turret Wash",
      performedOn: "03 Jun 2026",
      doneBy: "john",
      remarks: "Cleaned turret, die table, and compression rollers thoroughly.",
      status: "Reviewed",
      type: "Cleaning",
      machine: "Fette Compactin...",
      steps: [
        {
          title: "Step 1: Wash-in-place turret disinfection",
          mediaUrl: image5,
          qrRequired: false,
          desc: "Use high pressure rinse with 2% isopropyl solution to clean turret chambers.",
          ans: "Turret chambers rinsed; no product residue visible.",
          type: "info"
        }
      ],
      sopProgress: {
        0: { remarks: "Cleaned with solution, dried with sterile air.", qrScanned: false, attachmentName: "" }
      }
    }
  ],
  "TRAINING REPORTS": [
    {
      id: "training-1",
      title: "Operator SOP Onboarding",
      performedOn: "05 Jun 2026",
      doneBy: "Dibyanshu.Pandey",
      remarks: "Completed onboarding for CADMACH operation.",
      status: "Reviewed",
      type: "SOP",
      machine: "CADMACH",
      steps: defaultSopSteps,
      sopProgress: {
        0: { remarks: "Workspace verified.", qrScanned: false, attachmentName: "" },
        1: { remarks: "Machine prechecks complete. Passed evaluation.", qrScanned: true, attachmentName: "" }
      }
    }
  ],
  "ALARM SOP REPORTS": [
    {
      id: "alarm-1",
      title: "Overpressure Shutdown Log",
      performedOn: "07 Jun 2026",
      doneBy: "operator",
      remarks: "High pressure alarm triggered. SOP steps performed to clear compression path.",
      status: "Ready for Review",
      type: "Critical Alarm",
      machine: "Korsch",
      steps: [
        {
          title: "Step 1: Clear turret compaction chamber",
          mediaUrl: image1,
          qrRequired: true,
          desc: "Shut down feeder, clear blocked powder compaction chambers, and inspect die pins.",
          ans: "Turret cleared; pins move freely.",
          type: "critical"
        }
      ],
      sopProgress: {
        0: { remarks: "Unblocked compaction throat, verified no pin cracks.", qrScanned: true, attachmentName: "" }
      }
    }
  ]
};

// OEE mock data for OEE Reports Tab
const OEE_MOCK_DATA = [
  { name: "08:00", Availability: 92, Performance: 95, Quality: 99, OEE: 86 },
  { name: "09:00", Availability: 90, Performance: 94, Quality: 99, OEE: 84 },
  { name: "10:00", Availability: 50, Performance: 88, Quality: 98, OEE: 43 }, // Downtime
  { name: "11:00", Availability: 85, Performance: 92, Quality: 99, OEE: 77 },
  { name: "12:00", Availability: 91, Performance: 95, Quality: 99, OEE: 85 },
  { name: "13:00", Availability: 88, Performance: 94, Quality: 99, OEE: 82 },
  { name: "14:00", Availability: 93, Performance: 96, Quality: 100, OEE: 89 },
  { name: "15:00", Availability: 92, Performance: 95, Quality: 99, OEE: 86 }
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("MAINTENANCE REPORTS");
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [prereqProgress, setPrereqProgress] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem("arizon_prereq_progress");
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });
  const [localMockReports, setLocalMockReports] = useState(() => {
    try {
      const saved = localStorage.getItem("arizon_reports");
      return saved ? JSON.parse(saved) : INITIAL_MOCK_REPORTS;
    } catch (e) {
      console.error("Failed to load reports from localStorage:", e);
      return INITIAL_MOCK_REPORTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("arizon_reports", JSON.stringify(localMockReports));
    } catch (e) {
      console.error("Failed to save reports to localStorage:", e);
    }
  }, [localMockReports]);

  // Filters state
  const [typeFilter, setTypeFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [machineFilter, setMachineFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeText, setDateRangeText] = useState("Date Range: 09 May 2026 - 08 Jun 2026");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Collapsible Row states (Inline Step Tracker)
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  // OEE Active Machine Filter
  const [oeeMachine, setOeeMachine] = useState("CADMACH");

  // Three-dot menu and analysis modal states
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [actionType, setActionType] = useState<"view" | "approve" | "cancel" | "chat" | "analysis" | null>(null);
  const [aiChatText, setAiChatText] = useState("");
  const [aiChatLog, setAiChatLog] = useState<{ sender: "user" | "ai"; text: string }[]>([]);

  // SOP Direct Performance Wizard state
  const [activePerfTask, setActivePerfTask] = useState<ReportItem | null>(null);
  const [perfStepIndex, setPerfStepIndex] = useState<number>(0);
  const [perfRemarks, setPerfRemarks] = useState("");
  const [perfQrVerified, setPerfQrVerified] = useState(false);
  const [perfAttachment, setPerfAttachment] = useState("");
  const [perfAttachmentUrl, setPerfAttachmentUrl] = useState("");
  const [perfScanning, setPerfScanning] = useState(false);

  // Part replacement states
  const [perfOldPartAttachment, setPerfOldPartAttachment] = useState("");
  const [perfOldPartAttachmentUrl, setPerfOldPartAttachmentUrl] = useState("");
  const [perfNewPartAttachment, setPerfNewPartAttachment] = useState("");
  const [perfNewPartAttachmentUrl, setPerfNewPartAttachmentUrl] = useState("");
  const [perfPartModalOpen, setPerfPartModalOpen] = useState(false);
  const [perfUploadTarget, setPerfUploadTarget] = useState<string>("standard");
  const [showPerfPrereqModal, setShowPerfPrereqModal] = useState<boolean>(false);
  const [viewPerfPrereqOnly, setViewPerfPrereqOnly] = useState<boolean>(false);

  const toggleCheck = (itemId: string) => {
    if (!activePerfTask) return;
    setPrereqProgress((prev) => {
      const taskProg = prev[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
      return {
        ...prev,
        [activePerfTask.id]: {
          ...taskProg,
          checked: {
            ...taskProg.checked,
            [itemId]: !taskProg.checked[itemId],
          },
        },
      };
    });
  };

  const removeAttachment = (itemId: string) => {
    if (!activePerfTask) return;
    setPrereqProgress((prev) => {
      const taskProg = prev[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
      const newAttachments = { ...taskProg.attachments };
      const newAttachmentUrls = { ...taskProg.attachmentUrls };
      delete newAttachments[itemId];
      delete newAttachmentUrls[itemId];
      return {
        ...prev,
        [activePerfTask.id]: {
          ...taskProg,
          attachments: newAttachments,
          attachmentUrls: newAttachmentUrls,
        },
      };
    });
  };


  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrVideoRef = useRef<HTMLVideoElement>(null);
  const qrStreamRef = useRef<MediaStream | null>(null);
  const qrAnimationRef = useRef<number | null>(null);

  // Lightbox & Webcam States
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [webcamModalOpen, setWebcamModalOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load schedules from localStorage
  const loadSchedules = () => {
    try {
      const savedSchedules = localStorage.getItem("arizon_schedules");
      if (savedSchedules) {
        setSchedules(JSON.parse(savedSchedules));
      }
    } catch (e) {
      console.error("Failed to load schedules from localStorage:", e);
    }
  };

  useEffect(() => {
    loadSchedules();
    window.addEventListener("storage", loadSchedules);
    return () => window.removeEventListener("storage", loadSchedules);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("arizon_prereq_progress", JSON.stringify(prereqProgress));
    } catch (e) {
      console.error("Failed to save prerequisite progress from Reports:", e);
    }
  }, [prereqProgress]);

  // Sync back schedule status changes to localStorage
  const updateScheduleStatus = (id: string, newStatus: ScheduleRow["status"], remarks?: string, progressData?: any) => {
    try {
      const savedSchedules = localStorage.getItem("arizon_schedules");
      const rows: ScheduleRow[] = savedSchedules ? JSON.parse(savedSchedules) : [];
      
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const updated = rows.map((row) => {
        if (row.id === id) {
          return {
            ...row,
            status: newStatus,
            completionDate: newStatus === "Approved" || newStatus === "Completed" ? todayStr : row.completionDate,
            remarks: remarks || row.remarks,
          };
        }
        return row;
      });
      localStorage.setItem("arizon_schedules", JSON.stringify(updated));
      setSchedules(updated);

      // If progressData is supplied, save to arizon_sop_progress
      if (progressData) {
        const savedProgress = localStorage.getItem("arizon_sop_progress");
        const prog = savedProgress ? JSON.parse(savedProgress) : {};
        prog[id] = progressData;
        localStorage.setItem("arizon_sop_progress", JSON.stringify(prog));
      }

      // Dispatch a storage event to alert other components (e.g., My Tasks)
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to update schedule status:", e);
    }
  };

  // Compile active report list based on selected tab
  const tabReports = useMemo(() => {
    if (activeTab === "AMC REPORTS") {
      // Return ALL tasks from schedules for AMC Reports: In Progress (Pending), Ready for Review (Performed), Reviewed (Approved/Completed), etc.
      const amcRows = schedules;

      const results: ReportItem[] = amcRows.map((row) => {
        let displayStatus: ReportItem["status"] = "In Progress";
        if (row.status === "Pending") displayStatus = "In Progress";
        else if (row.status === "Performed") displayStatus = "Ready for Review";
        else if (row.status === "Approved" || row.status === "Completed") displayStatus = "Reviewed";
        else if (row.status === "Overdue" || row.status === "Expired") displayStatus = "Expired";
        else if (row.status === "Cancelled") displayStatus = "Cancelled";

        // Load progress if it exists in localStorage
        let sopProgMock: any = {};
        if (row.sopTitle === "Annual Turret Service") {
          sopProgMock = {
            0: { remarks: "Cleaned all dirt and grease, gears are intact.", qrScanned: true, attachmentName: "" },
            1: { remarks: "Applied Grade 2 grease. Shaft rotation verified.", qrScanned: false, attachmentName: "greasing.png", attachmentUrl: image2 }
          };
        } else if (row.sopTitle === "Quarterly Drive Inspection") {
          sopProgMock = {
            0: { remarks: "Belt deflection is exactly 12mm.", qrScanned: true, attachmentName: "" },
            1: { remarks: "Safety door interlock works flawlessly.", qrScanned: false, attachmentName: "" },
            2: { remarks: "RPM panel is stable at 40 RPM.", qrScanned: true, attachmentName: "logs.png", attachmentUrl: image5 }
          };
        } else if (row.sopTitle === "Monthly Lubrication") {
          sopProgMock = {
            0: { remarks: "Verified reservoir is at 100% capacity.", qrScanned: true, attachmentName: "" },
            1: { remarks: "Greased bearings, wiped clean excess oil.", qrScanned: false, attachmentName: "" }
          };
        } else {
          sopProgMock = {
            0: { remarks: "Visual pre-check done.", qrScanned: true, attachmentName: "" },
            1: { remarks: "Lubricated bearings and tested gear rotation.", qrScanned: false, attachmentName: "grease_gun.png", attachmentUrl: image2 }
          };
        }

        try {
          const savedProgress = localStorage.getItem("arizon_sop_progress");
          if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            if (parsed[row.id]) {
              sopProgMock = parsed[row.id];
            }
          }
        } catch (_) {}

        return {
          id: row.id,
          title: row.sopTitle,
          performedOn: row.completionDate || row.scheduledDate || "—",
          doneBy: row.remarks?.includes("john") ? "john" : "Dibyanshu.Pandey",
          remarks: row.remarks || "",
          status: displayStatus,
          type: row.sopType || "Labour-only",
          machine: row.machine,
          steps: getSopSteps(row.machine, row.sopTitle),
          sopProgress: sopProgMock
        };
      });

      // Default fallback mock if schedule is empty
      if (results.length === 0) {
        return [
          {
            id: "amc-mock-1",
            title: "Annual Turret Service",
            performedOn: "05 Jun 2026",
            doneBy: "Dibyanshu.Pandey",
            remarks: "Turret gear alignment corrected. Backlash is within normal limits.",
            status: "Ready for Review",
            type: "Comprehensive",
            machine: "CADMACH",
            steps: getSopSteps("CADMACH", "Annual Turret Service"),
            sopProgress: {
              0: { remarks: "Cleaned all dirt and grease, gears are intact.", qrScanned: true, attachmentName: "" },
              1: { remarks: "Applied Grade 2 grease. Shaft rotation verified.", qrScanned: false, attachmentName: "greasing.png", attachmentUrl: image2 }
            }
          },
          {
            id: "amc-mock-2",
            title: "Quarterly Drive Inspection",
            performedOn: "12 May 2026",
            doneBy: "john",
            remarks: "Re-tensioned main belt and checked relay panel. Compliance checks pass.",
            status: "Reviewed",
            type: "Comprehensive",
            machine: "Korsch",
            steps: getSopSteps("Korsch", "Quarterly Drive Inspection"),
            sopProgress: {
              0: { remarks: "Belt deflection is exactly 12mm.", qrScanned: true, attachmentName: "" },
              1: { remarks: "Safety door interlock works flawlessly.", qrScanned: false, attachmentName: "" },
              2: { remarks: "RPM panel is stable at 40 RPM.", qrScanned: true, attachmentName: "logs.png", attachmentUrl: image5 }
            }
          },
          {
            id: "amc-mock-3",
            title: "Weekly Visual Inspection",
            performedOn: "—",
            doneBy: "Dibyanshu.Pandey",
            remarks: "",
            status: "In Progress",
            type: "Labour-only",
            machine: "Fette Compactin...",
            steps: getSopSteps("Fette Compactin...", "Weekly Visual Inspection"),
            sopProgress: {}
          }
        ];
      }
      return results;
    } else {
      return localMockReports[activeTab as Exclude<ReportTab, "OEE REPORTS" | "AMC REPORTS">] || [];
    }
  }, [activeTab, schedules, localMockReports]);

  // Handle unique filter items compile
  const filterOptions = useMemo(() => {
    const types = new Set<string>();
    const users = new Set<string>();
    const machines = new Set<string>();

    tabReports.forEach((r) => {
      if (r.type) types.add(r.type);
      if (r.doneBy) users.add(r.doneBy);
      if (r.machine) machines.add(r.machine);
    });

    return {
      types: ["All", ...Array.from(types)],
      users: ["All", ...Array.from(users)],
      machines: ["All", ...Array.from(machines)],
    };
  }, [tabReports]);

  // Reset filter selections when changing tabs
  useEffect(() => {
    setTypeFilter("All");
    setUserFilter("All");
    setMachineFilter("All");
    setSearchQuery("");
    setExpandedReportId(null);
    setCurrentPage(1);
  }, [activeTab]);

  // Apply filters and searches to tab reports list
  const filteredReports = useMemo(() => {
    return tabReports.filter((r) => {
      if (typeFilter !== "All" && r.type !== typeFilter) return false;
      if (userFilter !== "All" && r.doneBy !== userFilter) return false;
      if (machineFilter !== "All" && r.machine !== machineFilter) return false;
      if (
        searchQuery &&
        !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.doneBy.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tabReports, typeFilter, userFilter, machineFilter, searchQuery]);

  // Pagination indexing
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const paginatedReports = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIdx, startIdx + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  // Reset step index when expanding a new row
  const toggleRowExpansion = (id: string) => {
    if (expandedReportId === id) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(id);
      const report = paginatedReports.find((r) => r.id === id);
      if (report && report.type === "Comprehensive") {
        setSelectedStepIdx(-1);
      } else {
        setSelectedStepIdx(0);
      }
    }
  };

  // Perform SOP Direct Wizard actions
  const startPerformingTask = (report: ReportItem) => {
    setActivePerfTask(report);
    setPerfStepIndex(0);
    setPerfRemarks("");
    setPerfQrVerified(false);
    setPerfAttachment("");
    setPerfAttachmentUrl("");
    setPerfOldPartAttachment("");
    setPerfOldPartAttachmentUrl("");
    setPerfNewPartAttachment("");
    setPerfNewPartAttachmentUrl("");
    if (report.type === "Comprehensive") {
      setShowPerfPrereqModal(true);
    } else {
      setShowPerfPrereqModal(false);
    }
  };

  const syncPerfStepToState = () => {
    if (!activePerfTask) return;
    const taskProg = activePerfTask.sopProgress || {};
    const stepProg = taskProg[perfStepIndex] || { remarks: "", qrScanned: false, attachmentName: "", attachmentUrl: "", oldPartAttachmentName: "", oldPartAttachmentUrl: "", newPartAttachmentName: "", newPartAttachmentUrl: "" };
    setPerfRemarks(stepProg.remarks || "");
    setPerfQrVerified(stepProg.qrScanned || false);
    setPerfAttachment(stepProg.attachmentName || "");
    setPerfAttachmentUrl(stepProg.attachmentUrl || "");
    setPerfOldPartAttachment(stepProg.oldPartAttachmentName || "");
    setPerfOldPartAttachmentUrl(stepProg.oldPartAttachmentUrl || "");
    setPerfNewPartAttachment(stepProg.newPartAttachmentName || "");
    setPerfNewPartAttachmentUrl(stepProg.newPartAttachmentUrl || "");
  };

  useEffect(() => {
    if (activePerfTask) {
      syncPerfStepToState();
    }
  }, [perfStepIndex, activePerfTask]);

  const stopQrCamera = () => {
    if (qrAnimationRef.current) {
      cancelAnimationFrame(qrAnimationRef.current);
      qrAnimationRef.current = null;
    }
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach((track) => track.stop());
      qrStreamRef.current = null;
    }
    setPerfScanning(false);
  };

  const handleStartScanning = async () => {
    setPerfScanning(true);
    setPerfQrVerified(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      qrStreamRef.current = stream;
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream;
      }
      
      const scanFrame = () => {
        if (!activePerfTask) {
          stopQrCamera();
          return;
        }
        const video = qrVideoRef.current;
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });
            if (code) {
              const expectedTag = `${activePerfTask?.machine}-Verified`.toLowerCase().trim();
              const scannedText = code.data.toLowerCase().trim();
              if (scannedText === expectedTag || scannedText.includes(activePerfTask?.machine?.toLowerCase() || "")) {
                setPerfQrVerified(true);
                stopQrCamera();
                return;
              }
            }
          }
        }
        qrAnimationRef.current = requestAnimationFrame(scanFrame);
      };
      
      qrAnimationRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      console.warn("Could not start QR camera stream in ReportsPage:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (perfUploadTarget.startsWith("prereq-")) {
        const prereqId = perfUploadTarget.substring("prereq-".length);
        if (activePerfTask) {
          setPrereqProgress((prev) => {
            const taskProg = prev[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
            return {
              ...prev,
              [activePerfTask.id]: {
                ...taskProg,
                attachments: { ...taskProg.attachments, [prereqId]: file.name },
                attachmentUrls: { ...taskProg.attachmentUrls, [prereqId]: URL.createObjectURL(file) }
              }
            };
          });
        }
      } else if (perfUploadTarget === "old") {
        setPerfOldPartAttachment(file.name);
        setPerfOldPartAttachmentUrl(URL.createObjectURL(file));
      } else if (perfUploadTarget === "new") {
        setPerfNewPartAttachment(file.name);
        setPerfNewPartAttachmentUrl(URL.createObjectURL(file));
      } else {
        setPerfAttachment(file.name);
        setPerfAttachmentUrl(URL.createObjectURL(file));
      }
    }
  };

  const startCamera = async () => {
    setWebcamModalOpen(true);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Webcam access failed or denied, using simulation.", err);
      }
    }, 100);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamModalOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/png");
          if (perfUploadTarget.startsWith("prereq-")) {
            const prereqId = perfUploadTarget.substring("prereq-".length);
            if (activePerfTask) {
              setPrereqProgress((prev) => {
                const taskProg = prev[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
                return {
                  ...prev,
                  [activePerfTask.id]: {
                    ...taskProg,
                    attachments: { ...taskProg.attachments, [prereqId]: `prereq-snap-${Date.now()}.png` },
                    attachmentUrls: { ...taskProg.attachmentUrls, [prereqId]: dataUrl }
                  }
                };
              });
            }
          } else if (perfUploadTarget === "old") {
            setPerfOldPartAttachmentUrl(dataUrl);
            setPerfOldPartAttachment(`old-part-snap-${Date.now()}.png`);
          } else if (perfUploadTarget === "new") {
            setPerfNewPartAttachmentUrl(dataUrl);
            setPerfNewPartAttachment(`new-part-snap-${Date.now()}.png`);
          } else {
            setPerfAttachmentUrl(dataUrl);
            setPerfAttachment(`snap-${Date.now()}.png`);
          }
        }
      } catch (e) {
        if (perfUploadTarget.startsWith("prereq-")) {
          const prereqId = perfUploadTarget.substring("prereq-".length);
          if (activePerfTask) {
            setPrereqProgress((prev) => {
              const taskProg = prev[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
              return {
                ...prev,
                [activePerfTask.id]: {
                  ...taskProg,
                  attachments: { ...taskProg.attachments, [prereqId]: `mock-prereq-snap-${Date.now()}.png` },
                  attachmentUrls: { ...taskProg.attachmentUrls, [prereqId]: image1 }
                }
              };
            });
          }
        } else if (perfUploadTarget === "old") {
          setPerfOldPartAttachmentUrl(image1);
          setPerfOldPartAttachment(`mock-old-snap-${Date.now()}.png`);
        } else if (perfUploadTarget === "new") {
          setPerfNewPartAttachmentUrl(image1);
          setPerfNewPartAttachment(`mock-new-snap-${Date.now()}.png`);
        } else {
          setPerfAttachmentUrl(image1);
          setPerfAttachment(`mock-snap-${Date.now()}.png`);
        }
      }
    } else {
      if (perfUploadTarget.startsWith("prereq-")) {
        const prereqId = perfUploadTarget.substring("prereq-".length);
        if (activePerfTask) {
          setPrereqProgress((prev) => {
            const taskProg = prev[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
            return {
              ...prev,
              [activePerfTask.id]: {
                ...taskProg,
                attachments: { ...taskProg.attachments, [prereqId]: `mock-prereq-snap-${Date.now()}.png` },
                attachmentUrls: { ...taskProg.attachmentUrls, [prereqId]: image1 }
              }
            };
          });
        }
      } else if (perfUploadTarget === "old") {
        setPerfOldPartAttachmentUrl(image1);
        setPerfOldPartAttachment(`mock-old-snap-${Date.now()}.png`);
      } else if (perfUploadTarget === "new") {
        setPerfNewPartAttachmentUrl(image1);
        setPerfNewPartAttachment(`mock-new-snap-${Date.now()}.png`);
      } else {
        setPerfAttachmentUrl(image1);
        setPerfAttachment(`mock-snap-${Date.now()}.png`);
      }
    }
    stopCamera();
  };

  const handleSavePerfStep = () => {
    if (!activePerfTask) return;
    const steps = activePerfTask.steps || defaultSopSteps;
    const isLastStep = perfStepIndex === steps.length - 1;

    const updatedProg = {
      ...(activePerfTask.sopProgress || {}),
      [perfStepIndex]: {
        remarks: perfRemarks,
        qrScanned: perfQrVerified,
        attachmentName: perfAttachment,
        attachmentUrl: perfAttachmentUrl,
        oldPartAttachmentName: perfOldPartAttachment,
        oldPartAttachmentUrl: perfOldPartAttachmentUrl,
        newPartAttachmentName: perfNewPartAttachment,
        newPartAttachmentUrl: perfNewPartAttachmentUrl,
      }
    };

    const nextTask = {
      ...activePerfTask,
      sopProgress: updatedProg,
    };

    setActivePerfTask(nextTask);

    if (isLastStep) {
      // Submit performed task
      const elapsedSeconds = Math.floor(Math.random() * (360 - 120 + 1) + 120);
      const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const completeRemarks = `SOP completed in ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s by operator.`;

      if (activePerfTask.id.startsWith("amc-") && !activePerfTask.id.startsWith("amc-mock")) {
        // Dynamic AMC
        updateScheduleStatus(activePerfTask.id, "Performed", completeRemarks, updatedProg);
      } else {
        // Mock list update
        const tab = activeTab as Exclude<ReportTab, "OEE REPORTS" | "AMC REPORTS">;
        const currentMockList = localMockReports[tab];
        if (currentMockList) {
          const updatedList = currentMockList.map((item) => {
            if (item.id === activePerfTask.id) {
              return {
                ...item,
                status: "Ready for Review" as const,
                performedOn: today,
                remarks: completeRemarks,
                sopProgress: updatedProg,
              };
            }
            return item;
          });
          setLocalMockReports({
            ...localMockReports,
            [tab]: updatedList
          });
        }
      }
      setActivePerfTask(null);
    } else {
      setPerfStepIndex((prev) => prev + 1);
    }
  };

  // Menu action handlers
  const handleApproveReport = (id: string) => {
    if (id.startsWith("amc-") && !id.startsWith("amc-mock")) {
      updateScheduleStatus(id, "Approved", "Reviewed and signed off by supervisor.");
    } else {
      const tab = activeTab as Exclude<ReportTab, "OEE REPORTS" | "AMC REPORTS">;
      const currentList = localMockReports[tab];
      if (currentList) {
        setLocalMockReports({
          ...localMockReports,
          [tab]: currentList.map((r) => (r.id === id ? { ...r, status: "Reviewed" as const } : r))
        });
      }
    }
    setActionType(null);
    setSelectedReport(null);
  };

  const handleRejectReport = (id: string) => {
    if (id.startsWith("amc-") && !id.startsWith("amc-mock")) {
      updateScheduleStatus(id, "Cancelled", "Rejected and cancelled by supervisor.");
    } else {
      const tab = activeTab as Exclude<ReportTab, "OEE REPORTS" | "AMC REPORTS">;
      const currentList = localMockReports[tab];
      if (currentList) {
        setLocalMockReports({
          ...localMockReports,
          [tab]: currentList.map((r) => (r.id === id ? { ...r, status: "Cancelled" as const } : r))
        });
      }
    }
    setActionType(null);
    setSelectedReport(null);
  };

  const handleDeleteReport = (id: string) => {
    if (id.startsWith("amc-") && !id.startsWith("amc-mock")) {
      // Delete dynamic schedule
      const savedSchedules = localStorage.getItem("arizon_schedules");
      const rows: ScheduleRow[] = savedSchedules ? JSON.parse(savedSchedules) : [];
      const filtered = rows.filter((r) => r.id !== id);
      localStorage.setItem("arizon_schedules", JSON.stringify(filtered));
      setSchedules(filtered);
      window.dispatchEvent(new Event("storage"));
    } else {
      const tab = activeTab as Exclude<ReportTab, "OEE REPORTS" | "AMC REPORTS">;
      const currentList = localMockReports[tab];
      if (currentList) {
        setLocalMockReports({
          ...localMockReports,
          [tab]: currentList.filter((r) => r.id !== id)
        });
      }
    }
    setActionType(null);
    setSelectedReport(null);
  };

  // Open AI Chat with pre-loaded logs
  const openAiChat = (report: ReportItem) => {
    setSelectedReport(report);
    setActionType("chat");
    setAiChatLog([
      {
        sender: "ai",
        text: `Hello! I am your Arizon AI assistant. I have analyzed the report "${report.title}" completed by ${report.doneBy} on ${report.performedOn}.\n\nHere are some key metrics:\n- Compliance: ${report.status === "Reviewed" ? "100% Verified" : "Awaiting Sign-off"}\n- Machine: ${report.machine}\n- Remarks: ${report.remarks || "No anomalies flagged."}\n\nWhat would you like to analyze?`
      }
    ]);
    setAiChatText("");
  };

  const handleSendAiMessage = () => {
    if (!aiChatText.trim() || !selectedReport) return;
    const userMsg = aiChatText;
    setAiChatLog((prev) => [...prev, { sender: "user", text: userMsg }]);
    setAiChatText("");

    setTimeout(() => {
      let responseText = `Regarding your query about "${selectedReport.title}": `;
      if (userMsg.toLowerCase().includes("time") || userMsg.toLowerCase().includes("duration")) {
        responseText += `The tasks were executed efficiently in approximately 5 minutes. This is well within the threshold limit of 8 minutes.`;
      } else if (userMsg.toLowerCase().includes("remark") || userMsg.toLowerCase().includes("problem")) {
        responseText += `The operator reported: "${selectedReport.remarks || "No abnormalities noted. Workspace is clean and verified."}". No compliance blocks were detected.`;
      } else if (userMsg.toLowerCase().includes("photo") || userMsg.toLowerCase().includes("attachment")) {
        responseText += `A photo proof check shows a correctly attached image. Visual verification tags matched: "${selectedReport.machine}-Verified".`;
      } else {
        responseText += `Our compliance analysis confirms that all mandatory SOP steps were performed in sequence. QR tag scanning was successfully verified, and required remarks are fully logged. The report is clean.`;
      }
      setAiChatLog((prev) => [...prev, { sender: "ai", text: responseText }]);
    }, 1000);
  };

  const getStatusStyle = (status: ReportItem["status"]) => {
    switch (status) {
      case "Reviewed":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "Ready for Review":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "In Progress":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Expired":
        return "bg-red-100 text-red-700 border border-red-200";
      case "Cancelled":
        return "bg-gray-150 text-gray-600 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="px-2">
      {/* Horizontal Tabs Navigation */}
      <div className="flex border-b border-gray-250 overflow-x-auto gap-8 mb-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs tracking-wider font-semibold whitespace-nowrap transition-colors outline-none cursor-pointer ${
                isActive
                  ? "border-b-2 border-[#3A5764] text-[#3a5764]"
                  : "text-gray-400 hover:text-gray-650"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Reports Display Card */}
      {activeTab === "OEE REPORTS" ? (
        /* Render OEE Reports timeline chart */
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900 font-semibold text-xl">Overall Equipment Effectiveness (OEE) Reports</h2>
            <div className="relative">
              <label className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500 font-medium" style={{ fontSize: "10px" }}>
                Select Machine
              </label>
              <select
                value={oeeMachine}
                onChange={(e) => setOeeMachine(e.target.value)}
                className="appearance-none min-w-[170px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none focus:border-[#3A5764] text-sm"
              >
                <option value="CADMACH">CADMACH</option>
                <option value="Korsch">Korsch</option>
                <option value="Fette Compacting">Fette Compacting</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">OEE Score</span>
              <span className="text-[#3A5764] text-3xl font-bold">{oeeMachine === "CADMACH" ? "84.5%" : oeeMachine === "Korsch" ? "79.8%" : "72.4%"}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Availability</span>
              <span className="text-blue-500 text-2xl font-semibold">{oeeMachine === "CADMACH" ? "90.0%" : oeeMachine === "Korsch" ? "86.5%" : "81.0%"}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Performance</span>
              <span className="text-amber-500 text-2xl font-semibold">{oeeMachine === "CADMACH" ? "95.0%" : oeeMachine === "Korsch" ? "92.4%" : "89.5%"}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Quality</span>
              <span className="text-emerald-500 text-2xl font-semibold">99.2%</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-gray-800 text-sm font-semibold mb-4">Utilization Timeline Chart</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={OEE_MOCK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3A5764" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3A5764" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="OEE" stroke="#3A5764" strokeWidth={2} fillOpacity={1} fill="url(#colorOee)" />
                  <Area type="monotone" dataKey="Availability" stroke="#3B82F6" strokeWidth={1} fill="transparent" strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Report Lists Grid Layout */
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm">
          {/* Filters Bar Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
            <div className="relative">
              <label className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500 font-medium" style={{ fontSize: "10px" }}>
                Search
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Title, performed by..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 outline-none focus:border-[#3A5764] text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Date Range Picker (Mocked Selector) */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:border-[#3A5764] transition-colors outline-none cursor-pointer text-sm"
                >
                  <Calendar size={14} className="text-gray-400" />
                  <span>{dateRangeText}</span>
                  <ChevronDown size={12} className="text-gray-400 ml-1" />
                </button>

                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-30 min-w-[280px]">
                    <div className="text-xs font-semibold text-gray-750 mb-2 px-1">Select Date Range</div>
                    <div className="flex flex-col gap-1">
                      {[
                        { label: "Today (08 Jun 2026)", text: "Date Range: 08 Jun 2026 - 08 Jun 2026" },
                        { label: "Last 7 Days", text: "Date Range: 02 Jun 2026 - 08 Jun 2026" },
                        { label: "Last 30 Days (Mockup default)", text: "Date Range: 09 May 2026 - 08 Jun 2026" },
                        { label: "Last 3 Months", text: "Date Range: 08 Mar 2026 - 08 Jun 2026" },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setDateRangeText(opt.text);
                            setShowDatePicker(false);
                          }}
                          className="text-left w-full text-xs text-gray-700 hover:bg-gray-50 px-2 py-1.5 rounded transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Select Type Dropdown */}
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500 font-medium" style={{ fontSize: "10px" }}>
                  Select Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none min-w-[120px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:border-[#3A5764] text-sm"
                >
                  {filterOptions.types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Select User Dropdown */}
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500 font-medium" style={{ fontSize: "10px" }}>
                  Select User
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => {
                    setUserFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none min-w-[110px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:border-[#3A5764] text-sm"
                >
                  {filterOptions.users.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Select Machine Dropdown */}
              <div className="relative">
                <label className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500 font-medium" style={{ fontSize: "10px" }}>
                  Select Machine
                </label>
                <select
                  value={machineFilter}
                  onChange={(e) => {
                    setMachineFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none min-w-[125px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:border-[#3A5764] text-sm"
                >
                  {filterOptions.machines.map((mac) => (
                    <option key={mac} value={mac}>
                      {mac}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Table representing all reports */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3A5764]/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3A5764]">
              
              {/* Header */}
              <div className="grid grid-cols-[30px_1.5fr_1fr_1fr_1.8fr_1.1fr_1fr] gap-4 px-6 py-4 bg-gray-100 text-gray-600 font-semibold min-w-[950px] text-xs uppercase tracking-wider">
                <div></div>
                <div>Title</div>
                <div>Performed on</div>
                <div>Done By</div>
                <div>Remarks</div>
                <div>Status</div>
                <div className="text-right pr-4">Actions</div>
              </div>

              {/* Rows */}
              {filteredReports.length === 0 ? (
                <div className="px-6 py-14 text-center text-gray-500 text-sm">
                  No completed reports match active filters.
                </div>
              ) : (
                paginatedReports.map((report) => {
                  const isExpanded = expandedReportId === report.id;
                  const steps = report.steps || defaultSopSteps;
                  const step = steps[selectedStepIdx] || steps[0];
                  
                  return (
                    <div key={report.id} className="border-t border-gray-100">
                      
                      {/* Standard Report Row */}
                      <div className="grid grid-cols-[30px_1.5fr_1fr_1fr_1.8fr_1.1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-gray-50/50 min-w-[950px] text-sm">
                        
                        {/* Chevron Collapse Trigger */}
                        <button
                          onClick={() => toggleRowExpansion(report.id)}
                          className="text-gray-400 hover:text-[#3A5764] cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <div className="text-gray-900 font-semibold">{report.title}</div>
                        <div className="text-gray-750">{report.performedOn}</div>
                        <div className="text-gray-750 font-medium">{report.doneBy}</div>
                        <div className="text-gray-600 truncate" title={report.remarks}>
                          {report.remarks || "—"}
                        </div>
                        
                        {/* Status badge */}
                        <div>
                          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded ${getStatusStyle(report.status)}`}>
                            {report.status}
                          </span>
                        </div>

                        {/* Actions Menu */}
                        <div className="flex items-center justify-end gap-2.5 text-gray-400">
                          {/* Direct Actions based on status */}
                          {report.status === "In Progress" && (
                            <button
                              onClick={() => startPerformingTask(report)}
                              title="Perform SOP"
                              className="hover:text-amber-600 transition-colors p-1"
                            >
                              <Play size={15} />
                            </button>
                          )}
                          
                          {report.status === "Ready for Review" && (
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setActionType("approve");
                              }}
                              title="Approve Report"
                              className="hover:text-emerald-500 transition-colors p-1"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}

                          <button
                            onClick={() => toggleRowExpansion(report.id)}
                            title="Inspect step details"
                            className="hover:text-[#3A5764] transition-colors p-1"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Kebab Action Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="hover:text-gray-700 transition-colors p-1 outline-none cursor-pointer">
                                <MoreVertical size={15} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-left">
                              {report.status === "In Progress" && (
                                <DropdownMenuItem
                                  onClick={() => startPerformingTask(report)}
                                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-amber-50 text-amber-600 text-xs font-semibold"
                                >
                                  <Play size={12} />
                                  <span>Perform SOP</span>
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem
                                onClick={() => openAiChat(report)}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-gray-750 text-xs font-semibold"
                              >
                                <MessageSquare size={12} className="text-[#3A5764]" />
                                <span>AI Chat & Analysis</span>
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionType("analysis");
                                }}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-gray-750 text-xs font-semibold"
                              >
                                <BarChart2 size={12} className="text-purple-500" />
                                <span>Analysis Report</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  alert(`Downloading PDF report for ${report.title}...`);
                                }}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-gray-750 text-xs font-semibold"
                              >
                                <Download size={12} />
                                <span>Download PDF</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report);
                                  setActionType("cancel");
                                }}
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-red-50 text-red-500 text-xs font-semibold"
                              >
                                <Trash2 size={12} />
                                <span>Delete Report</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                      </div>

                      {/* Collapsible Section: Inline Step Tracker */}
                      {isExpanded && (
                        <div className="border-t border-gray-150 bg-gray-50/50 p-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 animate-in slide-in-from-top-2 duration-200 min-w-[950px]">
                          
                          {/* Left Sidebar: Step Indicators */}
                          <div className="flex flex-col gap-2 border-r border-gray-200 pr-4">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">SOP Steps Checklist</span>
                            {report.type === "Comprehensive" && (
                              <button
                                onClick={() => setSelectedStepIdx(-1)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs font-semibold transition-all cursor-pointer mb-1 ${
                                  selectedStepIdx === -1
                                    ? "bg-[#3A5764] text-white shadow"
                                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
                                <span className="truncate">📋 Prerequisites</span>
                              </button>
                            )}
                            {steps.map((st, idx) => {
                              // A step is complete if remarks are logged or status is Completed/Reviewed/Ready for Review
                              const stepRemarksLogged = report.sopProgress?.[idx]?.remarks?.trim();
                              const isStepComplete = !!(stepRemarksLogged || report.status === "Reviewed" || report.status === "Ready for Review");

                              return (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedStepIdx(idx)}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs font-semibold transition-all cursor-pointer ${
                                    selectedStepIdx === idx
                                      ? "bg-[#3A5764] text-white shadow"
                                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isStepComplete ? "bg-emerald-500" : "bg-rose-400 animate-pulse"}`} />
                                  <span className="truncate">Step {idx + 1}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Right Panel: Step Inspection Details */}
                          <div className="flex flex-col gap-4 bg-white rounded-lg border border-gray-200 p-5 shadow-inner">
                            {selectedStepIdx === -1 ? (() => {
                              const items = getPrereqsForSop(report.machine, report.title);
                              const taskProg = prereqProgress[report.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };

                              return (
                                <div className="flex flex-col gap-4">
                                  <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                                    <div>
                                      <h4 className="text-gray-900 font-bold text-sm">
                                        AMC Prerequisites & Consumables Check-in Details
                                      </h4>
                                      <span className="text-xs text-gray-500 mt-1 block">
                                        Verified compliance checklists before performing SOP.
                                      </span>
                                    </div>
                                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-150">
                                      Compliance Verified
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    {items.map((item) => {
                                      const isChecked = !!taskProg.checked[item.id];
                                      const attachmentName = taskProg.attachments[item.id];
                                      const attachmentUrl = taskProg.attachmentUrls[item.id];

                                      return (
                                        <div key={item.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-2.5 shadow-sm">
                                          <div className="flex justify-between items-center">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                              item.category === "Tooling" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                              item.category === "Consumables" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                              item.category === "Safety" ? "bg-red-50 text-red-700 border border-red-200" :
                                              "bg-purple-50 text-purple-700 border border-purple-200"
                                            }`}>
                                              {item.category}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-mono">ID: {item.tag}</span>
                                          </div>
                                          
                                          <div>
                                            <h5 className="text-gray-800 font-bold text-xs">{item.name}</h5>
                                            <p className="text-gray-505 text-[11px] mt-0.5 leading-relaxed">{item.description}</p>
                                          </div>

                                          <div className="mt-2 pt-2 border-t border-gray-150 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/50 border border-emerald-100 rounded px-2 py-0.5">
                                              <Check size={11} /> Verified Ready
                                            </span>

                                            {attachmentName ? (
                                              <div 
                                                className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1 cursor-pointer hover:bg-blue-100 transition-colors shrink-0 max-w-[150px]"
                                                onClick={() => {
                                                  if (attachmentUrl) setEnlargedImage(attachmentUrl);
                                                }}
                                              >
                                                {attachmentUrl ? (
                                                  <img src={attachmentUrl} className="w-5 h-5 object-cover rounded border border-blue-200 shrink-0" alt="Prereq" />
                                                ) : (
                                                  <FileText size={10} className="text-blue-500 shrink-0" />
                                                )}
                                                <span className="truncate">{attachmentName}</span>
                                              </div>
                                            ) : (
                                              <span className="text-[10px] text-gray-400 italic">No photo evidence</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })() : (
                              <>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-gray-900 font-bold text-sm">{step.title}</h4>
                                    {step.type && (
                                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase ${
                                        step.type === "critical"
                                          ? "bg-red-100 text-red-700"
                                          : step.type === "camera"
                                          ? "bg-blue-100 text-blue-700"
                                          : step.type === "info"
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-gray-200 text-gray-750"
                                      }`}>
                                        {step.type}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    Tolerance: <span className="font-semibold text-gray-800">{step.tolerance || "N/A"}</span>
                                  </span>
                                </div>

                                {step.desc && (
                                  <div className="text-gray-650 bg-gray-50 rounded p-3 text-xs leading-relaxed border border-gray-100">
                                    <strong>Instruction:</strong> {step.desc}
                                  </div>
                                )}

                                {/* Media & Done details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  
                                  {/* Step Media */}
                                  <div className="relative aspect-[4/3] w-full rounded overflow-hidden bg-black flex items-center justify-center border border-gray-200">
                                    <img src={step.mediaUrl} className="object-cover w-full h-full opacity-90" alt="Instruction media" />
                                  </div>

                                  {/* Performed verification details */}
                                  <div className="flex flex-col gap-3 justify-between">
                                    <div className="flex flex-col gap-3">
                                      {/* QR Code Verification */}
                                      <div>
                                        <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">QR Verification Tag</span>
                                        {report.sopProgress?.[selectedStepIdx]?.qrScanned || report.status === "Reviewed" || report.status === "Ready for Review" ? (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-xs font-semibold">
                                            <Check size={12} /> {report.machine}-Verified Tag Match
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded text-xs">
                                            Pending / Not Scanned
                                          </span>
                                        )}
                                      </div>

                                      {/* Photo Attachment Proof */}
                                      <div>
                                        <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                                          {step?.isPartChange ? "Part Replacement Evidence" : "Attached Photo Proof"}
                                        </span>
                                        {step?.isPartChange ? (
                                          <div className="flex flex-col gap-2">
                                            {report.sopProgress?.[selectedStepIdx]?.oldPartAttachmentName ? (
                                              <div 
                                                className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-100 rounded p-1.5 cursor-pointer hover:bg-amber-100 transition-colors"
                                                onClick={() => {
                                                  if (report.sopProgress?.[selectedStepIdx]?.oldPartAttachmentUrl) {
                                                    setEnlargedImage(report.sopProgress[selectedStepIdx].oldPartAttachmentUrl);
                                                  }
                                                }}
                                              >
                                                <img src={report.sopProgress[selectedStepIdx].oldPartAttachmentUrl || image1} className="w-8 h-8 object-cover rounded border border-amber-200 shrink-0" alt="Old Part" />
                                                <span className="truncate"><strong>Old Part:</strong> {report.sopProgress[selectedStepIdx].oldPartAttachmentName}</span>
                                              </div>
                                            ) : (
                                              <span className="text-xs text-gray-400 italic">No old part evidence uploaded</span>
                                            )}
                                            {report.sopProgress?.[selectedStepIdx]?.newPartAttachmentName ? (
                                              <div 
                                                className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 rounded p-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                                                onClick={() => {
                                                  if (report.sopProgress?.[selectedStepIdx]?.newPartAttachmentUrl) {
                                                    setEnlargedImage(report.sopProgress[selectedStepIdx].newPartAttachmentUrl);
                                                  }
                                                }}
                                              >
                                                <img src={report.sopProgress[selectedStepIdx].newPartAttachmentUrl || image1} className="w-8 h-8 object-cover rounded border border-emerald-200 shrink-0" alt="New Part" />
                                                <span className="truncate"><strong>New Part:</strong> {report.sopProgress[selectedStepIdx].newPartAttachmentName}</span>
                                              </div>
                                            ) : (
                                              <span className="text-xs text-gray-400 italic">No new part evidence uploaded</span>
                                            )}
                                          </div>
                                        ) : report.sopProgress?.[selectedStepIdx]?.attachmentName ? (
                                          <div 
                                            className="flex items-center gap-2 text-xs font-medium text-blue-650 bg-blue-50 border border-blue-100 rounded p-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
                                            onClick={() => {
                                              if (report.sopProgress?.[selectedStepIdx]?.attachmentUrl) {
                                                setEnlargedImage(report.sopProgress[selectedStepIdx].attachmentUrl);
                                              }
                                            }}
                                          >
                                            <img src={report.sopProgress[selectedStepIdx].attachmentUrl || image1} className="w-8 h-8 object-cover rounded border border-blue-200 shrink-0" alt="Thumbnail" />
                                            <span className="truncate">{report.sopProgress[selectedStepIdx].attachmentName}</span>
                                          </div>
                                        ) : (
                                          <span className="text-xs text-gray-400 italic">No attachment required/uploaded</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Remarks */}
                                    <div>
                                      <span className="text-[11px] font-bold uppercase text-gray-400 block mb-1">Step Remarks</span>
                                      <div className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-700 italic min-h-[50px]">
                                        {report.sopProgress?.[selectedStepIdx]?.remarks || "No remarks entered for this step."}
                                      </div>
                                    </div>
                                  </div>

                                  {report.status === "Ready for Review" && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleRejectReport(report.id)}
                                        className="flex-1 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 rounded text-xs font-bold transition-all"
                                      >
                                        Reject
                                      </button>
                                      <button
                                        onClick={() => handleApproveReport(report.id)}
                                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-all"
                                      >
                                        Approve
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })
              )}

            </div>
          </div>

          {/* Table Pagination */}
          {filteredReports.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-gray-600" style={{ fontSize: "13px" }}>
              <div className="flex items-center gap-2">
                <span>Reports per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-[#3A5764]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              
              <div className="flex items-center gap-4">
                <span>
                  {Math.min(filteredReports.length, (currentPage - 1) * pageSize + 1)}-
                  {Math.min(filteredReports.length, currentPage * pageSize)} of {filteredReports.length}
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded hover:bg-white text-gray-500 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1 rounded hover:bg-white text-gray-500 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Action Dialog Overlay Modals */}
      {selectedReport && actionType && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-semibold text-lg">
                {actionType === "approve" && "Confirm Approve Report"}
                {actionType === "cancel" && "Confirm Delete Report"}
                {actionType === "analysis" && "AI Analysis & Compliance Report"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedReport(null);
                  setActionType(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {actionType === "approve" && (
                <p className="text-gray-650 leading-relaxed text-sm">
                  Are you sure you want to review and <strong className="text-green-600">approve</strong> the report for{" "}
                  <strong className="text-gray-800">{selectedReport.title}</strong> performed by{" "}
                  <strong className="text-gray-800">{selectedReport.doneBy}</strong>? This will set status to Reviewed.
                </p>
              )}
              
              {actionType === "cancel" && (
                <p className="text-gray-650 leading-relaxed text-sm">
                  Are you sure you want to permanently <strong className="text-red-500">delete</strong> the report record for{" "}
                  <strong className="text-gray-800">{selectedReport.title}</strong>? This action cannot be undone.
                </p>
              )}

              {actionType === "analysis" && (
                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-2 p-3 bg-purple-50 text-purple-750 border border-purple-100 rounded-lg">
                    <Brain size={18} className="animate-pulse" />
                    <span className="font-bold">Arizon AI Compliance Score: 98%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-gray-50 border border-gray-150 rounded p-2.5">
                      <span className="text-gray-400 block uppercase tracking-wider mb-1" style={{ fontSize: "9px" }}>Execution Speed</span>
                      <span className="text-gray-800 font-bold text-sm">5m 24s (Optimal)</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-150 rounded p-2.5">
                      <span className="text-gray-400 block uppercase tracking-wider mb-1" style={{ fontSize: "9px" }}>Remarks Length</span>
                      <span className="text-gray-800 font-bold text-sm">Satisfactory</span>
                    </div>
                  </div>
                  <div className="text-gray-650 leading-relaxed text-sm bg-gray-50 border border-gray-200 rounded p-3 shadow-inner">
                    <strong className="text-gray-800 block mb-1">AI Execution Summary:</strong>
                    The operator successfully traversed all steps in sequence. Scan verification tags matched within 12 seconds of starting step 2. Photo attachment quality is clear and details gear lubrication. Highly compliant performance, sign-off is recommended.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedReport(null);
                  setActionType(null);
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-xs"
              >
                Cancel
              </button>

              {actionType === "approve" && (
                <button
                  type="button"
                  onClick={() => handleApproveReport(selectedReport.id)}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors text-xs font-semibold shadow-sm"
                >
                  Approve Report
                </button>
              )}

              {actionType === "cancel" && (
                <button
                  type="button"
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="px-5 py-2 bg-red-500 hover:bg-red-650 text-white rounded-md transition-colors text-xs font-semibold shadow-sm"
                >
                  Yes, Delete
                </button>
              )}

              {actionType === "analysis" && (
                <button
                  type="button"
                  onClick={() => openAiChat(selectedReport)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-xs font-bold flex items-center gap-1 shadow"
                >
                  <MessageSquare size={13} /> Chat with AI
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Dialog Modal */}
      {selectedReport && actionType === "chat" && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#3A5764] text-white">
              <div className="flex items-center gap-2">
                <Brain size={18} />
                <div>
                  <h3 className="font-semibold text-sm">Arizon AI Analysis Assistant</h3>
                  <span className="text-[10px] text-white/70 block">Analyzing: {selectedReport.title}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActionType(null);
                  setSelectedReport(null);
                }}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Logs */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] bg-gray-50">
              {aiChatLog.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3.5 text-xs leading-relaxed shadow-sm ${
                      chat.sender === "user"
                        ? "bg-[#3A5764] text-white rounded-tr-none"
                        : "bg-white border border-gray-250 text-gray-800 rounded-tl-none"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {chat.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-2 items-center">
              <input
                type="text"
                placeholder="Ask AI about report compliance, speed, or remarks..."
                value={aiChatText}
                onChange={(e) => setAiChatText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendAiMessage();
                }}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#3A5764] text-xs"
              />
              <button
                onClick={handleSendAiMessage}
                disabled={!aiChatText.trim()}
                className="w-9 h-9 rounded-lg bg-[#3A5764] hover:bg-[#2f4a55] text-white flex items-center justify-center disabled:opacity-40 disabled:hover:bg-[#3A5764] transition-all cursor-pointer shadow"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Prerequisites Modal for Reports Direct Performance Wizard */}
      {activePerfTask && ((showPerfPrereqModal && activePerfTask.status === "In Progress") || viewPerfPrereqOnly) && (() => {
        const items = getPrereqsForSop(activePerfTask.machine, activePerfTask.title);
        const taskProg = prereqProgress[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
        const isPrereqReadOnly = viewPerfPrereqOnly || activePerfTask.status !== "In Progress";
        const allChecked = items.every(item => !item.required || taskProg.checked[item.id]);

        return (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-8">
              {/* Header */}
              <div className="px-8 py-5 bg-gradient-to-r from-[#3A5764] to-[#2f4a55] text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-wide">
                    {isPrereqReadOnly ? "Comprehensive AMC Prerequisites (Read-Only)" : "Comprehensive AMC Prerequisites"}
                  </h2>
                  <p className="text-xs text-gray-200 mt-1">
                    Verify required tools, safety equipment, consumables, and calibrations for <span className="font-semibold underline">{activePerfTask.machine}</span>.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (viewPerfPrereqOnly) {
                      setViewPerfPrereqOnly(false);
                    } else {
                      setActivePerfTask(null);
                      setShowPerfPrereqModal(false);
                    }
                  }}
                  className="text-gray-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 bg-gray-50/50 flex-1 overflow-y-auto max-h-[60vh] [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3A5764]/60 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                  <div className="shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-bold">Compliance Directive:</span> All items below must be physically verified at the station. Uploading photos of the ID tags or calibration stickers is recommended.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                  {items.map((item) => {
                    const isChecked = !!taskProg.checked[item.id];
                    const attachmentName = taskProg.attachments[item.id];
                    const attachmentUrl = taskProg.attachmentUrls[item.id];

                    return (
                      <div key={item.id} className={`border rounded-xl p-5 flex flex-col bg-white transition-all shadow-sm ${isChecked ? 'border-emerald-300 ring-1 ring-emerald-300/30' : 'border-gray-200 hover:border-gray-300'}`}>
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.category === "Tooling" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            item.category === "Consumables" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            item.category === "Safety" ? "bg-red-50 text-red-700 border border-red-200" :
                            "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono font-semibold">ID: {item.tag}</span>
                        </div>

                        {/* Title and description */}
                        <h3 className="text-gray-900 font-bold text-sm leading-snug">{item.name}</h3>
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed flex-1">{item.description}</p>

                        {/* Checkbox and Upload Row */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                          {/* Checkbox */}
                          <label className={`flex items-center gap-2.5 select-none ${isPrereqReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isPrereqReadOnly}
                              onChange={() => {
                                if (isPrereqReadOnly) return;
                                toggleCheck(item.id);
                              }}
                              className="w-4.5 h-4.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="text-xs text-gray-700 font-semibold">Verify Item Present & Ready</span>
                          </label>

                          {/* Evidence upload */}
                          <div className="flex flex-col gap-2">
                            {attachmentName ? (
                              <div className="flex items-center justify-between bg-blue-50/50 border border-blue-200 rounded-lg p-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  {attachmentUrl ? (
                                    <img
                                      src={attachmentUrl}
                                      className="w-8 h-8 rounded object-cover border border-blue-200 cursor-pointer"
                                      alt="Thumbnail"
                                      onClick={() => setEnlargedImage(attachmentUrl)}
                                    />
                                  ) : (
                                    <FileText size={14} className="text-blue-500 shrink-0" />
                                  )}
                                  <span className="text-[11px] text-blue-700 font-medium truncate max-w-[130px]" title={attachmentName}>
                                    {attachmentName}
                                  </span>
                                </div>
                                {!isPrereqReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(item.id)}
                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold shrink-0 ml-1.5 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ) : (
                              !isPrereqReadOnly ? (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPerfUploadTarget("prereq-" + item.id);
                                      startCamera();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 bg-[#3A5764] hover:bg-[#2f4a55] text-white px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                  >
                                    <Camera size={12} /> Capture
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPerfUploadTarget("prereq-" + item.id);
                                      fileInputRef.current?.click();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-705 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-white transition-colors cursor-pointer"
                                  >
                                    <Upload size={12} /> Upload
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No evidence uploaded</span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 bg-gray-50 border-t border-gray-150 flex items-center justify-between">
                {isPrereqReadOnly ? (
                  <>
                    <div />
                    <button
                      type="button"
                      onClick={() => setViewPerfPrereqOnly(false)}
                      className="px-6 py-2.5 bg-[#3A5764] hover:bg-[#2f4a55] text-white rounded-md font-medium text-xs tracking-wider transition-colors uppercase cursor-pointer"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePerfTask(null);
                        setShowPerfPrereqModal(false);
                      }}
                      className="px-5 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md font-medium text-xs tracking-wider transition-colors uppercase cursor-pointer"
                    >
                      Cancel & Exit
                    </button>
                    <button
                      type="button"
                      disabled={!allChecked}
                      onClick={() => {
                        setPrereqProgress((prev) => {
                          const taskProg = prev[activePerfTask.id] || { checked: {}, attachments: {}, attachmentUrls: {}, completed: false };
                          return {
                            ...prev,
                            [activePerfTask.id]: {
                              ...taskProg,
                              completed: true,
                            },
                          };
                        });
                        setShowPerfPrereqModal(false);
                      }}
                      className="px-6 py-2.5 bg-[#3A5764] hover:bg-[#2f4a55] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium text-xs tracking-wider transition-colors uppercase cursor-pointer shadow-sm"
                    >
                      Proceed to SOP Execution
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bottom-Up Direct SOP Performance Wizard Modal */}
      {activePerfTask && !showPerfPrereqModal && !viewPerfPrereqOnly && (() => {
        const steps = activePerfTask.steps || defaultSopSteps;
        const step = steps[perfStepIndex] || steps[0];
        const isLastStep = perfStepIndex === steps.length - 1;
        const isReadOnly = activePerfTask.status !== "In Progress";

        // Perform step validation checks
        const validation = validateStep(step, perfRemarks, perfQrVerified, perfAttachment, perfOldPartAttachment, perfNewPartAttachment);
        const isStepValid = validation.isValid;
        const validationError = validation.error;

        return (
          <>
            <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
            <style>{`
              @keyframes scan {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}</style>
            
            <div className="w-full max-w-[950px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="mx-6 mt-3 mb-1 px-5 py-2.5 border border-gray-200 rounded flex items-center justify-between bg-white">
                <h3 className="text-gray-900 font-normal text-lg">
                  {activePerfTask.title}{" "}
                  <span className="text-gray-400 font-normal text-base">
                    ( {activePerfTask.doneBy || "operator"} )
                  </span>
                </h3>
                {activePerfTask.type === "Comprehensive" && (
                  <button
                    type="button"
                    onClick={() => setViewPerfPrereqOnly(true)}
                    className="ml-auto mr-4 px-3 py-1.5 border border-gray-300 hover:border-[#3A5764] hover:text-[#3A5764] text-gray-700 rounded text-xs font-semibold bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText size={14} /> View Prerequisites
                  </button>
                )}
                <span
                  className={
                    "text-base font-semibold " +
                    (activePerfTask.status === "Reviewed"
                      ? "text-emerald-600"
                      : activePerfTask.status === "Ready for Review"
                      ? "text-blue-600"
                      : activePerfTask.status === "In Progress"
                      ? "text-[#D97706]"
                      : "text-gray-500")
                  }
                >
                  {activePerfTask.status === "Reviewed"
                    ? "Approved"
                    : activePerfTask.status === "Ready for Review"
                    ? "Performed"
                    : activePerfTask.status === "In Progress"
                    ? "In Progress"
                    : activePerfTask.status}
                </span>
              </div>
 
              {/* Modal Body */}
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-3 px-6 pb-1.5 overflow-y-auto max-h-[60vh]">
                
                {/* Left Column - Media & Step Details */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-gray-900 font-semibold" style={{ fontSize: "16px" }}>
                      {step.title}
                    </h4>
                    {step.type && (
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase ${
                        step.type === "critical"
                          ? "bg-red-100 text-red-700"
                          : step.type === "camera"
                          ? "bg-blue-100 text-blue-700"
                          : step.type === "info"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-200 text-gray-750"
                      }`}>
                        {step.type} Step
                      </span>
                    )}
                  </div>

                  {/* Media Loader Container */}
                  <div className="bg-[#ECF0F1] rounded-lg p-2.5 flex flex-col items-center justify-center border border-gray-200 w-full h-[180px] min-h-[180px] relative group overflow-hidden">
                    {step.mediaUrl && (step.mediaUrl.includes("audio") || step.mediaUrl.endsWith(".mp3")) ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4 text-white rounded">
                        <svg className="w-10 h-10 text-[#3B82F6] mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                        </svg>
                        <audio controls src={step.mediaUrl} className="w-full max-w-xs" />
                      </div>
                    ) : step.mediaUrl && (step.mediaUrl.includes("video") || step.mediaUrl.endsWith(".mp4")) ? (
                      <video
                        controls
                        src={step.mediaUrl}
                        className="object-contain w-full h-full max-h-[160px] rounded"
                      />
                    ) : (
                      <>
                        <img
                          src={step.mediaUrl || image1}
                          alt={step.title}
                          className="object-contain max-h-[160px] w-auto rounded-md shadow-sm"
                        />
                        {/* Enlarge Hover Button */}
                        <button
                          onClick={() => setEnlargedImage(step.mediaUrl || image1)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Enlarge Image"
                        >
                          <Maximize2 size={15} />
                        </button>
                      </>
                    )}
                  </div>

                  {step.desc && (
                    <div className="text-gray-655 bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs leading-relaxed mt-1">
                      <strong className="text-gray-800 block mb-0.5">Instruction:</strong>
                      {step.desc}
                    </div>
                  )}

                  {step.stepSignificance && (
                    <div className="text-gray-500 text-[11px] italic px-1">
                      💡 <strong>Significance:</strong> {step.stepSignificance}
                    </div>
                  )}

                  {step.ans && (
                    <div className="bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd] p-2.5 rounded text-[11px]">
                      ✔️ <strong>Expected Result:</strong> {step.ans}
                    </div>
                  )}
                </div>
 
                {/* Right Column - User Interaction */}
                <div className="flex flex-col gap-4 justify-between">
                  <div className="flex flex-col gap-4">
                    
                    {/* QR Codes Section */}
                    <div className="border-b border-gray-200 pb-3 flex flex-col gap-1 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-semibold text-lg">
                          QR Codes
                        </span>
                        <button
                          disabled={isReadOnly || perfScanning}
                          onClick={handleStartScanning}
                          className="text-[#10B981] hover:text-emerald-700 disabled:opacity-50 transition-colors"
                          title="Scan QR Code"
                        >
                          <QrCode size={24} />
                        </button>
                      </div>

                      <div className="text-sm text-gray-500 font-normal">
                        {step.qrRequired ? "QR Code Required." : "No QR Codes Required."}
                      </div>
 
                      {perfScanning ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="relative w-full h-48 bg-black rounded-md overflow-hidden flex flex-col items-center justify-center border border-gray-605">
                            <video
                              ref={qrVideoRef}
                              autoPlay
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />
                            {/* Green laser line */}
                            <div className="absolute top-2 left-2 border-t-2 border-l-2 border-green-500 w-3.5 h-3.5"></div>
                            <div className="absolute top-2 right-2 border-t-2 border-r-2 border-green-500 w-3.5 h-3.5"></div>
                            <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-green-500 w-3.5 h-3.5"></div>
                            <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-green-500 w-3.5 h-3.5"></div>
                            <div className="absolute w-full h-[2px] bg-green-500 top-0 left-0 animate-[scan_1.5s_infinite_linear] z-10"></div>
                            <span className="text-green-500 text-[11px] tracking-wider animate-pulse z-25 font-semibold bg-black/60 px-2 py-0.5 rounded animate-bounce">
                              SCANNING MACHINE QR...
                            </span>
                            <span className="text-gray-300 text-[9px] mt-1 z-20 bg-black/60 px-2 py-0.5 rounded">
                              Searching for: {activePerfTask.machine}-Verified
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 p-2 rounded-md">
                            <input
                              type="text"
                              placeholder={`Or type "${activePerfTask.machine}-Verified"`}
                              id="manual-qr-input-reports"
                              className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[11px] outline-none focus:border-[#3A5764]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const btn = document.getElementById("manual-verify-btn-reports");
                                  if (btn) btn.click();
                                }
                              }}
                            />
                            <button
                              type="button"
                              id="manual-verify-btn-reports"
                              onClick={() => {
                                const inputVal = (document.getElementById("manual-qr-input-reports") as HTMLInputElement)?.value;
                                const expected = `${activePerfTask.machine}-Verified`.toLowerCase().trim();
                                if (inputVal && (inputVal.toLowerCase().trim() === expected || inputVal.toLowerCase().trim().includes(activePerfTask.machine.toLowerCase()))) {
                                  setPerfQrVerified(true);
                                  stopQrCamera();
                                } else {
                                  alert(`Invalid value. Please enter "${activePerfTask.machine}-Verified"`);
                                }
                              }}
                              className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={stopQrCamera}
                              className="border border-gray-300 text-gray-655 hover:bg-gray-150 px-2 py-1 rounded text-[11px] font-medium bg-white cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : perfQrVerified ? (
                        <div className="text-emerald-600 font-medium text-xs flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-md mt-1">
                          <div className="flex items-center gap-1.5">
                            <Check size={14} className="text-emerald-600" />
                            <span>QR Code: {activePerfTask.machine}-Verified</span>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => setPerfQrVerified(false)}
                              className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-red-500 font-medium mt-0.5 animate-pulse">
                          No QR Codes Scanned.
                        </div>
                      )}
                    </div>
 
                    {/* Attachments Section */}
                    <div className="border-b border-gray-200 pb-3 flex flex-col gap-1 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-semibold text-lg">
                          Attachments
                        </span>
                        <div className="flex gap-3">
                          {(step.type === "camera" || step.isPartChange || !!step.refImageUrl) && (
                            <button
                              type="button"
                              disabled={!step.refImageUrl}
                              onClick={() => {
                                if (step.refImageUrl) setEnlargedImage(step.refImageUrl);
                              }}
                              className={
                                "transition-colors " +
                                (step.refImageUrl
                                  ? "text-[#2563EB] hover:text-blue-800 cursor-pointer"
                                  : "text-gray-300 cursor-not-allowed opacity-40")
                              }
                              title={step.refImageUrl ? "View Reference Image" : "No Reference Image"}
                            >
                              <Image size={22} />
                            </button>
                          )}
                          <button
                            disabled={isReadOnly}
                            onClick={() => {
                              setPerfUploadTarget("standard");
                              startCamera();
                            }}
                            className="text-[#10B981] hover:text-emerald-700 disabled:opacity-50 transition-colors"
                            title="Capture Photo"
                          >
                            <Camera size={22} />
                          </button>
                          <button
                            disabled={isReadOnly}
                            onClick={() => {
                              setPerfUploadTarget("standard");
                              fileInputRef.current?.click();
                            }}
                            className="text-[#10B981] hover:text-emerald-700 disabled:opacity-50 transition-colors"
                            title="Upload File"
                          >
                            <Upload size={22} />
                          </button>
                          {step.isPartChange && (
                            <button
                              type="button"
                              onClick={() => setPerfPartModalOpen(true)}
                              className="text-[#3A5764] hover:text-[#2f4a55] transition-colors relative"
                              title="Part Replacement Evidence"
                            >
                              <RefreshCw size={22} className={perfOldPartAttachment && perfNewPartAttachment ? "text-emerald-600" : "text-[#3A5764]"} />
                              {(perfOldPartAttachment || perfNewPartAttachment) && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white animate-pulse" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
 
                      {perfAttachment ? (
                        <div className="text-blue-600 font-medium text-xs flex items-center justify-between bg-blue-50 border border-blue-100 p-2.5 rounded-md mt-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {perfAttachmentUrl ? (
                              <img src={perfAttachmentUrl} className="w-8 h-8 rounded object-cover border border-blue-200 shrink-0" alt="thumbnail" />
                            ) : (
                              <FileText size={14} className="text-blue-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[200px] text-blue-700 ml-1">{perfAttachment}</span>
                          </div>
                          {!isReadOnly && (
                            <button
                              onClick={() => {
                                setPerfAttachment("");
                                setPerfAttachmentUrl("");
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold ml-2 shrink-0"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ) : !step.isPartChange ? (
                        <div className="text-sm text-gray-500 font-normal">
                          No attachments available.
                        </div>
                      ) : null}

                      {step.isPartChange && (perfOldPartAttachment || perfNewPartAttachment) && (
                        <div className="flex flex-col gap-1.5 mt-1.5 border-t border-gray-150 pt-1.5">
                          {perfOldPartAttachment && (
                            <div className="text-blue-600 font-medium text-xs flex items-center justify-between bg-amber-50/50 border border-amber-200 p-2 rounded-md">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {perfOldPartAttachmentUrl ? (
                                  <img src={perfOldPartAttachmentUrl} className="w-7 h-7 rounded object-cover border border-amber-200 shrink-0" alt="old part" />
                                ) : (
                                  <FileText size={12} className="text-amber-500 shrink-0" />
                                )}
                                <span className="truncate max-w-[200px] text-amber-800 ml-1 font-semibold">Old Part: {perfOldPartAttachment}</span>
                              </div>
                              {!isReadOnly && (
                                <button
                                  onClick={() => {
                                    setPerfOldPartAttachment("");
                                    setPerfOldPartAttachmentUrl("");
                                  }}
                                  className="text-red-500 hover:text-red-700 text-[10px] font-bold ml-2 shrink-0"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          )}
                          {perfNewPartAttachment && (
                            <div className="text-blue-600 font-medium text-xs flex items-center justify-between bg-emerald-50/50 border border-emerald-200 p-2 rounded-md">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {perfNewPartAttachmentUrl ? (
                                  <img src={perfNewPartAttachmentUrl} className="w-7 h-7 rounded object-cover border border-emerald-200 shrink-0" alt="new part" />
                                ) : (
                                  <FileText size={12} className="text-emerald-500 shrink-0" />
                                )}
                                <span className="truncate max-w-[200px] text-emerald-800 ml-1 font-semibold">New Part: {perfNewPartAttachment}</span>
                              </div>
                              {!isReadOnly && (
                                <button
                                  onClick={() => {
                                    setPerfNewPartAttachment("");
                                    setPerfNewPartAttachmentUrl("");
                                  }}
                                  className="text-red-500 hover:text-red-700 text-[10px] font-bold ml-2 shrink-0"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {step.isPartChange && !perfOldPartAttachment && !perfNewPartAttachment && (
                        <div className="text-sm text-gray-500 font-normal">
                          No part evidence uploaded. Click the replacement icon to upload.
                        </div>
                      )}
                    </div>
 
                    {/* Remarks Section */}
                    <div className="flex flex-col gap-2">
                      <span className="text-gray-900 font-semibold text-lg">
                        Remarks
                      </span>
                      <textarea
                        disabled={isReadOnly}
                        value={perfRemarks}
                        onChange={(e) => setPerfRemarks(e.target.value)}
                        placeholder="Enter your remarks here"
                        rows={2}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 outline-none text-sm text-gray-850 focus:border-[#3B82F6] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed shadow-inner transition-colors"
                      />
                    </div>
 
                  </div>
 
                  {/* Validation Error Feedback */}
                  {!isReadOnly && validationError && perfRemarks.trim() && (
                    <div className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-md font-medium">
                      ⚠️ {validationError}
                    </div>
                  )}
 
                  {/* Save / Completion Button */}
                  {!isReadOnly ? (
                    <button
                      onClick={handleSavePerfStep}
                      disabled={!isStepValid}
                      className={
                        "px-6 py-2 rounded text-white font-medium flex items-center justify-center gap-2 shadow-sm transition-all " +
                        (!isStepValid
                          ? "bg-gray-300 cursor-not-allowed shadow-none"
                          : "bg-[#2563EB] hover:bg-blue-700")
                      }
                      style={{ fontSize: "14px", width: "fit-content" }}
                    >
                      <Check size={16} />
                      {isLastStep ? "SAVE & SUBMIT" : "SAVE"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-6 py-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center justify-center gap-2"
                      style={{ fontSize: "14px", width: "fit-content" }}
                    >
                      <Check size={16} />
                      COMPLETED
                    </button>
                  )}
 
                </div>
 
              </div>
 
              {/* Modal Footer */}
              <div className="px-6 py-2 bg-white flex flex-col gap-2">
                {/* Arrow navigation */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                  <button
                    disabled={perfStepIndex === 0}
                    onClick={() => setPerfStepIndex((p) => Math.max(0, p - 1))}
                    className="text-gray-400 hover:text-gray-655 disabled:opacity-30 transition-colors"
                    title="Previous Step"
                  >
                    <ArrowLeft size={22} />
                  </button>
                  <span className="text-gray-800 font-normal text-base">
                    {perfStepIndex + 1} / {steps.length}
                  </span>
                  <button
                    disabled={perfStepIndex === steps.length - 1}
                    onClick={() => setPerfStepIndex((p) => Math.min(steps.length - 1, p + 1))}
                    className="p-2 border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Next Step"
                  >
                    <ArrowRight size={22} />
                  </button>
                </div>
 
                {/* Close Button Row */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      stopQrCamera();
                      setActivePerfTask(null);
                    }}
                    className="px-6 py-2 bg-[#C62828] hover:bg-red-700 text-white rounded font-medium text-xs tracking-wider transition-colors shadow-sm"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
 
            </div>
          </div>

          {/* Part Replacement Evidence Modal */}
          {perfPartModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-left">
                  <div>
                    <span className="text-gray-900 font-semibold text-lg block">Part Replacement Evidence</span>
                    <span className="text-gray-500 text-xs mt-0.5">Please provide photos or files for both the old and new parts.</span>
                  </div>
                  <button onClick={() => setPerfPartModalOpen(false)} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white text-left">
                  {/* Old Part Card */}
                  <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-gray-50/50">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-800 font-bold text-sm uppercase tracking-wide">1. Old Part (Removed)</span>
                      {perfOldPartAttachment && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">Ready</span>
                      )}
                    </div>

                    {perfOldPartAttachment ? (
                      <div className="flex flex-col items-center gap-2 py-2 flex-1 justify-center">
                        {perfOldPartAttachmentUrl ? (
                          <img src={perfOldPartAttachmentUrl} className="w-24 h-24 rounded-lg object-cover border border-gray-200 shadow-sm" alt="Old Part" />
                        ) : (
                          <FileText size={40} className="text-gray-400" />
                        )}
                        <span className="text-xs text-gray-700 font-medium truncate max-w-full px-2" title={perfOldPartAttachment}>
                          {perfOldPartAttachment}
                        </span>
                        <div className="flex gap-2 w-full mt-1">
                          {perfOldPartAttachmentUrl && (
                            <button
                              type="button"
                              onClick={() => setEnlargedImage(perfOldPartAttachmentUrl)}
                              className="flex-1 py-1 px-2 text-xs border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded font-medium"
                            >
                              View
                            </button>
                          )}
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => {
                                setPerfOldPartAttachment("");
                                setPerfOldPartAttachmentUrl("");
                              }}
                              className="flex-1 py-1 px-2 text-xs border border-red-200 text-red-500 bg-white hover:bg-red-50 rounded font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 items-center justify-center py-6 flex-1 text-center border-2 border-dashed border-gray-200 rounded-lg bg-white">
                        <span className="text-xs text-gray-400 font-normal px-4">No evidence uploaded yet</span>
                        {!isReadOnly && (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPerfUploadTarget("old");
                                startCamera();
                              }}
                              className="flex items-center gap-1 bg-[#3A5764] hover:bg-[#2f4a55] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                            >
                              <Camera size={14} /> Capture
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPerfUploadTarget("old");
                                fileInputRef.current?.click();
                              }}
                              className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-750 px-3 py-1.5 rounded text-xs font-semibold bg-white transition-colors cursor-pointer"
                            >
                              <Upload size={14} /> Upload
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* New Part Card */}
                  <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-gray-50/50">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-800 font-bold text-sm uppercase tracking-wide">2. New Part (Installed)</span>
                      {perfNewPartAttachment && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">Ready</span>
                      )}
                    </div>

                    {perfNewPartAttachment ? (
                      <div className="flex flex-col items-center gap-2 py-2 flex-1 justify-center">
                        {perfNewPartAttachmentUrl ? (
                          <img src={perfNewPartAttachmentUrl} className="w-24 h-24 rounded-lg object-cover border border-gray-200 shadow-sm" alt="New Part" />
                        ) : (
                          <FileText size={40} className="text-gray-400" />
                        )}
                        <span className="text-xs text-gray-700 font-medium truncate max-w-full px-2" title={perfNewPartAttachment}>
                          {perfNewPartAttachment}
                        </span>
                        <div className="flex gap-2 w-full mt-1">
                          {perfNewPartAttachmentUrl && (
                            <button
                              type="button"
                              onClick={() => setEnlargedImage(perfNewPartAttachmentUrl)}
                              className="flex-1 py-1 px-2 text-xs border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded font-medium"
                            >
                              View
                            </button>
                          )}
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => {
                                setPerfNewPartAttachment("");
                                setPerfNewPartAttachmentUrl("");
                              }}
                              className="flex-1 py-1 px-2 text-xs border border-red-200 text-red-500 bg-white hover:bg-red-50 rounded font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 items-center justify-center py-6 flex-1 text-center border-2 border-dashed border-gray-200 rounded-lg bg-white">
                        <span className="text-xs text-gray-400 font-normal px-4">No evidence uploaded yet</span>
                        {!isReadOnly && (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPerfUploadTarget("new");
                                startCamera();
                              }}
                              className="flex items-center gap-1 bg-[#3A5764] hover:bg-[#2f4a55] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                            >
                              <Camera size={14} /> Capture
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPerfUploadTarget("new");
                                fileInputRef.current?.click();
                              }}
                              className="flex items-center gap-1 border border-gray-300 hover:bg-gray-50 text-gray-750 px-3 py-1.5 rounded text-xs font-semibold bg-white transition-colors cursor-pointer"
                            >
                              <Upload size={14} /> Upload
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPerfPartModalOpen(false)}
                    className="px-6 py-2 bg-[#3A5764] hover:bg-[#2f4a55] text-white rounded font-medium text-xs tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    CONFIRM & CLOSE
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* Lightbox Dialog Enlarger Overlay */}
          {enlargedImage && (
            <div 
              className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
              onClick={() => setEnlargedImage(null)}
            >
              <button 
                onClick={() => setEnlargedImage(null)}
                className="fixed top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>
              <img 
                src={enlargedImage} 
                alt="Enlarged step instruction view" 
                className="max-w-full max-h-full rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-200"
              />
            </div>
          )}
          </>
        );
      })()}

      {/* Webcam Device Capture Dialog Modal — top-level so it renders from ANY modal (Prerequisites or SOP perform wizard) */}
      {webcamModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-gray-900 font-semibold">Camera Capture</span>
              <button onClick={stopCamera} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center bg-gray-950 min-h-[300px] relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded bg-black max-h-[360px] object-cover"
              />
              {/* Overlay guides */}
              <div className="absolute inset-8 border border-white/20 pointer-events-none rounded flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-l-2 border-white/40 absolute top-0 left-0"></div>
                <div className="w-12 h-12 border-t-2 border-r-2 border-white/40 absolute top-0 right-0"></div>
                <div className="w-12 h-12 border-b-2 border-l-2 border-white/40 absolute bottom-0 left-0"></div>
                <div className="w-12 h-12 border-b-2 border-r-2 border-white/40 absolute bottom-0 right-0"></div>
                <span className="text-white/40 text-xs text-center font-medium px-4"></span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2 bg-[#3A5764] hover:bg-[#2f4a55] text-white rounded-md text-xs font-bold shadow transition-colors"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
