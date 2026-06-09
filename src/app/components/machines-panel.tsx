import { Eye, BarChart3, MoreVertical } from "lucide-react";
import { type Machine } from "./machines-page";

function MachineCard({ m, onView }: { m: Machine; onView: (name: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1 text-gray-500" style={{ fontSize: "12px" }}>
        <div className="flex items-center gap-4">
          <span>Block: <span className="text-gray-700">{m.block}</span></span>
          <span>Model: <span className="text-gray-700">{m.model}</span></span>
        </div>
        <div>EQP ID: <span className="text-gray-700">{m.eqpId || "—"}</span></div>
      </div>

      <div>
        <div className="text-gray-900" style={{ fontSize: "20px", fontWeight: 600 }}>{m.name}</div>
        <div className="text-gray-500" style={{ fontSize: "12px" }}>{m.description}</div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => onView(m.name)} className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-4 py-2 rounded-md inline-flex items-center gap-2 cursor-pointer" style={{ fontSize: "12px" }}>
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

export function MachinesPanel({
  machines,
  onViewAll,
  onView,
}: {
  machines: Machine[];
  onViewAll?: () => void;
  onView: (name: string) => void;
}) {
  return (
    <section className="bg-white/0">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "28px", fontWeight: 600 }}>Machines</h1>
          <p className="text-gray-550" style={{ fontSize: "13px" }}>List of all Machines & Details</p>
        </div>
        <button onClick={onViewAll} className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-4 py-2.5 rounded-md cursor-pointer" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
          VIEW ALL MACHINES
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {machines.map((m) => (
          <MachineCard key={m.name + m.eqpId} m={m} onView={onView} />
        ))}
      </div>
    </section>
  );
}
