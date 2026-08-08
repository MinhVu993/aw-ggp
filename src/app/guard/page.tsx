"use client";

import React, { useState } from "react";
import QRScanner from "./components/QRScanner";
import RequestDetailsPanel from "./components/RequestDetailsPanel";
import { toast } from "sonner";
import { GoodsOutItem } from "@/app/requests/types";

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
}

export default function GuardPage() {
  const [scannedData, setScannedData] = useState<ScannedRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScanSuccess = async (qrToken: string) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock validation
    if (qrToken === "EXPIRED_TOKEN") {
      toast.error("Mã QR đã hết hạn!");
      setLoading(false);
      return;
    }

    if (qrToken === "USED_TOKEN") {
      toast.error("Mã QR này đã được sử dụng trước đó!");
      setLoading(false);
      return;
    }

    // Mock successful response
    const mockRequest: ScannedRequest = {
      id: 101,
      requestCode: "GGP-20231010-001",
      applicantName: "Nguyễn Văn A",
      applicantDept: "PCC",
      destination: "Nhà máy 2",
      status: "APPROVED_WAITING_GATE",
      qrExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      isQrUsed: false,
      items: [
        { name: "Máy tính xách tay", quantity: "1", unit: "Cái", purpose: "Làm việc tại NM2" },
        { name: "Tài liệu kỹ thuật", quantity: "5", unit: "Bộ", purpose: "Bàn giao dự án" }
      ]
    };

    setScannedData(mockRequest);
    setLoading(false);
    toast.success("Quét mã thành công!");
  };

  const handleConfirmPass = async () => {
    if (!scannedData) return;
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast.success("Đã xác nhận cho qua cổng thành công!");
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
          Cổng An Ninh - Kiểm soát Hàng ra
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Hướng camera vào mã QR trên Phiếu Mang Hàng
        </p>
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
