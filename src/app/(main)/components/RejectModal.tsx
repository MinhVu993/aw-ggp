import React from 'react';
import { WarningCircle, X } from "@phosphor-icons/react";
import styles from "../requests.module.css";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  rejectReasonInput: string;
  setRejectReasonInput: (val: string) => void;
  submitReject: () => void;
  actionLoading: boolean;
  t: (key: string) => string;
}

export default function RejectModal({
  isOpen,
  onClose,
  rejectReasonInput,
  setRejectReasonInput,
  submitReject,
  actionLoading,
  t
}: RejectModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: "450px" }}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444" }}>
            <WarningCircle size={24} weight="fill" />
            {t("btn_reject")}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {t("please_enter_reject_reason")}:
          </p>
          <textarea 
            className={styles.formInput} 
            style={{ width: "100%", minHeight: "100px", resize: "vertical" }}
            value={rejectReasonInput}
            onChange={(e) => setRejectReasonInput(e.target.value)}
            placeholder={`${t("reject_reason")}...`}
            autoFocus
          />
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnOutline} onClick={onClose} disabled={actionLoading}>
            {t("cancel")}
          </button>
          <button className={styles.btnDanger} onClick={submitReject} disabled={actionLoading || !rejectReasonInput.trim()}>
            {actionLoading ? <div className={styles.spin} style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }}></div> : t("btn_reject")}
          </button>
        </div>
      </div>
    </div>
  );
}
