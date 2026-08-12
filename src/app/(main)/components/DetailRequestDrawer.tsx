import { useTranslation } from "@/context/LanguageContext";
import React, { useState } from 'react';
import { X, Check, MapPin, Package, Copy, Camera } from "@phosphor-icons/react";
import styles from "../requests.module.css";
import { RequestItem } from "../types";
import ImageCarouselModal from "@/components/ui/ImageCarouselModal";

interface DetailRequestDrawerProps {
  request: RequestItem | null;
  onClose: () => void;
  onRenew: (req: RequestItem) => void;
  onEdit?: (req: RequestItem) => void;
  user?: any;
  t: (key: string) => string;
  language: string;
}

export default function DetailRequestDrawer({
  request,
  onClose,
  onRenew,
  onEdit,
  user,
  t,
  language
}: DetailRequestDrawerProps) {
  const [previewModal, setPreviewModal] = useState<{ images: string[]; initialIndex: number; title: string } | null>(null);

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
            <span style={{ fontSize: "1rem", color: "var(--accent-primary)", marginLeft: "0.5rem" }}>
              [{request.requestCode || `#${request.id}`}]
            </span>
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className={styles.drawerContent}>
          {/* ── Approval Flow Tracking ── */}
          {snap.length > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "0.75rem 0.25rem 1.25rem 0.25rem",
              borderBottom: "1px dashed var(--glass-border)",
              marginBottom: "0.75rem",
              boxSizing: "border-box",
              flexShrink: 0
            }}>
              {snap.map((flow, index) => {
                const stepTitle = flow.lvl_name?.[language] || flow.lvl_name?.vi || flow.lvl_name?.en || flow.lvl_code;
                const isPassed = request.status === 2 || (currentIdx > index && request.status !== 3);
                const isCurrent = currentIdx === index && request.status === 1;
                const isRejected = request.status === 3 && currentIdx === index;
                const isWaiting = currentIdx < index || (!isPassed && !isCurrent && !isRejected);

                const primaryManagers = flow.managers || [];
                const managerNames = primaryManagers.map((m: any) => m.full_name || m.name).join(", ");
                const deputyList = primaryManagers.flatMap((m: any) => m.deputies || []);
                const deputyNames = deputyList.map((d: any) => d.full_name || d.name).join(", ");

                return (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <div style={{
                        flex: "1 1 20px",
                        height: "1px",
                        backgroundColor: isPassed ? "#10b981" : "rgba(255, 255, 255, 0.15)",
                        margin: "0 12px",
                        alignSelf: "center",
                        minWidth: "15px"
                      }} />
                    )}

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: isPassed
                          ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                          : isRejected
                          ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                          : isCurrent
                          ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                          : "rgba(255, 255, 255, 0.08)",
                        boxShadow: isPassed
                          ? "0 0 0 2px rgba(16, 185, 129, 0.25), 0 2px 6px rgba(16, 185, 129, 0.4)"
                          : isRejected
                          ? "0 0 0 2px rgba(239, 68, 68, 0.25), 0 2px 6px rgba(239, 68, 68, 0.4)"
                          : isCurrent
                          ? "0 0 0 2px rgba(245, 158, 11, 0.25), 0 2px 6px rgba(245, 158, 11, 0.4)"
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isWaiting ? "var(--text-secondary)" : "#fff",
                        flexShrink: 0
                      }}>
                        {isPassed && <Check size={14} weight="bold" />}
                        {isRejected && <X size={14} weight="bold" />}
                        {isCurrent && (
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#fff",
                            boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)"
                          }} />
                        )}
                        {isWaiting && (
                          <span style={{ fontSize: "11px", fontWeight: "700" }}>{index + 1}</span>
                        )}
                      </div>

                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        lineHeight: "1.3"
                      }}>
                        <div style={{
                          fontSize: "11px",
                          color: isCurrent ? "#f59e0b" : isPassed ? "#10b981" : isRejected ? "#ef4444" : "var(--text-secondary)",
                          fontWeight: isCurrent ? "700" : "500"
                        }}>
                          {stepTitle}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "700" }}>
                          {managerNames || "—"}
                        </div>
                        {deputyNames && (
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "1px" }}>
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

          {/* Key Details Card */}
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--glass-border)",
            borderRadius: "6px",
            padding: "0.85rem 1rem",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.75rem",
            flexShrink: 0
          }}>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>{t("requester")}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {request.requesterName}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {request.requesterEmpno} | {request.requesterDept || "—"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>{t("carrier_info")}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {request.carrierName || "—"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {request.carrierEmpno ? `MNV: ${request.carrierEmpno}` : "—"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>{t("date_range")}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                {request.startDate || "—"}  ➜  {request.endDate || "—"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>{t("destination")}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={14} color="var(--accent-primary)" />
                {request.destination || "—"}
              </div>
            </div>
          </div>

          {/* Note / Reason section */}
          {request.reason && (
            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--glass-border)",
              borderRadius: "4px",
              padding: "0.6rem 0.85rem",
              fontSize: "0.85rem",
              color: "var(--text-primary)"
            }}>
              <span style={{ fontWeight: 700, color: "var(--text-secondary)", marginRight: "6px" }}>{t("note") || "Ghi chú"}:</span>
              {request.reason}
            </div>
          )}

          {/* Rejection / Return Reason Banner */}
          {(request.status === 3 || request.status === 4) && request.approvalLogs && (
            (() => {
              const lastLog = [...request.approvalLogs].reverse().find(l => l.comment && (l.status === 'REJECTED' || l.status === 'RETURNED'));
              if (!lastLog) return null;
              return (
                <div style={{
                  background: request.status === 3 ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                  border: `1px solid ${request.status === 3 ? "#ef4444" : "#f59e0b"}`,
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  color: request.status === 3 ? "#ef4444" : "#f59e0b"
                }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "4px" }}>
                    {request.status === 3 ? t("rejection_reason") : t("return_reason")} (bởi {lastLog.approverName || lastLog.approverEmpno})
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>{lastLog.comment}</div>
                </div>
              );
            })()
          )}

          {/* Items List Section */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "180px", gap: "0.4rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
              <Package size={16} color="var(--accent-primary)" weight="bold" />
              {t("items_list")} ({request.items?.length || request.itemCount || 0})
            </div>
            <div className={styles.horizontalScroll} style={{ flex: 1, overflowY: "auto", border: "1px solid var(--glass-border)", borderRadius: "4px", background: "var(--bg-secondary)" }}>
              <table className={styles.table} style={{ margin: 0, width: "100%" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--bg-tertiary)" }}>
                  <tr>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--glass-border)", width: "30%" }}>{t("item_name")}</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--glass-border)", width: "15%" }}>{t("quantity") || "SL"}</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--glass-border)", width: "25%" }}>{t("purpose")}</th>
                    <th style={{ padding: "10px 14px", borderBottom: "1px solid var(--glass-border)", width: "30%" }}>Ảnh đối chiếu</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items?.map((item, idx) => (
                    <tr key={`${item.id || ''}-${idx}`}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-primary)" }}>{item.name || "-"}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--accent-primary)" }}>
                        {item.quantity || "-"} {item.unit || ""}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{item.purpose || "-"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {item.images && item.images.length > 0 ? (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                            {item.images.map((imgUrl, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={imgUrl}
                                alt={`Angle ${imgIdx + 1}`}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  border: "1px solid var(--glass-border)",
                                  cursor: "pointer",
                                  transition: "transform 0.15s ease"
                                }}
                                title="Bấm để xem ảnh phóng to & lướt các góc chụp"
                                onClick={() => setPreviewModal({
                                  images: item.images || [],
                                  initialIndex: imgIdx,
                                  title: `${item.name || `Vật tư ${idx + 1}`} (${(item.images || []).length} góc chụp)`
                                })}
                              />
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.6 }}>Không có ảnh</span>
                        )}
                      </td>
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
          <div style={{ flex: 1 }} />
          {request.status === 4 && onEdit && user && String(user.empno) === String(request.requesterEmpno) && (
            <button 
              type="button" 
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                border: "none",
                background: "#f59e0b",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                marginRight: "0.5rem"
              }}
              onClick={() => {
                onClose();
                onEdit(request);
              }}
            >
              {t("btn_resubmit")}
            </button>
          )}
          <button type="button" className={styles.btnOutline} onClick={onClose}>
            {t("close")}
          </button>
        </div>
      </div>

      {/* Embla Carousel Modal */}
      {previewModal && (
        <ImageCarouselModal
          images={previewModal.images}
          initialIndex={previewModal.initialIndex}
          title={previewModal.title}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </div>
  );
}
