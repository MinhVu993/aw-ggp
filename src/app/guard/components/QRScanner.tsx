"use client";

import { useTranslation } from "@/context/LanguageContext";
import React, { useEffect, useRef, useState } from "react";
import { Barcode, MagnifyingGlass } from "@phosphor-icons/react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  loading: boolean;
}

export default function QRScanner({ onScanSuccess, loading }: QRScannerProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Persistent auto-focus mechanism
  useEffect(() => {
    const focusInput = () => {
      if (!loading && inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    focusInput();

    // 1. Re-focus on any mouse click anywhere on the page
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow clicking the "Kiểm tra" submit button without preventing its click event
      if (target && target.closest("button")) {
        return;
      }
      focusInput();
    };

    // 2. Re-focus when window/tab gets focus
    const handleWindowFocus = () => {
      focusInput();
    };

    // 3. Catch key presses anywhere on page and direct to input
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (loading) return;
      if (document.activeElement !== inputRef.current && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("click", handleDocumentClick);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("keydown", handleGlobalKeyDown);

    // Periodic check to ensure focus is never lost
    const interval = setInterval(() => {
      focusInput();
    }, 400);

    return () => {
      window.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("keydown", handleGlobalKeyDown);
      clearInterval(interval);
    };
  }, [loading]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If not clicking button, quickly restore focus
    if (!loading) {
      setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleSubmit = () => {
    const token = inputValue.trim();
    if (token) {
      onScanSuccess(token);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div 
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--glass-border)",
        padding: "2.25rem 2.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        position: "relative",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
        boxSizing: "border-box",
        width: "100%"
      }}
    >
      {loading && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.65)",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTop: "4px solid var(--accent-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>{t("processing")}...</span>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}


      <div style={{ width: "100%", display: "flex", gap: "0.75rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Hướng máy quét vào mã QR"
            style={{
              width: "100%",
              height: "54px",
              padding: "0 1rem 0 3.2rem",
              border: "2px solid var(--accent-primary)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              fontSize: "1.1rem",
              fontWeight: 600,
              outline: "none",
              boxShadow: "0 0 0 3px rgba(209, 67, 0, 0.15)",
              boxSizing: "border-box"
            }}
            disabled={loading}
            autoFocus
          />
          <Barcode 
            size={26} 
            style={{ 
              position: "absolute", 
              left: "1rem", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "var(--accent-primary)" 
            }} 
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !inputValue.trim()}
          style={{
            height: "54px",
            padding: "0 1.8rem",
            background: "var(--accent-primary)",
            color: "white",
            border: "none",
            fontWeight: 800,
            fontSize: "1.05rem",
            cursor: (loading || !inputValue.trim()) ? "not-allowed" : "pointer",
            opacity: (loading || !inputValue.trim()) ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxSizing: "border-box",
            whiteSpace: "nowrap"
          }}
        >
          <MagnifyingGlass size={20} weight="bold" />
          Kiểm tra
        </button>
      </div>
    </div>
  );
}
