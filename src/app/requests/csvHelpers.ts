import { GoodsOutItem, RequestItem } from "./types";

export const exportRequestsToCSV = (
  requests: RequestItem[],
  t: (key: string) => string
) => {
  const headers = [
    t("request_code"),
    t("requester"),
    t("request_date") || "Request Date",
    t("destination") || "Destination",
    t("items") || "Items",
    t("status")
  ];

  const rows = requests.map(r => {
    const itemsStr = r.items?.map(i => `${i.name} [${i.quantity} ${i.unit}]`).join("; ") || "";

    let statusStr = "";
    if (r.status === 1) statusStr = t("status_pending_appr");
    else if (r.status === 2) statusStr = t("status_success");
    else if (r.status === 3) statusStr = t("status_denied");

    return [
      r.requestCode || `#${r.id}`,
      r.requesterName || "",
      r.requestDate || r.startDate || "",
      r.destination || "",
      itemsStr,
      statusStr
    ];
  });

  const csvContent = "\uFEFF" + [headers, ...rows]
    .map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Gate_Pass_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadCSVTemplate = () => {
  const headers = "Tên vật tư,Số lượng,Đơn vị,Mục đích\n";
  const sample = "Máy tính xách tay,1,Cái,Làm việc ở nhà\nTài liệu dự án,5,Cuốn,Gửi đối tác\n";
  const blob = new Blob([headers + sample], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "template_danh_sach_vat_tu.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSVText = (text: string): GoodsOutItem[] => {
  const lines = text.split("\n");
  const parsedItems: GoodsOutItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(",").map(col => col.trim().replace(/^['"]|['"]$/g, ""));
    
    if (cols[0]) {
      parsedItems.push({
        name: cols[0],
        quantity: cols[1] || "",
        unit: cols[2] || "",
        purpose: cols[3] || ""
      });
    }
  }

  return parsedItems;
};
