import { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { GenerateScheduleModal, type ScheduleRow } from "./generate-schedule-modal";

export const defaultSchedules: ScheduleRow[] = [
  {
    id: "amc-seed-1",
    machine: "Rapid Mixer Granulator (RMG)",
    sopTitle: "RMG Annual Maintenance Service",
    sopType: "Comprehensive",
    frequency: "Yearly",
    scheduledDate: "15 Jun 2026",
    completionDate: "",
    status: "Pending",
    remarks: "",
  },
  {
    id: "amc-seed-2",
    machine: "CADMACH",
    sopTitle: "Annual Turret Service",
    sopType: "Comprehensive",
    frequency: "Yearly",
    scheduledDate: "05 Jun 2026",
    completionDate: "05 Jun 2026",
    status: "Completed",
    remarks: "Turret gear alignment corrected. Backlash is within normal limits.",
  },
  {
    id: "amc-seed-3",
    machine: "Korsch",
    sopTitle: "Quarterly Drive Inspection",
    sopType: "Comprehensive",
    frequency: "Every 3 Months",
    scheduledDate: "12 May 2026",
    completionDate: "12 May 2026",
    status: "Completed",
    remarks: "Re-tensioned main belt and checked relay panel. Compliance checks pass.",
  },
  {
    id: "amc-seed-4",
    machine: "Fette Compactin …",
    sopTitle: "Weekly Visual Inspection",
    sopType: "Labour-only",
    frequency: "Weekly",
    scheduledDate: "08 Jun 2026",
    completionDate: "",
    status: "Overdue",
    remarks: "Awaiting contractor availability for inspection.",
  },
  {
    id: "amc-seed-5",
    machine: "CADMACH",
    sopTitle: "Monthly Lubrication",
    sopType: "Labour-only",
    frequency: "Monthly",
    scheduledDate: "09 May 2026",
    completionDate: "",
    status: "Pending",
    remarks: "",
  }
];

export function SchedulePage() {
  const [rows, setRows] = useState<ScheduleRow[]>(() => {
    try {
      const saved = localStorage.getItem("arizon_schedules");
      return saved ? JSON.parse(saved) : defaultSchedules;
    } catch (e) {
      console.error("Failed to load schedules from localStorage:", e);
      return defaultSchedules;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("arizon_schedules", JSON.stringify(rows));
    } catch (e) {
      console.error("Failed to save schedules to localStorage:", e);
    }
  }, [rows]);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | ScheduleRow["status"]>("All");
  const [search, setSearch] = useState("");

  const visible = rows.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (search && !`${r.machine} ${r.sopTitle}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-2">
      <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "32px", fontWeight: 500 }}>Schedule</h1>
          <p className="text-gray-600" style={{ fontSize: "14px" }}>Planned AMC occurrences</p>
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Machine, SOP title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[260px] bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2.5 outline-none focus:border-[#3A5764]"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="appearance-none w-[140px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none"
              style={{ fontSize: "14px" }}
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>

          <button className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#3A5764] text-gray-700 px-4 py-2.5 rounded-md" style={{ fontSize: "13px" }}>
            <Download size={14} /> PDF
          </button>

          <button onClick={() => setModalOpen(true)} className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-5 py-2.5 rounded-md" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
            GENERATE SCHEDULE
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl border border-gray-200 p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3A5764]/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3A5764]">
          <div className="grid grid-cols-[60px_1.4fr_2fr_1.1fr_1.1fr_0.9fr_1.4fr] gap-4 px-6 py-4 bg-gray-100 text-gray-600 min-w-[1000px]" style={{ fontSize: "13px", fontWeight: 500 }}>
            <div>Sl. No</div>
            <div>Machine</div>
            <div>SOP Title</div>
            <div>Scheduled Date</div>
            <div>Completion Date</div>
            <div>Status</div>
            <div>Remarks</div>
          </div>

          {visible.length === 0 && (
            <div className="px-6 py-16 text-center text-gray-500" style={{ fontSize: "14px" }}>
              No schedule generated yet. Click GENERATE SCHEDULE to begin.
            </div>
          )}

          {visible.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[60px_1.4fr_2fr_1.1fr_1.1fr_0.9fr_1.4fr] gap-4 px-6 py-4 border-t border-gray-100 items-center min-w-[1000px]"
              style={{ fontSize: "13px" }}
            >
              <div className="text-gray-700">{i + 1}</div>
              <div className="text-gray-900" style={{ fontWeight: 500 }}>{r.machine}</div>
              <div className="text-gray-700">
                {r.sopTitle}
                <div className="text-gray-500" style={{ fontSize: "12px" }}>{r.sopType} · {r.frequency}</div>
              </div>
              <div className="text-gray-700">{r.scheduledDate}</div>
              <div className="text-gray-700">{r.completionDate || "—"}</div>
              <div>
                <span
                  className={
                    "inline-block px-2 py-1 rounded-md " +
                    (r.status === "Completed" || r.status === "Performed" || r.status === "Approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : r.status === "Overdue" || r.status === "Expired"
                        ? "bg-red-100 text-red-700"
                        : r.status === "Cancelled"
                          ? "bg-gray-150 text-gray-600"
                          : "bg-amber-100 text-amber-700")
                  }
                  style={{ fontSize: "12px" }}
                >
                  {r.status === "Performed" || r.status === "Approved"
                    ? "Completed"
                    : r.status === "Expired"
                      ? "Overdue"
                      : r.status === "Pending"
                        ? "Pending"
                        : r.status}
                </span>
              </div>
              <div className="text-gray-600">{r.remarks || "—"}</div>
            </div>
          ))}
        </div>

        {visible.length > 0 && (
          <div className="flex items-center justify-end gap-3 mt-4 text-gray-600" style={{ fontSize: "13px" }}>
            Showing {visible.length} of {rows.length}
          </div>
        )}
      </div>

      {modalOpen && (
        <GenerateScheduleModal
          onClose={() => setModalOpen(false)}
          onGenerate={(newRows) => {
            setRows((prev) => [...prev, ...newRows]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
