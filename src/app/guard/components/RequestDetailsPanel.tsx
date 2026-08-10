"use client";
import { useTranslation } from "@/context/LanguageContext";


import React from "react";
import { ScannedRequest } from "../page";
import { Check, X, User, MapPin, Package, CalendarBlank } from "@phosphor-icons/react";

interface RequestDetailsPanelProps {
  data: ScannedRequest;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function RequestDetailsPanel({ data, onConfirm, onCancel, loading }: RequestDetailsPanelProps) {
  const { t } = useTranslation();
  const isExpired = new Date(data.qrExpiresAt) < new Date();
  
  const today = new Date().toISOString().split('T')[0];
  const isValidDateRange = data.startDate && data.endDate 
    ? (data.startDate <= today && data.endDate >= today)
    : true;

  const isValidStatus = data.status === "APPROVED_WAITING_GATE" && isValidDateRange && !isExpired && !data.isQrUsed;

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(12px)",
      borderRadius: "16px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "1.5rem",
      color: "var(--text-primary)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>
          {t("ticket_details")} {data.requestCode}
        </h2>
        {isValidStatus ? (
          <span style={{
            background: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 600
          }}>
            {t("valid")}
          </span>
        ) : (
          <span style={{
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 600
          }}>
            KHÔNG {t("valid")} {!isValidDateRange ? "(Sai ngày)" : ""}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <User size={18} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("applicant")}</div>
            <div style={{ fontWeight: 600 }}>{data.applicantName} ({data.applicantDept})</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <MapPin size={18} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("destination")}</div>
            <div style={{ fontWeight: 600 }}>{data.destination || "—"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <User size={18} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("carrier_info")}</div>
            <div style={{ fontWeight: 600, color: "var(--accent-primary)" }}>{data.carrierEmpno} {data.carrierName}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CalendarBlank size={18} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{t("date_range")}</div>
            <div style={{ fontWeight: 600, color: !isValidDateRange ? "#ef4444" : "inherit" }}>
              {data.startDate} ➜ {data.endDate}
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Package size={20} color="var(--accent-primary)" />
        {t("items_list")}
      </h3>
      
      <div style={{ 
        background: "rgba(0, 0, 0, 0.2)", 
        borderRadius: "8px", 
        padding: "0.5rem",
        marginBottom: "2rem"
      }}>
        {data.items.map((item, idx) => (
          <div key={idx} style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "1rem",
            padding: "0.75rem",
            borderBottom: idx < data.items.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t("purpose")}: {item.purpose}</div>
            </div>
            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              padding: "4px 12px", 
              borderRadius: "4px",
              fontWeight: 700,
              color: "var(--accent-primary)"
            }}>
              {item.quantity} {item.unit}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button 
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: "0.875rem",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "transparent",
            color: "var(--text-primary)",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: loading ? 0.5 : 1
          }}
        >
          <X size={20} />
          Hủy Bỏ
        </button>
        <button 
          onClick={onConfirm}
          disabled={loading || !isValidStatus}
          style={{
            flex: 2,
            padding: "0.875rem",
            borderRadius: "8px",
            border: "none",
            background: "#10b981", // Green color for confirm
            color: "white",
            fontWeight: 700,
            cursor: (loading || !isValidStatus) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            opacity: (loading || !isValidStatus) ? 0.5 : 1,
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
          }}
        >
          <Check size={20} weight="bold" />
          {loading ? t("processing") : t("confirm_gate")}
        </button>
      </div>
    </div>
  );
}
