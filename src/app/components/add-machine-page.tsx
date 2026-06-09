import { useState } from "react";
import type { Machine } from "./machines-page";

type Props = {
  onSubmit: (m: Machine) => void;
  onCancel: () => void;
};

const fields: { key: keyof FormState; label: string; placeholder: string; column: "left" | "right" }[] = [
  { key: "name", label: "Machine Name", placeholder: "Add machine name here ...", column: "left" },
  { key: "eqpId", label: "Equipment ID", placeholder: "Add equipment ID here ...", column: "right" },
  { key: "serialNo", label: "Serial No.", placeholder: "Add serial no here ...", column: "left" },
  { key: "model", label: "Model", placeholder: "Add model here ...", column: "right" },
  { key: "block", label: "Block", placeholder: "Add block here ...", column: "left" },
  { key: "location", label: "Machine Location", placeholder: "Write machine location here....", column: "right" },
  { key: "warranty", label: "Warranty", placeholder: "Add warranty here ...", column: "left" },
  { key: "status", label: "Status", placeholder: "Add status here ...", column: "right" },
  { key: "vendor", label: "Vendor", placeholder: "Add vendor here ...", column: "left" },
  { key: "user", label: "User", placeholder: "Add user here ...", column: "right" },
  { key: "contractor", label: "Contractor (AMC)", placeholder: "Add AMC contractor here ...", column: "left" },
];

type FormState = {
  name: string;
  eqpId: string;
  serialNo: string;
  model: string;
  block: string;
  location: string;
  warranty: string;
  status: string;
  vendor: string;
  user: string;
  contractor: string;
  line: string;
  description: string;
};

const empty: FormState = {
  name: "",
  eqpId: "",
  serialNo: "",
  model: "",
  block: "",
  location: "",
  warranty: "",
  status: "",
  vendor: "",
  user: "",
  contractor: "",
  line: "",
  description: "",
};

function FloatingField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[#3A5764]" style={{ fontSize: "14px", fontWeight: 500 }}>
        {label} {required && <span>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#3A5764] placeholder:text-gray-400";

export function AddMachinePage({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(empty);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      block: form.block || "-",
      model: form.model || "-",
      eqpId: form.eqpId || "-",
      name: form.name,
      description: form.description || "-",
      vendor: form.vendor || "-",
      user: form.user || "-",
      contractor: form.contractor || "-",
    });
  };

  const left = fields.filter((f) => f.column === "left");
  const right = fields.filter((f) => f.column === "right");

  return (
    <div className="flex justify-center pt-2">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[1100px] bg-white border border-gray-200 rounded-2xl shadow-sm p-10"
      >
        <div className="mb-8">
          <h1 className="text-[#3A5764]" style={{ fontSize: "26px", fontWeight: 600 }}>
            New Machines
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            Add information about new machine
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="flex flex-col gap-6">
            {left.map((f) => (
              <FloatingField key={f.key} label={f.label} required>
                <input
                  className={inputCls}
                  style={{ fontSize: "14px" }}
                  placeholder={f.placeholder}
                  value={form[f.key] as string}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              </FloatingField>
            ))}

            <FloatingField label="Line" required>
              <select
                className={inputCls + " appearance-none pr-10 bg-no-repeat"}
                style={{
                  fontSize: "14px",
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
                  backgroundPosition: "right 1rem center",
                }}
                value={form.line}
                onChange={(e) => set("line", e.target.value)}
              >
                <option value="">Select a line</option>
                <option value="Line A">Line A</option>
                <option value="Line B">Line B</option>
                <option value="Line C">Line C</option>
              </select>
            </FloatingField>
          </div>

          <div className="flex flex-col gap-6">
            {right.map((f) => (
              <FloatingField key={f.key} label={f.label} required>
                <input
                  className={inputCls}
                  style={{ fontSize: "14px" }}
                  placeholder={f.placeholder}
                  value={form[f.key] as string}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              </FloatingField>
            ))}

            <FloatingField label="Machine Description" required>
              <input
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="Write details about machine here ..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </FloatingField>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10">
          <button
            type="button"
            onClick={onCancel}
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
