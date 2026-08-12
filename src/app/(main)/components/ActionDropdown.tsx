"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  DotsThreeVertical, 
  Check, 
  X, 
  ClipboardText, 
  Copy, 
  Printer,
  ArrowUDownLeft
} from "@phosphor-icons/react";
import { RequestItem } from "../types";
import styles from "../requests.module.css";

interface ActionDropdownProps {
  item: RequestItem;
  canApprove: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onReturn?: (id: number) => void;
  onDetail: (item: RequestItem) => void;
  onRenew: (item: RequestItem) => void;
  onPrint: (item: RequestItem) => void;
  t: (key: string) => string;
}

export default function ActionDropdown({
  item,
  canApprove,
  onApprove,
  onReject,
  onReturn,
  onDetail,
  onRenew,
  onPrint,
  t
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    action();
  };

  const isRenewable = item.endDate && new Date(item.endDate) < new Date();
  const showApproveReject = canApprove && item.status === 1;

  return (
    <div 
      ref={dropdownRef} 
      data-open={isOpen ? "true" : undefined}
      style={{ 
        position: "relative", 
        display: "inline-block",
        zIndex: isOpen ? 1000 : 1
      }}
    >
      <button
        onClick={toggleDropdown}
        className={styles.btnOutline}
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          border: "1px solid var(--glass-border)",
          background: isOpen ? "rgba(255,255,255,0.1)" : "var(--bg-primary)",
          color: "var(--text-primary)"
        }}
        title={t("col_action")}
      >
        <DotsThreeVertical size={20} weight="bold" />
      </button>

      {isOpen && (
        <div 
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--glass-border)",
            borderRadius: "6px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.1)",
            zIndex: 99999,
            minWidth: "160px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {showApproveReject && (
            <>
              <button
                onClick={(e) => handleAction(e, () => onApprove(item.id))}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem",
                  background: "transparent", border: "none", color: "#10b981", fontSize: "0.85rem", cursor: "pointer",
                  textAlign: "left", width: "100%", fontWeight: 600
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Check size={16} weight="bold" />
                <span>{t("btn_approve")}</span>
              </button>
              <button
                onClick={(e) => handleAction(e, () => onReturn && onReturn(item.id))}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem",
                  background: "transparent", border: "none", color: "#f59e0b", fontSize: "0.85rem", cursor: "pointer",
                  textAlign: "left", width: "100%", fontWeight: 600
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(245, 158, 11, 0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <ArrowUDownLeft size={16} weight="bold" />
                <span>{t("btn_return")}</span>
              </button>
              <button
                onClick={(e) => handleAction(e, () => onReject(item.id))}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem",
                  background: "transparent", border: "none", color: "#ef4444", fontSize: "0.85rem", cursor: "pointer",
                  textAlign: "left", width: "100%", fontWeight: 600
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <X size={16} weight="bold" />
                <span>{t("btn_reject")}</span>
              </button>
              <div style={{ height: "1px", background: "var(--glass-border)", margin: "2px 0" }} />
            </>
          )}

          <button
            onClick={(e) => handleAction(e, () => onDetail(item))}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem",
              background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "0.85rem", cursor: "pointer",
              textAlign: "left", width: "100%", fontWeight: 500
            }}
            onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--accent-primary) 10%, transparent)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ClipboardText size={16} />
            <span>{t("details")}</span>
          </button>

          <div style={{ height: "1px", background: "var(--glass-border)", margin: "2px 0" }} />

          <button
            onClick={(e) => handleAction(e, () => onPrint(item))}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem",
              background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "0.85rem", cursor: "pointer",
              textAlign: "left", width: "100%", fontWeight: 500
            }}
            onMouseEnter={e => e.currentTarget.style.background = "color-mix(in srgb, var(--accent-primary) 10%, transparent)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Printer size={16} />
            <span>{t("print")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
