import { useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";

export type InventoryUnit = {
  itemId: string;
  dateRegistered: string;
  location: string;
  status: "Available" | "In Use" | "Under Maintenance";
};

export type InventoryItem = {
  title: string;
  description: string;
  quantity: number;
  unit: string;
  category: string;
  partNo: string;
  make: string;
  units: InventoryUnit[];
};

// Helper function to generate mock unit records for default items based on their quantity
function generateMockUnits(partNo: string, quantity: number, defaultLocation: string, startDate: string): InventoryUnit[] {
  const units: InventoryUnit[] = [];
  for (let i = 1; i <= quantity; i++) {
    // Distribute status
    const statusVal = i % 7 === 0 ? "Under Maintenance" : i % 5 === 0 ? "In Use" : "Available";
    
    // Vary locations slightly
    const bin = String.fromCharCode(65 + (i % 4)); // A, B, C, D
    const loc = defaultLocation.includes("Warehouse") 
      ? `${defaultLocation}, Bin ${bin}`
      : `${defaultLocation}, Zone ${bin}`;
      
    // Vary registration dates
    const dateObj = new Date(startDate);
    dateObj.setDate(dateObj.getDate() + (i * 2));
    const dateStr = dateObj.toISOString().split("T")[0];

    units.push({
      itemId: `INV-${partNo.toUpperCase()}-${String(i).padStart(2, "0")}`,
      dateRegistered: dateStr,
      location: loc,
      status: statusVal
    });
  }
  return units;
}

export const defaultInventory: InventoryItem[] = [
  { 
    title: "Punch Set B-Tool", 
    description: "Tablet press punch set, B-tool standard", 
    quantity: 12, 
    unit: "sets", 
    category: "Tooling", 
    partNo: "PN-PB-001", 
    make: "Bosch Pharma", 
    units: generateMockUnits("PN-PB-001", 12, "Warehouse A, Rack 3", "2026-01-15") 
  },
  { 
    title: "Filter Cartridge", 
    description: "HEPA filter cartridge for FBD intake", 
    quantity: 40, 
    unit: "pcs", 
    category: "Consumable", 
    partNo: "PN-FC-220", 
    make: "Arizon Equipment", 
    units: generateMockUnits("PN-FC-220", 40, "Warehouse B, Shelf 2", "2026-02-10") 
  },
  { 
    title: "Lubrication Oil", 
    description: "Food-grade machine lubrication oil, 5L", 
    quantity: 18, 
    unit: "litres", 
    category: "Consumable", 
    partNo: "PN-LO-5L", 
    make: "Mobil 1", 
    units: generateMockUnits("PN-LO-5L", 18, "Main Facility, Room 101", "2026-03-05") 
  },
  { 
    title: "Drive Belt", 
    description: "Timing belt for compression turret drive", 
    quantity: 6, 
    unit: "pcs", 
    category: "Spare Part", 
    partNo: "PN-DB-077", 
    make: "Gates Group", 
    units: generateMockUnits("PN-DB-077", 6, "Warehouse A, Rack 1", "2026-04-12") 
  },
  { 
    title: "O-Ring Kit", 
    description: "Assorted o-rings for hopper seals", 
    quantity: 25, 
    unit: "kits", 
    category: "Spare Part", 
    partNo: "PN-OR-K12", 
    make: "Parker Hannifin", 
    units: generateMockUnits("PN-OR-K12", 25, "Warehouse B, Shelf 4", "2026-05-01") 
  },
  { 
    title: "Coating Pan Liner", 
    description: "Disposable liner roll for coating drum", 
    quantity: 9, 
    unit: "rolls", 
    category: "Consumable", 
    partNo: "PN-CP-RL", 
    make: "Standard Pharma", 
    units: generateMockUnits("PN-CP-RL", 9, "Warehouse A, Rack 2", "2026-05-20") 
  },
];

export function InventoryPage({ items, onAdd }: { items: InventoryItem[]; onAdd: () => void }) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("By Title");
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // In-modal unit registry filters
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState("All");

  // 1. Filter main inventory
  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.partNo.toLowerCase().includes(q) ||
      (item.make && item.make.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // 2. Sort main inventory
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "By Title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "By Part No") {
      return a.partNo.localeCompare(b.partNo);
    } else if (sortBy === "By Category") {
      return a.category.localeCompare(b.category);
    } else if (sortBy === "By Quantity") {
      return b.quantity - a.quantity;
    }
    return 0;
  });

  // 3. Paginate main inventory
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 4. In-modal filtered units
  const filteredUnits = selectedItem
    ? (selectedItem.units || []).filter(unit => {
        const q = modalSearchQuery.toLowerCase();
        const matchesSearch = 
          unit.itemId.toLowerCase().includes(q) ||
          unit.location.toLowerCase().includes(q);
        const matchesStatus = 
          modalStatusFilter === "All" || 
          unit.status === modalStatusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="px-2">
      <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
        <div>
          <h1 className="text-gray-900" style={{ fontSize: "32px", fontWeight: 500 }}>Inventory</h1>
          <p className="text-gray-600" style={{ fontSize: "14px" }}>Components carried by contractors for AMC</p>
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div className="relative">
            <label className="absolute -top-2 left-3 z-10 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Title, Part No, Make..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-[260px] bg-white border border-gray-300 rounded-md pl-9 pr-3 py-2.5 outline-none focus:border-[#3A5764]"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Sort</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-[150px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none font-medium cursor-pointer"
              style={{
                fontSize: "14px",
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat"
              }}
            >
              <option>By Title</option>
              <option>By Part No</option>
              <option>By Category</option>
              <option>By Quantity</option>
            </select>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-[#F3F4F6] px-1 text-gray-500" style={{ fontSize: "11px" }}>Items</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="appearance-none w-[90px] bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2.5 outline-none font-medium cursor-pointer"
              style={{
                fontSize: "14px",
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%239ca3af' d='M6 8L0 0h12z'/></svg>\")",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat"
              }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>

          <button onClick={onAdd} className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-5 py-2.5 rounded-md cursor-pointer transition-colors shadow-sm font-semibold" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
            ADD ITEM
          </button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 flex flex-col gap-6">
        {/* Main Table: Specifications */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[#3A5764] font-semibold text-base flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#3A5764] rounded-full inline-block"></span>
              Main Table: Specifications
            </h2>
            <div className="text-gray-500 text-xs font-semibold">
              Showing {paginatedItems.length} of {totalItems} items
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Part No.</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Make</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedItems.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/75 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-semibold text-[#3A5764]">{item.partNo}</td>
                      <td className="px-6 py-3.5 text-sm font-bold text-gray-900">{item.title}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 font-medium">{item.make || "-"}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#3A5764]/10 text-[#3A5764] border border-[#3A5764]/20">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-800 font-bold">{item.quantity} {item.unit}</td>
                      <td className="px-6 py-3.5 text-sm text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-4 py-1.5 rounded-md inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm font-semibold"
                          style={{ fontSize: "11px" }}
                        >
                          <Eye size={12} /> VIEW
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                        No inventory items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === idx + 1
                    ? "bg-[#3A5764] text-white font-medium"
                    : "text-gray-500 hover:bg-white"
                }`}
                style={{ fontSize: "13px" }}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Item details modal popup (Big Modal showing 2nd Table) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-150 bg-gray-50">
              <div>
                <h3 className="text-gray-900 font-bold" style={{ fontSize: "18px" }}>
                  {selectedItem.title}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5 font-medium">Specifications &amp; Serialized Item Registry</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalSearchQuery("");
                  setModalStatusFilter("All");
                }}
                className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-250 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-6 overflow-y-auto text-left">
              {/* Specs Grid */}
              <div className="bg-gray-50 p-4.5 rounded-xl border border-gray-150 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Part Number</span>
                  <span className="text-[#3A5764] font-semibold text-sm mt-0.5 block">{selectedItem.partNo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Make</span>
                  <span className="text-gray-900 font-semibold text-sm mt-0.5 block">{selectedItem.make || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category</span>
                  <span className="inline-block bg-[#3A5764]/10 text-[#3A5764] px-2 py-0.5 rounded text-xs font-semibold mt-0.5 border border-[#3A5764]/20">
                    {selectedItem.category}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Quantity</span>
                  <span className="text-emerald-700 font-bold text-sm mt-0.5 block">
                    {selectedItem.quantity} {selectedItem.unit}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description</span>
                <p className="text-gray-650 leading-relaxed mt-1 text-sm bg-gray-50/50 p-3 rounded-lg border border-gray-100 font-medium">
                  {selectedItem.description || "No description provided."}
                </p>
              </div>

              <hr className="border-gray-200" />

              {/* Serialized Unit Registry */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h4 className="text-gray-900 font-bold text-base flex items-center gap-2">
                    <span className="w-1.5 h-4.5 bg-[#3A5764] rounded-full inline-block"></span>
                    Serialized Unit Registry
                  </h4>
                  
                  {/* Modal Search and Filters */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search ID/Location..."
                        value={modalSearchQuery}
                        onChange={(e) => setModalSearchQuery(e.target.value)}
                        className="bg-white border border-gray-300 rounded-md pl-8 pr-2 py-1.5 outline-none focus:border-[#3A5764] text-xs w-[180px]"
                      />
                    </div>
                    <select
                      value={modalStatusFilter}
                      onChange={(e) => setModalStatusFilter(e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-2 py-1.5 outline-none text-xs font-semibold cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Available">Available</option>
                      <option value="In Use">In Use</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200 shadow-sm">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Item ID</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Registered</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUnits.map((unit, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/75 transition-colors">
                          <td className="px-6 py-2.5 text-sm font-semibold text-gray-800">{unit.itemId}</td>
                          <td className="px-6 py-2.5 text-sm text-gray-600 font-medium">{unit.dateRegistered}</td>
                          <td className="px-6 py-2.5 text-sm text-gray-650 font-medium">{unit.location}</td>
                          <td className="px-6 py-2.5 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${
                              unit.status === "In Use"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : unit.status === "Under Maintenance"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-255"
                            }`}>
                              {unit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredUnits.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-xs">
                            No units match your search filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4.5 border-t border-gray-150 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalSearchQuery("");
                  setModalStatusFilter("All");
                }}
                className="bg-[#3A5764] hover:bg-[#2f4a55] text-white px-5 py-2 rounded-md transition-colors font-semibold text-xs cursor-pointer shadow-sm"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
