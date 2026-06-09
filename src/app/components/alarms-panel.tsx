import { Bell, ChevronDown } from "lucide-react";

type Alarm = {
  event: string;
  timestamp: string;
  value: string;
  machine: string;
  critical: boolean;
};

const alarms: Alarm[] = [
  { event: "PROCESS", timestamp: "May 8th 2025, 3:16:02", value: "ALARM", machine: "CADMACH", critical: true },
  { event: "TEMPERATURE", timestamp: "May 8th 2025, 2:58:21", value: "NORMAL", machine: "Fette Compacting", critical: false },
  { event: "PRESSURE", timestamp: "May 8th 2025, 2:45:10", value: "ALARM", machine: "GEA Modul P", critical: true },
  { event: "VIBRATION", timestamp: "May 8th 2025, 2:30:55", value: "NORMAL", machine: "IMA Comprima", critical: false },
  { event: "FEED RATE", timestamp: "May 8th 2025, 2:12:33", value: "ALARM", machine: "Bosch Capsule", critical: true },
  { event: "HUMIDITY", timestamp: "May 8th 2025, 1:55:08", value: "NORMAL", machine: "Glatt FBD", critical: false },
];

export function AlarmsPanel() {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-4">
      <div className="mb-4">
        <h2 className="text-gray-900" style={{ fontSize: "20px", fontWeight: 600 }}>Alarms</h2>
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Some Alarms</p>
      </div>

      <div className="relative mb-4">
        <select className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-md px-3 py-2 pr-8 text-gray-600 outline-none" style={{ fontSize: "13px" }} defaultValue="">
          <option value="" disabled>Machine</option>
          <option>CADMACH</option>
          <option>Fette Compacting</option>
          <option>GEA Modul P</option>
        </select>
        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <div className="flex flex-col gap-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
        {alarms.map((a, i) => (
          <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${a.critical ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
              <Bell size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-gray-900 truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                {a.event} : {a.timestamp}
              </div>
              <div className="text-gray-600" style={{ fontSize: "12px" }}>
                Value: <span className={a.critical ? "text-red-500" : "text-green-600"}>{a.value}</span>
              </div>
              <div className="text-gray-400" style={{ fontSize: "11px" }}>{a.machine}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
