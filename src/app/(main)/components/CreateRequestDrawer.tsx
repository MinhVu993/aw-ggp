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
  user?: any;
  destinationsList?: string[];
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
  destinationsList,
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
            {t("create_request")} {nextRequestCode && <span style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>[{nextRequestCode}]</span>}
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
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "0.75rem 0.25rem 1.25rem 0.25rem",
              borderBottom: "1px dashed var(--glass-border)",
              marginBottom: "0.75rem",
              boxSizing: "border-box"
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
                    {index > 0 && (
                      <div style={{
                        flex: "1 1 20px",
                        height: "1px",
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        margin: "0 12px",
                        alignSelf: "center",
                        minWidth: "15px"
                      }} />
                    )}

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexShrink: 0
                    }}>
                      {/* Step Badge */}
                      <div style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                        boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.25), 0 2px 6px rgba(239, 68, 68, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0
                      }}>
                        <Check size={14} weight="bold" />
                      </div>

                      {/* Step Info */}
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        lineHeight: "1.3"
                      }}>
                        <div style={{
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          fontWeight: "500"
                        }}>
                          {stepTitle}
                        </div>
                        <div style={{
                          fontSize: "13px",
                          color: "var(--text-primary)",
                          fontWeight: "700"
                        }}>
                          {managerNames || "—"}
                        </div>
                        {deputyNames && (
                          <div style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            marginTop: "1px"
                          }}>
                            {deputyNames}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}          {/* Validity & Carrier (Compact Card Layout) */}
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--glass-border)",
            padding: "0.75rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            boxSizing: "border-box"
          }}>
            <div style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}>
              <CalendarBlank size={14} color="var(--accent-primary)" />
              {t("date_range")} & {t("carrier_info")}
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.6fr 1.4fr", gap: "0.5rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.68rem" }}>
                  {t("start_date")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input 
                  type="date" 
                  className={styles.formInput} 
                  required 
                  min={new Date().toISOString().split("T")[0]}
                  value={startDate} 
                  onChange={e => {
                    const val = e.target.value;
                    setStartDate(val);
                    if (endDate && val > endDate) {
                      setEndDate(val);
                    }
                  }} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.68rem" }}>
                  {t("end_date")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input 
                  type="date" 
                  className={styles.formInput} 
                  required 
                  min={startDate || new Date().toISOString().split("T")[0]}
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.68rem" }}>
                  {t("carrier_empno")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" className={styles.formInput} required value={carrierEmpno} onChange={e => setCarrierEmpno(e.target.value)} placeholder="..." />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ fontSize: "0.68rem" }}>
                  {t("carrier_name")} <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input type="text" className={styles.formInput} required value={carrierName} onChange={e => setCarrierName(e.target.value)} placeholder="..." />
              </div>
            </div>
          </div>

          {/* 1. Destination */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <MapPin size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} color="var(--accent-primary)" />
              {t("destination")} <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              list="destination-suggestions-list"
              type="text"
              className={styles.formInput}
              required
              placeholder={t("placeholder_destination")}
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
            <datalist id="destination-suggestions-list">
              {(destinationsList && destinationsList.length > 0 ? destinationsList : [
                "Nhà máy 2 (NM2)",
                "Kho Ngoại quan Cát Lái",
                "Công ty TNHH Bao Bì Việt Nam",
                "Văn phòng đại diện TP.HCM"
              ]).map((dest, idx) => (
                <option key={idx} value={dest} />
              ))}
            </datalist>
          </div>

          {/* Note / Ghi chú */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t("note")}
            </label>
            <textarea
              className={styles.formInput}
              placeholder={t("placeholder_note")}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              style={{ resize: "vertical", minHeight: "45px" }}
            />
          </div>

          {/* 2. Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div className={styles.formSectionTitle}>
              <Package size={16} weight="bold" color="var(--accent-primary)" />
              {t("items_list")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
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
                    step="any"
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
