import { useTranslation } from "@/context/LanguageContext";
import React, { useState } from 'react';
import { X, ArrowCounterClockwise, Check, MapPin, Package, Minus, Plus, CalendarBlank, Camera } from "@phosphor-icons/react";
import styles from "../requests.module.css";
import { GoodsOutItem } from "../types";
import { toast } from "sonner";
import ImageCarouselModal from "@/components/ui/ImageCarouselModal";

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
  handleItemFieldChange: (index: number, field: keyof GoodsOutItem, value: any) => void;
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
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [previewModal, setPreviewModal] = useState<{ images: string[]; initialIndex: number; title: string } | null>(null);

  React.useEffect(() => {
    if (show) {
      const today = new Date().toISOString().split("T")[0];
      if (!startDate) setStartDate(today);
      if (!endDate) setEndDate(today);
    }
  }, [show, startDate, endDate, setStartDate, setEndDate]);

  const handleImageUpload = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploadingIndex(index);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.urls)) {
        const currentImgs = itemsList[index]?.images || [];
        handleItemFieldChange(index, "images", [...currentImgs, ...data.urls]);
        toast.success(`Đã đính kèm ${data.urls.length} ảnh`);
      } else {
        toast.error(data.error || "Lỗi tải ảnh");
      }
    } catch (err: any) {
      toast.error("Không thể tải ảnh: " + err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.drawer} 
        onClick={e => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100vh" }}
      >
        {/* Header */}
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>
            {t("create_request")} {nextRequestCode && <span style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginLeft: '0.5rem' }}>[{nextRequestCode}]</span>}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form 
          className={styles.drawerContent} 
          onSubmit={handleSubmitRequest}
          style={{ flex: 1, overflowY: "auto", paddingBottom: "1.5rem" }}
        >
          {/* Approval Flow Tracking */}
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
                const primaryManagers = flow.managers || [];
                const managerNames = primaryManagers.map((m: any) => m.full_name || m.name).join(", ");
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

                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        lineHeight: "1.3"
                      }}>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" }}>
                          {stepTitle}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "700" }}>
                          {managerNames || "—"}
                        </div>
                        {deputyNames && (
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "1px" }}>
                            {deputyNames}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Validity & Carrier */}
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
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.7fr 1.3fr", gap: "0.5rem" }}>
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

          {/* Destination */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <MapPin size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} color="var(--accent-primary)" />
              {t("destination")} <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input 
              type="text" 
              className={styles.formInput} 
              required 
              value={destination} 
              onChange={e => setDestination(e.target.value)} 
              placeholder={t("placeholder_destination")}
              list="destinations-suggestions"
            />
            <datalist id="destinations-suggestions">
              {(destinationsList || []).map((d, i) => (
                <option key={i} value={d} />
              ))}
            </datalist>
          </div>

          {/* Items List */}
          <div className={styles.formGroup}>
            <div className={styles.formSectionTitle}>
              <Package size={16} weight="bold" color="var(--accent-primary)" />
              <span>{t("items_list") || "Danh sách vật liệu"}</span> <span style={{ color: "#ef4444" }}>*</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {itemsList.map((item, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "0.4rem", 
                    padding: "0.6rem", 
                    background: "rgba(255,255,255,0.02)", 
                    border: "1px solid var(--glass-border)", 
                    borderRadius: "6px" 
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 2fr auto", gap: "0.4rem", alignItems: "center" }}>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder={t("item_name")} 
                      required 
                      value={item.name} 
                      onChange={e => handleItemFieldChange(index, "name", e.target.value)} 
                    />
                    <input 
                      type="number" 
                      step="any"
                      min="0"
                      className={styles.formInput} 
                      placeholder={t("quantity")} 
                      required 
                      value={item.quantity} 
                      onChange={e => handleItemFieldChange(index, "quantity", e.target.value)} 
                    />
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder={t("unit")} 
                      required 
                      value={item.unit} 
                      onChange={e => handleItemFieldChange(index, "unit", e.target.value)} 
                      list="unit-suggestions-list"
                    />
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder={t("purpose")} 
                      value={item.purpose} 
                      onChange={e => handleItemFieldChange(index, "purpose", e.target.value)} 
                    />
                    <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
                      <button 
                        type="button" 
                        onClick={() => removeItemRow(index)}
                        style={{ 
                          background: "rgba(239, 68, 68, 0.12)", 
                          border: "1px solid rgba(239, 68, 68, 0.35)", 
                          color: "#ef4444", 
                          cursor: "pointer", 
                          width: "32px",
                          height: "32px", 
                          borderRadius: "4px", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center" 
                        }}
                        title={t("remove_row") || "Xóa dòng"}
                      >
                        <Minus size={15} weight="bold" />
                      </button>
                      <button 
                        type="button" 
                        onClick={addNewItemRow}
                        style={{ 
                          background: "rgba(209, 67, 0, 0.12)", 
                          border: "1px solid var(--accent-primary)", 
                          color: "var(--accent-primary)", 
                          cursor: "pointer", 
                          width: "32px",
                          height: "32px", 
                          borderRadius: "4px", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center" 
                        }}
                        title={t("add_row") || "Thêm dòng"}
                      >
                        <Plus size={15} weight="bold" />
                      </button>
                    </div>
                  </div>

                  {/* Attached Photos Row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.2rem" }}>
                    <label style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "4px 10px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                      background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                      border: "1px dashed var(--accent-primary)",
                      borderRadius: "4px",
                      cursor: uploadingIndex === index ? "wait" : "pointer",
                      userSelect: "none"
                    }}>
                      <Camera size={15} weight="bold" />
                      <span>{uploadingIndex === index ? "Đang tải ảnh..." : `Đính kèm ảnh (${(item.images || []).length})`}</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        disabled={uploadingIndex === index}
                        onChange={(e) => handleImageUpload(index, e.target.files)} 
                      />
                    </label>

                    {/* Thumbnail preview list */}
                    {(item.images || []).map((imgUrl, imgIdx) => (
                      <div key={imgIdx} style={{ position: "relative", width: "36px", height: "36px", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--glass-border)", flexShrink: 0 }}>
                        <img 
                          src={imgUrl} 
                          alt={`Item ${index + 1} angle ${imgIdx + 1}`} 
                          style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} 
                          onClick={() => setPreviewModal({
                            images: item.images || [],
                            initialIndex: imgIdx,
                            title: `${item.name || `Vật tư ${index + 1}`} (${(item.images || []).length} góc chụp)`
                          })}
                          title="Bấm để xem ảnh phóng to & lướt các góc chụp"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextImgs = (item.images || []).filter((_, i) => i !== imgIdx);
                            handleItemFieldChange(index, "images", nextImgs);
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            background: "rgba(239, 68, 68, 0.9)",
                            color: "white",
                            border: "none",
                            width: "14px",
                            height: "14px",
                            fontSize: "11px",
                            lineHeight: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0
                          }}
                          title="Xóa ảnh này"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <datalist id="unit-suggestions-list">
              {["Cái", "Bộ", "Chiếc", "Kg", "Thùng", "Hộp", "Cuộn", "Mét", "Tấm", "Pallet", "Lô", "Bao", "Bình", "Cặp", "Xe", "Khối", "Gram", "Lít"].map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>

          {/* Note / Ghi chú */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t("note") || "Ghi chú"}</label>
            <textarea 
              className={styles.formInput} 
              rows={2} 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              placeholder={t("placeholder_note") || "Nhập ghi chú hoặc giải trình thêm (nếu có)..."}
            />
          </div>
        </form>

        {/* Fixed Footer */}
        <div className={styles.drawerFooter} style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid var(--glass-border)",
          background: "var(--bg-secondary)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "0.75rem",
          flexShrink: 0
        }}>
          <button 
            type="button" 
            className={styles.btnOutline} 
            onClick={onClose} 
            disabled={actionLoading}
            style={{ minWidth: "90px", justifyContent: "center", padding: "0.6rem 1.25rem", borderRadius: "4px" }}
          >
            {t("cancel") || "Hủy"}
          </button>
          <button 
            type="button" 
            onClick={handleSubmitRequest}
            style={{
              background: "var(--accent-primary)",
              color: "#ffffff",
              border: "none",
              padding: "0.6rem 1.5rem",
              fontSize: "0.85rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "4px",
              cursor: (actionLoading || uploadingIndex !== null) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 2px 10px rgba(209, 67, 0, 0.35)",
              transition: "all 0.2s ease"
            }}
            disabled={actionLoading || uploadingIndex !== null}
          >
            <Check size={16} weight="bold" />
            <span>{actionLoading ? (t("loading") || "Đang xử lý...") : (t("btn_submit_request") || "Tạo yêu cầu")}</span>
          </button>
        </div>
      </div>

      {/* Embla Carousel Modal */}
      {previewModal && (
        <ImageCarouselModal
          images={previewModal.images}
          initialIndex={previewModal.initialIndex}
          title={previewModal.title}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </div>
  );
}
