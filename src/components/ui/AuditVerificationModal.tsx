import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Prohibit, WarningCircle, UserCircle, ArrowsClockwise } from '@phosphor-icons/react';
import { useTranslation } from '@/context/LanguageContext';

interface AuditVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  logId: number | null;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onAuditComplete: () => void;
}

export default function AuditVerificationModal({ isOpen, onClose, logId, apiFetch, onAuditComplete }: AuditVerificationModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [face8Error, setFace8Error] = useState(false);

  useEffect(() => {
    if (isOpen && logId) {
      fetchComparisonData(logId);
    } else {
      setData(null);
      setFace8Error(false);
    }
  }, [isOpen, logId]);

  const fetchComparisonData = async (id: number) => {
    setLoading(true);
    setFace8Error(false);
    try {
      const res = await apiFetch(`/api/dashboard/logs/${id}/compare`);
      const json = await res.json();
      if (json.status === 'success') {
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch compare data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (status: number) => {
    if (!logId || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        log_id: logId,
        audit_status: status, // 1: Correct, 2: Wrong
        audit_user_id: data?.current_log?.predicted_user?.id || null,
        audit_note: status === 1 ? "Verified Correct by Admin" : "Marked as Intruder/Incorrect"
      };

      const res = await apiFetch('/api/dashboard/logs/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onAuditComplete();
        onClose();
      }
    } catch (error) {
      console.error("Failed to audit", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      
      <div style={{
        background: 'var(--glass-bg, #ffffff)',
        border: '1px solid var(--glass-border, #e5e7eb)',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '850px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--text-primary, #1f2937)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid var(--glass-border, #e5e7eb)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.02)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCircle size={28} weight="fill" color="var(--accent-primary, #4f46e5)" />
              {t("audit_verification") || "Đối Soát Nhân Sự Thủ Công"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary, #6b7280)', padding: '0.5rem',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Banner trạng thái đối soát (Double-verification lock warning) */}
        {data && data.current_log && data.current_log.audit_status !== 0 && (
          <div style={{
            padding: '1rem 2rem',
            backgroundColor: data.current_log.audit_status === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid var(--glass-border, #e5e7eb)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            color: data.current_log.audit_status === 1 ? '#10b981' : '#ef4444',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            {data.current_log.audit_status === 1 ? <CheckCircle size={22} weight="fill" /> : <Prohibit size={22} weight="fill" />}
            <span>
              {t("audit_banner_prefix")}
              {data.current_log.audit_status === 1 ? t("audit_status_correct") : t("audit_status_wrong")}
              {data.current_log.audit_at ? t("audit_at_time", { time: data.current_log.audit_at }) : ''}
            </span>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '2rem', display: 'flex', gap: '2rem', minHeight: '350px' }}>
          {loading ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <ArrowsClockwise size={32} className="animate-spin" />
              <p style={{ marginTop: '1rem' }}>{t("audit_loading")}</p>
            </div>
          ) : data ? (
            <>
              {/* Left Side: Current Failed Log */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <WarningCircle size={20} weight="fill" /> {t("audit_image_failed")}
                </div>
                <div style={{
                  flex: 1, borderRadius: '16px', overflow: 'hidden', background: '#f3f4f6',
                  border: '2px solid #ef4444', position: 'relative'
                }}>
                  {data.current_log?.snapshot_url ? (
                    <img src={data.current_log.snapshot_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Current" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No Image</div>
                  )}
                </div>

                <div style={{ marginTop: '1rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <strong style={{ minWidth: '80px', flexShrink: 0 }}>{t("col_employee")}:</strong>
                    <span style={{ color: data.current_log?.predicted_user ? '#ef4444' : 'var(--text-secondary)', fontWeight: data.current_log?.predicted_user ? 700 : 400 }}>
                      {data.current_log?.predicted_user
                        ? `${data.current_log.predicted_user.empno} - ${data.current_log.predicted_user.name}`
                        : `-- ${t("reason_unknown")} --`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <strong style={{ minWidth: '80px', flexShrink: 0 }}>{t("col_device")}:</strong>
                    <span>{data.current_log?.device_name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <strong style={{ minWidth: '80px', flexShrink: 0 }}>{t("history_time")}:</strong>
                    <span>{data.current_log?.timestamp || '--'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <strong style={{ minWidth: '80px', flexShrink: 0 }}>{t("status")}:</strong>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{t(data.current_log?.deny_reason) || data.current_log?.deny_reason}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <strong style={{ minWidth: '80px', flexShrink: 0 }}>{t("audit_similarity")}:</strong>
                    <span style={{ color: Number(data.current_log?.similarity) < 80 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                      {data.current_log?.similarity}%
                    </span>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem' }}>
                <div style={{ 
                  background: 'var(--glass-border, #e5e7eb)', color: 'var(--text-secondary)',
                  width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem'
                }}>VS</div>
              </div>

              {/* Right Side: Face8 Registered Image (or Nearest Success fallback) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} weight="fill" /> Hình Ảnh Trên Hệ Thống Face8
                </div>
                <div style={{
                  flex: 1, borderRadius: '16px', overflow: 'hidden', background: '#f3f4f6',
                  border: '2px solid #10b981', position: 'relative'
                }}>
                  {data.current_log?.predicted_user?.empno ? (
                    face8Error ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', padding: '2rem', textAlign: 'center' }}>
                        <WarningCircle size={48} weight="light" style={{ marginBottom: '1rem' }} />
                        <p style={{ fontWeight: 600 }}>{t("audit_face8_not_found")}</p>
                      </div>
                    ) : (
                      <img 
                        src={`http://10.13.34.166:4000/api/image?emp_id=${data.current_log.predicted_user.empno}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt="Face8" 
                        onError={() => setFace8Error(true)}
                      />
                    )
                  ) : data.nearest_success_log?.snapshot_url ? (
                    <img src={data.nearest_success_log.snapshot_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Success" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', padding: '2rem', textAlign: 'center' }}>
                      <UserCircle size={48} weight="light" style={{ marginBottom: '1rem' }} />
                      <p>{t("audit_no_history")}</p>
                      {data.current_log?.deny_reason === 'unknown_face' && (
                         <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#ef4444' }}>{t("audit_not_registered")}</span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <strong style={{ minWidth: '80px', flexShrink: 0 }}>{t("col_employee")}:</strong>
                    <span style={{ color: data.current_log?.predicted_user ? '#10b981' : 'var(--text-secondary)', fontWeight: data.current_log?.predicted_user ? 700 : 400 }}>
                      {data.current_log?.predicted_user
                        ? `${data.current_log.predicted_user.empno} - ${data.current_log.predicted_user.name}`
                        : `-- ${t("reason_unknown")} --`}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', color: '#ef4444' }}>Failed to load data</div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid var(--glass-border, #e5e7eb)',
          background: 'rgba(0,0,0,0.02)',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center'
        }}>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {data && data.current_log && data.current_log.audit_status !== 0 ? (
              <button 
                disabled={true}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 2.5rem', borderRadius: '12px',
                  background: 'var(--glass-border, #e5e7eb)', border: 'none', color: 'var(--text-secondary, #9ca3af)',
                  fontWeight: 600, cursor: 'not-allowed'
                }}
              >
                {data.current_log.audit_status === 1 ? <CheckCircle size={20} weight="fill" /> : <Prohibit size={20} weight="fill" />}
                {t("audit_done") || "Đã Đối Soát"}
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleAudit(2)}
                  disabled={submitting || loading || !data}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.5rem', borderRadius: '12px',
                    background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                    fontWeight: 600, cursor: (submitting || loading) ? 'not-allowed' : 'pointer',
                    opacity: (submitting || loading) ? 0.5 : 1, transition: 'all 0.2s'
                  }}
                >
                  <Prohibit size={20} weight="bold" /> {t("audit_btn_wrong")}
                </button>
                <button 
                  onClick={() => handleAudit(1)}
                  disabled={submitting || loading || !data}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 2rem', borderRadius: '12px',
                    background: '#10b981', border: 'none', color: '#fff',
                    fontWeight: 600, cursor: (submitting || loading) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                    opacity: (submitting || loading) ? 0.5 : 1, transition: 'all 0.2s'
                  }}
                >
                  <CheckCircle size={20} weight="bold" /> {t("audit_btn_correct")}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
