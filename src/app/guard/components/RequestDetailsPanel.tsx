"use client";

import { useTranslation } from "@/context/LanguageContext";
import React, { useState } from "react";
import { ScannedRequest } from "../page";
import { Check, X, User, MapPin, Package, CalendarBlank, WarningCircle, CheckCircle, ShieldCheck, Camera } from "@phosphor-icons/react";
import ImageCarouselModal from "@/components/ui/ImageCarouselModal";

interface RequestDetailsPanelProps {
  data: ScannedRequest;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function RequestDetailsPanel({ data, onConfirm, onCancel, loading }: RequestDetailsPanelProps) {
  const { t } = useTranslation();
  const [previewModal, setPreviewModal] = useState<{ images: string[]; initialIndex: number; title: string } | null>(null);
  
  const getLocalToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const today = getLocalToday();

  const isExpired = Boolean(data.endDate && data.endDate < today);
  const isTooEarly = Boolean(data.startDate && data.startDate > today);
  const isDateValid = !isExpired && !isTooEarly;

  const isApproved = data.status === "APPROVED_WAITING_GATE";
  const isAlreadyPassed = data.status === "COMPLETED" || data.isQrUsed;
  const canPassGate = isApproved && !isAlreadyPassed && isDateValid;

  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--glass-border)",
      padding: "1.25rem 1.5rem",
      color: "var(--text-primary)",
      display: "flex",
      flexDirection: "column",
      gap: "0.9rem",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
      boxSizing: "border-box"
    }}>
      {/* Header & Status Badge */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid var(--glass-border)"
      }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            {t("ticket_details")}
          </div>
          <h2 style={{ fontSize: "1.45rem", margin: "2px 0 0 0", fontWeight: 800, color: "var(--accent-primary)" }}>
            {data.requestCode}
          </h2>
        </div>

        <div>
          {isAlreadyPassed ? (
            <div style={{
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
              border: "1px solid #3b82f6",
              padding: "5px 12px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <ShieldCheck size={18} weight="fill" />
              <span>ĐÃ XÁC NHẬN QUA CỔNG</span>
            </div>
          ) : !isApproved ? (
            <div style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              border: "1px solid #ef4444",
              padding: "5px 12px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <WarningCircle size={18} weight="fill" />
              <span>CHƯA DUYỆT XONG ({data.status})</span>
            </div>
          ) : isExpired ? (
            <div style={{
              background: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              border: "1px solid #ef4444",
              padding: "5px 12px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <WarningCircle size={18} weight="fill" />
              <span>KHÔNG HỢP LỆ — ĐƠN ĐÃ HẾT HẠN</span>
            </div>
          ) : isTooEarly ? (
            <div style={{
              background: "rgba(245, 158, 11, 0.15)",
              color: "#f59e0b",
              border: "1px solid #f59e0b",
              padding: "5px 12px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <WarningCircle size={18} weight="fill" />
              <span>KHÔNG HỢP LỆ — CHƯA ĐẾN NGÀY RA CỔNG</span>
            </div>
          ) : (
            <div style={{
              background: "rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              border: "1px solid #10b981",
              padding: "5px 12px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              <CheckCircle size={18} weight="fill" />
              <span>HỢP LỆ — ĐỦ ĐIỀU KIỆN QUA CỔNG</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Info Blocks in strict 2x2 grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.65rem"
      }}>
        {/* Card 1: Carrier */}
        <div style={{
          background: "rgba(209, 67, 0, 0.08)",
          border: "1px solid var(--accent-primary)",
          padding: "0.6rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, textTransform: "uppercase" }}>
            <User size={15} color="var(--accent-primary)" />
            {t("carrier_info")}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {data.carrierEmpno ? `${data.carrierEmpno} - ` : ""}{data.carrierName || "—"}
          </div>
        </div>

        {/* Card 2: Validity Dates */}
        <div style={{
          background: isExpired ? "rgba(239, 68, 68, 0.08)" : isTooEarly ? "rgba(245, 158, 11, 0.08)" : "var(--bg-primary)",
          border: isExpired ? "1px solid #ef4444" : isTooEarly ? "1px solid #f59e0b" : "1px solid var(--glass-border)",
          padding: "0.6rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}>
          <div style={{ fontSize: "0.72rem", color: isExpired ? "#ef4444" : isTooEarly ? "#f59e0b" : "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, textTransform: "uppercase" }}>
            <CalendarBlank size={15} color={isExpired ? "#ef4444" : isTooEarly ? "#f59e0b" : "var(--accent-primary)"} />
            {t("date_range")} {isExpired ? "(HẾT HẠN)" : isTooEarly ? "(CHƯA ĐẾN HẠN)" : ""}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: isExpired ? "#ef4444" : isTooEarly ? "#f59e0b" : "var(--accent-primary)" }}>
            {data.startDate || "—"}  ➜  {data.endDate || "—"}
          </div>
        </div>

        {/* Card 3: Applicant */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--glass-border)",
          padding: "0.6rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, textTransform: "uppercase" }}>
            <User size={15} color="var(--text-secondary)" />
            {t("applicant")}
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {data.applicantName} {data.applicantEmpno ? `(${data.applicantEmpno})` : ""}
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "6px", fontWeight: 400 }}>| {data.applicantDept || "—"}</span>
          </div>
        </div>

        {/* Card 4: Destination */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--glass-border)",
          padding: "0.6rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, textTransform: "uppercase" }}>
            <MapPin size={15} color="var(--text-secondary)" />
            {t("destination")}
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {data.destination || "—"}
          </div>
        </div>
      </div>

      {/* Items Section - Compact Table */}
      <div>
        <div style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          marginBottom: "0.35rem",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-primary)",
          textTransform: "uppercase"
        }}>
          <Package size={16} color="var(--accent-primary)" weight="bold" />
          <span>{t("items_list")} ({data.items ? data.items.length : 0})</span>
        </div>
        
        <div style={{ 
          background: "var(--bg-primary)", 
          border: "1px solid var(--glass-border)",
          maxHeight: "350px",
          overflowY: "auto"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ position: "sticky", top: 0, background: "var(--bg-secondary)", borderBottom: "1px solid var(--glass-border)", zIndex: 5 }}>
              <tr>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "45px" }}>STT</th>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "25%" }}>Tên hàng / Vật liệu</th>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "15%" }}>Số lượng</th>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "25%" }}>Mục đích mang ra</th>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "35%" }}>Ảnh mẫu đối chiếu</th>
              </tr>
            </thead>
            <tbody>
              {data.items && data.items.length > 0 ? (
                data.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <td style={{ padding: "12px 14px", fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: "12px 14px", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ 
                        background: "rgba(209, 67, 0, 0.12)", 
                        border: "1px solid var(--accent-primary)",
                        padding: "4px 10px", 
                        fontWeight: 700,
                        color: "var(--accent-primary)",
                        fontSize: "0.95rem",
                        display: "inline-block"
                      }}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                      {item.purpose || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {item.images && item.images.length > 0 ? (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                          {item.images.map((imgUrl, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={imgUrl}
                              alt={`Angle ${imgIdx + 1}`}
                              style={{
                                width: "42px",
                                height: "42px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: "1px solid var(--accent-primary)",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
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
                        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", opacity: 0.6 }}>Không có ảnh</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    Không có danh sách hàng hóa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons - Always visible */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
        <button 
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            height: "46px",
            padding: "0 1rem",
            border: "1px solid var(--glass-border)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem"
          }}
        >
          <X size={18} weight="bold" />
          Quét mã khác
        </button>

        <button 
          onClick={onConfirm}
          disabled={loading || !canPassGate}
          style={{
            flex: 2,
            height: "46px",
            padding: "0 1.25rem",
            border: "none",
            background: canPassGate ? "#10b981" : "rgba(239, 68, 68, 0.2)",
            color: canPassGate ? "white" : "#ef4444",
            fontWeight: 800,
            fontSize: "0.95rem",
            cursor: (loading || !canPassGate) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: canPassGate ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none"
          }}
        >
          {canPassGate ? (
            <>
              <Check size={18} weight="bold" />
              <span>XÁC NHẬN CHO QUA CỔNG</span>
            </>
          ) : isExpired ? (
            <>
              <X size={18} weight="bold" />
              <span>ĐƠN ĐÃ HẾT HẠN — KHÔNG THỂ CHO QUA</span>
            </>
          ) : isTooEarly ? (
            <>
              <X size={18} weight="bold" />
              <span>CHƯA ĐẾN NGÀY — KHÔNG THỂ CHO QUA</span>
            </>
          ) : isAlreadyPassed ? (
            <>
              <ShieldCheck size={18} weight="bold" />
              <span>ĐÃ QUA CỔNG TRƯỚC ĐÓ</span>
            </>
          ) : (
            <>
              <WarningCircle size={18} weight="bold" />
              <span>CHƯA ĐỦ ĐIỀU KIỆN QUA CỔNG</span>
            </>
          )}
        </button>
      </div>

      {/* Embla Carousel Modal for Guard */}
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
