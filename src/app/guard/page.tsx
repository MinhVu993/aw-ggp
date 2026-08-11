"use client";

import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import QRScanner from "./components/QRScanner";
import RequestDetailsPanel from "./components/RequestDetailsPanel";
import { toast } from "sonner";
import { GoodsOutItem } from "@/app/(main)/types";

export interface ScannedRequest {
  id: number;
  requestCode: string;
  applicantName: string;
  applicantEmpno?: string;
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
  qrCode?: string;
}

export default function GuardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [scannedData, setScannedData] = useState<ScannedRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScanSuccess = async (qrToken: string) => {
    if (!qrToken.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/guard/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: qrToken.trim() })
      });

      const result = await res.json();

      if (result.success && result.data) {
        setScannedData(result.data);
        toast.success(t("qr_success") || "Quét mã thành công");
      } else {
        toast.error(result.error || "Không tìm thấy dữ liệu đơn hàng");
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      toast.error(t("conn_failed") || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPass = async () => {
    if (!scannedData) return;
    setLoading(true);

    try {
      const guardEmpno = user?.empno || user?.group_empno || "000000";
      const guardName = user?.name || user?.full_name;

      const res = await fetch("/api/guard/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: scannedData.id,
          securityGuardEmpno: guardEmpno,
          securityGuardName: guardName,
          gateName: "Cổng Bảo Vệ"
        })
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message || `${t("gate_confirm_success")} (${guardEmpno} - ${guardName})`);
        setScannedData(null);
      } else {
        toast.error(result.error || "Xác nhận qua cổng thất bại");
      }
    } catch (err: any) {
      console.error("Confirm pass error:", err);
      toast.error(t("conn_failed") || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
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
      justifyContent: "center",
      padding: "1rem",
      boxSizing: "border-box"
    }}>
      {!scannedData && (
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {t("guard_title")}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {t("guard_subtitle")}
          </p>
        </div>
      )}

      {!scannedData ? (
        <div style={{ width: "100%", maxWidth: "760px" }}>
          <QRScanner onScanSuccess={handleScanSuccess} loading={loading} />
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "1050px" }}>
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
