import { useState } from "react";
import { X, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

type Step =
  | { kind: "video"; title: string; subtitle: string; src: string }
  | { kind: "image"; title: string; subtitle: string; src: string; alt: string }
  | { kind: "text"; title: string; subtitle: string; body: string }
  | { kind: "audio"; title: string; subtitle: string; src: string };

type Props = {
  initialSteps: Step[];
  onClose: () => void;
  onSave: (steps: Step[]) => void;
};

export function ArrangeStepsModal({ initialSteps, onClose, onSave }: Props) {
  const [steps, setSteps] = useState<Step[]>([...initialSteps]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index - 1];
    newSteps[index - 1] = temp;
    setSteps(newSteps);
  };

  const moveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + 1];
    newSteps[index + 1] = temp;
    setSteps(newSteps);
  };

  const deleteStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(steps);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-10 px-4">
      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-100">
          <h2 className="text-gray-900" style={{ fontSize: "18px", fontWeight: 600 }}>
            Arrange Steps
          </h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto animate-fadeIn">
          {steps.length === 0 ? (
            <div className="text-center text-gray-500 py-8" style={{ fontSize: "14px" }}>
              No steps to arrange. Add some steps first!
            </div>
          ) : (
            steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 truncate" style={{ fontSize: "14px", fontWeight: 500 }}>
                    {step.title}
                  </div>
                  {step.subtitle && (
                    <div className="text-gray-500 truncate" style={{ fontSize: "12px" }}>
                      {step.subtitle}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === steps.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600 transition-colors"
                    title="Move Down"
                  >
                    <ChevronDown size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStep(idx)}
                    className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                    title="Delete Step"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-6 pb-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md tracking-wider transition-colors"
            style={{ fontSize: "13px" }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-7 py-2 rounded-md transition-colors"
            style={{ fontSize: "13px" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
