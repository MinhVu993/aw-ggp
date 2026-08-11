"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from "@/context/LanguageContext";
import { 
  X, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  ArrowsLeftRight,
  CalendarBlank,
  User,
  MagnifyingGlass,
  Clock
} from "@phosphor-icons/react";

// ── Types ──────────────────────────────────────────────────────────────
interface AreaUser {
  id: number;
  empno: string;
  name: string;
  department: string;
  allow_in: boolean;
  allow_out: boolean;
  time_start: string;
  time_end: string;
  valid_from: string;
  valid_to: string | null;
  status: number;
}

// ── Main Modal ─────────────────────────────────────────────────────────
interface AreaUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaId: number;
  areaName: string;
  apiFetch: any;
}

export default function AreaUsersModal({ isOpen, onClose, areaId, areaName, apiFetch }: AreaUsersModalProps) {
  const { t, language } = useTranslation();
  const [users, setUsers] = useState<AreaUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && areaId) {
      setUsers([]);
      setSearchTerm("");
      setVisibleCount(100);
      fetchUsers();
    }
  }, [isOpen, areaId]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/areas/${areaId}/users`);
      const result = await res.json();
      if (result.success) setUsers(result.data);
    } catch (e) {
      console.error("Failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getPermTypeStr = (i: boolean, o: boolean) => {
    if (i && o) return t("perm_in_out");
    if (i) return t("perm_in_only");
    if (o) return t("perm_out_only");
    return "N/A";
  };

  // Global Filter: Searches across all columns
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(u => {
      const permStr = getPermTypeStr(u.allow_in, u.allow_out).toLowerCase();
      const validityStr = (u.valid_to ? formatDate(u.valid_to) : t("permanent")).toLowerCase();
      
      return (
        u.name.toLowerCase().includes(term) || 
        u.empno.toLowerCase().includes(term) ||
        (u.department || "").toLowerCase().includes(term) ||
        permStr.includes(term) ||
        (u.time_start || "").includes(term) ||
        (u.time_end || "").includes(term) ||
        validityStr.includes(term)
      );
    });
  }, [users, searchTerm, language]);

  const displayedUsers = filteredUsers.slice(0, visibleCount);

  const handleScroll = () => {
    if (bodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 200 && visibleCount < filteredUsers.length) {
        setVisibleCount(p => p + 50);
      }
    }
  };

  function formatDate(d: string) {
    if (!d) return "---";
    return new Date(d).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US');
  }

  const getPermBadge = (allowIn: boolean, allowOut: boolean) => {
    if (allowIn && allowOut) return { label: t("perm_in_out"), icon: <ArrowsLeftRight size={13} />, color: "#818cf8" };
    if (allowIn) return { label: t("perm_in_only"), icon: <ArrowRight size={13} />, color: "#10b981" };
    if (allowOut) return { label: t("perm_out_only"), icon: <ArrowLeft size={13} />, color: "#f59e0b" };
    return { label: "N/A", icon: null, color: "var(--text-secondary)" };
  };

  if (!isOpen) return null;

  return (
    <div className="m-overlay" onClick={onClose}>
      <div className="m-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="m-header">
          <div className="m-title">
            <div className="m-icon"><Users size={22} weight="bold" /></div>
            <div>
              <h3>{areaName}</h3>
              <p>{t("area_access_list")}</p>
            </div>
          </div>
          <button className="m-close" onClick={onClose}><X size={19} weight="bold" /></button>
        </div>

        {/* Search Bar */}
        <div className="m-search-bar">
          <div className="m-search-wrap">
            <MagnifyingGlass size={16} className="m-s-icon" />
            <input
              type="text"
              placeholder={t("search_user_hint")}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="m-meta">
            {searchTerm !== "" && (
              <button className="m-clear-btn" onClick={() => setSearchTerm("")}>
                <X size={12} weight="bold" /> {t("clear")}
              </button>
            )}
            <span className="m-count">{filteredUsers.length} / {users.length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="m-body" ref={bodyRef} onScroll={handleScroll}>
          {isLoading ? (
            <div className="m-state">{t("loading")}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="m-state">
              <User size={44} weight="thin" opacity={0.3} />
              <p>{t("no_users_found") || "Không tìm thấy dữ liệu"}</p>
            </div>
          ) : (
            <table className="m-table">
              <thead>
                <tr>
                  <th><div className="th-cell">{t("emp_id")}</div></th>
                  <th><div className="th-cell">{t("col_employee")}</div></th>
                  <th><div className="th-cell">{t("col_dept")}</div></th>
                  <th><div className="th-cell">{t("col_permission")}</div></th>
                  <th><div className="th-cell">{t("time_start")}</div></th>
                  <th><div className="th-cell">{t("time_end")}</div></th>
                  <th><div className="th-cell">{t("col_validity")}</div></th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map(user => {
                  const perm = getPermBadge(user.allow_in, user.allow_out);
                  return (
                    <tr key={user.id}>
                      <td><span className="m-empno">{user.empno}</span></td>
                      <td><span className="m-name">{user.name}</span></td>
                      <td><span className="m-dept">{user.department || "-"}</span></td>
                      <td>
                        <span className="m-perm" style={{ color: perm.color, borderColor: `${perm.color}35`, background: `${perm.color}10` }}>
                          {perm.icon} {perm.label}
                        </span>
                      </td>
                      <td><span className="m-time"><Clock size={11} />{user.time_start?.substring(0, 5) || "07:30"}</span></td>
                      <td><span className="m-time"><Clock size={11} />{user.time_end?.substring(0, 5) || "18:30"}</span></td>
                      <td><span className="m-validity"><CalendarBlank size={11} />{user.valid_to ? formatDate(user.valid_to) : t("permanent")}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .m-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.15s ease;
        }
        .m-box {
          background: var(--bg-secondary);
          width: 1000px; max-width: 98vw; height: 88vh;
          border-radius: 14px;
          box-shadow: 0 30px 80px -20px rgba(0,0,0,0.6);
          border: 1px solid var(--glass-border);
          display: flex; flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.28s cubic-bezier(0.16,1,0.3,1);
        }

        /* Header */
        .m-header {
          padding: 1rem 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid var(--glass-border);
          background: var(--bg-primary);
          flex-shrink: 0;
        }
        .m-title { display: flex; align-items: center; gap: 0.75rem; }
        .m-icon {
          width: 36px; height: 36px;
          background: rgba(99,102,241,0.12);
          color: var(--accent-primary);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(99,102,241,0.2);
        }
        .m-title h3 { margin: 0; font-size: 1rem; font-weight: 800; color: var(--text-primary); }
        .m-title p  { margin: 0; font-size: 0.72rem; color: var(--text-secondary); }
        .m-close {
          background: none; border: none; padding: 0.4rem;
          border-radius: 6px; cursor: pointer; color: var(--text-secondary); transition: all 0.15s;
        }
        .m-close:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

        /* Search Bar */
        .m-search-bar {
          padding: 0.75rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          border-bottom: 1px solid var(--glass-border);
          background: var(--bg-primary);
          flex-shrink: 0;
        }
        .m-search-wrap {
          position: relative; flex: 1; max-width: 460px;
        }
        .m-s-icon {
          position: absolute; left: 0.8rem; top: 50%;
          transform: translateY(-50%); color: var(--text-secondary); pointer-events: none;
        }
        .m-search-wrap input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1.5px solid var(--glass-border);
          border-radius: 9px;
          padding: 0.55rem 1rem 0.55rem 2.5rem;
          font-size: 0.85rem; color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .m-search-wrap input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .m-meta { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .m-clear-btn {
          display: flex; align-items: center; gap: 0.3rem;
          padding: 0.3rem 0.7rem;
          background: rgba(239,68,68,0.1); color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2); border-radius: 6px;
          font-size: 0.72rem; font-weight: 700; cursor: pointer;
        }
        .m-count {
          background: rgba(255,255,255,0.05);
          padding: 0.25rem 0.8rem; border-radius: 20px;
          font-size: 0.72rem; font-weight: 700; color: var(--text-secondary);
          border: 1px solid var(--glass-border);
        }

        /* Body / Table */
        .m-body { flex: 1; overflow-y: auto; position: relative; }
        .m-body::-webkit-scrollbar { width: 8px; }
        .m-body::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 8px; }

        .m-table { 
          width: 100%; 
          border-collapse: separate; 
          border-spacing: 0;
          table-layout: fixed;
        }

        .m-table th {
          background: var(--bg-primary);
          position: sticky; top: 0; z-index: 50;
          border-bottom: 2px solid var(--glass-border);
        }

        /* Column Widths */
        .m-table th:nth-child(1) { width: 110px; }  /* Empno */
        .m-table th:nth-child(2) { width: 250px; }  /* Name */
        .m-table th:nth-child(3) { width: 120px; }  /* Dept */
        .m-table th:nth-child(4) { width: 140px; }  /* Permissions */
        .m-table th:nth-child(5) { width: 115px; }  /* Start Time */
        .m-table th:nth-child(6) { width: 115px; }  /* End Time */
        .m-table th:nth-child(7) { width: auto; min-width: 220px; } /* Validity */

        .th-cell {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.75rem 0.85rem;
          font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-secondary);
          user-select: none;
          white-space: nowrap;
        }
        
        /* Centralize specific headers */
        .m-table th:nth-child(1) .th-cell,
        .m-table th:nth-child(4) .th-cell,
        .m-table th:nth-child(5) .th-cell,
        .m-table th:nth-child(6) .th-cell,
        .m-table th:nth-child(7) .th-cell {
          justify-content: center;
        }

        .m-table td {
          padding: 0.6rem 0.4rem;
          border-bottom: 1px solid var(--glass-border);
          font-size: 0.83rem;
          vertical-align: middle;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Centralize non-text-heavy cells */
        .m-table td:nth-child(1),
        .m-table td:nth-child(4),
        .m-table td:nth-child(5),
        .m-table td:nth-child(6),
        .m-table td:nth-child(7) {
          text-align: center;
        }

        .m-table tr:hover td { background: rgba(255,255,255,0.02); }

        .m-empno {
          font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;
        }
        .m-name { font-weight: 700; color: var(--text-primary); font-size: 0.9rem; }
        .m-dept { font-size: 0.82rem; color: var(--text-secondary); font-weight: 500; }
        
        .m-perm {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; border-radius: 20px; border: 1.5px solid;
          font-size: 0.68rem; font-weight: 800; white-space: nowrap;
          min-width: 100px;
        }
        
        .m-time {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
          font-size: 0.85rem; font-weight: 700;
          color: var(--text-primary);
          background: rgba(255,255,255,0.03);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }
        
        .m-validity {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
          font-size: 0.78rem; color: var(--text-secondary);
          background: rgba(255,255,255,0.03);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
        }

        /* Empty / Loading */
        .m-state {
          height: 280px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.75rem; color: var(--text-secondary);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
