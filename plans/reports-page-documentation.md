# Reports Page (/reports) Component Documentation

This document explains the routing, tab structure, filtering mechanisms, dynamic content rendering, and sub-components of the main **Reports Page** (`/reports`) in the **Arizon Integration** project.

---

## 1. Routing & Overview

* **Route Entry**: `/reports`
* **Route Declaration**: [PrivateRouteMainChildren.jsx](file:///d:/Arizon/arz-integration/src/route/PrivateRouteMainChildren.jsx)
* **Page Wrapper**: [FatReportPage.jsx](file:///d:/Arizon/arz-integration/src/pages/FatReportPage.jsx)
* **Main Layout Layout**: [FATReport.jsx](file:///d:/Arizon/arz-integration/src/layouts/Reports/FATReport.jsx)

The reports page serves as a unified analytical hub, housing six specialized report categories. Users navigate between them using a tabbed navigation bar at the top of the interface.

---

## 2. Horizontal Tab System & Access Controls

The layout dynamically compiles the list of active tabs based on **module access permissions** (`flattenedModulesConfig`) and **user roles** (e.g., hiding critical sections from trainees).

```javascript
// Available tab definitions
const REPORT_TYPE = [
  {id: "reports-audit", name: "Audit Reports"},
  {id: "reports-change-over", name: "ChangeOver Reports"},
  {id: "reports-maintenance", name: "Maintenance Reports"},
  {id: "reports-training", name: "Training Reports"},
  {id: "reports-oee", name: "OEE Reports"},
  {id: "reports-alarm-sop", name: "Alarm SOP Reports"},
];
```

### Access Restrictions Applied:
1. **Module Enablement Check**: Each tab's `id` is checked against `flattenedModulesConfig[id]`. If disabled in settings, the tab is omitted.
2. **Role Restrictions**: If the operator's role is `"trainee"`, the `"Alarm SOP Reports"` tab is filtered out and hidden entirely.

---

## 3. Global Filters & Pagination Components

The page maintains synchronization across filters (like machine selection) when switching between tabs:

1. **Search Bar (`search` / `searchTerm` state)**:
   * A `TextField` search input that filters report titles, protocols, or creators instantly.
2. **Machine Selector (`MachineDropdown.jsx`)**:
   * A shared dropdown component rendering active machine profiles fetched from `GET /machines`.
   * Selecting a machine updates the `machineId` state and triggers a re-fetch of reports under that machine's scope.
3. **Date Range Filter (`DateRangeMenu` / `DateRangePicker`)**:
   * Rendered in individual tab layouts (like Training & Maintenance) to let operators restrict lists by date.
4. **User Filter**:
   * Filters the report table based on the creator's email address.
5. **Pagination**:
   * Uses MUI's `TablePagination` or `Pagination` to break records into segments (defaulting to 10 items per page).

---

## 4. Tab Layout & Sub-component Specifications

### Tab A: Audit Reports
* **Renders**: Inside `FATReport.jsx` mapping through `FATReports` state.
* **Row Item**: [Item.jsx](file:///d:/Arizon/arz-integration/src/layouts/Reports/Item.jsx)
* **Description**: Lists protocol documents (Factory Acceptance Testing / Site Acceptance Testing) in a table with columns: `Protocol No.`, `Description`, `Performed By`, `Date`, and `Actions`.
* **Actions**:
  1. **Print (PDF)**: Opens a download manager dialog using `<PrintReportPdfMain reportId={data._id} />`.
  2. **Expand / Open details**: Navigates the browser to `/fat-reports/${data._id}` which renders the detailed sections and table templates inside [DataReports.jsx](file:///d:/Arizon/arz-integration/src/layouts/Reports/DataReports.jsx).

```
+-------------------------------------------------------------+
| Protocol No | Description | Performed By | Date  | Actions  |
+-------------+-------------+--------------+-------+----------+
| PR-1004     | FAT check.. | john@ariz..  | 8 Jun | [Print]  |
+-------------------------------------------------------------+
```

---

### Tab B: Training / Maintenance / ChangeOver / Alarm SOP Reports
These tabs follow a cohesive, standardized structure:
* **Main Sub-layouts**:
  * **ChangeOver**: [ChangeOverReportMain.jsx](file:///d:/Arizon/arz-integration/src/layouts/machineData/ChangeOverReportMain.jsx)
  * **Maintenance**: [MaintenanceReportDataMain.jsx](file:///d:/Arizon/arz-integration/src/layouts/machineData/MaintenanceReportDataMain.jsx)
  * **Training**: [TrainingReportDataMain.jsx](file:///d:/Arizon/arz-integration/src/layouts/machineData/TrainingReportDataMain.jsx)
  * **Alarm SOP**: [AlarmSopReportDataMain.jsx](file:///d:/Arizon/arz-integration/src/layouts/machineData/AlarmReports/AlarmSopReportDataMain.jsx)
* **Core Table Structure**:
  * Displays columns: `Title`, `Performed On`, `Done By`, `Remarks`, `Status`, `Actions`.
* **Inline Step Tracker (Collapsible Rows)**:
  * When an operator expands a report row (clicking the chevron icon), it lists the steps in a sidebar.
  * Step buttons are color-coded: **Green** if complete (remarks are logged), and **Red/Pink** if incomplete (no remarks).
  * Right panel renders the read-only step details and instruction media.
* **Three-Dot Action Menu**:
  * **Delete**: Deletes the report (subject to permission keys).
  * **AI Chat and Analysis**: Opens a dialog to chat with an AI assistant regarding the report metrics.
  * **Analysis Report**: Generates an AI-driven summary analysis of execution steps.
  * **Download PDF**: Fetches the report export URL from the PDF generation service.
  * **Perform**: Launches the bottom-up task performance modal (`PerformModal`).

---

### Tab C: OEE Reports
* **Renders**: `src/layouts/oee-reports/OeeReports.jsx` (aliased as `TimelineComponent`)
* **Description**: Visualizes machine utilization timelines and overall equipment effectiveness (OEE) metrics, filtering data based on the chosen machine ID.

---

## 5. Main Backend APIs Called

| Module Tab | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **All Tabs** | GET | `${dbConfig.url}/machines` | Fetches active machine titles and details for filtering. |
| **Audit Reports** | GET | `${dbConfig.url}/fatlist-report` | Fetches paginated compliance audits. |
| **Training Reports** | GET | `${dbConfig.url}/manualReport` | Fetches trainee reports. |
| **ChangeOver Reports** | GET | `${dbConfig.url}/changeoverReport` | Fetches changeover checklists. |
| **Maintenance Reports**| GET | `${dbConfig.url}/maintenanceReport` | Fetches preventative maintenance lists. |
| **Alarm SOP Reports** | GET | `${dbConfig.url}/alarmSopReport` | Fetches alarm troubleshooting logs. |
