import { useState, useMemo } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { defaultInventory } from "./inventory-page";

export type AmcType = "Labour-only" | "Comprehensive";

export type PrereqItem = {
  itemTitle: string;
  quantity: number;
  unit: string;
};

export type NewAmcSop = {
  title: string;
  description: string;
  type: AmcType;
  frequency: string;
  lastDone: string;
  dueDate: string;
  status: string;
  prereqs: PrereqItem[];
};

type Props = {
  onClose: () => void;
  onSubmit: (s: NewAmcSop) => void;
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

const getSavedInventory = (): any[] => {
  try {
    const saved = localStorage.getItem("arizon_inventory");
    return saved ? JSON.parse(saved) : defaultInventory;
  } catch (e) {
    console.error("Failed to load inventory from localStorage in AddAmcSopModal:", e);
    return defaultInventory;
  }
};

export function AddAmcSopModal({ onClose, onSubmit }: Props) {
  const inventoryList = useMemo(() => getSavedInventory(), []);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<NewAmcSop>({
    title: "",
    description: "",
    type: "Labour-only",
    frequency: "Monthly",
    lastDone: today,
    dueDate: today,
    status: "OFF",
    prereqs: [],
  });

  const set = <K extends keyof NewAmcSop>(k: K, v: NewAmcSop[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addPrereqRow = () => {
    const first = inventoryList[0];
    set("prereqs", [
      ...form.prereqs,
      { itemTitle: first?.title ?? "", quantity: 1, unit: first?.unit ?? "pcs" },
    ]);
  };

  const updatePrereq = (idx: number, patch: Partial<PrereqItem>) => {
    set(
      "prereqs",
      form.prereqs.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    );
  };

  const removePrereq = (idx: number) => {
    set("prereqs", form.prereqs.filter((_, i) => i !== idx));
  };

  const onItemChange = (idx: number, title: string) => {
    const match = inventoryList.find((it) => it.title === title);
    updatePrereq(idx, { itemTitle: title, unit: match?.unit ?? "pcs" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const cleaned: NewAmcSop = {
      ...form,
      prereqs: form.type === "Comprehensive" ? form.prereqs : [],
    };
    onSubmit(cleaned);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[680px] bg-white rounded-2xl shadow-xl"
      >
        <div className="flex items-center justify-between px-8 pt-7 pb-2">
          <h2 className="text-gray-900" style={{ fontSize: "20px", fontWeight: 600 }}>
            Add AMC SOP
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

          <Field label="AMC Type" required>
            <select
              className={inputCls + " appearance-none pr-10"}
              style={{ fontSize: "14px", ...selectBg }}
              value={form.type}
              onChange={(e) => set("type", e.target.value as AmcType)}
            >
              <option value="Labour-only">Labour-only</option>
              <option value="Comprehensive">Comprehensive</option>
            </select>
          </Field>

          <Field label="Frequency" required>
            <select
              className={inputCls + " appearance-none pr-10"}
              style={{ fontSize: "14px", ...selectBg }}
              value={form.frequency}
              onChange={(e) => set("frequency", e.target.value)}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Every 3 Months</option>
              <option>Yearly</option>
            </select>
          </Field>

          {/* <Field label="Select Last Done" required>
            <input
              type="date"
              className={inputCls}
              style={{ fontSize: "14px" }}
              value={form.lastDone}
              onChange={(e) => set("lastDone", e.target.value)}
            />
          </Field> */}

          <Field label="Select Due Date" required>
            <input
              type="date"
              className={inputCls}
              style={{ fontSize: "14px" }}
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </Field>

          <Field label="Status" required>
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

          {form.type === "Comprehensive" && (
            <Field label="Prerequisites / Consumables">
              <div className="flex flex-col gap-3">
                {form.prereqs.length === 0 && (
                  <div className="text-gray-500" style={{ fontSize: "13px" }}>
                    No items added yet.
                  </div>
                )}
                {form.prereqs.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_120px_70px_36px] gap-2 items-center">
                    <select
                      className={inputCls + " appearance-none pr-10"}
                      style={{ fontSize: "14px", ...selectBg }}
                      value={row.itemTitle}
                      onChange={(e) => onItemChange(idx, e.target.value)}
                    >
                      {inventoryList.map((it) => (
                        <option key={it.partNo} value={it.title}>{it.title}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      style={{ fontSize: "14px" }}
                      value={row.quantity}
                      onChange={(e) => updatePrereq(idx, { quantity: Number(e.target.value) || 0 })}
                    />
                    <div className="text-gray-600 text-center" style={{ fontSize: "13px" }}>{row.unit}</div>
                    <button
                      type="button"
                      onClick={() => removePrereq(idx)}
                      className="text-red-500 hover:text-red-700 flex items-center justify-center"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPrereqRow}
                  className="self-start inline-flex items-center gap-2 text-[#3A5764] hover:text-[#2f4a55] border border-[#3A5764] rounded-md px-3 py-2"
                  style={{ fontSize: "13px" }}
                >
                  <Plus size={14} /> Add another
                </button>
              </div>
            </Field>
          )}
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
