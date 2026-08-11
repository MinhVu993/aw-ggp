import React from 'react';
import { ArrowUDownLeft, X } from "@phosphor-icons/react";
import styles from "../requests.module.css";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnReasonInput: string;
  setReturnReasonInput: (val: string) => void;
  submitReturn: () => void;
  actionLoading: boolean;
  t: (key: string) => string;
}

export default function ReturnModal({
  isOpen,
  onClose,
  returnReasonInput,
  setReturnReasonInput,
  submitReturn,
  actionLoading,
  t
}: ReturnModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: "450px" }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f59e0b" }}>
            <ArrowUDownLeft size={24} weight="bold" />
            {t("btn_return")}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {t("please_enter_return_reason")}
          </p>
          <textarea 
            className={styles.formInput} 
            style={{ width: "100%", minHeight: "100px", resize: "vertical" }}
            value={returnReasonInput}
            onChange={(e) => setReturnReasonInput(e.target.value)}
            placeholder={`${t("return_reason")}...`}
            autoFocus
          />
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnOutline} onClick={onClose} disabled={actionLoading}>
            {t("cancel")}
          </button>
          <button 
            style={{ 
              background: "#f59e0b", 
              color: "white", 
              border: "none", 
              padding: "0.5rem 1.25rem", 
              borderRadius: "4px", 
              fontWeight: 600, 
              cursor: (!returnReasonInput.trim() || actionLoading) ? "not-allowed" : "pointer",
              opacity: (!returnReasonInput.trim() || actionLoading) ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }} 
            onClick={submitReturn} 
            disabled={actionLoading || !returnReasonInput.trim()}
          >
            {actionLoading ? <div className={styles.spin} style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }}></div> : t("btn_return")}
          </button>
        </div>
      </div>
    </div>
  );
}
