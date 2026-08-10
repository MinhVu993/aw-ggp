import { useTranslation } from "@/context/LanguageContext";
import React from 'react';
import { X, ArrowCounterClockwise, Check, MapPin, Package, Minus, Plus, CalendarBlank } from "@phosphor-icons/react";
import styles from "../requests.module.css";
import { GoodsOutItem } from "../types";

interface CreateRequestDrawerProps {
  show: boolean;
  onClose: () => void;
  nextRequestCode: string;
  flowLoading: boolean;
  flowData: any[];
  language: string;
  t: (key: string) => string;
  user: any;
  destination: string;
  setDestination: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  carrierEmpno: string;
  setCarrierEmpno: (val: string) => void;
  carrierName: string;
  setCarrierName: (val: string) => void;
  note: string;
  setNote: (val: string) => void;
  itemsList: GoodsOutItem[];
  handleItemFieldChange: (index: number, field: keyof GoodsOutItem, value: string) => void;
  removeItemRow: (index: number) => void;
  addNewItemRow: () => void;
  handleSubmitRequest: (e: React.FormEvent) => void;
  actionLoading: boolean;
}

export default function CreateRequestDrawer({
  show,
  onClose,
  nextRequestCode,
  flowLoading,
  flowData,
  language,
  t,
  user,
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  carrierEmpno,
  setCarrierEmpno,
  carrierName,
  setCarrierName,
  note,
  setNote,
  itemsList,
  handleItemFieldChange,
  removeItemRow,
  addNewItemRow,
  handleSubmitRequest,
  actionLoading
}: CreateRequestDrawerProps) {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>
            {t("create_request")} {nextRequestCode && <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '1rem', color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>[{nextRequestCode}]</span>}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </div>

        <form className={styles.drawerContent} onSubmit={handleSubmitRequest}>
          {/* 2.5 Approval Flow Tracking */}
          {flowLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.75rem", padding: "0.5rem 0" }}>
              <ArrowCounterClockwise size={14} className={styles.spin} />
              <span>{t("flow_loading")}</span>
            </div>
          ) : flowData.length > 0 && (
            <div className={styles.horizontalScroll} style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              flexWrap: "nowrap",
              overflowX: "auto",
              overflowY: "visible",
              width: "100%",
              padding: "1rem 0.5rem 2rem 0.5rem",
              gap: "8px",
              borderBottom: "1px dashed var(--glass-border)",
              marginBottom: "0.5rem"
            }}>
              {flowData.map((flow, index) => {
                const stepTitle = flow.lvl_name?.[language] || flow.lvl_name?.vi || flow.lvl_name?.en || flow.lvl_code;
                
                // Primary Managers
                const primaryManagers = flow.managers || [];
                const managerNames = primaryManagers.map((m: any) => m.full_name || m.name).join(", ");
                
                // Deputy Managers
                const deputyList = primaryManagers.flatMap((m: any) => m.deputies || []);
                const deputyNames = deputyList.map((d: any) => d.full_name || d.name).join(", ");

                return (
                  <React.Fragment key={index}>
                    {/* Divider Line between steps */}
                    {index > 0 && (
                      <div style={{
                        flex: "1 0 30px",
                        height: "1px",
                        backgroundColor: "var(--glass-border)",
                        margin: "0 12px",
                        marginTop: "14px",
                        alignSelf: "flex-start"
                      }} />
                    )}

                    <div style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      flexShrink: 0
                    }}>
                      {/* Step Badge (Red circle with check mark) */}
                      <div style={{
                        width: "26px",
                        height: "26px",
                        marginTop: "2px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)",
                        boxShadow: "0 3px 6px rgba(211, 47, 47, 0.3)",
                        border: "2px solid #fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0
                      }}>
                        <Check size={14} weight="bold" />
                      </div>

                      {/* Step Label Info */}
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        lineHeight: "1.3",
                        whiteSpace: "nowrap"
                      }}>
                        {/* Step Title (e.g. Department Manager) */}
                        <div style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          fontWeight: "400",
                          marginBottom: "1px"
                        }}>{stepTitle}</div>
                        {/* Manager Names */}
                        <div style={{
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          fontWeight: "600"
                        }}>{managerNames || "—"}</div>
                        {/* Deputy Names */}
                        {deputyNames && (
                          <div style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: "400",
                            marginTop: "1px"
                          }}>{deputyNames}</div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* 1. Destination */}
          <div className={styles.formGroup} style={{ marginTop: "0.5rem" }}>
            <label className={styles.formLabel}>
              <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
              {t("destination")} <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              className={styles.formInput}
              required
              placeholder={t("placeholder_destination")}
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
          </div>

          {/* Validity & Carrier (Compact Layout) */}
          <div style={{
            marginTop: "1rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--glass-border)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <CalendarBlank size={14} />
              {t("date_range")} & {t("carrier_info")}
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.6fr 1.4fr", gap: "0.75rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.7rem", marginBottom: "4px" }}>
                  {t("start_date")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="date" className={styles.formInput} style={{ padding: "0.5rem", fontSize: "0.85rem" }} required value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.7rem", marginBottom: "4px" }}>
                  {t("end_date")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="date" className={styles.formInput} style={{ padding: "0.5rem", fontSize: "0.85rem" }} required value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.7rem", marginBottom: "4px" }}>
                  {t("carrier_empno")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" className={styles.formInput} style={{ padding: "0.5rem", fontSize: "0.85rem" }} required value={carrierEmpno} onChange={e => setCarrierEmpno(e.target.value)} placeholder="..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.7rem", marginBottom: "4px" }}>
                  {t("carrier_name")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" className={styles.formInput} style={{ padding: "0.5rem", fontSize: "0.85rem" }} required value={carrierName} onChange={e => setCarrierName(e.target.value)} placeholder="..." />
              </div>
            </div>
          </div>


          {/* Note / Ghi chú */}
          <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
            <label className={styles.formLabel}>
              {t("note")}
            </label>
            <textarea
              className={styles.formInput}
              placeholder={t("placeholder_note")}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* 2. Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            <div className={styles.formSectionTitle} style={{ marginBottom: "0" }}>
              <Package size={18} weight="bold" color="var(--accent-primary)" />
              {t("items_list")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {itemsList.map((item, index) => (
                <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    className={styles.formInput}
                    style={{ flex: "3", minWidth: "250px" }}
                    placeholder={t("item_name")}
                    required
                    value={item.name}
                    onChange={e => handleItemFieldChange(index, "name", e.target.value)}
                  />
                  <input
                    className={styles.formInput}
                    style={{ flex: "1", minWidth: "60px" }}
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder={t("quantity")}
                    required
                    value={item.quantity}
                    onChange={e => handleItemFieldChange(index, "quantity", e.target.value)}
                  />
                  <input
                    list="unit-suggestions-list"
                    className={styles.formInput}
                    style={{ flex: "1", minWidth: "100px" }}
                    placeholder={t("unit")}
                    required
                    value={item.unit}
                    onChange={e => handleItemFieldChange(index, "unit", e.target.value)}
                  />
                  <datalist id="unit-suggestions-list">
                    {["Cái", "Bộ", "Chiếc", "Kg", "Thùng", "Hộp", "Cuộn", "Mét", "Tấm", "Pallet", "Lô", "Bao", "Bình", "Cặp", "Xe", "Khối", "Gram", "Lít"].map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                  <input
                    className={styles.formInput}
                    style={{ flex: "2", minWidth: "180px" }}
                    placeholder={t("purpose")}
                    required
                    value={item.purpose}
                    onChange={e => handleItemFieldChange(index, "purpose", e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                    <button 
                      type="button" 
                      className={`${styles.itemActionBtn} ${styles.btnRemove}`}
                      onClick={() => removeItemRow(index)}
                      title={t("remove_row")}
                    >
                      <Minus size={16} weight="bold" />
                    </button>
                    <button 
                      type="button" 
                      className={`${styles.itemActionBtn} ${styles.btnAdd}`}
                      onClick={addNewItemRow}
                      title={t("add_row")}
                    >
                      <Plus size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className={styles.drawerFooter}>
          <button type="button" className={styles.btnOutline} onClick={onClose}>
            {t("cancel")}
          </button>
          <button 
            type="button" 
            className={styles.btnPrimary} 
            onClick={handleSubmitRequest} 
            disabled={actionLoading}
          >
            {actionLoading ? t("loading") : t("btn_submit_request")}
          </button>
        </div>
      </div>
    </div>
  );
}
