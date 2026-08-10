import { useTranslation } from "@/context/LanguageContext";
import React from 'react';
import { X, Check, MapPin, Package, Copy } from "@phosphor-icons/react";
import styles from "../requests.module.css";
import { RequestItem } from "../types";

interface DetailRequestDrawerProps {
  request: RequestItem | null;
  onClose: () => void;
  onRenew: (req: RequestItem) => void;
  t: (key: string) => string;
  language: string;
}

export default function DetailRequestDrawer({
  request,
  onClose,
  onRenew,
  t,
  language
}: DetailRequestDrawerProps) {
  if (!request) return null;

  const snap: any[] = request.flowSnapshot || [];
  const currentLvl = request.currentLvlCode;
  const currentIdx = snap.length > 0
    ? (currentLvl ? snap.findIndex((f: any) => f.lvl_code === currentLvl) : 0)
    : -1;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>
            {t("access_request")}{" "}
            <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: "1rem", color: "var(--accent-primary)", marginLeft: "0.5rem" }}>
              [{request.requestCode || `#${request.id}`}]
            </span>
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className={styles.drawerContent}>
          {/* ── Approval Flow Stepper ── */}
          {snap.length > 0 && (
            <div className={styles.horizontalScroll} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              flexWrap: "nowrap",
              overflowX: "auto",
              width: "100%",
              padding: "0.5rem 0.25rem 1.25rem 0.25rem",
              gap: "8px",
              borderBottom: "1px dashed var(--glass-border)",
              marginBottom: "0.5rem",
              flexShrink: 0
            }}>
              {snap.map((flow: any, index: number) => {
                const isFullyApproved = request.status === 2 || request.status === 5; // Approved or Completed
                const isRejectedLevel = (request.status === 3 || request.status === 4) && index === currentIdx; // Rejected or Returned
                const isDoneLevel = isFullyApproved || (currentIdx >= 0 && index < currentIdx);
                const isCurrentLevel = !isFullyApproved && !isRejectedLevel && index === currentIdx;
                const stepTitle = flow.lvl_name?.[language] || flow.lvl_name?.vi || flow.lvl_name?.en || flow.lvl_code;
                const primaryManagers = flow.managers || [];
                const managerNames = primaryManagers.map((m: any) => m.full_name || m.name).join(", ");
                const deputyList = primaryManagers.flatMap((m: any) => m.deputies || []);
                const deputyNames = deputyList.map((d: any) => d.full_name || d.name).join(", ");

                return (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <div style={{ flex: "1 0 30px", height: "1px", backgroundColor: "var(--glass-border)", margin: "0 12px", alignSelf: "center" }} />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      {/* Step badge */}
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%",
                        background: isDoneLevel
                          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          : isRejectedLevel
                            ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                            : isCurrentLevel
                              ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                              : "linear-gradient(135deg, #52525b 0%, #3f3f46 100%)",
                        boxShadow: isDoneLevel
                          ? "0 3px 6px rgba(16,185,129,0.3)"
                          : isRejectedLevel
                            ? "0 3px 6px rgba(239,68,68,0.35)"
                            : isCurrentLevel
                              ? "0 3px 6px rgba(245,158,11,0.35)"
                              : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", flexShrink: 0
                      }}>{isDoneLevel
                          ? <Check size={14} weight="bold" />
                          : isRejectedLevel
                            ? <X size={14} weight="bold" />
                            : isCurrentLevel
                              ? <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                              : <span style={{ fontSize: "11px", fontWeight: "700" }}>{index + 1}</span>
                        }</div>
                      {/* Step info */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.3", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "11px", color: isDoneLevel ? "#10b981" : isRejectedLevel ? "#ef4444" : isCurrentLevel ? "#f59e0b" : "var(--text-secondary)", fontWeight: "600" }}>
                          {stepTitle}
                          {isCurrentLevel && <span style={{ marginLeft: "4px", opacity: 0.8 }}>←</span>}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "700" }}>
                          {managerNames || "—"}
                        </div>
                        {deputyNames && (
                          <div style={{ fontSize: "11px", color: "var(--accent-primary)", marginTop: "1px" }}>
                            {deputyNames}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* ── Destination ── */}
          <div className={styles.formGroup} style={{ marginTop: "0.5rem", flexShrink: 0 }}>
            <label className={styles.formLabel}>
              <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
              {t("destination")}
            </label>
            <input type="text" className={styles.formInput} value={request.destination || "—"} readOnly />
          </div>

          {/* ── Date Range & Carrier ── */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexShrink: 0 }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>{t("date_range")}</label>
              <input type="text" className={styles.formInput} value={`${request.startDate || request.requestDate || "—"}  ➜  ${request.endDate || request.requestDate || "—"}`} readOnly style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", color: "var(--accent-primary)", fontWeight: "600" }} />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.formLabel}>{t("carrier_info")}</label>
              <input type="text" className={styles.formInput} value={`${request.carrierEmpno || ""} ${request.carrierName ? `- ${request.carrierName}` : "—"}`} readOnly />
            </div>
          </div>

          {/* ── Additional Info (Note) ── */}
          {request.reason && (
            <div className={`${styles.formGroup} ${styles.formGroupFull}`} style={{ flexShrink: 0, marginTop: "1rem", marginBottom: 0 }}>
              <label className={styles.formLabel} style={{ marginBottom: "4px" }}>{t("note")}</label>
              <textarea className={styles.formTextarea} value={request.reason} readOnly rows={2} style={{ minHeight: "auto", padding: "8px 12px", resize: "vertical" }} />
            </div>
          )}

          {/* ── Return/Reject Reason (if applicable) ── */}
          {request.status === 4 && request.returnReason && (
            <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #f59e0b", borderRadius: "6px", backgroundColor: "rgba(245,158,11,0.05)" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#d97706", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <X size={16} weight="bold" /> {t("rejection_reason")}
              </h4>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-primary)" }}>{request.returnReason}</p>
            </div>
          )}

          {request.status === 3 && request.rejectReason && (
            <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ef4444", borderRadius: "6px", backgroundColor: "rgba(239,68,68,0.05)" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#dc2626", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <X size={16} weight="bold" /> {t("rejection_reason")}
              </h4>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-primary)" }}>{request.rejectReason}</p>
            </div>
          )}

          {/* ── Items list ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: "1 1 auto", minHeight: 0, marginTop: "1rem" }}>
            <div className={styles.formSectionTitle} style={{ marginBottom: "0" }}>
              <Package size={18} weight="bold" color="var(--accent-primary)" />
              {t("items_list")} ({request.items?.length || request.itemCount || 0})
            </div>
            <div className={styles.horizontalScroll} style={{ flex: 1, overflowY: "auto", border: "1px solid var(--glass-border)", borderRadius: "4px", background: "var(--bg-secondary)" }}>
              <table className={styles.table} style={{ margin: 0, width: "100%" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--bg-tertiary)" }}>
                  <tr>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid var(--glass-border)" }}>{t("item_name")}</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid var(--glass-border)", width: "15%" }}>{t("quantity") || "SL"}</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid var(--glass-border)", width: "15%" }}>{t("unit")}</th>
                    <th style={{ padding: "10px 16px", borderBottom: "1px solid var(--glass-border)", width: "35%" }}>{t("purpose")}</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items?.map((item, idx) => (
                    <tr key={`${item.id || ''}-${idx}`}>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{item.name || "-"}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 500, color: "var(--accent-primary)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>{item.quantity || "-"}</td>
                      <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{item.unit || "-"}</td>
                      <td style={{ padding: "10px 16px", color: "var(--text-secondary)" }}>{item.purpose || "-"}</td>
                    </tr>
                  ))}
                  {(!request.items || request.items.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "1rem", color: "var(--text-secondary)" }}>
                        {t("no_item_data")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          {request.requestDate && new Date(request.requestDate) < new Date() && (
            request.renewedToCode ? (
              <span style={{ 
                fontSize: "0.85rem", 
                color: "var(--text-secondary)", 
                padding: "0.5rem 1rem", 
                border: "1px dashed var(--glass-border)",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem"
              }}>
                <Check size={14} weight="bold" color="#10b981" />
                {t("renewed_by")} {request.renewedToCode}
              </span>
            ) : (
              <button type="button" className={styles.btnOutline} onClick={() => onRenew(request)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-primary)", borderColor: "var(--accent-primary)" }}>
                <Copy size={16} weight="bold" /> {t("renew")}
              </button>
            )
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className={styles.btnOutline} onClick={onClose}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
