/**
 * Utility functions for exporting data to CSV/Excel format.
 */

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;

  // Extract headers from the keys of the first item
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Format value as string and handle null/undefined
      let stringVal = "";
      if (val !== null && val !== undefined) {
        if (typeof val === "object") {
          stringVal = JSON.stringify(val);
        } else {
          stringVal = String(val);
        }
      }
      // Escape double quotes inside values by doubling them
      const escaped = stringVal.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  // Join rows with newlines and create a download blob
  const csvString = csvRows.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
