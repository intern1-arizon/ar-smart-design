import { Sun, Pencil, Bell, User } from "lucide-react";

export function TopHeader({ pageLabel }: { pageLabel?: string }) {
  return (
    <header className="flex items-center justify-between gap-5 px-6 py-4">
      <div className="flex items-center gap-4">
        <button className="flex items-center bg-white rounded-full p-1 shadow-sm w-14">
          <span className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white">
            <Sun size={14} />
          </span>
        </button>
        {pageLabel && (
          <span className="text-[#3A5764] tracking-wider" style={{ fontSize: "14px", fontWeight: 600 }}>
            {pageLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button className="text-gray-600 hover:text-gray-900">
          <Pencil size={18} />
        </button>
        <button className="relative text-gray-600 hover:text-gray-900">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <User size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-gray-900" style={{ fontSize: "14px" }}>Jack</div>
            <div className="text-gray-500" style={{ fontSize: "11px" }}>supervisor</div>
          </div>
        </div>
      </div>
    </header>
  );
}
