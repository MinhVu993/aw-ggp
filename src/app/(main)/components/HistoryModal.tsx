import { useTranslation } from "@/context/LanguageContext";
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
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_status")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_empno")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_approver")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_comment")}</th>
              <th style={{ padding: "8px 12px", fontWeight: 600 }}>{t("history_time")}</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rows: any[] = [];
              
              // 1. Add all actual approval logs
              req.approvalLogs?.forEach((log: any) => {
                const step = req.flowSnapshot?.find((s: any) => s.lvl_code === log.lvlCode || s.lvl_code === log.stepName);
                let lvlName = step ? (step.lvl_name?.[language] || step.lvl_name?.vi || step.lvl_name?.en || step.lvl_code) : (log.stepName || "Unknown");
                
                if (log.stepName === 'gate_check' || log.lvlCode === 'gate_check' || log.action === 'GATE_CHECK_PASSED' || log.action === 'GATE_CHECK_DENIED') {
                  lvlName = language === 'vi' ? 'Bảo vệ (Cổng)' : (language === 'zh' ? '警卫 (门禁)' : 'Security Guard');
                }

                let statusText = log.action;
                let statusColor = "#10b981";
                if (log.action === "APPROVE" || log.action === "approved") {
                  statusText = t("btn_approve");
                  statusColor = "#10b981";
                } else if (log.action === "REJECT" || log.action === "rejected") {
                  statusText = t("btn_reject");
                  statusColor = "#ef4444";
                } else if (log.action === "RETURN" || log.action === "returned") {
                  statusText = t("btn_return");
                  statusColor = "#f59e0b";
                } else if (log.action === "GATE_CHECK_PASSED") {
                  statusText = language === 'vi' ? 'ĐÃ QUA CỔNG' : (language === 'zh' ? '已过闸' : 'PASSED GATE');
                  statusColor = "#10b981";
                } else if (log.action === "GATE_CHECK_DENIED") {
                  statusText = language === 'vi' ? 'TỪ CHỐI CHO QUA' : (language === 'zh' ? '拒绝放行' : 'DENIED GATE');
                  statusColor = "#ef4444";
                }

                rows.push({
                  lvlName,
                  statusText,
                  statusColor,
                  approverEmpno: log.approverEmpno || "-",
                  approverName: log.approverName || "-",
                  comment: log.note || "-",
                  timeStr: log.actedAt || "-"
                });
              });

              // 2. Add pending step ONLY if request is actively pending manager approval
              if (req.status === 1) {
                const currentLvlIdx = req.flowSnapshot?.findIndex((s: any) => s.lvl_code === req.currentLvlCode) ?? -1;
                if (currentLvlIdx > -1) {
                  const step = req.flowSnapshot![currentLvlIdx];
                  const lvlName = step.lvl_name?.[language] || step.lvl_name?.vi || step.lvl_name?.en || step.lvl_code;
                  rows.push({
                    lvlName,
                    statusText: t("status_pending_appr"),
                    statusColor: "var(--accent-primary)",
                    approverEmpno: step.managers?.map((m: any) => m.empno).filter(Boolean).join(", ") || "-",
                    approverName: step.managers?.map((m: any) => m.full_name || m.name).filter(Boolean).join(", ") || "-",
                    comment: "-",
                    timeStr: "-"
                  });
                }
              }

              return rows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <td style={{ padding: "8px 12px", color: "var(--text-primary)", fontWeight: 600 }}>
                    {row.lvlName}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{ 
                      display: "inline-block",
                      padding: "2px 6px", 
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      border: `1px solid ${row.statusColor}`,
                      color: row.statusColor,
                      textTransform: "uppercase",
                      borderRadius: "3px"
                    }}>
                      {row.statusText}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>
                    {row.approverEmpno}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-primary)", fontWeight: 500 }}>
                    {row.approverName}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", fontStyle: row.comment !== "-" ? "normal" : "italic" }}>
                    {row.comment}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {row.timeStr}
                  </td>
                </tr>
              ));
            })()}
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
            {t("approval_history")}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className={styles.modalBody} style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", }}>
            {t("request_code")}: <strong style={{ color: "var(--text-primary)" }}>{request.requestCode || `#${request.id}`}</strong>
          </div>
          {request.flowSnapshot && request.flowSnapshot.length > 0 ? (
            renderHistoryTable(request)
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", }}>
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
