export type AmcSopCatalogEntry = {
  id: string;
  title: string;
  type: "Labour-only" | "Comprehensive";
  frequency: "Daily" | "Weekly" | "Monthly" | "Every 3 Months" | "Yearly";
};

export const amcSopCatalog: AmcSopCatalogEntry[] = [
  { id: "amc-001", title: "Annual Turret Service", type: "Comprehensive", frequency: "Yearly" },
  { id: "amc-002", title: "Quarterly Drive Inspection", type: "Comprehensive", frequency: "Every 3 Months" },
  { id: "amc-003", title: "Monthly Lubrication", type: "Labour-only", frequency: "Monthly" },
  { id: "amc-004", title: "Weekly Visual Inspection", type: "Labour-only", frequency: "Weekly" },
  { id: "amc-005", title: "Daily Cleanup Check", type: "Labour-only", frequency: "Daily" },
  { id: "amc-006", title: "Biannual Filter Replacement", type: "Comprehensive", frequency: "Every 3 Months" },
];

export function frequencyToOccurrences(
  freq: AmcSopCatalogEntry["frequency"],
  start: Date,
  monthsAhead = 12,
): Date[] {
  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsAhead);
  const out: Date[] = [];
  const cursor = new Date(start);

  const step = (d: Date) => {
    switch (freq) {
      case "Daily":
        d.setDate(d.getDate() + 1);
        break;
      case "Weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "Monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "Every 3 Months":
        d.setMonth(d.getMonth() + 3);
        break;
      case "Yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
    }
  };

  const cap = freq === "Daily" ? 30 : 60;
  while (cursor <= end && out.length < cap) {
    out.push(new Date(cursor));
    step(cursor);
  }
  return out;
}
