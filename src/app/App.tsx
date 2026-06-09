import { useState, useEffect } from "react";
import { Sidebar } from "./components/sidebar";
import { TopHeader } from "./components/top-header";
import { MachinesPanel } from "./components/machines-panel";
import { MachinesPage, defaultMachines, type Machine } from "./components/machines-page";
import { AddMachinePage } from "./components/add-machine-page";
import { InventoryPage, defaultInventory, type InventoryItem, type InventoryUnit } from "./components/inventory-page";
import { AddInventoryPage } from "./components/add-inventory-page";
import { MachineDetailPage } from "./components/machine-detail-page";
import { SchedulePage } from "./components/schedule-page";
import { MyTaskPage } from "./components/my-task-page";
import { ReportsPage } from "./components/reports-page";
import { QrCode, Hash } from "lucide-react";

type View = "Dashboard" | "Machines" | "AddMachine" | "Inventory Module" | "AddInventory" | "MachineDetail" | "Schedule Module" | "My Task" | "Reports";

export default function App() {
  const [view, setView] = useState<View>("Dashboard");
  
  const [machines, setMachines] = useState<Machine[]>(() => {
    try {
      const saved = localStorage.getItem("arizon_machines");
      return saved ? JSON.parse(saved) : defaultMachines;
    } catch (e) {
      console.error("Failed to load machines from localStorage:", e);
      return defaultMachines;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("arizon_inventory");
      if (saved) {
        const parsed = JSON.parse(saved) as InventoryItem[];
        return parsed.map((item) => {
          const qty = item.quantity || 0;
          const make = item.make || "Generic";
          let units = item.units;
          
          if (!units || units.length !== qty) {
            units = [];
            const partNoClean = (item.partNo || "ITEM").toUpperCase().replace(/\s+/g, "-");
            const today = new Date().toISOString().split("T")[0];
            for (let i = 1; i <= qty; i++) {
              const statusVal = i % 7 === 0 ? "Under Maintenance" : i % 5 === 0 ? "In Use" : "Available";
              units.push({
                itemId: `INV-${partNoClean}-${String(i).padStart(2, "0")}`,
                dateRegistered: today,
                location: "Main Warehouse",
                status: statusVal as any
              });
            }
          }
          
          return {
            ...item,
            make,
            units
          };
        });
      }
      return defaultInventory;
    } catch (e) {
      console.error("Failed to load inventory from localStorage:", e);
      return defaultInventory;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("arizon_machines", JSON.stringify(machines));
    } catch (e) {
      console.error("Failed to save machines to localStorage:", e);
    }
  }, [machines]);

  useEffect(() => {
    try {
      localStorage.setItem("arizon_inventory", JSON.stringify(inventory));
    } catch (e) {
      console.error("Failed to save inventory to localStorage:", e);
    }
  }, [inventory]);

  const [selectedMachineName, setSelectedMachineName] = useState<string>("");

  const activeNav =
    view === "AddMachine" || view === "MachineDetail"
      ? "Machines"
      : view === "AddInventory"
        ? "Inventory Module"
        : view;
  const pageLabel =
    view === "Machines"
      ? "MACHINES"
      : view === "AddMachine"
        ? "ADD-MACHINE"
        : view === "MachineDetail"
          ? "MACHINE DETAILS"
          : view === "Inventory Module"
            ? "INVENTORY"
            : view === "AddInventory"
              ? "ADD-INVENTORY"
              : view === "Schedule Module"
                ? "SCHEDULE"
                : view === "My Task"
                  ? "MY-TASK"
                  : view === "Reports"
                    ? "REPORTS"
                    : undefined;

  const openMachine = (name: string) => {
    setSelectedMachineName(name);
    setView("MachineDetail");
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      <Sidebar active={activeNav} onChange={(label) => setView(label as View)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader pageLabel={pageLabel} />
        <main className="flex-1 px-6 pb-6 min-w-0">
          {view === "Machines" && (
            <MachinesPage machines={machines} onAdd={() => setView("AddMachine")} onView={(m) => openMachine(m.name)} />
          )}
          {view === "AddMachine" && (
            <AddMachinePage
              onCancel={() => setView("Machines")}
              onSubmit={(m) => {
                setMachines((prev) => [...prev, m]);
                setView("Machines");
              }}
            />
          )}
          {view === "Inventory Module" && (
            <InventoryPage items={inventory} onAdd={() => setView("AddInventory")} />
          )}
          {view === "AddInventory" && (
            <AddInventoryPage
              onCancel={() => setView("Inventory Module")}
              onSubmit={(item) => {
                setInventory((prev) => [...prev, item]);
                setView("Inventory Module");
              }}
            />
          )}
          {view === "Schedule Module" && (
            <SchedulePage />
          )}
          {view === "My Task" && (
            <MyTaskPage />
          )}
          {view === "Reports" && (
            <ReportsPage />
          )}
          {view === "MachineDetail" && (
            <MachineDetailPage machineName={selectedMachineName} />
          )}
          {view === "Dashboard" && (
            <MachinesPanel machines={machines} onViewAll={() => setView("Machines")} onView={openMachine} />
          )}
        </main>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#3A5764] hover:scale-105 transition-transform">
          <QrCode size={20} />
        </button>
        <button className="w-12 h-12 rounded-full bg-[#3A5764] shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform">
          <Hash size={20} />
        </button>
      </div>
    </div>
  );
}
