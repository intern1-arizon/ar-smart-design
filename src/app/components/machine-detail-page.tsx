import { useState, useEffect } from "react";
import { Search, Pencil, MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Shapes, Volume2, Trash2, PlusCircle, List } from "lucide-react";
import { AddMaintenanceModal, type NewMaintenance } from "./add-maintenance-modal";
import { AddAmcSopModal, type NewAmcSop } from "./add-amc-sop-modal";
import { AddStepModal } from "./add-step-modal";
import { ArrangeStepsModal } from "./arrange-steps-modal";
import { defaultMachines } from "./machines-page";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

type Tab =
  | "LIVE DATA"
  | "TRAINING"
  | "CHANGE OVER"
  | "MAINTENANCE"
  | "AMC"
  | "CALIBRATION"
  | "ALARMS"
  | "GEMBA"
  | "LINE CLEARANCE";

const TABS: Tab[] = [
  "LIVE DATA",
  // "TRAINING",
  // "CHANGE OVER",
  "MAINTENANCE",
  "AMC",
  // "CALIBRATION",
  "ALARMS",
  // "GEMBA",
  // "LINE CLEARANCE",
];

export type Step =
  | { kind: "video"; title: string; subtitle: string; src: string }
  | { kind: "image"; title: string; subtitle: string; src: string; alt: string }
  | { kind: "text"; title: string; subtitle: string; body: string }
  | { kind: "audio"; title: string; subtitle: string; src: string };

type MaintenanceRow = {
  title: string;
  description: string;
  period: string;
  lastDone: string;
  steps: Step[];
};

const maintenanceRows: MaintenanceRow[] = [
  {
    title: "Quarterly Preventive Maintenance In Detailed Videos",
    description: "Maintenance",
    period: "Every 3 Months",
    lastDone: "04 Sept 2024",
    steps: [
      {
        kind: "video",
        title: "1.SOP :",
        subtitle: "SOP of Monthly Preventive Maintenance",
        src: "https://videos.pexels.com/video-files/4031736/4031736-uhd_2560_1440_25fps.mp4",
      },
      {
        kind: "image",
        title: "2.Inspection :",
        subtitle: "Visually inspect the compression turret",
        src: "https://images.unsplash.com/photo-1699791914755-78826dec1c40?w=1080",
        alt: "Compression turret",
      },
      {
        kind: "text",
        title: "3.Checklist :",
        subtitle: "Tighten all fasteners",
        body: "Torque all visible fasteners to 25 Nm. Replace any showing wear. Log readings in the maintenance journal.",
      },
      {
        kind: "audio",
        title: "4.Briefing :",
        subtitle: "Audio briefing from senior tech",
        src: "https://www.w3schools.com/html/horse.mp3",
      },
    ],
  },
  {
    title: "Monthly Preventive Maintenance",
    description: "Updated sop(20/08/2025)",
    period: "Daily",
    lastDone: "20 Aug 2025",
    steps: [
      {
        kind: "text",
        title: "1.Pre-check :",
        subtitle: "Verify line clearance",
        body: "Confirm the area is clear and the machine is in maintenance mode before proceeding.",
      },
      {
        kind: "image",
        title: "2.Cleaning :",
        subtitle: "Clean dust collector",
        src: "https://images.unsplash.com/photo-1716643863806-989dd76ae093?w=1080",
        alt: "Dust collector",
      },
    ],
  },
  {
    title: "Monthly Preventive Maintenance In Detailed Videos",
    description: "Updated(20/08/2025)",
    period: "Daily",
    lastDone: "20 Aug 2025",
    steps: [
      {
        kind: "video",
        title: "1.Demo :",
        subtitle: "Walkthrough of the monthly routine",
        src: "https://videos.pexels.com/video-files/4031736/4031736-uhd_2560_1440_25fps.mp4",
      },
    ],
  },
];

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    null
  );
}

function StepMedia({ step }: { step: Step }) {
  if (step.kind === "video") {
    return (
      <video controls src={step.src} width={560} height={315} className="mx-auto block rounded-md bg-slate-900" />
    );
  }
  if (step.kind === "image") {
    return (
      <img src={step.src} alt={step.alt} width={560} height={315} className="mx-auto block rounded-md bg-slate-100 object-cover" style={{ width: 560, height: 315 }} />
    );
  }
  if (step.kind === "audio") {
    return (
      <div className="w-full h-full rounded-md bg-slate-100 flex flex-col items-center justify-center gap-4 p-6">
        <Volume2 size={40} className="text-[#3A5764]" />
        <audio controls src={step.src} className="w-full max-w-md" />
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-md bg-slate-50 border border-slate-200 p-6 text-gray-700 overflow-auto" style={{ fontSize: "14px", lineHeight: 1.6 }}>
      {step.body}
    </div>
  );
}

function StepPanel({ steps }: { steps: Step[] }) {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];
  const canPrev = idx > 0;
  const canNext = idx < steps.length - 1;

  if (!step) {
    return (
      <div className="px-6 py-6 text-gray-500" style={{ fontSize: "13px" }}>
        No steps available for this item.
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative">
        <div className="flex items-start justify-between px-6 pt-5">
          <div className="text-[#3A5764]">
            <Shapes size={22} />
          </div>
          <div className="flex-1 text-center">
            <div className="text-gray-900" style={{ fontSize: "18px", fontWeight: 600 }}>{step.title}</div>
            <div className="text-gray-600" style={{ fontSize: "13px" }}>{step.subtitle}</div>
          </div>
          <button className="text-gray-500 hover:text-gray-800"><MoreVertical size={18} /></button>
        </div>

        <div className="px-6 py-6">
          {/* <div className="text-gray-500" style={{ fontSize: "13px" }}>No sensor data available.</div> */}
          <div className="min-h-[360px] flex items-center justify-center">
            <StepMedia step={step} />
          </div>
        </div>

        {canPrev && (
          <button
            onClick={() => setIdx((i) => i - 1)}
            className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center shadow"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {canNext && (
          <button
            onClick={() => setIdx((i) => i + 1)}
            className="absolute right-[-18px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center shadow"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-gray-500" style={{ fontSize: "12px" }}>
        Step {idx + 1} of {steps.length}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function MaintenanceTab({ machineName }: { machineName: string }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rows, setRows] = useState<MaintenanceRow[]>(() => {
    try {
      const saved = localStorage.getItem(`arizon_maintenance_${machineName}`);
      if (saved) return JSON.parse(saved);
      const isDefault = defaultMachines.some((m) => m.name === machineName);
      return isDefault ? maintenanceRows : [];
    } catch (e) {
      console.error("Failed to load maintenance rows from localStorage:", e);
      const isDefault = defaultMachines.some((m) => m.name === machineName);
      return isDefault ? maintenanceRows : [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`arizon_maintenance_${machineName}`, JSON.stringify(rows));
    } catch (e) {
      console.error("Failed to save maintenance rows to localStorage:", e);
    }
  }, [rows, machineName]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [addStepIndex, setAddStepIndex] = useState<number | null>(null);
  const [arrangeStepsIndex, setArrangeStepsIndex] = useState<number | null>(null);

  const handleAdd = (m: NewMaintenance) => {
    setRows((prev) => [
      ...prev,
      {
        title: m.title,
        description: m.description || "-",
        period: m.period,
        lastDone: formatDate(m.lastDone),
        steps: [],
      },
    ]);
    setModalOpen(false);
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <h2 className="text-gray-900" style={{ fontSize: "22px", fontWeight: 500 }}>
          Maintenance
        </h2>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-gray-50 px-1 text-gray-500" style={{ fontSize: "11px" }}>
              Search
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title"
                className="w-[280px] bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2.5 outline-none focus:border-[#3A5764]"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-gray-50 px-1 text-gray-500" style={{ fontSize: "11px" }}>
              Select type
            </label>
            <select
              defaultValue="Preventive"
              className="appearance-none w-[200px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none"
              style={{
                fontSize: "14px",
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <option>Machine Breakdown</option>
              <option>Routine</option>
              <option>Preventive</option>
            </select>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-5 py-2.5 rounded-md"
            style={{ fontSize: "13px", letterSpacing: "0.5px" }}
          >
            ADD MAINTENANCE
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_0.6fr_1fr] gap-4 px-6 py-4 bg-gray-100 text-gray-600" style={{ fontSize: "13px", fontWeight: 500 }}>
          <div>Title</div>
          <div>Description</div>
          <div>Period / Cycle</div>
          <div>Last Done</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {rows.map((row, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i} className="border-t border-gray-100">
              <div
                className="grid grid-cols-[2fr_2fr_1fr_1fr_0.6fr_1fr] gap-4 px-6 py-5 items-center"
                style={{ fontSize: "13px" }}
              >
                <div className="text-gray-900" style={{ fontWeight: 500 }}>{row.title}</div>
                <div className="text-gray-700">{row.description}</div>
                <div className="text-green-600">{row.period}</div>
                <div className="text-gray-700">{row.lastDone}</div>
                <div>
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <button className="hover:text-gray-800"><Pencil size={16} /></button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hover:text-gray-850 p-1 rounded hover:bg-gray-100 transition-colors outline-none cursor-pointer"
                        aria-label="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-left">
                      <DropdownMenuItem
                        onClick={() => {
                          setRows((prev) => prev.filter((_, idx) => idx !== i));
                        }}
                        className="flex items-center gap-3 text-gray-700 px-3 py-2 cursor-pointer hover:bg-gray-50 text-xs font-semibold"
                      >
                        <Trash2 size={14} className="text-red-500" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => {
                          setAddStepIndex(i);
                        }}
                        className="flex items-center gap-3 text-gray-700 px-3 py-2 cursor-pointer hover:bg-gray-50 text-xs font-semibold"
                      >
                        <PlusCircle size={14} className="text-gray-700" />
                        <span>Add Step</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => {
                          setArrangeStepsIndex(i);
                        }}
                        className="flex items-center gap-3 text-gray-700 px-3 py-2 cursor-pointer hover:bg-gray-50 text-xs font-semibold"
                      >
                        <List size={14} className="text-gray-700" />
                        <span>Arrange steps</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-3 text-gray-450 px-3 py-2 cursor-not-allowed text-xs font-semibold opacity-50"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                          <path d="M16 8H8" />
                          <path d="M16 12H8" />
                          <path d="M13 16H8" />
                        </svg>
                        <span>Create Report</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-3 text-gray-450 px-3 py-2 cursor-not-allowed text-xs font-semibold opacity-50"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>View SOP</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="hover:text-gray-800"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              {isOpen && <StepPanel steps={row.steps} />}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4 mt-4 text-gray-600" style={{ fontSize: "13px" }}>
        <span>Rows per page:</span>
        <select className="bg-transparent outline-none" defaultValue="10">
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
        <span>1–{rows.length} of {rows.length}</span>
        <button className="text-gray-500 hover:text-gray-800"><ChevronLeft size={18} /></button>
        <button className="text-gray-500 hover:text-gray-800"><ChevronRight size={18} /></button>
      </div>

      {modalOpen && (
        <AddMaintenanceModal onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      )}

      {addStepIndex !== null && (
        <AddStepModal
          onClose={() => setAddStepIndex(null)}
          onSubmit={(newStep) => {
            const targetIndex = addStepIndex;
            setRows((prev) => {
              const updated = [...prev];
              updated[targetIndex] = {
                ...updated[targetIndex],
                steps: [...updated[targetIndex].steps, newStep],
              };
              return updated;
            });
            setAddStepIndex(null);
          }}
        />
      )}

      {arrangeStepsIndex !== null && (
        <ArrangeStepsModal
          initialSteps={rows[arrangeStepsIndex].steps}
          onClose={() => setArrangeStepsIndex(null)}
          onSave={(updatedSteps) => {
            const targetIndex = arrangeStepsIndex;
            setRows((prev) => {
              const updated = [...prev];
              updated[targetIndex] = {
                ...updated[targetIndex],
                steps: updatedSteps,
              };
              return updated;
            });
            setArrangeStepsIndex(null);
          }}
        />
      )}
    </div>
  );
}

type AmcRow = {
  title: string;
  description: string;
  type: "Labour-only" | "Comprehensive";
  frequency: string;
  lastDone: string;
  status: "ON" | "OFF";
  prereqs: { itemTitle: string; quantity: number; unit: string }[];
  steps: Step[];
};

const rmgAmcRowsSeed: AmcRow[] = [
  {
    title: "RMG Annual Maintenance Service",
    description: "Annual comprehensive service for RMG impeller, chopper, and seal assemblies",
    type: "Comprehensive",
    frequency: "Yearly",
    lastDone: "08 Jun 2026",
    status: "ON",
    prereqs: [
      { itemTitle: "Impeller O-Ring", quantity: 1, unit: "pc" },
      { itemTitle: "Chopper Seal Kit", quantity: 1, unit: "kit" },
      { itemTitle: "Sanitary Cleaning Detergent", quantity: 5, unit: "litres" },
    ],
    steps: [
      {
        kind: "image",
        title: "1. Lockout Tagout :",
        subtitle: "Machine Shutdown & Safety Lockout",
        src: rmg1,
        alt: "RMG Step 1 Lockout",
      },
      {
        kind: "image",
        title: "2. Visual Pre-check :",
        subtitle: "Visual Inspection (Pre-Cleaning)",
        src: rmg2,
        alt: "RMG Step 2 Pre-check",
      },
      {
        kind: "image",
        title: "3. Dismantle Parts :",
        subtitle: "Dismantle Critical Parts",
        src: rmg3,
        alt: "RMG Step 3 Dismantle",
      },
      {
        kind: "image",
        title: "4. Logging :",
        subtitle: "Record Water Quantity & Cleaning Time",
        src: rmg4,
        alt: "RMG Step 4 Logging",
      },
      {
        kind: "image",
        title: "5. Scrubbing :",
        subtitle: "Manual Cleaning with Approved Detergent",
        src: rmg5,
        alt: "RMG Step 5 Scrubbing",
      },
      {
        kind: "image",
        title: "6. Fluid Flush :",
        subtitle: "Rinse with Measured Water",
        src: rmg6,
        alt: "RMG Step 6 Rinsing",
      },
      {
        kind: "image",
        title: "7. Tight Inspection :",
        subtitle: "Inspect & Verify Difficult-to-Clean Areas",
        src: rmg7,
        alt: "RMG Step 7 Inspection",
      },
      {
        kind: "image",
        title: "8. Quality Control :",
        subtitle: "Swab or Rinse Sampling",
        src: rmg8,
        alt: "RMG Step 8 Swabbing",
      },
      {
        kind: "image",
        title: "9. De-moisturize :",
        subtitle: "Dry All Components",
        src: rmg9,
        alt: "RMG Step 9 Drying",
      },
      {
        kind: "image",
        title: "10. Assemble Parts :",
        subtitle: "Reassemble the RMG",
        src: rmg10,
        alt: "RMG Step 10 Assembly",
      },
      {
        kind: "image",
        title: "11. Sign-off :",
        subtitle: "Final Visual Verification",
        src: rmg11,
        alt: "RMG Step 11 Verification",
      },
    ],
  },
];

const amcRowsSeed: AmcRow[] = [
  {
    title: "Annual Turret Service",
    description: "Yearly comprehensive turret overhaul under AMC",
    type: "Comprehensive",
    frequency: "Yearly",
    lastDone: "12 Jan 2025",
    status: "ON",
    prereqs: [
      { itemTitle: "Lubrication Oil", quantity: 5, unit: "litres" },
      { itemTitle: "O-Ring Kit", quantity: 2, unit: "kits" },
    ],
    steps: [
      {
        kind: "video",
        title: "1.Procedure :",
        subtitle: "Comprehensive AMC walkthrough",
        src: "https://videos.pexels.com/video-files/4031736/4031736-uhd_2560_1440_25fps.mp4",
      },
      {
        kind: "text",
        title: "2.Sign-off :",
        subtitle: "Contractor sign-off & report",
        body: "Contractor uploads service report and obtains supervisor signature.",
      },
    ],
  },
  {
    title: "Monthly Labour Inspection",
    description: "Routine labour-only inspection under AMC",
    type: "Labour-only",
    frequency: "Monthly",
    lastDone: "02 May 2026",
    status: "ON",
    prereqs: [],
    steps: [
      {
        kind: "text",
        title: "1.Inspection :",
        subtitle: "Visual & functional checks",
        body: "Walk the equipment, confirm all guards and interlocks operate. Log readings.",
      },
    ],
  },
];

function AmcTab({ machineName }: { machineName: string }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rows, setRows] = useState<AmcRow[]>(() => {
    try {
      const saved = localStorage.getItem(`arizon_amc_${machineName}`);
      if (saved) return JSON.parse(saved);
      if (machineName === "Rapid Mixer Granulator (RMG)") return rmgAmcRowsSeed;
      const isDefault = defaultMachines.some((m) => m.name === machineName);
      return isDefault ? amcRowsSeed : [];
    } catch (e) {
      console.error("Failed to load AMC rows from localStorage:", e);
      if (machineName === "Rapid Mixer Granulator (RMG)") return rmgAmcRowsSeed;
      const isDefault = defaultMachines.some((m) => m.name === machineName);
      return isDefault ? amcRowsSeed : [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`arizon_amc_${machineName}`, JSON.stringify(rows));
    } catch (e) {
      console.error("Failed to save AMC rows to localStorage:", e);
    }
  }, [rows, machineName]);

  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"All" | "Labour-only" | "Comprehensive">("All");
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [addStepIndex, setAddStepIndex] = useState<number | null>(null);
  const [arrangeStepsIndex, setArrangeStepsIndex] = useState<number | null>(null);

  const visible = rows.filter((r) => typeFilter === "All" || r.type === typeFilter);

  const handleAdd = (s: NewAmcSop) => {
    setRows((prev) => [
      ...prev,
      {
        title: s.title,
        description: s.description || "-",
        type: s.type,
        frequency: s.frequency,
        lastDone: formatDate(s.lastDone),
        status: s.status === "ON" ? "ON" : "OFF",
        prereqs: s.prereqs,
        steps: [],
      },
    ]);
    setModalOpen(false);
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <h2 className="text-gray-900" style={{ fontSize: "22px", fontWeight: 500 }}>
          AMC
        </h2>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-gray-50 px-1 text-gray-500" style={{ fontSize: "11px" }}>
              Search
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title"
                className="w-[260px] bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2.5 outline-none focus:border-[#3A5764]"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-gray-50 px-1 text-gray-500" style={{ fontSize: "11px" }}>
              Select type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="appearance-none w-[180px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none"
              style={{
                fontSize: "14px",
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <option>All</option>
              <option>Labour-only</option>
              <option>Comprehensive</option>
            </select>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-5 py-2.5 rounded-md"
            style={{ fontSize: "13px", letterSpacing: "0.5px" }}
          >
            ADD AMC SOP
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1.6fr_1.8fr_1fr_1fr_1fr_0.6fr_1fr] gap-4 px-6 py-4 bg-gray-100 text-gray-600" style={{ fontSize: "13px", fontWeight: 500 }}>
          <div>Title</div>
          <div>Description</div>
          <div>Type</div>
          <div>Frequency</div>
          <div>Last Done</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {visible.map((row, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i} className="border-t border-gray-100">
              <div
                className="grid grid-cols-[1.6fr_1.8fr_1fr_1fr_1fr_0.6fr_1fr] gap-4 px-6 py-5 items-center"
                style={{ fontSize: "13px" }}
              >
                <div className="text-gray-900" style={{ fontWeight: 500 }}>{row.title}</div>
                <div className="text-gray-700">{row.description}</div>
                <div>
                  <span
                    className={
                      "inline-block px-2 py-1 rounded-md " +
                      (row.type === "Comprehensive"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700")
                    }
                    style={{ fontSize: "12px" }}
                  >
                    {row.type}
                  </span>
                </div>
                <div className="text-green-600">{row.frequency}</div>
                <div className="text-gray-700">{row.lastDone}</div>
                <div>
                  <span className={"inline-block w-3 h-3 rounded-full " + (row.status === "ON" ? "bg-green-500" : "bg-red-500")} />
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <button className="hover:text-gray-800"><Pencil size={16} /></button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hover:text-gray-850 p-1 rounded hover:bg-gray-100 transition-colors outline-none cursor-pointer"
                        aria-label="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 text-left">
                      <DropdownMenuItem
                        onClick={() => {
                          const originalIndex = rows.indexOf(row);
                          setRows((prev) => prev.filter((_, idx) => idx !== originalIndex));
                        }}
                        className="flex items-center gap-3 text-gray-700 px-3 py-2 cursor-pointer hover:bg-gray-50 text-xs font-semibold"
                      >
                        <Trash2 size={14} className="text-red-500" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => {
                          setAddStepIndex(rows.indexOf(row));
                        }}
                        className="flex items-center gap-3 text-gray-700 px-3 py-2 cursor-pointer hover:bg-gray-50 text-xs font-semibold"
                      >
                        <PlusCircle size={14} className="text-gray-700" />
                        <span>Add Step</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => {
                          setArrangeStepsIndex(rows.indexOf(row));
                        }}
                        className="flex items-center gap-3 text-gray-700 px-3 py-2 cursor-pointer hover:bg-gray-50 text-xs font-semibold"
                      >
                        <List size={14} className="text-gray-700" />
                        <span>Arrange steps</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-3 text-gray-450 px-3 py-2 cursor-not-allowed text-xs font-semibold opacity-50"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                          <path d="M16 8H8" />
                          <path d="M16 12H8" />
                          <path d="M13 16H8" />
                        </svg>
                        <span>Create Report</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        disabled
                        className="flex items-center gap-3 text-gray-455 px-3 py-2 cursor-not-allowed text-xs font-semibold opacity-50"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>View SOP</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="hover:text-gray-800"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="px-6 pb-2">
                  {row.type === "Comprehensive" && row.prereqs.length > 0 && (
                    <div className="bg-white rounded-md border border-gray-200 p-4 mt-2">
                      <div className="text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                        Prerequisites / Consumables
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-gray-700" style={{ fontSize: "13px" }}>
                        {row.prereqs.map((p, j) => (
                          <div key={j} className="flex items-center justify-between border border-gray-100 rounded px-3 py-2">
                            <span>{p.itemTitle}</span>
                            <span className="text-gray-500">{p.quantity} {p.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {row.steps.length > 0 ? (
                    <StepPanel steps={row.steps} />
                  ) : (
                    <div className="py-6 text-center text-gray-500" style={{ fontSize: "13px" }}>
                      No steps added yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <AddAmcSopModal onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      )}

      {addStepIndex !== null && (
        <AddStepModal
          onClose={() => setAddStepIndex(null)}
          onSubmit={(newStep) => {
            const targetIndex = addStepIndex;
            setRows((prev) => {
              const updated = [...prev];
              updated[targetIndex] = {
                ...updated[targetIndex],
                steps: [...updated[targetIndex].steps, newStep],
              };
              return updated;
            });
            setAddStepIndex(null);
          }}
        />
      )}

      {arrangeStepsIndex !== null && (
        <ArrangeStepsModal
          initialSteps={rows[arrangeStepsIndex].steps}
          onClose={() => setArrangeStepsIndex(null)}
          onSave={(updatedSteps) => {
            const targetIndex = arrangeStepsIndex;
            setRows((prev) => {
              const updated = [...prev];
              updated[targetIndex] = {
                ...updated[targetIndex],
                steps: updatedSteps,
              };
              return updated;
            });
            setArrangeStepsIndex(null);
          }}
        />
      )}
    </div>
  );
}

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-16 text-center text-gray-500" style={{ fontSize: "14px" }}>
      {name} content coming soon.
    </div>
  );
}

export function MachineDetailPage({ machineName }: { machineName: string }) {
  const [tab, setTab] = useState<Tab>("MAINTENANCE");
  const [on, setOn] = useState(true);

  return (
    <div className="px-2">
      <div className="flex items-center gap-5 mb-6">
        <ToggleSwitch on={on} onToggle={() => setOn((v) => !v)} />
        <h1 className="text-[#3A5764] tracking-wider uppercase" style={{ fontSize: "22px", fontWeight: 600 }}>
          {machineName}
        </h1>
      </div>

      <div className="flex items-center gap-8 border-b border-gray-200 mb-6 overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3A5764]/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3A5764]">
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "py-3 whitespace-nowrap tracking-wider transition-colors " +
                (active
                  ? "text-[#3A5764] border-b-2 border-[#3A5764]"
                  : "text-gray-500 hover:text-gray-800")
              }
              style={{ fontSize: "13px", fontWeight: active ? 600 : 500 }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "MAINTENANCE" ? (
        <MaintenanceTab machineName={machineName} />
      ) : tab === "AMC" ? (
        <AmcTab machineName={machineName} />
      ) : (
        <PlaceholderTab name={tab} />
      )}
    </div>
  );
}
