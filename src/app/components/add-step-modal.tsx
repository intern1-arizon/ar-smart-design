import { useState } from "react";
import { X, Plus, Minus, UploadCloud, Tag } from "lucide-react";

export type NewStep = {
  kind: "video" | "image" | "text" | "audio";
  title: string;
  subtitle: string;
  src: string;
  alt?: string;
  body?: string;
  
  desc: string;
  ans: string;
  stepSignificance: string;
  type: "info" | "camera" | "critical" | "normal";
  tolerance: string;
  hours: string;
  minutes: string;
  seconds: string;
  sensors: string[];
  qrCodes: string[];
  hashtags: string[];
  refImageUrl?: string;
};

type Props = {
  onClose: () => void;
  onSubmit: (step: any) => void;
};

const inputCls =
  "w-full bg-white border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#3A5764] placeholder:text-gray-400 text-gray-800 transition-colors";

const selectBg = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
  backgroundPosition: "right 1rem center",
  backgroundRepeat: "no-repeat",
};

// Mock lists for auto-suggest/select
const MOCK_SENSORS = [
  "Temperature Sensor (T-101)",
  "Pressure Gauge (P-202)",
  "Vibration Transducer (V-303)",
  "Flow Meter (F-404)",
  "Humidity Sensor (H-505)",
  "Proximity Switch (PX-606)"
];

const MOCK_HASHTAGS = [
  "#preventive",
  "#calibration",
  "#monthly",
  "#critical-safety",
  "#lubrication",
  "#operational",
  "#turret-service"
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function AddStepModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<NewStep>({
    kind: "text",
    title: "",
    subtitle: "",
    src: "",
    alt: "",
    body: "",
    desc: "",
    ans: "",
    stepSignificance: "",
    type: "normal",
    tolerance: "",
    hours: "0",
    minutes: "0",
    seconds: "0",
    sensors: [],
    qrCodes: [],
    hashtags: [],
    refImageUrl: "",
  });

  const [sensorSelect, setSensorSelect] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [customHashInput, setCustomHashInput] = useState("");
  const [mediaName, setMediaName] = useState("");
  const [refImageName, setRefImageName] = useState("");

  const set = <K extends keyof NewStep>(k: K, v: NewStep[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addSensor = () => {
    if (sensorSelect && !form.sensors.includes(sensorSelect)) {
      set("sensors", [...form.sensors, sensorSelect]);
      setSensorSelect("");
    }
  };

  const removeSensor = (val: string) => {
    set("sensors", form.sensors.filter((s) => s !== val));
  };

  const addQr = () => {
    const trimmed = qrInput.trim();
    if (trimmed && !form.qrCodes.includes(trimmed)) {
      set("qrCodes", [...form.qrCodes, trimmed]);
      setQrInput("");
    }
  };

  const removeQr = (val: string) => {
    set("qrCodes", form.qrCodes.filter((q) => q !== val));
  };

  const addHash = (hash: string) => {
    const trimmed = hash.trim().startsWith("#") ? hash.trim() : `#${hash.trim()}`;
    if (trimmed && trimmed !== "#" && !form.hashtags.includes(trimmed)) {
      set("hashtags", [...form.hashtags, trimmed]);
    }
  };

  const removeHash = (val: string) => {
    set("hashtags", form.hashtags.filter((h) => h !== val));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaName(file.name);
      set("src", URL.createObjectURL(file)); // Create local URL preview
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.desc.trim() || !form.stepSignificance.trim()) return;

    // Convert values
    const expectedTimeInSeconds =
      parseInt(form.hours || "0") * 3600 +
      parseInt(form.minutes || "0") * 60 +
      parseInt(form.seconds || "0");

    const submission: any = {
      kind: form.kind,
      title: form.title,
      subtitle: form.subtitle || `${form.kind.toUpperCase()} step`,
      desc: form.desc,
      ans: form.ans,
      stepSignificance: form.stepSignificance,
      type: form.type,
      tolerance: form.tolerance ? parseFloat(form.tolerance) : undefined,
      expectedTime: expectedTimeInSeconds,
      sensors: form.sensors,
      qrCodes: form.qrCodes,
      hashtags: form.hashtags,
      refImageUrl: form.type === "camera" ? form.refImageUrl : undefined,
    };

    if (form.kind === "text") {
      submission.body = form.body || form.desc;
    } else {
      submission.src = form.src || "https://videos.pexels.com/video-files/4031736/4031736-uhd_2560_1440_25fps.mp4"; // default placeholder if none
      submission.alt = form.alt;
    }

    onSubmit(submission);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-8 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[800px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-gray-900" style={{ fontSize: "20px", fontWeight: 600 }}>
              Add Verification Step
            </h2>
            <p className="text-gray-500" style={{ fontSize: "12px" }}>
              Define step parameters, media, and integration requirements.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-205 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="px-8 py-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#3A5764_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3A5764]/60 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Row 1: Title & Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Step Title" required>
              <input
                className={inputCls}
                placeholder="e.g. Step 3: Verify Pressure Valve"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </Field>
            <Field label="Step Subtitle">
              <input
                className={inputCls}
                placeholder="e.g. Ensure pressure is within tolerance"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 2: Format & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Format" required>
              <select
                className={inputCls + " appearance-none pr-10"}
                style={selectBg}
                value={form.kind}
                onChange={(e) => set("kind", e.target.value as any)}
              >
                <option value="text">text</option>
                <option value="image">image</option>
                <option value="video">video</option>
                <option value="audio">audio</option>
              </select>
            </Field>
            <Field label="Type" required>
              <select
                className={inputCls + " appearance-none pr-10"}
                style={selectBg}
                value={form.type}
                onChange={(e) => set("type", e.target.value as any)}
              >
                <option value="normal">normal</option>
                <option value="info">info</option>
                <option value="camera">camera</option>
                <option value="critical">critical</option>
              </select>
            </Field>
          </div>

          {/* Row 3: Description & Answer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Description" required>
              <textarea
                className={inputCls + " min-h-[80px] resize-y"}
                placeholder="Detailed description of what to perform..."
                value={form.desc}
                onChange={(e) => set("desc", e.target.value)}
                required
              />
            </Field>
            <Field label="Expected Answer / Validation">
              <textarea
                className={inputCls + " min-h-[80px] resize-y"}
                placeholder="What is the expected reading or check state?"
                value={form.ans}
                onChange={(e) => set("ans", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 4: Step Significance */}
          <Field label="Step Significance" required>
            <textarea
              className={inputCls + " min-h-[60px] resize-y"}
              placeholder="Why is this step critical to machine operation or safety?"
              value={form.stepSignificance}
              onChange={(e) => set("stepSignificance", e.target.value)}
              required
            />
          </Field>

          {/* Row 5: Expected Time & Tolerance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Expected Duration" required>
              <div className="flex gap-2 items-center">
                <div className="flex-1 flex flex-col">
                  <input
                    type="number"
                    min="0"
                    className={inputCls + " text-center px-1"}
                    placeholder="hr"
                    value={form.hours}
                    onChange={(e) => set("hours", e.target.value)}
                  />
                  <span className="text-[10px] text-center text-gray-500 mt-1">Hours</span>
                </div>
                <span className="text-gray-400 font-bold">:</span>
                <div className="flex-1 flex flex-col">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className={inputCls + " text-center px-1"}
                    placeholder="min"
                    value={form.minutes}
                    onChange={(e) => set("minutes", e.target.value)}
                  />
                  <span className="text-[10px] text-center text-gray-500 mt-1">Minutes</span>
                </div>
                <span className="text-gray-400 font-bold">:</span>
                <div className="flex-1 flex flex-col">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className={inputCls + " text-center px-1"}
                    placeholder="sec"
                    value={form.seconds}
                    onChange={(e) => set("seconds", e.target.value)}
                  />
                  <span className="text-[10px] text-center text-gray-500 mt-1">Seconds</span>
                </div>
              </div>
            </Field>

            <Field label="Tolerance (in %)">
              <input
                type="number"
                min="0"
                max="100"
                className={inputCls}
                placeholder="e.g. 5"
                value={form.tolerance}
                onChange={(e) => set("tolerance", e.target.value)}
              />
            </Field>
          </div>

          {/* Row 6: Conditional Textarea / Media Upload */}
          {form.kind === "text" ? (
            <Field label="Text Body Instructions" required>
              <textarea
                className={inputCls + " min-h-[100px] resize-y"}
                placeholder="Add text-only body instructions here..."
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                required
              />
            </Field>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
              <Field label="Upload Media File">
                <label className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#3A5764] hover:bg-gray-100 transition-colors bg-white">
                  <span className="text-gray-700 text-center" style={{ fontSize: "12px", fontWeight: 600 }}>
                    {mediaName || "Drag & Drop / Click to Upload"}
                  </span>
                  <UploadCloud size={28} className="text-[#3A5764]" />
                  <input type="file" className="hidden" accept={`${form.kind}/*`} onChange={handleFile} />
                </label>
              </Field>

              <Field label="Or Enter Media URL">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="https://example.com/media.mp4"
                  value={form.src}
                  onChange={(e) => {
                    set("src", e.target.value);
                    setMediaName("");
                  }}
                />
              </Field>
            </div>
          )}

          {/* Reference Image Upload (only for type === "camera") */}
          {form.type === "camera" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-blue-50/30 p-4 rounded-xl border border-blue-100/60">
              <Field label="Upload Reference Image">
                <label className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#3A5764] hover:bg-gray-100 transition-colors bg-white">
                  <span className="text-gray-700 text-center" style={{ fontSize: "12px", fontWeight: 600 }}>
                    {refImageName || "Drag & Drop / Click to Upload"}
                  </span>
                  <UploadCloud size={28} className="text-[#3A5764]" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRefImageName(file.name);
                        set("refImageUrl", URL.createObjectURL(file));
                      }
                    }} 
                  />
                </label>
              </Field>

              <Field label="Or Enter Reference Image URL">
                <input
                  type="text"
                  className={inputCls}
                  placeholder="https://example.com/reference-image.png"
                  value={form.refImageUrl}
                  onChange={(e) => {
                    set("refImageUrl", e.target.value);
                    setRefImageName("");
                  }}
                />
              </Field>
            </div>
          )}

          {/* Row 7: Sensors & QR Codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sensors column */}
            <div className="flex flex-col gap-2">
              <Field label="Select Sensor Integration">
                <div className="flex gap-2">
                  <select
                    className={inputCls + " appearance-none pr-10 flex-1"}
                    style={selectBg}
                    value={sensorSelect}
                    onChange={(e) => setSensorSelect(e.target.value)}
                  >
                    <option value="">Select Sensor...</option>
                    {MOCK_SENSORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addSensor}
                    className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-md flex items-center justify-center shrink-0"
                    title="Add Sensor"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </Field>

              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.sensors.map((s) => (
                  <span key={s} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[11px] flex items-center gap-1.5 font-medium">
                    {s}
                    <button type="button" onClick={() => removeSensor(s)} className="text-red-500 hover:text-red-700">
                      <Minus size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* QR Codes column */}
            <div className="flex flex-col gap-2">
              <Field label="QR Code Verification Signature">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={inputCls + " flex-1"}
                    placeholder="Signature/Tag ID"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addQr();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addQr}
                    className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-md flex items-center justify-center shrink-0"
                    title="Add QR Signature"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </Field>

              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.qrCodes.map((q) => (
                  <span key={q} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-[11px] flex items-center gap-1.5 font-medium">
                    QR: {q}
                    <button type="button" onClick={() => removeQr(q)} className="text-red-500 hover:text-red-700">
                      <Minus size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 8: Hashtags */}
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
            <Field label="Hashtags">
              <div className="flex flex-wrap gap-2 mb-2">
                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Tag size={12} /> Click preset tags to add:
                </div>
                {MOCK_HASHTAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => addHash(tag)}
                    className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  className={inputCls + " flex-1"}
                  placeholder="Or type custom tag (e.g. safety)"
                  value={customHashInput}
                  onChange={(e) => setCustomHashInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHash(customHashInput);
                      setCustomHashInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    addHash(customHashInput);
                    setCustomHashInput("");
                  }}
                  className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-4 py-2 rounded-md"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  ADD NEW
                </button>
              </div>
            </Field>

            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.hashtags.map((h) => (
                <span key={h} className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1.5 font-medium">
                  {h}
                  <button type="button" onClick={() => removeHash(h)} className="text-red-500 hover:text-red-700 font-bold">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-md tracking-wider transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-8 py-2.5 rounded-md transition-colors"
            style={{ fontSize: "13.5px", fontWeight: 500 }}
          >
            Submit Step
          </button>
        </div>
      </form>
    </div>
  );
}
