"use client";

import React, { useEffect, useRef, useState } from "react";
import { Barcode } from "@phosphor-icons/react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  loading: boolean;
}

export default function QRScanner({ onScanSuccess, loading }: QRScannerProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input automatically so the scanner can type into it
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  // Keep focus on the input if user clicks elsewhere
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const token = inputValue.trim();
      if (token) {
        onScanSuccess(token);
        setInputValue(""); // clear for next scan
      }
    }
  };

  return (
    <div 
      onClick={handleContainerClick}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "2rem",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        cursor: "text"
      }}
    >
      {loading && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <div className="spinner" style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTop: "4px solid var(--accent-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <span style={{ fontWeight: 600 }}>Đang xử lý...</span>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      <div style={{
        background: "rgba(16, 185, 129, 0.1)",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#10b981",
        boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)"
      }}>
        <Barcode size={40} weight="bold" />
      </div>

      <div style={{ textAlign: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)" }}>
          Chế độ Máy quét cầm tay
        </h3>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Vui lòng cắm máy quét (USB/Bluetooth) và quét mã QR trên phiếu. Hệ thống đang lắng nghe...
        </p>
      </div>

      <div style={{ width: "100%", position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhấp vào đây và dùng máy quét..."
          style={{
            width: "100%",
            padding: "1rem 1rem 1rem 3rem",
            borderRadius: "8px",
            border: "2px solid var(--accent-primary)",
            background: "rgba(0, 0, 0, 0.2)",
            color: "var(--text-primary)",
            fontSize: "1.1rem",
            outline: "none",
            boxShadow: "0 0 10px rgba(var(--accent-primary-rgb), 0.2)"
          }}
          disabled={loading}
          autoFocus
        />
        <Barcode 
          size={24} 
          style={{ 
            position: "absolute", 
            left: "1rem", 
            top: "50%", 
            transform: "translateY(-50%)",
            color: "var(--accent-primary)" 
          }} 
        />
      </div>
    </div>
  );
}
