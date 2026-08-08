import React from 'react';
import { Clock, X } from "@phosphor-icons/react";
import styles from "../requests.module.css";
import { RequestItem } from "../types";

interface HistoryModalProps {
  request: RequestItem | null;
  onClose: () => void;
  t: (key: string) => string;
  language: string;
}

export default function HistoryModal({ request, onClose, t, language }: HistoryModalProps) {
  if (!request) return null;

  const renderHistoryTable = (req: RequestItem) => {
    if (!req.flowSnapshot || req.flowSnapshot.length === 0) return null;
    return (
      <div style={{ overflowX: "auto", border: "1px solid var(--glass-border)", borderRadius: "0", background: "var(--bg-secondary)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-tertiary)" }}>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_level")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_info")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_comment")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_time")}</th>
            </tr>
          </thead>
          <tbody>
            {req.flowSnapshot?.map((step: any, idx: number) => {
              const log = req.approvalLogs?.find((l: any) => l.lvlCode === step.lvl_code);
              const currentLvlIdx = req.flowSnapshot?.findIndex((s: any) => s.lvl_code === req.currentLvlCode) ?? -1;
              
              let isNotReached = false;
              let statusText = "";
              let statusColor = "";
              
              if (log) {
                if (log.action === "approved") {
                  statusText = t("btn_approve") || "Đã duyệt";
                  statusColor = "#10b981";
                } else {
                  statusText = t("btn_reject") || "Từ chối";
                  statusColor = "#ef4444";
                }
              } else {
                if (req.status === 3 && req.currentLvlCode === step.lvl_code) {
                  statusText = t("btn_reject") || "Từ chối";
                  statusColor = "#ef4444";
                } else if (req.status === 1 && req.currentLvlCode === step.lvl_code) {
                  statusText = t("status_pending_appr");
                  statusColor = "var(--accent-primary)";
                } else if ((req.status === 2) || (currentLvlIdx > -1 && idx < currentLvlIdx)) {
                  statusText = t("btn_approve") || "Đã duyệt";
                  statusColor = "#10b981";
                } else {
                  isNotReached = true;
                }
              }

              if (isNotReached) return null;

              // Extract info
              let approverInfo = "";
              if (log && log.approverName) {
                approverInfo = `${log.approverEmpno ? log.approverEmpno + " - " : ""}${log.approverName}`;
              } else if (!log && req.status === 1 && req.currentLvlCode === step.lvl_code && step.managers) {
                approverInfo = step.managers.map((m: any) => `${m.empno ? m.empno + " - " : ""}${m.name}`).join(", ");
              }
              
              // Handle custom styling for status tag
              const statusTag = statusText ? (
                <span style={{ 
                  display: "inline-block",
                  padding: "1px 4px", 
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  border: `1px solid ${statusColor}`,
                  color: statusColor,
                  textTransform: "uppercase",
                  marginRight: "6px",
                  borderRadius: "2px"
                }}>
                  {statusText}
                </span>
              ) : null;

              return (
                <tr key={idx} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--text-primary)", fontWeight: 500 }}>
                    {step.lvl_name?.[language] || step.lvl_name?.vi || step.lvl_name?.en || step.lvl_code}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {statusTag}
                      <span>{approverInfo}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                    {log?.note || ""}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                    {log?.actedAt || ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: "800px" }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <Clock size={18} weight="bold" style={{ marginRight: "8px", color: "var(--accent-primary)" }} />
            {t("approval_history") || "Lộ trình & Lịch sử phê duyệt"}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className={styles.modalBody} style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
            {t("request_code")}: <strong style={{ color: "var(--text-primary)" }}>{request.requestCode || `#${request.id}`}</strong>
          </div>
          {request.flowSnapshot && request.flowSnapshot.length > 0 ? (
            renderHistoryTable(request)
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
              {t("no_flow_data")}
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnOutline} onClick={onClose}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
