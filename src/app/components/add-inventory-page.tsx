import { useState } from "react";
import type { InventoryItem, InventoryUnit } from "./inventory-page";

type Props = {
  onSubmit: (item: InventoryItem) => void;
  onCancel: () => void;
};

type FormState = {
  title: string;
  partNo: string;
  quantity: string;
  unit: string;
  category: string;
  location: string;
  make: string;
  description: string;
};

const empty: FormState = {
  title: "",
  partNo: "",
  quantity: "",
  unit: "pcs",
  category: "",
  location: "",
  make: "",
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
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-gray-300 rounded-md px-4 py-3 outline-none focus:border-[#3A5764] placeholder:text-gray-400";

const selectBg = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
  backgroundPosition: "right 1rem center",
  backgroundRepeat: "no-repeat",
};

export function AddInventoryPage({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [unitFields, setUnitFields] = useState<InventoryUnit[]>([]);

  const set = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleQuantityChange = (val: string) => {
    set("quantity", val);
    const num = Number(val) || 0;

    setUnitFields((prev) => {
      const next = [...prev];
      if (next.length < num) {
        for (let i = next.length; i < num; i++) {
          next.push({
            itemId: "",
            dateRegistered: new Date().toISOString().split("T")[0],
            location: form.location.trim() || "Main Warehouse",
            status: "Available",
          });
        }
      } else if (next.length > num) {
        next.splice(num);
      }
      return next;
    });
  };

  // Sync unit field location when general location is updated
  const handleLocationChange = (val: string) => {
    set("location", val);
    setUnitFields((prev) =>
      prev.map((unit) => {
        // Only override if location is empty or was using the old fallback
        if (!unit.location || unit.location === "Main Warehouse") {
          return { ...unit, location: val.trim() || "Main Warehouse" };
        }
        return unit;
      })
    );
  };

  const updateUnitField = (index: number, field: keyof InventoryUnit, value: string) => {
    setUnitFields((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleAutoFill = () => {
    const qty = Number(form.quantity) || 0;
    const partNoClean = (form.partNo.trim() || "ITEM").toUpperCase().replace(/\s+/g, "-");
    const locClean = form.location.trim() || "Main Warehouse";
    const today = new Date().toISOString().split("T")[0];

    setUnitFields(
      Array.from({ length: qty }, (_, i) => ({
        itemId: `INV-${partNoClean}-${String(i + 1).padStart(2, "0")}`,
        dateRegistered: today,
        location: locClean,
        status: "Available",
      }))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const qty = Number(form.quantity) || 0;
    const finalUnits: InventoryUnit[] = [];

    for (let i = 0; i < qty; i++) {
      const unitId =
        unitFields[i]?.itemId.trim() ||
        `INV-${(form.partNo.trim() || "ITEM").toUpperCase()}-${String(i + 1).padStart(2, "0")}`;
      const unitDate = unitFields[i]?.dateRegistered || new Date().toISOString().split("T")[0];
      const unitLoc = unitFields[i]?.location.trim() || form.location.trim() || "Main Warehouse";
      const unitStatus = unitFields[i]?.status || "Available";

      finalUnits.push({
        itemId: unitId,
        dateRegistered: unitDate,
        location: unitLoc,
        status: unitStatus as any,
      });
    }

    onSubmit({
      title: form.title.trim(),
      description: form.description || "-",
      quantity: qty,
      unit: form.unit || "pcs",
      category: form.category.trim() || "-",
      partNo: form.partNo.trim() || "-",
      make: form.make.trim() || "Generic",
      units: finalUnits,
    });
  };

  const qty = Number(form.quantity) || 0;

  return (
    <div className="flex justify-center pt-2">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[1100px] bg-white border border-gray-200 rounded-2xl shadow-sm p-10"
      >
        <div className="mb-8 text-left">
          <h1 className="text-[#3A5764]" style={{ fontSize: "26px", fontWeight: 600 }}>
            New Inventory Item
          </h1>
          <p className="text-gray-500" style={{ fontSize: "14px" }}>
            Add a component the contractor carries for AMC
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left">
          <div className="flex flex-col gap-6">
            <FloatingField label="Title" required>
              <input
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="Add title here ..."
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </FloatingField>

            <FloatingField label="Make (Brand/Manufacturer)" required>
              <input
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="e.g. Bosch, Arizon, Mobil 1"
                value={form.make}
                onChange={(e) => set("make", e.target.value)}
                required
              />
            </FloatingField>

            <FloatingField label="Quantity" required>
              <input
                type="number"
                min={0}
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="Add quantity here ..."
                value={form.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
              />
            </FloatingField>

            <FloatingField label="General Location" required>
              <input
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="e.g. Warehouse A, Shelf 3"
                value={form.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                required
              />
            </FloatingField>

            <FloatingField label="Category" required>
              <input
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="e.g. Spare Part, Consumable, Tooling"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              />
            </FloatingField>
          </div>

          <div className="flex flex-col gap-6">
            <FloatingField label="Part No." required>
              <input
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="Add part number here ..."
                value={form.partNo}
                onChange={(e) => set("partNo", e.target.value)}
                required
              />
            </FloatingField>

            <FloatingField label="Unit" required>
              <select
                className={inputCls + " appearance-none pr-10 cursor-pointer font-medium"}
                style={{ fontSize: "14px", ...selectBg }}
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="sets">sets</option>
                <option value="kits">kits</option>
                <option value="litres">litres</option>
                <option value="kg">kg</option>
                <option value="rolls">rolls</option>
              </select>
            </FloatingField>

            <FloatingField label="Description" required>
              <input
                className={inputCls}
                style={{ fontSize: "14px" }}
                placeholder="Write details about the item ..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                required
              />
            </FloatingField>
          </div>
        </div>

        {/* Dynamic unit fields registry */}
        {qty > 0 && (
          <div className="mt-8 border-t border-gray-250 pt-6 text-left">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-[#3A5764] font-semibold text-base">
                  Serialized Unit Registry (Total Items = {qty})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Configure details for each individual unit row</p>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                ✨ Auto-fill Unit Registry
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-[350px] overflow-y-auto bg-gray-50">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-[80px]">Unit #</th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Item ID</th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Registered</th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {unitFields.map((field, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 text-sm text-gray-500 font-semibold">{idx + 1}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={field.itemId}
                          onChange={(e) => updateUnitField(idx, "itemId", e.target.value)}
                          placeholder={`e.g. INV-${form.partNo || "ITEM"}-${String(idx + 1).padStart(2, "0")}`}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#3A5764]"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={field.dateRegistered}
                          onChange={(e) => updateUnitField(idx, "dateRegistered", e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#3A5764]"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={field.location}
                          onChange={(e) => updateUnitField(idx, "location", e.target.value)}
                          placeholder="e.g. Warehouse A, Rack 3"
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#3A5764]"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={field.status}
                          onChange={(e) => updateUnitField(idx, "status", e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#3A5764] cursor-pointer font-semibold text-gray-700"
                        >
                          <option value="Available">Available</option>
                          <option value="In Use">In Use</option>
                          <option value="Under Maintenance">Under Maintenance</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <button
            type="button"
            onClick={onCancel}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-md tracking-wider font-semibold cursor-pointer transition-colors shadow-sm"
            style={{ fontSize: "13px" }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2.5 rounded-md font-semibold cursor-pointer transition-colors shadow-sm"
            style={{ fontSize: "14px" }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
