"use client";

import React, { useState } from 'react';
import { useTranslation } from "@/context/LanguageContext";
import {
  X,
  FileXls,
  FileCsv,
  FilePdf,
  Calendar,
  CheckCircle,
  DownloadSimple,
  Funnel,
  Check
} from "@phosphor-icons/react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: {
    from: string;
    to: string;
    searchTerm: string;
    direction: string;
    selectedArea: string | null;
    columnFilters: any;
  };
  apiFetch: any;
}

export default function ReportExportModal({ isOpen, onClose, currentFilters, apiFetch }: ReportExportModalProps) {
  const { t } = useTranslation();
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [includeImages, setIncludeImages] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.from && currentFilters.to) {
        params.append('from', currentFilters.from);
        params.append('to', currentFilters.to);
      }
      if (currentFilters.searchTerm) params.append('q', currentFilters.searchTerm);
      if (currentFilters.direction !== 'all') params.append('direction', currentFilters.direction);
      if (currentFilters.selectedArea) params.append('sidebar_area', currentFilters.selectedArea);

      // Add column filters
      Object.entries(currentFilters.columnFilters).forEach(([key, values]: [string, any]) => {
        if (values && values.length > 0) {
          params.append(`f_${key === 'name' ? 'name' : key}`, values.join(','));
        }
      });

      const res = await apiFetch(`/api/dashboard/logs/export?${params.toString()}`);
      const result = await res.json();
      const logs = result.data || [];

      if (format === 'xlsx') {
        await exportToExcel(logs);
      } else {
        exportToCSV(logs);
      }

      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async (logs: any[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Access Logs');

    // Define columns
    worksheet.columns = [
      { header: 'Time', key: 'time', width: 20 },
      { header: 'Employee ID', key: 'empno', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Department', key: 'dept', width: 20 },
      { header: 'Area', key: 'area', width: 20 },
      { header: 'Device', key: 'device', width: 25 },
      { header: 'Direction', key: 'direction', width: 10 },
      { header: 'Similarity (%)', key: 'similarity', width: 15 },
      { header: 'Result', key: 'result', width: 15 },
      { header: 'Reason', key: 'reason', width: 25 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' } // Indigo color
    };

    // Add rows
    logs.forEach(log => {
      const row = worksheet.addRow({
        ...log,
        direction: log.direction.toUpperCase(),
        similarity: `${Number(log.similarity).toFixed(1)}%`,
        result: log.result.toUpperCase()
      });

      // Style result cell
      const resultCell = row.getCell('result');
      if (log.result === 'SUCCESS') {
        resultCell.font = { color: { argb: 'FF10B981' }, bold: true }; // Green
      } else {
        resultCell.font = { color: { argb: 'FFEF4444' }, bold: true }; // Red
      }
    });

    // Auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: { row: 1, column: 10 }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Access_Log_Report_${new Date().toLocaleDateString('en-CA')}.xlsx`);
  };

  const exportToCSV = (logs: any[]) => {
    const headers = ["Time", "Employee ID", "Name", "Department", "Area", "Device", "Direction", "Similarity (%)", "Result", "Reason"];
    const rows = logs.map((log: any) => [
      log.time,
      log.empno,
      log.name,
      log.dept,
      log.area,
      log.device,
      log.direction,
      log.similarity,
      log.result,
      log.reason || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Access_Log_Report_${new Date().toLocaleDateString('en-CA')}.csv`);
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="header-title-group">
            <div className="header-icon"><DownloadSimple size={24} weight="bold" /></div>
            <div>
              <h3>{t("report")}</h3>
              <p>{t("export_config_desc") || "Configure your report parameters before exporting"}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} weight="bold" /></button>
        </div>

        <div className="report-modal-body">
          {/* Format Selection */}
          <div className="config-section">
            <label className="section-label">{t("export_format") || "Export Format"}</label>
            <div className="format-grid">
              <div
                className={`format-card ${format === 'xlsx' ? 'active' : ''}`}
                onClick={() => setFormat('xlsx')}
              >
                <div className="format-icon xlsx"><FileXls size={28} weight="fill" /></div>
                <div className="format-info">
                  <span className="format-name">Microsoft Excel</span>
                  <span className="format-ext">.xlsx</span>
                </div>
                {format === 'xlsx' && <div className="check-mark"><Check size={12} weight="bold" /></div>}
              </div>
              <div
                className={`format-card ${format === 'csv' ? 'active' : ''}`}
                onClick={() => setFormat('csv')}
              >
                <div className="format-icon csv"><FileCsv size={28} weight="fill" /></div>
                <div className="format-info">
                  <span className="format-name">CSV Table</span>
                  <span className="format-ext">.csv</span>
                </div>
                {format === 'csv' && <div className="check-mark"><Check size={12} weight="bold" /></div>}
              </div>
            </div>
          </div>

          <div className="summary-compact">
            <Calendar size={14} />
            <span>{currentFilters.from} → {currentFilters.to}</span>
            <span className="summary-divider">|</span>
            <Funnel size={14} />
            <span>{currentFilters.selectedArea || t("all_areas")}</span>
          </div>
        </div>

        <div className="report-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isExporting}>{t("cancel")}</button>
          <button className="btn-export" onClick={handleExport} disabled={isExporting}>
            {isExporting ? t("loading") : (
              <>
                <DownloadSimple size={20} weight="bold" />
                {t("export_now") || "Export Report"}
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .report-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.15s ease-out;
        }

        .report-modal-content {
          background: var(--bg-secondary, #ffffff);
          width: 440px;
          border-radius: 18px;
          box-shadow: var(--shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
          overflow: hidden;
          border: 1px solid var(--glass-border, rgba(0,0,0,0.1));
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--text-primary);
        }

        .report-modal-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border, #f1f5f9);
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .header-icon {
          width: 36px;
          height: 36px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-primary, #4f46e5);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-title-group h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .header-title-group p {
          display: none; /* Hide description to be compact */
        }

        .close-btn {
          background: none;
          border: none;
          padding: 0.4rem;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.2s;
          display: flex;
        }

        .close-btn:hover {
          background: rgba(125, 125, 125, 0.1);
          color: var(--text-primary);
        }

        .report-modal-body {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.8;
        }

        .format-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
        }

        .format-card {
          border: 1.5px solid var(--glass-border, #f1f5f9);
          border-radius: 14px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          background: var(--bg-primary);
        }

        .format-card:hover {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .format-card.active {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.08);
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.1);
        }

        .format-icon.xlsx { color: #22c55e; }
        .format-icon.csv { color: var(--text-secondary); }

        .format-info {
          text-align: center;
        }

        .format-name {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .format-ext {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .check-mark {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 20px;
          height: 20px;
          background: var(--accent-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .summary-compact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          background: var(--bg-primary);
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          justify-content: center;
          margin-top: -0.25rem;
        }

        .summary-divider {
          opacity: 0.3;
          margin: 0 0.25rem;
        }

        .report-modal-footer {
          padding: 1rem 1.5rem;
          background: var(--bg-primary);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid var(--glass-border);
        }

        .btn-cancel {
          padding: 0.5rem 1.25rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: transparent;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: rgba(125, 125, 125, 0.1);
          border-color: var(--text-secondary);
        }

        .btn-export {
          padding: 0.5rem 1.5rem;
          border-radius: 10px;
          border: none;
          background: var(--accent-gradient, #4f46e5);
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: var(--shadow-accent);
          transition: all 0.2s;
        }

        .btn-export:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-accent-hover);
          opacity: 0.9;
        }

        .btn-export:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
