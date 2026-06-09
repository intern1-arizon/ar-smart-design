import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

export type NewMaintenance = {
  title: string;
  description: string;
  type: string;
  period: string;
  trainingManual: string;
  lastDone: string;
  dueDate: string;
  status: string;
  imageName: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (m: NewMaintenance) => void;
};

const inputCls =
  "w-full bg-white border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#3A5764] placeholder:text-gray-400";

const selectBg = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
  backgroundPosition: "right 1rem center",
  backgroundRepeat: "no-repeat",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-700" style={{ fontSize: "14px", fontWeight: 500 }}>
        {label} {required && <span>*</span>}
      </label>
      {children}
    </div>
  );
}

export function AddMaintenanceModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<NewMaintenance>({
    title: "",
    description: "",
    type: "",
    period: "Daily",
    trainingManual: "",
    lastDone: new Date().toISOString().slice(0, 10),
    dueDate: new Date().toISOString().slice(0, 10),
    status: "OFF",
    imageName: "",
  });

  const set = <K extends keyof NewMaintenance>(k: K, v: NewMaintenance[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) set("imageName", file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[640px] bg-white rounded-2xl shadow-xl"
      >
        <div className="flex items-center justify-between px-8 pt-7 pb-2">
          <h2 className="text-gray-900" style={{ fontSize: "20px", fontWeight: 600 }}>
            Add Maintenance Schedule
          </h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-5 flex flex-col gap-5">
          <Field label="Title" required>
            <input
              className={inputCls}
              style={{ fontSize: "14px" }}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>

          <Field label="Description" required>
            <textarea
              className={inputCls + " min-h-[90px] resize-y"}
              style={{ fontSize: "14px" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <Field label="Select Type" required>
            <select
              className={inputCls + " appearance-none pr-10"}
              style={{ fontSize: "14px", ...selectBg }}
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Machine Breakdown">Machine Breakdown</option>
              <option value="Routine">Routine</option>
              <option value="Preventive">Preventive</option>
            </select>
          </Field>

          <Field label="Select Period">
            <select
              className={inputCls + " appearance-none pr-10"}
              style={{ fontSize: "14px", ...selectBg }}
              value={form.period}
              onChange={(e) => set("period", e.target.value)}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Every 3 Months</option>
              <option>Yearly</option>
            </select>
          </Field>

          <Field label="Select Training Manuals">
            <select
              className={inputCls + " appearance-none pr-10"}
              style={{ fontSize: "14px", ...selectBg }}
              value={form.trainingManual}
              onChange={(e) => set("trainingManual", e.target.value)}
            >
              <option value="">Select...</option>
              <option value="SOP-001">SOP-001 General Maintenance</option>
              <option value="SOP-022">SOP-022 Lubrication Procedure</option>
              <option value="SOP-045">SOP-045 Cleaning Protocol</option>
            </select>
          </Field>

          <Field label="Select Last Done" required>
            <input
              type="date"
              className={inputCls}
              style={{ fontSize: "14px" }}
              value={form.lastDone}
              onChange={(e) => set("lastDone", e.target.value)}
            />
          </Field>

          <Field label="Select Due Date" required>
            <input
              type="date"
              className={inputCls}
              style={{ fontSize: "14px" }}
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </Field>

          <Field label="Select Status" required>
            <select
              className={inputCls + " appearance-none pr-10"}
              style={{ fontSize: "14px", ...selectBg }}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option>OFF</option>
              <option>ON</option>
            </select>
          </Field>

          <Field label="Add Image">
            <label className="border-2 border-dashed border-gray-300 rounded-md p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#3A5764] hover:bg-gray-50 transition-colors">
              <span className="text-gray-700" style={{ fontSize: "16px", fontWeight: 600 }}>
                {form.imageName || "Drag and Drop / Click to ADD Image"}
              </span>
              <UploadCloud size={36} className="text-[#3A5764]" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </Field>
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
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-md"
            style={{ fontSize: "14px" }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
