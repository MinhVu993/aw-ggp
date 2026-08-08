import React from 'react';
import { WarningCircle, CheckCircle } from "@phosphor-icons/react";
import styles from "../requests.module.css";

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  isDanger: boolean;
  onConfirm: () => void;
}

interface ConfirmModalProps {
  modal: ConfirmModalState;
  setModal: React.Dispatch<React.SetStateAction<ConfirmModalState>>;
  t: (key: string) => string;
}

export default function ConfirmModal({ modal, setModal, t }: ConfirmModalProps) {
  if (!modal.isOpen) return null;

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 9999 }} onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
      <div className={styles.modalContent} style={{ maxWidth: "420px", padding: "1.5rem" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          {modal.isDanger ? <WarningCircle size={28} color="#ef4444" weight="fill" /> : <CheckCircle size={28} color="#10b981" weight="fill" />}
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{modal.title}</h3>
        </div>
        <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {modal.message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button className={styles.btnOutline} onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
            {t("cancel") || "Hủy"}
          </button>
          <button className={styles.btnPrimary} style={modal.isDanger ? { background: "#ef4444" } : {}} onClick={() => {
            setModal(prev => ({ ...prev, isOpen: false }));
            modal.onConfirm();
          }}>
            {modal.confirmText || "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}
