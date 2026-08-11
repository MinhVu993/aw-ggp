"use client";

import { useTranslation } from "@/context/LanguageContext";
import React from "react";
import { ScannedRequest } from "../page";
import { Check, X, User, MapPin, Package, CalendarBlank, WarningCircle, CheckCircle, ShieldCheck } from "@phosphor-icons/react";

interface RequestDetailsPanelProps {
  data: ScannedRequest;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function RequestDetailsPanel({ data, onConfirm, onCancel, loading }: RequestDetailsPanelProps) {
  const { t } = useTranslation();
  
  const today = new Date().toISOString().split('T')[0];
  const isDateValid = data.startDate && data.endDate 
    ? (data.startDate <= today && data.endDate >= today)
    : true;

  const isApproved = data.status === "APPROVED_WAITING_GATE";
  const isAlreadyPassed = data.status === "COMPLETED" || data.isQrUsed;
  const canPassGate = isApproved && !isAlreadyPassed;

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
          {canPassGate && (
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
          {isAlreadyPassed && (
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
          )}
          {!isApproved && !isAlreadyPassed && (
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
          background: "var(--bg-primary)",
          border: "1px solid var(--glass-border)",
          padding: "0.6rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, textTransform: "uppercase" }}>
            <CalendarBlank size={15} color="var(--accent-primary)" />
            {t("date_range")}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: !isDateValid ? "#ef4444" : "var(--accent-primary)" }}>
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
          gap: "0.4rem",
          color: "var(--text-primary)"
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
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "50px" }}>STT</th>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700 }}>Tên hàng / Vật liệu</th>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "20%" }}>Số lượng</th>
                <th style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 700, width: "30%" }}>Mục đích mang ra</th>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
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
            background: canPassGate ? "#10b981" : "var(--glass-border)",
            color: canPassGate ? "white" : "var(--text-secondary)",
            fontWeight: 800,
            fontSize: "1rem",
            cursor: (loading || !canPassGate) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: canPassGate ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none"
          }}
        >
          <Check size={20} weight="bold" />
          {loading ? `${t("processing")}...` : isAlreadyPassed ? "ĐÃ XUẤT QUA CỔNG" : "XÁC NHẬN CHO QUA CỔNG"}
        </button>
      </div>
    </div>
  );
}
