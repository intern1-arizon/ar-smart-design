import {
  LayoutDashboard,
  Factory,
  FileBarChart,
  GraduationCap,
  ClipboardList,
  BookOpen,
  PenTool,
  FileText,
  Wrench,
  AlertCircle,
  Video,
  Hash,
  Boxes,
  CalendarClock,
  Box,
  Contact,
  Calendar,
  Settings,
  Cog,
  BookText,
  FileQuestion,
} from "lucide-react";
import logo from "../../imports/arizon_logo.png";

const primaryNav = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Factory, label: "Machines" },
  { icon: Boxes, label: "Inventory Module" },
  { icon: CalendarClock, label: "Schedule Module" },
  { icon: FileBarChart, label: "Reports" },
  // { icon: GraduationCap, label: "Training Request" },
  { icon: ClipboardList, label: "My Task" },
  { icon: BookOpen, label: "Library" },
  // { icon: PenTool, label: "Canvas" },
  // { icon: FileText, label: "DPR" },
  { icon: Wrench, label: "Utilities" },
];

const secondaryNav: any[] = [
  // { icon: AlertCircle, label: "Issue Module" },
  // { icon: Video, label: "Video Call" },
  // { icon: Hash, label: "Hash Tags" },
  // { icon: Box, label: "3D View" },
];

const userNav = [
  // { icon: Contact, label: "Account" },
  // { icon: Calendar, label: "Calendar" },
];

const othersNav = [
  // { icon: Settings, label: "Settings" },
  { icon: Cog, label: "AI Configuration" },
  { icon: BookText, label: "Audit Trail" },
];

const helpNav = [
  { icon: FileQuestion, label: "User Manual" },
];

type Props = {
  active: string;
  onChange: (label: string) => void;
};

export function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="sidebar-scroll w-[230px] shrink-0 bg-[#3A5764] text-white min-h-screen flex flex-col py-6 px-4 sticky top-0 h-screen overflow-y-auto">
      <div className="flex justify-center mb-8">
        <img src={logo} alt="Arizon logo" className="h-14 w-auto object-contain rounded-lg" />
      </div>

      <nav className="flex flex-col gap-1">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => onChange(item.label)}
              className={
                isActive
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-md bg-gradient-to-r from-white to-white/90 text-[#3A5764]"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-md text-white/90 hover:bg-white/10 transition-colors"
              }
            >
              <Icon size={18} />
              <span style={{ fontSize: "14px" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {/* <div className="px-3 mb-2 text-white/50 uppercase tracking-wider" style={{ fontSize: "11px" }}>
          Overview
        </div> */}
        <nav className="flex flex-col gap-1">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => onChange(item.label)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-white/90 hover:bg-white/10 transition-colors"
              >
                <Icon size={18} />
                <span style={{ fontSize: "14px" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {[
        // { title: "User", items: userNav },
        { title: "Others", items: othersNav },
        { title: "Help", items: helpNav },
      ].map((section) => (
        <div key={section.title} className="mt-8">
          <div className="px-3 mb-2 text-white/50 uppercase tracking-wider" style={{ fontSize: "11px" }}>
            {section.title}
          </div>
          <nav className="flex flex-col gap-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => onChange(item.label)}
                  className={
                    isActive
                      ? "flex items-center gap-3 px-3 py-2.5 rounded-md bg-gradient-to-r from-white to-white/90 text-[#3A5764]"
                      : "flex items-center gap-3 px-3 py-2.5 rounded-md text-white/90 hover:bg-white/10 transition-colors"
                  }
                >
                  <Icon size={18} />
                  <span style={{ fontSize: "14px" }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
