"use client";

import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import QRScanner from "./components/QRScanner";
import RequestDetailsPanel from "./components/RequestDetailsPanel";
import { toast } from "sonner";
import { GoodsOutItem } from "@/app/(main)/types";
import { ShieldCheck } from "@phosphor-icons/react";

// Mock API response type
export interface ScannedRequest {
  id: number;
  requestCode: string;
  applicantName: string;
  applicantDept: string;
  destination: string;
  items: GoodsOutItem[];
  status: string;
  qrExpiresAt: string;
  isQrUsed: boolean;
  startDate: string;
  endDate: string;
  carrierEmpno: string;
  carrierName: string;
}

export default function GuardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [scannedData, setScannedData] = useState<ScannedRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScanSuccess = async (qrToken: string) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock validation
    if (qrToken === "EXPIRED_TOKEN") {
      toast.error(t("qr_expired"));
      setLoading(false);
      return;
    }

    if (qrToken === "USED_TOKEN") {
      toast.error(t("qr_used"));
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Mock successful response
    const mockRequest: ScannedRequest = {
      id: 101,
      requestCode: "GGP-20231010-001",
      applicantName: "Nguyễn Văn A",
      applicantDept: "PCC",
      destination: "",
      status: "APPROVED_WAITING_GATE",
      qrExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      isQrUsed: false,
      startDate: today,
      endDate: today,
      carrierEmpno: "V00123",
      carrierName: "Trần Bảo Vệ",
      items: [
        { name: "Máy tính xách tay", quantity: "1", unit: "Cái", purpose: "Làm việc tại NM2" },
        { name: "Tài liệu kỹ thuật", quantity: "5", unit: "Bộ", purpose: "Bàn giao dự án" }
      ]
    };

    setScannedData(mockRequest);
    setLoading(false);
    toast.success(t("qr_success"));
  };

  const handleConfirmPass = async () => {
    if (!scannedData) return;
    setLoading(true);

    const guardEmpno = user?.empno || "N/A";
    const guardName = user?.name || "Bảo vệ";

    // Payload sent to backend includes security_guard_empno and security_guard_name
    console.log("Confirming pass with Guard info:", {
      requestId: scannedData.id,
      securityGuardEmpno: guardEmpno,
      securityGuardName: guardName,
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success(`${t("gate_confirm_success")} (${guardEmpno} - ${guardName})`);
    setScannedData(null);
    setLoading(false);
  };

  const handleCancel = () => {
    setScannedData(null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "2rem 1rem"
    }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
          {t("guard_title")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          {t("guard_subtitle")}
        </p>

        {/* Guard Session Info Badge from AuthComp */}
        {user && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--glass-border)",
            borderRadius: "20px",
            padding: "6px 16px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            marginTop: "0.75rem"
          }}>
            <ShieldCheck size={18} color="var(--accent-primary)" />
            <span>Bảo vệ trực ca: <strong style={{ color: "var(--text-primary)" }}>{user.empno ? `${user.empno} - ` : ""}{user.name}</strong></span>
          </div>
        )}
      </div>

      {!scannedData ? (
        <div style={{ width: "100%", maxWidth: "500px" }}>
          <QRScanner onScanSuccess={handleScanSuccess} loading={loading} />
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <RequestDetailsPanel 
            data={scannedData} 
            onConfirm={handleConfirmPass} 
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
