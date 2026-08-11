"use client";

import React from "react";
import { RequestItem } from "../types";
import { QRCodeSVG } from 'qrcode.react';

export default function PrintTemplate({ request, id }: { request: RequestItem | null; id: string }) {
  if (!request) return <div id={id} style={{ display: "none" }} />;

  return (
    <div id={id} className="print-only">
      <style dangerouslySetInnerHTML={{__html: `
        @media screen {
          .print-only {
            display: none !important;
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #${id}, #${id} * {
            visibility: visible;
          }
          #${id} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            font-family: "Times New Roman", Times, serif;
          }
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14pt;
          }
          .print-table th, .print-table td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
            vertical-align: middle;
          }
          .text-left {
            text-align: left !important;
          }
          .font-bold {
            font-weight: bold;
          }
          .logo-text {
            color: #0070c0; /* Approximation of the blue logo */
            font-weight: bold;
            font-size: 16pt;
            margin-bottom: 8px;
          }
          .title-text {
            font-size: 22pt;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .subtitle-text {
            font-size: 18pt;
            font-weight: bold;
          }
          .sig-box {
            height: 100px;
          }
          .note-text {
            margin-top: 10px;
            font-size: 12pt;
          }
          .qr-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        }
      `}} />

      <table className="print-table">
        <tbody>
          {/* Header Rows */}
          <tr>
            <td rowSpan={3} style={{ width: "20%" }}>
              <div className="logo-text">ALL WELLS<br/>INTERNATIONAL</div>
              <div style={{ borderTop: "1px solid black", margin: "8px -8px", padding: "8px 0" }}>
                Bộ phận soạn thảo<br/>編訂部門<br/>Tổng vụ 總務部
              </div>
            </td>
            <td rowSpan={3} colSpan={2} style={{ width: "40%" }}>
              <div className="title-text">PHIẾU MANG HÀNG RA NGOÀI</div>
              <div className="subtitle-text">物品攜出單</div>
            </td>
            <td rowSpan={3} style={{ width: "20%" }}>
              {request.status === 2 && request.qrCode ? (
                <div className="qr-container">
                  <QRCodeSVG value={request.qrCode} size={90} />
                  <div style={{ fontSize: '10pt', marginTop: '4px' }}>{request.requestCode}</div>
                </div>
              ) : (
                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>CHƯA ĐƯỢC DUYỆT</div>
              )}
            </td>
            <td style={{ width: "20%" }}>Ngày thiết lập<br/>制訂日期<br/>18.11.2023</td>
          </tr>
          <tr>
            <td>Mã số tài liệu<br/>文件編號<br/>AWM-4-FAC04-02</td>
          </tr>
          <tr>
            <td>Phiên bản 版本: 3<br/>Trang 頁次: 1/1</td>
          </tr>

          {/* Date & NO */}
          <tr>
            <td colSpan={3} className="text-left font-bold">Ngày tạo 填表日期 : {request.requestDate}</td>
            <td colSpan={2} className="text-left font-bold">NO. : {request.requestCode}</td>
          </tr>
          <tr>
            <td colSpan={3} className="text-left font-bold" style={{ color: "#d97706" }}>Thời hạn 有效期 : {request.startDate || "—"} ➜ {request.endDate || "—"}</td>
            <td colSpan={2} className="text-left font-bold" style={{ color: "#d97706" }}>Người mang 携出人 : {request.carrierEmpno || ""} {request.carrierName}</td>
          </tr>

          {/* User Info Headers */}
          <tr className="font-bold">
            <td colSpan={2}>ĐƠN VỊ MANG RA CỔNG<br/>攜出單位</td>
            <td>HỌ TÊN 姓名</td>
            <td colSpan={2}>ĐỊA ĐIỂM MANG ĐẾN<br/>攜往地方</td>
          </tr>
          <tr>
            <td colSpan={2}>(Unit of user/applicant)</td>
            <td>(Name of user/applicant)</td>
            <td colSpan={2}>(Destination of goods)</td>
          </tr>
          
          {/* User Info Values */}
          <tr>
            <td colSpan={2}>{request.requesterDept || "N/A"}</td>
            <td>{request.requesterName}</td>
            <td colSpan={2}>{request.destination}</td>
          </tr>

          {/* Items Headers */}
          <tr className="font-bold">
            <td colSpan={2}>TÊN VẬT LIỆU 物品名稱</td>
            <td>SỐ LƯỢNG 數量</td>
            <td colSpan={2}>MỤC ĐÍCH 用途</td>
          </tr>

          {/* Items List */}
          {request.items && request.items.length > 0 ? (
            request.items.map((item, idx) => (
              <tr key={idx}>
                <td colSpan={2} className="text-left">{item.name}</td>
                <td>{item.quantity} {item.unit}</td>
                <td colSpan={2} className="text-left">{item.purpose}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>-</td>
              <td>-</td>
              <td colSpan={2}>-</td>
            </tr>
          )}

          {/* Pad with empty rows if few items to make the form look standard */}
          {(!request.items || request.items.length < 3) && Array.from({ length: Math.max(0, 3 - (request.items?.length || 0)) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td colSpan={2}>&nbsp;</td>
              <td>&nbsp;</td>
              <td colSpan={2}>&nbsp;</td>
            </tr>
          ))}

          {/* Signatures Header */}
          <tr className="font-bold">
            <td>BẢO VỆ<br/>保衛</td>
            <td colSpan={2}>CHỦ QUẢN CẤP SỞ<br/>處級主管</td>
            <td>CHỦ QUẢN ĐƠN VỊ<br/>部級主管</td>
            <td>NGƯỜI MANG HÀNG RA CỔNG<br/>攜出人員</td>
          </tr>
          {/* Signatures Space */}
          <tr>
            <td className="sig-box"></td>
            <td colSpan={2} className="sig-box"></td>
            <td className="sig-box"></td>
            <td className="sig-box"></td>
          </tr>
        </tbody>
      </table>

      <div className="note-text">
        Chú ý: Người mang hàng ra cổng ➔ Chủ quản đơn vị ➔ Chủ quản cấp sở ➔ Bảo vệ<br/>
        注意: 攜出人員 ➔ 部級主管 ➔ 處級主管 ➔ 保衛
      </div>
    </div>
  );
}
