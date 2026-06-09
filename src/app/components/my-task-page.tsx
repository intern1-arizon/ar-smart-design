import { useState, useEffect, useMemo, useRef } from "react";
import jsQR from "jsqr";
import { Search, FileText, XCircle, ArrowUpRight, X, ChevronLeft, ChevronRight, Play, Check, Upload, QrCode, Camera, Maximize2, ArrowLeft, ArrowRight, Image } from "lucide-react";
import { type ScheduleRow } from "./generate-schedule-modal";
import { defaultSchedules } from "./schedule-page";

import image1 from "../../imports/image-1.png";
import image2 from "../../imports/image-2.png";
import image3 from "../../imports/image-3.png";
import image4 from "../../imports/image-4.png";
import image5 from "../../imports/image-5.png";
import image6 from "../../imports/image-6.png";
import rmg1 from "../../imports/rmg-1.png";
import rmg2 from "../../imports/rmg-2.png";
import rmg3 from "../../imports/rmg-3.png";
import rmg4 from "../../imports/rmg-4.png";
import rmg5 from "../../imports/rmg-5.png";
import rmg6 from "../../imports/rmg-6.png";
import rmg7 from "../../imports/rmg-7.png";
import rmg8 from "../../imports/rmg-8.png";
import rmg9 from "../../imports/rmg-9.png";
import rmg10 from "../../imports/rmg-10.png";
import rmg11 from "../../imports/rmg-11.png";

export type TaskStatus = "Assigned" | "Performed" | "Approved" | "Cancelled" | "Expired";

export type TrainingTask = {
  id: string;
  machineTitle: string;
  trainingManualTitle: string;
  currentStatus: TaskStatus;
  requestExpiryDate: string;
  certificateExpiryDate: string;
  remarks: string;
  timeTaken?: number; // duration in seconds
};

export type SopStep = {
  title: string;
  mediaUrl: string;
  qrRequired: boolean;
  desc?: string;
  ans?: string;
  stepSignificance?: string;
  type?: "info" | "camera" | "critical" | "normal";
  refImageUrl?: string;
};

export const taskStepsMap: Record<string, SopStep[]> = {
  "RMG Annual Maintenance Service": [
    {
      title: "Step 1: Lockout Tagout",
      mediaUrl: rmg1,
      qrRequired: true,
      desc: "Machine Shutdown & Safety Lockout. Ensure absolute power isolation before clean/service.",
      ans: "LOTO padlocked and tag placed on main breaker.",
      stepSignificance: "Crucial for safety to prevent accidental restart.",
      type: "critical"
    },
    {
      title: "Step 2: Visual Pre-check",
      mediaUrl: rmg2,
      qrRequired: false,
      desc: "Visual Inspection (Pre-Cleaning). Check bowl and impeller for residual granules.",
      ans: "Pre-check done; bowl interior logged.",
      stepSignificance: "Identifies contamination points.",
      type: "info"
    },
    {
      title: "Step 3: Dismantle Parts",
      mediaUrl: rmg3,
      qrRequired: true,
      desc: "Dismantle Critical Parts. Carefully detach chopper blade and impeller dome nut.",
      ans: "Impeller and chopper assemblies disassembled.",
      stepSignificance: "Allows clean access to seals.",
      type: "normal"
    },
    {
      title: "Step 4: Logging",
      mediaUrl: rmg4,
      qrRequired: false,
      desc: "Record Water Quantity & Cleaning Time. Measure cleaning fluids used to ensure compliance.",
      ans: "Water meters and time logged.",
      stepSignificance: "Keeps fluid consumption metrics within parameters.",
      type: "normal"
    },
    {
      title: "Step 5: Scrubbing",
      mediaUrl: rmg5,
      qrRequired: false,
      desc: "Manual Cleaning with Approved Detergent. Scrub interior surfaces with non-abrasive pads.",
      ans: "Interior surfaces scrubbed clean.",
      stepSignificance: "Removes caked chemical residues.",
      type: "normal"
    },
    {
      title: "Step 6: Fluid Flush",
      mediaUrl: rmg6,
      qrRequired: false,
      desc: "Rinse with Measured Water. Wash out all detergent residue with purified water.",
      ans: "Fluid flush complete.",
      stepSignificance: "Clears chemical detergent film.",
      type: "normal"
    },
    {
      title: "Step 7: Tight Inspection",
      mediaUrl: rmg7,
      qrRequired: true,
      desc: "Inspect & Verify Difficult-to-Clean Areas. Check scraper blade and discharge valve seals.",
      ans: "Difficult areas checked and verified clean.",
      stepSignificance: "Ensures zero residual growth.",
      type: "critical"
    },
    {
      title: "Step 8: Quality Control",
      mediaUrl: rmg8,
      qrRequired: false,
      desc: "Swab or Rinse Sampling. Collect chemical swabs for TOC/HPLC analysis.",
      ans: "Swab samples collected.",
      stepSignificance: "Required for batch verification.",
      type: "camera",
      refImageUrl: rmg8
    },
    {
      title: "Step 9: De-moisturize",
      mediaUrl: rmg9,
      qrRequired: false,
      desc: "Dry All Components. Blow dry with filtered compressed air.",
      ans: "Drying cycle verified.",
      stepSignificance: "Prevents bacteria breeding in moisture.",
      type: "normal"
    },
    {
      title: "Step 10: Assemble Parts",
      mediaUrl: rmg10,
      qrRequired: true,
      desc: "Reassemble the RMG. Re-fit the impeller and tighten the chopper assembly.",
      ans: "Impeller dome nut and chopper hand-tightened.",
      stepSignificance: "Rebuilds working assembly.",
      type: "normal"
    },
    {
      title: "Step 11: Sign-off",
      mediaUrl: rmg11,
      qrRequired: false,
      desc: "Final Visual Verification. Verify clean status and clearance sign-off.",
      ans: "Supervisor sign-off complete.",
      stepSignificance: "Closes the maintenance batch.",
      type: "normal"
    }
  ],
  "Annual Turret Service": [
    {
      title: "Step 1: Inspect turret gears and clean drive mechanism",
      mediaUrl: image1,
      qrRequired: true,
      desc: "Visually inspect all turret gears for wear, cracks, or misalignment. Clean the drive assembly of any dust.",
      ans: "Turret gears are intact and drive mechanism is free of particulate matter.",
      stepSignificance: "Preventative check to avoid gear breakage during double compression.",
      type: "critical"
    },
    {
      title: "Step 2: Lubricate turret shafts and sign off",
      mediaUrl: image2,
      qrRequired: false,
      desc: "Apply premium grease (Grade 2) to the upper and lower turret shafts. Wipe off excess oil.",
      ans: "Shafts are evenly coated; no oil leakage detected.",
      stepSignificance: "Reduces friction wear on turret assembly during operation.",
      type: "camera", // Requires photo upload!
      refImageUrl: image2
    }
  ],
  "Quarterly Drive Inspection": [
    {
      title: "Step 1: Check drive motor belt tension and electrical connections",
      mediaUrl: image3,
      qrRequired: true,
      desc: "Verify belt tension is within 10-15mm deflection. Tighten electrical terminals if loose.",
      ans: "Deflection is 12mm; connections are torqued.",
      stepSignificance: "Ensures motor power transmission is highly efficient.",
      type: "normal"
    },
    {
      title: "Step 2: Safety checklist walkthrough (safety switches, emergency stop)",
      mediaUrl: image4,
      qrRequired: false,
      desc: "Walk through all guarding doors. Confirm that opening a door trips the safety relay.",
      ans: "All safety switches shut down the machine instantly.",
      stepSignificance: "CRITICAL safety validation to prevent operator injury.",
      type: "critical"
    },
    {
      title: "Step 3: Run test cycle and record RPM/vibration logs",
      mediaUrl: image5,
      qrRequired: true,
      desc: "Run a test run at 40 RPM. Snapping a photo of the vibration logs panel is required.",
      ans: "Vibration is less than 2.5 mm/s. Logs captured.",
      stepSignificance: "Validates system stability under loaded conditions.",
      type: "camera", // Requires photo!
      refImageUrl: image5
    }
  ],
  "Monthly Lubrication": [
    {
      title: "Step 1: Verify oil level and top up if necessary",
      mediaUrl: image6,
      qrRequired: true,
      desc: "Check reservoir dipstick. Add oil (ISO VG 150) until it reaches the mark.",
      ans: "Reservoir level is at the 100% capacity mark.",
      stepSignificance: "Ensures continuous smooth movement of internal cams.",
      type: "normal"
    },
    {
      title: "Step 2: Grease all moving joints and bearings",
      mediaUrl: image1,
      qrRequired: false,
      desc: "Attach grease gun to nipples and pump twice on each active bearing.",
      ans: "Bearings lubricated; excess wiped clean.",
      stepSignificance: "Prevents mechanical seizing and structural load fatigue.",
      type: "normal"
    }
  ],
  "Weekly Visual Inspection": [
    {
      title: "Step 1: Inspect guard safety interlocks and visual signs of wear",
      mediaUrl: image2,
      qrRequired: true,
      desc: "Verify the safety interlock plunger operates smoothly and is not bent.",
      ans: "Safety interlock plunger is aligned and free of damage.",
      stepSignificance: "Ensures operator cannot access turret while machine is in motion.",
      type: "critical"
    },
    {
      title: "Step 2: Clean visual indicators and check for loose bolts",
      mediaUrl: image3,
      qrRequired: false,
      desc: "Wipe indicator panels. Torque visible compression plate bolts to check for looseness.",
      ans: "Indicators readable; all bolts secure.",
      stepSignificance: "Maintains torque integrity of structural compression plates.",
      type: "camera",
      refImageUrl: image3
    }
  ],
  "Daily Cleanup Check": [
    {
      title: "Step 1: Clean machine workspace and wipe exterior panels",
      mediaUrl: image4,
      qrRequired: true,
      desc: "Clean product residue from workspace. Wipe down stainless steel exterior panels.",
      ans: "Panels are clean; workspace is free of powder debris.",
      stepSignificance: "Prevents product cross-contamination and maintains GMP standards.",
      type: "normal"
    },
    {
      title: "Step 2: Empty refuse containers and inspect filter seals",
      mediaUrl: image5,
      qrRequired: false,
      desc: "Empty powder dust collector waste. Check the intake filter seals for tears.",
      ans: "Waste bin empty; filter seals show no signs of bypass leaks.",
      stepSignificance: "Ensures containment system remains completely air-tight.",
      type: "info"
    }
  ],
  "Biannual Filter Replacement": [
    {
      title: "Step 1: Remove old air intake and vacuum exhaust filters",
      mediaUrl: image6,
      qrRequired: true,
      desc: "Shut down vacuum compressor. Unlatch housing and slide old filters out.",
      ans: "Old filters removed and discarded in bio-waste.",
      stepSignificance: "Regular replacement ensures optimal air filtration efficiency.",
      type: "normal"
    },
    {
      title: "Step 2: Vacuum clean filter housings and install new filters",
      mediaUrl: image1,
      qrRequired: false,
      desc: "Clean vacuum housing. Install new HEPA and primary filters. Verify seal.",
      ans: "New filters seated; vacuum pressure reads within range.",
      stepSignificance: "Maintains optimal containment negative pressure.",
      type: "camera", // Requires photo!
      refImageUrl: image1
    }
  ]
};

export const defaultSopSteps: SopStep[] = [
  {
    title: "Step 1: General safety inspection and clean workstation",
    mediaUrl: image1,
    qrRequired: false,
    desc: "Perform quick area sweep and safety checks.",
    ans: "Workstation clean and secure.",
    stepSignificance: "GMP safety baseline check.",
    type: "info"
  },
  {
    title: "Step 2: Basic machine operational precheck and inspection",
    mediaUrl: image2,
    qrRequired: true,
    desc: "Perform pre-check and scan machine QR to start operation.",
    ans: "Machine is verified and operational.",
    stepSignificance: "Verifies correct machine is being operated.",
    type: "normal"
  }
];

export function getSopSteps(machineTitle: string, sopTitle: string): SopStep[] {
  // 1. Try to find in localStorage for AMC
  try {
    const savedAmc = localStorage.getItem(`arizon_amc_${machineTitle}`);
    if (savedAmc) {
      const rows = JSON.parse(savedAmc);
      const match = rows.find((r: any) => r.title === sopTitle);
      if (match && match.steps && match.steps.length > 0) {
        return match.steps.map((st: any) => ({
          title: st.title || "",
          mediaUrl: st.src || st.mediaUrl || "",
          qrRequired: (st.qrCodes && st.qrCodes.length > 0) || st.qrRequired || false,
          desc: st.desc || st.subtitle || "",
          ans: st.ans || "",
          stepSignificance: st.stepSignificance || "",
          type: st.type || "normal",
          refImageUrl: st.refImageUrl || "",
        }));
      }
    }
  } catch (e) {
    console.error("Error loading AMC steps from localStorage:", e);
  }

  // 2. Try to find in localStorage for Maintenance
  try {
    const savedMaint = localStorage.getItem(`arizon_maintenance_${machineTitle}`);
    if (savedMaint) {
      const rows = JSON.parse(savedMaint);
      const match = rows.find((r: any) => r.title === sopTitle);
      if (match && match.steps && match.steps.length > 0) {
        return match.steps.map((st: any) => ({
          title: st.title || "",
          mediaUrl: st.src || st.mediaUrl || "",
          qrRequired: (st.qrCodes && st.qrCodes.length > 0) || st.qrRequired || false,
          desc: st.desc || st.subtitle || "",
          ans: st.ans || "",
          stepSignificance: st.stepSignificance || "",
          type: st.type || "normal",
          refImageUrl: st.refImageUrl || "",
        }));
      }
    }
  } catch (e) {
    console.error("Error loading Maintenance steps from localStorage:", e);
  }

  // 3. Fallback to taskStepsMap or defaultSopSteps
  return taskStepsMap[sopTitle] || defaultSopSteps;
}

export const validateStep = (
  step: SopStep,
  remarks: string,
  qrVerified: boolean,
  attachment: string
) => {
  // 1. QR Code Scan Checks
  if (step.qrRequired && !qrVerified) {
    return { isValid: false, error: "Please scan the QR Code." };
  }

  // 2. Camera Attachment Check
  if (step.type === "camera" && !attachment) {
    return { isValid: false, error: "Please attach a photo for this step." };
  }

  // 3. Remarks Check (Cannot be blank, empty, or space-only)
  if (!remarks || !remarks.trim()) {
    return { isValid: false, error: "Remarks are required before moving forward." };
  }

  return { isValid: true, error: "" };
};

export function MyTaskPage() {
  const [tasks, setTasks] = useState<TrainingTask[]>([]);

  // Load and map from "arizon_schedules" on mount & listen to storage changes
  useEffect(() => {
    const loadTasks = () => {
      try {
        const savedSchedules = localStorage.getItem("arizon_schedules");
        const rows: ScheduleRow[] = savedSchedules ? JSON.parse(savedSchedules) : defaultSchedules;
        const mapped: TrainingTask[] = rows.map((row) => {
          let mappedStatus: TaskStatus = "Assigned";
          if (row.status === "Pending") mappedStatus = "Assigned";
          else if (row.status === "Completed") mappedStatus = "Approved";
          else if (row.status === "Overdue") mappedStatus = "Expired";
          else mappedStatus = row.status as TaskStatus;

          return {
            id: row.id || `amc-${Date.now()}-${Math.random()}`,
            machineTitle: row.machine,
            trainingManualTitle: row.sopTitle,
            currentStatus: mappedStatus,
            requestExpiryDate: row.scheduledDate,
            certificateExpiryDate: row.completionDate,
            remarks: row.remarks || "",
          };
        });
        setTasks(mapped);
      } catch (e) {
        console.error("Failed to load and map tasks from localStorage:", e);
      }
    };

    loadTasks();

    // Listen for storage changes
    window.addEventListener("storage", loadTasks);
    return () => window.removeEventListener("storage", loadTasks);
  }, []);

  // Sync tasks state back to "arizon_schedules" in localStorage
  useEffect(() => {
    if (tasks.length === 0) return;
    try {
      const savedSchedules = localStorage.getItem("arizon_schedules");
      const rows: ScheduleRow[] = savedSchedules ? JSON.parse(savedSchedules) : defaultSchedules;
      if (rows.length === 0) return;

      const updatedRows = rows.map((row) => {
        const matchingTask = tasks.find((t) => t.id === row.id);
        if (matchingTask) {
          let nextStatus: ScheduleRow["status"] = "Pending";
          if (matchingTask.currentStatus === "Assigned") nextStatus = "Pending";
          else if (matchingTask.currentStatus === "Approved") nextStatus = "Approved";
          else if (matchingTask.currentStatus === "Expired") nextStatus = "Expired";
          else nextStatus = matchingTask.currentStatus as ScheduleRow["status"];

          return {
            ...row,
            status: nextStatus,
            completionDate: matchingTask.certificateExpiryDate,
            remarks: matchingTask.remarks,
          };
        }
        return row;
      });

      localStorage.setItem("arizon_schedules", JSON.stringify(updatedRows));
    } catch (e) {
      console.error("Failed to save tasks back to schedules:", e);
    }
  }, [tasks]);

  const [machineFilter, setMachineFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal states
  const [selectedTask, setSelectedTask] = useState<TrainingTask | null>(null);
  const [actionType, setActionType] = useState<"view" | "cancel" | "perform" | "approve" | null>(null);

  // SOP Modal States
  const [activeSopTask, setActiveSopTask] = useState<TrainingTask | null>(null);
  const [sopStepIndex, setSopStepIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrVideoRef = useRef<HTMLVideoElement>(null);
  const qrStreamRef = useRef<MediaStream | null>(null);
  const qrAnimationRef = useRef<number | null>(null);

  // Current SOP Step fields state
  const [stepRemarks, setStepRemarks] = useState<string>("");
  const [stepAttachment, setStepAttachment] = useState<string>("");
  const [stepAttachmentUrl, setStepAttachmentUrl] = useState<string>("");
  const [stepQrVerified, setStepQrVerified] = useState<boolean>(false);

  // Lightbox & Webcam States
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [webcamModalOpen, setWebcamModalOpen] = useState<boolean>(false);

  // Webcam stream management
  const startCamera = async () => {
    setWebcamModalOpen(true);
    // Request permission & start stream
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
          setStepAttachmentUrl(dataUrl);
          setStepAttachment(`snap-${Date.now()}.png`);
        }
      } catch (e) {
        // Fallback simulation
        setStepAttachmentUrl(image1);
        setStepAttachment(`mock-snap-${Date.now()}.png`);
      }
    } else {
      // Fallback simulation (e.g. no camera connected)
      setStepAttachmentUrl(image1);
      setStepAttachment(`mock-snap-${Date.now()}.png`);
    }
    stopCamera();
  };

  // SOP progress state per task ID
  const [sopProgress, setSopProgress] = useState<Record<string, Record<number, { remarks: string; qrScanned: boolean; attachmentName: string; attachmentUrl?: string }>>>(() => {
    try {
      const saved = localStorage.getItem("arizon_sop_progress");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load SOP progress from localStorage:", e);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("arizon_sop_progress", JSON.stringify(sopProgress));
    } catch (e) {
      console.error("Failed to save SOP progress to localStorage:", e);
    }
  }, [sopProgress]);

  // Sync current step values
  useEffect(() => {
    if (activeSopTask) {
      const taskProg = sopProgress[activeSopTask.id] || {};
      const stepProg = taskProg[sopStepIndex] || { remarks: "", qrScanned: false, attachmentName: "", attachmentUrl: "" };
      setStepRemarks(stepProg.remarks || "");
      setStepAttachment(stepProg.attachmentName || "");
      setStepAttachmentUrl(stepProg.attachmentUrl || "");
      setStepQrVerified(stepProg.qrScanned || false);
      setIsScanning(false);
    }
  }, [activeSopTask, sopStepIndex, sopProgress]);

  // Unique machines for dropdown filter
  const uniqueMachines = useMemo(() => {
    const list = new Set(tasks.map((t) => t.machineTitle));
    return ["All", ...Array.from(list)];
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (machineFilter !== "All" && t.machineTitle !== machineFilter) return false;
      if (statusFilter !== "All" && t.currentStatus !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesMachine = t.machineTitle.toLowerCase().includes(query);
        const matchesManual = t.trainingManualTitle.toLowerCase().includes(query);
        if (!matchesMachine && !matchesManual) return false;
      }
      return true;
    });
  }, [tasks, machineFilter, statusFilter, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [machineFilter, statusFilter, searchQuery, pageSize]);

  // Paginated tasks
  const paginatedTasks = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredTasks.slice(startIdx, startIdx + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));

  // Handlers for interactive actions
  const handleCancelTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, currentStatus: "Cancelled" } : t))
    );
    setActionType(null);
    setSelectedTask(null);
  };

  const handlePerformTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, currentStatus: "Performed" } : t))
    );
    setActionType(null);
    setSelectedTask(null);
  };

  const handleApproveTask = (id: string) => {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 10); // set certificate expiry 10 days from now
    const formatD = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              currentStatus: "Approved",
              certificateExpiryDate: formatD(expiry),
            }
          : t
      )
    );
    setActionType(null);
    setSelectedTask(null);
  };

  // SOP Modal Handlers
  const handleSaveStep = () => {
    if (!activeSopTask) return;
    const steps = getSopSteps(activeSopTask.machineTitle, activeSopTask.trainingManualTitle);
    const isLastStep = sopStepIndex === steps.length - 1;

    const updatedTaskProg = {
      ...(sopProgress[activeSopTask.id] || {}),
      [sopStepIndex]: {
        remarks: stepRemarks,
        qrScanned: stepQrVerified,
        attachmentName: stepAttachment,
        attachmentUrl: stepAttachmentUrl,
      }
    };

    setSopProgress(prev => ({
      ...prev,
      [activeSopTask.id]: updatedTaskProg
    }));

    if (isLastStep) {
      // Completed! Generate simulated completion metrics (timeTaken)
      const elapsedSeconds = Math.floor(Math.random() * (480 - 120 + 1) + 120);

      setTasks(prev =>
        prev.map(t =>
          t.id === activeSopTask.id
            ? {
                ...t,
                currentStatus: "Performed",
                remarks: `SOP completed in ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s by operator.`,
                timeTaken: elapsedSeconds,
                certificateExpiryDate: new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              }
            : t
        )
      );

      // Clean up progress from localStorage
      setSopProgress(prev => {
        const copy = { ...prev };
        delete copy[activeSopTask.id];
        return copy;
      });

      setActiveSopTask(null);
    } else {
      setSopStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (!activeSopTask) return;
    const updatedTaskProg = {
      ...(sopProgress[activeSopTask.id] || {}),
      [sopStepIndex]: {
        remarks: stepRemarks,
        qrScanned: stepQrVerified,
        attachmentName: stepAttachment,
        attachmentUrl: stepAttachmentUrl,
      }
    };
    setSopProgress(prev => ({
      ...prev,
      [activeSopTask.id]: updatedTaskProg
    }));
    setSopStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    if (!activeSopTask) return;
    const updatedTaskProg = {
      ...(sopProgress[activeSopTask.id] || {}),
      [sopStepIndex]: {
        remarks: stepRemarks,
        qrScanned: stepQrVerified,
        attachmentName: stepAttachment,
        attachmentUrl: stepAttachmentUrl,
      }
    };
    setSopProgress(prev => ({
      ...prev,
      [activeSopTask.id]: updatedTaskProg
    }));
    const steps = getSopSteps(activeSopTask.machineTitle, activeSopTask.trainingManualTitle);
    setSopStepIndex(prev => Math.min(steps.length - 1, prev + 1));
  };

  const stopQrCamera = () => {
    if (qrAnimationRef.current) {
      cancelAnimationFrame(qrAnimationRef.current);
      qrAnimationRef.current = null;
    }
    if (qrStreamRef.current) {
      qrStreamRef.current.getTracks().forEach((track) => track.stop());
      qrStreamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleCloseSopModal = () => {
    stopQrCamera();
    if (activeSopTask && activeSopTask.currentStatus === "Assigned") {
      const updatedTaskProg = {
        ...(sopProgress[activeSopTask.id] || {}),
        [sopStepIndex]: {
          remarks: stepRemarks,
          qrScanned: stepQrVerified,
          attachmentName: stepAttachment,
          attachmentUrl: stepAttachmentUrl,
        }
      };
      setSopProgress(prev => ({
        ...prev,
        [activeSopTask.id]: updatedTaskProg
      }));
    }
    setActiveSopTask(null);
  };

  const handleStartScanning = async () => {
    setIsScanning(true);
    setStepQrVerified(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      qrStreamRef.current = stream;
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = stream;
      }
      
      const scanFrame = () => {
        if (!activeSopTask) {
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
              const expectedTag = `${activeSopTask?.machineTitle}-Verified`.toLowerCase().trim();
              const scannedText = code.data.toLowerCase().trim();
              if (scannedText === expectedTag || scannedText.includes(activeSopTask?.machineTitle?.toLowerCase() || "")) {
                setStepQrVerified(true);
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
      console.warn("Could not start QR camera stream:", err);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStepAttachment(file.name);
      setStepAttachmentUrl(URL.createObjectURL(file));
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Approved":
        return "text-[#10B981] font-semibold";
      case "Assigned":
        return "text-[#EF4444] font-semibold";
      case "Performed":
        return "text-[#3B82F6] font-semibold";
      case "Cancelled":
        return "text-[#6B7280] font-semibold";
      case "Expired":
        return "text-[#F59E0B] font-semibold";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div className="px-2">
      <div className="bg-gray-100 rounded-xl border border-gray-200 p-6">
        {/* Card Header with Title and Filters */}
        <div className="flex items-center justify-between gap-6 mb-6 flex-wrap">
          <h2 className="text-gray-900" style={{ fontSize: "20px", fontWeight: 600 }}>
            My Task
          </h2>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Select Machine Filter */}
            <div className="relative">
              <label
                className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500"
                style={{ fontSize: "11px" }}
              >
                Select Machine
              </label>
              <select
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
                className="appearance-none w-[170px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 outline-none cursor-pointer focus:border-[#3A5764]"
                style={{ fontSize: "14px" }}
              >
                {uniqueMachines.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Select Status Filter */}
            <div className="relative">
              <label
                className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500"
                style={{ fontSize: "11px" }}
              >
                Select Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-[150px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 outline-none cursor-pointer focus:border-[#3A5764]"
                style={{ fontSize: "14px" }}
              >
                <option value="All">All</option>
                <option value="Assigned">Assigned</option>
                <option value="Performed">Performed</option>
                <option value="Approved">Approved</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <label
                className="absolute -top-2 left-3 z-10 bg-gray-100 px-1 text-gray-500"
                style={{ fontSize: "11px" }}
              >
                Search
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[220px] bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2 outline-none focus:border-[#3A5764]"
                  style={{ fontSize: "14px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3A5764]/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3A5764]">
          {/* Table Header */}
          <div
            className="grid grid-cols-[1.5fr_1.5fr_1fr_1.2fr_1.2fr_1.2fr_1fr] gap-4 px-6 py-4 bg-gray-100 text-gray-600 min-w-[950px]"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <div>Machine Title</div>
            <div>Training Manual Title</div>
            <div>Current Status</div>
            <div>Request Expiry Date</div>
            <div>Certificate Expiry Date</div>
            <div>Remarks</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          {tasks.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500" style={{ fontSize: "14px" }}>
              No tasks scheduled. Please go to Schedule Module to generate schedules.
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500" style={{ fontSize: "14px" }}>
              No tasks match your filters.
            </div>
          ) : (
            paginatedTasks.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-[1.5fr_1.5fr_1fr_1.2fr_1.2fr_1.2fr_1fr] gap-4 px-6 py-4 border-t border-gray-100 items-center min-w-[950px]"
                style={{ fontSize: "13px" }}
              >
                <div className="text-gray-900 font-medium">{t.machineTitle}</div>
                <div className="text-gray-900 font-medium">{t.trainingManualTitle}</div>
                <div className={getStatusColor(t.currentStatus)}>{t.currentStatus}</div>
                <div className="text-gray-700">{t.requestExpiryDate || "—"}</div>
                <div className="text-gray-700">{t.certificateExpiryDate || "—"}</div>
                <div className="text-gray-600 truncate" title={t.remarks}>
                  {t.remarks || "—"}
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  {t.currentStatus === "Assigned" ? (
                    <button
                      onClick={() => {
                        setActiveSopTask(t);
                        setSopStepIndex(0);
                      }}
                      title="Perform task (SOP)"
                      className="hover:text-[#3A5764] transition-colors"
                    >
                      <Play size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSopTask(t);
                        setSopStepIndex(0);
                      }}
                      title="View SOP details"
                      className="hover:text-[#3A5764] transition-colors"
                    >
                      <FileText size={18} />
                    </button>
                  )}

                  {t.currentStatus === "Assigned" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTask(t);
                          setActionType("cancel");
                        }}
                        title="Cancel task"
                        className="hover:text-red-500 transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}

                  {t.currentStatus === "Performed" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTask(t);
                          setActionType("cancel");
                        }}
                        title="Cancel/Reject task"
                        className="hover:text-red-500 transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTask(t);
                          setActionType("approve");
                        }}
                        title="Approve task"
                        className="hover:text-emerald-500 transition-colors"
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </>
                  )}

                  {(t.currentStatus === "Approved" ||
                    t.currentStatus === "Cancelled" ||
                    t.currentStatus === "Expired") && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedTask(t);
                          setActionType("cancel");
                        }}
                        title="Cancel task"
                        className="hover:text-red-500 transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setActiveSopTask(t);
                          setSopStepIndex(0);
                        }}
                        title="View completed SOP"
                        className="hover:text-[#3A5764] transition-colors"
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Pagination */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-gray-600" style={{ fontSize: "13px" }}>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-[#3A5764]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {Math.min(filteredTasks.length, (currentPage - 1) * pageSize + 1)}-
                {Math.min(filteredTasks.length, currentPage * pageSize)} of {filteredTasks.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-white text-gray-500 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-white text-gray-500 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* SOP Modal */}
      {activeSopTask && (() => {
        const steps = getSopSteps(activeSopTask.machineTitle, activeSopTask.trainingManualTitle);
        const step = steps[sopStepIndex] || steps[0];
        const isReadOnly = activeSopTask.currentStatus !== "Assigned";
        const isLastStep = sopStepIndex === steps.length - 1;

        // Perform step validation checks
        const validation = validateStep(step, stepRemarks, stepQrVerified, stepAttachment);
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
                  {activeSopTask.trainingManualTitle}{" "}
                  <span className="text-gray-400 font-normal">
                    ( {activeSopTask.id.includes("amc") ? "operator" : "john"} )
                  </span>
                </h3>
                <span
                  className={
                    "text-base font-semibold " +
                    (activeSopTask.currentStatus === "Approved"
                      ? "text-emerald-600"
                      : activeSopTask.currentStatus === "Performed"
                      ? "text-blue-600"
                      : activeSopTask.currentStatus === "Assigned"
                      ? "text-[#D97706]"
                      : "text-gray-500")
                  }
                >
                  {activeSopTask.currentStatus === "Approved"
                    ? "Approved"
                    : activeSopTask.currentStatus === "Performed"
                    ? "Performed"
                    : activeSopTask.currentStatus === "Assigned"
                    ? "In Progress"
                    : activeSopTask.currentStatus}
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
                    {step.mediaUrl.includes("audio") || step.mediaUrl.endsWith(".mp3") ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4 text-white rounded">
                        <svg className="w-10 h-10 text-[#3B82F6] mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                        </svg>
                        <audio controls src={step.mediaUrl} className="w-full max-w-xs" />
                      </div>
                    ) : step.mediaUrl.includes("video") || step.mediaUrl.endsWith(".mp4") ? (
                      <video
                        controls
                        src={step.mediaUrl}
                        className="object-contain w-full h-full max-h-[160px] rounded"
                      />
                    ) : (
                      <>
                        <img
                          src={step.mediaUrl}
                          alt={step.title}
                          className="object-contain max-h-[160px] w-auto rounded-md shadow-sm"
                        />
                        {/* Enlarge Hover Button */}
                        <button
                          onClick={() => setEnlargedImage(step.mediaUrl)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Enlarge Image"
                        >
                          <Maximize2 size={15} />
                        </button>
                      </>
                    )}
                  </div>

                  {step.desc && (
                    <div className="text-gray-650 bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs leading-relaxed mt-1">
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
                          disabled={isReadOnly || isScanning}
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
 
                      {isScanning ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="relative w-full h-48 bg-black rounded-md overflow-hidden flex flex-col items-center justify-center border border-gray-600">
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
                            <span className="text-green-500 text-[11px] tracking-wider animate-pulse z-20 font-semibold bg-black/60 px-2 py-0.5 rounded animate-bounce">
                              SCANNING MACHINE QR...
                            </span>
                            <span className="text-gray-300 text-[9px] mt-1 z-20 bg-black/60 px-2 py-0.5 rounded">
                              Searching for: {activeSopTask.machineTitle}-Verified
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 p-2 rounded-md">
                            <input
                              type="text"
                              placeholder={`Or type "${activeSopTask.machineTitle}-Verified"`}
                              id="manual-qr-input"
                              className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-[11px] outline-none focus:border-[#3A5764]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const btn = document.getElementById("manual-verify-btn");
                                  if (btn) btn.click();
                                }
                              }}
                            />
                            <button
                              type="button"
                              id="manual-verify-btn"
                              onClick={() => {
                                const inputVal = (document.getElementById("manual-qr-input") as HTMLInputElement)?.value;
                                const expected = `${activeSopTask.machineTitle}-Verified`.toLowerCase().trim();
                                if (inputVal && (inputVal.toLowerCase().trim() === expected || inputVal.toLowerCase().trim().includes(activeSopTask.machineTitle.toLowerCase()))) {
                                  setStepQrVerified(true);
                                  stopQrCamera();
                                } else {
                                  alert(`Invalid value. Please enter "${activeSopTask.machineTitle}-Verified"`);
                                }
                              }}
                              className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-2.5 py-1 rounded text-[11px] font-bold"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={stopQrCamera}
                              className="border border-gray-300 text-gray-650 hover:bg-gray-150 px-2 py-1 rounded text-[11px] font-medium bg-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : stepQrVerified ? (
                        <div className="text-emerald-600 font-medium text-xs flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-md mt-1">
                          <div className="flex items-center gap-1.5">
                            <Check size={14} className="text-emerald-600" />
                            <span>QR Code: {activeSopTask.machineTitle}-Verified</span>
                          </div>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => setStepQrVerified(false)}
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
                          {step.type === "camera" && (
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
                            onClick={startCamera}
                            className="text-[#10B981] hover:text-emerald-700 disabled:opacity-50 transition-colors"
                            title="Capture Photo"
                          >
                            <Camera size={22} />
                          </button>
                          <button
                            disabled={isReadOnly}
                            onClick={handleTriggerUpload}
                            className="text-[#10B981] hover:text-emerald-700 disabled:opacity-50 transition-colors"
                            title="Upload File"
                          >
                            <Upload size={22} />
                          </button>
                        </div>
                      </div>
 
                      {stepAttachment ? (
                        <div className="text-blue-600 font-medium text-xs flex items-center justify-between bg-blue-50 border border-blue-100 p-2.5 rounded-md mt-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {stepAttachmentUrl ? (
                              <img src={stepAttachmentUrl} className="w-8 h-8 rounded object-cover border border-blue-200 shrink-0" alt="thumbnail" />
                            ) : (
                              <FileText size={14} className="text-blue-500 shrink-0" />
                            )}
                            <span className="truncate max-w-[200px] text-blue-700 ml-1">{stepAttachment}</span>
                          </div>
                          {!isReadOnly && (
                            <button
                              onClick={() => {
                                setStepAttachment("");
                                setStepAttachmentUrl("");
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold ml-2 shrink-0"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 font-normal">
                          No attachments available.
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
                        value={stepRemarks}
                        onChange={(e) => setStepRemarks(e.target.value)}
                        placeholder="Enter your remarks here"
                        rows={2}
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 outline-none text-sm text-gray-850 focus:border-[#3B82F6] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed shadow-inner transition-colors"
                      />
                    </div>
 
                  </div>
 
                  {/* Validation Error Feedback */}
                  {!isReadOnly && validationError && stepRemarks.trim() && (
                    <div className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-md font-medium">
                      ⚠️ {validationError}
                    </div>
                  )}
 
                  {/* Save / Completion Button */}
                  {!isReadOnly ? (
                    <button
                      onClick={handleSaveStep}
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
                    disabled={sopStepIndex === 0}
                    onClick={handlePrevStep}
                    className="text-gray-400 hover:text-gray-655 disabled:opacity-30 transition-colors"
                    title="Previous Step"
                  >
                    <ArrowLeft size={22} />
                  </button>
                  <span className="text-gray-800 font-normal text-base">
                    {sopStepIndex + 1} / {steps.length}
                  </span>
                  <button
                    disabled={sopStepIndex === steps.length - 1}
                    onClick={handleNextStep}
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
                    onClick={handleCloseSopModal}
                    className="px-6 py-2 bg-[#C62828] hover:bg-red-700 text-white rounded font-medium text-xs tracking-wider transition-colors shadow-sm"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
 
            </div>
          </div>

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

      {/* Webcam Device Capture Dialog Modal */}
      {webcamModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-gray-900 font-semibold">Camera Capture</span>
              <button onClick={stopCamera} className="text-gray-500 hover:text-gray-805">
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
                <span className="text-white/40 text-xs text-center font-medium px-4">Center workpiece in viewfinder</span>
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
          </>
        );
      })()}

      {/* Action Modals */}
      {selectedTask && actionType && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-semibold text-lg">
                {actionType === "view" && "Training Request Details"}
                {actionType === "cancel" && "Confirm Cancel Task"}
                {actionType === "perform" && "Mark Task as Performed"}
                {actionType === "approve" && "Approve Training Request"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setActionType(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4">
              {actionType === "view" ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-gray-500">Machine:</span>
                    <span className="text-gray-900 font-medium">{selectedTask.machineTitle}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-gray-500">Training Manual:</span>
                    <span className="text-gray-900 font-medium">{selectedTask.trainingManualTitle}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-gray-500">Status:</span>
                    <span className={getStatusColor(selectedTask.currentStatus)}>
                      {selectedTask.currentStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-gray-500">Request Expiry:</span>
                    <span className="text-gray-900">{selectedTask.requestExpiryDate || "—"}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-gray-500">Certificate Expiry:</span>
                    <span className="text-gray-900">{selectedTask.certificateExpiryDate || "—"}</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] gap-2">
                    <span className="text-gray-500">Remarks:</span>
                    <span className="text-gray-700 whitespace-pre-wrap">{selectedTask.remarks || "—"}</span>
                  </div>
                </div>
              ) : actionType === "cancel" ? (
                <p className="text-gray-600">
                  Are you sure you want to cancel/reject the training request for{" "}
                  <strong className="text-gray-800">{selectedTask.trainingManualTitle}</strong> on{" "}
                  <strong className="text-gray-800">{selectedTask.machineTitle}</strong>?
                </p>
              ) : actionType === "perform" ? (
                <p className="text-gray-600">
                  Do you want to mark the training task for{" "}
                  <strong className="text-gray-800">{selectedTask.trainingManualTitle}</strong> on{" "}
                  <strong className="text-gray-800">{selectedTask.machineTitle}</strong> as{" "}
                  <strong className="text-blue-600">Performed</strong>?
                </p>
              ) : (
                <p className="text-gray-600">
                  Do you want to approve the training request for{" "}
                  <strong className="text-gray-800">{selectedTask.trainingManualTitle}</strong>? This will set
                  the status to <strong className="text-green-600">Approved</strong> and generate a certificate
                  expiry date.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setActionType(null);
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                style={{ fontSize: "13px" }}
              >
                Cancel
              </button>

              {actionType === "cancel" && (
                <button
                  type="button"
                  onClick={() => handleCancelTask(selectedTask.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  style={{ fontSize: "13px" }}
                >
                  Yes, Cancel Task
                </button>
              )}

              {actionType === "perform" && (
                <button
                  type="button"
                  onClick={() => handlePerformTask(selectedTask.id)}
                  className="px-4 py-2 bg-[#3A5764] hover:bg-[#2f4a55] text-white rounded-md transition-colors"
                  style={{ fontSize: "13px" }}
                >
                  Mark Performed
                </button>
              )}

              {actionType === "approve" && (
                <button
                  type="button"
                  onClick={() => handleApproveTask(selectedTask.id)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors"
                  style={{ fontSize: "13px" }}
                >
                  Approve Training
                </button>
              )}

              {actionType === "view" && (
                <>
                  {selectedTask.currentStatus === "Assigned" && (
                    <button
                      type="button"
                      onClick={() => setActionType("perform")}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                      style={{ fontSize: "13px" }}
                    >
                      Perform Training
                    </button>
                  )}
                  {selectedTask.currentStatus === "Performed" && (
                    <button
                      type="button"
                      onClick={() => setActionType("approve")}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors"
                      style={{ fontSize: "13px" }}
                    >
                      Approve Training
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
