import { Search, Eye, BarChart3, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";

export type Machine = {
  block: string;
  model: string;
  eqpId: string;
  name: string;
  description: string;
  vendor: string;
  user: string;
  contractor: string;
};

export const defaultMachines: Machine[] = [
  { block: "1", model: "RMG-200", eqpId: "RMG-20260608", name: "Rapid Mixer Granulator (RMG)", description: "Rapid Mixer Granulator for wet mixing and granulation", vendor: "Pharmatech India", user: "S. Sharma", contractor: "Arizon Services" },
  { block: "3", model: "C-300", eqpId: "", name: "CADMACH", description: "double press compression machine", vendor: "Cadmach Machinery", user: "R. Sharma", contractor: "ProMaint Services" },
  { block: "CWH", model: "DEV-PROTO", eqpId: "DM-20250718", name: "DEVELOPMENT-MAC …", description: "DEV TEST MACHINE", vendor: "In-house", user: "Dev Team", contractor: "—" },
  { block: "MUPs", model: "3200i", eqpId: "", name: "Fette Compactin …", description: "Double compressor Tableting Machine, Fette compacting, Model…", vendor: "Fette GmbH", user: "A. Patel", contractor: "Fette AMC" },
  { block: "compressor l", model: "5600", eqpId: "", name: "Korsch", description: "Korsch tablet compressing machine", vendor: "Korsch AG", user: "M. Iyer", contractor: "Korsch India" },
];

function MachineCard({ m, onView }: { m: Machine; onView: (m: Machine) => void }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col gap-4 min-h-[280px]">
      <div className="flex flex-col gap-1 text-gray-700" style={{ fontSize: "13px" }}>
        <div className="flex items-center justify-between gap-3">
          <span><span className="text-gray-500">Block:</span> {m.block}</span>
          <span><span className="text-gray-500">Model:</span> {m.model}</span>
        </div>
        <div>
          <span className="text-gray-500">EQP ID:</span> {m.eqpId}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span><span className="text-gray-500">Vendor:</span> {m.vendor}</span>
          <span><span className="text-gray-500">User:</span> {m.user}</span>
        </div>
        <div>
          <span className="text-gray-500">Contractor:</span> {m.contractor}
        </div>
      </div>

      <div className="flex-1">
        <div className="text-gray-900 mb-1" style={{ fontSize: "20px", fontWeight: 500 }}>{m.name}</div>
        <div className="text-gray-600" style={{ fontSize: "13px" }}>{m.description}</div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => onView(m)} className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-4 py-2 rounded-md inline-flex items-center gap-2" style={{ fontSize: "12px" }}>
          <Eye size={14} /> VIEW
        </button>
        <div className="flex items-center gap-3 text-gray-500">
          <BarChart3 size={18} />
          <MoreVertical size={18} />
        </div>
      </div>
    </div>
  );
}

export function MachinesPage({ machines, onAdd, onView }: { machines: Machine[]; onAdd: () => void; onView: (m: Machine) => void }) {
  return (
    <div className="px-2">
      <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "32px", fontWeight: 500 }}>Machine</h1>
          <p className="text-gray-600" style={{ fontSize: "14px" }}>List of all Machines &amp; Details</p>
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Name, EQP ID"
                className="w-[260px] bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2.5 outline-none focus:border-[#3A5764]"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Sort</label>
            <select
              className="appearance-none w-[150px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none"
              style={{ fontSize: "14px" }}
              defaultValue="By Name"
            >
              <option>By Name</option>
              <option>By EQP ID</option>
              <option>By Block</option>
            </select>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Items</label>
            <select
              className="appearance-none w-[90px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none"
              style={{ fontSize: "14px" }}
              defaultValue="6"
            >
              <option>6</option>
              <option>12</option>
              <option>24</option>
            </select>
          </div>

          <button onClick={onAdd} className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-5 py-2.5 rounded-md" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
            ADD MACHINE
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {machines.map((m, i) => (
            <MachineCard key={i} m={m} onView={onView} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-white">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 rounded-full bg-[#3A5764] text-white flex items-center justify-center" style={{ fontSize: "13px" }}>
            1
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
