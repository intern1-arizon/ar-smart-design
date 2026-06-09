# Add "Inventory Module" to sidebar

## Context
Machines are now treated as Equipment under AMC (Annual Maintenance Contract). To track the components a contractor carries/services as part of an AMC, we need an Inventory module where users can record items with Title, Description, Quantity, Unit, etc. The module is independent of any specific machine or contractor — it's a flat catalog of inventory parts.

## Approach

### 1. Sidebar entry
File: `src/app/components/sidebar.tsx`
- Add a new entry to `primaryNav` directly after `Machines`:
  - `{ icon: Boxes, label: "Inventory Module" }` (import `Boxes` from `lucide-react`).
- No new section/header needed — it lives in the existing primary nav block.

### 2. View routing
File: `src/app/App.tsx`
- Extend the `View` union to include `"Inventory Module"` and `"AddInventory"`.
- Add `inventory` state seeded with `defaultInventory` (similar to how `machines` is seeded from `defaultMachines`).
- Map active sidebar label `"Inventory Module"` → render `InventoryPage`. When AddInventory is active, keep `"Inventory Module"` highlighted in the sidebar (mirrors how `AddMachine` keeps `Machines` active).
- Add `pageLabel` mapping: `"INVENTORY"` / `"ADD-INVENTORY"`.

### 3. Inventory list page (new file)
File: `src/app/components/inventory-page.tsx`
- Mirror the structure of `machines-page.tsx`:
  - Exported `InventoryItem` type and `defaultInventory` seed array with realistic AMC component data (e.g. "Punch Set B-Tool", "Filter Cartridge", "Lubrication Oil").
  - Header with title "Inventory", subtitle, Search/Sort/Items selects, and an `ADD ITEM` button calling `onAdd`.
  - Card grid (reuse the same `bg-gray-100 rounded-xl` wrapper and `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` layout from `machines-page.tsx`).
  - `InventoryCard` displays Title, Description, Quantity + Unit, and any extra fields (see field list below). Buttons: VIEW + the same icon row.

**Fields on the InventoryItem type:**
- `title: string`
- `description: string`
- `quantity: number`
- `unit: string` (e.g. "pcs", "litres", "kg", "rolls")
- `category: string` (the "etc" — useful filtering dimension)
- `partNo: string` (the "etc" — common in AMC parts lists)

### 4. Add Inventory form (new file)
File: `src/app/components/add-inventory-page.tsx`
- Clone the layout/styling of `add-machine-page.tsx` (two-column form, `FloatingField`, `inputCls`, red CANCEL / green Submit buttons).
- Left column: Title, Quantity, Category.
- Right column: Part No., Unit (select with pcs/litres/kg/rolls/sets), Description (textarea-style input).
- Validation: require `title`; default empty strings/zero on submit.

## Files modified / created
- Modify: `src/app/components/sidebar.tsx` (one new nav entry + icon import)
- Modify: `src/app/App.tsx` (new view states, render branches, page label)
- Create: `src/app/components/inventory-page.tsx`
- Create: `src/app/components/add-inventory-page.tsx`

## Reused patterns
- Page shell, search/sort/items controls, card grid → pattern from `src/app/components/machines-page.tsx`.
- Two-column form, `FloatingField`, `inputCls`, CANCEL/Submit footer → pattern from `src/app/components/add-machine-page.tsx`.
- Sidebar primary nav rendering already handles active state and routing — no sidebar logic changes needed beyond the new array entry.

## Verification
- Dev server is already running. Open the preview.
- Click "Inventory Module" in the sidebar → list view renders with seeded items in 4-column grid; header shows `INVENTORY`.
- Click `ADD ITEM` → form renders with both columns; header shows `ADD-INVENTORY`; "Inventory Module" stays highlighted.
- Submit a new item with Title filled → returns to the list view with the new card appended.
- Click CANCEL → returns to the list view without adding anything.
- Confirm the rest of the sidebar still scrolls correctly with the new entry.
