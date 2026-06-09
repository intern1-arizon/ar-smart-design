import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { defaultMachines, type Machine } from "./machines-page";
import { amcSopCatalog, frequencyToOccurrences, type AmcSopCatalogEntry } from "./amc-sop-catalog";

export type ScheduleRow = {
  id: string;
  machine: string;
  sopTitle: string;
  sopType: AmcSopCatalogEntry["type"];
  frequency: AmcSopCatalogEntry["frequency"];
  scheduledDate: string;
  completionDate: string;
  status: "Pending" | "Completed" | "Overdue" | "Performed" | "Approved" | "Cancelled" | "Expired";
  remarks: string;
};

type Props = {
  onClose: () => void;
  onGenerate: (rows: ScheduleRow[]) => void;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function CheckList<T>({
  items,
  selectedIds,
  getId,
  getLabel,
  getMeta,
  onToggle,
}: {
  items: T[];
  selectedIds: Set<string>;
  getId: (t: T) => string;
  getLabel: (t: T) => string;
  getMeta?: (t: T) => string;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="max-h-[220px] overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100 [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3A5764]/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3A5764]">
      {items.map((it) => {
        const id = getId(it);
        const checked = selectedIds.has(id);
        return (
          <label key={id} className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(id)}
                className="w-4 h-4 accent-[#3A5764]"
              />
              <span className="text-gray-800" style={{ fontSize: "14px" }}>{getLabel(it)}</span>
            </div>
            {getMeta && (
              <span className="text-gray-500" style={{ fontSize: "12px" }}>{getMeta(it)}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

function getAmcSopsForMachine(machineName: string): { title: string; type: "Labour-only" | "Comprehensive"; frequency: string }[] {
  try {
    const saved = localStorage.getItem(`arizon_amc_${machineName}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load AMC from localStorage", e);
  }
  // Fallbacks using seed data
  if (machineName === "Rapid Mixer Granulator (RMG)") {
    return [
      {
        title: "RMG Annual Maintenance Service",
        type: "Comprehensive",
        frequency: "Yearly",
      }
    ];
  }
  const isDefault = defaultMachines.some((m) => m.name === machineName);
  if (isDefault) {
    return [
      {
        title: "Annual Turret Service",
        type: "Comprehensive",
        frequency: "Yearly",
      },
      {
        title: "Monthly Labour Inspection",
        type: "Labour-only",
        frequency: "Monthly",
      }
    ];
  }
  return [];
}

export function GenerateScheduleModal({ onClose, onGenerate }: Props) {
  const [machineIds, setMachineIds] = useState<Set<string>>(new Set());
  const [sopIds, setSopIds] = useState<Set<string>>(new Set());

  // Load actual configured machines list dynamically
  const machinesList = useMemo(() => {
    try {
      const saved = localStorage.getItem("arizon_machines");
      return saved ? JSON.parse(saved) : defaultMachines;
    } catch (e) {
      console.error("Failed to load machines from localStorage in GenerateScheduleModal:", e);
      return defaultMachines;
    }
  }, []);

  // Filter SOPs based on selected machines dynamically
  const visibleSops = useMemo(() => {
    if (machineIds.size === 0) {
      return [];
    }
    const allSops: { title: string; type: "Labour-only" | "Comprehensive"; frequency: string }[] = [];
    const titlesSeen = new Set<string>();

    machineIds.forEach((machineName) => {
      const sops = getAmcSopsForMachine(machineName);
      sops.forEach((sop) => {
        if (!titlesSeen.has(sop.title)) {
          titlesSeen.add(sop.title);
          allSops.push(sop);
        }
      });
    });

    return allSops;
  }, [machineIds]);

  // Clean up selected SOPs that are no longer visible
  useEffect(() => {
    const visibleSopTitles = new Set(visibleSops.map((s) => s.title));
    setSopIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((title) => {
        if (visibleSopTitles.has(title)) {
          next.add(title);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [visibleSops]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const handleGenerate = () => {
    if (machineIds.size === 0 || sopIds.size === 0) return;
    const machines = machinesList.filter((m) => machineIds.has(m.name));
    const start = new Date();
    const rows: ScheduleRow[] = [];
    machines.forEach((m) => {
      const machineSops = getAmcSopsForMachine(m.name);
      machineSops.forEach((s) => {
        if (sopIds.has(s.title)) {
          const frequency = s.frequency as AmcSopCatalogEntry["frequency"];
          const occs = frequencyToOccurrences(frequency, start, 12);
          occs.forEach((d) => {
            rows.push({
              id: `amc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              machine: m.name,
              sopTitle: s.title,
              sopType: s.type,
              frequency: frequency,
              scheduledDate: formatDate(d),
              completionDate: "",
              status: "Pending",
              remarks: "",
            });
          });
        }
      });
    });
    onGenerate(rows);
  };

  const canSubmit = machineIds.size > 0 && sopIds.size > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4">
      <div className="w-full max-w-[680px] bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-8 pt-7 pb-2">
          <h2 className="text-gray-900" style={{ fontSize: "20px", fontWeight: 600 }}>
            Generate AMC Schedule
          </h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-5 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-700" style={{ fontSize: "14px", fontWeight: 500 }}>
                Select Machines <span>*</span>
              </label>
              <span className="text-gray-500" style={{ fontSize: "12px" }}>{machineIds.size} selected</span>
            </div>
            <CheckList
              items={machinesList}
              selectedIds={machineIds}
              getId={(m) => m.name}
              getLabel={(m) => m.name}
              getMeta={(m) => `Block ${m.block}`}
              onToggle={(id) => toggle(machineIds, setMachineIds, id)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-700" style={{ fontSize: "14px", fontWeight: 500 }}>
                Select AMC SOPs <span>*</span>
              </label>
              <span className="text-gray-500" style={{ fontSize: "12px" }}>{sopIds.size} selected</span>
            </div>
            {visibleSops.length === 0 ? (
              <div className="flex items-center justify-center h-[120px] border border-gray-200 border-dashed rounded-md bg-gray-50 text-gray-400 text-xs font-medium">
                Please select machine(s) above to view applicable SOPs.
              </div>
            ) : (
              <CheckList
                items={visibleSops}
                selectedIds={sopIds}
                getId={(s) => s.title}
                getLabel={(s) => s.title}
                getMeta={(s) => `${s.type} · ${s.frequency}`}
                onToggle={(id) => toggle(sopIds, setSopIds, id)}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-8 pb-7 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-md tracking-wider"
            style={{ fontSize: "13px" }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canSubmit}
            className={
              "px-8 py-2.5 rounded-md text-white " +
              (canSubmit ? "bg-green-500 hover:bg-green-600" : "bg-gray-300 cursor-not-allowed")
            }
            style={{ fontSize: "14px" }}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
